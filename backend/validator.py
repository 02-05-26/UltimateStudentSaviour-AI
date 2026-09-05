"""
Validation logic for UltimateStudentSaviour AI profile and AI response structures.
"""

from typing import Tuple, Dict, Any, List

VALID_EXPERIENCES = {"Beginner", "Intermediate", "Advanced"}
VALID_COMPLEXITIES = {"Simple", "Moderate", "Challenging"}
VALID_PROJECT_TYPES = {"Individual", "Team", "Either"}

def validate_profile_input(data: Dict[str, Any]) -> Tuple[bool, str]:
    """
    Validates student profile submitted for project generation.
    Returns (is_valid, error_message).
    """
    if not isinstance(data, dict):
        return False, "Invalid request format. Expected JSON object."

    interests = data.get("interests", [])
    if not isinstance(interests, list) or len(interests) == 0:
        return False, "Choose at least one interest so we can personalize your project ideas."
    
    # Filter non-empty strings
    valid_interests = [str(i).strip() for i in interests if str(i).strip()]
    if not valid_interests:
        return False, "Choose at least one valid interest so we can personalize your project ideas."

    experience = data.get("experience")
    if not experience or experience not in VALID_EXPERIENCES:
        return False, "Please select your experience level (Beginner, Intermediate, or Advanced)."

    complexity = data.get("complexity")
    if not complexity or complexity not in VALID_COMPLEXITIES:
        return False, "Please select your preferred project complexity (Simple, Moderate, or Challenging)."

    project_type = data.get("projectType")
    if not project_type or project_type not in VALID_PROJECT_TYPES:
        return False, "Please select your preferred project type (Individual, Team, or Either)."

    skills = data.get("skills", [])
    if not isinstance(skills, list):
        return False, "Skills must be provided as a list."

    custom_prefs = data.get("customPreferences", "")
    if not isinstance(custom_prefs, str):
        return False, "Custom preferences must be text."

    if len(custom_prefs) > 1000:
        return False, "Custom preferences must be under 1000 characters."

    return True, ""


REQUIRED_PROJECT_FIELDS = [
    "title",
    "shortDescription",
    "problemStatement",
    "whyItFits",
    "targetUsers",
    "domain",
    "difficulty",
    "feasibilityScore",
    "innovationScore",
    "finalYearSuitabilityScore",
    "estimatedScope",
    "techStack",
    "keyFeatures",
    "uniqueValue",
    "possibleChallenges"
]

def validate_project_schema(project: Dict[str, Any]) -> Tuple[bool, Dict[str, Any]]:
    """
    Validates and normalizes a single project dictionary.
    Returns (is_valid, normalized_project).
    """
    if not isinstance(project, dict):
        return False, {}

    for field in REQUIRED_PROJECT_FIELDS:
        if field not in project:
            return False, {}
    for field in ["title", "shortDescription", "problemStatement", "whyItFits", "targetUsers", "domain", "estimatedScope", "uniqueValue"]:
        if not isinstance(project.get(field), str) or not project[field].strip() or len(project[field]) > 5000:
            return False, {}
    if project.get("difficulty") not in VALID_COMPLEXITIES:
        return False, {}
    for field in ["feasibilityScore", "innovationScore", "finalYearSuitabilityScore"]:
        if isinstance(project.get(field), bool):
            return False, {}
        try:
            if not 0 <= float(project[field]) <= 100:
                return False, {}
        except (TypeError, ValueError):
            return False, {}
    for field in ["techStack", "keyFeatures", "possibleChallenges"]:
        if not isinstance(project.get(field), list) or not project[field] or any(not isinstance(v, str) or not v.strip() for v in project[field]):
            return False, {}

    normalized = {}

    # String fields
    for field in ["title", "shortDescription", "problemStatement", "whyItFits", "domain", "estimatedScope", "uniqueValue"]:
        val = project.get(field)
        if not val or not isinstance(val, str):
            val = str(val or f"Project {field}")
        normalized[field] = val.strip()

    # Target users
    target_users = project.get("targetUsers")
    if isinstance(target_users, list):
        normalized["targetUsers"] = ", ".join(str(u) for u in target_users)
    else:
        normalized["targetUsers"] = str(target_users or "Final-year students, researchers, and end users")

    # Difficulty
    difficulty = project.get("difficulty", "Moderate")
    if difficulty not in VALID_COMPLEXITIES:
        difficulty = "Moderate"
    normalized["difficulty"] = difficulty

    # Numeric Scores (0-100)
    for score_field in ["feasibilityScore", "innovationScore", "finalYearSuitabilityScore"]:
        val = project.get(score_field)
        try:
            val_int = int(float(val))
            val_int = max(50, min(100, val_int))
        except (ValueError, TypeError):
            val_int = 85
        normalized[score_field] = val_int

    # List fields
    for list_field in ["techStack", "keyFeatures", "possibleChallenges"]:
        items = project.get(list_field, [])
        if not isinstance(items, list):
            if isinstance(items, str):
                items = [i.strip() for i in items.split(",") if i.strip()]
            else:
                items = []
        normalized[list_field] = [str(item).strip() for item in items if str(item).strip()]
        if not normalized[list_field]:
            normalized[list_field] = ["Standard implementation", "Module testing"]

    return True, normalized


