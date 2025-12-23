import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import { postApi } from "../services/postApi";
import { adminApi } from "../services/adminApi";
import { supportCommitApi } from "../services/supportCommitApi";
import { downloadCsv } from "../utils/exportCsv";

import SupportPostCard from "../components/support/SupportPostCard";
import SupportCommitManageModal from "../components/support/SupportCommitManageModal";
import {
  fmtDate,
  statusLabel,
  userLabel,
} from "../components/support/supportCommitUi";

export default function SupportManagementPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [exportingId, setExportingId] = useState(null);

  const [posts, setPosts] = useState([]);
  const [summaryByPost, setSummaryByPost] = useState({});
  const [q, setQ] = useState("");

  const [manageOpen, setManageOpen] = useState(false);
  const [managePost, setManagePost] = useState(null);
  const [manageLoading, setManageLoading] = useState(false);
  const [manageSummary, setManageSummary] = useState(null);
  const [tab, setTab] = useState("PENDING");
  const [manageKeyword, setManageKeyword] = useState("");
  const [commitsByStatus, setCommitsByStatus] = useState({
    PENDING: [],
    CONFIRMED: [],
    CANCELED: [],
  });
  const [busyCommitId, setBusyCommitId] = useState(null);

  const loadPosts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let items = [];
      if (isAdmin) {
        const res = await adminApi.listPosts();
        items = res.data.data.items || [];
      } else {
        const res = await postApi.mine();
        items = res.data.data.items || res.data.data.posts || [];
      }
      setPosts(items);

      const pairs = await Promise.all(
        items.map(async (p) => {
          try {
            const s = await supportCommitApi.summary(p.id);
            return [p.id, s.data.data.summary];
          } catch {
            return [p.id, null];
          }
        })
      );

      const obj = {};
      for (const [postId, s] of pairs) obj[postId] = s;
      setSummaryByPost(obj);
    } catch (e) {
      toast.error(
        e?.response?.data?.message || "Không tải được trang quản lý hỗ trợ"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role]);

  const filteredPosts = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    if (!keyword) return posts;

    return posts.filter((p) => {
      const t = (p.title || "").toLowerCase();
      const addr = (p.address || "").toLowerCase();
      const st = (p.status || "").toLowerCase();
      const ap = (p.approvalStatus || "").toLowerCase();
      return (
        t.includes(keyword) ||
        addr.includes(keyword) ||
        st.includes(keyword) ||
        ap.includes(keyword)
      );
    });
  }, [posts, q]);

  const exportByPost = async (postId, title) => {
    setExportingId(postId);
    try {
      const res = await supportCommitApi.list(postId);
      const items = res.data.data.items || [];

      const rows = items.map((c) => [
        userLabel(c),
        c.user?.email || "",
        c.quantity ?? "",
        c.message ?? "",
        statusLabel(c.status),
        fmtDate(c.createdAt),
        fmtDate(c.confirmedAt),
        fmtDate(c.canceledAt),
      ]);

      downloadCsv(
        `support_commits_${postId}_${(title || "")
          .slice(0, 30)
          .replace(/\s+/g, "_")}`,
        [
          "Tên",
          "Email",
          "Số lượng",
          "Ghi chú",
          "Trạng thái",
          "Tạo lúc",
          "Xác nhận lúc",
          "Huỷ lúc",
        ],
        rows
      );

      toast.success("Đã xuất file CSV (Excel mở được) ✅");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Xuất file thất bại");
    } finally {
      setExportingId(null);
    }
  };

  const loadManage = async (postId) => {
    setManageLoading(true);
    try {
      const [sumRes, p1, p2, p3] = await Promise.all([
        supportCommitApi.summary(postId),
        supportCommitApi.list(postId, { status: "PENDING" }),
        supportCommitApi.list(postId, { status: "CONFIRMED" }),
        supportCommitApi.list(postId, { status: "CANCELED" }),
      ]);

      const sum = sumRes.data.data.summary;
      setManageSummary(sum);
      setSummaryByPost((prev) => ({ ...prev, [postId]: sum }));

      setCommitsByStatus({
        PENDING: p1.data.data.items || [],
        CONFIRMED: p2.data.data.items || [],
        CANCELED: p3.data.data.items || [],
      });
    } catch (e) {
      toast.error(
        e?.response?.data?.message || "Không tải được danh sách đăng ký"
      );
      setManageSummary(null);
      setCommitsByStatus({ PENDING: [], CONFIRMED: [], CANCELED: [] });
    } finally {
      setManageLoading(false);
    }
  };

  const openManage = async (post) => {
    setManagePost(post);
    setTab("PENDING");
    setManageKeyword("");
    setManageOpen(true);
    await loadManage(post.id);
  };

  const closeManage = () => {
    setManageOpen(false);
    setManagePost(null);
    setManageSummary(null);
    setManageKeyword("");
    setTab("PENDING");
    setCommitsByStatus({ PENDING: [], CONFIRMED: [], CANCELED: [] });
    setBusyCommitId(null);
  };

  const confirmCommit = async (commitId) => {
    if (!managePost) return;
    setBusyCommitId(commitId);
    try {
      await supportCommitApi.confirm(managePost.id, commitId);
      toast.success("Đã xác nhận ✅");
      await loadManage(managePost.id);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Xác nhận thất bại");
    } finally {
      setBusyCommitId(null);
    }
  };

  const cancelCommit = async (commitId) => {
    if (!managePost) return;
    const ok = window.confirm("Xác nhận huỷ đăng ký hỗ trợ?");
    if (!ok) return;

    setBusyCommitId(commitId);
    try {
      await supportCommitApi.cancel(managePost.id, commitId);
      toast.success("Đã huỷ ✅");
      await loadManage(managePost.id);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Huỷ thất bại");
    } finally {
      setBusyCommitId(null);
    }
  };

  const exportManageTab = () => {
    if (!managePost) return;

    const items = commitsByStatus?.[tab] || [];
    const keyword = (manageKeyword || "").trim().toLowerCase();
    const filtered = keyword
      ? items.filter((c) => {
          const u = `${c.user?.name || ""} ${c.user?.email || ""} ${
            c.userId || ""
          }`.toLowerCase();
          const msg = String(c.message || "").toLowerCase();
          const qty = String(c.quantity ?? "").toLowerCase();
          const st = String(c.status || "").toLowerCase();
          return (
            u.includes(keyword) ||
            msg.includes(keyword) ||
            qty.includes(keyword) ||
            st.includes(keyword)
          );
        })
      : items;

    const rows = filtered.map((c) => [
      userLabel(c),
      c.user?.email || "",
      c.quantity ?? "",
      c.message ?? "",
      statusLabel(c.status),
      fmtDate(c.createdAt),
      fmtDate(c.confirmedAt),
      fmtDate(c.canceledAt),
    ]);

    downloadCsv(
      `support_commits_${managePost.id}_${tab.toLowerCase()}`,
      [
        "Tên",
        "Email",
        "Số lượng",
        "Ghi chú",
        "Trạng thái",
        "Tạo lúc",
        "Xác nhận lúc",
        "Huỷ lúc",
      ],
      rows
    );
    toast.success("Đã xuất file CSV ✅");
  };

  useEffect(() => {
    const raw = searchParams.get("postId");
    if (!raw) return;
    if (loading) return;

    const postId = Number(raw);
    const clear = () =>
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("postId");
        return next;
      });

    if (!Number.isFinite(postId) || postId <= 0) {
      clear();
      return;
    }

    const p = posts.find((x) => Number(x.id) === postId);
    if (!p) {
      toast.error("Không tìm thấy bài hoặc bạn không có quyền quản lý bài này");
      clear();
      return;
    }

    openManage(p);
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, posts]);

  if (!user) return null;

  return (
    <div className="container-app py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-2xl font-extrabold text-slate-900">
            Quản lý hỗ trợ
          </div>
          <div className="text-sm text-slate-600">
            {isAdmin
              ? "ADMIN: xem tất cả bài và duyệt đăng ký hỗ trợ."
              : "Chỉ hiển thị bài của bạn để duyệt đăng ký hỗ trợ."}
          </div>
        </div>

        <div className="w-full sm:w-[360px]">
          <div className="relative">
            <input
              className="input input-bordered w-full pr-20"
              placeholder="Tìm theo tên, địa chỉ, trạng thái..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
              {filteredPosts.length}/{posts.length}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="card">
            <div className="card-body">
              <div className="h-5 w-40 rounded bg-slate-100" />
              <div className="mt-4 space-y-3">
                <div className="h-20 rounded-2xl bg-slate-100" />
                <div className="h-20 rounded-2xl bg-slate-100" />
                <div className="h-20 rounded-2xl bg-slate-100" />
              </div>
            </div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="card">
            <div className="card-body">
              <div className="text-slate-600">Không có bài nào.</div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPosts.map((p) => (
              <SupportPostCard
                key={p.id}
                post={p}
                summary={summaryByPost[p.id]}
                exporting={exportingId === p.id}
                onOpenManage={() => openManage(p)}
                onExport={() => exportByPost(p.id, p.title)}
              />
            ))}
          </div>
        )}
      </div>

      <SupportCommitManageModal
        open={manageOpen}
        post={managePost}
        summary={manageSummary}
        isLoading={manageLoading}
        tab={tab}
        setTab={setTab}
        keyword={manageKeyword}
        setKeyword={setManageKeyword}
        commitsByStatus={commitsByStatus}
        busyCommitId={busyCommitId}
        onClose={closeManage}
        onRefresh={() => managePost && loadManage(managePost.id)}
        onExportCsv={exportManageTab}
        onConfirm={confirmCommit}
        onCancel={cancelCommit}
      />
    </div>
  );
}
