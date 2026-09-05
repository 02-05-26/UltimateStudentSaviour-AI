"""Context-aware, server-side project mentor workflow."""
import json
from typing import Any, Dict, List

from .ai_service import call_gemini_json, get_api_key
from .validator import validate_mentor_response, validate_project_schema


def build_project_context(project_id: str, project: Dict[str, Any], blueprint: Any, roadmap: Any) -> Dict[str, Any]:
    """Build the only project context the mentor is allowed to see."""
    if project.get("id") != project_id:
        raise ValueError("Selected project context does not match the requested project.")
    phases = roadmap if isinstance(roadmap, list) else []
    tasks = [task for phase in phases for task in phase.get("tasks", [])]
    completed = sum(1 for task in tasks if task.get("done"))
    next_task = next((task.get("text") for task in tasks if not task.get("done")), None)
    return {
        "projectId": project_id,
        "title": project["title"],
        "description": project["shortDescription"],
        "problemStatement": project["problemStatement"],
        "domain": project["domain"],
        "difficulty": project["difficulty"],
        "techStack": project["techStack"],
        "keyFeatures": project["keyFeatures"],
        "solution": blueprint.get("proposedSolution") if isinstance(blueprint, dict) else None,
        "blueprint": blueprint,
        "blueprintAvailability": "available" if isinstance(blueprint, dict) else "unavailable",
        "roadmap": phases,
        "roadmapAvailability": "available" if phases else "unavailable",
        "progress": {"completedTasks": completed, "remainingTasks": len(tasks) - completed, "totalTasks": len(tasks), "nextRecommendedTask": next_task},
    }


def mentor_project(profile: Dict[str, Any], project_id: str, project: Dict[str, Any], question: str, history: List[Dict[str, str]], blueprint: Any = None, roadmap: Any = None) -> Dict[str, Any]:
    valid, _ = validate_project_schema(project)
    if not valid: raise ValueError("Invalid project structure")
    key = get_api_key()
    if not key: raise RuntimeError("Gemini API key not configured. Add it on the server and retry.")
    context = {
        "selectedProject": build_project_context(project_id, project, blueprint, roadmap),
        "profile": profile,
        "recentConversation": history[-6:],
        "studentQuestion": question.strip(),
    }
    prompt = """You are a practical, encouraging final-year project mentor. You MUST ground every answer in selectedProject only. Start answer by naming selectedProject.title exactly. Do not substitute an example project, invent a different title, or mention technologies not in selectedProject.techStack unless clearly presenting them as an optional alternative. Use selectedProject.solution, blueprint, roadmap, and progress when available. When blueprintAvailability or roadmapAvailability is unavailable, explicitly state that the corresponding project data is unavailable; never invent architecture, phases, or tasks from another project. Return ONLY JSON with answer (string), nextSteps (string array), relevantRoadmapTasks (string array), warnings (string array). Do not emit HTML, secrets, or executable code."""
    result = call_gemini_json(key, prompt, json.dumps(context))
    valid, value = validate_mentor_response(result)
    if not valid: raise ValueError(value)
    if project["title"].casefold() not in value["answer"].casefold():
        raise ValueError("Mentor response was not grounded in the selected project. Please retry.")
    return value
