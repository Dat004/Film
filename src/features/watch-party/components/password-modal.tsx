import * as React from "react";
import { HiOutlineLockClosed } from "react-icons/hi2";
import { useRouter } from "next/navigation";

interface PasswordModalProps {
  passwordError: string | null;
  submitPassword: (pw: string) => void;
}

export function PasswordModal({ passwordError, submitPassword }: PasswordModalProps) {
  const router = useRouter();
  
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-md px-4">
      <div className="max-w-md w-full bg-bg-sidebar border border-bd-filed-form-color rounded-2xl p-8 shadow-2xl flex flex-col items-center">
        <div className="w-16 h-16 bg-[var(--primary-color)]/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-[var(--primary-color)]/30">
          <HiOutlineLockClosed className="w-8 h-8 text-[var(--primary-color)]" />
        </div>
        <h2 className="text-xl font-bold mb-2 text-primary">Yêu cầu mật khẩu</h2>
        <p className="text-secondary text-sm mb-6 text-center">
          Vui lòng nhập mật khẩu chính xác để tham gia phòng xem chung này.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const pw = (e.target as any).elements.roomPassword.value;
            submitPassword(pw);
          }}
          className="w-full"
        >
          <input
            type="password"
            name="roomPassword"
            placeholder="Mật khẩu phòng..."
            className="w-full bg-bg-field border border-bd-filed-form-color focus:border-[var(--hover-color)] transition-colors rounded-xl px-4 py-3 outline-none text-sm text-primary mb-3 text-center"
            required
            autoFocus
          />
          {passwordError && (
            <p className="text-red-500 text-xs mb-4 text-center">{passwordError}</p>
          )}
          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-bg-field hover:bg-black/5 dark:hover:bg-white/5 border border-bd-filed-form-color text-primary font-medium py-3 rounded-xl transition-all"
            >
              Quay Lại
            </button>
            <button
              type="submit"
              className="flex-1 bg-[var(--primary-color)] text-bg-sidebar dark:text-black font-semibold py-3 rounded-xl transition-all shadow-lg hover:opacity-90"
            >
              Vào Phòng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
