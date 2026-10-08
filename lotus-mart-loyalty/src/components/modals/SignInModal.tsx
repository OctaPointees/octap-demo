import React, { useState } from "react";
import { CheckCircle, Fingerprint, LockKey, Phone, X } from "phosphor-react";
import { useLoyalty } from "../../context/LoyaltyContext";

export const SignInModal: React.FC = () => {
  const {
    language,
    signInModalOpen,
    setSignInModalOpen,
    setSignedIn,
    setCurrentView,
    showToast,
  } = useLoyalty();

  const [phone, setPhone] = useState("0901 234 567");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");

  if (!signInModalOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("otp");
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setSignedIn(true);
    setSignInModalOpen(false);
    setCurrentView("member");
    showToast(
      language === "vi"
        ? "Đăng nhập zkLogin thành công!"
        : "zkLogin authentication successful!",
    );
  };

  const handleQuickDemoSignIn = () => {
    setSignedIn(true);
    setSignInModalOpen(false);
    setCurrentView("member");
    showToast(
      language === "vi"
        ? "Đã đăng nhập với tài khoản mẫu Anh Khánh Duy  (Hạng Vàng)"
        : "Signed in with demo account Anh Khánh Duy  (Gold Tier)",
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-fadeIn">
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
        }}
        className="w-full max-w-md overflow-hidden rounded-2xl shadow-2xl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-4">
          <div className="flex items-center gap-2">
            <span
              style={{
                display: "grid",
                placeItems: "center",
                width: "24px",
                height: "24px",
                borderRadius: "6px",
                background: "var(--brand)",
                color: "#fff",
                fontFamily: "var(--display)",
                fontWeight: 700,
                fontSize: "12px",
              }}
            >
              L
            </span>
            <h3 className="font-display font-bold text-base text-[var(--ink)]">
              {language === "vi" ? "Đăng nhập thành viên" : "Member sign in"}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setSignInModalOpen(false)}
            className="flex size-8 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="mb-5 rounded-xl bg-[var(--brand-soft)] p-3.5 text-xs leading-relaxed text-[var(--brand)] flex items-start gap-2.5">
            <Fingerprint size={22} className="shrink-0 mt-0.5" />
            <span>
              {language === "vi"
                ? "Công nghệ zkLogin trên Sui: Chỉ cần số điện thoại hoặc tài khoản Google/Apple, hoàn toàn không cần ví crypto hay nhớ cụm từ khóa bí mật."
                : "zkLogin on Sui: Simply sign in with phone or Google/Apple, zero seed phrases or crypto setup needed."}
            </span>
          </div>

          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--ink)]">
                  {language === "vi"
                    ? "Số điện thoại của bạn"
                    : "Your phone number"}
                </label>
                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] pl-9 pr-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  background: "var(--brand)",
                  color: "#fff",
                }}
                className="flex h-11 items-center justify-center rounded-xl font-semibold text-sm shadow-xs hover:opacity-95 cursor-pointer"
              >
                <span>
                  {language === "vi" ? "Nhận mã OTP" : "Send OTP code"}
                </span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--ink)]">
                  {language === "vi"
                    ? "Nhập mã 6 chữ số (Mã demo: 888888)"
                    : "Enter 6-digit OTP (Demo: 888888)"}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="888888"
                  className="h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] text-center font-mono text-lg font-bold tracking-widest text-[var(--ink)] outline-none focus:border-[var(--brand)]"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                style={{
                  background: "var(--brand)",
                  color: "#fff",
                }}
                className="flex h-11 items-center justify-center rounded-xl font-semibold text-sm shadow-xs hover:opacity-95 cursor-pointer"
              >
                <span>
                  {language === "vi" ? "Xác thực & Vào ví" : "Verify & Enter"}
                </span>
              </button>
            </form>
          )}

          {/* Quick Demo One-click */}
          <div className="mt-6 border-t border-dashed border-[var(--line)] pt-4">
            <button
              type="button"
              onClick={handleQuickDemoSignIn}
              className="flex w-full items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-3 text-left hover:border-[var(--brand)] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--brand)] text-white text-xs font-bold">
                  K
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--ink)]">
                    Anh Khánh Duy · Hạng Vàng
                  </div>
                  <div className="font-mono text-[10.5px] text-[var(--muted)]">
                    2.480 Sen · 0901 234 567
                  </div>
                </div>
              </div>
              <span className="text-xs font-semibold text-[var(--brand)]">
                {language === "vi" ? "Đăng nhập nhanh →" : "Quick demo →"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
