# UltimateStudentSaviour AI

> **"From Project Idea to Final Presentation."**

UltimateStudentSaviour AI is an AI-powered project idea generator, feasibility evaluator, and technical mentor designed specifically for undergraduate and graduate final-year engineering students.

---

## 🚀 Key Implemented Features

## 🚀 Key Implemented Features

1. **Modern SaaS Interface & Student Dashboard**:
   - Clean, light-first student-friendly design with subtle indigo/blue accents.
   - Complete 5-stage core journey: `DISCOVER` → `EVALUATE` → `BUILD` → `MENTOR` → `PRESENT`.
   - **Student Dashboard**: Real-time progress tracker (completed tasks vs total), phase indicators, evaluation scores, and quick defense triggers.

2. **Guided 4-Step Student Profile Wizard**:
   - **Step 1 (Interests)**: Multi-select across 15+ engineering domains with custom interest tags.
   - **Step 2 (Technical Skills)**: Categorized skill selector (Frontend, Backend, Database, AI/ML, Cloud) + custom additions.
   - **Step 3 (Experience & Scope)**: Calibrated options for Experience Level, Complexity, and Format.
   - **Step 4 (Preferences & Review)**: Profile summary review and custom constraint notes.

3. **Secure Server-Side Google Gemini AI Service**:
   - Server-side integration with Google Gemini (`gemini-2.0-flash`, `gemini-1.5-flash`, etc.).
   - **Zero Client-Side Secrets**: API keys are accessed strictly server-side (`GEMINI_API_KEY` or `GOOGLE_AI_API_KEY`).
   - Strict JSON schema validation and sanitization on all responses.

4. **Project Evaluation & Build Blueprint**:
   - Multi-metric evaluation (Feasibility, Innovation, Technical Depth, Final-Year Fit, Scope Fit).
   - Practical software engineering blueprint with architecture, database schemas, API contracts, security considerations, and phased milestone roadmap.

5. **Context-Aware AI Technical Mentor**:
   - Interactive mentor assistant grounded in the student's specific project, architecture blueprint, and task roadmap.

6. **AI Presentation Deck & Mock Viva Assistant**:
   - **AI Presentation Deck**: Generates 10–12 structured defense slides with key bullet points and defense speaker notes.
   - **Mock Viva Assistant**: Generates 15–20 viva questions categorized by difficulty and domain with interactive model answer reveals.

7. **Modular In-Memory Project Repository & REST API**:
   - Modular repository supporting full CRUD (`GET`, `POST`, `PUT`, `DELETE` on `/api/projects`).
   - Seamless synchronization with frontend local state.

---

## 🏗️ Project Architecture

```
ultimatestudentsaviour-ai/
├── index.html                   # Main single-page application entrypoint
├── server.py                    # Python HTTP server & REST API router
├── backend/
│   ├── ai_service.py            # Google Gemini AI transport & fallback engine
│   ├── evaluation.py            # Evaluation, Blueprint, Presentation & Viva logic
│   ├── mentor.py                # Context-grounded AI mentor logic
│   ├── repository.py            # Modular project repository
│   ├── validator.py             # Strict request and response schemas
│   ├── env_loader.py            # Safe environment variable loader
│   └── scoring.py               # Deterministic profile match scoring engine
├── js/
│   ├── app.js                   # SPA router, state manager, and event orchestration
│   ├── config.js                # Centralized brand configuration
│   ├── utils/safe.js            # XSS escaping and HTML safe rendering
│   ├── services/api.js          # Client API client with in-flight duplicate protection
│   └── components/
│       ├── Navbar.js            # Responsive accessible navigation bar
│       ├── HeroSection.js       # Hero section with CTA & product preview
│       ├── GeneratorView.js     # 4-step interactive profile wizard
│       ├── RecommendationsView.js # Recommendation cards grid
│       ├── Part3Views.js        # Project details, Blueprint, Roadmap & Dashboard
│       └── Part5Views.js        # Presentation deck & Mock Viva views
└── tests/
    ├── test_backend.py          # Part 1-2 AI service & scoring tests
    ├── test_part3.py            # Evaluation & blueprint unit tests
    ├── test_part3_endpoints.py  # Part 3 HTTP contract tests
    ├── test_part4.py            # Mentor unit and endpoint tests
    ├── test_part5.py            # Presentation & Viva contract tests
    └── test_part6.py            # Repository & CRUD endpoint tests
```

---

## 🛠️ Getting Started

### 1. Prerequisites
- Python 3.8+ (Standard library only — zero external pip dependencies required)

### 2. Configure Google AI (Optional)
To use live Google Gemini AI generation:
```bash
# Set in .env or .env.local:
GEMINI_API_KEY="your-gemini-api-key"
```
*(If no key is provided, the platform automatically runs in intelligent fallback mode for full offline demonstration).*

### 3. Run the Server
```bash
python server.py
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser.

### 4. Run Automated Tests
```bash
python -m unittest discover tests
```

---

## Netlify deployment

The local application continues to run with `python server.py`. Netlify serves the static frontend and runs the production API through `netlify/functions/api.mjs`; it preserves the frontend's existing same-origin `/api/*` requests, including generation, evaluation, blueprint, improvement, mentor, presentation, viva, CRUD, and health routes. Project CRUD uses Netlify Blobs in production, so it is not lost when a serverless instance is replaced; the existing browser dashboard remains local-first.

1. Connect this repository to Netlify with the repository root as the base directory.
2. Keep the build settings from `netlify.toml`: the build command is `node scripts/netlify-build.mjs && node --check netlify/functions/api.mjs`, the publish directory is `dist`, and the functions directory is `netlify/functions`.
3. In **Project configuration → Environment variables**, add `GEMINI_API_KEY` with the existing Gemini key. `GOOGLE_AI_API_KEY` is supported as a compatibility alternative, but configure only one. Ensure the variable is available to **Functions** at runtime.
4. Trigger a new production deploy after saving the variable. Do not place the key in `netlify.toml`, client-side JavaScript, or any committed `.env` file.
5. After deployment, verify `https://YOUR-SITE.netlify.app/api/health` returns JSON and then generate a project from the application.

The Netlify function uses the production Gemini REST API with the same current model fallback order as the local integration. It never returns demo or generated fallback data when Gemini is unavailable: failures are valid JSON responses with a safe error message.
