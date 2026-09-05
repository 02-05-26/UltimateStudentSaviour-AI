import { WorkflowStep } from './WorkflowStep.js';

export const WorkflowSection = () => `
<section class="py-24 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
            <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900">Your next project starts in three steps.</h2>
        </div>

        <div class="flex flex-col md:flex-row justify-between items-start gap-12 relative">
            ${WorkflowStep({
                step: '1',
                title: 'Tell us about yourself',
                description: 'Select your interests, skills, experience, and preferred technology.',
                isLast: false
            })}
            
            ${WorkflowStep({
                step: '2',
                title: 'Get projects built around you',
                description: 'AI generates and evaluates project ideas specifically for your profile.',
                isLast: false
            })}
            
            ${WorkflowStep({
                step: '3',
                title: 'Build with a plan',
                description: 'Choose an idea and receive a practical blueprint, roadmap, mentor guidance, and presentation.',
                isLast: true
            })}
        </div>
    </div>
</section>
`;