def validate_project_action_request(data: Dict[str, Any], require_concern: bool = False) -> Tuple[bool, Any]:
    if not isinstance(data, dict):
        return False, "Invalid request format."
    profile, project = data.get("profile"), data.get("project")
    valid, message = validate_profile_input(profile)
    if not valid:
        return False, message
    valid, _ = validate_project_schema(project)
    if not valid:
        return False, "Project data is incomplete or invalid."
    if require_concern:
        concern = data.get("concern")
        if not isinstance(concern, str) or not concern.strip() or len(concern.strip()) > 1000:
            return False, "Describe your concern in 1 to 1000 characters."
    return True, ""


def _strings(value: Any, field: str, required: bool = True) -> Tuple[bool, Any]:
    if not isinstance(value, list) or (required and not value) or any(not isinstance(item, str) or not item.strip() or len(item) > 3000 for item in value):
        return False, f"Invalid {field} response."
    return True, [item.strip() for item in value]


def _text(value: Any, field: str) -> Tuple[bool, Any]:
    if not isinstance(value, str) or not value.strip() or len(value) > 10000:
        return False, f"Invalid {field} response."
    return True, value.strip()


def validate_evaluation_response(data: Any) -> Tuple[bool, Any]:
    if not isinstance(data, dict): return False, "Invalid evaluation response."
    output = {}
    for key in ["feasibilityScore", "innovationScore", "technicalDepthScore", "finalYearSuitabilityScore", "scopeFitScore", "overallScore"]:
        try:
            value = int(float(data.get(key)))
        except (ValueError, TypeError): return False, f"Invalid {key} response."
        if not 0 <= value <= 100: return False, f"Invalid {key} response."
        output[key] = value
    for key in ["strengths", "risks", "mitigation"]:
        valid, value = _strings(data.get(key), key)
        if not valid: return False, value
        output[key] = value
    valid, value = _text(data.get("recommendation"), "recommendation")
    if not valid: return False, value
    output["recommendation"] = value
    return True, output


BLUEPRINT_TEXT_FIELDS = ["projectSummary", "problemDefinition", "proposedSolution", "targetUsers", "systemArchitecture", "databaseDesign", "apiPlan", "aiIntegrationPlan", "testingStrategy", "deploymentPlan", "securityConsiderations", "futureScope"]
BLUEPRINT_LIST_FIELDS = ["functionalRequirements", "nonFunctionalRequirements", "mvpFeatures", "optionalFeatures", "recommendedTechStack", "developmentPhases", "risksAndMitigations"]

