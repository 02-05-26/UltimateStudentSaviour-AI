/**
 * Netlify production adapter for UltimateStudentSaviour AI.
 * It preserves the browser's existing /api/* contract while keeping Gemini
 * credentials exclusively in the Netlify Function runtime.
 */

const MAX_BODY_BYTES = 100_000;
const REQUEST_WINDOW_MS = 60_000;
const REQUEST_LIMIT = 15;
const requestLog = new Map();
const GEMINI_MODELS = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
const REQUIRED_PROJECT_FIELDS = ['title', 'shortDescription', 'problemStatement', 'whyItFits', 'targetUsers', 'domain', 'difficulty', 'feasibilityScore', 'innovationScore', 'finalYearSuitabilityScore', 'estimatedScope', 'techStack', 'keyFeatures', 'uniqueValue', 'possibleChallenges'];
const VALID_EXPERIENCES = new Set(['Beginner', 'Intermediate', 'Advanced']);
const VALID_COMPLEXITIES = new Set(['Simple', 'Moderate', 'Challenging']);
const VALID_PROJECT_TYPES = new Set(['Individual', 'Team', 'Either']);
// The browser keeps its saved-project dashboard locally. Netlify Blobs gives
// production CRUD a durable backing store; the map keeps direct local handler
// tests dependency-free and never introduces seeded/demo projects.
const projectRepository = new Map();

class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

const json = (data, status = 200) => Response.json(data, {
  status,
  headers: { 'Cache-Control': 'no-store', 'Content-Type': 'application/json; charset=utf-8' },
});
const failure = (status, error) => json({ success: false, error }, status);
const nonEmptyText = (value, max = 10_000) => typeof value === 'string' && value.trim() && value.length <= max;
const strings = (value, field, required = true) => {
  if (!Array.isArray(value) || (required && value.length === 0) || value.some(item => !nonEmptyText(item, 3_000))) throw new ApiError(422, `Invalid ${field} response.`);
  return value.map(item => item.trim());
};

function validateProfile(profile) {
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) throw new ApiError(400, 'Invalid request format. Expected a student profile.');
  if (!Array.isArray(profile.interests) || profile.interests.length === 0 || profile.interests.some(item => !nonEmptyText(item, 200))) throw new ApiError(400, 'Choose at least one valid interest so we can personalize your project ideas.');
  if (!VALID_EXPERIENCES.has(profile.experience)) throw new ApiError(400, 'Please select your experience level.');
  if (!VALID_COMPLEXITIES.has(profile.complexity)) throw new ApiError(400, 'Please select your preferred project complexity.');
  if (!VALID_PROJECT_TYPES.has(profile.projectType)) throw new ApiError(400, 'Please select your preferred project type.');
  if (profile.skills !== undefined && (!Array.isArray(profile.skills) || profile.skills.some(item => !nonEmptyText(item, 200)))) throw new ApiError(400, 'Skills must be a list of valid text values.');
  if (profile.customPreferences !== undefined && (!nonEmptyText(profile.customPreferences, 1_000) && profile.customPreferences !== '')) throw new ApiError(400, 'Custom preferences must be text under 1000 characters.');
  return profile;
}

function validateProject(project) {
  if (!project || typeof project !== 'object' || Array.isArray(project)) throw new ApiError(400, 'Project data is incomplete or invalid.');
  for (const field of REQUIRED_PROJECT_FIELDS) if (!(field in project)) throw new ApiError(400, 'Project data is incomplete or invalid.');
  for (const field of ['title', 'shortDescription', 'problemStatement', 'whyItFits', 'targetUsers', 'domain', 'estimatedScope', 'uniqueValue']) if (!nonEmptyText(project[field], 5_000)) throw new ApiError(400, 'Project data is incomplete or invalid.');
  if (!VALID_COMPLEXITIES.has(project.difficulty)) throw new ApiError(400, 'Project data is incomplete or invalid.');
  for (const field of ['feasibilityScore', 'innovationScore', 'finalYearSuitabilityScore']) {
    const value = Number(project[field]);
    if (!Number.isFinite(value) || value < 0 || value > 100) throw new ApiError(400, 'Project data is incomplete or invalid.');
  }
  for (const field of ['techStack', 'keyFeatures', 'possibleChallenges']) if (!Array.isArray(project[field]) || project[field].length === 0 || project[field].some(item => !nonEmptyText(item, 3_000))) throw new ApiError(400, 'Project data is incomplete or invalid.');
  return { ...project, techStack: project.techStack.map(item => item.trim()), keyFeatures: project.keyFeatures.map(item => item.trim()), possibleChallenges: project.possibleChallenges.map(item => item.trim()) };
}

