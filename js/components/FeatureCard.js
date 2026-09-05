export const FeatureCard = ({ number, title, description }) => `
<div class="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-float transition-shadow duration-300 relative overflow-hidden group">
    <div class="absolute top-0 right-0 p-6 text-6xl font-black text-slate-50 group-hover:text-brand-50 transition-colors pointer-events-none">
        ${number}
    </div>
    <div class="relative z-10">
        <h3 class="text-xl font-bold text-slate-900 mb-3">${title}</h3>
        <p class="text-slate-600 leading-relaxed">${description}</p>
    </div>
</div>
`;
