import { escapeHtml } from '../utils/safe.js';
/**
 * GeneratorView Component
 * Multi-step interactive student profile builder and project generator wizard.
 */

export const INTEREST_OPTIONS = [
    "Artificial Intelligence",
    "Machine Learning",
    "Web Development",
    "Mobile Development",
    "Cybersecurity",
    "Data Science",
    "Cloud Computing",
    "IoT",
    "Blockchain",
    "Computer Vision",
    "Automation",
    "Education Technology",
    "Healthcare Technology",
    "FinTech",
    "Sustainability"
];

export const SKILL_CATEGORIES = {
    "Programming": ["Python", "Java", "JavaScript", "TypeScript", "C", "C++", "C#"],
    "Frontend": ["React", "Next.js", "HTML/CSS", "Tailwind CSS"],
    "Backend": ["Node.js", "Express", "FastAPI", "Django", "Spring Boot"],
    "Database": ["MySQL", "PostgreSQL", "MongoDB", "Firebase"],
    "AI / ML": ["TensorFlow", "PyTorch", "Scikit-learn", "Generative AI"],
    "Cloud": ["Google Cloud", "AWS", "Azure"],
    "DevOps & Tools": ["Git/GitHub", "REST APIs", "Docker"]
};

export const GeneratorView = (state) => {
    const { step = 1, profile = {}, error = "", isLoading = false, loadingMessage = "Finding projects that fit your skills..." } = state;
    const {
        interests = [],
        skills = [],
        experience = "Intermediate",
        complexity = "Moderate",
        projectType = "Either",
        customPreferences = "",
        otherInterestInput = "",
        customSkillInput = ""
    } = profile;

    const totalSteps = 4;
    const progressPercent = (step / totalSteps) * 100;

    return `
    <section class="min-h-screen pt-28 pb-20 bg-slate-50 relative overflow-hidden" aria-labelledby="generator-heading">
        <!-- Subtle background pattern -->
        <div class="absolute inset-0 bg-grid opacity-60 pointer-events-none"></div>

        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            
            <!-- Breadcrumb & Top Bar -->
            <div class="flex items-center justify-between mb-6">
                <a href="#home" class="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Overview
                </a>
                <div class="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
                    Step ${step} of ${totalSteps}
                </div>
            </div>

            <!-- Card Container -->
            <div class="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative">
                
                <!-- Progress Bar -->
                <div class="h-2 w-full bg-slate-100">
                    <div class="h-full bg-gradient-to-r from-brand-600 to-accent-600 transition-all duration-300 ease-out" style="width: ${progressPercent}%" role="progressbar" aria-valuenow="${step}" aria-valuemin="1" aria-valuemax="${totalSteps}"></div>
                </div>

                <!-- Card Body -->
                <div class="p-6 sm:p-10">
                    
                    ${error ? `
                    <div class="mb-8 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-sm font-medium animate-pulse" role="alert">
                        <svg class="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        <div>
                            <span class="font-bold">Required:</span> ${error}
                        </div>
                    </div>
                    ` : ''}

                    <!-- STEP 1: INTERESTS -->
                    ${step === 1 ? `
                    <div id="step-1-content">
                        <div class="mb-8">
                            <span class="text-xs font-bold text-brand-600 uppercase tracking-wider">Step 1 — Project Domains</span>
                            <h2 id="generator-heading" class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">What are you interested in?</h2>
                            <p class="text-slate-600 text-sm sm:text-base mt-2">Select one or more topics you find exciting. We will tailor project recommendations around your selections.</p>
                        </div>

                        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                            ${INTEREST_OPTIONS.map(opt => {
                                const isSelected = interests.includes(opt);
                                return `
                                <button type="button" onclick="window.generatorToggleInterest('${opt}')" 
                                    class="text-left p-3.5 rounded-xl border text-sm font-semibold transition-all flex items-center justify-between ${
                                        isSelected 
                                            ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-sm ring-2 ring-brand-500/20' 
                                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                    }"
                                    aria-pressed="${isSelected}">
                                    <span>${opt}</span>
                                    ${isSelected ? `
                                    <svg class="w-4 h-4 text-brand-600 shrink-0 ml-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                    ` : ''}
                                </button>
                                `;
                            }).join('')}
                        </div>

                        <!-- Custom Other Interest Input -->
                        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <label for="other-interest-input" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Have a specific niche interest?</label>
                            <div class="flex gap-2">
                                <input type="text" id="other-interest-input" value="${otherInterestInput}" 
                                    placeholder="e.g. Smart Agriculture, Autonomous Drones, NLP for Regional Languages..." 
                                    class="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
                                    onkeydown="if(event.key === 'Enter'){ event.preventDefault(); window.generatorAddCustomInterest(); }">
                                <button type="button" onclick="window.generatorAddCustomInterest()" 
                                    class="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-semibold transition-colors">
                                    Add
                                </button>
                            </div>
                            ${interests.filter(i => !INTEREST_OPTIONS.includes(i)).length > 0 ? `
                            <div class="flex flex-wrap gap-2 mt-3">
                                ${interests.map((cust, index) => ({ cust, index })).filter(({ cust }) => !INTEREST_OPTIONS.includes(cust)).map(({ cust, index }) => `
                                <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-100 text-brand-800 text-xs font-medium rounded-full">
                                    ${escapeHtml(cust)}
                                    <button type="button" onclick="window.generatorRemoveInterestByIndex(${index})" class="hover:text-brand-900 font-bold ml-1" aria-label="Remove custom interest">×</button>
                                </span>
                                `).join('')}
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    ` : ''}

                    <!-- STEP 2: SKILLS -->
                    ${step === 2 ? `
                    <div id="step-2-content">
                        <div class="mb-8">
                            <span class="text-xs font-bold text-brand-600 uppercase tracking-wider">Step 2 — Technical Background</span>
                            <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">What can you already work with?</h2>
                            <p class="text-slate-600 text-sm sm:text-base mt-2">Optional: Select technologies you know. We will recommend stacks you are familiar with, plus practical tools to learn.</p>
                        </div>

                        <div class="space-y-6 mb-8">
                            ${Object.entries(SKILL_CATEGORIES).map(([catName, skillList]) => `
                            <div>
                                <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">${catName}</h3>
                                <div class="flex flex-wrap gap-2">
                                    ${skillList.map(skill => {
                                        const isSelected = skills.includes(skill);
                                        return `
                                        <button type="button" onclick="window.generatorToggleSkill('${skill}')"
                                            class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all ${
                                                isSelected
                                                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                                                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                            }"
                                            aria-pressed="${isSelected}">
                                            ${skill} ${isSelected ? '✓' : '+'}
                                        </button>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                            `).join('')}
                        </div>

                        <!-- Custom Skill Input -->
                        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <label for="custom-skill-input" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Add other programming language or framework</label>
                            <div class="flex gap-2">
                                <input type="text" id="custom-skill-input" value="${customSkillInput}"
                                    placeholder="e.g. Flutter, Rust, Kubernetes, GraphQL, OpenCV..."
                                    class="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
                                    onkeydown="if(event.key === 'Enter'){ event.preventDefault(); window.generatorAddCustomSkill(); }">
                                <button type="button" onclick="window.generatorAddCustomSkill()"
                                    class="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-semibold transition-colors">
                                    Add
                                </button>
                            </div>
                            ${skills.filter(s => !Object.values(SKILL_CATEGORIES).flat().includes(s)).length > 0 ? `
                            <div class="flex flex-wrap gap-2 mt-3">
                                ${skills.map((cust, index) => ({ cust, index })).filter(({ cust }) => !Object.values(SKILL_CATEGORIES).flat().includes(cust)).map(({ cust, index }) => `
                                <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-100 text-accent-800 text-xs font-medium rounded-full">
                                    ${escapeHtml(cust)}
                                    <button type="button" onclick="window.generatorRemoveSkillByIndex(${index})" class="hover:text-accent-900 font-bold ml-1" aria-label="Remove custom skill">×</button>
                                </span>
                                `).join('')}
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    ` : ''}

                    <!-- STEP 3: EXPERIENCE, COMPLEXITY & PROJECT TYPE -->
                    ${step === 3 ? `
                    <div id="step-3-content">
                        <div class="mb-8">
                            <span class="text-xs font-bold text-brand-600 uppercase tracking-wider">Step 3 — Scope & Project Format</span>
                            <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Project Preferences</h2>
                            <p class="text-slate-600 text-sm sm:text-base mt-2">Help us calibrate the technical depth and timeline of your final-year project.</p>
                        </div>

                        <!-- Experience Level -->
                        <div class="mb-8">
                            <label class="block text-sm font-bold text-slate-800 mb-3">What's your current experience level?</label>
                            <div class="grid sm:grid-cols-3 gap-3">
                                ${[
                                    { level: "Beginner", desc: "Comfortable with fundamentals and small projects." },
                                    { level: "Intermediate", desc: "Can build complete applications with some guidance." },
                                    { level: "Advanced", desc: "Comfortable designing and building complex systems." }
                                ].map(item => {
                                    const isSelected = experience === item.level;
                                    return `
                                    <button type="button" onclick="window.generatorSetExperience('${item.level}')"
                                        class="p-4 rounded-2xl border text-left transition-all ${
                                            isSelected 
                                                ? 'bg-brand-50 border-brand-500 text-slate-900 shadow-sm ring-2 ring-brand-500/20' 
                                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                        }">
                                        <div class="flex justify-between items-center mb-1">
                                            <span class="font-bold text-sm ${isSelected ? 'text-brand-700' : 'text-slate-900'}">${item.level}</span>
                                            <input type="radio" name="experience" ${isSelected ? 'checked' : ''} class="text-brand-600">
                                        </div>
                                        <p class="text-xs text-slate-500 leading-relaxed">${item.desc}</p>
                                    </button>
                                    `;
                                }).join('')}
                            </div>
                        </div>

                        <!-- Project Complexity -->
                        <div class="mb-8">
                            <label class="block text-sm font-bold text-slate-800 mb-3">How ambitious should your project be?</label>
                            <div class="grid sm:grid-cols-3 gap-3">
                                ${[
                                    { level: "Simple", desc: "Manageable scope for a short timeline." },
                                    { level: "Moderate", desc: "Balanced final-year project with meaningful technical depth." },
                                    { level: "Challenging", desc: "More advanced project with greater technical complexity." }
                                ].map(item => {
                                    const isSelected = complexity === item.level;
                                    return `
                                    <button type="button" onclick="window.generatorSetComplexity('${item.level}')"
                                        class="p-4 rounded-2xl border text-left transition-all ${
                                            isSelected 
                                                ? 'bg-brand-50 border-brand-500 text-slate-900 shadow-sm ring-2 ring-brand-500/20' 
                                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                        }">
                                        <div class="flex justify-between items-center mb-1">
                                            <span class="font-bold text-sm ${isSelected ? 'text-brand-700' : 'text-slate-900'}">${item.level}</span>
                                            <input type="radio" name="complexity" ${isSelected ? 'checked' : ''} class="text-brand-600">
                                        </div>
                                        <p class="text-xs text-slate-500 leading-relaxed">${item.desc}</p>
                                    </button>
                                    `;
                                }).join('')}
                            </div>
                        </div>

                        <!-- Project Type -->
                        <div>
                            <label class="block text-sm font-bold text-slate-800 mb-3">What kind of project do you prefer?</label>
                            <div class="grid sm:grid-cols-3 gap-3">
                                ${["Individual Project", "Team Project", "Either"].map(type => {
                                    const isSelected = projectType === type;
                                    return `
                                    <button type="button" onclick="window.generatorSetProjectType('${type}')"
                                        class="p-4 rounded-2xl border text-left transition-all ${
                                            isSelected 
                                                ? 'bg-brand-50 border-brand-500 text-slate-900 shadow-sm ring-2 ring-brand-500/20' 
                                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                        }">
                                        <div class="flex justify-between items-center">
                                            <span class="font-bold text-sm ${isSelected ? 'text-brand-700' : 'text-slate-900'}">${type}</span>
                                            <input type="radio" name="projectType" ${isSelected ? 'checked' : ''} class="text-brand-600">
                                        </div>
                                    </button>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                    ` : ''}

                    <!-- STEP 4: PREFERENCES & GENERATION REVIEW -->
                    ${step === 4 ? `
                    <div id="step-4-content">
                        <div class="mb-8">
                            <span class="text-xs font-bold text-brand-600 uppercase tracking-wider">Step 4 — Final Details</span>
                            <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Review & Optional Preferences</h2>
                            <p class="text-slate-600 text-sm sm:text-base mt-2">Almost ready! Add any specific requirements, or proceed to generate your tailored blueprints.</p>
                        </div>

                        <!-- Profile Summary Overview -->
                        <div class="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6">
                            <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Your Profile Summary</h3>
                            <div class="grid sm:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span class="text-slate-500 text-xs block mb-1">Selected Interests</span>
                                    <div class="flex flex-wrap gap-1.5">
                                        ${interests.length > 0 ? interests.map(i => `<span class="px-2.5 py-0.5 bg-brand-100 text-brand-800 text-xs font-semibold rounded-md">${i}</span>`).join('') : '<span class="text-red-500 text-xs font-medium">None selected</span>'}
                                    </div>
                                </div>
                                <div>
                                    <span class="text-slate-500 text-xs block mb-1">Technical Skills</span>
                                    <div class="flex flex-wrap gap-1.5">
                                        ${skills.length > 0 ? skills.map(s => `<span class="px-2.5 py-0.5 bg-slate-200 text-slate-800 text-xs font-medium rounded-md">${s}</span>`).join('') : '<span class="text-slate-400 text-xs">Standard modern stack</span>'}
                                    </div>
                                </div>
                                <div>
                                    <span class="text-slate-500 text-xs block mb-1">Experience Level</span>
                                    <span class="font-bold text-slate-800">${experience}</span>
                                </div>
                                <div>
                                    <span class="text-slate-500 text-xs block mb-1">Target Complexity & Format</span>
                                    <span class="font-bold text-slate-800">${complexity} • ${projectType}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Optional Textarea -->
                        <div class="mb-6">
                            <label for="custom-preferences-input" class="block text-sm font-bold text-slate-800 mb-2">Anything else you'd like your project to include? (Optional)</label>
                            <textarea id="custom-preferences-input" rows="4" maxlength="1000"
                                placeholder="Example: I want something related to education and AI, but I don't want a very complex project. Prefer using Python or React..."
                                class="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 leading-relaxed bg-white"
                                oninput="window.generatorUpdatePreferences(this.value)">${escapeHtml(customPreferences)}</textarea>
                            <div class="flex justify-between text-xs text-slate-400 mt-1">
                                <span>Optional freeform notes for the AI mentor</span>
                                <span>${customPreferences.length}/1000</span>
                            </div>
                        </div>
                    </div>
                    ` : ''}

                    <!-- Navigation Footer Controls -->
                    <div class="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
                        ${step > 1 ? `
                        <button type="button" onclick="window.generatorPrevStep()" 
                            class="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold text-sm transition-colors"
                            ${isLoading ? 'disabled' : ''}>
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                            Back
                        </button>
                        ` : `
                        <div></div>
                        `}

                        ${step < totalSteps ? `
                        <button type="button" onclick="window.generatorNextStep()" 
                            class="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white bg-brand-600 hover:bg-brand-500 font-bold text-sm shadow-md hover:shadow-lg transition-all"
                            ${isLoading ? 'disabled' : ''}>
                            Continue
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                        ` : `
                        <button type="button" onclick="window.generatorSubmit()" 
                            class="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 font-bold text-base shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            ${isLoading ? 'disabled' : ''}>
                            ${isLoading ? `
                                <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Generating...</span>
                            ` : `
                                <span>Generate My Projects →</span>
                            `}
                        </button>
                        `}
                    </div>
                </div>

                <!-- LOADING OVERLAY -->
                ${isLoading ? `
                <div class="absolute inset-0 bg-white/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-8 text-center" role="status" aria-live="polite">
                    <div class="relative w-20 h-20 mb-6">
                        <div class="w-20 h-20 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin"></div>
                        <div class="absolute inset-0 flex items-center justify-center font-bold text-brand-600 text-lg">
                            AI
                        </div>
                    </div>
                    <h3 class="text-xl font-bold text-slate-900 mb-2">Analyzing Your Profile</h3>
                    <p class="text-slate-600 font-medium text-sm max-w-sm transition-all duration-500 h-6" id="loading-status-text">
                        ${loadingMessage}
                    </p>
                    <div class="mt-6 flex gap-1.5 justify-center">
                        <div class="w-2 h-2 rounded-full bg-brand-600 animate-bounce" style="animation-delay: 0s"></div>
                        <div class="w-2 h-2 rounded-full bg-brand-600 animate-bounce" style="animation-delay: 0.2s"></div>
                        <div class="w-2 h-2 rounded-full bg-brand-600 animate-bounce" style="animation-delay: 0.4s"></div>
                    </div>
                </div>
                ` : ''}

            </div>
        </div>
    </section>
    `;
};
