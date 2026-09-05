import { BRAND } from '../config.js';

export const PresentationSection = () => `
<section class="py-24 bg-white overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
            
            <div class="order-2 lg:order-1 relative">
                <div class="absolute -inset-4 bg-orange-50 rounded-[3rem] -z-10"></div>
                <div class="bg-white border border-slate-200 shadow-xl rounded-xl p-6 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                    <div class="aspect-[16/9] bg-slate-50 border border-slate-100 rounded-lg flex flex-col mb-4 p-8 relative overflow-hidden">
                        <!-- Slide Content -->
                        <div class="flex-1">
                            <div class="text-orange-600 font-bold text-sm tracking-widest uppercase mb-4">Architecture</div>
                            <h4 class="text-2xl font-black text-slate-900 mb-6">System Flow & Data Pipeline</h4>
                            
                            <!-- Mock Diagram -->
                            <div class="flex items-center justify-center gap-4 py-4">
                                <div class="bg-white border-2 border-brand-200 px-4 py-2 rounded shadow-sm text-sm font-semibold">Client App</div>
                                <svg class="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                <div class="bg-white border-2 border-brand-200 px-4 py-2 rounded shadow-sm text-sm font-semibold">Node API</div>
                                <svg class="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                <div class="bg-white border-2 border-accent-200 px-4 py-2 rounded shadow-sm text-sm font-semibold text-accent-700">AI Service</div>
                            </div>
                        </div>
                        <div class="flex justify-between items-end">
                            <div class="text-xs font-semibold text-slate-400">${BRAND.shortName} Auto-Generated Slide 05</div>
                            <div class="text-xs font-bold text-slate-300 text-5xl">05</div>
                        </div>
                    </div>
                    
                    <div class="bg-slate-50 rounded-lg p-4 border border-slate-100 relative">
                        <div class="absolute -top-3 left-4 bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded shadow-sm">Speaker Notes</div>
                        <p class="text-sm text-slate-600 mt-2 font-mono">
                            "As you can see in the system architecture, we decoupled the AI service from the main Node.js API to ensure that heavy processing doesn't block incoming client requests. This improves overall system reliability by..."
                        </p>
                    </div>
                </div>
            </div>

            <div class="order-1 lg:order-2">
                <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Build it. Understand it. Present it.</h2>
                <p class="text-lg text-slate-700 mb-8 leading-relaxed">
                    Once your project is ready, ${BRAND.name} can turn your actual project information into a relevant presentation with project-specific slides, speaker notes, challenges, solutions, and future scope.
                </p>
                
                <ul class="space-y-3 mb-8">
                    <li class="flex items-center gap-3 text-slate-700 font-medium">
                        <svg class="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Problem Statement & Solution
                    </li>
                    <li class="flex items-center gap-3 text-slate-700 font-medium">
                        <svg class="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Architecture & Technology Stack
                    </li>
                    <li class="flex items-center gap-3 text-slate-700 font-medium">
                        <svg class="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Results, Challenges & Future Scope
                    </li>
                </ul>

                <a href="#presentation" class="inline-flex justify-center items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-8 py-3.5 rounded-lg font-semibold transition-all shadow-md">
                    Create Your Presentation
                </a>
            </div>
            
        </div>
    </div>
</section>
`;