def validate_blueprint_response(data: Any) -> Tuple[bool, Any]:
    if not isinstance(data, dict): return False, "Invalid blueprint response."
    output = {}
    for key in BLUEPRINT_TEXT_FIELDS:
        raw_value = data.get(key)
        # Gemini may correctly return multiple target-user groups as a JSON array.
        # Normalize that documented structured form before applying text limits.
        if key == "targetUsers" and isinstance(raw_value, list):
            if not raw_value or any(not isinstance(item, str) or not item.strip() for item in raw_value):
                return False, "Invalid targetUsers response."
            raw_value = ", ".join(item.strip() for item in raw_value)
        valid, value = _text(raw_value, key)
        if not valid: return False, value
        output[key] = value
    for key in BLUEPRINT_LIST_FIELDS:
        raw_value = data.get(key)
        # Preserve Gemini's structured risk/mitigation pairs as readable text.
        # This is normalization of an allowed response shape, not fallback content.
        if key == "risksAndMitigations" and isinstance(raw_value, list) and raw_value and all(isinstance(item, dict) for item in raw_value):
            normalized_pairs = []
            for item in raw_value:
                risk, mitigation = item.get("risk"), item.get("mitigation")
                if not isinstance(risk, str) or not risk.strip() or not isinstance(mitigation, str) or not mitigation.strip():
                    return False, "Invalid risksAndMitigations response."
                normalized_pairs.append(f"Risk: {risk.strip()} Mitigation: {mitigation.strip()}")
            raw_value = normalized_pairs
        valid, value = _strings(raw_value, key)
        if not valid: return False, value
        output[key] = value
    return True, output

def validate_improvement_response(data: Any) -> Tuple[bool, Any]:
    if not isinstance(data, dict): return False, "Invalid improvement response."
    output = {}
    for key in ["whatToChange", "why", "scopeRecommendation", "expectedImprovement"]:
        valid, value = _text(data.get(key), key)
        if not valid: return False, value
        output[key] = value
    for key in ["suggestedFeatures", "technologyChanges", "risks"]:
        valid, value = _strings(data.get(key), key)
        if not valid: return False, value
        output[key] = value
    return True, output


def validate_mentor_request(data: Any) -> Tuple[bool, Any]:
    if not isinstance(data, dict): return False, "Invalid request format."
    project_id = data.get("projectId")
    if not isinstance(project_id, str) or not project_id.startswith("p_") or len(project_id) > 100:
        return False, "A valid selected project is required for mentor guidance."
    valid, message = validate_project_action_request({"profile": data.get("profile"), "project": data.get("project")})
    if not valid: return False, message
    if data["project"].get("id") != project_id:
        return False, "Selected project context does not match the requested project."
    question = data.get("question")
    if not isinstance(question, str) or not question.strip() or len(question.strip()) > 2000:
        return False, "Ask a question between 1 and 2000 characters."
    history = data.get("history", [])
    if not isinstance(history, list) or len(history) > 6:
        return False, "Conversation history is invalid."
    for message in history:
        if not isinstance(message, dict) or message.get("role") not in {"user", "assistant"}:
            return False, "Conversation history is invalid."
        content = message.get("content")
        if not isinstance(content, str) or not content.strip() or len(content) > 2000:
            return False, "Conversation history is invalid."
    blueprint = data.get("blueprint")
    if blueprint is not None:
        valid, message = validate_blueprint_response(blueprint)
        if not valid: return False, message
    roadmap = data.get("roadmap", [])
    if not isinstance(roadmap, list) or len(roadmap) > 20:
        return False, "Roadmap context is invalid."
    for phase in roadmap:
        if not isinstance(phase, dict) or not isinstance(phase.get("name"), str) or not isinstance(phase.get("tasks"), list):
            return False, "Roadmap context is invalid."
        if any(not isinstance(task, dict) or not isinstance(task.get("text"), str) or not isinstance(task.get("done"), bool) for task in phase["tasks"]):
            return False, "Roadmap context is invalid."
    return True, ""


