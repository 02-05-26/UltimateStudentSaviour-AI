"""Part 3 AI workflows, all using the shared Gemini transport."""
import json
from typing import Any, Dict

from .ai_service import call_gemini_json, get_api_key
from .validator import (validate_blueprint_response, validate_evaluation_response,
                        validate_improvement_response, validate_project_schema)


def _project_context(profile: Dict[str, Any], project: Dict[str, Any]) -> str:
    valid, _ = validate_project_schema(project)
    if not valid:
        raise ValueError("Invalid project structure")
    return f"Student profile: {json.dumps(profile)}\nProject: {json.dumps(project)}"


def _run(prompt: str, context: str, validator):
    key = get_api_key()
    if not key:
        raise RuntimeError("Gemini API key not configured. Add it on the server and retry.")
    result = call_gemini_json(key, prompt, context)
    valid, value = validator(result)
    if not valid:
        raise ValueError(value)
    return value


def evaluate_project(profile: Dict[str, Any], project: Dict[str, Any]) -> Dict[str, Any]:
    prompt = """You are a final-year project mentor. Return ONLY JSON with integer 0-100 fields feasibilityScore, innovationScore, technicalDepthScore, finalYearSuitabilityScore, scopeFitScore, overallScore; plus strengths (string array), risks (string array), mitigation (string array), recommendation (string). Be specific and realistic."""
    return _run(prompt, _project_context(profile, project), validate_evaluation_response)


def generate_blueprint(profile: Dict[str, Any], project: Dict[str, Any]) -> Dict[str, Any]:
    prompt = """You are a senior software architect. Return ONLY JSON containing projectSummary, problemDefinition, proposedSolution, targetUsers, functionalRequirements (array), nonFunctionalRequirements (array), mvpFeatures (array), optionalFeatures (array), recommendedTechStack (array), systemArchitecture, databaseDesign, apiPlan, aiIntegrationPlan, developmentPhases (array), testingStrategy, deploymentPlan, securityConsiderations, risksAndMitigations (array), futureScope. Keep the scope practical for a final-year student."""
    return _run(prompt, _project_context(profile, project), validate_blueprint_response)


def improve_project(profile: Dict[str, Any], project: Dict[str, Any], concern: str) -> Dict[str, Any]:
    prompt = """You are a final-year project mentor. Return ONLY JSON with whatToChange, why, suggestedFeatures (array), technologyChanges (array), scopeRecommendation, risks (array), expectedImprovement. Give concrete changes that address the student concern without inflating scope."""
    return _run(prompt, _project_context(profile, project) + f"\nStudent concern: {concern}", validate_improvement_response)


def generate_presentation(profile: Dict[str, Any], project: Dict[str, Any]) -> Dict[str, Any]:
    prompt = """You are a senior technical mentor. Generate an academic final-year project presentation based strictly on the provided project context.
Do NOT invent real results, statistics, or users if the project is not implemented yet; use "expected results".
Return ONLY JSON with "title", "subtitle", and "slides" array.
Each slide must have: "slideNumber" (integer), "title", "keyPoints" (array of strings), "speakerNotes" (string for presentation notes).
Generate approximately 10-12 slides following the standard academic flow: Title, Problem Statement, Motivation, Limitations, Solution, Features, Tech Stack, Architecture, Roadmap/Implementation, Expected Results, Future Scope, Conclusion."""
    from .validator import validate_presentation_response
    return _run(prompt, _project_context(profile, project), validate_presentation_response)

def generate_viva(profile: Dict[str, Any], project: Dict[str, Any]) -> Dict[str, Any]:
    prompt = """You are an academic examiner conducting a viva for a final-year engineering project.
Generate approximately 15-20 viva questions based strictly on the provided project context.
Cover project overview, problem, solution, tech choices, architecture, DB, APIs, Gemini/AI, security, testing, scalability, limitations, future scope.
Answers must be concise, technically correct, and understandable to a final-year student.
Return ONLY JSON with a "questions" array.
Each question object must have: "question", "answer", "difficulty" (Easy/Medium/Hard), "category" (e.g., Architecture, Security, etc)."""
    from .validator import validate_viva_response
    return _run(prompt, _project_context(profile, project), validate_viva_response)

__all__ = ["evaluate_project", "generate_blueprint", "improve_project", "generate_presentation", "generate_viva"]
