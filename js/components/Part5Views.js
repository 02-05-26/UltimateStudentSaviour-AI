import { escapeHtml, textList } from '../utils/safe.js';

export const PresentationView = ({ project, presentation, operation }) => {
  if (!project) return `<section class="pt-28 max-w-3xl mx-auto px-4"><h1 class="text-2xl font-bold">Project not found</h1><a class="text-brand-600" href="#results">Return to recommendations</a></section>`;
  
  if (!presentation) {
    return `<section class="pt-28 pb-16 max-w-4xl mx-auto px-4">
      <a href="#project/${encodeURIComponent(project.id)}" class="text-sm font-bold text-brand-600">← Back to project</a>
      <div class="mt-6 rounded-2xl bg-white p-8 border border-slate-200 text-center shadow-sm">
        <h1 class="text-2xl font-bold text-slate-900">AI Presentation Deck</h1>
        <p class="mt-2 text-slate-600">Generate a structured academic slide deck (10–12 slides) with speaker notes directly from your project blueprint.</p>
        <button onclick="window.runPresentation()" class="mt-6 rounded-xl bg-brand-600 px-6 py-3 font-bold text-white hover:bg-brand-700 disabled:opacity-50" ${operation?.loading ? 'disabled' : ''}>
          ${operation?.loading ? 'Generating Presentation Slides…' : 'Generate Presentation'}
        </button>
        ${operation?.loading ? '<p class="mt-3 text-sm text-slate-500" role="status">Creating tailored slides using your project context…</p>' : ''}
        ${operation?.error ? `<div class="mt-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm" role="alert">${escapeHtml(operation.error)} <button onclick="window.runPresentation()" class="font-bold underline ml-2">Retry</button></div>` : ''}
      </div>
    </section>`;
  }

  const slides = presentation.slides || [];
  const currentSlide = Math.max(0, Math.min(window.ussCurrentSlide || 0, slides.length - 1));
  const slide = slides[currentSlide] || { title: 'No slide', keyPoints: [], speakerNotes: '' };

  return `<section class="pt-28 pb-16 max-w-5xl mx-auto px-4">
    <div class="flex items-center justify-between">
      <a href="#project/${encodeURIComponent(project.id)}" class="text-sm font-bold text-brand-600">← Back to project</a>
      <div class="flex gap-2">
        <a href="#viva/${encodeURIComponent(project.id)}" class="text-sm font-bold text-brand-600 px-3 py-1.5 rounded-lg border border-brand-200 bg-brand-50 hover:bg-brand-100">Prepare for Viva →</a>
      </div>
    </div>
    
    <header class="mt-4 flex flex-wrap justify-between items-end gap-4">
      <div>
        <p class="text-xs font-bold uppercase tracking-wider text-brand-600">Final Year Academic Presentation</p>
        <h1 class="text-2xl font-extrabold text-slate-900">${escapeHtml(presentation.title || project.title)}</h1>
        <p class="text-slate-600 text-sm mt-1">${escapeHtml(presentation.subtitle || project.shortDescription)}</p>
      </div>
      <div class="flex gap-2">
        <button onclick="window.runPresentation()" class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50" ${operation?.loading ? 'disabled' : ''}>
          ${operation?.loading ? 'Regenerating…' : 'Regenerate'}
        </button>
      </div>
    </header>
    
    ${operation?.error ? `<div class="mt-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm" role="alert">${escapeHtml(operation.error)} <button onclick="window.runPresentation()" class="font-bold underline ml-2">Retry</button></div>` : ''}

    <div class="mt-6 flex flex-col lg:flex-row gap-6">
      <aside class="w-full lg:w-72 shrink-0 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm self-start">
        <h2 class="font-bold text-xs text-slate-400 uppercase tracking-wider px-2 mb-2">Slide Outline (${slides.length})</h2>
        <ul class="space-y-1">
          ${slides.map((s, i) => `
            <li>
              <button onclick="window.setSlide(${i})" class="w-full text-left px-3 py-2 text-sm rounded-xl transition-colors ${i === currentSlide ? 'bg-brand-600 text-white font-bold' : 'text-slate-700 hover:bg-slate-100'}">
                <span class="${i === currentSlide ? 'text-brand-200' : 'text-slate-400'} text-xs font-mono mr-1.5">${i + 1}.</span> ${escapeHtml(s.title)}
              </button>
            </li>
          `).join('')}
        </ul>
      </aside>
      
      <main class="flex-1 space-y-6">
        <div class="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[380px]">
          <div class="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
            <span class="text-xs font-semibold text-brand-300 uppercase tracking-wide">Slide ${currentSlide + 1} of ${slides.length}</span>
            <span class="text-xs text-slate-400">${escapeHtml(project.domain)}</span>
          </div>
          <div class="p-8 flex-1 flex flex-col justify-center">
            <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-6">${escapeHtml(slide.title)}</h2>
            <div class="text-slate-700 text-base sm:text-lg space-y-2">
              ${textList(slide.keyPoints)}
            </div>
          </div>
          <div class="bg-slate-50 border-t border-slate-200 p-4 flex justify-between items-center text-sm">
            <button onclick="window.prevSlide()" class="px-4 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed" ${currentSlide === 0 ? 'disabled' : ''}>← Previous</button>
            <button onclick="window.copySlideContent(${currentSlide})" id="copy-slide-btn" class="text-xs font-semibold text-brand-600 hover:text-brand-800">Copy Slide Text</button>
            <button onclick="window.nextSlide()" class="px-4 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed" ${currentSlide === slides.length - 1 ? 'disabled' : ''}>Next →</button>
          </div>
        </div>
        
        <div class="rounded-2xl bg-amber-50 border border-amber-200 p-5 shadow-sm">
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-bold text-amber-900 text-sm flex items-center gap-2">
              <span>🎤</span> Speaker Notes & Defense Tips
            </h3>
            <button onclick="window.copySpeakerNotes(${currentSlide})" class="text-xs font-bold text-amber-800 hover:underline">Copy Notes</button>
          </div>
          <p class="text-amber-900 text-sm leading-relaxed whitespace-pre-wrap">${escapeHtml(slide.speakerNotes)}</p>
        </div>
      </main>
    </div>
  </section>`;
};