function validateProjectId(projectId) {
  if (typeof projectId !== 'string' || !projectId.trim()) throw new ApiError(400, 'Project ID must be a non-empty string.');
  const cleanId = projectId.trim();
  if (cleanId.length > 100 || !/^[A-Za-z0-9_-]+$/.test(cleanId)) throw new ApiError(400, 'Invalid Project ID format.');
  return cleanId;
}

function validateProjectUpsert(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new ApiError(400, 'Invalid request payload. Expected JSON object.');
  if ('title' in payload && !nonEmptyText(payload.title, 5_000)) throw new ApiError(400, 'Project title must be a non-empty string.');
  return payload;
}

async function projectStore() {
  // SITE_ID is present at Netlify Function runtime. Avoid importing the
  // platform-only package when the existing local Python workflow is used.
  if (!process.env.SITE_ID) return null;
  const { getStore } = await import('@netlify/blobs');
  return getStore({ name: 'ultimate-student-saviour-projects', consistency: 'strong' });
}

const projectStorageKey = id => `projects/${id}`;

async function getProject(id) {
  const store = await projectStore();
  if (store) return await store.get(projectStorageKey(id), { type: 'json', consistency: 'strong' });
  const project = projectRepository.get(id);
  return project ? structuredClone(project) : null;
}

async function createProject(payload) {
  const project = structuredClone(payload);
  const id = project.id ? validateProjectId(project.id) : `p_${Date.now().toString(36)}`;
  project.id = id;
  project.updatedAt = Date.now() / 1000;
  const store = await projectStore();
  if (store) await store.setJSON(projectStorageKey(id), project);
  else projectRepository.set(id, project);
  return structuredClone(project);
}

async function updateProject(id, payload) {
  const current = await getProject(id);
  if (!current) return null;
  const updated = { ...current, ...structuredClone(payload), id, updatedAt: Date.now() / 1000 };
  const store = await projectStore();
  if (store) await store.setJSON(projectStorageKey(id), updated);
  else projectRepository.set(id, updated);
  return structuredClone(updated);
}

async function listProjects() {
  const store = await projectStore();
  let projects;
  if (store) {
    const { blobs } = await store.list({ prefix: 'projects/' });
    projects = (await Promise.all(blobs.map(blob => store.get(blob.key, { type: 'json', consistency: 'strong' })))).filter(Boolean);
  } else {
    projects = [...projectRepository.values()].map(project => structuredClone(project));
  }
  return projects.sort((left, right) => (right.updatedAt || 0) - (left.updatedAt || 0));
}

async function deleteProject(id) {
  const store = await projectStore();
  if (store) {
    if (!await getProject(id)) return false;
    await store.delete(projectStorageKey(id));
    return true;
  }
  return projectRepository.delete(id);
}

function profileMatch(profile, project) {
  const interests = profile.interests.map(item => item.toLowerCase().trim());
  const projectText = `${project.domain} ${project.title} ${project.shortDescription} ${project.whyItFits}`.toLowerCase();
  const interestBonus = Math.min(15, interests.filter(item => projectText.includes(item)).length * 5);
  const skills = (profile.skills || []).map(item => item.toLowerCase().trim());
  const stack = project.techStack.map(item => item.toLowerCase().trim());
  const skillBonus = skills.length && stack.length ? Math.floor((skills.filter(skill => stack.some(tech => tech.includes(skill) || skill.includes(tech))).length / stack.length) * 10) : 5;
  const matrix = { 'Beginner|Simple': 5, 'Beginner|Moderate': 2, 'Beginner|Challenging': -5, 'Intermediate|Simple': 3, 'Intermediate|Moderate': 5, 'Intermediate|Challenging': 3, 'Advanced|Simple': 1, 'Advanced|Moderate': 4, 'Advanced|Challenging': 5 };
  const quality = Math.floor((((Number(project.feasibilityScore) + Number(project.finalYearSuitabilityScore)) / 2) - 80) * 0.2);
  return Math.max(78, Math.min(98, 75 + interestBonus + skillBonus + (matrix[`${profile.experience}|${project.difficulty}`] ?? 3) + quality));
}

