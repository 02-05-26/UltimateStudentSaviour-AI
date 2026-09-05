"""
AI Service Abstraction for UltimateStudentSaviour AI.
Securely communicates with Google AI (Gemini API) using server-side environment variables.
Never exposes API keys or secrets to the browser.
"""

import os
import json
import urllib.request
import urllib.error
from typing import Dict, Any, List
from .validator import validate_project_schema
from .scoring import calculate_profile_match

# List of models to try in order of preference (fast, high-availability models first)
GEMINI_MODELS = [
    "gemini-3.1-flash-lite",
    "gemini-3.6-flash",
    "gemini-flash-latest"
]

def get_api_key() -> str:
    """Retrieves Google AI Gemini API key securely from environment variables."""
    key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_AI_API_KEY") or ""
    return key.strip()

def build_system_prompt() -> str:
    return """You are a senior computer science professor and technical mentor specializing in undergraduate and graduate final-year engineering projects.

Your objective is to generate 3 to 4 practical, innovative, and realistically buildable final-year project ideas tailored strictly to the student's profile.

IMPORTANT RULES:
1. Recommend projects the student can realistically build within a 3 to 6 month academic timeline.
2. Align technologies with their existing skills where possible, and suggest sensible complementary modern tools.
3. Avoid generic/common projects (e.g. basic e-commerce, simple chat, generic blog) unless provided with a distinct, high-impact innovation or unique architecture.
4. Avoid unrealistic enterprise-scale systems requiring massive data clusters or proprietary hardware.
5. Emphasize meaningful technical depth suitable for viva/thesis evaluation by university examiners.
6. Clearly explain WHY each project fits the student's profile.
7. Return ONLY a valid JSON array of objects adhering strictly to the schema provided. Do not wrap in markdown quotes if possible, or provide valid JSON.
"""

def build_user_prompt(profile: Dict[str, Any]) -> str:
    interests_str = ", ".join(profile.get("interests", []))
    skills_str = ", ".join(profile.get("skills", [])) if profile.get("skills") else "None specified (suggest standard modern stack)"
    experience = profile.get("experience", "Intermediate")
    complexity = profile.get("complexity", "Moderate")
    project_type = profile.get("projectType", "Either")
    custom_prefs = profile.get("customPreferences", "").strip()

    prompt = f"""Generate 3 to 4 final-year project ideas for the following student profile:

- Interests & Domains: {interests_str}
- Current Skills & Technologies: {skills_str}
- Experience Level: {experience}
- Desired Project Complexity: {complexity}
- Project Format: {project_type}
"""
    if custom_prefs:
        prompt += f"- Additional Notes/Preferences from Student: {custom_prefs}\n"

    prompt += """
Format your response as a JSON array where each object has the following keys:
[
  {
    "title": "Clear, Professional Project Name",
    "shortDescription": "1-2 sentence compelling summary of the project.",
    "problemStatement": "Specific real-world or technical problem this project solves.",
    "whyItFits": "Specific explanation of how this matches their skills and interests without overwhelming them.",
    "targetUsers": "Primary stakeholders or beneficiaries.",
    "domain": "Primary domain category (e.g. AI & Healthcare, Intelligent Automation)",
    "difficulty": "Simple" | "Moderate" | "Challenging",
    "feasibilityScore": integer between 70 and 98 (how realistically it can be built),
    "innovationScore": integer between 70 and 98 (how novel or distinct it is for final year),
    "finalYearSuitabilityScore": integer between 75 and 99 (how impressive it is for viva/examiners),
    "estimatedScope": "e.g. 4-5 months / 4 main functional milestones",
    "techStack": ["React", "FastAPI", "MongoDB", "Google Gemini API"],
    "keyFeatures": ["Feature 1 with technical detail", "Feature 2", "Feature 3", "Feature 4"],
    "uniqueValue": "What makes this stand out to academic evaluators.",
    "possibleChallenges": ["Challenge 1 and how to overcome it", "Challenge 2"]
  }
]
"""
    return prompt

