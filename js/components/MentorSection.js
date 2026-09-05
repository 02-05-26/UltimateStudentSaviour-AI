import { BRAND } from '../config.js';

export const MentorSection = () => `
<section id="mentor" class="py-24 bg-brand-50 border-y border-brand-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
            <div>
                <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Don't get stuck after choosing your idea.</h2>
                <p class="text-lg text-slate-700 mb-8 leading-relaxed">
                    Ask ${BRAND.mentorName} how to improve your idea, reduce complexity, choose better technologies, handle challenges, or plan your next development step.
                </p>
                <a href="#mentor" class="inline-flex justify-center items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-lg font-semibold transition-all">
                    Meet ${BRAND.mentorName}
                </a>
            </div>
            
            <div class="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
                <div class="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold">AI</div>
                    <div>
                        <div class="font-semibold text-slate-900">${BRAND.mentorName}</div>
                        <div class="text-xs text-slate-500 font-medium flex items-center gap-1">
                            Your project-aware AI mentor.
                        </div>
                    </div>
                    <span class="ml-auto text-xs text-slate-400 border border-slate-200 px-2 py-1 rounded bg-white">Preview</span>
                </div>
                
                <div class="p-6 space-y-6 bg-slate-50">
                    <!-- User Message -->
                    <div class="flex gap-4 justify-end">
                        <div class="bg-brand-600 text-white rounded-2xl rounded-tr-none px-5 py-3 max-w-[85%] shadow-sm">
                            <p class="text-sm">How can I make this project more innovative?</p>
                        </div>
                        <div class="w-8 h-8 rounded-full bg-slate-200 shrink-0 mt-1 flex items-center justify-center text-xs font-bold text-slate-500">U</div>
                    </div>
                    
                    <!-- AI Message -->
                    <div class="flex gap-4">
                        <div class="w-8 h-8 rounded-full bg-brand-100 shrink-0 mt-1 flex items-center justify-center text-xs font-bold text-brand-600">AI</div>
                        <div class="bg-white text-slate-700 border border-slate-200 rounded-2xl rounded-tl-none px-5 py-4 max-w-[85%] shadow-sm">
                            <p class="text-sm leading-relaxed">Consider adding <strong>personalized recommendations</strong>, <strong>explainable insights</strong>, and <strong>role-based dashboards</strong> while keeping the core scope manageable. This adds significant academic value without overwhelming the development timeline.</p>
                        </div>
                    </div>
                </div>
                
                <div class="p-4 bg-white border-t border-slate-200">
                    <div class="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 opacity-60 cursor-not-allowed">
                        <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span class="text-slate-400 text-sm">Type your question...</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
`;
