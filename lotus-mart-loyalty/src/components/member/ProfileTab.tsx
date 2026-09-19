import React, { useState } from 'react';
import {
  Cake,
  Copy,
  DownloadSimple,
  Fingerprint,
  FloppyDisk,
  LockKey,
  ShieldCheck,
  WarningCircle,
} from 'phosphor-react';
import { useLoyalty } from '../../context/LoyaltyContext';

export const ProfileTab: React.FC = () => {
  const { language, user, updateUser, showToast } = useLoyalty();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [birthdate, setBirthdate] = useState(user.birthdate);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name,
      email,
      birthdate,
    });
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(user.suiAddress);
    showToast(
      language === 'vi'
        ? 'Đã sao chép địa chỉ ví Sui on-chain'
        : 'Copied Sui on-chain wallet address'
    );
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(user, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lotus-mart-member-data-${user.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(
      language === 'vi' ? 'Đã xuất dữ liệu thành công' : 'Exported member data successfully'
    );
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h3 className="font-display text-xl font-bold text-[var(--ink)]">
          {language === 'vi' ? 'Thông tin của tôi' : 'My profile'}
        </h3>
        <p className="text-xs text-[var(--muted)]">
          {language === 'vi'
            ? 'Quản lý thông tin cá nhân và định danh zkLogin liên kết trên chuỗi khối Sui.'
            : 'Manage your profile and your zkLogin credentials anchored on the Sui blockchain.'}
        </p>
      </div>

      {/* Editable Info Card */}
      <form
        onSubmit={handleSave}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--line)',
        }}
        className="flex flex-col gap-5 rounded-2xl p-6 shadow-xs"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--ink)]">
              {language === 'vi' ? 'Họ và tên' : 'Full name'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]"
              required
            />
          </div>

          {/* Phone (Immutable / Bound to zkLogin) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--ink)] flex items-center justify-between">
              <span>{language === 'vi' ? 'Số điện thoại' : 'Phone number'}</span>
              <span className="text-[10px] font-normal text-[var(--muted)]">
                {language === 'vi' ? 'Đã xác minh' : 'Verified'}
              </span>
            </label>
            <input
              type="text"
              value={user.phone}
              disabled
              className="h-10 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-3 text-sm text-[var(--muted)] cursor-not-allowed"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--ink)]">
              {language === 'vi' ? 'Email thông báo' : 'Email'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]"
              required
            />
          </div>

          {/* Birthday */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--ink)] flex items-center justify-between">
              <span>{language === 'vi' ? 'Ngày sinh' : 'Date of birth'}</span>
              <span className="text-[10.5px] font-semibold text-amber-600 flex items-center gap-1">
                <Cake size={13} />
                <span>+200 Sen/năm</span>
              </span>
            </label>
            <input
              type="text"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              className="h-10 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            style={{
              background: 'var(--brand)',
              color: '#fff',
            }}
            className="flex h-10 items-center gap-2 rounded-xl px-5 text-xs font-semibold shadow-xs transition-opacity hover:opacity-95 cursor-pointer"
          >
            <FloppyDisk size={16} />
            <span>{language === 'vi' ? 'Lưu thay đổi' : 'Save changes'}</span>
          </button>
        </div>
      </form>

      {/* Account & Blockchain zkLogin Details */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--line)',
        }}
        className="flex flex-col gap-5 rounded-2xl p-6 shadow-xs"
      >
        <h4 className="font-display text-base font-bold text-[var(--ink)]">
          {language === 'vi' ? 'Tài khoản & quyền riêng tư chuỗi khối' : 'Account & blockchain privacy'}
        </h4>

        {/* zkLogin Session Info */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[var(--surface-2)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand)]">
              <Fingerprint size={20} />
            </div>
            <div>
              <div className="text-xs font-semibold text-[var(--ink)]">
                {language === 'vi'
                  ? `Đăng nhập qua ${user.zkLoginProvider}`
                  : `Signed in via ${user.zkLoginProvider}`}
              </div>
              <div className="text-[11px] text-[var(--muted)]">
                zkLogin Zero-Knowledge Proof Authenticated
              </div>
            </div>
          </div>

          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-mono text-[11px] font-bold text-emerald-800">
            Active Session
          </span>
        </div>

        {/* On-chain Sui Address */}
        <div className="flex flex-col gap-2 rounded-xl border border-[var(--line)] p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--ink)]">
            <span>{language === 'vi' ? 'Địa chỉ ví Sui trên chuỗi' : 'On-chain Sui wallet address'}</span>
            <button
              type="button"
              onClick={copyAddress}
              className="flex items-center gap-1 text-[var(--brand)] hover:underline cursor-pointer"
            >
              <Copy size={13} />
              <span>{language === 'vi' ? 'Sao chép' : 'Copy'}</span>
            </button>
          </div>
          <div className="font-mono text-xs font-medium text-[var(--muted)] break-all bg-[var(--surface-2)] p-2.5 rounded-lg">
            {user.suiAddress}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportData}
            className="flex h-10 items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 text-xs font-semibold text-[var(--ink)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition-colors cursor-pointer"
          >
            <DownloadSimple size={15} />
            <span>{language === 'vi' ? 'Tải dữ liệu của tôi' : 'Export my data'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  language === 'vi'
                    ? 'Bạn có chắc chắn muốn rời chương trình thành viên không?'
                    : 'Are you sure you want to leave the membership program?'
                )
              ) {
                showToast(
                  language === 'vi'
                    ? 'Yêu cầu huỷ đã được tiếp nhận.'
                    : 'Request to leave has been submitted.'
                );
              }
            }}
            className="flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
          >
            <WarningCircle size={15} />
            <span>{language === 'vi' ? 'Rời chương trình' : 'Leave programme'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
