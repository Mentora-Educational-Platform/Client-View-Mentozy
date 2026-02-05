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