function apiKey() { return (process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || '').trim(); }
function cleanGeminiText(text) { return String(text || '').trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim(); }
async function callGeminiJson(systemPrompt, userPrompt) {
  const key = apiKey();
  if (!key) throw new ApiError(503, 'Gemini is not configured for this deployment. Please try again later.');
  const payload = { contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }], generationConfig: { temperature: 0.4, topP: 0.9, responseMimeType: 'application/json' } };
  for (const model of GEMINI_MODELS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: controller.signal });
      if (!response.ok) continue;
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return JSON.parse(cleanGeminiText(text));
    } catch { /* Try the next current Gemini model without logging credentials or URLs. */ }
    finally { clearTimeout(timeout); }
  }
  throw new ApiError(503, 'Gemini is temporarily unavailable. Please try again.');
}

function validateEvaluation(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new ApiError(422, 'Invalid evaluation response.');
  const output = {};
  for (const field of ['feasibilityScore', 'innovationScore', 'technicalDepthScore', 'finalYearSuitabilityScore', 'scopeFitScore', 'overallScore']) {
    const value = Number(data[field]);
    if (!Number.isFinite(value) || value < 0 || value > 100) throw new ApiError(422, `Invalid ${field} response.`);
    output[field] = Math.round(value);
  }
  for (const field of ['strengths', 'risks', 'mitigation']) output[field] = strings(data[field], field);
  if (!nonEmptyText(data.recommendation)) throw new ApiError(422, 'Invalid recommendation response.');
  return { ...output, recommendation: data.recommendation.trim() };
}

const BLUEPRINT_TEXT_FIELDS = ['projectSummary', 'problemDefinition', 'proposedSolution', 'targetUsers', 'systemArchitecture', 'databaseDesign', 'apiPlan', 'aiIntegrationPlan', 'testingStrategy', 'deploymentPlan', 'securityConsiderations', 'futureScope'];
const BLUEPRINT_LIST_FIELDS = ['functionalRequirements', 'nonFunctionalRequirements', 'mvpFeatures', 'optionalFeatures', 'recommendedTechStack', 'developmentPhases', 'risksAndMitigations'];
function validateBlueprint(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new ApiError(422, 'Invalid blueprint response.');
  const output = {};
  for (const field of BLUEPRINT_TEXT_FIELDS) {
    let value = data[field];
    if (field === 'targetUsers' && Array.isArray(value)) value = value.join(', ');
    if (!nonEmptyText(value)) throw new ApiError(422, `Invalid ${field} response.`);
    output[field] = value.trim();
  }
  for (const field of BLUEPRINT_LIST_FIELDS) {
    let value = data[field];
    if (field === 'risksAndMitigations' && Array.isArray(value) && value.length && value.every(item => item && typeof item === 'object' && !Array.isArray(item))) {
      value = value.map(item => {
        if (!nonEmptyText(item.risk) || !nonEmptyText(item.mitigation)) throw new ApiError(422, 'Invalid risksAndMitigations response.');
        return `Risk: ${item.risk.trim()} Mitigation: ${item.mitigation.trim()}`;
      });
    }
    output[field] = strings(value, field);
  }
  return output;
}

function validateImprovement(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new ApiError(422, 'Invalid improvement response.');
  const output = {};
  for (const field of ['whatToChange', 'why', 'scopeRecommendation', 'expectedImprovement']) {
    if (!nonEmptyText(data[field])) throw new ApiError(422, `Invalid ${field} response.`);
    output[field] = data[field].trim();
  }
  for (const field of ['suggestedFeatures', 'technologyChanges', 'risks']) output[field] = strings(data[field], field);
  return output;
}

function validatePresentation(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new ApiError(422, 'Invalid presentation response.');
  if (!nonEmptyText(data.title) || !nonEmptyText(data.subtitle)) throw new ApiError(422, 'Invalid presentation response.');
  if (!Array.isArray(data.slides) || !data.slides.length) throw new ApiError(422, 'Invalid slides response.');
  const slides = data.slides.map((slide, index) => {
    if (!slide || typeof slide !== 'object' || Array.isArray(slide) || !nonEmptyText(slide.title) || !nonEmptyText(slide.speakerNotes)) throw new ApiError(422, `Invalid slide at index ${index}.`);
    const slideNumber = Number.parseInt(slide.slideNumber, 10);
    return {
      slideNumber: Number.isFinite(slideNumber) ? slideNumber : index + 1,
      title: slide.title.trim(),
      keyPoints: strings(slide.keyPoints, `keyPoints in slide ${index}`),
      speakerNotes: slide.speakerNotes.trim(),
    };
  });
  return { title: data.title.trim(), subtitle: data.subtitle.trim(), slides };
}

