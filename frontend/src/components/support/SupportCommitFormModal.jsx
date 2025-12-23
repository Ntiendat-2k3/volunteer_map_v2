import React, { useEffect, useRef } from "react";
import { FiHeart, FiX } from "react-icons/fi";

export default function SupportCommitFormModal({
  open,
  busy,
  qty,
  setQty,
  msg,
  setMsg,
  onClose,
  onSubmit,
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => panelRef.current?.focus?.(), 0);
    return () => clearTimeout(t);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="w-full max-w-lg rounded-[22px] border border-slate-200 bg-white shadow-xl outline-none"
      >
        <div className="p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="text-lg font-extrabold">Đăng ký hỗ trợ</div>
            <button
              className="btn btn-outline btn-sm btn-square"
              onClick={onClose}
              disabled={busy}
              title="Đóng"
              type="button"
            >
              <FiX />
            </button>
          </div>

          <form onSubmit={onSubmit} className="mt-4 space-y-4">
            <div>
              <div className="text-sm font-semibold text-slate-700">
                Số lượng
              </div>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none"
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </div>

            <div>
              <div className="text-sm font-semibold text-slate-700">
                Ghi chú (tuỳ chọn)
              </div>
              <textarea
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white p-3 outline-none"
                rows={4}
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Ví dụ: Mình góp 2 thùng mì"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                className="btn btn-outline"
                type="button"
                onClick={onClose}
                disabled={busy}
              >
                Huỷ
              </button>
              <button className="btn btn-primary" type="submit" disabled={busy}>
                <FiHeart /> Gửi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
