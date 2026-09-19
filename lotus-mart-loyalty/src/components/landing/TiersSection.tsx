import React from 'react';
import { CheckCircle, Crown, Sparkle } from 'phosphor-react';
import { useLoyalty } from '../../context/LoyaltyContext';

export const TiersSection: React.FC = () => {
  const { language, user, signedIn } = useLoyalty();

  const tiers = [
    {
      key: 'bronze',
      nameVi: 'Đồng · Bronze',
      nameEn: 'Bronze',
      multiplier: '1×',
      rangeVi: '0 – 2.500 Sen',
      rangeEn: '0 – 2,500 Petals',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      benefitsVi: [
        'Tích Sen cơ bản trên mọi hoá đơn',
        'Đổi voucher trong mạng lưới OctaP',
        'Sen có thời hạn 12 tháng',
      ],
      benefitsEn: [
        'Base earn rate on every bill',
        'Redeem vouchers across OctaP network',
        '12-month Petal expiration',
      ],
    },
    {
      key: 'silver',
      nameVi: 'Bạc · Silver',
      nameEn: 'Silver',
      multiplier: '1.25×',
      rangeVi: '2.500 – 8.000 Sen',
      rangeEn: '2,500 – 8,000 Petals',
      badgeColor: 'bg-slate-200 text-slate-800 border-slate-300',
      benefitsVi: [
        'Mọi quyền lợi của hạng Đồng',
        'Miễn phí giao hàng cho đơn từ 300.000 ₫',
        'Tặng 200 Sen sinh nhật',
      ],
      benefitsEn: [
        'All Bronze benefits included',
        'Free delivery on orders over 300,000 ₫',
        '200 Petals birthday reward',
      ],
    },
    {
      key: 'gold',
      nameVi: 'Vàng · Gold',
      nameEn: 'Gold',
      multiplier: '1.5×',
      rangeVi: '8.000 – 20.000 Sen',
      rangeEn: '8,000 – 20,000 Petals',
      badgeColor: 'bg-amber-200 text-amber-900 border-amber-400',
      isCurrentTier: true,
      benefitsVi: [
        'Mọi quyền lợi của hạng Bạc',
        'Quầy thanh toán ưu tiên tại siêu thị',
        'Mở sớm đợt quà giới hạn 24 giờ',
      ],
      benefitsEn: [
        'All Silver benefits included',
        'Priority checkout lane in stores',
        '24h early access to limited rewards',
      ],
    },
    {
      key: 'platinum',
      nameVi: 'Bạch Kim · Platinum',
      nameEn: 'Platinum',
      multiplier: '2×',
      rangeVi: '20.000+ Sen',
      rangeEn: '20,000+ Petals',
      badgeColor: 'bg-slate-800 text-white border-slate-700',
      isDarkCard: true,
      benefitsVi: [
        'Mọi quyền lợi của hạng Vàng',
        'Sen tích luỹ KHÔNG BAO GIỜ hết hạn',
        'Hỗ trợ riêng & đổi quà đối tác VIP',
      ],
      benefitsEn: [
        'All Gold benefits included',
        'Petals NEVER expire',
        'Dedicated concierge & VIP rewards',
      ],
    },
  ];

  return (
    <section id="hang" className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <div className="flex items-baseline gap-3 mb-2">
          <span className="font-mono text-sm font-bold text-[var(--brand)]">02</span>
          <h2 className="font-display text-2xl font-bold tracking-tight text-[var(--ink)] sm:text-3xl">
            {language === 'vi' ? 'Hạng thành viên' : 'Membership tiers'}
          </h2>
        </div>

        <p className="max-w-2xl text-[var(--ink-2)] text-base mb-12">
          {language === 'vi'
            ? 'Hạng được tính dựa trên tổng số Sen bạn tích luỹ trong 12 tháng gần nhất. Nâng hạng tự động trên chuỗi khối, không cần làm thủ tục.'
            : 'Tiers are determined by total Petals accumulated over the rolling 12 months. Upgrades execute automatically on-chain.'}
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((t) => {
            const isUserTier = signedIn && t.key === user.tier;

            return (
              <div
                key={t.key}
                style={
                  isUserTier
                    ? {
                        border: '2px solid var(--brand)',
                        boxShadow: '0 12px 30px -10px rgba(159, 2, 97, 0.25)',
                      }
                    : t.isDarkCard
                    ? { background: '#002b49', color: '#fff', border: '1px solid #002b49' }
                    : { background: 'var(--surface)', border: '1px solid var(--line)' }
                }
                className="flex flex-col justify-between rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${t.badgeColor}`}
                    >
                      {language === 'vi' ? t.nameVi : t.nameEn}
                    </span>

                    {isUserTier && (
                      <span className="flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--brand)] bg-[var(--brand-soft)] px-2 py-0.5 rounded-full">
                        <Sparkle size={10} weight="fill" />
                        <span>{language === 'vi' ? 'Hạng của bạn' : 'Your tier'}</span>
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <div
                      className={`font-display text-3xl font-extrabold tracking-tight ${
                        t.isDarkCard ? 'text-white' : 'text-[var(--ink)]'
                      }`}
                    >
                      {t.multiplier}
                    </div>
                    <div
                      className={`font-mono text-xs ${
                        t.isDarkCard ? 'text-slate-300' : 'text-[var(--muted)]'
                      }`}
                    >
                      {language === 'vi' ? t.rangeVi : t.rangeEn}
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-sm">
                    {(language === 'vi' ? t.benefitsVi : t.benefitsEn).map((b, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle
                          size={16}
                          weight="fill"
                          className={
                            t.isDarkCard
                              ? 'text-cyan-400 mt-0.5 shrink-0'
                              : isUserTier
                              ? 'text-[var(--brand)] mt-0.5 shrink-0'
                              : 'text-emerald-500 mt-0.5 shrink-0'
                          }
                        />
                        <span className={t.isDarkCard ? 'text-slate-200' : 'text-[var(--ink-2)]'}>
                          {b}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-black/10 dark:border-white/10">
                  <span className="text-xs font-medium opacity-70">
                    {t.multiplier} {language === 'vi' ? 'tốc độ tích điểm' : 'earn rate boost'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
