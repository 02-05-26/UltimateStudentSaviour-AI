export const WorkflowStep = ({ step, title, description, isLast }) => `
<div class="relative flex flex-col items-center text-center max-w-sm">
    <div class="w-16 h-16 rounded-2xl bg-brand-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg mb-6 relative z-10">
        ${step}
    </div>
    <h3 class="text-xl font-bold text-slate-900 mb-3">${title}</h3>
    <p class="text-slate-600">${description}</p>
    
    ${!isLast ? `
    <div class="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-slate-200 -z-0" style="width: calc(100% + 2rem);">
        <div class="absolute right-0 -top-1 w-2 h-2 border-t-2 border-r-2 border-slate-300 transform rotate-45"></div>
    </div>
    ` : ''}
</div>
`;
