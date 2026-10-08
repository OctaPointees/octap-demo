import { Link } from 'react-router';
import type { Language } from '../types';
import { DICTIONARY } from '../content';

interface LandingFooterProps {
  lang: Language;
}

export const LandingFooter = ({ lang }: LandingFooterProps) => {
  const f = DICTIONARY[lang].footer;

  return (
    <footer className="border-t border-[var(--line)] bg-[var(--ground)] py-12 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand Col */}
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-primary p-1.5 flex items-center justify-center">
                <img src="/icons/logo_dark.png" alt="OctaP Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-display text-base font-bold text-[var(--ink)]">OctaP</span>
            </div>
            <p className="text-[var(--muted)] max-w-sm leading-relaxed">
              {f.tagline}
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 font-mono text-[10px] font-semibold text-emerald-700">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{f.networkStatus}</span>
            </div>
          </div>

          {/* Product Col */}
          <div className="space-y-2">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--ink)]">
              {f.colProduct}
            </span>
            <ul className="space-y-1.5 text-[var(--muted)] font-medium">
              <li><a href="#why" className="hover:text-primary transition-colors">{f.features}</a></li>
              <li><a href="#pillars" className="hover:text-primary transition-colors">{f.tenantIsolation}</a></li>
              <li><a href="#architecture" className="hover:text-primary transition-colors">{f.zkLogin}</a></li>
              <li><a href="#developers" className="hover:text-primary transition-colors">{f.mcpServer}</a></li>
            </ul>
          </div>

          {/* Developers Col */}
          <div className="space-y-2">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--ink)]">
              {f.colDevelopers}
            </span>
            <ul className="space-y-1.5 text-[var(--muted)] font-medium">
              <li><a href="#developers" className="hover:text-primary transition-colors">{f.sdk}</a></li>
              <li><a href="#developers" className="hover:text-primary transition-colors">{f.apiDocs}</a></li>
              <li><a href="#architecture" className="hover:text-primary transition-colors">{f.suiExplorer}</a></li>
              <li><Link to="/login" className="hover:text-primary transition-colors">{f.sandbox}</Link></li>
            </ul>
          </div>

          {/* Ecosystem Col */}
          <div className="space-y-2">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--ink)]">
              {f.colEcosystem}
            </span>
            <ul className="space-y-1.5 text-[var(--muted)] font-medium">
              <li><Link to="/login?email=owner@lotusmart.vn" className="hover:text-primary transition-colors">{f.lotusMart}</Link></li>
              <li><a href="#ecosystem" className="hover:text-primary transition-colors">{f.phoCaPhe}</a></li>
              <li><a href="#ecosystem" className="hover:text-primary transition-colors">{f.saigonBooks}</a></li>
              <li><Link to="/wallet" className="hover:text-primary transition-colors">{f.customerWallet}</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono text-[var(--muted)]">
          <span>{f.copyright}</span>
          <div className="flex gap-4">
            <span className="hover:text-primary transition-colors cursor-pointer">Sui Move Framework</span>
            <span>·</span>
            <span className="hover:text-primary transition-colors cursor-pointer">Enoki zkLogin</span>
            <span>·</span>
            <span className="hover:text-primary transition-colors cursor-pointer">Model Context Protocol</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