def generate_project_ideas(profile: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Primary AI service function.
    Calls Google AI Gemini API if key is present, otherwise uses high-quality deterministic mentor generator.
    """
    api_key = get_api_key()
    
    if api_key:
        try:
            projects = call_gemini_api(api_key, profile)
            if projects and len(projects) > 0:
                # Validate, score, and return
                return process_and_score_projects(profile, projects)
        except Exception as e:
            # Safe internal logging without exposing keys
            print(f"[AI Service] Gemini API call failed or timed out: {type(e).__name__}. Falling back to deterministic mentor engine.")

    # Fallback / Offline / Zero-key demo mode
    return generate_intelligent_fallback_projects(profile)

def call_gemini_json(api_key: str, system_prompt: str, user_prompt: str) -> Any:
    """The single server-only Gemini JSON transport used by all AI workflows."""

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": system_prompt + "\n\n" + user_prompt}]
            }
        ],
        "generationConfig": {
            "temperature": 0.4,
            "topP": 0.9,
            "responseMimeType": "application/json"
        }
    }

    data_bytes = json.dumps(payload).encode("utf-8")
    
    last_error = None
    for model in GEMINI_MODELS:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        req = urllib.request.Request(
            url,
            data=data_bytes,
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        try:
            with urllib.request.urlopen(req, timeout=25) as response:
                if response.status == 200:
                    resp_body = response.read().decode("utf-8")
                    resp_json = json.loads(resp_body)
                    
                    # Extract text
                    candidates = resp_json.get("candidates", [])
                    if candidates:
                        content_parts = candidates[0].get("content", {}).get("parts", [])
                        if content_parts:
                            raw_text = content_parts[0].get("text", "").strip()
                            
                            # Clean up markdown code blocks if present
                            if raw_text.startswith("```json"):
                                raw_text = raw_text[7:]
                            if raw_text.startswith("```"):
                                raw_text = raw_text[3:]
                            if raw_text.endswith("```"):
                                raw_text = raw_text[:-3]
                            raw_text = raw_text.strip()
                            
                            return json.loads(raw_text)
        except Exception as err:
            last_error = err
            continue

    if last_error:
        # Keep network/provider internals out of API responses while allowing callers
        # to return a consistent, retryable AI-service error.
        print(f"[AI Service] Gemini request failed: {type(last_error).__name__}")
        raise RuntimeError("Gemini is temporarily unavailable. Please try again.") from last_error
    raise RuntimeError("Gemini returned no usable JSON")

def call_gemini_api(api_key: str, profile: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Compatibility wrapper for the existing generator."""
    data = call_gemini_json(api_key, build_system_prompt(), build_user_prompt(profile))
    if isinstance(data, list):
        return data
    if isinstance(data, dict) and isinstance(data.get("projects"), list):
        return data["projects"]
    return []

def process_and_score_projects(profile: Dict[str, Any], raw_projects: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Validates each project and injects the deterministic profile match score."""
    validated_projects = []
    for proj in raw_projects:
        is_valid, norm_proj = validate_project_schema(proj)
        if is_valid:
            norm_proj["profileMatchScore"] = calculate_profile_match(profile, norm_proj)
            validated_projects.append(norm_proj)
    
    # Sort descending by match score
    validated_projects.sort(key=lambda x: x.get("profileMatchScore", 0), reverse=True)
    return validated_projects[:5]

def generate_intelligent_fallback_projects(profile: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Generates intelligent, highly contextualized final-year project blueprints
    customized strictly based on the student's selected interests, skills, experience, and complexity.
    """
    interests = profile.get("interests", ["Artificial Intelligence", "Web Development"])
    skills = profile.get("skills", ["React", "Python", "Node.js"])
    experience = profile.get("experience", "Intermediate")
    complexity = profile.get("complexity", "Moderate")
    
    primary_interest = interests[0] if interests else "Artificial Intelligence"
    secondary_interest = interests[1] if len(interests) > 1 else (interests[0] if interests else "Web Development")
    
    # Base tech selection from student's skills or practical defaults
    tech_base = list(skills) if skills else ["React", "FastAPI", "PostgreSQL", "Google AI"]
    if "Google AI" not in tech_base and "Generative AI" not in tech_base:
        tech_base.append("Google AI Studio")

    projects = [
        {
            "title": f"Context-Aware {primary_interest} Assistance Platform for Final-Year Academia",
            "shortDescription": f"An intelligent full-stack system that combines {primary_interest.lower()} with automated verification to streamline academic workflows and evaluation.",
            "problemStatement": f"Students and educators struggle with fragmented project management and lack personalized, explainable insights during complex development phases.",
            "whyItFits": f"Directly leverages your interest in {primary_interest} and builds on your experience with modern engineering standards without unnecessary infrastructure overhead.",
            "targetUsers": "Undergraduate engineering students, faculty advisors, and departmental evaluation panels",
            "domain": f"{primary_interest} & Productivity",
            "difficulty": complexity,
            "feasibilityScore": 92 if complexity != "Challenging" else 84,
            "innovationScore": 88 if complexity != "Simple" else 78,
            "finalYearSuitabilityScore": 94,
            "estimatedScope": "4 Months (4 structured sprint milestones)",
            "techStack": tech_base[:4] + ["REST APIs", "Tailwind CSS"],
            "keyFeatures": [
                "Role-based authenticated dashboards for students and academic mentors",
                f"Explainable AI recommendation engine powered by {primary_interest}",
                "Automated milestone tracking with automated checklist generation",
                "Exportable evaluation dossier with presentation slide previews"
            ],
            "uniqueValue": "Combines practical utility with rigorous academic evaluation metrics, making it highly defensible in a viva.",
            "possibleChallenges": [
                "Handling response latency in AI pipelines (mitigated via asynchronous job queues)",
                "Designing a clean normalized database schema for multi-tenant users"
            ]
        },
        {
            "title": f"Intelligent Multimodal {secondary_interest} Analytics & Monitoring System",
            "shortDescription": f"A responsive, secure analytics platform offering real-time data ingestion, predictive modeling, and role-specific visualizations.",
            "problemStatement": f"Existing open-source tools in {secondary_interest.lower()} fail to provide actionable root-cause analysis and automated reporting for small-to-medium deployments.",
            "whyItFits": f"Combines your technical proficiency with practical {secondary_interest} requirements, giving you a strong architectural narrative for your final presentation.",
            "targetUsers": "Technical project leads, domain researchers, and departmental administrators",
            "domain": f"{secondary_interest} & Data Intelligence",
            "difficulty": complexity,
            "feasibilityScore": 89,
            "innovationScore": 86,
            "finalYearSuitabilityScore": 91,
            "estimatedScope": "3.5 - 4.5 Months",
            "techStack": [tech_base[0] if tech_base else "React", "Python", "FastAPI", "MongoDB", "Tailwind CSS"],
            "keyFeatures": [
                "Interactive telemetry and metrics dashboard with custom filters",
                "Predictive anomaly detection algorithm with threshold alerts",
                "Automated PDF/Slide deck report synthesis with speaker notes",
                "Secure JWT token-based authentication and role-based permissions"
            ],
            "uniqueValue": "Shows full-stack proficiency from low-level data processing to high-fidelity frontend data visualization.",
            "possibleChallenges": [
                "Managing real-time chart rendering performance on large datasets",
                "Ensuring high test coverage across asynchronous backend endpoints"
            ]
        },
        {
            "title": f"Decentralized or Privacy-Preserving {primary_interest} Audit & Verification Pipeline",
            "shortDescription": f"A lightweight, highly auditable framework ensuring data integrity, compliance checking, and explainable decision logs.",
            "problemStatement": f"Compliance auditing in modern {primary_interest.lower()} applications often lacks tamper-evident proof and accessible verification for third-party examiners.",
            "whyItFits": f"Demonstrates advanced software engineering concepts (security, cryptographic hashing, and automated reporting) tailored to your {experience} level.",
            "targetUsers": "System auditors, academic research compliance officers, and developers",
            "domain": f"Security & {primary_interest}",
            "difficulty": "Moderate" if complexity == "Simple" else complexity,
            "feasibilityScore": 86,
            "innovationScore": 93,
            "finalYearSuitabilityScore": 96,
            "estimatedScope": "4 Months",
            "techStack": ["Python", "FastAPI", "PostgreSQL", "Docker", "REST APIs"],
            "keyFeatures": [
                "Cryptographically signed audit log creation using SHA-256 chain verification",
                "Interactive visual verification explorer for non-technical stakeholders",
                "Automated vulnerability and edge-case testing harness",
                "Comprehensive viva-ready architecture diagrams and deployment guide"
            ],
            "uniqueValue": "Gives external academic examiners concrete mathematical and architectural proofs during project defense.",
            "possibleChallenges": [
                "Optimizing query performance for historical hash chains",
                "Creating intuitive UX for complex cryptographic state verification"
            ]
        }
    ]

    return process_and_score_projects(profile, projects)
