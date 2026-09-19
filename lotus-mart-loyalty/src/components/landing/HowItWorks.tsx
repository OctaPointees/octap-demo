import React from 'react';
import { CheckCircle, DeviceMobile, Gift, QrCode, ShieldCheck } from 'phosphor-react';
import { useLoyalty } from '../../context/LoyaltyContext';

export const HowItWorks: React.FC = () => {
  const { language } = useLoyalty();

  const steps = [
    {
      step: '1',
      icon: QrCode,
      titleVi: 'Quét mã tại quầy',
      titleEn: 'Scan at checkout',
      descVi: 'Mở ứng dụng hoặc trang thành viên, đưa mã QR cho thu ngân. Không cần mang theo thẻ nhựa.',
      descEn: 'Open your member screen and present your QR code to the cashier. Zero plastic cards required.',
    },
    {
      step: '2',
      icon: DeviceMobile,
      titleVi: 'Nhận Sen tự động',
      titleEn: 'Earn Petals automatically',
      descVi: 'Mỗi 10.000 ₫ = 1 Sen. Giao dịch được neo vào chuỗi khối Sui trong vài giây; phí mạng được tài trợ 100%.',
      descEn: '10,000 ₫ = 1 Petal. Landed on Sui in seconds, with 100% sponsored gas fees.',
    },
    {
      step: '3',
      icon: Gift,
      titleVi: 'Đổi Sen lấy quà',
      titleEn: 'Spend your Petals',
      descVi: 'Đổi quà trực tiếp tại Lotus Mart hoặc các đối tác trong liên minh OctaP: rạp phim Lumière, Phố Cà Phê, Sài Gòn Books.',
      descEn: 'Spend inside Lotus Mart or across OctaP network partners: Lumière Cinema, Phố Cà Phê, Sài Gòn Books.',
    },
    {
      step: '4',
      icon: ShieldCheck,
      titleVi: 'Kiểm tra bất cứ lúc nào',
      titleEn: 'Check it any time',
      descVi: 'Mỗi biến động số dư đều có mã băm (tx digest) công khai trên Sui Explorer để đối chiếu minh bạch.',
      descEn: 'Every credit or debit holds a public digest verifiable independently on the Sui blockchain.',
    },
  ];

  return (
    <section
      id="cachhoatdong"
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--line)',
        borderBottom: '1px solid var(--line)',
      }}
      className="py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <div className="flex items-baseline gap-3 mb-2">
          <span className="font-mono text-sm font-bold text-[var(--brand)]">01</span>
          <h2 className="font-display text-2xl font-bold tracking-tight text-[var(--ink)] sm:text-3xl">
            {language === 'vi' ? 'Cách hoạt động' : 'How it works'}
          </h2>
        </div>

        <p className="max-w-2xl text-[var(--ink-2)] text-base mb-12">
          {language === 'vi'
            ? 'Bốn bước đơn giản, không thẻ nhựa, không cần nhớ mã số. Tài khoản của bạn là một danh tính an toàn trên chuỗi khối — nhưng dễ dùng như mọi ứng dụng thông thường.'
            : 'Four intuitive steps, zero plastic cards, no membership codes to memorise. Your account is anchored on-chain with Web2 simplicity.'}
        </p>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div
              key={s.step}
              className="flex flex-col gap-3 rounded-2xl border border-[var(--line)] bg-[var(--ground)] p-6 transition-all hover:-translate-y-1 hover:border-[var(--brand)] hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span
                  style={{
                    background: 'var(--brand-soft)',
                    color: 'var(--brand)',
                  }}
                  className="flex size-10 items-center justify-center rounded-xl font-display font-bold text-base"
                >
                  {s.step}
                </span>
                <s.icon size={22} className="text-[var(--muted)]" />
              </div>

              <h3 className="font-display mt-2 text-lg font-bold text-[var(--ink)]">
                {language === 'vi' ? s.titleVi : s.titleEn}
              </h3>

              <p className="text-sm leading-relaxed text-[var(--ink-2)]">
                {language === 'vi' ? s.descVi : s.descEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