def validate_mentor_response(data: Any) -> Tuple[bool, Any]:
    if not isinstance(data, dict): return False, "Invalid mentor response."
    output = {}
    for field in ["answer", "nextSteps", "relevantRoadmapTasks", "warnings"]:
        if field == "answer":
            valid, value = _text(data.get(field), field)
        else:
            valid, value = _strings(data.get(field), field, required=False)
        if not valid: return False, value
        output[field] = value
    return True, output

def validate_presentation_response(data: Any) -> Tuple[bool, Any]:
    if not isinstance(data, dict): return False, "Invalid presentation response."
    output = {}
    valid, value = _text(data.get("title"), "title")
    if not valid: return False, value
    output["title"] = value

    valid, value = _text(data.get("subtitle"), "subtitle")
    if not valid: return False, value
    output["subtitle"] = value

    slides = data.get("slides")
    if not isinstance(slides, list) or not slides:
        return False, "Invalid slides response."

    output["slides"] = []
    for idx, slide in enumerate(slides):
        if not isinstance(slide, dict):
            return False, f"Invalid slide at index {idx}."
        
        slide_out = {}
        try:
            slide_out["slideNumber"] = int(slide.get("slideNumber", idx + 1))
        except (ValueError, TypeError):
            slide_out["slideNumber"] = idx + 1
        
        valid, s_title = _text(slide.get("title"), "slide title")
        if not valid: return False, f"Invalid title in slide {idx}."
        slide_out["title"] = s_title

        valid, s_points = _strings(slide.get("keyPoints"), "slide keyPoints")
        if not valid: return False, f"Invalid keyPoints in slide {idx}."
        slide_out["keyPoints"] = s_points

        valid, s_notes = _text(slide.get("speakerNotes"), "slide speakerNotes")
        if not valid: return False, f"Invalid speakerNotes in slide {idx}."
        slide_out["speakerNotes"] = s_notes

        output["slides"].append(slide_out)

    return True, output

def validate_viva_response(data: Any) -> Tuple[bool, Any]:
    if not isinstance(data, dict): return False, "Invalid viva response."
    questions = data.get("questions")
    if not isinstance(questions, list) or not questions:
        return False, "Invalid questions response."

    output = {"questions": []}
    for idx, q in enumerate(questions):
        if not isinstance(q, dict):
            return False, f"Invalid question at index {idx}."
        
        q_out = {}
        valid, q_text = _text(q.get("question"), "question text")
        if not valid: return False, f"Invalid question text at index {idx}."
        q_out["question"] = q_text

        valid, q_answer = _text(q.get("answer"), "question answer")
        if not valid: return False, f"Invalid answer at index {idx}."
        q_out["answer"] = q_answer

        valid, q_diff = _text(q.get("difficulty"), "question difficulty")
        if not valid: return False, f"Invalid difficulty at index {idx}."
        q_out["difficulty"] = q_diff

        valid, q_cat = _text(q.get("category"), "question category")
        if not valid: return False, f"Invalid category at index {idx}."
        q_out["category"] = q_cat

        output["questions"].append(q_out)
        
    return True, output

def validate_project_id(project_id: Any) -> Tuple[bool, str]:
    if not isinstance(project_id, str) or not project_id.strip():
        return False, "Project ID must be a non-empty string."
    clean_id = project_id.strip()
    if len(clean_id) > 100 or not all(c.isalnum() or c in "_-" for c in clean_id):
        return False, "Invalid Project ID format."
    return True, clean_id

def validate_project_upsert_payload(data: Any) -> Tuple[bool, str]:
    if not isinstance(data, dict):
        return False, "Invalid request payload. Expected JSON object."
    if "title" in data and (not isinstance(data["title"], str) or not data["title"].strip()):
        return False, "Project title must be a non-empty string."
    return True, ""
