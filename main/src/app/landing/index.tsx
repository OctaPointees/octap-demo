import { useState } from 'react';
import type { Language, SuiDigestDetail } from './types';
import { LandingHeader } from './components/LandingHeader';
import { HeroSection } from './components/HeroSection';
import { MetricsTicker } from './components/MetricsTicker';
import { WhyOctaPSection } from './components/WhyOctaPSection';
import { PillarsSection } from './components/PillarsSection';
import { ArchitectureDiagram } from './components/ArchitectureDiagram';
import { DeveloperSection } from './components/DeveloperSection';
import { EcosystemSection } from './components/EcosystemSection';
import { RoiCalculator } from './components/RoiCalculator';
import { FaqSection } from './components/FaqSection';
import { CtaBanner } from './components/CtaBanner';
import { LandingFooter } from './components/LandingFooter';
import { SuiDigestModal } from './components/SuiDigestModal';

export default function OctaPLandingPage() {
  const [lang, setLang] = useState<Language>('en');
  const [inspectedDigest, setInspectedDigest] = useState<SuiDigestDetail | null>(null);

  const toggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'vi' : 'en'));
  };

  return (
    <div className="min-h-screen bg-[var(--ground)] text-[var(--ink)] antialiased selection:bg-primary/20 selection:text-primary">
      {/* Navigation Header */}
      <LandingHeader lang={lang} onToggleLang={toggleLang} />

      {/* Hero Section with Interactive Live Simulator */}
      <HeroSection lang={lang} onInspectDigest={setInspectedDigest} />

      {/* High-Impact Platform KPI Ticker */}
      <MetricsTicker lang={lang} />

      {/* Market Comparison: Why OctaP? */}
      <WhyOctaPSection lang={lang} />

      {/* 6 Core Architectural Pillars */}
      <PillarsSection lang={lang} />

      {/* End-to-End Cryptographic Flow Topology */}
      <ArchitectureDiagram lang={lang} />

      {/* Developer Experience: SDK & MCP Code Playground */}
      <DeveloperSection lang={lang} />

      {/* Multi-Tenant Partner Ecosystem */}
      <EcosystemSection lang={lang} />

      {/* Interactive ROI & Fraud Savings Calculator */}
      <RoiCalculator lang={lang} />

      {/* Frequently Asked Questions */}
      <FaqSection lang={lang} />

      {/* CTA Banner & Demo Personas Launchpad */}
      <CtaBanner lang={lang} />

      {/* Enterprise Footer */}
      <LandingFooter lang={lang} />

      {/* Cryptographic Sui Digest Proof Inspector Dialog */}
      <SuiDigestModal
        digest={inspectedDigest}
        onClose={() => setInspectedDigest(null)}
        lang={lang}
      />
    </div>
  );
}
