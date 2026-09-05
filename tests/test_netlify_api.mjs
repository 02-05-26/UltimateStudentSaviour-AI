import assert from 'node:assert/strict';
import handler, { config, __testables } from '../netlify/functions/api.mjs';

const profile = {
  interests: ['Artificial Intelligence', 'Education'],
  skills: ['Python', 'React'],
  experience: 'Intermediate',
  complexity: 'Moderate',
  projectType: 'Individual',
};

const project = {
  id: 'p_campus_attendance_netlify',
  title: 'Campus Smart Attendance AI — NETLIFY TEST',
  shortDescription: 'Privacy-aware attendance verification for campus classrooms.',
  problemStatement: 'Manual attendance is slow and vulnerable to proxy records.',
  whyItFits: 'Combines an achievable web workflow with applied computer vision.',
  targetUsers: 'Faculty and students',
  domain: 'Artificial Intelligence & Education',
  difficulty: 'Moderate',
  feasibilityScore: 90,
  innovationScore: 86,
  finalYearSuitabilityScore: 93,
  estimatedScope: 'Four months',
  techStack: ['Python', 'FastAPI', 'React', 'OpenCV', 'PostgreSQL'],
  keyFeatures: ['Face-verification attendance', 'Faculty analytics', 'CSV export'],
  uniqueValue: 'Privacy-conscious attendance verification with useful faculty insights.',
  possibleChallenges: ['Low-light classrooms'],
};

const blueprint = {
  projectSummary: 'Attendance verification for classrooms.', problemDefinition: 'Manual attendance is error-prone.', proposedSolution: 'A consent-aware verification workflow.', targetUsers: 'Faculty and students',
  functionalRequirements: ['Capture attendance'], nonFunctionalRequirements: ['Protect student data'], mvpFeatures: ['Attendance capture'], optionalFeatures: ['Analytics'], recommendedTechStack: ['Python'],
  systemArchitecture: 'React client to FastAPI service.', databaseDesign: 'PostgreSQL attendance tables.', apiPlan: 'Attendance and report endpoints.', aiIntegrationPlan: 'OpenCV verification service.', developmentPhases: ['Plan', 'Build'], testingStrategy: 'Unit and integration tests.', deploymentPlan: 'Deploy service securely.', securityConsiderations: 'Minimize and protect biometric data.', risksAndMitigations: ['Risk: low light Mitigation: validate capture quality'], futureScope: 'Add more campuses.',
};

const evaluation = { feasibilityScore: 90, innovationScore: 86, technicalDepthScore: 88, finalYearSuitabilityScore: 93, scopeFitScore: 89, overallScore: 89, strengths: ['Practical'], risks: ['Consent handling'], mitigation: ['Use explicit consent'], recommendation: 'Proceed with a privacy-first MVP.' };
const improvement = { whatToChange: 'Add consent flows.', why: 'Privacy is central.', suggestedFeatures: ['Consent record'], technologyChanges: ['None'], scopeRecommendation: 'Keep the MVP focused.', risks: ['Scope growth'], expectedImprovement: 'A clearer deployment story.' };
const presentation = { title: project.title, subtitle: 'Final Year Project Defense', slides: [{ slideNumber: 1, title: 'Overview', keyPoints: ['Problem', 'Solution'], speakerNotes: 'Introduce the project.' }] };
const viva = { questions: [{ question: 'How is consent recorded?', answer: 'The system stores a consent status before enrollment.', difficulty: 'Medium', category: 'Security' }] };

const responseFor = requestText => {
  if (requestText.includes('selectedProject')) return { answer: `${project.title}: start by defining the attendance data flow.`, nextSteps: ['Create the data model'], relevantRoadmapTasks: ['Plan'], warnings: ['Get student consent.'] };
  if (requestText.includes('projectSummary')) return blueprint;
  if (requestText.includes('technicalDepthScore')) return evaluation;
  if (requestText.includes('whatToChange')) return improvement;
  if (requestText.includes('slides')) return presentation;
  if (requestText.includes('questions array')) return viva;
  if (requestText.includes('Generate 3 to 4 practical')) return [project];
  throw new Error('Unexpected Gemini prompt');
};

