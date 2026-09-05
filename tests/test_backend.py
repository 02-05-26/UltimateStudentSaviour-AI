"""
Automated unit test suite for UltimateStudentSaviour AI backend & AI services.
Tests validation, scoring, AI schema enforcement, fallback logic, and error resilience.
Mock Google AI responses are tested without requiring a live API key.
"""

import unittest
import json
import os
import sys

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.validator import validate_profile_input, validate_project_schema
from backend.scoring import calculate_profile_match
from backend.env_loader import load_env_file, load_environment
from backend.ai_service import (
    generate_project_ideas,
    process_and_score_projects,
    generate_intelligent_fallback_projects,
    get_api_key
)

class TestEnvLoader(unittest.TestCase):

    def test_get_api_key_priority(self):
        os.environ["GEMINI_API_KEY"] = "test_gemini_key_123"
        self.assertEqual(get_api_key(), "test_gemini_key_123")
        del os.environ["GEMINI_API_KEY"]

    def test_env_loader_parsing(self):
        import tempfile
        with tempfile.NamedTemporaryFile("w+", delete=False) as tf:
            tf.write("GEMINI_API_KEY=sample_secret_key_456\n")
            tf_path = tf.name
        
        try:
            if "GEMINI_API_KEY" in os.environ:
                del os.environ["GEMINI_API_KEY"]
            load_env_file(tf_path)
            self.assertEqual(os.environ.get("GEMINI_API_KEY"), "sample_secret_key_456")
        finally:
            if os.path.exists(tf_path):
                os.remove(tf_path)
            if "GEMINI_API_KEY" in os.environ:
                del os.environ["GEMINI_API_KEY"]

class TestStudentProfileValidation(unittest.TestCase):
    
    def test_valid_profile(self):
        valid_profile = {
            "interests": ["Artificial Intelligence", "Web Development"],
            "skills": ["React", "Python"],
            "experience": "Intermediate",
            "complexity": "Moderate",
            "projectType": "Either",
            "customPreferences": "Prefer educational tools."
        }
        is_valid, msg = validate_profile_input(valid_profile)
        self.assertTrue(is_valid)
        self.assertEqual(msg, "")

    def test_missing_interests(self):
        profile = {
            "interests": [],
            "experience": "Intermediate",
            "complexity": "Moderate",
            "projectType": "Either"
        }
        is_valid, msg = validate_profile_input(profile)
        self.assertFalse(is_valid)
        self.assertIn("Choose at least one interest", msg)

    def test_invalid_experience(self):
        profile = {
            "interests": ["Web Development"],
            "experience": "GodMode",
            "complexity": "Moderate",
            "projectType": "Either"
        }
        is_valid, msg = validate_profile_input(profile)
        self.assertFalse(is_valid)
        self.assertIn("experience level", msg)

    def test_invalid_complexity(self):
        profile = {
            "interests": ["Web Development"],
            "experience": "Beginner",
            "complexity": "Impossible",
            "projectType": "Either"
        }
        is_valid, msg = validate_profile_input(profile)
        self.assertFalse(is_valid)
        self.assertIn("project complexity", msg)

    def test_long_custom_preferences(self):
        profile = {
            "interests": ["Cybersecurity"],
            "experience": "Advanced",
            "complexity": "Challenging",
            "projectType": "Individual",
            "customPreferences": "A" * 1200
        }
        is_valid, msg = validate_profile_input(profile)
        self.assertFalse(is_valid)
        self.assertIn("under 1000 characters", msg)


class TestProjectSchemaAndScoring(unittest.TestCase):

    def test_valid_project_schema(self):
        sample_proj = {
            "title": "Smart Campus Guide",
            "shortDescription": "Interactive navigation assistant",
            "problemStatement": "Students get lost.",
            "whyItFits": "Uses your Python skills.",
            "targetUsers": "Freshmen",
            "domain": "AI & Web",
            "difficulty": "Moderate",
            "feasibilityScore": 92,
            "innovationScore": 88,
            "finalYearSuitabilityScore": 95,
            "estimatedScope": "4 months",
            "techStack": ["React", "FastAPI"],
            "keyFeatures": ["Indoor mapping", "Event alerts"],
            "uniqueValue": "Real-time sync",
            "possibleChallenges": ["Bluetooth beacon calibration"]
        }
        is_valid, normalized = validate_project_schema(sample_proj)
        self.assertTrue(is_valid)
        self.assertEqual(normalized["title"], "Smart Campus Guide")
        self.assertEqual(normalized["feasibilityScore"], 92)
        self.assertEqual(len(normalized["techStack"]), 2)

    def test_malformed_project_is_rejected(self):
        malformed = {
            "title": "Broken Output",
            "feasibilityScore": "invalid_number",
            "techStack": "React, Python, MongoDB"
        }
        is_valid, normalized = validate_project_schema(malformed)
        self.assertFalse(is_valid)
        self.assertEqual(normalized, {})

    def test_deterministic_profile_scoring(self):
        profile = {
            "interests": ["Artificial Intelligence"],
            "skills": ["Python", "FastAPI"],
            "experience": "Intermediate",
            "complexity": "Moderate"
        }
        matching_proj = {
            "title": "AI Academic Assistant",
            "shortDescription": "Built with Python and FastAPI",
            "whyItFits": "Great AI match",
            "domain": "Artificial Intelligence",
            "difficulty": "Moderate",
            "feasibilityScore": 90,
            "finalYearSuitabilityScore": 92,
            "techStack": ["Python", "FastAPI", "Google AI"]
        }
        score = calculate_profile_match(profile, matching_proj)
        self.assertGreaterEqual(score, 80)
        self.assertLessEqual(score, 98)


class TestAIServiceResilience(unittest.TestCase):

    def test_intelligent_fallback_generation(self):
        profile = {
            "interests": ["Machine Learning", "FinTech"],
            "skills": ["Python", "Scikit-learn", "React"],
            "experience": "Advanced",
            "complexity": "Challenging",
            "projectType": "Individual",
            "customPreferences": "Include fraud detection."
        }
        projects = generate_intelligent_fallback_projects(profile)
        self.assertGreaterEqual(len(projects), 3)
        for p in projects:
            self.assertIn("title", p)
            self.assertIn("profileMatchScore", p)
            self.assertGreaterEqual(p["profileMatchScore"], 75)
            self.assertIn("techStack", p)
            self.assertTrue(len(p["keyFeatures"]) >= 3)

    def test_process_and_score_projects(self):
        profile = {
            "interests": ["IoT"],
            "skills": ["C++", "Python"],
            "experience": "Intermediate",
            "complexity": "Moderate"
        }
        mock_raw = [
            {
                "title": "Smart Irrigation IoT Mesh",
                "shortDescription": "Low-power environmental sensor system.",
                "problemStatement": "Water wastage in agriculture.",
                "whyItFits": "Uses your C++ and IoT skills.",
                "targetUsers": "Agronomists",
                "domain": "IoT",
                "difficulty": "Moderate",
                "feasibilityScore": 90,
                "innovationScore": 85,
                "finalYearSuitabilityScore": 90,
                "estimatedScope": "4 Months",
                "techStack": ["C++", "Python", "MQTT"],
                "keyFeatures": ["Mesh telemetry", "Automated valves", "Dashboard"],
                "uniqueValue": "Battery-less solar energy harvesting.",
                "possibleChallenges": ["Network packet loss"]
            }
        ]
        processed = process_and_score_projects(profile, mock_raw)
        self.assertEqual(len(processed), 1)
        self.assertIn("profileMatchScore", processed[0])


if __name__ == "__main__":
    unittest.main()
