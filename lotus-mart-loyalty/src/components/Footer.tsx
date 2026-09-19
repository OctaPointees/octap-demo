import React from 'react';
import { useLoyalty } from '../context/LoyaltyContext';

export const Footer: React.FC = () => {
  const { language } = useLoyalty();

  return (
    <footer
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--line)',
      }}
      className="mt-auto"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-4 py-8 sm:px-8">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <span
            style={{
              display: 'grid',
              placeItems: 'center',
              width: '26px',
              height: '26px',
              borderRadius: '7px',
              background: 'var(--brand)',
              color: '#fff',
              fontFamily: 'var(--display)',
              fontWeight: 700,
              fontSize: '13px',
            }}
          >
            L
          </span>
          <span className="font-display font-bold text-[15px] text-[var(--ink)]">
            Lotus Mart
          </span>
          <span className="text-xs text-[var(--muted)]">© 2026</span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13.5px] text-[var(--ink-2)]">
          <a href="#dieukhoan" className="hover:text-[var(--brand)]">
            {language === 'vi' ? 'Điều khoản chương trình' : 'Programme terms'}
          </a>
          <a href="#riengtu" className="hover:text-[var(--brand)]">
            {language === 'vi' ? 'Quyền riêng tư' : 'Privacy policy'}
          </a>
          <a href="#hotro" className="hover:text-[var(--brand)]">
            {language === 'vi' ? 'Liên hệ hỗ trợ' : 'Support desk'}
          </a>
          <a href="#cuahang" className="hover:text-[var(--brand)]">
            {language === 'vi' ? 'Hệ thống 64 cửa hàng' : 'Store finder (64 branches)'}
          </a>
        </div>

        {/* Powered by OctaP on Sui */}
        <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--muted)]">
          <span>{language === 'vi' ? 'Vận hành bởi' : 'Powered by'}</span>
          <span
            style={{
              display: 'grid',
              placeItems: 'center',
              width: '18px',
              height: '18px',
              borderRadius: '5px',
              background: '#9f0261',
              color: '#fff',
              fontFamily: 'var(--display)',
              fontWeight: 700,
              fontSize: '10px',
            }}
          >
            O
          </span>
          <span className="font-semibold text-[var(--ink)]">OctaP · Sui Network</span>
        </div>
      </div>
    </footer>
  );
};