function validateViva(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data) || !Array.isArray(data.questions) || !data.questions.length) throw new ApiError(422, 'Invalid questions response.');
  return {
    questions: data.questions.map((question, index) => {
      if (!question || typeof question !== 'object' || Array.isArray(question) || !nonEmptyText(question.question) || !nonEmptyText(question.answer) || !nonEmptyText(question.difficulty) || !nonEmptyText(question.category)) throw new ApiError(422, `Invalid question at index ${index}.`);
      return { question: question.question.trim(), answer: question.answer.trim(), difficulty: question.difficulty.trim(), category: question.category.trim() };
    }),
  };
}

function validateRoadmap(roadmap) {
  if (!Array.isArray(roadmap) || roadmap.length > 20) throw new ApiError(400, 'Roadmap context is invalid.');
  for (const phase of roadmap) {
    if (!phase || typeof phase !== 'object' || !nonEmptyText(phase.name, 500) || !Array.isArray(phase.tasks) || phase.tasks.some(task => !task || typeof task !== 'object' || !nonEmptyText(task.text, 3_000) || typeof task.done !== 'boolean')) throw new ApiError(400, 'Roadmap context is invalid.');
  }
  return roadmap;
}

function buildMentorContext(projectId, project, blueprint, roadmap) {
  const tasks = roadmap.flatMap(phase => phase.tasks);
  const completed = tasks.filter(task => task.done).length;
  return { projectId, title: project.title, description: project.shortDescription, problemStatement: project.problemStatement, domain: project.domain, difficulty: project.difficulty, techStack: project.techStack, keyFeatures: project.keyFeatures, solution: blueprint?.proposedSolution ?? null, blueprint, blueprintAvailability: blueprint ? 'available' : 'unavailable', roadmap, roadmapAvailability: roadmap.length ? 'available' : 'unavailable', progress: { completedTasks: completed, remainingTasks: tasks.length - completed, totalTasks: tasks.length, nextRecommendedTask: tasks.find(task => !task.done)?.text ?? null } };
}
function validateMentorRequest(payload) {
  const profile = validateProfile(payload?.profile);
  const project = validateProject(payload?.project);
  const projectId = payload?.projectId;
  if (typeof projectId !== 'string' || !projectId.startsWith('p_') || projectId.length > 100 || project.id !== projectId) throw new ApiError(400, 'Selected project context is unavailable. Please reopen the project.');
  if (!nonEmptyText(payload.question, 2_000)) throw new ApiError(400, 'Ask a question between 1 and 2000 characters.');
  const history = payload.history ?? [];
  if (!Array.isArray(history) || history.length > 6 || history.some(message => !message || !['user', 'assistant'].includes(message.role) || !nonEmptyText(message.content, 2_000))) throw new ApiError(400, 'Conversation history is invalid.');
  const blueprint = payload.blueprint === null || payload.blueprint === undefined ? null : validateBlueprint(payload.blueprint);
  const roadmap = validateRoadmap(payload.roadmap ?? []);
  return { profile, project, projectId, question: payload.question.trim(), history: history.slice(-6), blueprint, roadmap };
}
function validateMentorResponse(data, title) {
  if (!data || typeof data !== 'object' || Array.isArray(data) || !nonEmptyText(data.answer)) throw new ApiError(422, 'Invalid mentor response.');
  if (!data.answer.toLowerCase().includes(title.toLowerCase())) throw new ApiError(422, 'Mentor response was not grounded in the selected project. Please retry.');
  return { answer: data.answer.trim(), nextSteps: strings(data.nextSteps, 'nextSteps', false), relevantRoadmapTasks: strings(data.relevantRoadmapTasks, 'relevantRoadmapTasks', false), warnings: strings(data.warnings, 'warnings', false) };
}

