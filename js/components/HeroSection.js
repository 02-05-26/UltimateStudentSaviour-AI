import { BRAND } from '../config.js';

export const HeroSection = () => `
<section class="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-grid">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            <!-- Hero Content -->
            <div class="max-w-2xl">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-sm font-semibold mb-6">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path></svg>
                    For Final-Year Students
                </div>
                
                <h1 class="text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
                    Turn Your Skills Into <br/>
                    <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-600 relative">
                        Your Final-Year Project.
                        <svg class="absolute w-full h-3 -bottom-1 left-0 text-brand-200" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.00035 7.15286C35.9189 2.52932 108.973 -1.8211 198.152 7.15286" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>
                    </span>
                </h1>
                
                <p class="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl">
                    ${BRAND.description}
                </p>
                
                <div class="flex flex-col sm:flex-row gap-4">
                    <a href="#generate" class="inline-flex justify-center items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-8 py-3.5 rounded-lg font-semibold transition-all shadow-float hover:shadow-lg hover:-translate-y-0.5">
                        Create My Project
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </a>
                    <a href="#generate" class="inline-flex justify-center items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-3.5 rounded-lg font-semibold transition-all shadow-sm hover:shadow">
                        Explore Project Ideas
                    </a>
                </div>
            </div>

            <!-- Hero Visual (Product Preview) -->
            <div class="relative lg:ml-auto w-full max-w-lg lg:max-w-none mt-12 lg:mt-0">
                <!-- Decorative background elements -->
                <div class="absolute -inset-0.5 bg-gradient-to-tr from-brand-500 to-accent-500 rounded-[2rem] blur opacity-20"></div>
                
                <div class="relative bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px]">
                    <!-- Window Header -->
                    <div class="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center gap-2">
                        <div class="flex gap-1.5">
                            <div class="w-3 h-3 rounded-full bg-slate-300"></div>
                            <div class="w-3 h-3 rounded-full bg-slate-300"></div>
                            <div class="w-3 h-3 rounded-full bg-slate-300"></div>
                        </div>
                        <div class="text-xs font-medium text-slate-400 mx-auto bg-white px-2 py-1 rounded border border-slate-100">Project Workspace</div>
                    </div>
                    
                    <!-- App Content Mockup -->
                    <div class="p-6 flex-1 overflow-y-auto bg-slate-50">
                        <div class="flex justify-between items-start mb-6">
                            <div>
                                <h3 class="font-bold text-slate-900 text-lg">AI-Powered Campus Assistant</h3>
                                <div class="flex gap-2 mt-2">
                                    <span class="px-2 py-1 bg-brand-100 text-brand-700 text-xs font-medium rounded">React</span>
                                    <span class="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">Node.js</span>
                                    <span class="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">AI API</span>
                                </div>
                            </div>
                            <div class="flex flex-col items-end">
                                <div class="text-sm font-medium text-slate-500 mb-1">Match Score</div>
                                <div class="text-2xl font-black text-brand-600">94%</div>
                            </div>
                        </div>

                        <div class="space-y-4">
                            <!-- Feature Plan -->
                            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div class="text-sm font-semibold text-slate-700 mb-3 flex items-center justify-between">
                                    <span>Development Roadmap</span>
                                    <span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Phase 1</span>
                                </div>
                                <div class="space-y-3">
                                    <div class="flex items-center gap-3">
                                        <div class="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
                                            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                        </div>
                                        <div class="h-2 w-3/4 bg-slate-200 rounded"></div>
                                    </div>
                                    <div class="flex items-center gap-3">
                                        <div class="w-5 h-5 rounded-full bg-slate-100 border border-slate-300"></div>
                                        <div class="h-2 w-1/2 bg-slate-200 rounded"></div>
                                    </div>
                                    <div class="flex items-center gap-3">
                                        <div class="w-5 h-5 rounded-full bg-slate-100 border border-slate-300"></div>
                                        <div class="h-2 w-2/3 bg-slate-200 rounded"></div>
                                    </div>
                                </div>
                            </div>

                            <!-- Presentation Preview -->
                            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
                                <div class="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                                    <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>
                                </div>
                                <div>
                                    <div class="text-sm font-semibold text-slate-900">Presentation Ready</div>
                                    <div class="text-xs text-slate-500 mt-1">12 slides generated for your final review.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Floating Micro Indicators -->
                <div class="absolute -top-6 -right-6 bg-white px-4 py-2 rounded-lg shadow-lg border border-slate-100 animate-bounce" style="animation-duration: 3s;">
                    <div class="flex items-center gap-2 text-sm font-bold text-slate-800">
                        ✨ 94% Match
                    </div>
                </div>
                <div class="absolute top-1/2 -left-8 bg-white px-4 py-2 rounded-lg shadow-lg border border-slate-100 transform -translate-y-1/2">
                    <div class="flex items-center gap-2 text-sm font-bold text-slate-800">
                        🤖 AI Mentor
                    </div>
                </div>
                <div class="absolute -bottom-4 right-10 bg-white px-4 py-2 rounded-lg shadow-lg border border-slate-100">
                    <div class="flex items-center gap-2 text-sm font-bold text-slate-800">
                        📊 Roadmap Ready
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
`;
