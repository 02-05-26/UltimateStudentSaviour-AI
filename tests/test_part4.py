"""Part 4 mentor contracts, grounding, bounded context, and safety checks."""
import os, sys, unittest
from unittest.mock import patch
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from backend.mentor import mentor_project
from backend.validator import validate_mentor_request, validate_mentor_response
from test_part3 import PROFILE, PROJECT, BLUEPRINT

MENTOR = {"answer":"Campus Smart Attendance AI: start with the data model.","nextSteps":["Sketch entities"],"relevantRoadmapTasks":["Planning"],"warnings":["Keep the MVP small"]}
ATTENDANCE_PROJECT = {**PROJECT, "id": "p_campus_attendance", "title": "Campus Smart Attendance AI", "shortDescription": "Attendance with classroom verification.", "problemStatement": "Manual attendance wastes teaching time.", "techStack": ["Python", "FastAPI", "PostgreSQL"], "keyFeatures": ["Attendance capture", "Faculty dashboard"]}
SECOND_PROJECT = {**PROJECT, "id": "p_water_monitor", "title": "IoT Water Quality Monitor", "shortDescription": "Sensor-based water quality tracking.", "problemStatement": "Water quality is not tracked continuously.", "domain": "IoT", "techStack": ["C++", "MQTT", "InfluxDB"], "keyFeatures": ["Sensor ingestion", "Alert dashboard"]}
ROADMAP = [{"name":"Planning","objective":"Plan attendance flows","outcome":"Approved plan","tasks":[{"text":"Define attendance entities","done":False},{"text":"Review with faculty","done":True}]}]

class MentorTests(unittest.TestCase):
    def test_request_and_response_validation(self):
        request={"profile":PROFILE,"projectId":ATTENDANCE_PROJECT["id"],"project":ATTENDANCE_PROJECT,"question":"How do I start?","history":[],"blueprint":BLUEPRINT,"roadmap":ROADMAP}
        self.assertTrue(validate_mentor_request(request)[0])
        self.assertFalse(validate_mentor_request({**request,"question":""})[0])
        self.assertFalse(validate_mentor_request({**request,"projectId":"p_missing"})[0])
        self.assertTrue(validate_mentor_response(MENTOR)[0])
        self.assertFalse(validate_mentor_response({"answer":"ok"})[0])
    @patch('backend.mentor.get_api_key', return_value='test-key')
    @patch('backend.mentor.call_gemini_json', return_value=MENTOR)
    def test_context_is_bounded_and_grounded_in_selected_project(self, mocked, _):
        history=[{"role":"user","content":f"message {i}"} for i in range(8)]
        result=mentor_project(PROFILE, ATTENDANCE_PROJECT['id'], ATTENDANCE_PROJECT, 'What next?', history, BLUEPRINT, ROADMAP)
        self.assertEqual(result['answer'], MENTOR['answer'])
        serialized=mocked.call_args.args[2]
        self.assertNotIn('message 0', serialized); self.assertIn('message 7', serialized)
        self.assertIn('Campus Smart Attendance AI', serialized)
        self.assertNotIn('Intelligent Codebase Documentation Generator', serialized)
        self.assertIn('PostgreSQL', serialized)
        self.assertIn('Define attendance entities', serialized)
        self.assertIn('"completedTasks": 1', serialized)
        self.assertIn('"blueprintAvailability": "available"', serialized)
    @patch('backend.mentor.get_api_key', return_value='test-key')
    @patch('backend.mentor.call_gemini_json', side_effect=[MENTOR, {**MENTOR, "answer":"IoT Water Quality Monitor: start by validating sensor messages."}])
    def test_two_projects_produce_isolated_mentor_contexts(self, mocked, _):
        mentor_project(PROFILE, ATTENDANCE_PROJECT['id'], ATTENDANCE_PROJECT, 'How do I start?', [], None, ROADMAP)
        mentor_project(PROFILE, SECOND_PROJECT['id'], SECOND_PROJECT, 'How do I start?', [], None, ROADMAP)
        attendance_context = mocked.call_args_list[0].args[2]
        water_context = mocked.call_args_list[1].args[2]
        self.assertIn('Campus Smart Attendance AI', attendance_context)
        self.assertNotIn('IoT Water Quality Monitor', attendance_context)
        self.assertIn('IoT Water Quality Monitor', water_context)
        self.assertNotIn('Campus Smart Attendance AI', water_context)
        self.assertIn('MQTT', water_context)
        self.assertIn('"blueprintAvailability": "unavailable"', water_context)
    @patch('backend.mentor.get_api_key', return_value='')
    def test_missing_key_is_controlled(self, _):
        with self.assertRaisesRegex(RuntimeError, 'not configured'):
            mentor_project(PROFILE, ATTENDANCE_PROJECT['id'], ATTENDANCE_PROJECT, 'Help', [], BLUEPRINT, ROADMAP)
