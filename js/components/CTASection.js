import { BRAND } from '../config.js';

export const CTASection = () => `
<section class="py-24 bg-gradient-to-br from-brand-900 to-accent-900 text-white relative overflow-hidden">
    <!-- Decorative background elements -->
    <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-30"></div>
    <div class="absolute top-0 right-0 w-96 h-96 bg-brand-500 rounded-full blur-[100px] opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
    <div class="absolute bottom-0 left-0 w-96 h-96 bg-accent-500 rounded-full blur-[100px] opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h2 class="text-4xl md:text-5xl font-extrabold mb-8 leading-tight">
            <span class="block opacity-90">Know what to build.</span>
            <span class="block opacity-90">Know whether it's realistic.</span>
            <span class="block text-brand-300">Know how to explain it.</span>
        </h2>
        <p class="text-xl text-brand-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Start with what you already know. ${BRAND.name} helps you turn it into a final-year project you can actually explain, build, and present.
        </p>
        <a href="#generate" class="inline-flex justify-center items-center gap-2 bg-white text-brand-900 hover:bg-brand-50 px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] hover:-translate-y-1">
            Create My Project
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </a>
    </div>
</section>
`;
