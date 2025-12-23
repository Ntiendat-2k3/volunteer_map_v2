import React from "react";
import { Link } from "react-router-dom";
import { FaEye, FaFileExcel, FaListUl } from "react-icons/fa";

import { fmtDateShort } from "./supportCommitUi";

export default function SupportPostCard({
  post,
  summary,
  exporting,
  onExport,
  onOpenManage,
}) {
  const pendingCount = summary?.pendingCount ?? 0;
  const confirmedCount = summary?.confirmedCount ?? 0;
  const activeCount = summary?.activeCount ?? pendingCount + confirmedCount;
  const createdAt = post.createdAt || post.created_at;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5">
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-semibold text-slate-900">
            {post.title}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <span className="truncate">{post.address || "—"}</span>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            <span className="badge badge-outline">{post.status}</span>
            <span className="badge badge-outline">{post.approvalStatus}</span>
            <span className="badge">Chờ: {pendingCount}</span>
            <span className="badge badge-neutral">
              Đã xác nhận: {confirmedCount}
            </span>
            <span className="badge badge-outline">Tổng: {activeCount}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <div className="text-right">
            <div className="text-xs text-slate-500">Cập nhật</div>
            <div className="mt-1 text-xs text-slate-500">
              • {fmtDateShort(createdAt)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/posts/${post.id}`}
              className="btn btn-outline btn-square rounded-xl"
              title="Xem chi tiết"
              aria-label="Xem chi tiết"
            >
              <FaEye size={18} />
            </Link>

            <button
              type="button"
              className="btn btn-outline btn-square rounded-xl"
              onClick={onOpenManage}
              title="Duyệt đăng ký"
              aria-label="Duyệt đăng ký"
            >
              <FaListUl size={18} />
            </button>

            <button
              type="button"
              className="btn btn-primary btn-square rounded-xl"
              disabled={exporting}
              onClick={onExport}
              title="Xuất Excel"
              aria-label="Xuất Excel"
            >
              <FaFileExcel size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
