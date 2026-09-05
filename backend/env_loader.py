"""
Environment loader for UltimateStudentSaviour AI.
Loads variables from .env.local and .env into os.environ securely on server start.
Does not overwrite existing process environment variables.
"""

import os

def load_env_file(filepath: str) -> None:
    if not os.path.exists(filepath):
        return
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip("'\"")
                    if key and key not in os.environ:
                        os.environ[key] = val
    except Exception:
        pass

def load_environment() -> None:
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    # Load .env.local first (highest precedence for local secrets), then .env
    load_env_file(os.path.join(base_dir, ".env.local"))
    load_env_file(os.path.join(base_dir, ".env"))
