import React from 'react';
import { AppleLogo, GooglePlayLogo, QrCode } from 'phosphor-react';
import { useLoyalty } from '../../context/LoyaltyContext';

export const CtaBanner: React.FC = () => {
  const { language, setSignInModalOpen, signedIn } = useLoyalty();

  return (
    <section
      id="dangky"
      style={{
        background: 'var(--brand)',
        color: '#fff',
      }}
      className="py-16 sm:py-24 relative overflow-hidden"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl leading-tight">
            {language === 'vi'
              ? 'Tải OctaP, quét mã ở lần mua tới.'
              : 'Get OctaP, scan on your next shop.'}
          </h2>

          <p className="mt-4 max-w-xl text-base opacity-90 sm:text-lg leading-relaxed">
            {language === 'vi'
              ? 'Một ứng dụng duy nhất cho mọi thương hiệu trong mạng lưới. Đăng ký chỉ 30 giây bằng Google hoặc Apple zkLogin, nhận ngay 200 Sen chào mừng.'
              : 'One single app across the entire merchant network. Sign up in 30 seconds via Google or Apple zkLogin and collect 200 welcome Petals.'}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => !signedIn && setSignInModalOpen(true)}
              className="flex h-12 items-center gap-2 rounded-xl bg-white px-5 font-semibold text-[var(--brand)] shadow-md transition-all hover:bg-slate-50 cursor-pointer"
            >
              <AppleLogo size={20} weight="fill" />
              <span>App Store</span>
            </button>

            <button
              type="button"
              onClick={() => !signedIn && setSignInModalOpen(true)}
              className="flex h-12 items-center gap-2 rounded-xl bg-white px-5 font-semibold text-[var(--brand)] shadow-md transition-all hover:bg-slate-50 cursor-pointer"
            >
              <GooglePlayLogo size={20} weight="fill" />
              <span>Google Play</span>
            </button>
          </div>
        </div>

        <div className="flex justify-center lg:col-span-5">
          <div className="flex items-center gap-5 rounded-2xl border border-white/25 bg-white/15 p-6 backdrop-blur-md">
            {/* Visual QR Code Box */}
            <div className="flex size-28 shrink-0 flex-col items-center justify-center rounded-xl bg-white p-2 text-center text-[var(--brand)] shadow-sm">
              <QrCode size={64} weight="bold" />
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider mt-0.5">
                {language === 'vi' ? 'QR tải app' : 'Download QR'}
              </span>
            </div>

            <div className="max-w-[200px] text-xs leading-relaxed opacity-95">
              <span className="font-semibold block mb-1">
                {language === 'vi' ? 'Quét mã nhanh' : 'Quick scan'}
              </span>
              <span>
                {language === 'vi'
                  ? 'Quét mã bằng camera điện thoại để mở thẳng ứng dụng hoặc lưu thẻ vào ví.'
                  : 'Scan with your camera to open the loyalty pass directly on your device.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
