import { useState } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { FeaturesSection } from './components/FeaturesSection';
import { HowItWorks } from './components/HowItWorks';
import { MentorshipFormats } from './components/MentorshipFormats';
import { LearningTracks } from './components/LearningTracks';
import { TeamSection } from './components/TeamSection';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';
import { Opportunities } from './components/Opportunities';
import { TechnologySection } from './components/TechnologySection';
import { WhatWeDoDifferently } from './components/WhatWeDoDifferently';
import { WhoItsFor } from './components/WhoItsFor';
import { CareerPage } from './pages/CareerPage';
import { MentorsPage } from './pages/MentorsPage';
import { TracksPage } from './pages/TracksPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

export type Page = 'home' | 'careers' | 'mentors' | 'tracks' | 'about' | 'contact' | 'login' | 'signup';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const handleNavigate = (page: Page, sectionId?: string) => {
    setCurrentPage(page);

    if (page === 'home') {
      if (sectionId) {
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Login and Signup pages should not have Header/Footer for a focused flow
  if (currentPage === 'login') {
    return <LoginPage onNavigate={handleNavigate} />;
  }

  if (currentPage === 'signup') {
    return <SignupPage onNavigate={handleNavigate} />;
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <Header onNavigate={handleNavigate} currentPage={currentPage} />

      <main>
        {currentPage === 'home' && (
          <>
            <div id="home"><HeroSection onNavigate={handleNavigate} /></div>
            <div id="features"><FeaturesSection /></div>
            <div id="how-it-works"><HowItWorks /></div>
            <WhatWeDoDifferently />
            <WhoItsFor />
            <div id="learning-tracks"><LearningTracks /></div>
            <MentorshipFormats />
            <TechnologySection />
            <div id="opportunities">
              <Opportunities onNavigate={handleNavigate} />
            </div>
            <TeamSection />
            <div id="pricing"><CTASection onNavigate={handleNavigate} /></div>
          </>
        )}
        {currentPage === 'careers' && <CareerPage />}
        {currentPage === 'mentors' && <MentorsPage />}
        {currentPage === 'tracks' && <TracksPage />}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'contact' && <ContactPage onNavigate={handleNavigate} />}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default App;