function allowRequest(request) {
  const client = request.headers.get('x-nf-client-connection-ip') || request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const requests = (requestLog.get(client) || []).filter(point => now - point < REQUEST_WINDOW_MS);
  if (requests.length >= REQUEST_LIMIT) return false;
  requestLog.set(client, [...requests, now]);
  return true;
}
async function payloadFrom(request) {
  const size = Number(request.headers.get('content-length') || 0);
  if (size > MAX_BODY_BYTES) throw new ApiError(400, 'Invalid payload size.');
  const text = await request.text();
  if (!text || new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) throw new ApiError(400, 'Invalid payload size.');
  try { return JSON.parse(text); } catch { throw new ApiError(400, 'Malformed JSON request.'); }
}

async function generate(profile) {
  const prompt = `Generate 3 to 4 practical final-year project ideas for this student profile: ${JSON.stringify(profile)}. Return ONLY a JSON array. Each item must contain title, shortDescription, problemStatement, whyItFits, targetUsers, domain, difficulty (Simple, Moderate, or Challenging), feasibilityScore (0-100), innovationScore (0-100), finalYearSuitabilityScore (0-100), estimatedScope, techStack (array), keyFeatures (array), uniqueValue, and possibleChallenges (array).`;
  const response = await callGeminiJson('You are a senior computer science project mentor. Produce realistic, buildable project ideas; do not use markdown.', prompt);
  const projects = Array.isArray(response) ? response : response?.projects;
  if (!Array.isArray(projects) || !projects.length) throw new ApiError(422, 'We could not generate project ideas. Please adjust your interests or complexity.');
  const validated = projects.map(validateProject).map(project => ({ ...project, profileMatchScore: profileMatch(profile, project) })).sort((a, b) => b.profileMatchScore - a.profileMatchScore).slice(0, 5);
  return { success: true, projects: validated, total: validated.length, aiProvider: 'Google Gemini AI' };
}
async function evaluate(profile, project) {
  const response = await callGeminiJson('You are a final-year project mentor. Return ONLY JSON with feasibilityScore, innovationScore, technicalDepthScore, finalYearSuitabilityScore, scopeFitScore, overallScore (all 0-100), strengths (array), risks (array), mitigation (array), recommendation (string).', JSON.stringify({ profile, project }));
  return validateEvaluation(response);
}
async function blueprint(profile, project) {
  const response = await callGeminiJson('You are a senior software architect. Return ONLY JSON containing projectSummary, problemDefinition, proposedSolution, targetUsers, functionalRequirements, nonFunctionalRequirements, mvpFeatures, optionalFeatures, recommendedTechStack, systemArchitecture, databaseDesign, apiPlan, aiIntegrationPlan, developmentPhases, testingStrategy, deploymentPlan, securityConsiderations, risksAndMitigations, futureScope. Keep scope practical for a final-year student.', JSON.stringify({ profile, project }));
  return validateBlueprint(response);
}
async function improve(profile, project, concern) {
  if (!nonEmptyText(concern, 1_000)) throw new ApiError(400, 'Describe your concern in 1 to 1000 characters.');
  const response = await callGeminiJson('You are a final-year mentor. Return ONLY JSON with whatToChange, why, suggestedFeatures, technologyChanges, scopeRecommendation, risks, expectedImprovement. Keep advice practical.', JSON.stringify({ profile, project, concern: concern.trim() }));
  return validateImprovement(response);
}
async function presentation(profile, project) {
  const response = await callGeminiJson('You are a senior technical mentor. Generate an academic final-year project presentation based strictly on the provided project context. Do NOT invent real results, statistics, or users if the project is not implemented yet; use expected results. Return ONLY JSON with title, subtitle, and slides. Each slide must have slideNumber (integer), title, keyPoints (array of strings), and speakerNotes. Generate approximately 10-12 slides following the standard academic flow: Title, Problem Statement, Motivation, Limitations, Solution, Features, Tech Stack, Architecture, Roadmap/Implementation, Expected Results, Future Scope, Conclusion.', JSON.stringify({ profile, project }));
  return validatePresentation(response);
}
async function viva(profile, project) {
  const response = await callGeminiJson('You are an academic examiner conducting a viva for a final-year engineering project. Generate approximately 15-20 viva questions based strictly on the provided project context. Cover project overview, problem, solution, tech choices, architecture, DB, APIs, Gemini/AI, security, testing, scalability, limitations, and future scope. Answers must be concise, technically correct, and understandable to a final-year student. Return ONLY JSON with a questions array. Each question object must have question, answer, difficulty (Easy/Medium/Hard), and category.', JSON.stringify({ profile, project }));
  return validateViva(response);
}
async function mentor(request) {
  const selected = validateMentorRequest(request);
  const selectedProject = buildMentorContext(selected.projectId, selected.project, selected.blueprint, selected.roadmap);
  const response = await callGeminiJson('You are a practical final-year project mentor. Ground every answer ONLY in selectedProject. Start answer by naming selectedProject.title exactly. Never substitute examples or invent a different project. Do not mention technologies outside selectedProject.techStack unless clearly labelled optional. If blueprintAvailability or roadmapAvailability is unavailable, explicitly say that project data is unavailable instead of inventing it. Return ONLY JSON with answer, nextSteps, relevantRoadmapTasks, warnings. Do not produce HTML, secrets, or executable code.', JSON.stringify({ selectedProject, profile: selected.profile, recentConversation: selected.history, studentQuestion: selected.question }));
  return validateMentorResponse(response, selected.project.title);
}