const invoke = async (path, { method = 'POST', body } = {}) => {
  const request = new Request(`https://example.netlify.app${path}`, {
    method,
    headers: body ? { 'content-type': 'application/json', 'x-forwarded-for': `test-${Math.random()}` } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const response = await handler(request);
  return { response, body: await response.json() };
};

const originalFetch = globalThis.fetch;
const originalKey = process.env.GEMINI_API_KEY;
const originalSiteId = process.env.SITE_ID;
process.env.GEMINI_API_KEY = 'netlify-test-only';
delete process.env.SITE_ID;
const capturedGeminiPrompts = [];
globalThis.fetch = async (_url, init) => {
  const text = JSON.parse(init.body).contents[0].parts[0].text;
  capturedGeminiPrompts.push(text);
  return Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify(responseFor(text)) }] } }] });
};

try {
  assert.equal(config.path, '/api/*', 'The function must preserve the existing /api/* URLs.');

  let result = await invoke('/api/health', { method: 'GET' });
  assert.equal(result.response.status, 200);
  assert.equal(result.body.status, 'healthy');
  assert.equal(JSON.stringify(result.body).includes('netlify-test-only'), false, 'Health must never return the key.');

  result = await invoke('/api/projects', { body: project });
  assert.equal(result.response.status, 201);
  assert.equal(result.body.project.id, project.id);
  result = await invoke(`/api/projects/${project.id}`, { method: 'GET' });
  assert.equal(result.body.project.title, project.title);
  result = await invoke(`/api/projects/${project.id}`, { method: 'PUT', body: { title: 'Campus Smart Attendance AI — UPDATED' } });
  assert.equal(result.body.project.title, 'Campus Smart Attendance AI — UPDATED');
  result = await invoke(`/api/projects/${project.id}`, { method: 'DELETE' });
  assert.equal(result.body.deleted, project.id);

  result = await invoke('/api/generate-projects', { body: profile });
  assert.equal(result.response.status, 200);
  assert.equal(result.body.projects[0].title, project.title);

  for (const [path, expected] of [
    ['/api/evaluate-project', evaluation],
    ['/api/build-blueprint', blueprint],
    ['/api/improve-project', improvement],
    ['/api/generate-presentation', presentation],
    ['/api/generate-viva', viva],
  ]) {
    const body = path === '/api/improve-project' ? { profile, project, concern: 'How can I improve privacy?' } : { profile, project };
    result = await invoke(path, { body });
    assert.equal(result.response.status, 200, `${path} should return JSON success.`);
    assert.deepEqual(result.body.data, expected);
  }

  result = await invoke('/api/mentor', {
    body: {
      profile, projectId: project.id, project, blueprint,
      roadmap: [{ name: 'Planning', tasks: [{ text: 'Create the data model', done: false }] }],
      question: 'How do I start?', history: [],
    },
  });
  assert.equal(result.response.status, 200);
  assert.match(result.body.data.answer, new RegExp(project.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  const mentorPrompt = capturedGeminiPrompts.at(-1);
  assert.match(mentorPrompt, /Campus Smart Attendance AI — NETLIFY TEST/);
  assert.match(mentorPrompt, /FastAPI/);
  assert.match(mentorPrompt, /Create the data model/);
  assert.equal(mentorPrompt.includes('Intelligent Codebase Documentation Generator'), false);

  result = await invoke('/api/does-not-exist', { body: {} });
  assert.equal(result.response.status, 404);
  assert.equal(result.body.success, false, 'Unknown routes must still return JSON.');

  console.log('Netlify API contract checks passed.');
} finally {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = originalKey;
  if (originalSiteId === undefined) delete process.env.SITE_ID;
  else process.env.SITE_ID = originalSiteId;
  __testables.projectRepository.clear();
}
