"""HTTP contract coverage for Part 3 endpoints; AI functions are mocked."""
import json, os, sys, threading, unittest
from http.server import HTTPServer
from unittest.mock import patch
from urllib.request import Request, urlopen

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import server
from test_part3 import PROFILE, PROJECT, EVALUATION, BLUEPRINT, IMPROVEMENT
from test_part4 import MENTOR, ATTENDANCE_PROJECT, ROADMAP

class Part3EndpointTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.httpd = HTTPServer(('127.0.0.1', 0), server.UltimateStudentSaviourRequestHandler)
        cls.thread = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.thread.start()
        cls.base = f'http://127.0.0.1:{cls.httpd.server_port}'
    @classmethod
    def tearDownClass(cls): cls.httpd.shutdown(); cls.httpd.server_close()
    def post(self, path, body):
        request = Request(self.base + path, data=json.dumps(body).encode(), headers={'Content-Type':'application/json'}, method='POST')
        with urlopen(request) as response: return response.status, json.loads(response.read())
    def test_evaluate_endpoint(self):
        with patch('server.evaluate_project', return_value=EVALUATION):
            status, body = self.post('/api/evaluate-project', {'profile':PROFILE,'project':PROJECT})
        self.assertEqual(status, 200); self.assertEqual(body['data']['overallScore'], 82)
    def test_blueprint_and_improve_endpoints(self):
        with patch('server.generate_blueprint', return_value=BLUEPRINT):
            status, body = self.post('/api/build-blueprint', {'profile':PROFILE,'project':PROJECT})
        self.assertEqual(status, 200); self.assertEqual(body['data']['mvpFeatures'], ['Reports'])
        with patch('server.improve_project', return_value=IMPROVEMENT):
            status, body = self.post('/api/improve-project', {'profile':PROFILE,'project':PROJECT,'concern':'Too large'})
        self.assertEqual(status, 200); self.assertEqual(body['data']['whatToChange'], 'Reduce integrations')
    def test_rejects_invalid_action_request(self):
        request = Request(self.base + '/api/evaluate-project', data=b'{}', headers={'Content-Type':'application/json'}, method='POST')
        with self.assertRaises(Exception) as result: urlopen(request)
        self.assertIn('400', str(result.exception))
    def test_mentor_endpoint(self):
        with patch('server.mentor_project', return_value=MENTOR):
            status, body = self.post('/api/mentor', {'profile':PROFILE,'projectId':ATTENDANCE_PROJECT['id'],'project':ATTENDANCE_PROJECT,'question':'How do I start?','history':[],'roadmap':ROADMAP})
        self.assertEqual(status, 200); self.assertEqual(body['data']['answer'], MENTOR['answer'])
    def test_mentor_rejects_missing_or_mismatched_project_id(self):
        body = {'profile':PROFILE,'project':ATTENDANCE_PROJECT,'question':'How do I start?','history':[]}
        for invalid in (body, {**body, 'projectId':'p_other'}):
            request = Request(self.base + '/api/mentor', data=json.dumps(invalid).encode(), headers={'Content-Type':'application/json'}, method='POST')
            with self.assertRaises(Exception) as result: urlopen(request)
            self.assertIn('400', str(result.exception))

if __name__ == '__main__': unittest.main()
