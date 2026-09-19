import React, { useState } from 'react';
import {
  ArrowSquareOut,
  CaretDown,
  Globe,
  Palette,
  SignIn,
  SignOut,
  Sparkle,
  Storefront,
  User,
} from 'phosphor-react';
import { useLoyalty } from '../context/LoyaltyContext';
import { BRAND_COLORS } from '../data/initialData';

export const Header: React.FC = () => {
  const {
    language,
    toggleLanguage,
    brandColor,
    setBrandColor,
    currentView,
    setCurrentView,
    signedIn,
    setSignedIn,
    user,
    setSignInModalOpen,
    setActiveTab,
  } = useLoyalty();

  const [colorMenuOpen, setColorMenuOpen] = useState(false);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'rgba(250, 247, 249, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--line)',
      }}
      className="transition-colors duration-200"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
        {/* Left: Brand Identity & View Badges */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setCurrentView('landing')}
            className="flex cursor-pointer items-center gap-2"
            title="Lotus Mart Loyalty (OctaP Network)"
          >
            <div className="flex items-center gap-1.5">
              <span
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: '#9f0261',
                  color: '#fff',
                  fontFamily: 'var(--display)',
                  fontWeight: 700,
                  fontSize: '14px',
                }}
              >
                O
              </span>
              <span style={{ color: 'var(--muted)', fontSize: '12px' }}>×</span>
              <span
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'var(--brand)',
                  color: '#fff',
                  fontFamily: 'var(--display)',
                  fontWeight: 700,
                  fontSize: '14px',
                }}
              >
                L
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-base leading-tight tracking-tight text-[var(--ink)]">
                Lotus Mart
              </span>
              <span className="font-mono text-[10px] tracking-wider text-[var(--muted)] uppercase">
                lotusmart.octap.vn
              </span>
            </div>
          </div>

          {/* Navigation mode pills */}
          <div className="hidden items-center gap-1 ml-4 rounded-full border border-[var(--line)] bg-[var(--surface)] p-1 text-xs font-semibold md:flex">
            <button
              type="button"
              onClick={() => setCurrentView('landing')}
              className={`rounded-full px-3 py-1 transition-all ${
                currentView === 'landing'
                  ? 'bg-[var(--brand)] text-white shadow-xs'
                  : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
              }`}
            >
              {language === 'vi' ? 'Trang chủ' : 'Landing'}
            </button>
            <button
              type="button"
              onClick={() => {
                if (!signedIn) {
                  setSignInModalOpen(true);
                } else {
                  setCurrentView('member');
                }
              }}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 transition-all ${
                currentView === 'member'
                  ? 'bg-[var(--brand)] text-white shadow-xs'
                  : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
              }`}
            >
              <Sparkle size={13} weight="fill" className={currentView === 'member' ? 'text-amber-200' : 'text-amber-500'} />
              <span>{language === 'vi' ? 'Khu vực Thành viên' : 'Member Portal'}</span>
              {signedIn && (
                <span className="ml-1 rounded-full bg-black/10 px-1.5 py-0.2 font-mono text-[10px]">
                  {user.balance.toLocaleString()}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Right Actions: Theme Palette, Language Switcher, User Profile / Sign in */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Brand Palette Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setColorMenuOpen(!colorMenuOpen)}
              className="flex h-8 items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-2.5 text-xs text-[var(--ink-2)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
              title={language === 'vi' ? 'Đổi màu thương hiệu' : 'Switch Brand Color'}
            >
              <span
                className="size-3 rounded-full border border-black/20"
                style={{ backgroundColor: brandColor }}
              />
              <Palette size={14} />
              <CaretDown size={11} />
            </button>

            {colorMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-2 shadow-xl z-50">
                <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                  {language === 'vi' ? 'Màu thương hiệu' : 'Brand Theme'}
                </div>
                {BRAND_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => {
                      setBrandColor(c.hex);
                      setColorMenuOpen(false);
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                      brandColor === c.hex ? 'bg-[var(--brand-soft)] font-semibold text-[var(--brand)]' : 'hover:bg-[var(--surface-2)] text-[var(--ink)]'
                    }`}
                  >
                    <span
                      className="size-3.5 rounded-full border border-black/20"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex h-8 items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--surface)] px-2.5 font-mono text-[11px] font-semibold tracking-wider text-[var(--ink-2)] transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
          >
            <Globe size={13} />
            <span>{language.toUpperCase()}</span>
          </button>

          {/* Auth State */}
          {signedIn ? (
            <div className="flex items-center gap-2 pl-1">
              <div
                onClick={() => {
                  setCurrentView('member');
                  setActiveTab('profile');
                }}
                className="flex cursor-pointer items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] p-1 pr-2.5 hover:border-[var(--brand)]"
              >
                <span
                  style={{
                    display: 'grid',
                    placeItems: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--brand-soft)',
                    color: 'var(--brand)',
                    fontFamily: 'var(--display)',
                    fontWeight: 700,
                    fontSize: '13px',
                  }}
                >
                  K
                </span>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-[12.5px] font-semibold leading-tight text-[var(--ink)] truncate max-w-[110px]">
                    {user.name}
                  </span>
                  <span className="text-[10px] font-semibold text-amber-600">
                    {language === 'vi' ? 'Hạng Vàng' : 'Gold tier'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSignedIn(false);
                  setCurrentView('landing');
                }}
                className="hidden sm:flex size-8 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-red-600"
                title={language === 'vi' ? 'Đăng xuất' : 'Sign out'}
              >
                <SignOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSignInModalOpen(true)}
                className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-[var(--ink-2)] hover:text-[var(--brand)]"
              >
                <SignIn size={15} />
                <span>{language === 'vi' ? 'Đăng nhập' : 'Sign in'}</span>
              </button>
              <button
                type="button"
                onClick={() => setSignInModalOpen(true)}
                style={{
                  background: 'var(--brand)',
                  color: '#fff',
                }}
                className="flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold shadow-xs transition-opacity hover:opacity-95"
              >
                <span>{language === 'vi' ? 'Đăng ký' : 'Sign up'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile view navigation switch bar */}
      <div className="flex items-center justify-center gap-2 border-t border-[var(--line)] bg-[var(--surface)] px-4 py-1.5 md:hidden text-xs">
        <button
          type="button"
          onClick={() => setCurrentView('landing')}
          className={`flex-1 rounded-md py-1 font-semibold text-center ${
            currentView === 'landing' ? 'bg-[var(--brand)] text-white' : 'text-[var(--ink-2)]'
          }`}
        >
          {language === 'vi' ? 'Trang chủ' : 'Landing'}
        </button>
        <button
          type="button"
          onClick={() => {
            if (!signedIn) {
              setSignInModalOpen(true);
            } else {
              setCurrentView('member');
            }
          }}
          className={`flex-1 rounded-md py-1 font-semibold text-center ${
            currentView === 'member' ? 'bg-[var(--brand)] text-white' : 'text-[var(--ink-2)]'
          }`}
        >
          {language === 'vi' ? 'Thành viên' : 'Member'}
        </button>
      </div>
    </header>
  );
};
