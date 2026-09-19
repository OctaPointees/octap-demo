import React from 'react';
import { ArrowSquareOut, CheckCircle, Receipt } from 'phosphor-react';
import { useLoyalty } from '../../context/LoyaltyContext';

export const RedemptionHistoryTab: React.FC = () => {
  const { language, redemptionHistory, setSelectedTxDigest } = useLoyalty();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="font-display text-xl font-bold text-[var(--ink)]">
          {language === 'vi' ? 'Lịch sử đổi điểm' : 'Redemption history'}
        </h3>
        <p className="text-xs text-[var(--muted)]">
          {language === 'vi'
            ? 'Mọi lệnh đổi voucher đều được ghi nhận trực tiếp trên chuỗi khối Sui dưới dạng giao dịch tiêu hủy (burn) điểm minh bạch.'
            : 'Every reward redemption is written to the Sui blockchain as a verifiable token burn.'}
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs">
        <table className="w-full text-left text-sm border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-[var(--line)] bg-[var(--surface-2)] text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
              <th className="px-5 py-3.5">
                {language === 'vi' ? 'Thời gian' : 'Timestamp'}
              </th>
              <th className="px-5 py-3.5">
                {language === 'vi' ? 'Quà & Đối tác' : 'Reward & Partner'}
              </th>
              <th className="px-5 py-3.5 text-right">
                {language === 'vi' ? 'Sen trừ' : 'Petals'}
              </th>
              <th className="px-5 py-3.5">
                {language === 'vi' ? 'Trạng thái' : 'Status'}
              </th>
              <th className="px-5 py-3.5">Sui Digest</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)] font-medium">
            {redemptionHistory.map((row) => (
              <tr key={row.id} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                <td className="px-5 py-4 text-xs font-mono text-[var(--muted)]">
                  {language === 'vi' ? row.timeVi : row.timeEn}
                </td>

                <td className="px-5 py-4">
                  <div className="font-semibold text-[var(--ink)]">
                    {language === 'vi' ? row.rewardVi : row.rewardEn}
                  </div>
                  <div className="text-xs text-[var(--muted)]">{row.provider}</div>
                </td>

                <td className="px-5 py-4 text-right font-mono font-bold text-[var(--brand)] tabular-nums">
                  −{row.pointsDeducted.toLocaleString()}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      row.statusType === 'issued'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                  >
                    <CheckCircle size={12} weight="fill" />
                    <span>{language === 'vi' ? row.statusVi : row.statusEn}</span>
                  </span>
                </td>

                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => setSelectedTxDigest(row.suiTxDigest)}
                    className="flex items-center gap-1 font-mono text-xs font-semibold text-[var(--brand)] hover:underline cursor-pointer"
                  >
                    <span>{row.suiTxDigest.slice(0, 10)}…</span>
                    <ArrowSquareOut size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
