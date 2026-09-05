"""Unit and endpoint tests for Part 6: Project Repository & Dashboard REST API."""
import json
import os
import sys
import threading
import unittest
from http.server import HTTPServer
from urllib.request import Request, urlopen
from urllib.error import HTTPError

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import server
from backend.repository import ProjectRepository, repository
from backend.validator import validate_project_id, validate_project_upsert_payload

MOCK_PROJECT = {
    "id": "p_test_repo_123",
    "title": "Autonomous Drone Navigation",
    "shortDescription": "Edge-based SLAM and obstacle avoidance for indoor search and rescue.",
    "problemStatement": "GPS-denied environments require local sensor fusion.",
    "whyItFits": "Aligns with robotics and embedded systems.",
    "targetUsers": "Emergency responders and researchers",
    "domain": "Robotics & AI",
    "difficulty": "Challenging",
    "feasibilityScore": 88,
    "innovationScore": 95,
    "finalYearSuitabilityScore": 97,
    "estimatedScope": "5 months",
    "techStack": ["ROS2", "Python", "C++", "OpenCV"],
    "keyFeatures": ["Visual SLAM", "Real-time obstacle avoidance"],
    "uniqueValue": "Real-time trajectory planning with minimal compute",
    "possibleChallenges": ["Sensor calibration drift"],
    "saved": True
}

class Part6RepositoryTests(unittest.TestCase):
    def setUp(self):
        self.repo = ProjectRepository()

    def test_list_and_get(self):
        projects = self.repo.list_all()
        self.assertGreaterEqual(len(projects), 1)
        first_id = projects[0]["id"]
        found = self.repo.get_by_id(first_id)
        self.assertIsNotNone(found)
        self.assertEqual(found["id"], first_id)

    def test_create_update_delete(self):
        created = self.repo.create(MOCK_PROJECT)
        self.assertEqual(created["id"], "p_test_repo_123")
        self.assertEqual(created["title"], "Autonomous Drone Navigation")

        updated = self.repo.update("p_test_repo_123", {"title": "Updated Drone Navigation"})
        self.assertEqual(updated["title"], "Updated Drone Navigation")

        deleted = self.repo.delete("p_test_repo_123")
        self.assertTrue(deleted)
        self.assertIsNone(self.repo.get_by_id("p_test_repo_123"))

    def test_toggle_save(self):
        created = self.repo.create(MOCK_PROJECT)
        res = self.repo.toggle_save(created["id"], False)
        self.assertFalse(res["saved"])
        res2 = self.repo.toggle_save(created["id"], True)
        self.assertTrue(res2["saved"])

    def test_validation_helpers(self):
        valid, clean = validate_project_id("p_valid_123")
        self.assertTrue(valid)
        self.assertEqual(clean, "p_valid_123")

        valid, msg = validate_project_id("")
        self.assertFalse(valid)

        valid, msg = validate_project_upsert_payload({"title": "Valid"})
        self.assertTrue(valid)

        valid, msg = validate_project_upsert_payload("not a dict")
        self.assertFalse(valid)


class Part6EndpointTests(unittest.TestCase):
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

    def get(self, path):
        request = Request(self.base + path, method='GET')
        with urlopen(request) as response:
            return response.status, json.loads(response.read())

    def post(self, path, body):
        request = Request(
            self.base + path,
            data=json.dumps(body).encode(),
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        with urlopen(request) as response:
            return response.status, json.loads(response.read())

    def put(self, path, body):
        request = Request(
            self.base + path,
            data=json.dumps(body).encode(),
            headers={'Content-Type': 'application/json'},
            method='PUT'
        )
        with urlopen(request) as response:
            return response.status, json.loads(response.read())

    def delete(self, path):
        request = Request(self.base + path, method='DELETE')
        with urlopen(request) as response:
            return response.status, json.loads(response.read())

    def test_list_and_get_endpoints(self):
        status, body = self.get('/api/projects')
        self.assertEqual(status, 200)
        self.assertTrue(body['success'])
        self.assertIsInstance(body['projects'], list)

    def test_crud_endpoints_flow(self):
        # Create
        status, body = self.post('/api/projects', MOCK_PROJECT)
        self.assertEqual(status, 201)
        self.assertEqual(body['project']['id'], MOCK_PROJECT['id'])

        # Get
        status, body = self.get(f"/api/projects/{MOCK_PROJECT['id']}")
        self.assertEqual(status, 200)
        self.assertEqual(body['project']['title'], MOCK_PROJECT['title'])

        # Update
        status, body = self.put(f"/api/projects/{MOCK_PROJECT['id']}", {"title": "Updated Title"})
        self.assertEqual(status, 200)
        self.assertEqual(body['project']['title'], "Updated Title")

        # Delete
        status, body = self.delete(f"/api/projects/{MOCK_PROJECT['id']}")
        self.assertEqual(status, 200)
        self.assertTrue(body['success'])

    def test_invalid_id_handling(self):
        request = Request(self.base + '/api/projects/p_non_existent_9999', method='GET')
        with self.assertRaises(HTTPError) as ctx:
            urlopen(request)
        self.assertEqual(ctx.exception.code, 404)


if __name__ == '__main__':
    unittest.main()
