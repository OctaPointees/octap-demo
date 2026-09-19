import React from 'react';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { CtaBanner } from './components/landing/CtaBanner';
import { FaqSection } from './components/landing/FaqSection';
import { FastEarnSection } from './components/landing/FastEarnSection';
import { FeaturedRewards } from './components/landing/FeaturedRewards';
import { HeroSection } from './components/landing/HeroSection';
import { HowItWorks } from './components/landing/HowItWorks';
import { TiersSection } from './components/landing/TiersSection';
import { MemberNav } from './components/member/MemberNav';
import { MemberSummary } from './components/member/MemberSummary';
import { PointsHistoryTab } from './components/member/PointsHistoryTab';
import { ProfileTab } from './components/member/ProfileTab';
import { RedeemTab } from './components/member/RedeemTab';
import { RedemptionHistoryTab } from './components/member/RedemptionHistoryTab';
import { VouchersTab } from './components/member/VouchersTab';
import { RedeemModal } from './components/modals/RedeemModal';
import { SignInModal } from './components/modals/SignInModal';
import { SuiTxModal } from './components/modals/SuiTxModal';
import { VoucherDetailModal } from './components/modals/VoucherDetailModal';
import { useLoyalty } from './context/LoyaltyContext';

export const AppContent: React.FC = () => {
  const { currentView, activeTab, toastMessage } = useLoyalty();

  return (
    <div className="flex min-h-screen flex-col bg-[var(--ground)] text-[var(--ink)] antialiased transition-colors duration-200 selection:bg-[var(--brand-soft)] selection:text-[var(--brand)]">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-[var(--ink)] px-4 py-3 text-xs font-semibold text-white shadow-2xl animate-slideUp">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navigation Header */}
      <Header />

      {/* View Switcher: Landing vs Member Portal */}
      {currentView === 'landing' ? (
        <main className="flex-1">
          <HeroSection />
          <HowItWorks />
          <TiersSection />
          <FeaturedRewards />
          <FastEarnSection />
          <FaqSection />
          <CtaBanner />
        </main>
      ) : (
        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 flex flex-col gap-8">
            {/* Top KPI Balance Summary Cards */}
            <MemberSummary />

            {/* Member Tab Switcher */}
            <MemberNav />

            {/* Tab Views */}
            <div className="pt-2">
              {activeTab === 'redeem' && <RedeemTab />}
              {activeTab === 'vouchers' && <VouchersTab />}
              {activeTab === 'redemptions' && <RedemptionHistoryTab />}
              {activeTab === 'points' && <PointsHistoryTab />}
              {activeTab === 'profile' && <ProfileTab />}
            </div>
          </div>
        </main>
      )}

      {/* Site-wide Footer */}
      <Footer />

      {/* Dialog Modals */}
      <SignInModal />
      <RedeemModal />
      <VoucherDetailModal />
      <SuiTxModal />
    </div>
  );
};
