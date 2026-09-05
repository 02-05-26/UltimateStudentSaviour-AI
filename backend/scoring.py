"""
Scoring and compatibility engine for student profile match scores.
Calculates deterministic scores based on skill alignment, interest coverage, and difficulty fit.
"""

from typing import Dict, Any, List

def calculate_profile_match(profile: Dict[str, Any], project: Dict[str, Any]) -> int:
    """
    Calculates a deterministic Profile Match percentage (0-100%) between a student's profile and a recommended project.
    """
    base_score = 75
    
    # 1. Interest Alignment (up to +15 pts)
    user_interests = [i.lower().strip() for i in profile.get("interests", [])]
    project_domain = str(project.get("domain", "")).lower()
    project_desc = (str(project.get("title", "")) + " " + str(project.get("shortDescription", "")) + " " + str(project.get("whyItFits", ""))).lower()
    
    matched_interests = sum(1 for interest in user_interests if interest in project_domain or interest in project_desc)
    interest_bonus = min(15, matched_interests * 5)
    
    # 2. Skill Alignment (up to +10 pts)
    user_skills = [s.lower().strip() for s in profile.get("skills", [])]
    project_tech = [t.lower().strip() for t in project.get("techStack", [])]
    
    if user_skills and project_tech:
        matched_skills = sum(1 for s in user_skills if any(s in t or t in s for t in project_tech))
        skill_ratio = matched_skills / max(1, len(project_tech))
        skill_bonus = int(skill_ratio * 10)
    else:
        # If no specific skills provided, default moderate fit
        skill_bonus = 5

    # 3. Experience & Difficulty Alignment (up to +5 pts)
    user_exp = profile.get("experience", "Intermediate")
    project_diff = project.get("difficulty", "Moderate")
    
    fit_matrix = {
        ("Beginner", "Simple"): 5,
        ("Beginner", "Moderate"): 2,
        ("Beginner", "Challenging"): -5,
        ("Intermediate", "Simple"): 3,
        ("Intermediate", "Moderate"): 5,
        ("Intermediate", "Challenging"): 3,
        ("Advanced", "Simple"): 1,
        ("Advanced", "Moderate"): 4,
        ("Advanced", "Challenging"): 5,
    }
    difficulty_mod = fit_matrix.get((user_exp, project_diff), 3)

    # 4. Feasibility & Suitability Factor
    feasibility = project.get("feasibilityScore", 85)
    suitability = project.get("finalYearSuitabilityScore", 88)
    quality_mod = int(((feasibility + suitability) / 2 - 80) * 0.2)

    total_score = base_score + interest_bonus + skill_bonus + difficulty_mod + quality_mod
    
    # Clamp to realistic high match range [78, 98]
    return max(78, min(98, total_score))
