"""Unit and endpoint tests for Part 5: AI Presentation & Viva Generation."""
import json
import os
import sys
import threading
import unittest
from http.server import HTTPServer
from unittest.mock import patch
from urllib.request import Request, urlopen
from urllib.error import HTTPError

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import server
from backend.validator import (
    validate_presentation_response,
    validate_viva_response,
    validate_project_action_request
)
from backend.evaluation import generate_presentation, generate_viva

MOCK_PROFILE = {
    "interests": ["Artificial Intelligence", "Web Development"],
    "skills": ["React", "Python", "FastAPI"],
    "experience": "Intermediate",
    "complexity": "Moderate",
    "projectType": "Individual"
}

MOCK_PROJECT = {
    "id": "p_smart_attendance_123",
    "title": "Smart AI Attendance System",
    "shortDescription": "Automated face-recognition attendance system for classrooms.",
    "problemStatement": "Manual roll call consumes class time and is prone to proxy attendance.",
    "whyItFits": "Matches computer vision and web development interests.",
    "targetUsers": "University faculty and students",
    "domain": "Artificial Intelligence",
    "difficulty": "Moderate",
    "feasibilityScore": 90,
    "innovationScore": 85,
    "finalYearSuitabilityScore": 92,
    "estimatedScope": "4 months",
    "techStack": ["Python", "FastAPI", "React", "OpenCV"],
    "keyFeatures": ["Live video feed ingestion", "Face recognition", "Attendance export"],
    "uniqueValue": "Offline edge processing with cloud synchronization",
    "possibleChallenges": ["Varying lighting conditions", "Latency during peak hours"]
}

MOCK_PRESENTATION = {
    "title": "Smart AI Attendance System",
    "subtitle": "Final Year Academic Project Defense",
    "slides": [
        {
            "slideNumber": 1,
            "title": "Title & Overview",
            "keyPoints": ["Project Title", "Student Name", "Advisor"],
            "speakerNotes": "Good morning respected examiners..."
        },
        {
            "slideNumber": 2,
            "title": "Problem Statement",
            "keyPoints": ["Proxy attendance", "Time wastage in manual roll call"],
            "speakerNotes": "In modern universities, manual attendance takes 10-15 minutes..."
        }
    ]
}

MOCK_VIVA = {
    "questions": [
        {
            "question": "How does your face recognition pipeline handle poor lighting?",
            "answer": "We apply histogram equalization and contrast stretching prior to embedding extraction.",
            "difficulty": "Medium",
            "category": "Computer Vision & Preprocessing"
        },
        {
            "question": "What database schema did you choose for storing attendance logs?",
            "answer": "A relational PostgreSQL schema with indexing on student_id and timestamp.",
            "difficulty": "Easy",
            "category": "Database Architecture"
        }
    ]
}

class Part5ValidationTests(unittest.TestCase):
    def test_validate_presentation_response_valid(self):
        valid, out = validate_presentation_response(MOCK_PRESENTATION)
        self.assertTrue(valid)
        self.assertEqual(len(out["slides"]), 2)
        self.assertEqual(out["title"], "Smart AI Attendance System")

    def test_validate_presentation_response_invalid(self):
        valid, msg = validate_presentation_response({"title": "Test", "slides": []})
        self.assertFalse(valid)
        valid, msg = validate_presentation_response("not a dict")
        self.assertFalse(valid)

    def test_validate_viva_response_valid(self):
        valid, out = validate_viva_response(MOCK_VIVA)
        self.assertTrue(valid)
        self.assertEqual(len(out["questions"]), 2)
        self.assertEqual(out["questions"][0]["difficulty"], "Medium")

    def test_validate_viva_response_invalid(self):
        valid, msg = validate_viva_response({"questions": []})
        self.assertFalse(valid)
        valid, msg = validate_viva_response({})
        self.assertFalse(valid)


class Part5EndpointTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.httpd = HTTPServer(('127.0.0.1', 0), server.UltimateStudentSaviourRequestHandler)
        cls.thread = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.thread.start()
        cls.base = f'http://127.0.0.1:{cls.httpd.server_port}'

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()

    def post(self, path, body):
        request = Request(
            self.base + path,
            data=json.dumps(body).encode(),
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        with urlopen(request) as response:
            return response.status, json.loads(response.read())

    def test_generate_presentation_endpoint(self):
        with patch('server.generate_presentation', return_value=MOCK_PRESENTATION):
            status, body = self.post('/api/generate-presentation', {'profile': MOCK_PROFILE, 'project': MOCK_PROJECT})
        self.assertEqual(status, 200)
        self.assertTrue(body['success'])
        self.assertEqual(body['data']['title'], "Smart AI Attendance System")
        self.assertEqual(len(body['data']['slides']), 2)

    def test_generate_viva_endpoint(self):
        with patch('server.generate_viva', return_value=MOCK_VIVA):
            status, body = self.post('/api/generate-viva', {'profile': MOCK_PROFILE, 'project': MOCK_PROJECT})
        self.assertEqual(status, 200)
        self.assertTrue(body['success'])
        self.assertEqual(len(body['data']['questions']), 2)
        self.assertEqual(body['data']['questions'][0]['difficulty'], "Medium")

    def test_rejects_missing_project_context(self):
        for endpoint in ['/api/generate-presentation', '/api/generate-viva']:
            request = Request(
                self.base + endpoint,
                data=json.dumps({'profile': MOCK_PROFILE}).encode(),
                headers={'Content-Type': 'application/json'},
                method='POST'
            )
            with self.assertRaises(HTTPError) as ctx:
                urlopen(request)
            self.assertEqual(ctx.exception.code, 400)


if __name__ == '__main__':
    unittest.main()
