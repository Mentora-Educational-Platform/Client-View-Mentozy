"use client";
import { lazy, Suspense } from 'react';
import { HeroSection } from '../HeroSection';


// Lazy load heavy page components
const FeaturesSection = lazy(() => import('../FeaturesSection').then(module => ({ default: module.FeaturesSection })));
const HowItWorks = lazy(() => import('../HowItWorks').then(module => ({ default: module.HowItWorks })));
const MentorshipFormats = lazy(() => import('../MentorshipFormats').then(module => ({ default: module.MentorshipFormats })));
const LearningTracks = lazy(() => import('../LearningTracks').then(module => ({ default: module.LearningTracks })));
const TeamSection = lazy(() => import('../TeamSection').then(module => ({ default: module.TeamSection })));
const CTASection = lazy(() => import('../CTASection').then(module => ({ default: module.CTASection })));
const Opportunities = lazy(() => import('../Opportunities').then(module => ({ default: module.Opportunities })));
const TechnologySection = lazy(() => import('../TechnologySection').then(module => ({ default: module.TechnologySection })));
const WhatWeDoDifferently = lazy(() => import('../WhatWeDoDifferently').then(module => ({ default: module.WhatWeDoDifferently })));
const WhoItsFor = lazy(() => import('../WhoItsFor').then(module => ({ default: module.WhoItsFor })));

// HomePage component
export function HomePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
            </div>
        }>
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
            <TeamSection />
            <div id="pricing"><CTASection /></div>
        </Suspense>
    );
}
