import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { HowItWorks } from './components/HowItWorks';
import { WhoItsFor } from './components/WhoItsFor';
import { WhatWeDoDifferently } from './components/WhatWeDoDifferently';
import { MentorshipFormats } from './components/MentorshipFormats';
import { LearningTracks } from './components/LearningTracks';
import { Opportunities } from './components/Opportunities';
import { TeamSection } from './components/TeamSection';
import { TechnologySection } from './components/TechnologySection';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <HowItWorks />
      <WhoItsFor />
      <WhatWeDoDifferently />
      <MentorshipFormats />
      <LearningTracks />
      <Opportunities />
      <TeamSection />
      <TechnologySection />
      <CTASection />
      <Footer />
    </div>
  );
}