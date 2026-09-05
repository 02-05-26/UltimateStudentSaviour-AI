"""
UltimateStudentSaviour AI - Production Web & API Server
Serves static assets and provides secure server-side AI project generation API.
"""

import os
import sys
import json
from http.server import HTTPServer, SimpleHTTPRequestHandler
import urllib.parse
import time

# Ensure backend package is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from backend.env_loader import load_environment
from backend.validator import validate_profile_input
from backend.ai_service import generate_project_ideas, get_api_key
from backend.evaluation import evaluate_project, generate_blueprint, improve_project, generate_presentation, generate_viva
from backend.mentor import mentor_project
from backend.validator import validate_project_action_request, validate_mentor_request, validate_project_id, validate_project_upsert_payload
from backend.repository import repository

# Load local environment variables (.env.local / .env)
load_environment()

PORT = int(os.environ.get("PORT", 8000))
MAX_BODY_BYTES = 100000
AI_RATE_LIMIT = 15
RATE_WINDOW_SECONDS = 60
_rate_log = {}

class UltimateStudentSaviourRequestHandler(SimpleHTTPRequestHandler):
    """Custom request handler for serving frontend SPA and handling AI API endpoints."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=current_dir, **kwargs)

    def end_headers(self):
        # Same-origin application: do not expose paid AI endpoints cross-origin.
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def _allow_ai_request(self):
        now = time.monotonic()
        address = self.client_address[0]
        requests = [point for point in _rate_log.get(address, []) if now - point < RATE_WINDOW_SECONDS]
        if len(requests) >= AI_RATE_LIMIT:
            self.send_error_json(429, "Too many AI requests. Please wait a minute and try again.")
            return False
        requests.append(now)
        _rate_log[address] = requests
        return True

    def _read_json(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
        except ValueError:
            self.send_error_json(400, "Invalid Content-Length.")
            return None
        if length <= 0 or length > MAX_BODY_BYTES:
            self.send_error_json(400, "Invalid payload size.")
            return None
        try:
            return json.loads(self.rfile.read(length).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            self.send_error_json(400, "Malformed JSON request.")
            return None

    def send_json(self, status_code, data):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def guess_type(self, path):
        # Ensure ES modules load with correct content-type
        if path.endswith(".js"):
            return "text/javascript"
        if path.endswith(".css"):
            return "text/css"
        if path.endswith(".json"):
            return "application/json"
        return super().guess_type(path)

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        
        if path == "/api/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            has_key = bool(get_api_key())
            resp = {
                "status": "healthy",
                "appName": "UltimateStudentSaviour AI",
                "aiMode": "Google Gemini API (Active)" if has_key else "Intelligent Academic Mentor Engine (Offline/Zero-Key Mode)",
                "hasGoogleApiKey": has_key
            }
            self.wfile.write(json.dumps(resp).encode("utf-8"))
            return

        if path == "/api/projects":
            projects = repository.list_all()
            self.send_json(200, {"success": True, "projects": projects, "total": len(projects)})
            return

        if path.startswith("/api/projects/"):
            proj_id = path[len("/api/projects/"):]
            valid, clean_id = validate_project_id(proj_id)
            if not valid:
                self.send_error_json(400, clean_id)
                return
            project = repository.get_by_id(clean_id)
            if not project:
                self.send_error_json(404, "Project not found.")
                return
            self.send_json(200, {"success": True, "project": project})
            return

        # Serve static files normally
        super().do_GET()

    def do_POST(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        
        if path == "/api/projects":
            payload = self._read_json()
            if payload is None: return
            valid, msg = validate_project_upsert_payload(payload)
            if not valid:
                self.send_error_json(400, msg)
                return
            created = repository.create(payload)
            self.send_json(201, {"success": True, "project": created})
            return

        if path == "/api/generate-projects":
            try:
                if not self._allow_ai_request(): return
                payload = self._read_json()
                if payload is None: return

                # Validate Profile Input Server-Side
                is_valid, validation_msg = validate_profile_input(payload)
                if not is_valid:
                    self.send_error_json(400, validation_msg)
                    return

                # Call AI Service Abstraction
                projects = generate_project_ideas(payload)

                if not projects:
                    self.send_error_json(422, "We couldn't generate project ideas for this combination. Please adjust your interests or complexity.")
                    return

                # Success response
                response_data = {
                    "success": True,
                    "projects": projects,
                    "total": len(projects),
                    "aiProvider": "Google Gemini AI" if get_api_key() else "Academic Mentor Engine"
                }

                self.send_json(200, response_data)

            except Exception as e:
                # Log safe diagnostic without exposing secrets
                print(f"[Server Error] {type(e).__name__}: {str(e)[:150]}")
                self.send_error_json(500, "Project generation is temporarily unavailable. Please try again.")
            return

        operations = {
            "/api/evaluate-project": (evaluate_project, False),
            "/api/build-blueprint": (generate_blueprint, False),
            "/api/improve-project": (improve_project, True),
            "/api/generate-presentation": (generate_presentation, False),
            "/api/generate-viva": (generate_viva, False),
        }
        if path in operations:
            if not self._allow_ai_request(): return
            payload = self._read_json()
            if payload is None: return
            operation, requires_concern = operations[path]
            valid, message = validate_project_action_request(payload, requires_concern)
            if not valid:
                self.send_error_json(400, message)
                return
            try:
                args = [payload["profile"], payload["project"]]
                if requires_concern: args.append(payload["concern"].strip())
                self.send_json(200, {"success": True, "data": operation(*args)})
            except (RuntimeError, ValueError) as error:
                # AI failures and invalid model output are deliberate, retriable responses.
                self.send_error_json(503 if isinstance(error, RuntimeError) else 422, str(error)[:300])
            except Exception as error:
                print(f"[Part 3 Error] {type(error).__name__}")
                self.send_error_json(500, "This AI operation is temporarily unavailable. Please try again.")
            return

        if path == "/api/mentor":
            if not self._allow_ai_request(): return
            payload = self._read_json()
            if payload is None: return
            valid, message = validate_mentor_request(payload)
            if not valid:
                self.send_error_json(400, message)
                return
            try:
                data = mentor_project(payload["profile"], payload["projectId"], payload["project"], payload["question"], payload.get("history", []), payload.get("blueprint"), payload.get("roadmap", []))
                self.send_json(200, {"success": True, "data": data})
            except (RuntimeError, ValueError) as error:
                self.send_error_json(503 if isinstance(error, RuntimeError) else 422, str(error)[:300])
            except Exception as error:
                print(f"[Mentor Error] {type(error).__name__}")
                self.send_error_json(500, "The mentor is temporarily unavailable. Please try again.")
            return

        self.send_error_json(404, "Endpoint not found.")

    def do_PUT(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        if path.startswith("/api/projects/"):
            proj_id = path[len("/api/projects/"):]
            valid, clean_id = validate_project_id(proj_id)
            if not valid:
                self.send_error_json(400, clean_id)
                return
            payload = self._read_json()
            if payload is None: return
            valid, msg = validate_project_upsert_payload(payload)
            if not valid:
                self.send_error_json(400, msg)
                return
            updated = repository.update(clean_id, payload)
            if not updated:
                self.send_error_json(404, "Project not found.")
                return
            self.send_json(200, {"success": True, "project": updated})
            return
        self.send_error_json(404, "Endpoint not found.")

    def do_DELETE(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        if path.startswith("/api/projects/"):
            proj_id = path[len("/api/projects/"):]
            valid, clean_id = validate_project_id(proj_id)
            if not valid:
                self.send_error_json(400, clean_id)
                return
            deleted = repository.delete(clean_id)
            if not deleted:
                self.send_error_json(404, "Project not found.")
                return
            self.send_json(200, {"success": True, "deleted": clean_id})
            return
        self.send_error_json(404, "Endpoint not found.")

    def send_error_json(self, status_code: int, message: str):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        err_resp = {
            "success": False,
            "error": message
        }
        self.wfile.write(json.dumps(err_resp).encode("utf-8"))


def run_server():
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, UltimateStudentSaviourRequestHandler)
    print(f"==================================================")
    print(f"UltimateStudentSaviour AI Server started on port {PORT}")
    print(f"Local URL: http://localhost:{PORT}")
    print(f"Google AI Key Detected: {'Yes' if get_api_key() else 'No (using intelligent offline mentor mode)'}")
    print(f"==================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()

if __name__ == "__main__":
    run_server()
