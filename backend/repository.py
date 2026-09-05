"""
In-memory mock repository for UltimateStudentSaviour AI projects.
Provides a clean, modular repository interface for CRUD and state operations.
"""
from typing import Dict, Any, List, Optional
import copy
import time

class ProjectRepository:
    """In-memory data store for projects with extensible interface."""

    def __init__(self):
        self._projects: Dict[str, Dict[str, Any]] = {}
        self._seed_sample_data()

    def _seed_sample_data(self):
        sample_id = "p_smart_attendance_sample"
        self._projects[sample_id] = {
            "id": sample_id,
            "title": "Smart AI Attendance & Engagement Platform",
            "shortDescription": "Computer vision and edge AI system for automated classroom attendance and attention analytics.",
            "problemStatement": "Manual attendance is slow and prone to proxy records, while faculty lack actionable engagement feedback.",
            "whyItFits": "Practical computer vision implementation suitable for intermediate students within a 4-month timeline.",
            "targetUsers": "University faculty, academic administrators, and undergraduate students",
            "domain": "Artificial Intelligence & Education",
            "difficulty": "Moderate",
            "feasibilityScore": 90,
            "innovationScore": 86,
            "finalYearSuitabilityScore": 94,
            "estimatedScope": "4 Months",
            "techStack": ["Python", "FastAPI", "React", "OpenCV", "PostgreSQL"],
            "keyFeatures": [
                "Real-time face verification with edge processing",
                "Automated attendance export with CSV/PDF reporting",
                "Interactive faculty analytics dashboard"
            ],
            "uniqueValue": "Combines lightweight edge inference with privacy-first student data protection.",
            "possibleChallenges": [
                "Handling occlusion and low-light classroom environments",
                "Optimizing embedding query latency across large student batches"
            ],
            "saved": True,
            "roadmap": [
                {
                    "name": "Planning",
                    "objective": "Define system requirements and dataset acquisition.",
                    "outcome": "Architecture and data pipelines approved.",
                    "tasks": [
                        {"text": "Setup project repository and virtual environment", "done": True},
                        {"text": "Draft initial technical spec and API schemas", "done": True}
                    ]
                },
                {
                    "name": "UI/UX",
                    "objective": "Build responsive faculty and student views.",
                    "outcome": "Frontend dashboard mockups finalized.",
                    "tasks": [
                        {"text": "Create responsive attendance list and stats cards", "done": True},
                        {"text": "Integrate camera preview and snapshot trigger", "done": False}
                    ]
                },
                {
                    "name": "Backend",
                    "objective": "Implement face detection and verification endpoints.",
                    "outcome": "Core REST APIs responding under 200ms.",
                    "tasks": [
                        {"text": "Build FastAPI endpoint for image ingestion", "done": False},
                        {"text": "Add token-based authentication for teachers", "done": False}
                    ]
                }
            ],
            "evaluation": {
                "overallScore": 89,
                "feasibilityScore": 90,
                "innovationScore": 86,
                "technicalDepthScore": 88,
                "finalYearSuitabilityScore": 94,
                "scopeFitScore": 90,
                "strengths": ["Clear domain relevance", "Practical technology stack"],
                "risks": ["Camera hardware dependencies"],
                "mitigation": ["Provide local webcam fallback testing mode"],
                "recommendation": "Strong final-year project with high viva defensibility."
            },
            "updatedAt": time.time()
        }

    def list_all(self, saved_only: bool = False) -> List[Dict[str, Any]]:
        projects = list(self._projects.values())
        if saved_only:
            projects = [p for p in projects if p.get("saved")]
        # Sort descending by updated timestamp
        return sorted(copy.deepcopy(projects), key=lambda x: x.get("updatedAt", 0), reverse=True)

    def get_by_id(self, project_id: str) -> Optional[Dict[str, Any]]:
        project = self._projects.get(project_id)
        if project:
            return copy.deepcopy(project)
        return None

    def create(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        project = copy.deepcopy(project_data)
        project_id = project.get("id")
        if not project_id:
            project_id = f"p_{int(time.time() * 1000)}"
            project["id"] = project_id
        project["updatedAt"] = time.time()
        self._projects[project_id] = project
        return copy.deepcopy(project)

    def update(self, project_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if project_id not in self._projects:
            return None
        project = self._projects[project_id]
        for k, v in updates.items():
            if k != "id":
                project[k] = copy.deepcopy(v)
        project["updatedAt"] = time.time()
        self._projects[project_id] = project
        return copy.deepcopy(project)

    def delete(self, project_id: str) -> bool:
        if project_id in self._projects:
            del self._projects[project_id]
            return True
        return False

    def toggle_save(self, project_id: str, saved: Optional[bool] = None) -> Optional[Dict[str, Any]]:
        if project_id not in self._projects:
            return None
        project = self._projects[project_id]
        project["saved"] = not project.get("saved", False) if saved is None else bool(saved)
        project["updatedAt"] = time.time()
        return copy.deepcopy(project)

# Global repository instance
repository = ProjectRepository()
