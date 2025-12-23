import React, { useEffect, useMemo, useRef } from "react";
import { FiDownload, FiRefreshCw, FiX } from "react-icons/fi";

import {
  commitMatchesKeyword,
  fmtDate,
  statusBadgeClass,
  statusLabel,
  userLabel,
} from "./supportCommitUi";

export default function SupportCommitManageModal({
  open,
  post,
  summary,
  isLoading,
  tab,
  setTab,
  keyword,
  setKeyword,
  commitsByStatus,
  busyCommitId,
  onClose,
  onRefresh,
  onExportCsv,
  onConfirm,
  onCancel,
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

  const itemsRaw = commitsByStatus?.[tab] || [];
  const items = useMemo(() => {
    const k = (keyword || "").trim();
    if (!k) return itemsRaw;
    return itemsRaw.filter((c) => commitMatchesKeyword(c, k));
  }, [itemsRaw, keyword]);

  if (!open || !post) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      role="dialog"
      aria-modal="true"
    >
      {/* ✅ Panel: giới hạn chiều cao + flex để body cuộn */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className="w-full max-w-3xl rounded-[22px] border border-slate-200 bg-white shadow-xl outline-none
                   max-h-[calc(100vh-2rem)] flex flex-col"
      >
        {/* ✅ Header (không cuộn) */}
        <div className="p-5 sm:p-6 border-b border-slate-200">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-lg font-extrabold text-slate-900">
                Duyệt đăng ký — {post.title}
              </div>
              <div className="mt-1 truncate text-sm text-slate-600">
                {post.address || "—"}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="btn btn-outline btn-sm"
                onClick={onRefresh}
                disabled={isLoading}
                title="Làm mới"
                type="button"
              >
                <FiRefreshCw />
              </button>

              <button
                className="btn btn-outline btn-sm"
                onClick={onExportCsv}
                disabled={isLoading}
                title="Xuất CSV theo tab"
                type="button"
              >
                <FiDownload />
              </button>

              <button
                className="btn btn-outline btn-sm"
                onClick={onClose}
                title="Đóng"
                type="button"
              >
                <FiX className="mr-1" /> Đóng
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="badge">Chờ: {summary?.pendingCount ?? 0}</span>
            <span className="badge badge-neutral">
              Đã xác nhận: {summary?.confirmedCount ?? 0}
            </span>
            <span className="badge badge-outline">
              Tổng: {summary?.activeCount ?? 0}
            </span>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="join">
              <button
                className={`btn btn-sm join-item ${
                  tab === "PENDING" ? "btn-primary" : "btn-outline"
                }`}
                onClick={() => setTab("PENDING")}
                type="button"
              >
                Chờ ({(commitsByStatus?.PENDING || []).length})
              </button>
              <button
                className={`btn btn-sm join-item ${
                  tab === "CONFIRMED" ? "btn-primary" : "btn-outline"
                }`}
                onClick={() => setTab("CONFIRMED")}
                type="button"
              >
                Đã xác nhận ({(commitsByStatus?.CONFIRMED || []).length})
              </button>
              <button
                className={`btn btn-sm join-item ${
                  tab === "CANCELED" ? "btn-primary" : "btn-outline"
                }`}
                onClick={() => setTab("CANCELED")}
                type="button"
              >
                Đã huỷ ({(commitsByStatus?.CANCELED || []).length})
              </button>
            </div>

            <input
              className="input input-bordered w-full sm:w-[340px]"
              placeholder="Tìm theo tên/email/ghi chú..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
        </div>

        {/* ✅ Body: phần này cuộn */}
        <div className="p-5 sm:p-6 overflow-y-auto min-h-0">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-20 rounded-2xl bg-slate-100" />
              <div className="h-20 rounded-2xl bg-slate-100" />
              <div className="h-20 rounded-2xl bg-slate-100" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-sm text-slate-600">
              Không có đăng ký trong tab này.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((c) => (
                <div
                  key={c.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-slate-900">
                        {userLabel(c)}
                      </div>
                      {c.user?.email && (
                        <div className="mt-1 text-xs text-slate-500">
                          {c.user.email}
                        </div>
                      )}
                    </div>
                    <span className={statusBadgeClass(c.status)}>
                      {statusLabel(c.status)}
                    </span>
                  </div>

                  <div className="mt-2 text-sm text-slate-700">
                    <div>
                      <span className="font-semibold">Số lượng:</span>{" "}
                      {c.quantity}
                    </div>
                    <div className="mt-1">
                      <span className="font-semibold">Ghi chú:</span>{" "}
                      {c.message ? (
                        <span className="whitespace-pre-wrap">{c.message}</span>
                      ) : (
                        <span className="text-slate-500">(Không có)</span>
                      )}
                    </div>

                    <div className="mt-2 text-xs text-slate-500">
                      Tạo: {fmtDate(c.createdAt)}
                    </div>
                    {c.confirmedAt && (
                      <div className="mt-1 text-xs text-slate-500">
                        Xác nhận: {fmtDate(c.confirmedAt)}
                      </div>
                    )}
                    {c.canceledAt && (
                      <div className="mt-1 text-xs text-slate-500">
                        Huỷ: {fmtDate(c.canceledAt)}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {c.status === "PENDING" && (
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={busyCommitId === c.id}
                        onClick={() => onConfirm?.(c.id)}
                        type="button"
                      >
                        Xác nhận
                      </button>
                    )}
                    {c.status !== "CANCELED" && (
                      <button
                        className="btn btn-outline btn-sm"
                        disabled={busyCommitId === c.id}
                        onClick={() => onCancel?.(c.id)}
                        type="button"
                      >
                        Huỷ
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