export const VivaView = ({ project, viva, operation }) => {
  if (!project) return `<section class="pt-28 max-w-3xl mx-auto px-4"><h1 class="text-2xl font-bold">Project not found</h1><a class="text-brand-600" href="#results">Return to recommendations</a></section>`;
  
  if (!viva) {
    return `<section class="pt-28 pb-16 max-w-4xl mx-auto px-4">
      <a href="#project/${encodeURIComponent(project.id)}" class="text-sm font-bold text-brand-600">← Back to project</a>
      <div class="mt-6 rounded-2xl bg-white p-8 border border-slate-200 text-center shadow-sm">
        <h1 class="text-2xl font-bold text-slate-900">AI Viva Examiner & Defense Prep</h1>
        <p class="mt-2 text-slate-600">Generate 15–20 high-frequency academic viva questions across architecture, database, AI integration, security, and edge-cases.</p>
        <button onclick="window.runViva()" class="mt-6 rounded-xl bg-brand-600 px-6 py-3 font-bold text-white hover:bg-brand-700 disabled:opacity-50" ${operation?.loading ? 'disabled' : ''}>
          ${operation?.loading ? 'Generating Viva Questions…' : 'Start Mock Viva'}
        </button>
        ${operation?.loading ? '<p class="mt-3 text-sm text-slate-500" role="status">Analyzing project technical depth and compiling questions…</p>' : ''}
        ${operation?.error ? `<div class="mt-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm" role="alert">${escapeHtml(operation.error)} <button onclick="window.runViva()" class="font-bold underline ml-2">Retry</button></div>` : ''}
      </div>
    </section>`;
  }

  const questions = viva.questions || [];
  const currentQ = Math.max(0, Math.min(window.ussCurrentVivaQuestion || 0, questions.length - 1));
  const showAnswer = !!window.ussShowVivaAnswer;
  const q = questions[currentQ] || { question: 'No question found', answer: '', difficulty: 'Medium', category: 'General' };

  const diffColors = {
    'Easy': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Medium': 'bg-amber-100 text-amber-800 border-amber-200',
    'Hard': 'bg-rose-100 text-rose-800 border-rose-200'
  };
  const diffClass = diffColors[q.difficulty] || 'bg-slate-100 text-slate-800 border-slate-200';

  return `<section class="pt-28 pb-16 max-w-3xl mx-auto px-4">
    <div class="flex items-center justify-between">
      <a href="#project/${encodeURIComponent(project.id)}" class="text-sm font-bold text-brand-600">← Back to project</a>
      <a href="#presentation/${encodeURIComponent(project.id)}" class="text-sm font-bold text-brand-600">View Slide Deck →</a>
    </div>
    
    <header class="mt-4 flex justify-between items-center">
      <div>
        <p class="text-xs font-bold uppercase tracking-wider text-brand-600">Mock Viva Mode</p>
        <h1 class="text-2xl font-extrabold text-slate-900">${escapeHtml(project.title)}</h1>
      </div>
      <span class="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">Question ${currentQ + 1} / ${questions.length}</span>
    </header>

    <div class="mt-6 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div class="p-6 md:p-8">
        <div class="flex flex-wrap gap-2 mb-4">
          <span class="text-xs font-bold px-2.5 py-1 rounded-md border ${diffClass}">${escapeHtml(q.difficulty)}</span>
          <span class="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">${escapeHtml(q.category)}</span>
        </div>
        <h2 class="text-xl md:text-2xl font-extrabold text-slate-900 leading-snug">${escapeHtml(q.question)}</h2>
        
        <div class="mt-6">
          ${showAnswer ? `
            <div class="rounded-xl bg-brand-50 border border-brand-200 p-5">
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-bold text-brand-900 text-sm">💡 Model Viva Answer</h3>
                <button onclick="window.hideVivaAnswer()" class="text-xs font-semibold text-brand-700 hover:underline">Hide Answer</button>
              </div>
              <p class="text-brand-900 text-sm whitespace-pre-wrap leading-relaxed">${escapeHtml(q.answer)}</p>
            </div>
          ` : `
            <button onclick="window.revealVivaAnswer()" class="w-full py-4 border-2 border-dashed border-brand-300 rounded-xl text-brand-700 bg-brand-50/50 font-bold hover:bg-brand-50 transition-colors">
              🔍 Reveal Model Answer
            </button>
          `}
        </div>
      </div>
      
      <div class="bg-slate-50 border-t border-slate-200 p-4 flex justify-between items-center">
        <button onclick="window.prevViva()" class="px-4 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed" ${currentQ === 0 ? 'disabled' : ''}>← Previous</button>
        <button onclick="window.runViva()" class="text-xs font-semibold text-slate-500 hover:text-slate-700">Regenerate Questions</button>
        <button onclick="window.nextViva()" class="px-5 py-2 rounded-xl bg-brand-600 font-bold text-white hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed" ${currentQ === questions.length - 1 ? 'disabled' : ''}>Next Question →</button>
      </div>
    </div>
    
    <div class="mt-6 flex justify-center items-center gap-1.5 flex-wrap max-w-md mx-auto">
      ${questions.map((_, i) => `
        <button onclick="window.setVivaQuestion(${i})" class="h-2.5 w-2.5 rounded-full transition-all ${i === currentQ ? 'bg-brand-600 scale-125' : (i < currentQ ? 'bg-brand-300' : 'bg-slate-200')}" title="Question ${i+1}"></button>
      `).join('')}
    </div>
  </section>`;
};
