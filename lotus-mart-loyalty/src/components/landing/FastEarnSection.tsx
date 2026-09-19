import React from 'react';
import { CreditCard, Recycle, UsersThree, Waves } from 'phosphor-react';
import { useLoyalty } from '../../context/LoyaltyContext';

export const FastEarnSection: React.FC = () => {
  const { language } = useLoyalty();

  const boosts = [
    {
      badge: '×2',
      icon: Waves,
      titleVi: 'Cuối tuần nhân đôi',
      titleEn: 'Double Points Weekend',
      descVi: 'Thứ Bảy và Chủ Nhật, mọi hoá đơn mua sắm tại siêu thị đều được tự động nhân đôi số Sen nhận được.',
      descEn: 'Every in-store bill automatically earns double Petals every Saturday and Sunday.',
    },
    {
      badge: '+500',
      icon: CreditCard,
      titleVi: 'Liên kết thẻ Visa / Thẻ ngân hàng',
      titleEn: 'Link Visa / Bank card',
      descVi: 'Thanh toán trực tiếp qua thẻ đã liên kết OctaP để tự động cộng điểm thưởng mà không cần đưa mã QR.',
      descEn: 'Pay with an OctaP-linked card to collect loyalty points automatically without presenting QR.',
    },
    {
      badge: '+300',
      icon: UsersThree,
      titleVi: 'Giới thiệu bạn bè',
      titleEn: 'Refer a friend',
      descVi: 'Cả bạn và người thân đều nhận ngay 300 Sen sau hoá đơn mua sắm đầu tiên của người được mời.',
      descEn: 'Both you and your friend receive 300 Petals after their first qualifying purchase.',
    },
    {
      badge: '+120',
      icon: Recycle,
      titleVi: 'Mang túi môi trường riêng',
      titleEn: 'Bring your own eco-bag',
      descVi: 'Mỗi lần từ chối túi nilon tại quầy thanh toán được ghi nhận và tặng ngay 120 Sen xanh vào ví.',
      descEn: 'Skip single-use plastic bags at checkout to collect 120 bonus green Petals every time.',
    },
  ];

  return (
    <section id="tichnhanh" className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <div className="flex items-baseline gap-3 mb-2">
          <span className="font-mono text-sm font-bold text-[var(--brand)]">04</span>
          <h2 className="font-display text-2xl font-bold tracking-tight text-[var(--ink)] sm:text-3xl">
            {language === 'vi' ? 'Cách tích Sen nhanh' : 'Ways to earn faster'}
          </h2>
        </div>

        <p className="max-w-2xl text-[var(--ink-2)] text-base mb-12">
          {language === 'vi'
            ? 'Ngoài các hoá đơn đi chợ thường ngày, đây là những chương trình ưu đãi giúp bạn tích luỹ Sen nhanh nhất tháng này.'
            : 'Beyond your daily groceries, these accelerated campaigns help you stack Petals faster this month.'}
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {boosts.map((b, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-xs transition-all hover:border-[var(--brand)] hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span
                  style={{
                    color: 'var(--brand)',
                  }}
                  className="font-display text-2xl font-extrabold tracking-tight"
                >
                  {b.badge}
                </span>
                <div className="flex size-9 items-center justify-center rounded-xl bg-[var(--surface-2)] text-[var(--ink-2)]">
                  <b.icon size={19} />
                </div>
              </div>

              <h3 className="font-display mt-2 text-base font-bold text-[var(--ink)]">
                {language === 'vi' ? b.titleVi : b.titleEn}
              </h3>

              <p className="text-sm leading-relaxed text-[var(--ink-2)]">
                {language === 'vi' ? b.descVi : b.descEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
