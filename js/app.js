import { Navbar } from './components/Navbar.js';
import { HeroSection } from './components/HeroSection.js';
import { CoreValueSection } from './components/CoreValueSection.js';
import { ProductPreviewSection } from './components/ProductPreviewSection.js';
import { MentorSection } from './components/MentorSection.js';
import { PresentationSection } from './components/PresentationSection.js';
import { TrustSection } from './components/TrustSection.js';
import { CTASection } from './components/CTASection.js';
import { Footer } from './components/Footer.js';
import { GeneratorView } from './components/GeneratorView.js';
import { RecommendationsView } from './components/RecommendationsView.js';
import { ProjectDetailsView, DashboardView, CompareView, MentorView, MentorUnavailableView } from './components/Part3Views.js';
import { PresentationView, VivaView } from './components/Part5Views.js';
import { generateProjectsApi, validateClientProfile, projectOperationApi } from './services/api.js';

const SAVED_KEY = 'uss_saved_projects_v2', COMPARE_KEY = 'uss_compare_projects_v2';
const read = key => { try { const value = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(value) ? value : []; } catch { return []; } };
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const idFor = project => `p_${Array.from(`${project.title}|${project.domain}|${project.problemStatement}`).reduce((a, c) => ((a * 31 + c.charCodeAt(0)) >>> 0), 7).toString(36)}`;
const ROADMAP_NAMES = ['Planning', 'UI/UX', 'Backend', 'Database/API', 'AI Integration', 'Testing', 'Deployment', 'Documentation & Presentation'];
const makeRoadmap = blueprint => ROADMAP_NAMES.map((name, index) => ({ name, objective: `Complete the ${name.toLowerCase()} milestone.`, outcome: `${name} milestone is ready for review.`, tasks: [{ text: blueprint?.developmentPhases?.[index] || `Complete the ${name.toLowerCase()} checklist.`, done: false }, { text: 'Review this milestone with your mentor.', done: false }] }));
const state = { currentView: 'landing', generatorStep: 1, profile: { interests: ['Artificial Intelligence', 'Web Development'], skills: ['React', 'Python', 'FastAPI'], experience: 'Intermediate', complexity: 'Moderate', projectType: 'Either', customPreferences: '', otherInterestInput: '', customSkillInput: '' }, recommendations: [], currentId: null, isLoading: false, loadingMessage: 'Finding projects that fit your skills...', error: '', aiProvider: 'Google Gemini AI', fromCache: false, operations: { evaluate: {}, blueprint: {}, improve: {}, mentor: {}, presentation: {}, viva: {} }, details: {}, conversations: {}, lastMentorQuestion: '' };
const projectById = id => [...state.recommendations, ...read(SAVED_KEY)].find(p => p.id === id);
const current = () => projectById(state.currentId);
const saveRecord = project => { const saved = read(SAVED_KEY); const i = saved.findIndex(p => p.id === project.id); const merged = { ...project, ...(state.details[project.id] || {}) }; if (i < 0) saved.push(merged); else saved[i] = merged; write(SAVED_KEY, saved); };
const syncProjectDetails = project => { state.details[project.id] = { ...(state.details[project.id] || {}), ...(project.evaluation ? { evaluation: project.evaluation } : {}) }; const saved = read(SAVED_KEY); if (saved.some(p => p.id === project.id)) saveRecord(project); };
const render = () => { const p = current(); let content;
  if (state.currentView === 'generator') content = GeneratorView({ step: state.generatorStep, profile: state.profile, error: state.error, isLoading: state.isLoading, loadingMessage: state.loadingMessage });
  else if (state.currentView === 'recommendations') content = RecommendationsView({ projects: state.recommendations, profile: state.profile, error: state.error, aiProvider: state.aiProvider, fromCache: state.fromCache });
  else if (state.currentView === 'project') { const saved = read(SAVED_KEY).some(x => x.id === state.currentId); const compared = read(COMPARE_KEY).includes(state.currentId); const data = { ...(p || {}), ...(state.details[state.currentId] || {}) }; content = ProjectDetailsView({ project: p, saved, compared, ...data, operations: state.operations, roadmap: data.roadmap }); }
  else if (state.currentView === 'presentation') { const detail = { ...(p || {}), ...(state.details[state.currentId] || {}) }; content = p ? PresentationView({ project: detail, presentation: detail.presentation, operation: state.operations.presentation }) : MentorUnavailableView(); }
  else if (state.currentView === 'viva') { const detail = { ...(p || {}), ...(state.details[state.currentId] || {}) }; content = p ? VivaView({ project: detail, viva: detail.viva, operation: state.operations.viva }) : MentorUnavailableView(); }
  else if (state.currentView === 'mentor') { const detail = { ...(p || {}), ...(state.details[state.currentId] || {}) }; content = p ? MentorView({ project: detail, messages: state.conversations[p.id] || [], operation: state.operations.mentor }) : MentorUnavailableView(); }
  else if (state.currentView === 'dashboard') content = DashboardView(read(SAVED_KEY));
  else if (state.currentView === 'compare') content = CompareView(read(COMPARE_KEY).map(projectById).filter(Boolean));
  else content = `${HeroSection()}${TrustSection()}${CoreValueSection()}${ProductPreviewSection()}${MentorSection()}${PresentationSection()}${CTASection()}`;
  document.getElementById('app').innerHTML = `${Navbar()}<main id="main-content">${content}</main>${Footer()}`;
};
const route = () => { const hash = location.hash || '#'; if (hash === '#generate') state.currentView = 'generator'; else if (hash === '#results') state.currentView = 'recommendations'; else if (hash === '#dashboard' || hash === '#projects') state.currentView = 'dashboard'; else if (hash === '#compare') state.currentView = 'compare'; else if (hash.startsWith('#presentation/')) { state.currentId = decodeURIComponent(hash.slice(14)); state.currentView = 'presentation'; } else if (hash.startsWith('#viva/')) { state.currentId = decodeURIComponent(hash.slice(6)); state.currentView = 'viva'; } else if (hash.startsWith('#mentor/')) { state.currentId = decodeURIComponent(hash.slice(8)); state.currentView = 'mentor'; } else if (hash.startsWith('#project/')) { state.currentId = decodeURIComponent(hash.slice(9)); state.currentView = 'project'; } else state.currentView = 'landing'; state.error = ''; render(); };
window.addEventListener('hashchange', route); window.addEventListener('DOMContentLoaded', route);
window.toggleMobileMenu = () => document.getElementById('mobile-menu')?.classList.toggle('hidden');
window.navigateToGenerator = () => location.hash = '#generate';
window.generatorToggleInterest = item => { const i=state.profile.interests.indexOf(item); i<0?state.profile.interests.push(item):state.profile.interests.splice(i,1); render(); };
window.generatorRemoveInterestByIndex = index => { state.profile.interests.splice(index, 1); render(); };
window.generatorAddCustomInterest = () => { const el=document.getElementById('other-interest-input'), v=el?.value.trim(); if(v && !state.profile.interests.includes(v)) state.profile.interests.push(v); render(); };
window.generatorToggleSkill = item => { const i=state.profile.skills.indexOf(item); i<0?state.profile.skills.push(item):state.profile.skills.splice(i,1); render(); };
window.generatorRemoveSkillByIndex = index => { state.profile.skills.splice(index, 1); render(); };
window.generatorAddCustomSkill = () => { const el=document.getElementById('custom-skill-input'), v=el?.value.trim(); if(v && !state.profile.skills.includes(v)) state.profile.skills.push(v); render(); };
window.generatorSetExperience = v => { state.profile.experience=v; render(); }; window.generatorSetComplexity = v => { state.profile.complexity=v; render(); }; window.generatorSetProjectType = v => { state.profile.projectType=v; render(); }; window.generatorUpdatePreferences = v => { state.profile.customPreferences=v; };
window.generatorNextStep = () => { if (!state.profile.interests.length) { state.error='Choose at least one interest.'; render(); return; } if(state.generatorStep<4) { state.generatorStep++; render(); } }; window.generatorPrevStep = () => { if(state.generatorStep>1) { state.generatorStep--; render(); } };
window.generatorSubmit = async force => { const valid=validateClientProfile(state.profile); if(!valid.valid){state.error=valid.message;render();return;} state.isLoading=true; state.error='';render(); try { if(force) sessionStorage.clear(); const data=await generateProjectsApi(state.profile); state.recommendations=(data.projects||[]).map(p=>({...p,id:idFor(p)})); state.aiProvider=data.aiProvider; state.fromCache=!!data.fromCache; location.hash='#results'; } catch(e){state.error=e.message; state.currentView='recommendations'; render();} finally {state.isLoading=false;} };
window.generatorRetry = () => window.generatorSubmit(true);
window.openProjectByIndex = index => { const project=state.recommendations[index]; if(project) location.hash=`#project/${encodeURIComponent(project.id)}`; };
window.openProjectById = id => location.hash=`#project/${encodeURIComponent(id)}`;
window.toggleSaveCurrent = () => { const p=current(); if(!p)return; const saved=read(SAVED_KEY), i=saved.findIndex(x=>x.id===p.id); if(i>=0)saved.splice(i,1); else saveRecord(p); write(SAVED_KEY,saved); render(); };
window.unsaveById = id => { write(SAVED_KEY,read(SAVED_KEY).filter(p=>p.id!==id)); render(); };
window.toggleCompareCurrent = () => { const p=current(); if(!p)return; const ids=read(COMPARE_KEY), i=ids.indexOf(p.id); i<0?ids.push(p.id):ids.splice(i,1); write(COMPARE_KEY,ids); render(); };
const run = async (name, endpoint, concern) => { const p=current(); if(!p){ state.operations[name]={error:'Selected project context is unavailable. Please reopen the project.'}; render(); return; } state.operations[name]={loading:true,error:''}; render(); try { const data=await projectOperationApi(endpoint,{profile:state.profile,project:p,...(concern?{concern}:{})}); const detail=state.details[p.id]||{}; if(name==='evaluate') detail.evaluation=data; if(name==='blueprint'){detail.blueprint=data; detail.roadmap=detail.roadmap||makeRoadmap(data);} if(name==='improve') detail.improvement=data; if(name==='presentation') detail.presentation=data; if(name==='viva') detail.viva=data; state.details[p.id]=detail; syncProjectDetails(p); state.operations[name]={}; } catch(e){state.operations[name]={error:e.message};} finally {render();} };
window.runEvaluation = () => run('evaluate','/api/evaluate-project'); window.runBlueprint = () => run('blueprint','/api/build-blueprint'); window.showImprove = () => document.getElementById('improve-panel')?.scrollIntoView({behavior:'smooth'}); window.runImprovement = () => { const concern=document.getElementById('improvement-concern')?.value.trim(); if(!concern){state.operations.improve={error:'Describe your concern first.'};render();return;} run('improve','/api/improve-project',concern); };
window.runPresentation = () => run('presentation','/api/generate-presentation');
window.runViva = () => run('viva','/api/generate-viva');
window.openPresentation = () => { if(current()) location.hash=`#presentation/${encodeURIComponent(state.currentId)}`; };
window.openViva = () => { if(current()) location.hash=`#viva/${encodeURIComponent(state.currentId)}`; };
window.ussCurrentSlide = 0;
window.setSlide = idx => { window.ussCurrentSlide = idx; render(); };
window.prevSlide = () => { window.ussCurrentSlide = Math.max(0, (window.ussCurrentSlide || 0) - 1); render(); };
window.nextSlide = () => { const detail = state.details[state.currentId] || {}; const total = detail.presentation?.slides?.length || 1; window.ussCurrentSlide = Math.min(total - 1, (window.ussCurrentSlide || 0) + 1); render(); };
window.copySlideContent = idx => { const detail = state.details[state.currentId] || {}; const s = detail.presentation?.slides?.[idx]; if(s) { const text = `${s.title}\n\n${(s.keyPoints||[]).map(p=>`• ${p}`).join('\n')}`; navigator.clipboard?.writeText(text); const btn = document.getElementById('copy-slide-btn'); if(btn) { btn.innerText = 'Copied!'; setTimeout(() => { if(btn) btn.innerText = 'Copy Slide Text'; }, 2000); } } };
window.copySpeakerNotes = idx => { const detail = state.details[state.currentId] || {}; const s = detail.presentation?.slides?.[idx]; if(s?.speakerNotes) navigator.clipboard?.writeText(s.speakerNotes); };
window.ussCurrentVivaQuestion = 0;
window.ussShowVivaAnswer = false;
window.setVivaQuestion = idx => { window.ussCurrentVivaQuestion = idx; window.ussShowVivaAnswer = false; render(); };
window.prevViva = () => { window.ussCurrentVivaQuestion = Math.max(0, (window.ussCurrentVivaQuestion || 0) - 1); window.ussShowVivaAnswer = false; render(); };
window.nextViva = () => { const detail = state.details[state.currentId] || {}; const total = detail.viva?.questions?.length || 1; window.ussCurrentVivaQuestion = Math.min(total - 1, (window.ussCurrentVivaQuestion || 0) + 1); window.ussShowVivaAnswer = false; render(); };
window.revealVivaAnswer = () => { window.ussShowVivaAnswer = true; render(); };
window.hideVivaAnswer = () => { window.ussShowVivaAnswer = false; render(); };
window.toggleRoadmapTask = (id, phase, task) => { const data=state.details[id]; if(!data?.roadmap)return; data.roadmap[phase].tasks[task].done=!data.roadmap[phase].tasks[task].done; const p=projectById(id); if(p) saveRecord(p); render(); };
window.continueBuilding = () => { const roadmap=state.details[state.currentId]?.roadmap; const next=roadmap?.flatMap((phase,pi)=>phase.tasks.map((task,ti)=>({...task,pi,ti}))).find(task=>!task.done); if(next) document.getElementById(`roadmap-task-${next.pi}-${next.ti}`)?.scrollIntoView({behavior:'smooth',block:'center'}); };
window.openMentor = () => { if(current()) location.hash=`#mentor/${encodeURIComponent(state.currentId)}`; };
window.setMentorQuestion = question => { const input=document.getElementById('mentor-question'); if(input) input.value=question; };
window.clearMentorConversation = () => { if(state.currentId) state.conversations[state.currentId]=[]; state.lastMentorQuestion=''; render(); };
const mentorPayload = (project, question, history) => { const detail = { ...(state.details[project.id] || {}) }; return { profile: state.profile, projectId: project.id, project, blueprint: detail.blueprint || project.blueprint || null, roadmap: detail.roadmap || project.roadmap || [], question, history: history.slice(-6) }; };
const sendMentor = async question => { const p=current(); if(!p) { state.operations.mentor={error:'Selected project context is unavailable. Please reopen the project.'}; render(); return; } if(!question) return; const messages=state.conversations[p.id]||[]; state.lastMentorQuestion=question; state.conversations[p.id]=[...messages,{role:'user',content:question}].slice(-6); state.operations.mentor={loading:true,error:''}; render(); try { const response=await projectOperationApi('/api/mentor',mentorPayload(p, question, messages)); state.conversations[p.id]=[...(state.conversations[p.id]||[]),{role:'assistant',content:response.answer,nextSteps:response.nextSteps,relevantRoadmapTasks:response.relevantRoadmapTasks,warnings:response.warnings}].slice(-6); } catch(error) { state.operations.mentor={error:error.message}; } finally { if(!state.operations.mentor.error) state.operations.mentor={}; render(); } };
window.sendMentorQuestion = () => { const question=document.getElementById('mentor-question')?.value.trim(); if(!question){state.operations.mentor={error:'Ask a question first.'};render();return;} sendMentor(question); };
window.retryMentorQuestion = () => sendMentor(state.lastMentorQuestion);
window.openMentorById = id => { state.currentId = id; location.hash = `#mentor/${encodeURIComponent(id)}`; };
window.openPresentationById = id => { state.currentId = id; location.hash = `#presentation/${encodeURIComponent(id)}`; };
window.openVivaById = id => { state.currentId = id; location.hash = `#viva/${encodeURIComponent(id)}`; };
window.openBlueprintById = id => { state.currentId = id; location.hash = `#project/${encodeURIComponent(id)}`; setTimeout(() => document.getElementById('blueprint-section')?.scrollIntoView({behavior:'smooth'}), 100); };
window.continueBuildingProject = id => { state.currentId = id; location.hash = `#project/${encodeURIComponent(id)}`; setTimeout(() => window.continueBuilding(), 100); };
window.toggleCompareProject = id => { const ids = read(COMPARE_KEY), i = ids.indexOf(id); i < 0 ? ids.push(id) : ids.splice(i, 1); write(COMPARE_KEY, ids); render(); };
window.deleteProject = async id => {
  try {
    await fetch(`/api/projects/${encodeURIComponent(id)}`, { method: 'DELETE' });
  } catch (e) {
    console.warn('[Sync] Delete project failed:', e);
  }
  const saved = read(SAVED_KEY).filter(p => p.id !== id);
  write(SAVED_KEY, saved);
  const compare = read(COMPARE_KEY).filter(i => i !== id);
  write(COMPARE_KEY, compare);
  delete state.details[id];
  render();
};

const syncWithBackendRepository = async () => {
  try {
    const res = await fetch('/api/projects');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.projects) && data.projects.length > 0) {
        const local = read(SAVED_KEY);
        const map = new Map();
        data.projects.forEach(p => map.set(p.id, p));
        local.forEach(p => map.set(p.id, { ...(map.get(p.id) || {}), ...p }));
        const merged = Array.from(map.values());
        write(SAVED_KEY, merged);
        merged.forEach(p => {
          state.details[p.id] = { ...(state.details[p.id] || {}), ...p };
        });
        render();
      }
    }
  } catch (err) {
    console.warn('[Sync] Repository fetch error:', err);
  }
};

syncWithBackendRepository();
route();
