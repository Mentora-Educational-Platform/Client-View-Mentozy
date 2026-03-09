import { HeroSection } from '../components/HeroSection';
import { lazy } from 'react';


// Lazy load heavy page components
const FeaturesSection = lazy(() => import('../components/FeaturesSection').then(module => ({ default: module.FeaturesSection })));
const HowItWorks = lazy(() => import('../components/HowItWorks').then(module => ({ default: module.HowItWorks })));
const MentorshipFormats = lazy(() => import('../components/MentorshipFormats').then(module => ({ default: module.MentorshipFormats })));
const LearningTracks = lazy(() => import('../components/LearningTracks').then(module => ({ default: module.LearningTracks })));

const CTASection = lazy(() => import('../components/CTASection').then(module => ({ default: module.CTASection })));
const Opportunities = lazy(() => import('../components/Opportunities').then(module => ({ default: module.Opportunities })));
const TechnologySection = lazy(() => import('../components/TechnologySection').then(module => ({ default: module.TechnologySection })));
const WhatWeDoDifferently = lazy(() => import('../components/WhatWeDoDifferently').then(module => ({ default: module.WhatWeDoDifferently })));
const WhoItsFor = lazy(() => import('../components/WhoItsFor').then(module => ({ default: module.WhoItsFor })));

// HomePage component
export function HomePage() {
    return (
        <>
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white py-3 text-sm md:text-base font-medium shadow-sm overflow-hidden flex whitespace-nowrap">
                <style>
                    {`
                    @keyframes marquee {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    .animate-marquee {
                        display: flex;
                        width: max-content;
                        animation: marquee 20s linear infinite;
                    }
                    `}
                </style>
                <div className="animate-marquee">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex-none px-4 md:px-8 w-screen flex items-center justify-center">
                            <span>
                                Our on going live events{" "}
                                <a
                                    href="https://ignite-hack-2-0.devpost.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-bold underline decoration-2 underline-offset-2 hover:text-yellow-200 transition-colors"
                                >
                                    &quot;ignite hack 2.0&quot;
                                </a>
                                {" "}a global hackthon hosted by &apos;
                                <a
                                    href="https://krishnaite.vercel.app/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-bold underline decoration-2 underline-offset-2 hover:text-yellow-200 transition-colors"
                                >
                                    Krishnaite
                                </a>
                                &apos; and sponsered by Mentozy
                            </span>
                            <span className="ml-8 md:ml-16 opacity-60 text-lg">•</span>
                        </div>
                    ))}
                </div>
            </div>
            <div id="home"><HeroSection /></div>
            <div id="features"><FeaturesSection /></div>
            <div id="how-it-works"><HowItWorks /></div>
            <WhatWeDoDifferently />
            <WhoItsFor />
            <div id="learning-tracks"><LearningTracks /></div>
            <MentorshipFormats />
            <TechnologySection />
            <div id="opportunities">
                <Opportunities />
            </div>

            <div id="pricing"><CTASection /></div>
        </>
    );
}
