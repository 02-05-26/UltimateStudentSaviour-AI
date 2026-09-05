export const ProductPreviewSection = () => `
<section class="py-24 bg-slate-900 text-white overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-16">
            <h2 class="text-3xl md:text-4xl font-extrabold mb-6">Not just an idea generator.</h2>
            <p class="text-lg text-slate-400">Most students can find hundreds of project ideas online. The difficult part is finding one that matches their skills, fits their timeline, and can actually be built and explained.</p>
            
            <div class="mt-12 flex flex-wrap justify-center items-center gap-2 md:gap-4 text-sm font-bold tracking-widest text-brand-400">
                <span>IDEA</span>
                <span class="text-slate-600">→</span>
                <span>FEASIBILITY</span>
                <span class="text-slate-600">→</span>
                <span>BLUEPRINT</span>
                <span class="text-slate-600">→</span>
                <span>ROADMAP</span>
                <span class="text-slate-600">→</span>
                <span>MENTOR</span>
                <span class="text-slate-600">→</span>
                <span>PRESENTATION</span>
            </div>
        </div>

        <div class="max-w-4xl mx-auto bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
            <!-- Mac-like Header -->
            <div class="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center gap-2">
                <div class="flex gap-1.5">
                    <div class="w-3 h-3 rounded-full bg-slate-600"></div>
                    <div class="w-3 h-3 rounded-full bg-slate-600"></div>
                    <div class="w-3 h-3 rounded-full bg-slate-600"></div>
                </div>
            </div>
            
            <div class="p-6 md:p-10">
                <div class="flex flex-col md:flex-row justify-between items-start gap-6 mb-10 border-b border-slate-700 pb-8">
                    <div>
                        <div class="text-sm font-semibold text-brand-400 mb-2 uppercase tracking-wide">Project Blueprint</div>
                        <h3 class="text-2xl font-bold text-white mb-4">AI-Powered Campus Assistant</h3>
                        <div class="flex flex-wrap gap-2">
                            <span class="px-3 py-1 bg-slate-700 text-slate-300 text-sm font-medium rounded-md">React</span>
                            <span class="px-3 py-1 bg-slate-700 text-slate-300 text-sm font-medium rounded-md">Node.js</span>
                            <span class="px-3 py-1 bg-slate-700 text-slate-300 text-sm font-medium rounded-md">MongoDB</span>
                            <span class="px-3 py-1 bg-brand-900/50 text-brand-300 border border-brand-800 text-sm font-medium rounded-md">Google AI</span>
                        </div>
                    </div>
                    
                    <div class="flex flex-row md:flex-col gap-6 md:gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <div class="text-center md:text-right shrink-0">
                            <div class="text-sm text-slate-400 mb-1">Match</div>
                            <div class="text-3xl font-black text-green-400">94%</div>
                        </div>
                        <div class="text-center md:text-right shrink-0">
                            <div class="text-sm text-slate-400 mb-1">Feasibility</div>
                            <div class="text-xl font-bold text-white">92</div>
                        </div>
                        <div class="text-center md:text-right shrink-0">
                            <div class="text-sm text-slate-400 mb-1">Innovation</div>
                            <div class="text-xl font-bold text-white">84</div>
                        </div>
                        <div class="text-center md:text-right shrink-0">
                            <div class="text-sm text-slate-400 mb-1">Difficulty</div>
                            <div class="text-xl font-bold text-yellow-400">Medium</div>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 class="text-lg font-semibold text-white mb-6">Development Roadmap</h4>
                    <div class="flex flex-col md:flex-row gap-4">
                        <div class="flex-1 bg-slate-700/50 p-4 rounded-xl border border-slate-600 relative overflow-hidden group hover:border-brand-500 transition-colors cursor-pointer">
                            <div class="text-xs font-bold text-slate-400 mb-2">PHASE 1</div>
                            <div class="font-semibold text-white">Planning</div>
                        </div>
                        <div class="flex-1 bg-slate-700/50 p-4 rounded-xl border border-slate-600 relative overflow-hidden group hover:border-brand-500 transition-colors cursor-pointer">
                            <div class="text-xs font-bold text-slate-400 mb-2">PHASE 2</div>
                            <div class="font-semibold text-white">Design</div>
                        </div>
                        <div class="flex-1 bg-slate-700/50 p-4 rounded-xl border border-slate-600 relative overflow-hidden group hover:border-brand-500 transition-colors cursor-pointer border-brand-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                            <div class="text-xs font-bold text-brand-400 mb-2">PHASE 3</div>
                            <div class="font-semibold text-white">Development</div>
                        </div>
                        <div class="flex-1 bg-slate-700/50 p-4 rounded-xl border border-slate-600 relative overflow-hidden group hover:border-brand-500 transition-colors cursor-pointer opacity-50">
                            <div class="text-xs font-bold text-slate-400 mb-2">PHASE 4</div>
                            <div class="font-semibold text-white">Testing</div>
                        </div>
                        <div class="flex-1 bg-slate-700/50 p-4 rounded-xl border border-slate-600 relative overflow-hidden group hover:border-brand-500 transition-colors cursor-pointer opacity-50">
                            <div class="text-xs font-bold text-slate-400 mb-2">PHASE 5</div>
                            <div class="font-semibold text-white">Deployment</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="bg-slate-800 px-6 py-4 border-t border-slate-700 text-xs text-slate-500 text-center">
                *UI Demonstration Only
            </div>
        </div>
    </div>
</section>
`;
