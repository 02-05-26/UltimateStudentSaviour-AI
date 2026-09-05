import { FeatureCard } from './FeatureCard.js';

export const CoreValueSection = () => `
<section class="py-24 bg-slate-50 relative">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="text-center max-w-3xl mx-auto mb-16">
            <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">From a rough idea to a project you can actually build.</h2>
            <p class="text-lg text-slate-600">The complete journey for your final-year project.</p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            ${FeatureCard({
                number: '01',
                title: 'DISCOVER',
                description: 'Tell us what you know and what you want to build.'
            })}
            ${FeatureCard({
                number: '02',
                title: 'EVALUATE',
                description: 'Compare ideas by feasibility, innovation, complexity, and final-year suitability.'
            })}
            ${FeatureCard({
                number: '03',
                title: 'BUILD',
                description: 'Turn your selected idea into a practical project blueprint and development roadmap.'
            })}
            ${FeatureCard({
                number: '04',
                title: 'MENTOR',
                description: 'Get contextual AI guidance whenever you get stuck.'
            })}
            ${FeatureCard({
                number: '05',
                title: 'PRESENT',
                description: 'Create a project-specific presentation, speaker notes, and viva preparation.'
            })}
        </div>
    </div>
</section>
`;
