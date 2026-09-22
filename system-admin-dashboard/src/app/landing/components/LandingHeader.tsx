import { useState } from 'react';
import { Link } from 'react-router';
import { Globe, List, X, ArrowRight, DeviceMobile, SignIn } from 'phosphor-react';
import type { Language } from '../types';
import { DICTIONARY } from '../content';
import { useSession } from '../../../queries/useSession';
import { homeFor } from '../../../utils/constants';

interface LandingHeaderProps {
  lang: Language;
  onToggleLang: () => void;
}

export const LandingHeader = ({ lang, onToggleLang }: LandingHeaderProps) => {
  const session = useSession();
  const t = DICTIONARY[lang].nav;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: t.whyOctap, href: '#why' },
    { label: t.features, href: '#pillars' },
    { label: t.architecture, href: '#architecture' },
    { label: t.developers, href: '#developers' },
    { label: t.ecosystem, href: '#ecosystem' },
    { label: t.calculator, href: '#calculator' },
    { label: t.faq, href: '#faq' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--line)] bg-[var(--ground)]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="size-9 rounded-xl bg-primary p-1.5 flex items-center justify-center shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
            <img src="/icons/logo_dark.png" alt="OctaP Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-lg tracking-tight text-[var(--ink)]">OctaP</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-primary">
                CaaS on Sui
              </span>
            </div>
            <span className="text-[10px] text-[var(--muted)] font-mono tracking-tight hidden sm:block">
              Credit-as-a-Service
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[var(--ink-2)] transition-colors hover:bg-black/5 hover:text-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Action Controls & Language */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* Language Switcher */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1.5 text-xs font-mono font-medium text-[var(--ink-2)] hover:border-primary hover:text-primary transition-all shadow-xs"
            title="Switch Language"
          >
            <Globe size={14} className="text-primary" />
            <span>{lang === 'en' ? 'EN / VI' : 'VI / EN'}</span>
          </button>

          {/* Wallet Demo Link */}
          <Link
            to="/wallet"
            className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
          >
            <DeviceMobile size={15} />
            <span>{t.wallet}</span>
          </Link>

          {/* Sign In / Dashboard CTA */}
          {session ? (
            <Link
              to={homeFor(session.user.role)}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#830250] transition-colors"
            >
              <span>{t.dashboard}</span>
              <ArrowRight size={13} weight="bold" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#830250] transition-colors"
            >
              <SignIn size={14} weight="bold" />
              <span>{t.login}</span>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1 rounded-md border border-[var(--line)] bg-[var(--surface)] px-2 py-1 text-xs font-mono text-[var(--ink-2)]"
          >
            <Globe size={12} />
            <span>{lang.toUpperCase()}</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg border border-[var(--line)] p-2 text-[var(--ink)] hover:bg-black/5"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <List size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[var(--line)] bg-[var(--surface)] px-4 py-4 space-y-2 animate-fadeIn">
          <div className="flex flex-col gap-1 pb-3 border-b border-[var(--line)]">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-black/5 hover:text-primary"
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Link
              to="/wallet"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 rounded-lg border border-primary/20 bg-primary/5 py-2.5 text-sm font-semibold text-primary"
            >
              <DeviceMobile size={16} />
              <span>{t.wallet}</span>
            </Link>
            {session ? (
              <Link
                to={homeFor(session.user.role)}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white"
              >
                <span>{t.dashboard}</span>
                <ArrowRight size={15} weight="bold" />
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white"
              >
                <SignIn size={16} weight="bold" />
                <span>{t.login}</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
