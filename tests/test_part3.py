"""Part 3 contracts and AI workflows; all Gemini calls are mocked."""
import os, sys, unittest
from unittest.mock import patch
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.validator import (validate_project_action_request, validate_evaluation_response,
                               validate_blueprint_response, validate_improvement_response)
from backend.evaluation import evaluate_project, generate_blueprint, improve_project

PROFILE = {"interests":["Artificial Intelligence"],"skills":["Python"],"experience":"Intermediate","complexity":"Moderate","projectType":"Individual","customPreferences":""}
PROJECT = {"title":"Safe Campus","shortDescription":"A useful system","problemStatement":"Campus reporting is fragmented.","whyItFits":"Uses Python.","targetUsers":"Students","domain":"AI","difficulty":"Moderate","feasibilityScore":80,"innovationScore":82,"finalYearSuitabilityScore":86,"estimatedScope":"4 months","techStack":["Python"],"keyFeatures":["Reports"],"uniqueValue":"Focused AI","possibleChallenges":["Data quality"]}
EVALUATION = {"feasibilityScore":80,"innovationScore":81,"technicalDepthScore":82,"finalYearSuitabilityScore":83,"scopeFitScore":84,"overallScore":82,"strengths":["Practical"],"risks":["Data"],"mitigation":["Validate data"],"recommendation":"Build the MVP first."}
BLUEPRINT = {"projectSummary":"Summary","problemDefinition":"Problem","proposedSolution":"Solution","targetUsers":"Students","functionalRequirements":["Login"],"nonFunctionalRequirements":["Secure"],"mvpFeatures":["Reports"],"optionalFeatures":["Alerts"],"recommendedTechStack":["Python"],"systemArchitecture":"Web API","databaseDesign":"Tables","apiPlan":"REST","aiIntegrationPlan":"Server side","developmentPhases":["Plan"],"testingStrategy":"Unit tests","deploymentPlan":"Cloud","securityConsiderations":"Validate input","risksAndMitigations":["Rate limit"],"futureScope":"Mobile"}
IMPROVEMENT = {"whatToChange":"Reduce integrations","why":"Fits timeline","suggestedFeatures":["MVP"],"technologyChanges":["SQLite"],"scopeRecommendation":"One core flow","risks":["Time"],"expectedImprovement":"Deliverable MVP"}

class Part3Tests(unittest.TestCase):
    def test_request_validation_rejects_missing_project_fields(self):
        valid, _ = validate_project_action_request({"profile": PROFILE, "project": {"title":"x"}})
        self.assertFalse(valid)

    def test_evaluation_contract_rejects_out_of_range_score(self):
        invalid = dict(EVALUATION, overallScore=101)
        self.assertFalse(validate_evaluation_response(invalid)[0])

    def test_blueprint_and_improvement_contracts(self):
        self.assertTrue(validate_blueprint_response(BLUEPRINT)[0])
        self.assertTrue(validate_improvement_response(IMPROVEMENT)[0])

    def test_blueprint_accepts_structured_target_user_groups(self):
        blueprint = dict(BLUEPRINT, targetUsers=["Students", "Faculty advisors"])
        valid, normalized = validate_blueprint_response(blueprint)
        self.assertTrue(valid)
        self.assertEqual(normalized["targetUsers"], "Students, Faculty advisors")

    def test_blueprint_accepts_structured_risk_mitigations(self):
        blueprint = dict(BLUEPRINT, risksAndMitigations=[{"risk":"Low-quality data", "mitigation":"Validate input"}])
        valid, normalized = validate_blueprint_response(blueprint)
        self.assertTrue(valid)
        self.assertEqual(normalized["risksAndMitigations"], ["Risk: Low-quality data Mitigation: Validate input"])

    def test_blueprint_normalizes_a_structured_database_design(self):
        blueprint = dict(BLUEPRINT, databaseDesign={
            "engine": "PostgreSQL",
            "tables": [
                {"name": "users", "columns": ["id UUID", "email text"]},
                {"name": "resumes", "columns": ["id UUID", "user_id UUID"]},
            ],
            "relationships": ["users.id -> resumes.user_id"],
        })
        valid, normalized = validate_blueprint_response(blueprint)
        self.assertTrue(valid)
        self.assertIn("PostgreSQL", normalized["databaseDesign"])
        self.assertIn("users", normalized["databaseDesign"])
        self.assertIn("resumes", normalized["databaseDesign"])

    def test_blueprint_rejects_an_empty_structured_database_design(self):
        valid, message = validate_blueprint_response(dict(BLUEPRINT, databaseDesign={}))
        self.assertFalse(valid)
        self.assertEqual(message, "Invalid databaseDesign response.")

    @patch('backend.evaluation.get_api_key', return_value='test-key')
    @patch('backend.evaluation.call_gemini_json', return_value=EVALUATION)
    def test_evaluation_uses_shared_transport(self, mocked_call, _):
        self.assertEqual(evaluate_project(PROFILE, PROJECT)['overallScore'], 82)
        mocked_call.assert_called_once()

    @patch('backend.evaluation.get_api_key', return_value='test-key')
    @patch('backend.evaluation.call_gemini_json', return_value=BLUEPRINT)
    def test_blueprint_uses_shared_transport(self, mocked_call, _):
        self.assertEqual(generate_blueprint(PROFILE, PROJECT)['mvpFeatures'], ['Reports'])
        mocked_call.assert_called_once()

    @patch('backend.evaluation.get_api_key', return_value='test-key')
    @patch('backend.evaluation.call_gemini_json', return_value=IMPROVEMENT)
    def test_improve_uses_shared_transport(self, mocked_call, _):
        self.assertIn('MVP', improve_project(PROFILE, PROJECT, 'Too large')['suggestedFeatures'])
        mocked_call.assert_called_once()

    @patch('backend.evaluation.get_api_key', return_value='')
    def test_gemini_failure_is_controlled(self, _):
        with self.assertRaisesRegex(RuntimeError, 'not configured'):
            evaluate_project(PROFILE, PROJECT)

if __name__ == '__main__': unittest.main()
