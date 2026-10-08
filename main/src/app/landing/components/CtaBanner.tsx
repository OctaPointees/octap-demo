import { Link } from 'react-router';
import { ArrowRight, DeviceMobile, ShieldCheck, Storefront, Receipt, Users } from 'phosphor-react';
import type { Language } from '../types';
import { DICTIONARY } from '../content';

interface CtaBannerProps {
  lang: Language;
}

export const CtaBanner = ({ lang }: CtaBannerProps) => {
  const cta = DICTIONARY[lang].cta;
  const demos = DICTIONARY[lang].demoAccounts;

  const PERSONA_ICONS = [ShieldCheck, Storefront, Receipt, DeviceMobile];

  return (
    <section className="relative overflow-hidden bg-secondary py-16 sm:py-24 text-white">
      {/* Background Decorative Blobs */}
      <div className="absolute -top-32 -right-32 size-96 rounded-full bg-primary/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-20 size-96 rounded-full bg-sky-500/20 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main CTA text */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {cta.title}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/80 leading-relaxed">
            {cta.subtitle}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/30 hover:bg-[#830250] transition-all hover:scale-105 active:scale-95"
            >
              <span>{cta.btnLaunch}</span>
              <ArrowRight size={16} weight="bold" />
            </Link>

            <Link
              to="/wallet"
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/20 transition-all"
            >
              <DeviceMobile size={18} />
              <span>{cta.btnWallet}</span>
            </Link>
          </div>
        </div>

        {/* Demo Personas Launchpad */}
        <div className="border-t border-white/10 pt-10">
          <div className="text-center mb-6">
            <h3 className="font-display text-lg font-bold text-white">
              {demos.title}
            </h3>
            <p className="text-xs text-white/60 font-mono mt-1">
              {demos.subtitle} · <span className="text-primary font-bold">{demos.passwordHint}</span>
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {demos.cards.map((card, idx) => {
              const IconCmp = PERSONA_ICONS[idx] || Users;
              return (
                <div
                  key={idx}
                  className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xs transition-all hover:bg-white/10 hover:border-white/20"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="size-9 rounded-lg bg-white/10 flex items-center justify-center text-white">
                        <IconCmp size={18} weight="bold" />
                      </div>
                      <span className="font-mono text-[10px] text-white/50">
                        Persona 0{idx + 1}
                      </span>
                    </div>

                    <h4 className="font-display text-sm font-bold text-white">
                      {card.role}
                    </h4>
                    <span className="font-mono text-[10px] text-white/70 block mb-2">
                      {card.email}
                    </span>
                    <p className="text-xs text-white/70 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10">
                    <Link
                      to={card.link}
                      className="flex items-center justify-between text-xs font-semibold text-white group"
                    >
                      <span className="group-hover:underline">{card.cta}</span>
                      <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
