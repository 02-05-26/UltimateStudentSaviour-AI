import { BRAND } from '../config.js';

export const Footer = () => `
<footer class="bg-white border-t border-slate-200 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-4 gap-8">
            <div class="md:col-span-1">
                <a href="#" class="flex items-center gap-2 group mb-4">
                    <div class="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-xl">
                        U
                    </div>
                    <span class="font-bold text-xl tracking-tight text-slate-900">${BRAND.shortName} <span class="text-brand-600">AI</span></span>
                </a>
                <p class="text-slate-500 text-sm italic mb-2">"${BRAND.tagline}"</p>
                <p class="text-slate-500 text-sm">An AI-powered project companion for final-year students.</p>
            </div>
            
            <div>
                <h4 class="font-semibold text-slate-900 mb-4">Product</h4>
                <ul class="space-y-2 text-sm text-slate-600">
                    <li><a href="#generate" class="hover:text-brand-600 transition-colors">Generate</a></li>
                    <li><a href="#projects" class="hover:text-brand-600 transition-colors">My Projects</a></li>
                    <li><a href="#mentor" class="hover:text-brand-600 transition-colors">Mentor</a></li>
                </ul>
            </div>
            
            <div>
                <h4 class="font-semibold text-slate-900 mb-4">Resources</h4>
                <ul class="space-y-2 text-sm text-slate-600">
                    <li><a href="#resources" class="hover:text-brand-600 transition-colors">Documentation</a></li>
                    <li><a href="#resources" class="hover:text-brand-600 transition-colors">Student Guides</a></li>
                </ul>
            </div>
            
            <div>
                <h4 class="font-semibold text-slate-900 mb-4">Legal</h4>
                <ul class="space-y-2 text-sm text-slate-600">
                    <li><a href="#privacy" class="hover:text-brand-600 transition-colors">Privacy</a></li>
                    <li><a href="#terms" class="hover:text-brand-600 transition-colors">Terms</a></li>
                </ul>
            </div>
        </div>
        <div class="mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <p>&copy; 2026 ${BRAND.name}. All rights reserved.</p>
            <p>For Final-Year Students</p>
        </div>
    </div>
</footer>
`;
