// Retained for callers that still need a modal. The primary details experience is #project/:id.
import { escapeHtml, textList } from '../utils/safe.js';

export const ProjectModal = (project) => {
    if (!project) return '';
    return `<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-project-title"><article class="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-3xl bg-white p-6"><button type="button" onclick="window.closeProjectModal?.()" class="float-right rounded p-2" aria-label="Close project details">×</button><p class="text-sm text-brand-600">${escapeHtml(project.domain)} · ${escapeHtml(project.difficulty)}</p><h2 id="modal-project-title" class="mt-2 text-2xl font-extrabold">${escapeHtml(project.title)}</h2><p class="mt-3">${escapeHtml(project.shortDescription)}</p><dl class="mt-5 space-y-3 text-sm"><div><dt class="font-bold">Problem</dt><dd>${escapeHtml(project.problemStatement)}</dd></div><div><dt class="font-bold">Why it fits</dt><dd>${escapeHtml(project.whyItFits)}</dd></div><div><dt class="font-bold">Technology stack</dt><dd>${textList(project.techStack || [])}</dd></div><div><dt class="font-bold">Key features</dt><dd>${textList(project.keyFeatures || [])}</dd></div></dl></article></div>`;
};
