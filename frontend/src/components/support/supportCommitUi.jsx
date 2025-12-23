// UI helpers for Support Commit feature

export function fmtDate(v) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString();
  } catch {
    return String(v);
  }
}

export function fmtDateShort(v) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleDateString();
  } catch {
    return String(v);
  }
}

export function statusText(st) {
  if (st === "PENDING") return "Đang chờ xác nhận";
  if (st === "CONFIRMED") return "Đã được xác nhận";
  if (st === "CANCELED") return "Đã huỷ";
  return st || "—";
}

export function statusLabel(st) {
  if (st === "PENDING") return "Chờ xác nhận";
  if (st === "CONFIRMED") return "Đã xác nhận";
  if (st === "CANCELED") return "Đã huỷ";
  return st || "—";
}

export function statusBadgeClass(st) {
  if (st === "CONFIRMED") return "badge badge-neutral";
  if (st === "PENDING") return "badge badge-outline";
  if (st === "CANCELED") return "badge badge-outline opacity-70";
  return "badge badge-outline";
}

export function userLabel(c) {
  return (
    c.user?.name ||
    c.user?.email ||
    (c.userId != null ? `User #${c.userId}` : "—")
  );
}

export function commitMatchesKeyword(c, keyword) {
  if (!keyword) return true;
  const k = keyword.toLowerCase();
  const u = `${c.user?.name || ""} ${c.user?.email || ""} ${
    c.userId || ""
  }`.toLowerCase();
  const msg = String(c.message || "").toLowerCase();
  const qty = String(c.quantity ?? "").toLowerCase();
  const st = String(c.status || "").toLowerCase();
  return u.includes(k) || msg.includes(k) || qty.includes(k) || st.includes(k);
}