export default async function handler(request) {
  try {
    const path = new URL(request.url).pathname.replace(/\/$/, '') || '/';
    if (path === '/api/health' && request.method === 'GET') return json({ status: 'healthy', appName: 'UltimateStudentSaviour AI', aiMode: apiKey() ? 'Google Gemini API (Active)' : 'Gemini API (Not Configured)', hasGoogleApiKey: Boolean(apiKey()) });
    if (!path.startsWith('/api/')) return failure(404, 'Endpoint not found.');
    if (request.method === 'OPTIONS') return new Response(null, { status: 200, headers: { Allow: 'GET, POST, PUT, DELETE, OPTIONS' } });

    if (path === '/api/projects' && request.method === 'GET') {
      const projects = await listProjects();
      return json({ success: true, projects, total: projects.length });
    }
    if (path.startsWith('/api/projects/')) {
      const projectId = validateProjectId(path.slice('/api/projects/'.length));
      if (request.method === 'GET') {
        const project = await getProject(projectId);
        return project ? json({ success: true, project }) : failure(404, 'Project not found.');
      }
      if (request.method === 'PUT') {
        const project = await updateProject(projectId, validateProjectUpsert(await payloadFrom(request)));
        return project ? json({ success: true, project }) : failure(404, 'Project not found.');
      }
      if (request.method === 'DELETE') {
        if (!await deleteProject(projectId)) return failure(404, 'Project not found.');
        return json({ success: true, deleted: projectId });
      }
      return failure(405, 'Method not allowed.');
    }
    if (path === '/api/projects') {
      if (request.method !== 'POST') return failure(405, 'Method not allowed.');
      return json({ success: true, project: await createProject(validateProjectUpsert(await payloadFrom(request))) }, 201);
    }
    if (request.method !== 'POST') return failure(405, 'Method not allowed.');
    if (!allowRequest(request)) return failure(429, 'Too many AI requests. Please wait a minute and try again.');
    const payload = await payloadFrom(request);
    if (path === '/api/generate-projects') return json(await generate(validateProfile(payload)));
    if (path === '/api/evaluate-project') return json({ success: true, data: await evaluate(validateProfile(payload.profile), validateProject(payload.project)) });
    if (path === '/api/build-blueprint') return json({ success: true, data: await blueprint(validateProfile(payload.profile), validateProject(payload.project)) });
    if (path === '/api/improve-project') return json({ success: true, data: await improve(validateProfile(payload.profile), validateProject(payload.project), payload.concern) });
    if (path === '/api/generate-presentation') return json({ success: true, data: await presentation(validateProfile(payload.profile), validateProject(payload.project)) });
    if (path === '/api/generate-viva') return json({ success: true, data: await viva(validateProfile(payload.profile), validateProject(payload.project)) });
    if (path === '/api/mentor') return json({ success: true, data: await mentor(payload) });
    return failure(404, 'Endpoint not found.');
  } catch (error) {
    if (error instanceof ApiError) return failure(error.status, error.message);
    return failure(500, 'This API operation is temporarily unavailable. Please try again.');
  }
}

export const config = { path: '/api/*' };
export const __testables = { validateBlueprint, validateMentorRequest, buildMentorContext, validatePresentation, validateViva, projectRepository };
