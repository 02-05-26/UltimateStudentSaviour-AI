import { BRAND } from '../config.js';

export const Navbar = () => `
<header class="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
            <!-- Logo -->
            <div class="flex-shrink-0 flex items-center">
                <a href="#" class="flex items-center gap-2 group" aria-label="${BRAND.name} Home">
                    <div class="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-xl group-hover:bg-brand-500 transition-colors">
                        U
                    </div>
                    <span class="font-bold text-lg md:text-xl tracking-tight text-slate-900 hidden sm:block">
                        UltimateStudentSaviour <span class="text-brand-600">AI</span>
                    </span>
                    <span class="font-bold text-xl tracking-tight text-slate-900 sm:hidden">
                        ${BRAND.compactName}
                    </span>
                </a>
            </div>

            <!-- Desktop Navigation -->
            <nav class="hidden md:flex space-x-8" aria-label="Main Navigation">
                <a href="#" class="text-slate-600 hover:text-brand-600 font-medium transition-colors">Home</a>
                <a href="#generate" class="text-slate-600 hover:text-brand-600 font-medium transition-colors">Generate</a>
                <a href="#dashboard" class="text-slate-600 hover:text-brand-600 font-medium transition-colors">My Projects</a>
                <a href="#compare" class="text-slate-600 hover:text-brand-600 font-medium transition-colors">Compare</a>
                <a href="#mentor" class="text-slate-600 hover:text-brand-600 font-medium transition-colors">Mentor</a>
                <a href="#resources" class="text-slate-600 hover:text-brand-600 font-medium transition-colors">Resources</a>
            </nav>

            <!-- CTA & Sign In -->
            <div class="hidden md:flex items-center space-x-4">
                <a href="#signin" class="text-slate-600 hover:text-slate-900 font-medium transition-colors">Sign In</a>
                <a href="#generate" class="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-sm">
                    Create My Project
                </a>
            </div>

            <!-- Mobile menu button -->
            <div class="flex md:hidden items-center">
                <button type="button" onclick="toggleMobileMenu()" class="text-slate-600 hover:text-slate-900 focus:outline-none p-2" aria-label="Open mobile menu">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <!-- Mobile Navigation Drawer -->
    <div id="mobile-menu" class="hidden md:hidden bg-white border-b border-slate-200">
        <div class="px-4 pt-2 pb-6 space-y-1">
            <a href="#" class="block px-3 py-2 rounded-md text-base font-medium text-slate-900 bg-slate-50">Home</a>
            <a href="#generate" class="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50">Generate</a>
            <a href="#dashboard" class="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50">My Projects</a>
            <a href="#compare" class="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50">Compare</a>
            <a href="#mentor" class="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50">Mentor</a>
            <a href="#resources" class="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50">Resources</a>
            <div class="mt-4 pt-4 border-t border-slate-100 flex flex-col space-y-3 px-3">
                <a href="#signin" class="text-center text-slate-600 font-medium">Sign In</a>
                <a href="#generate" class="text-center bg-brand-600 text-white px-4 py-2 rounded-lg font-medium">Create My Project</a>
            </div>
        </div>
    </div>
</header>
`;
