"use client";

import {
  AlertCircle, BarChart3, BookOpen, Briefcase, BriefcaseBusiness, Check,
  ChevronDown, ChevronRight, ChevronUp, Clock, Contact,
  Download, Edit2, ExternalLink, FileText, Globe, Layers3,
  LayoutDashboard, LogOut, Menu, Moon, Newspaper, Plus, RefreshCw, Search,
  ShieldCheck, Sun, Trash2, UserCog, Users, X, ArrowRight, Upload, FileDown, TrendingUp, TrendingDown, DollarSign
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { BrandLogo } from "./BrandLogo";

// ─── i18n ─────────────────────────────────────────────────────────
type Lang = "vi" | "en";
const TX: Record<string, Record<Lang, string>> = {
  login:         { vi: "Đăng nhập",        en: "Login" },
  logout:        { vi: "Đăng xuất",        en: "Logout" },
  save:          { vi: "Lưu",              en: "Save" },
  cancel:        { vi: "Hủy",              en: "Cancel" },
  delete:        { vi: "Xóa",              en: "Delete" },
  add:           { vi: "Thêm mới",         en: "Add new" },
  edit:          { vi: "Chỉnh sửa",        en: "Edit" },
  search:        { vi: "Tìm kiếm…",        en: "Search…" },
  loading:       { vi: "Đang tải…",        en: "Loading…" },
  saved:         { vi: "Đã lưu",           en: "Saved" },
  deleted:       { vi: "Đã xóa",           en: "Deleted" },
  error:         { vi: "Lỗi",              en: "Error" },
  confirmDelete: { vi: "Xóa mục này?",     en: "Delete this item?" },
  noData:        { vi: "Chưa có dữ liệu",  en: "No data yet" },
  website:       { vi: "Website",          en: "Website" },
  refresh:       { vi: "Làm mới",          en: "Refresh" },
  addNote:       { vi: "Thêm ghi chú",     en: "Add note" },
  history:       { vi: "Lịch sử",          en: "History" },
  assign:        { vi: "Giao việc",        en: "Assign" },
  advanceStage:  { vi: "Chuyển trạng thái",en: "Advance stage" },
  interviewDate: { vi: "Ngày phỏng vấn",  en: "Interview date" },
  offerDate:     { vi: "Ngày offer",       en: "Offer date" },
  downloadCV:    { vi: "Tải CV",           en: "Download CV" },
  sendShortlist: { vi: "Gửi shortlist",    en: "Send shortlist" },
  note:          { vi: "Ghi chú",          en: "Note" },
};
function tx(lang: Lang, key: string) { return TX[key]?.[lang] ?? key; }

// ─── Types ───────────────────────────────────────────────────────
type Tab = "dashboard" | "users" | "staffing" | "applications" | "talents" | "talent-pool" | "projects" | "timesheets" | "contacts" | "posts" | "content" | "jobs" | "products";
type Row = Record<string, unknown>;

// ─── State machine definitions ────────────────────────────────────
const STAFFING_FLOW: { status: string; labelVi: string; labelEn: string; color: string; next: string[] }[] = [
  { status: "New",            labelVi: "Mới nhận",        labelEn: "New",             color: "bg-slate-100 text-slate-600",    next: ["Analyzing"] },
  { status: "Analyzing",      labelVi: "Đang phân tích",  labelEn: "Analyzing",       color: "bg-blue-100 text-blue-700",      next: ["MatchingTalents"] },
  { status: "MatchingTalents",labelVi: "Đang matching",   labelEn: "Matching",        color: "bg-violet-100 text-violet-700",  next: ["ShortlistSent"] },
  { status: "ShortlistSent",  labelVi: "Đã gửi shortlist",labelEn: "Shortlist sent",  color: "bg-orange-100 text-orange-700",  next: ["Interviewing", "MatchingTalents"] },
  { status: "Interviewing",   labelVi: "Phỏng vấn",       labelEn: "Interviewing",    color: "bg-yellow-100 text-yellow-700",  next: ["Contracting", "ShortlistSent"] },
  { status: "Contracting",    labelVi: "Đang ký HĐ",      labelEn: "Contracting",     color: "bg-cyan-100 text-cyan-700",      next: ["Onboarded"] },
  { status: "Onboarded",      labelVi: "Đã onboard",      labelEn: "Onboarded",       color: "bg-green-100 text-green-700",    next: ["Closed"] },
  { status: "Closed",         labelVi: "Đã đóng",         labelEn: "Closed",          color: "bg-slate-200 text-slate-500",    next: [] },
];

const CV_FLOW: { stage: string; labelVi: string; labelEn: string; color: string; next: string[] }[] = [
  { stage: "Received",       labelVi: "Đã nhận CV",        labelEn: "Received",         color: "bg-slate-100 text-slate-600",    next: ["Screening"] },
  { stage: "Screening",      labelVi: "HR đang xét",       labelEn: "Screening",        color: "bg-blue-100 text-blue-700",      next: ["PhoneInterview", "Rejected"] },
  { stage: "PhoneInterview", labelVi: "Phone interview",   labelEn: "Phone interview",  color: "bg-violet-100 text-violet-700",  next: ["TechInterview", "Rejected"] },
  { stage: "TechInterview",  labelVi: "Tech interview",    labelEn: "Tech interview",   color: "bg-orange-100 text-orange-700",  next: ["ReferenceCheck", "Rejected"] },
  { stage: "ReferenceCheck", labelVi: "Kiểm tra tham chiếu",labelEn: "Reference check", color: "bg-yellow-100 text-yellow-700",  next: ["OfferSent", "Rejected"] },
  { stage: "OfferSent",      labelVi: "Đã gửi offer",      labelEn: "Offer sent",       color: "bg-cyan-100 text-cyan-700",      next: ["Hired", "Rejected"] },
  { stage: "Hired",          labelVi: "Đã tuyển",          labelEn: "Hired",            color: "bg-green-100 text-green-700",    next: [] },
  { stage: "Rejected",       labelVi: "Từ chối",           labelEn: "Rejected",         color: "bg-red-100 text-red-700",        next: ["Screening"] },
  { stage: "OnHold",         labelVi: "Tạm dừng",          labelEn: "On hold",          color: "bg-slate-200 text-slate-400",    next: ["Screening"] },
];

const TIMESHEET_STATUSES = ["Draft", "HRSubmitted", "CHRMApproved", "BODApproved", "ClientApproved", "Invoiced", "Disputed", "Submitted", "Approved", "Billed"];

const TS_PIPELINE: { status: string; label: { vi: string; en: string }; color: string; next: string | null }[] = [
  { status: "Draft",          label: { vi: "HR Đang tạo",    en: "Draft" },          color: "bg-slate-100 text-slate-600",     next: "HRSubmitted" },
  { status: "HRSubmitted",    label: { vi: "CHRM Review",    en: "CHRM Review" },    color: "bg-blue-100 text-blue-700",       next: "CHRMApproved" },
  { status: "CHRMApproved",   label: { vi: "BOD Duyệt",      en: "BOD Approval" },   color: "bg-violet-100 text-violet-700",   next: "BODApproved" },
  { status: "BODApproved",    label: { vi: "KH Confirm",     en: "Client Approval"}, color: "bg-orange-100 text-orange-700",   next: "ClientApproved" },
  { status: "ClientApproved", label: { vi: "Xuất HĐ",        en: "Invoice" },        color: "bg-green-100 text-green-700",     next: "Invoiced" },
  { status: "Invoiced",       label: { vi: "Đã HĐ",          en: "Invoiced" },       color: "bg-emerald-100 text-emerald-700", next: null },
  { status: "Disputed",       label: { vi: "Tranh chấp",     en: "Disputed" },       color: "bg-red-100 text-red-700",         next: null },
  // backward compat
  { status: "Submitted",      label: { vi: "Đã nộp",         en: "Submitted" },      color: "bg-blue-100 text-blue-700",       next: "CHRMApproved" },
  { status: "Approved",       label: { vi: "Đã duyệt",       en: "Approved" },       color: "bg-green-100 text-green-700",     next: "Invoiced" },
  { status: "Billed",         label: { vi: "Đã HĐ",          en: "Billed" },         color: "bg-emerald-100 text-emerald-700", next: null },
];
const CONTACT_STATUSES = ["new", "contacted", "qualified", "closed"];
const TALENT_STATUSES = ["Available", "Interviewing", "Assigned", "Unavailable"];

const TALENT_STATUS_COLOR: Record<string, string> = {
  Available: "bg-green-100 text-green-700",
  Interviewing: "bg-yellow-100 text-yellow-700",
  Assigned: "bg-blue-100 text-blue-700",
  Unavailable: "bg-slate-100 text-slate-500",
};

const endpoints: Record<Tab, string> = {
  dashboard:    "/api/admin/talents",
  users:        "/api/admin/users",
  staffing:     "/api/admin/staffing-requests",
  applications: "/api/admin/applications",
  talents:      "/api/admin/talents",
  "talent-pool": "/api/admin/talents",
  projects:     "/api/admin/projects",
  timesheets:   "/api/admin/timesheets",
  contacts:     "/api/admin/contacts",
  posts:        "/api/admin/posts",
  content:      "/api/admin/content",
  jobs:         "/api/admin/jobs",
  products:     "/api/admin/product-inquiries",
};

const TABS: { id: Tab; labelVi: string; labelEn: string; icon: typeof Users; dashKey?: string }[] = [
  { id: "dashboard",    labelVi: "Dashboard",      labelEn: "Dashboard",      icon: LayoutDashboard },
  { id: "staffing",     labelVi: "Yêu cầu thuê NS", labelEn: "Hire Requests",  icon: BriefcaseBusiness, dashKey: "staffingRequests" },
  { id: "applications", labelVi: "CV / Ứng tuyển", labelEn: "Applications",   icon: FileText,         dashKey: "applications" },
  { id: "talents",      labelVi: "Nhân sự công ty", labelEn: "Company Staff",  icon: Users,            dashKey: "talents" },
  { id: "talent-pool",  labelVi: "Talent Pool",     labelEn: "Talent Pool",    icon: Search,           dashKey: "talents" },
  { id: "projects",     labelVi: "Dự án / Hợp đồng", labelEn: "Projects",       icon: Briefcase,        dashKey: undefined },
  { id: "timesheets",   labelVi: "Timesheets",     labelEn: "Timesheets",     icon: BarChart3,        dashKey: "timesheets" },
  { id: "contacts",     labelVi: "Liên hệ",        labelEn: "Contacts",       icon: Contact,          dashKey: "contacts" },
  { id: "jobs",         labelVi: "Tuyển dụng",     labelEn: "Jobs",           icon: ShieldCheck },
  { id: "posts",        labelVi: "Blog",           labelEn: "Blog",           icon: Newspaper,        dashKey: "posts" },
  { id: "content",      labelVi: "Nội dung CMS",   labelEn: "CMS Content",    icon: BookOpen },
  { id: "products",     labelVi: "Inquiries SP",   labelEn: "Product Inquiries",icon: Layers3,        dashKey: "productInquiries" },
  { id: "users",        labelVi: "Người dùng",     labelEn: "Users",           icon: UserCog },
];

// ─── Helpers ─────────────────────────────────────────────────────
function fmt(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "boolean") return v ? "✓" : "✗";
  if (typeof v === "object") { try { return JSON.stringify(v).slice(0, 80); } catch { return ""; } }
  return String(v);
}
function fmtDate(v: unknown, short = false) {
  try {
    const d = new Date(String(v));
    if (short) return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return fmt(v); }
}
function fc(extra = "") { return `w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 ${extra}`; }
function Badge({ label, color }: { label: string; color?: string }) {
  return <span className={`inline-block shrink-0 rounded-full px-2.5 py-0.5 text-xs font-700 ${color ?? "bg-slate-100 text-slate-600"}`}>{label}</span>;
}

// ─── Main App ─────────────────────────────────────────────────────
export function AdminApp() {
  const [lang, setLang]       = useState<Lang>("vi");
  const [authed, setAuthed]   = useState(false);
  const [loginErr, setLoginErr] = useState("");
  const [active, setActive]   = useState<Tab>("staffing");
  const [dash, setDash]       = useState<Record<string, number>>({});
  const [rows, setRows]       = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch]   = useState("");
  const [creating, setCreating] = useState(false);
  const [editRow, setEditRow] = useState<Row | null>(null);
  const [detailRow, setDetailRow] = useState<Row | null>(null);
  const [toast, setToast]     = useState<{ msg: string; ok: boolean } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const refresh = useCallback(async (tab: Tab = active) => {
    setLoading(true);
    try {
      const [d, r] = await Promise.all([
        fetch("/api/admin/dashboard").then(x => x.ok ? x.json() : {}),
        fetch(endpoints[tab]).then(x => x.ok ? x.json() : []),
      ]);
      setDash(d);
      setRows(Array.isArray(r) ? r : []);
    } catch { showToast(tx(lang, "error"), false); }
    finally { setLoading(false); }
  }, [active, lang]);

  useEffect(() => {
    fetch("/api/admin/me").then(r => r.json()).then(d => { if (d.authenticated) setAuthed(true); });
  }, []);

  useEffect(() => { if (authed) refresh(active); }, [authed, active]);

  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const p = Object.fromEntries(new FormData(e.currentTarget).entries());
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) });
    if (res.ok) { setAuthed(true); setLoginErr(""); }
    else setLoginErr(lang === "vi" ? "Email hoặc mật khẩu không đúng." : "Invalid credentials.");
  }

  async function apiFetch(url: string, method: string, body?: Row) {
    const res = await fetch(url, { method, headers: body ? { "Content-Type": "application/json" } : {}, body: body ? JSON.stringify(body) : undefined });
    if (res.ok) { showToast(method === "DELETE" ? tx(lang, "deleted") : tx(lang, "saved")); return res; }
    showToast(tx(lang, "error"), false); return null;
  }

  async function patchRow(ep: string, id: unknown, data: Row) {
    const r = await apiFetch(`${ep}/${id}`, "PATCH", data);
    if (r) refresh();
  }

  async function deleteRow(ep: string, id: unknown, label?: string) {
    if (!confirm(`${tx(lang, "confirmDelete")} "${label ?? id}"?`)) return;
    const r = await apiFetch(`${ep}/${id}`, "DELETE");
    if (r) refresh();
  }

  const allFiltered = rows.filter(r => !search || JSON.stringify(r).toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(allFiltered.length / PAGE_SIZE);
  const filtered = allFiltered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  // Reset page on search/tab change
  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleTabChange = (tab: Tab) => { setActive(tab); setCreating(false); setEditRow(null); setDetailRow(null); setSearch(""); setPage(1); setSidebarOpen(false); };

  // ── Login page ──────────────────────────────────────────────────
  if (!authed) return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-4">
      <form onSubmit={login} className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <BrandLogo compactOnMobile={false} />
        <h1 className="mt-6 text-xl font-900 text-navy">ITSOL Admin</h1>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-xs text-slate-400">Quản trị nội bộ</p>
          <button type="button" onClick={() => setLang(l => l === "vi" ? "en" : "vi")}
            className="ml-auto rounded-full border border-slate-200 px-2 py-0.5 text-xs font-700 text-slate-500 hover:border-brand-blue hover:text-brand-blue">
            {lang === "vi" ? "🇬🇧 EN" : "🇻🇳 VI"}
          </button>
        </div>
        <div className="mt-5 grid gap-3">
          <input name="email" type="email" required placeholder="Email" autoComplete="username" className={fc()} />
          <input name="password" type="password" required placeholder={lang === "vi" ? "Mật khẩu" : "Password"} autoComplete="current-password" className={fc()} />
          <button className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-navy py-2.5 text-sm font-700 text-white hover:bg-navy/90">
            {tx(lang, "login")}
          </button>
          {loginErr ? <p className="flex items-center gap-1.5 text-sm font-600 text-red-600"><AlertCircle className="size-4" />{loginErr}</p> : null}
        </div>
      </form>
    </main>
  );

  // ── Authenticated ────────────────────────────────────────────────
  return (
    <main className={`min-h-screen ${darkMode ? "dark bg-slate-900" : "bg-slate-50"}`}>
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-700 text-white shadow-xl ${toast.ok ? "bg-navy" : "bg-red-600"}`}>
          {toast.ok ? <Check className="size-4 text-green-400" /> : <AlertCircle className="size-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
        <div className="flex min-h-14 items-center gap-3 px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(o => !o)} className="grid size-9 place-items-center rounded-lg border border-slate-200 lg:hidden">
            <Menu className="size-4" />
          </button>
          <BrandLogo compactOnMobile />
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setLang(l => l === "vi" ? "en" : "vi")}
              className="hidden rounded-full border border-slate-200 px-2.5 py-1 text-xs font-700 text-slate-600 hover:border-brand-blue sm:block">
              {lang === "vi" ? "🇬🇧 EN" : "🇻🇳 VI"}
            </button>
            <button onClick={() => setDarkMode(d => !d)}
              className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50">
              {darkMode ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
            </button>
            <button onClick={() => refresh()} className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50">
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
            <a href="/" target="_blank" className="hidden items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-700 text-slate-600 hover:bg-slate-50 sm:flex">
              <ExternalLink className="size-3" /> {tx(lang, "website")}
            </a>
            <button onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); setAuthed(false); }}
              className="flex items-center gap-1.5 rounded-lg bg-navy px-3 py-1.5 text-xs font-700 text-white">
              <LogOut className="size-3.5" /> <span className="hidden sm:inline">{tx(lang, "logout")}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-56px)]">
        {/* Sidebar overlay (mobile) */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col gap-1 border-r border-slate-200 bg-white pt-14 pb-4 px-3 transition-transform lg:static lg:translate-x-0 lg:pt-4 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          {/* Dashboard mini stats */}
          <div className="mb-3 grid grid-cols-2 gap-2 px-1">
            {[
              { k: "staffingRequests", l: lang === "vi" ? "Staffing" : "Staffing" },
              { k: "applications",     l: lang === "vi" ? "CV"       : "CVs" },
              { k: "talents",          l: lang === "vi" ? "Talent"   : "Talents" },
              { k: "contacts",         l: lang === "vi" ? "Liên hệ"  : "Contacts" },
            ].map(({ k, l }) => (
              <div key={k} className="rounded-lg bg-slate-50 px-2 py-1.5">
                <p className="text-[10px] font-700 text-slate-400">{l}</p>
                <p className="text-lg font-900 text-navy">{dash[k] ?? 0}</p>
              </div>
            ))}
          </div>

          {TABS.map(t => {
            const Icon = t.icon;
            const isActive = active === t.id;
            return (
              <button key={t.id}
                onClick={() => handleTabChange(t.id)}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-700 transition-all ${isActive ? "bg-navy text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}
              >
                <Icon className="size-4 shrink-0" />
                <span className="flex-1 truncate">{lang === "vi" ? t.labelVi : t.labelEn}</span>
                {t.dashKey && dash[t.dashKey] ? (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-900 ${isActive ? "bg-white/20" : "bg-brand-blue/10 text-brand-blue"}`}>
                    {dash[t.dashKey]}
                  </span>
                ) : null}
              </button>
            );
          })}
        </aside>

        {/* Main content */}
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          {/* Toolbar — hidden for tabs that manage their own toolbar */}
          {!["talents","talent-pool"].includes(active) && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-900 text-navy mr-auto">
                {TABS.find(t => t.id === active)?.[lang === "vi" ? "labelVi" : "labelEn"]}
              </h2>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={e => handleSearch(e.target.value)} placeholder={tx(lang, "search")}
                  className="h-8 w-36 rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-cyan-500 sm:w-48" />
                {search && <button onClick={() => handleSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"><X className="size-3" /></button>}
              </div>
              {["posts","content","jobs","users"].includes(active) && (
                <button onClick={() => { setCreating(c => !c); setEditRow(null); }}
                  className="flex h-8 items-center gap-1.5 rounded-lg bg-navy px-3 text-xs font-700 text-white">
                  <Plus className="size-3.5" /> {tx(lang, "add")}
                </button>
              )}
            </div>
          )}

          {/* Detail drawer */}
          {detailRow && (
            <div className="mb-4">
              {active === "staffing" && <StaffingDetail lang={lang} row={detailRow} onClose={() => setDetailRow(null)} onRefresh={() => { setDetailRow(null); refresh(); }} />}
              {active === "applications" && <ApplicationDetail lang={lang} row={detailRow} onClose={() => setDetailRow(null)} onRefresh={() => { setDetailRow(null); refresh(); }} />}
            </div>
          )}

          {/* Content panels */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            {loading && !rows.length ? (
              <div className="flex items-center justify-center py-16 text-slate-400">
                <RefreshCw className="mr-2 size-5 animate-spin" /> {tx(lang, "loading")}
              </div>
            ) : (
              <>
                {active === "dashboard" && <DashboardPanel lang={lang} rows={rows} />}
                {active === "users" && (
                  <>
                    {creating && <UserForm lang={lang} onSubmit={async e => {
                      e.preventDefault();
                      const p = Object.fromEntries(new FormData(e.currentTarget).entries());
                      const r = await apiFetch(endpoints.users, "POST", p);
                      if (r) { setCreating(false); refresh("users"); }
                    }} onCancel={() => setCreating(false)} />}
                    {editRow && <UserForm lang={lang} initial={editRow} onSubmit={async e => {
                      e.preventDefault();
                      const p = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, unknown>;
                      if (!p.password) delete p.password;
                      await patchRow(endpoints.users, editRow.id, p);
                      setEditRow(null);
                    }} onCancel={() => setEditRow(null)} />}
                    <UsersPanel lang={lang} rows={filtered} onEdit={setEditRow}
                      onDelete={id => deleteRow(endpoints.users, id)}
                      onPatch={(id, d) => patchRow(endpoints.users, id, d)} />
                  </>
                )}
                {active === "staffing" && (
                  <StaffingPanel lang={lang} rows={filtered} onDetail={setDetailRow}
                    onPatch={(id, d) => patchRow(endpoints.staffing, id, d)}
                    onDelete={id => deleteRow(endpoints.staffing, id)} />
                )}
                {active === "applications" && (
                  <ApplicationsPanel lang={lang} rows={filtered} onDetail={setDetailRow}
                    onPatch={(id, d) => patchRow(endpoints.applications, id, d)}
                    onDelete={id => deleteRow(endpoints.applications, id)} />
                )}
                {active === "talents" && (
                  <>
                    {creating && <TalentForm lang={lang} onSubmit={async e => {
                      e.preventDefault();
                      const p = Object.fromEntries(new FormData(e.currentTarget).entries());
                      const r = await apiFetch(endpoints.talents, "POST", { ...p, yearsExperience: Number(p.yearsExperience) });
                      if (r) { setCreating(false); refresh("talents"); }
                    }} onCancel={() => setCreating(false)} />}
                    {editRow && <TalentForm lang={lang} initial={editRow} onSubmit={async e => {
                      e.preventDefault();
                      const p = Object.fromEntries(new FormData(e.currentTarget).entries());
                      await patchRow(endpoints.talents, editRow.id, { ...p, yearsExperience: Number(p.yearsExperience) });
                      setEditRow(null);
                    }} onCancel={() => setEditRow(null)} />}
                    <TalentsPanel lang={lang} rows={rows} onEdit={setEditRow}
                      onDelete={id => deleteRow(endpoints.talents, id)}
                      onPatch={(id, d) => patchRow(endpoints.talents, id, d)}
                      onRefresh={() => refresh("talents")} />
                  </>
                )}
                {active === "talent-pool" && (
                  <TalentPoolPanel lang={lang} rows={rows} />
                )}
                {active === "projects" && (
                  <ProjectsPanel lang={lang} rows={allFiltered} onRefresh={() => refresh()} />
                )}
                {active === "timesheets" && (
                  <TimesheetsPanel lang={lang} rows={filtered}
                    onPatch={(id, d) => patchRow(endpoints.timesheets, id, d)}
                    onRefresh={() => refresh()} />
                )}
                {active === "contacts" && (
                  <ContactsPanel lang={lang} rows={filtered}
                    onPatch={(id, d) => patchRow(endpoints.contacts, id, d)}
                    onDelete={id => deleteRow(endpoints.contacts, id)} />
                )}
                {active === "jobs" && (
                  <>
                    {(creating || editRow) && <JobForm lang={lang} initial={editRow ?? undefined}
                      onSubmit={async e => {
                        e.preventDefault();
                        const p = Object.fromEntries(new FormData(e.currentTarget).entries());
                        const data = {
                          ...p,
                          published: p.published === "on",
                          headcount: p.headcount ? Number(p.headcount) : 1,
                          expiresAt: p.expiresAt && String(p.expiresAt) ? new Date(String(p.expiresAt)).toISOString() : null,
                        };
                        if (editRow) await patchRow(endpoints.jobs, editRow.id, data);
                        else { const r = await apiFetch(endpoints.jobs, "POST", data); if (r) { setCreating(false); refresh("jobs"); } }
                        setEditRow(null); setCreating(false);
                      }} onCancel={() => { setCreating(false); setEditRow(null); }} />}
                    <JobsPanel lang={lang} rows={filtered} onEdit={setEditRow}
                      onDelete={id => deleteRow(endpoints.jobs, id)}
                      onPatch={(id, d) => patchRow(endpoints.jobs, id, d)} />
                  </>
                )}
                {active === "posts" && (
                  <>
                    {(creating || editRow) && <PostForm lang={lang} initial={editRow ?? undefined}
                      onSubmit={async e => {
                        e.preventDefault();
                        const p = Object.fromEntries(new FormData(e.currentTarget).entries());
                        const data = { ...p, published: p.published === "on" };
                        if (editRow) await patchRow(endpoints.posts, editRow.slug, data);
                        else { const r = await apiFetch(endpoints.posts, "POST", data); if (r) { setCreating(false); refresh("posts"); } }
                        setEditRow(null); setCreating(false);
                      }} onCancel={() => { setCreating(false); setEditRow(null); }} />}
                    <PostsPanel lang={lang} rows={filtered} onEdit={setEditRow}
                      onDelete={id => deleteRow(endpoints.posts, id)} />
                  </>
                )}
                {active === "content" && (
                  <>
                    {(creating || editRow) && <ContentForm lang={lang} initial={editRow ?? undefined}
                      onSubmit={async e => {
                        e.preventDefault();
                        const p = Object.fromEntries(new FormData(e.currentTarget).entries());
                        const data = { ...p, published: p.published === "on", order: Number(p.order || 0) };
                        if (editRow) await patchRow(endpoints.content, editRow.id, data);
                        else { const r = await apiFetch(endpoints.content, "POST", data); if (r) { setCreating(false); refresh("content"); } }
                        setEditRow(null); setCreating(false);
                      }} onCancel={() => { setCreating(false); setEditRow(null); }} />}
                    <ContentPanel lang={lang} rows={filtered} onEdit={setEditRow}
                      onDelete={id => deleteRow(endpoints.content, id)} />
                  </>
                )}
                {active === "products" && (
                  <ProductInquiriesPanel lang={lang} rows={filtered}
                    onPatch={(id, d) => patchRow(endpoints.products, id, d)}
                    onDelete={id => deleteRow(endpoints.products, id)} />
                )}
              </>
            )}

            {/* Pagination */}
            {!["dashboard", "talents", "talent-pool", "posts", "content", "jobs", "users", "projects"].includes(active) && totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
                <p className="text-xs text-slate-400">
                  {lang === "vi"
                    ? `Trang ${page}/${totalPages} — ${allFiltered.length} bản ghi`
                    : `Page ${page}/${totalPages} — ${allFiltered.length} records`}
                </p>
                <div className="flex gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-700 text-slate-600 hover:bg-slate-50 disabled:opacity-40">
                    ←
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), page + 2).map(p => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-700 ${p === page ? "border-brand-blue bg-brand-blue text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-700 text-slate-600 hover:bg-slate-50 disabled:opacity-40">
                    →
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}

// ─── Staffing Panel ───────────────────────────────────────────────
function StaffingAddForm({ lang, onSaved, onCancel }: { lang: Lang; onSaved: () => void; onCancel: () => void }) {
  const [saving, setSaving] = useState(false);
  const inp = "min-h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-blue";
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const raw = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch("/api/admin/staffing-requests", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...raw, status: "new" }),
    });
    setSaving(false);
    if (res.ok) { onSaved(); (e.target as HTMLFormElement).reset(); }
    else { const d = await res.json().catch(()=>({})); alert(`Lỗi: ${d.error??"Không lưu được"}`); }
  }
  return (
    <form onSubmit={handleSubmit} className="border-b border-slate-200 bg-slate-50 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-900 text-navy">{lang === "vi" ? "➕ Thêm yêu cầu thuê nhân sự" : "➕ Add Hire Request"}</h3>
        <button type="button" onClick={onCancel}><X className="size-5 text-slate-400" /></button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1"><span className="text-xs font-700 text-slate-500">Tên công ty / khách hàng *</span><input name="companyName" required className={inp} /></label>
        <label className="grid gap-1"><span className="text-xs font-700 text-slate-500">Người liên hệ</span><input name="contactPerson" className={inp} /></label>
        <label className="grid gap-1"><span className="text-xs font-700 text-slate-500">Email</span><input name="email" type="email" className={inp} /></label>
        <label className="grid gap-1"><span className="text-xs font-700 text-slate-500">SĐT</span><input name="phone" className={inp} /></label>
        <label className="grid gap-1"><span className="text-xs font-700 text-slate-500">Vị trí cần tuyển *</span><input name="role" required className={inp} placeholder="VD: Senior Backend Developer" /></label>
        <label className="grid gap-1"><span className="text-xs font-700 text-slate-500">Số lượng</span><input name="numberOfTalents" type="number" min="1" defaultValue="1" className={inp} /></label>
        <label className="grid gap-1"><span className="text-xs font-700 text-slate-500">Mô hình dịch vụ</span>
          <select name="serviceModel" className={inp}>
            {["Staffing","ODC","Project","Consulting"].map(m=><option key={m}>{m}</option>)}
          </select>
        </label>
        <label className="grid gap-1"><span className="text-xs font-700 text-slate-500">Thời gian cần</span><input name="startTimeline" className={inp} placeholder="VD: Q1/2025, ASAP" /></label>
        <label className="grid gap-1 sm:col-span-2"><span className="text-xs font-700 text-slate-500">Yêu cầu chi tiết</span><textarea name="requirements" rows={2} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-blue" /></label>
      </div>
      <div className="flex gap-2">
        <button disabled={saving} className="rounded-lg bg-navy px-4 py-2 text-sm font-700 text-white disabled:opacity-60">{saving ? "..." : "✓ Lưu"}</button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600">Hủy</button>
      </div>
    </form>
  );
}

function StaffingPanel({ lang, rows, onDetail, onPatch, onDelete }: {
  lang: Lang; rows: Row[];
  onDetail: (r: Row) => void;
  onPatch: (id: number, d: Row) => void;
  onDelete: (id: number) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleImport(file: File) {
    setImporting(true); setImportResult(null);
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/admin/staffing-requests/import", { method: "POST", body: fd });
    const d = await res.json();
    setImportResult(res.ok ? `✅ Import: ${d.imported ?? 0} mới · ${d.skipped ?? 0} bỏ qua` : `❌ ${d.error ?? "Lỗi"}`);
    setImporting(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3">
        <span className="text-xs font-700 text-slate-500 flex-1">{rows.length} yêu cầu</span>
        <a href="/api/admin/staffing-requests/template" download
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-700 text-slate-600 hover:bg-slate-50">
          <FileDown className="size-3.5" /> Mẫu Excel
        </a>
        <label className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-700 text-white ${importing ? "bg-slate-400" : "bg-emerald-600 hover:bg-emerald-700"}`}>
          <Upload className="size-3.5" /> Import
          <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" disabled={importing}
            onChange={e => { const f=e.target.files?.[0]; if(f) handleImport(f); }} />
        </label>
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 rounded-lg bg-navy px-3 py-1.5 text-xs font-700 text-white">
          <Plus className="size-3.5" /> Thêm yêu cầu
        </button>
      </div>
      {importResult && (
        <div className={`mx-4 mt-2 rounded-lg px-3 py-2 text-xs font-700 ${importResult.startsWith("✅") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
          {importResult} <button onClick={() => setImportResult(null)} className="ml-2 text-slate-400">✕</button>
        </div>
      )}
      {showAdd && <StaffingAddForm lang={lang} onSaved={() => { setShowAdd(false); window.location.reload(); }} onCancel={() => setShowAdd(false)} />}
      {rows.length === 0 ? <Empty lang={lang} /> : (
        <div className="divide-y divide-slate-100">
          {rows.map(row => {
            const id = Number(row.id);
            const stfl = STAFFING_FLOW.find(s => s.status === fmt(row.status)) ?? STAFFING_FLOW[0];
            return (
          <div key={id} className="p-4">
            <div className="flex flex-wrap items-start gap-3">
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onDetail(row)}>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-900 text-navy hover:text-brand-blue">{fmt(row.companyName)}</h3>
                  <Badge label={lang === "vi" ? stfl.labelVi : stfl.labelEn} color={stfl.color} />
                  {row.serviceModel ? <Badge label={fmt(row.serviceModel)} /> : null}
                  <ChevronRight className="size-4 text-slate-300" />
                </div>
                <p className="mt-0.5 text-sm text-slate-600">
                  <span className="font-700">{fmt(row.role)}</span> · {fmt(row.seniority)} · {fmt(row.numberOfTalents)} {lang === "vi" ? "người" : "people"}
                </p>
                <p className="text-xs text-slate-400">{fmt(row.contactPerson)} · <a href={`mailto:${fmt(row.email)}`} className="text-brand-blue hover:underline" onClick={e => e.stopPropagation()}>{fmt(row.email)}</a> · {fmtDate(row.createdAt, true)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <select value={fmt(row.status)}
                  onChange={e => onPatch(id, { status: e.target.value })}
                  className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-700 text-slate-700 outline-none focus:border-cyan-500">
                  {STAFFING_FLOW.map(s => <option key={s.status} value={s.status}>{lang === "vi" ? s.labelVi : s.labelEn}</option>)}
                </select>
                <button onClick={() => onDelete(id)} className="grid size-8 place-items-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
            {/* Pipeline progress bar */}
            <div className="mt-3 flex gap-0.5">
              {STAFFING_FLOW.slice(0, -1).map((s, i) => {
                const idx = STAFFING_FLOW.findIndex(x => x.status === fmt(row.status));
                return <div key={s.status} className={`h-1 flex-1 rounded-full transition-colors ${i <= idx ? "bg-brand-blue" : "bg-slate-200"}`} />;
              })}
            </div>
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Staffing Detail ──────────────────────────────────────────────
function StaffingDetail({ lang, row, onClose, onRefresh }: { lang: Lang; row: Row; onClose: () => void; onRefresh: () => void }) {
  const [activities, setActivities] = useState<Row[]>([]);
  const [note, setNote] = useState("");
  const [actor, setActor] = useState("HR");
  const id = Number(row.id);

  useEffect(() => {
    fetch(`/api/admin/staffing-requests/${id}/activity`).then(r => r.json()).then(d => setActivities(Array.isArray(d) ? d : [])).catch(() => {});
  }, [id]);

  async function addActivity(action: string, toStatus?: string, noteText?: string) {
    const fromStatus = fmt(row.status);
    await fetch(`/api/admin/staffing-requests/${id}/activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actor, action, fromStatus, toStatus, note: noteText ?? note }),
    });
    if (toStatus) {
      await fetch(`/api/admin/staffing-requests/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: toStatus }),
      });
    }
    setNote("");
    onRefresh();
  }

  const stfl = STAFFING_FLOW.find(s => s.status === fmt(row.status)) ?? STAFFING_FLOW[0];
  const nextSteps = STAFFING_FLOW.find(s => s.status === fmt(row.status))?.next ?? [];

  return (
    <div className="rounded-2xl border border-brand-blue/30 bg-blue-50/30 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-900 text-navy">{fmt(row.companyName)}</h3>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <Badge label={lang === "vi" ? stfl.labelVi : stfl.labelEn} color={stfl.color} />
            <span className="text-sm text-slate-500">{fmt(row.role)} · {fmt(row.seniority)} · {fmt(row.numberOfTalents)} {lang === "vi" ? "người" : "ppl"}</span>
          </div>
        </div>
        <button onClick={onClose} className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:bg-white"><X className="size-4" /></button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        {/* Left: details */}
        <div className="space-y-4">
          <div className="rounded-xl bg-white p-4 border border-slate-100 grid gap-2 sm:grid-cols-2 text-sm">
            {[["Liên hệ","contactPerson"],["Email","email"],["Phone","phone"],["Tech stack","technologyStack"],["English","englishLevel"],["Japanese","japaneseLevel"],["Start","startDate"],["Duration","duration"],["Budget","budgetRange"]].map(([l,k]) => row[k] ? (
              <div key={k}><span className="text-xs font-700 text-slate-400">{l}</span><p className="text-slate-700">{fmt(row[k])}</p></div>
            ) : null)}
          </div>

          {row.jobDescription ? (
            <div className="rounded-xl bg-white p-4 border border-slate-100">
              <p className="text-xs font-700 uppercase text-slate-400 mb-1">JD</p>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{fmt(row.jobDescription).slice(0, 600)}</p>
            </div>
          ) : null}

          {/* Owner + notes */}
          <div className="rounded-xl bg-white p-4 border border-slate-100 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-700 text-slate-400">{lang === "vi" ? "Owner" : "Owner"}</label>
              <input defaultValue={fmt(row.owner)} placeholder="Assign to..."
                onBlur={e => fetch(`/api/admin/staffing-requests/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ owner: e.target.value }) })}
                className={fc("mt-1 text-sm")} />
            </div>
            <div>
              <label className="text-xs font-700 text-slate-400">{lang === "vi" ? "Ghi chú nội bộ" : "Internal notes"}</label>
              <input defaultValue={fmt(row.internalNotes)} placeholder="..."
                onBlur={e => fetch(`/api/admin/staffing-requests/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ internalNotes: e.target.value }) })}
                className={fc("mt-1 text-sm")} />
            </div>
          </div>

          {/* Next actions */}
          {nextSteps.length > 0 && (
            <div className="rounded-xl bg-white p-4 border border-slate-100">
              <p className="text-xs font-700 uppercase text-slate-400 mb-2">{lang === "vi" ? "Hành động tiếp theo" : "Next actions"}</p>
              <div className="flex flex-wrap gap-2">
                {nextSteps.map(ns => {
                  const nstfl = STAFFING_FLOW.find(s => s.status === ns);
                  return (
                    <button key={ns} onClick={() => addActivity("status_change", ns)}
                      className="flex items-center gap-1.5 rounded-lg bg-navy px-3 py-1.5 text-xs font-700 text-white hover:bg-navy/90">
                      <ArrowRight className="size-3" />
                      {lang === "vi" ? `→ ${nstfl?.labelVi}` : `→ ${nstfl?.labelEn}`}
                    </button>
                  );
                })}
                <button onClick={() => addActivity("shortlist_sent", "ShortlistSent")}
                  className="flex items-center gap-1.5 rounded-lg border border-orange-300 bg-orange-50 px-3 py-1.5 text-xs font-700 text-orange-700">
                  📤 {lang === "vi" ? "Gửi shortlist" : "Send shortlist"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: activity log */}
        <div className="space-y-3">
          {/* Add note */}
          <div className="rounded-xl bg-white p-4 border border-slate-100">
            <p className="text-xs font-700 uppercase text-slate-400 mb-2">{lang === "vi" ? "Thêm ghi chú" : "Add note"}</p>
            <input value={actor} onChange={e => setActor(e.target.value)} placeholder="Tên người ghi" className={fc("mb-2 text-xs")} />
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
              placeholder={lang === "vi" ? "Nội dung ghi chú..." : "Note content..."}
              className={fc("text-sm resize-none mb-2")} />
            <button disabled={!note.trim()} onClick={() => addActivity("note")}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-blue py-2 text-xs font-700 text-white disabled:opacity-40">
              <Plus className="size-3.5" /> {lang === "vi" ? "Lưu ghi chú" : "Save note"}
            </button>
          </div>
          {/* Timeline */}
          <div className="rounded-xl bg-white p-4 border border-slate-100">
            <p className="text-xs font-700 uppercase text-slate-400 mb-3">{lang === "vi" ? "Lịch sử" : "History"}</p>
            {!activities.length ? <p className="text-xs text-slate-400">{lang === "vi" ? "Chưa có hoạt động" : "No activity yet"}</p> : null}
            <div className="flex flex-col gap-3">
              {activities.map((a, i) => (
                <div key={i} className="flex gap-2.5 text-xs">
                  <div className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500">
                    {a.action === "status_change" ? <ChevronUp className="size-3" /> : <Clock className="size-3" />}
                  </div>
                  <div>
                    <p className="font-700 text-slate-700">{fmt(a.actor)} · <span className="text-slate-400">{fmtDate(a.createdAt, true)}</span></p>
                    {a.toStatus ? <p className="text-slate-500">{fmt(a.fromStatus)} → <span className="font-700 text-brand-blue">{fmt(a.toStatus)}</span></p> : null}
                    {a.note ? <p className="mt-0.5 text-slate-600 italic">"{fmt(a.note)}"</p> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Applications Panel ───────────────────────────────────────────
function ApplicationCreateForm({ lang, onSaved, onCancel }: { lang: Lang; onSaved: () => void; onCancel: () => void }) {
  const [jobs, setJobs] = useState<Row[]>([]);
  const [selJob, setSelJob] = useState<Row | null>(null);
  const [saving, setSaving] = useState(false);
  const inp = "min-h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-blue";

  useEffect(() => {
    fetch("/api/admin/jobs").then(r => r.json()).then(d => setJobs(Array.isArray(d) ? d.filter((j: Row) => j.published) : [])).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true);
    const raw = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch("/api/admin/applications", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name:     raw.name, email: raw.email, phone: raw.phone || undefined,
        position: raw.position || (selJob ? fmt(selJob.title) : ""),
        jobId:    selJob ? Number(selJob.id) : undefined,
        message:  raw.message || undefined,
        status:   "new",
      }),
    });
    setSaving(false);
    if (res.ok) { onSaved(); (e.target as HTMLFormElement).reset(); setSelJob(null); }
    else { const d = await res.json().catch(()=>({})); alert(`Lỗi: ${d.error??"Không tạo được"}`); }
  }

  return (
    <form onSubmit={handleSubmit} className="border-b border-slate-200 bg-slate-50 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-900 text-navy">➕ {lang === "vi" ? "Thêm CV / hồ sơ ứng tuyển" : "Add Application"}</h3>
        <button type="button" onClick={onCancel}><X className="size-5 text-slate-400" /></button>
      </div>
      {/* Link to job position */}
      <div>
        <label className="grid gap-1">
          <span className="text-xs font-700 text-slate-500">📌 Ủng tuyển vào vị trí</span>
          <select value={selJob ? String(selJob.id) : ""}
            onChange={e => setSelJob(jobs.find(j => String(j.id) === e.target.value) ?? null)}
            className={inp}>
            <option value="">-- Không rõ / Tự điền --</option>
            {jobs.map(j => <option key={String(j.id)} value={String(j.id)}>{fmt(j.title)} ({fmt(j.department)})</option>)}
          </select>
        </label>
        {selJob && (
          <p className="mt-1 text-xs text-brand-blue">✔ Vị trí: {fmt(selJob.title)} · {fmt(selJob.department)} · {fmt(selJob.location)}</p>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1"><span className="text-xs font-700 text-slate-500">Họ tên *</span><input name="name" required className={inp} /></label>
        <label className="grid gap-1"><span className="text-xs font-700 text-slate-500">Email *</span><input name="email" type="email" required className={inp} /></label>
        <label className="grid gap-1"><span className="text-xs font-700 text-slate-500">SĐT</span><input name="phone" className={inp} /></label>
        <label className="grid gap-1"><span className="text-xs font-700 text-slate-500">Vị trí (nếu không chọn ở trên)</span>
          <input name="position" defaultValue={selJob ? fmt(selJob.title) : ""} className={inp} placeholder="VD: Backend Developer" /></label>
        <label className="grid gap-1 sm:col-span-2"><span className="text-xs font-700 text-slate-500">Ghi chú / Tóm tắt CV</span>
          <textarea name="message" rows={2} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-blue" /></label>
      </div>
      <div className="flex gap-2">
        <button disabled={saving} className="rounded-lg bg-navy px-4 py-2 text-sm font-700 text-white disabled:opacity-60">{saving ? "..." : "✓ Lưu hồ sơ"}</button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600">Hủy</button>
      </div>
    </form>
  );
}

function ApplicationsPanel({ lang, rows, onDetail, onPatch, onDelete }: {
  lang: Lang; rows: Row[];
  onDetail: (r: Row) => void;
  onPatch: (id: number, d: Row) => void;
  onDelete: (id: number) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
        <span className="text-xs text-slate-500 flex-1">{rows.length} hồ sơ ứng tuyển</span>
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 rounded-lg bg-navy px-3 py-1.5 text-xs font-700 text-white hover:bg-navy/90">
          <Plus className="size-3.5" /> Thêm hồ sơ
        </button>
      </div>
      {showAdd && <ApplicationCreateForm lang={lang} onCancel={() => setShowAdd(false)}
        onSaved={() => { setShowAdd(false); window.location.reload(); }} />}
      {!rows.length ? <Empty lang={lang} /> : (
      <div className="divide-y divide-slate-100">
        {rows.map(row => {
        const id = Number(row.id);
        const stg = CV_FLOW.find(s => s.stage === fmt(row.candidateStatus)) ?? CV_FLOW[0];
        const cvName = String(row.cvUrl ?? "").startsWith("data:filename=") ? String(row.cvUrl).split(";base64,")[0].replace("data:filename=", "") : null;
        return (
          <div key={id} className="p-4">
            <div className="flex flex-wrap items-start gap-3">
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onDetail(row)}>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-900 text-navy hover:text-brand-blue">{fmt(row.name)}</h3>
                  <Badge label={lang === "vi" ? stg.labelVi : stg.labelEn} color={stg.color} />
                  <ChevronRight className="size-4 text-slate-300" />
                </div>
                <p className="text-sm text-slate-600">{fmt(row.position)} · <a href={`mailto:${fmt(row.email)}`} className="text-brand-blue hover:underline" onClick={e => e.stopPropagation()}>{fmt(row.email)}</a></p>
                <p className="text-xs text-slate-400">{fmtDate(row.createdAt)}{row.assignedTo ? ` · 👤 ${fmt(row.assignedTo)}` : ""}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {cvName && (
                  <a href={`/api/admin/applications/${id}/cv`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-700 text-slate-600 hover:bg-slate-50">
                    <Download className="size-3.5" /> CV
                  </a>
                )}
                <select value={fmt(row.candidateStatus) || "Received"}
                  onChange={e => onPatch(id, { candidateStatus: e.target.value })}
                  className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-700 text-slate-700 outline-none focus:border-cyan-500">
                  {CV_FLOW.map(s => <option key={s.stage} value={s.stage}>{lang === "vi" ? s.labelVi : s.labelEn}</option>)}
                </select>
                <button onClick={() => onDelete(id)} className="grid size-8 place-items-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
            {/* CV pipeline progress */}
            <div className="mt-3 flex gap-0.5">
              {CV_FLOW.filter(s => s.stage !== "OnHold").map((s, i) => {
                const idx = CV_FLOW.findIndex(x => x.stage === fmt(row.candidateStatus));
                const pos = CV_FLOW.filter(x => x.stage !== "OnHold").findIndex(x => x.stage === s.stage);
                return <div key={s.stage} className={`h-1 flex-1 rounded-full ${pos <= idx ? "bg-brand-blue" : "bg-slate-200"}`} />;
              })}
            </div>
          </div>
        );
        })}
      </div>
      )}
    </div>
  );
}

// ─── Application Detail ───────────────────────────────────────────
function ApplicationDetail({ lang, row, onClose, onRefresh }: { lang: Lang; row: Row; onClose: () => void; onRefresh: () => void }) {
  const [activities, setActivities] = useState<Row[]>([]);
  const [note, setNote] = useState("");
  const [actor, setActor] = useState("HR");
  const [schedDate, setSchedDate] = useState("");
  const id = Number(row.id);

  useEffect(() => {
    fetch(`/api/admin/applications/${id}/activity`).then(r => r.json()).then(d => setActivities(Array.isArray(d) ? d : [])).catch(() => {});
  }, [id]);

  async function advance(toStage: string, action: string, noteText?: string) {
    await fetch(`/api/admin/applications/${id}/activity`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actor, action, fromStage: fmt(row.candidateStatus), toStage, note: noteText ?? note, scheduledAt: schedDate || undefined }),
    });
    await fetch(`/api/admin/applications/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateStatus: toStage }),
    });
    setNote(""); setSchedDate("");
    onRefresh();
  }

  const stg = CV_FLOW.find(s => s.stage === fmt(row.candidateStatus)) ?? CV_FLOW[0];
  const nextStages = stg.next;
  const cvName = String(row.cvUrl ?? "").startsWith("data:filename=") ? String(row.cvUrl).split(";base64,")[0].replace("data:filename=", "") : null;

  return (
    <div className="rounded-2xl border border-violet-200 bg-violet-50/30 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-900 text-navy">{fmt(row.name)}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge label={lang === "vi" ? stg.labelVi : stg.labelEn} color={stg.color} />
            <span className="text-sm text-slate-500">{fmt(row.position)}</span>
            {cvName && <a href={`/api/admin/applications/${id}/cv`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-700 text-brand-blue hover:underline"><Download className="size-3" /> {cvName}</a>}
          </div>
        </div>
        <button onClick={onClose} className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:bg-white"><X className="size-4" /></button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {/* Info */}
          <div className="rounded-xl bg-white p-4 border border-slate-100 text-sm grid gap-2 sm:grid-cols-2">
            {[["Email","email"],["Phone","phone"],["Applied for","position"]].map(([l,k]) => row[k] ? (
              <div key={k}><span className="text-xs font-700 text-slate-400">{l}</span><p>{fmt(row[k])}</p></div>
            ) : null)}
          </div>

          {/* Assigned + notes */}
          <div className="rounded-xl bg-white p-4 border border-slate-100 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-700 text-slate-400">{lang === "vi" ? "Giao cho" : "Assigned to"}</label>
              <input defaultValue={fmt(row.assignedTo)} placeholder="HR name..."
                onBlur={e => fetch(`/api/admin/applications/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ assignedTo: e.target.value }) })}
                className={fc("mt-1 text-sm")} />
            </div>
            <div>
              <label className="text-xs font-700 text-slate-400">{lang === "vi" ? "Phù hợp dự án" : "Project match"}</label>
              <input defaultValue={fmt(row.projectMatch)} placeholder="Client / project..."
                onBlur={e => fetch(`/api/admin/applications/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectMatch: e.target.value }) })}
                className={fc("mt-1 text-sm")} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-700 text-slate-400">{lang === "vi" ? "Ghi chú nội bộ" : "Internal notes"}</label>
              <input defaultValue={fmt(row.internalNotes)} placeholder="..."
                onBlur={e => fetch(`/api/admin/applications/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ internalNotes: e.target.value }) })}
                className={fc("mt-1 text-sm")} />
            </div>
          </div>

          {/* Next actions */}
          {nextStages.length > 0 && (
            <div className="rounded-xl bg-white p-4 border border-slate-100">
              <p className="text-xs font-700 uppercase text-slate-400 mb-2">{lang === "vi" ? "Hành động" : "Actions"}</p>
              <div className="flex flex-wrap gap-2">
                {nextStages.map(ns => {
                  const nstg = CV_FLOW.find(s => s.stage === ns);
                  const isInterview = ns === "TechInterview" || ns === "PhoneInterview";
                  const isOffer = ns === "OfferSent";
                  return (
                    <button key={ns} onClick={() => advance(ns, isInterview ? "interview_scheduled" : isOffer ? "offer_sent" : "stage_change")}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-700 ${ns === "Rejected" ? "border border-red-300 bg-red-50 text-red-700" : "bg-navy text-white hover:bg-navy/90"}`}>
                      <ArrowRight className="size-3" />
                      {lang === "vi" ? nstg?.labelVi : nstg?.labelEn}
                    </button>
                  );
                })}
              </div>
              {/* Schedule date */}
              <div className="mt-3 flex items-center gap-2">
                <label className="text-xs font-700 text-slate-400 whitespace-nowrap">{lang === "vi" ? "Ngày hẹn:" : "Schedule:"}</label>
                <input type="datetime-local" value={schedDate} onChange={e => setSchedDate(e.target.value)}
                  className="h-8 flex-1 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-800 outline-none focus:border-cyan-500" />
              </div>
            </div>
          )}
        </div>

        {/* Activity log */}
        <div className="space-y-3">
          <div className="rounded-xl bg-white p-4 border border-slate-100">
            <p className="text-xs font-700 uppercase text-slate-400 mb-2">{lang === "vi" ? "Ghi chú" : "Add note"}</p>
            <input value={actor} onChange={e => setActor(e.target.value)} placeholder="HR name" className={fc("mb-2 text-xs")} />
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
              placeholder={lang === "vi" ? "Ghi chú…" : "Note…"}
              className={fc("text-sm resize-none mb-2")} />
            <button disabled={!note.trim()} onClick={() => advance(fmt(row.candidateStatus), "note")}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-blue py-2 text-xs font-700 text-white disabled:opacity-40">
              <Plus className="size-3.5" /> {lang === "vi" ? "Lưu ghi chú" : "Save note"}
            </button>
          </div>
          <div className="rounded-xl bg-white p-4 border border-slate-100">
            <p className="text-xs font-700 uppercase text-slate-400 mb-3">{lang === "vi" ? "Lịch sử" : "History"}</p>
            {!activities.length ? <p className="text-xs text-slate-400">{lang === "vi" ? "Chưa có" : "None yet"}</p> : null}
            <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
              {activities.map((a, i) => (
                <div key={i} className="flex gap-2.5 text-xs">
                  <div className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500">
                    {a.action === "stage_change" || a.action === "interview_scheduled" || a.action === "offer_sent" ? <ArrowRight className="size-3" /> : <Clock className="size-3" />}
                  </div>
                  <div>
                    <p className="font-700 text-slate-700">{fmt(a.actor)} · <span className="text-slate-400">{fmtDate(a.createdAt, true)}</span></p>
                    {a.toStage ? <p className="text-slate-500">{fmt(a.fromStage)} → <span className="font-700 text-brand-blue">{fmt(a.toStage)}</span></p> : null}
                    {a.scheduledAt ? <p className="text-violet-600">📅 {fmtDate(a.scheduledAt)}</p> : null}
                    {a.note ? <p className="mt-0.5 text-slate-600 italic">"{fmt(a.note)}"</p> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Talents Panel ────────────────────────────────────────────────
// ─── Staff Management Panel ──────────────────────────────────────
const CONTRACT_TYPES = ["fulltime","parttime","probation","freelance","intern"] as const;
const CONTRACT_TYPE_LABEL: Record<string, { vi: string; color: string }> = {
  fulltime:   { vi: "Toàn thời gian", color: "bg-green-100 text-green-700" },
  parttime:   { vi: "Bán thời gian",  color: "bg-blue-100 text-blue-700" },
  probation:  { vi: "Thử việc",       color: "bg-orange-100 text-orange-700" },
  freelance:  { vi: "Freelance",      color: "bg-violet-100 text-violet-700" },
  intern:     { vi: "Thực tập",       color: "bg-slate-100 text-slate-600" },
};

function formatDate(d: unknown): string {
  if (!d) return "—";
  try { return new Date(String(d)).toLocaleDateString("vi-VN"); } catch { return "—"; }
}

// ─── Talent Pool Panel ─────────────────────────────────────────
function TalentPoolPanel({ lang, rows: allRows }: { lang: Lang; rows: Row[] }) {
  const [filter, setFilter] = useState("Available");
  const [search, setSearch] = useState("");
  const POOL_STATUSES = ["Available", "Interviewing", "Onboarded", "All"];
  const filtered = allRows.filter(r => {
    const matchStatus = filter === "All" || fmt(r.status) === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || fmt(r.code).toLowerCase().includes(q) || fmt(r.role).toLowerCase().includes(q) || fmt(r.fullName).toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });
  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3">
        <div className="flex gap-2">
          {POOL_STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-700 transition-all ${
                filter === s ? "bg-brand-blue text-white shadow" : "border border-slate-200 text-slate-600 hover:border-brand-blue"
              }`}>
              {s === "All" ? (lang === "vi" ? `Tất cả (${allRows.length})` : `All (${allRows.length})`) : s}
              {s !== "All" && ` (${allRows.filter(r => fmt(r.status) === s).length})`}
            </button>
          ))}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Tìm code / vị trí..."
          className="min-h-8 flex-1 max-w-64 rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-brand-blue" />
        <span className="ml-auto text-xs text-slate-400">{filtered.length} talent</span>
      </div>
      {/* Card grid */}
      {!filtered.length
        ? <div className="p-12 text-center text-slate-400">
            <div className="text-4xl mb-2">👤</div>
            <p className="text-sm">{filter === "Available" ? "Không có talent đang free" : "Không có kết quả"}</p>
          </div>
        : <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map(row => {
              const id = Number(row.id);
              const status = fmt(row.status);
              return (
                <div key={id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition">
                  <div className="flex items-start justify-between gap-2">
                    <div className="grid size-11 place-items-center rounded-xl bg-cyan-50 text-base font-900 text-brand-blue shrink-0">
                      {fmt(row.code).slice(0, 2).toUpperCase()}
                    </div>
                    <Badge label={status} color={TALENT_STATUS_COLOR[status] ?? "bg-slate-100 text-slate-500"} />
                  </div>
                  <h3 className="mt-3 font-900 text-navy text-sm">{fmt(row.fullName) || fmt(row.code)}</h3>
                  <p className="text-xs text-slate-500">{fmt(row.role)} · {fmt(row.seniority)}{row.yearsExperience ? ` · ${row.yearsExperience}yr` : ""}</p>
                  {row.department != null && <p className="text-[10px] text-slate-400 mt-0.5">🏢 {fmt(row.department)}</p>}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {fmt(row.skills).split(",").slice(0, 4).map(s => (
                      <span key={s} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-600 text-slate-600">{s.trim()}</span>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-3 text-[11px] text-slate-400">
                    <span>🇬🇧 {fmt(row.englishLevel)}</span>
                    {row.japaneseLevel != null && fmt(row.japaneseLevel) !== "None" && <span>🇯🇵 {fmt(row.japaneseLevel)}</span>}
                    {row.grossSalary != null && <span>💰 {Number(row.grossSalary).toLocaleString("vi-VN")}đ</span>}
                  </div>
                  {row.billingRate != null && (
                    <p className="mt-1.5 text-[11px] font-800 text-brand-blue">⭐ Bill: {fmtMoney(row.billingRate, fmt(row.billingCurrency))}</p>
                  )}
                </div>
              );
            })}
          </div>
      }
    </div>
  );
}

// ─── VN Insurance Calculator ────────────────────────────────────
// ─── VN Insurance Calculator (Luật 2024) ─────────────────────────
function calcVNInsurance(gross: number, dependents = 0) {
  if (!gross || gross <= 0) return null;
  // NLĐ đóng: BHXH 8% + BHYT 1.5% + BHTN 1% = 10.5%
  const empBHXH = Math.round(gross * 0.08);
  const empBHYT = Math.round(gross * 0.015);
  const empBHTN = Math.round(gross * 0.01);
  const empTotal = empBHXH + empBHYT + empBHTN;
  // Công ty đóng: BHXH 17.5% + BHYT 3% + BHTN 1% = 21.5%
  const cdBHXH = Math.round(gross * 0.175);
  const cdBHYT = Math.round(gross * 0.03);
  const cdBHTN = Math.round(gross * 0.01);
  const cdTotal = cdBHXH + cdBHYT + cdBHTN;
  // Thuế TNCN lũy tiến
  const personal = 11_000_000, dep = dependents * 4_400_000;
  const taxable = Math.max(0, gross - empTotal - personal - dep);
  const brackets: [number, number][] = [
    [5e6,.05],[5e6,.10],[8e6,.15],[14e6,.20],[20e6,.25],[28e6,.30],[Infinity,.35]
  ];
  let tax = 0, rem = taxable;
  for (const [cap, rate] of brackets) { if(rem<=0) break; tax += Math.min(rem,cap)*rate; rem-=cap; }
  tax = Math.round(tax);
  const net = gross - empTotal - tax;
  // Chi phí thực chi của công ty
  const t13Cost     = Math.round(gross / 12);                // Lương T13 (1/12 gross)
  const otherCost   = Math.round(gross * 0.07);              // Chi phí khác 7%
  const totalReal   = gross + cdTotal + t13Cost + otherCost; // Tổng thực chi
  return { empBHXH, empBHYT, empBHTN, empTotal, cdBHXH, cdBHYT, cdBHTN, cdTotal, tax, net, t13Cost, otherCost, totalReal };
}

// Reverse: tính Gross từ Net (binary search)
function grossFromNet(targetNet: number, dependents = 0): number {
  if (!targetNet || targetNet <= 0) return 0;
  let lo = targetNet, hi = targetNet * 2;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const c = calcVNInsurance(mid, dependents);
    if (!c) break;
    if (c.net < targetNet) lo = mid; else hi = mid;
    if (Math.abs(c.net - targetNet) < 100) break;
  }
  return Math.round((lo + hi) / 2);
}

function InsuranceBreakdown({ gross, dependents = 0 }: { gross: number; dependents?: number }) {
  const c = calcVNInsurance(gross, dependents);
  if (!c) return null;
  const v = (n: number) => n.toLocaleString("vi-VN") + "đ";
  return (
    <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4 text-xs space-y-2">
      <p className="font-800 text-navy text-sm">📊 Bảng tính chi phí (Luật VN 2024)</p>
      {/* Gross */}
      <div className="flex justify-between font-800 text-navy border-b border-slate-200 pb-1">
        <span>💰 Lương Gross</span><span>{v(gross)}</span>
      </div>
      {/* NLĐ */}
      <div className="space-y-0.5">
        <p className="font-700 text-slate-500">Khấu trừ NLĐ (-10.5%):</p>
        {([[" • BHXH (8%)", c.empBHXH],[" • BHYT (1.5%)", c.empBHYT],[" • BHTN (1%)", c.empBHTN]] as [string,number][]).map(([l,a]) => (
          <div key={l} className="flex justify-between text-red-500 pl-2"><span>{l}</span><span>-{v(a)}</span></div>
        ))}
        <div className="flex justify-between font-700 text-red-600 pl-2"><span> • Thuế TNCN</span><span>-{v(c.tax)}</span></div>
      </div>
      {/* Net */}
      <div className="flex justify-between font-900 text-emerald-700 border-y border-emerald-200 py-1.5 text-sm">
        <span>🟢 Lương NET nhận tay</span><span>{v(c.net)}</span>
      </div>
      {/* CĐ */}
      <div className="space-y-0.5">
        <p className="font-700 text-slate-500">Chi phí công ty đóng (+21.5%):</p>
        {([[" • BHXH (17.5%)", c.cdBHXH],[" • BHYT (3%)", c.cdBHYT],[" • BHTN (1%)", c.cdBHTN]] as [string,number][]).map(([l,a]) => (
          <div key={l} className="flex justify-between text-orange-500 pl-2"><span>{l}</span><span>+{v(a)}</span></div>
        ))}
      </div>
      {/* T13 + khác */}
      <div className="space-y-0.5 border-t border-slate-200 pt-1">
        <p className="font-700 text-slate-500">Chi phí thực tế phát sinh:</p>
        <div className="flex justify-between text-violet-600 pl-2"><span> • Lương T13 (Gross÷12)</span><span>+{v(c.t13Cost)}</span></div>
        <div className="flex justify-between text-violet-600 pl-2"><span> • Chi phí khác (7%)</span><span>+{v(c.otherCost)}</span></div>
      </div>
      {/* Total */}
      <div className="flex justify-between font-900 text-red-700 border-t-2 border-red-200 pt-2 text-sm bg-red-50 -mx-1 px-1 rounded-b-lg">
        <span>🏢 Tổng chi phí CT thực chi</span><span>{v(c.totalReal)}</span>
      </div>
    </div>
  );
}

// ─── Company Staff Panel — Excel-like editable table with pagination ──
const TALENT_STATUSES_FULL = ["Available","Interviewing","Assigned","Onboarded","Onsite","Inactive","Unavailable"];
const STATUS_COLORS: Record<string, string> = {
  Available:    "bg-emerald-100 text-emerald-700",
  Interviewing: "bg-blue-100 text-blue-700",
  Assigned:     "bg-cyan-100 text-cyan-700",
  Onboarded:    "bg-indigo-100 text-indigo-700",
  Onsite:       "bg-orange-100 text-orange-700",
  Inactive:     "bg-slate-100 text-slate-500",
  Unavailable:  "bg-red-100 text-red-500",
};
const PAGE_SIZE_OPTIONS = [50, 100, 150, 200];

type StaffEditRow = {
  id: number; code: string; fullName: string; role: string; department: string;
  seniority: string; skills: string; yearsExperience: number;
  englishLevel: string; japaneseLevel: string; location: string;
  workingModel: string; status: string;
  grossSalary: number | null; netSalary: number | null;
  billingRate: number | null; billingCurrency: string;
  contractType: string; email: string; phone: string;
  dirty: boolean; saving: boolean; error: string;
};

function TalentsPanel({ lang, rows, onEdit: _onEdit, onDelete, onPatch: _onPatch, onRefresh }: {
  lang: Lang; rows: Row[];
  onEdit: (r: Row) => void; onDelete: (id: number) => void;
  onPatch: (id: number, d: Row) => void; onRefresh: () => void;
}) {
  const [search, setSearch]           = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDept, setFilterDept]   = useState("All");
  const [page, setPage]               = useState(1);
  const [editRows, setEditRows]       = useState<Record<number, StaffEditRow>>({});
  const [pageSize, setPageSize]       = useState(50);
  const [showAdd, setShowAdd]         = useState(false);
  const [importing, setImporting]     = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [seeding, setSeeding]         = useState(false);
  const [detailId, setDetailId]       = useState<number | null>(null);
  const [detailData, setDetailData]   = useState<Row | null>(null);
  const fileRef   = useRef<HTMLInputElement>(null);
  const fileRefHR = useRef<HTMLInputElement>(null);

  async function openDetail(id: number) {
    setDetailId(id);
    try {
      const res = await fetch(`/api/admin/talents/${id}`);
      if (res.ok) setDetailData(await res.json());
    } catch {}
  }

  function closeDetail() { setDetailId(null); setDetailData(null); }

  // Search / filter
  const departments = ["All", ...Array.from(new Set(rows.map(r => fmt(r.department)).filter(Boolean)))];
  const filtered = rows.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || fmt(r.fullName).toLowerCase().includes(q)
      || fmt(r.code).toLowerCase().includes(q)
      || fmt(r.role).toLowerCase().includes(q)
      || fmt(r.email).toLowerCase().includes(q);
    const matchStatus = filterStatus === "All" || fmt(r.status) === filterStatus;
    const matchDept   = filterDept   === "All" || fmt(r.department) === filterDept;
    return matchSearch && matchStatus && matchDept;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const pageRows   = filtered.slice((safePage-1)*pageSize, safePage*pageSize);
  useEffect(() => { setPage(1); }, [search, filterStatus, filterDept, pageSize]);

  // Build editable row state
  function makeEdit(row: Row): StaffEditRow {
    const id = Number(row.id);
    if (editRows[id]) return editRows[id];
    return {
      id, code: fmt(row.code), fullName: fmt(row.fullName) || fmt(row.code),
      role: fmt(row.role), department: fmt(row.department),
      seniority: fmt(row.seniority) || "Mid",
      skills: fmt(row.skills) || fmt(row.role),
      yearsExperience: Number(row.yearsExperience) || 0,
      englishLevel: fmt(row.englishLevel) || "B1",
      japaneseLevel: fmt(row.japaneseLevel) || "None",
      location: fmt(row.location) || "Hà Nội",
      workingModel: fmt(row.workingModel) || "Onsite",
      status: fmt(row.status) || "Available",
      grossSalary: row.grossSalary != null ? Number(row.grossSalary) : null,
      netSalary:   row.netSalary   != null ? Number(row.netSalary)   : null,
      billingRate: row.billingRate  != null ? Number(row.billingRate) : null,
      billingCurrency: fmt(row.billingCurrency) || "VND",
      contractType: fmt(row.contractType) || "fulltime",
      email: fmt(row.email), phone: fmt(row.phone),
      dirty: false, saving: false, error: "",
    };
  }

  function updateCell(id: number, field: keyof StaffEditRow, value: unknown) {
    const base = makeEdit(rows.find(r => Number(r.id) === id) ?? {} as Row);
    setEditRows(prev => ({ ...prev, [id]: { ...base, ...prev[id], [field]: value, dirty: true, error: "" } }));
  }

  async function saveRow(id: number) {
    const row = rows.find(r => Number(r.id) === id);
    if (!row) return;
    const er = { ...makeEdit(row), ...editRows[id] };
    setEditRows(prev => ({ ...prev, [id]: { ...er, saving: true } }));
    try {
      const res = await fetch(`/api/admin/talents/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: er.fullName || undefined, role: er.role, department: er.department || undefined,
          seniority: er.seniority, yearsExperience: er.yearsExperience,
          skills: er.skills, englishLevel: er.englishLevel, japaneseLevel: er.japaneseLevel,
          location: er.location, workingModel: er.workingModel, status: er.status,
          grossSalary: er.grossSalary ?? undefined, netSalary: er.netSalary ?? undefined,
          billingRate: er.billingRate ?? undefined, billingCurrency: er.billingCurrency,
          contractType: er.contractType, email: er.email || undefined, phone: er.phone || undefined,
        }),
      });
      if (res.ok) {
        setEditRows(prev => ({ ...prev, [id]: { ...er, dirty: false, saving: false, error: "" } }));
        onRefresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setEditRows(prev => ({ ...prev, [id]: { ...er, saving: false, error: data.error ?? "Lỗi lưu" } }));
      }
    } catch {
      setEditRows(prev => ({ ...prev, [id]: { ...er, saving: false, error: "Lỗi kết nối" } }));
    }
  }

  async function saveAll() {
    const dirty = Object.entries(editRows).filter(([,r]) => r.dirty).map(([id]) => Number(id));
    await Promise.all(dirty.map(id => saveRow(id)));
  }

  async function handleImport(file: File, endpoint: string) {
    setImporting(true); setImportResult(null);
    const fd = new FormData(); fd.append("file", file);
    try {
      const res = await fetch(endpoint, { method: "POST", body: fd });
      const data = await res.json();
      setImportResult(res.ok ? `✅ ${data.message ?? `${data.total ?? 0} nhân sự`}` : `❌ ${data.error ?? "Lỗi import"}`);
      if (res.ok) onRefresh();
    } catch { setImportResult("❌ Lỗi kết nối"); }
    setImporting(false);
    if (fileRef.current) fileRef.current.value = "";
    if (fileRefHR.current) fileRefHR.current.value = "";
  }

  async function seedData() {
    setSeeding(true);
    const res = await fetch("/api/admin/seed-staff", { method: "POST" });
    const data = await res.json();
    setImportResult(res.ok ? `✅ ${data.message}` : `❌ ${data.error}`);
    setSeeding(false); onRefresh();
  }

  const dirtyCount = Object.values(editRows).filter(r => r.dirty).length;

  // ── Cell helpers ──
  const baseCellCls = "min-h-8 w-full rounded-md border px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-brand-blue transition";
  const cellCls = (dirty: boolean) =>
    `${baseCellCls} ${dirty ? "border-amber-300 bg-amber-50/70" : "border-transparent bg-transparent hover:border-slate-200 hover:bg-white"}`;

  return (
    <div className="flex flex-col" style={{ minHeight: 0 }}>
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-white px-4 py-2.5 flex-shrink-0">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Tên, mã, email, vị trí..."
          className="min-h-8 min-w-48 flex-1 rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-brand-blue" />
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
          className="min-h-8 rounded-lg border border-slate-200 px-2 text-xs outline-none">
          {departments.map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="min-h-8 rounded-lg border border-slate-200 px-2 text-xs outline-none">
          {["All",...TALENT_STATUSES_FULL].map(s => <option key={s}>{s}</option>)}
        </select>
        <span className="text-xs text-slate-400">{filtered.length} nhân sự</span>
        <div className="flex items-center gap-1.5 ml-2">
          <span className="text-xs text-slate-400">Hiển thị:</span>
          <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="min-h-8 rounded-lg border border-slate-200 px-2 text-xs font-700 outline-none">
            {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}/trang</option>)}
          </select>
        </div>

        <div className="ml-auto flex items-center gap-2 flex-wrap">
          {dirtyCount > 0 && (
            <button onClick={saveAll}
              className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-700 text-white hover:bg-emerald-700">
              💾 Lưu tất cả ({dirtyCount})
            </button>
          )}
          {rows.length === 0 && (
            <button onClick={seedData} disabled={seeding}
              className="flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-700 text-white hover:bg-violet-700 disabled:opacity-60">
              {seeding ? "⏳" : "🌱"} Seed mẫu
            </button>
          )}
          <a href="/api/admin/talents/template" download
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-700 text-slate-600 hover:bg-slate-50">
            <FileDown className="size-3" /> Mẫu
          </a>
          <label className={`flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-700 text-white ${importing ? "bg-slate-400" : "bg-emerald-600 hover:bg-emerald-700"}`}>
            <Upload className="size-3" /> Import
            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" disabled={importing}
              onChange={e => { const f=e.target.files?.[0]; if(f) handleImport(f,"/api/admin/talents/import"); }} />
          </label>
          <label className={`flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-700 text-white ${importing ? "bg-slate-400" : "bg-brand-blue hover:bg-blue-700"}`}
            title="Import file Sổ QLHSNV chuẩn ITSOL">
            <Upload className="size-3" /> HR File
            <input ref={fileRefHR} type="file" accept=".xlsx,.xls" className="hidden" disabled={importing}
              onChange={e => { const f=e.target.files?.[0]; if(f) handleImport(f,"/api/admin/talents/import-itsol"); }} />
          </label>
          <button onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1 rounded-lg bg-navy px-3 py-1.5 text-xs font-700 text-white hover:bg-navy/90">
            <Plus className="size-3" /> Thêm NV
          </button>
        </div>
      </div>

      {/* Import/seed result */}
      {importResult && (
        <div className={`mx-4 mt-2 flex items-center justify-between rounded-lg px-3 py-2 text-xs font-700 flex-shrink-0 ${importResult.startsWith("✅") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
          <span>{importResult}</span>
          <button onClick={() => setImportResult(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <div className="border-b border-slate-200 bg-slate-50 flex-shrink-0">
          <StaffForm lang={lang}
            onSave={async (data) => {
              const res = await fetch("/api/admin/talents", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
              });
              if (res.ok) { setShowAdd(false); onRefresh(); }
              else {
                const d = await res.json().catch(() => ({}));
                alert(`Lỗi: ${d.error ?? "Không tạo được nhân viên"}`);
              }
            }}
            onCancel={() => setShowAdd(false)}
          />
        </div>
      )}

      {/* Empty state */}
      {!rows.length ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-slate-400">
          <div className="text-5xl">👥</div>
          <p className="text-sm font-700">Chưa có nhân sự</p>
          <button onClick={seedData} disabled={seeding}
            className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-700 text-white hover:bg-violet-700">
            🌱 {seeding ? "Đang tạo..." : "Tạo dữ liệu mẫu (15 nhân viên)"}
          </button>
        </div>
      ) : (
        <>
          {/* ── Table ── */}
          <div className="overflow-x-auto flex-1 overflow-y-auto">
            <table className="w-full min-w-[1300px] text-xs border-collapse">
              <thead>
                <tr className="sticky top-0 z-10 bg-slate-800 text-white">
                  {[
                    ["","72px"],["#","44px"],["Mã NV","80px"],["Họ và tên","160px"],["Vị trí","150px"],
                    ["Phòng ban","100px"],["Level","90px"],["Trạng thái","120px"],
                    ["Gross/tháng","120px"],["Net/tháng","110px"],["Bill KH/tháng","120px"],
                    ["Email","150px"],["SĐT","100px"],
                  ].map(([h,w]) => (
                    <th key={String(h)} style={{ minWidth: String(w) }}
                      className="px-2 py-2 text-left text-[10px] font-800 uppercase tracking-wider border-r border-slate-700 last:border-r-0">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, idx) => {
                  const id  = Number(row.id);
                  const er  = { ...makeEdit(row), ...editRows[id] };
                  const dirty = editRows[id]?.dirty ?? false;
                  const rowN  = (safePage-1)*pageSize + idx + 1;
                  const bg    = dirty ? "bg-amber-50" : idx % 2 === 0 ? "bg-white" : "bg-slate-50/50";

                  return (
                    <tr key={id} className={`${bg} hover:bg-blue-50/25 group border-b border-slate-100 transition-colors`}>
                      {/* Actions — first column */}
                      <td className="px-1 py-1 border-r border-slate-100">
                        <div className="flex gap-1 items-center justify-center">
                          {dirty ? (
                            <button onClick={() => saveRow(id)} disabled={er.saving}
                              title={er.error || undefined}
                              className={`rounded-md px-2 py-1 text-[10px] font-800 text-white disabled:opacity-60 ${er.error ? "bg-red-500" : "bg-emerald-600 hover:bg-emerald-700"}`}>
                              {er.saving ? "⏳" : er.error ? "⚠" : "💾"}
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-300 group-hover:text-emerald-400">✓</span>
                          )}
                          <button onClick={() => openDetail(id)}
                            className="grid size-6 place-items-center rounded-md border border-blue-100 text-brand-blue hover:bg-blue-50"
                            title="Xem hồ sơ đầy đủ">
                            <span className="text-[10px]">👤</span>
                          </button>
                          <button onClick={() => { if(confirm("Xóa nhân viên này?")) onDelete(id); }}
                            className="grid size-6 place-items-center rounded-md border border-red-100 text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                        {er.error && <p className="text-[9px] text-red-500 mt-0.5 text-center max-w-16 truncate">{er.error}</p>}
                      </td>
                      {/* # */}
                      <td className="px-2 py-1.5 border-r border-slate-100 text-slate-400 font-600 text-center">{rowN}</td>
                      {/* Mã NV — READONLY */}
                      <td className="px-2 py-1.5 border-r border-slate-100">
                        <p className="font-900 text-navy text-[11px]">{er.code}</p>
                        <p className="text-[9px] text-slate-300">🔒</p>
                      </td>
                      {/* Họ tên */}
                      <td className="px-1 py-1 border-r border-slate-100">
                        <input value={er.fullName} onChange={e => updateCell(id,"fullName",e.target.value)}
                          className={cellCls(dirty)} />
                      </td>
                      {/* Vị trí */}
                      <td className="px-1 py-1 border-r border-slate-100">
                        <input value={er.role} onChange={e => updateCell(id,"role",e.target.value)}
                          className={cellCls(dirty)} />
                      </td>
                      {/* Phòng ban */}
                      <td className="px-1 py-1 border-r border-slate-100">
                        <input value={er.department} onChange={e => updateCell(id,"department",e.target.value)}
                          className={cellCls(dirty)} />
                      </td>
                      {/* Level */}
                      <td className="px-1 py-1 border-r border-slate-100">
                        <select value={er.seniority} onChange={e => updateCell(id,"seniority",e.target.value)}
                          className={`${cellCls(dirty)} cursor-pointer`}>
                          {["Junior","Mid","Senior","Lead","Principal"].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      {/* Status */}
                      <td className="px-1 py-1 border-r border-slate-100">
                        <select value={er.status} onChange={e => updateCell(id,"status",e.target.value)}
                          className={`${baseCellCls} cursor-pointer font-700 ${dirty?"border-amber-300":"border-transparent hover:border-slate-200"} ${STATUS_COLORS[er.status] ?? ""}`}>
                          {TALENT_STATUSES_FULL.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      {/* Gross */}
                      <td className="px-1 py-1 border-r border-slate-100">
                        <input type="number" step="500000" value={er.grossSalary ?? ""}
                          placeholder="VND"
                          onChange={e => {
                            const g = e.target.value ? Number(e.target.value) : null;
                            updateCell(id,"grossSalary",g);
                            if (g && g > 0) {
                              const c = calcVNInsurance(g);
                              if (c) updateCell(id,"netSalary",c.net);
                            }
                          }}
                          className={`${cellCls(dirty)} text-right`} />
                      </td>
                      {/* Net */}
                      <td className="px-1 py-1 border-r border-slate-100">
                        <input type="number" step="500000" value={er.netSalary ?? ""}
                          placeholder="Tự tính"
                          onChange={e => {
                            const net = e.target.value ? Number(e.target.value) : null;
                            updateCell(id,"netSalary",net);
                            if (net && net > 0) {
                              const gross = grossFromNet(net);
                              if (gross > 0) updateCell(id,"grossSalary",gross);
                            }
                          }}
                          className={`${cellCls(dirty)} text-right text-emerald-700`} />
                      </td>
                      {/* Bill rate */}
                      <td className="px-1 py-1 border-r border-slate-100">
                        <input type="number" step="500000" value={er.billingRate ?? ""}
                          placeholder="Bill KH"
                          onChange={e => updateCell(id,"billingRate",e.target.value ? Number(e.target.value) : null)}
                          className={`${cellCls(dirty)} text-right font-700 text-brand-blue`} />
                      </td>
                      {/* Email */}
                      <td className="px-1 py-1 border-r border-slate-100">
                        <input value={er.email} onChange={e => updateCell(id,"email",e.target.value)}
                          className={cellCls(dirty)} />
                      </td>
                      {/* SĐT */}
                      <td className="px-1 py-1 border-r border-slate-100">
                        <input value={er.phone} onChange={e => updateCell(id,"phone",e.target.value)}
                          className={cellCls(dirty)} />
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 bg-white px-4 py-2 flex-shrink-0">
              <span className="text-xs text-slate-500">
                Trang {safePage}/{totalPages} · {filtered.length} nhân sự · {pageSize}/trang{dirtyCount > 0 ? ` · ⚠ ${dirtyCount} chưa lưu` : ""}
              </span>
              <div className="flex gap-1">
                <button onClick={() => setPage(1)} disabled={safePage===1}
                  className="rounded-md border border-slate-200 px-2 py-1 text-xs disabled:opacity-40 hover:bg-slate-50">«</button>
                <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={safePage===1}
                  className="rounded-md border border-slate-200 px-2 py-1 text-xs disabled:opacity-40 hover:bg-slate-50">‹</button>
                {Array.from({length: Math.min(5,totalPages)}, (_,i) => {
                  let p = safePage - 2 + i;
                  if (p < 1) p += Math.max(0, 1-p);
                  if (p > totalPages) return null;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className={`rounded-md border px-2.5 py-1 text-xs font-700 ${p===safePage?"border-brand-blue bg-brand-blue text-white":"border-slate-200 hover:bg-slate-50"}`}>
                      {p}
                    </button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={safePage===totalPages}
                  className="rounded-md border border-slate-200 px-2 py-1 text-xs disabled:opacity-40 hover:bg-slate-50">›</button>
                <button onClick={() => setPage(totalPages)} disabled={safePage===totalPages}
                  className="rounded-md border border-slate-200 px-2 py-1 text-xs disabled:opacity-40 hover:bg-slate-50">»</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Staff Detail Modal */}
      {detailId != null && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) closeDetail(); }}>
          <div className="relative h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl flex flex-col">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between bg-navy px-5 py-4 text-white">
              <div>
                <p className="text-xs text-cyan-200 uppercase tracking-widest font-700">👤 Hồ sơ nhân viên</p>
                <h3 className="font-900 text-lg mt-0.5">
                  {detailData ? (fmt(detailData.fullName) || fmt(detailData.code)) : "..."}
                </h3>
              </div>
              <button onClick={closeDetail} className="rounded-lg p-2 hover:bg-white/15">
                <X className="size-5" />
              </button>
            </div>
            {/* Body */}
            {!detailData ? (
              <div className="flex items-center justify-center flex-1 py-20 text-slate-400">⏳ Đang tải...</div>
            ) : (
              <div className="flex-1 p-5 space-y-6">
                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[["Vị trí", fmt(detailData.role)],["Phòng ban", fmt(detailData.department)||"—"],["Trạng thái", fmt(detailData.status)]].map(([l,v]) => (
                    <div key={l} className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">{l}</p>
                      <p className="mt-1 text-sm font-800 text-navy">{v}</p>
                    </div>
                  ))}
                </div>

                {/* Edit form */}
                <StaffForm lang={lang} initial={detailData}
                  onSave={async (data) => {
                    const res = await fetch(`/api/admin/talents/${detailId}`, {
                      method: "PATCH", headers: {"Content-Type":"application/json"}, body: JSON.stringify(data)
                    });
                    if (res.ok) { openDetail(detailId!); onRefresh(); }
                    else { const d=await res.json().catch(()=>({})); alert(`Lỗi: ${d.error??"Không lưu được"}`); }
                  }}
                  onCancel={closeDetail}
                />

                {/* Contract history */}
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="font-800 text-navy mb-3">📄 Lịch sử hợp đồng</p>
                  {((detailData.contracts as Row[])??[]).length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Chưa có hợp đồng nào</p>
                  ) : (
                    <div className="space-y-2">
                      {((detailData.contracts as Row[])??[]).map((c: Row) => (
                        <div key={String(c.id)} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-800 text-navy">{fmt(c.contractNumber)||"HGĐ không số"} · <span className="text-brand-blue">{CONTRACT_TYPE_LABEL[fmt(c.contractType)]?.vi??fmt(c.contractType)}</span></p>
                              <p className="text-slate-500 mt-0.5">{formatDate(c.startDate)} → {c.endDate?formatDate(c.endDate):<span className="text-emerald-600">Hiện tại</span>}</p>
                            </div>
                            <button onClick={async () => {
                              await fetch(`/api/admin/staff-contracts/${c.id}`, {method:"DELETE"});
                              openDetail(detailId!);
                            }} className="text-red-400 hover:text-red-600 font-700">×</button>
                          </div>
                          {c.grossSalary != null && <p className="text-slate-500 mt-1">💰 Gross: {Number(c.grossSalary).toLocaleString("vi-VN")}đ{c.netSalary!=null ? ` | Net: ${Number(c.netSalary).toLocaleString("vi-VN")}đ` : ""}</p>}
                          {c.notes != null && <p className="text-slate-400 mt-0.5 italic">{fmt(c.notes)}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Add contract form */}
                  <AddContractForm staffId={Number(detailData.id)} lang={lang}
                    onSaved={() => openDetail(detailId!)} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AddContractForm({ staffId, lang, onSaved }: { staffId: number; lang: Lang; onSaved: () => void }) {
  const [form, setForm] = useState({ contractNumber:"", contractType:"fulltime", startDate:"", endDate:"", grossSalary:"", netSalary:"", notes:"" });
  const [saving, setSaving] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.startDate) return;
    setSaving(true);
    const res = await fetch("/api/admin/staff-contracts", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ staffId, ...form,
        grossSalary: form.grossSalary ? Number(form.grossSalary) : undefined,
        netSalary:   form.netSalary   ? Number(form.netSalary)   : undefined,
      }),
    });
    setSaving(false);
    if (res.ok) { setForm({ contractNumber:"", contractType:"fulltime", startDate:"", endDate:"", grossSalary:"", netSalary:"", notes:"" }); onSaved(); }
    else { const d=await res.json().catch(()=>({})); alert(`Lỗi: ${d.error??"Không lưu được"}`); }
  }
  const inp = "min-h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs outline-none focus:border-brand-blue";
  return (
    <form onSubmit={submit} className="mt-3 border-t border-dashed border-brand-blue/30 pt-3 space-y-2">
      <p className="text-xs font-700 text-brand-blue">+ Thêm hợp đồng mới</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <input placeholder="Số HĐ" value={form.contractNumber} onChange={e=>setForm(f=>({...f,contractNumber:e.target.value}))} className={inp}/>
        <select value={form.contractType} onChange={e=>setForm(f=>({...f,contractType:e.target.value}))} className={inp}>
          {CONTRACT_TYPES.map(t=><option key={t} value={t}>{CONTRACT_TYPE_LABEL[t]?.vi??t}</option>)}
        </select>
        <label className="grid gap-0.5"><span className="text-[10px] text-slate-400">Ngày bắt đầu *</span><input type="date" required value={form.startDate} onChange={e=>setForm(f=>({...f,startDate:e.target.value}))} className={inp}/></label>
        <label className="grid gap-0.5"><span className="text-[10px] text-slate-400">Ngày kết thúc</span><input type="date" value={form.endDate} onChange={e=>setForm(f=>({...f,endDate:e.target.value}))} className={inp}/></label>
        <input type="number" placeholder="Lương Gross" value={form.grossSalary} onChange={e=>setForm(f=>({...f,grossSalary:e.target.value}))} className={inp}/>
        <input type="number" placeholder="Lương Net" value={form.netSalary} onChange={e=>setForm(f=>({...f,netSalary:e.target.value}))} className={inp}/>
        <input placeholder="Ghi chú" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} className={`sm:col-span-2 ${inp}`}/>
      </div>
      <button disabled={saving || !form.startDate} className="rounded-lg bg-navy px-4 py-1.5 text-xs font-700 text-white disabled:opacity-40">
        {saving ? "..." : "✓ Lưu hợp đồng"}
      </button>
    </form>
  );
}

function StaffForm({ lang, initial, onSave, onChange, onCancel }: {
  lang: Lang;
  initial?: Partial<Row>;
  onSave: (data: Record<string, unknown>) => void;
  onChange?: (data: Partial<Row>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Record<string, unknown>>(initial ?? {});

  function update(key: string, val: unknown) {
    const next = { ...form, [key]: val };
    setForm(next);
    onChange?.(next);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }

  const inp = "min-h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-blue";
  const field = (key: string, label: string, type = "text", required = false, placeholder = "") => (
    <label key={key} className="grid gap-1">
      <span className="text-xs font-700 text-slate-500">{label}{required ? " *" : ""}</span>
      <input name={key} type={type} required={required} placeholder={placeholder}
        value={String(form[key] ?? "")}
        onChange={e => update(key, type === "number" ? (e.target.value ? Number(e.target.value) : null) : e.target.value)}
        className={inp} />
    </label>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-brand-blue/20 bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-900 text-navy">{initial?.id ? (lang === "vi" ? "✏️ Chỉnh sửa nhân viên" : "✏️ Edit staff") : (lang === "vi" ? "➕ Thêm nhân viên mới" : "➕ New staff")}</h3>
        <button type="button" onClick={onCancel}><X className="size-5 text-slate-400" /></button>
      </div>

      <div>
        <p className="mb-2 text-xs font-800 uppercase tracking-wider text-slate-400">👤 Thông tin cơ bản</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {field("code",     "Mã nhân viên *", "text", true, "NV001")}
          {field("fullName", "Họ và tên",     "text", false)}
          {field("email",    "Email",          "email")}
          {field("phone",    "SĐT",            "tel")}
          {field("dateOfBirth","Ngày sinh",    "date")}
          <label className="grid gap-1">
            <span className="text-xs font-700 text-slate-500">Giới tính</span>
            <select value={String(form.gender ?? "")} onChange={e => update("gender", e.target.value)} className={inp}>
              <option value="">—</option><option value="male">Nam</option><option value="female">Nữ</option><option value="other">Khác</option>
            </select>
          </label>
          {field("idNumber","CCCD/CMND")}
          {field("address", "Địa chỉ")}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-800 uppercase tracking-wider text-slate-400">🛠 Nghề nghiệp</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {field("role",      "Vị trí / Job title *", "text", true)}
          {field("department","Phòng ban")}
          {field("seniority", "Seniority *", "text", true, "Senior")}
          {field("yearsExperience","Năm kinh nghiệm","number")}
          {field("englishLevel","English level","text",false,"B2")}
          {field("japaneseLevel","Japanese level","text",false,"N3")}
          {field("location",  "Địa điểm làm việc")}
          <label className="grid gap-1">
            <span className="text-xs font-700 text-slate-500">Work model</span>
            <select value={String(form.workingModel ?? "Remote")} onChange={e => update("workingModel", e.target.value)} className={inp}>
              {["Remote","Onsite","Hybrid"].map(m => <option key={m}>{m}</option>)}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-700 text-slate-500">Trạng thái</span>
            <select value={String(form.status ?? "Available")} onChange={e => update("status", e.target.value)} className={inp}>
              {TALENT_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-700 text-slate-500">Availability</span>
            <input value={String(form.availability ?? "Immediate")} onChange={e => update("availability", e.target.value)} className={inp} />
          </label>
          <label className="grid gap-1 sm:col-span-2">
            <span className="text-xs font-700 text-slate-500">Skills (ngăn dấu phẩy)</span>
            <input value={String(form.skills ?? "")} onChange={e => update("skills", e.target.value)} className={inp} placeholder="React, Node.js, TypeScript" />
          </label>
          <label className="grid gap-1 sm:col-span-2">
            <span className="text-xs font-700 text-slate-500">Tóm tắt</span>
            <input value={String(form.summary ?? "")} onChange={e => update("summary", e.target.value)} className={inp} />
          </label>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-800 uppercase tracking-wider text-slate-400">📄 Hợp đồng hiện tại</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="grid gap-1">
            <span className="text-xs font-700 text-slate-500">Loại HĐ</span>
            <select value={String(form.contractType ?? "fulltime")} onChange={e => update("contractType", e.target.value)} className={inp}>
              {CONTRACT_TYPES.map(t => <option key={t} value={t}>{CONTRACT_TYPE_LABEL[t]?.vi ?? t}</option>)}
            </select>
          </label>
          {field("contractNumber","Số HĐ")}
          {field("contractStart","Ngày bắt đầu","date")}
          {field("contractEnd",  "Ngày kết thúc","date")}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-800 uppercase tracking-wider text-slate-400">💰 Lương & Phúc lợi</p>
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Nhập gross + auto-calculate */}
          <div className="space-y-3">
            <label className="grid gap-1">
              <span className="text-xs font-700 text-slate-500">💰 Lương GROSS (VND/tháng) *</span>
              <input type="number" value={String(form.grossSalary ?? "")} step="500000"
                onChange={e => {
                  const gross = e.target.value ? Number(e.target.value) : null;
                  const calc = gross ? calcVNInsurance(gross) : null;
                  update("grossSalary", gross);
                  if (calc) {
                    update("netSalary",      calc.net);
                    update("socialInsurance",calc.cdBHXH);
                    update("healthInsurance",calc.cdBHYT);
                    update("totalCost",      calc.totalReal); // gross + BH + T13 + 7%
                  }
                }}
                className={inp} placeholder="VD: 20000000" />
              <span className="text-[10px] text-slate-400">→ Nhập gross — BHXH, BHYT, thuế, net được tính tự động</span>
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-700 text-slate-500">🟢 Lương NET (nhập NET → tự tính Gross)</span>
              <input type="number" value={String(form.netSalary ?? "")} step="100000"
                onChange={e => {
                  const net = e.target.value ? Number(e.target.value) : null;
                  update("netSalary", net);
                  if (net && net > 0 && !form.grossSalary) {
                    const g = grossFromNet(net);
                    if (g > 0) {
                      update("grossSalary", g);
                      const c = calcVNInsurance(g);
                      if (c) {
                        update("socialInsurance", c.cdBHXH);
                        update("healthInsurance", c.cdBHYT);
                        update("totalCost", c.totalReal);
                      }
                    }
                  }
                }}
                className={inp} placeholder="Nhập Net → tự tính Gross" />
              <span className="text-[10px] text-slate-400">↔️ Nhập Gross → tính Net, hoặc nhập Net → tính Gross</span>
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-700 text-slate-500">Phụ cấp khác/tháng</span>
              <input type="number" value={String(form.otherAllowance ?? "")} step="100000"
                onChange={e => update("otherAllowance", e.target.value ? Number(e.target.value) : null)}
                className={inp} />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="grid gap-1">
                <span className="text-[10px] font-700 text-slate-500">⭐ Bill rate 1 (chuẩn)</span>
                <input type="number" value={String(form.billingRate ?? "")} step="500000"
                  onChange={e => update("billingRate", e.target.value ? Number(e.target.value) : null)} className={inp} />
              </label>
              <label className="grid gap-1">
                <span className="text-[10px] font-700 text-slate-500">⭐ Bill rate 2 (onsite)</span>
                <input type="number" value={String(form.billingRate2 ?? "")} step="500000"
                  onChange={e => update("billingRate2", e.target.value ? Number(e.target.value) : null)} className={inp} />
              </label>
            </div>
          </div>
          {/* Auto insurance breakdown */}
          {form.grossSalary ? (
            <InsuranceBreakdown gross={Number(form.grossSalary)} />
          ) : (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-brand-blue/30 bg-blue-50/50 p-6">
              <p className="text-center text-xs text-slate-400">
                📊 Nhập lương Gross — hệ thống tự tính<br/>BHXH, BHYT, BHTN, Thuế TNCN, Lương NET<br/>theo Luật Việt Nam
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 border-t border-slate-100 pt-4">
        <button type="submit" className="rounded-xl bg-navy px-6 py-2.5 text-sm font-700 text-white hover:bg-navy/90">
          ✓ {initial?.id ? (lang === "vi" ? "Cập nhật" : "Update") : (lang === "vi" ? "Tạo nhân viên" : "Create")}
        </button>
        <button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm text-slate-600">
          {lang === "vi" ? "Hủy" : "Cancel"}
        </button>
      </div>
    </form>
  );
}

// Legacy TalentForm (kept for compat)
function TalentForm({ lang, initial, onSubmit, onCancel }: { lang: Lang; initial?: Row; onSubmit: (e: FormEvent<HTMLFormElement>) => void; onCancel: () => void }) {
  return <form onSubmit={onSubmit} className="p-4">
    <p className="text-sm text-slate-500 mb-2">Use StaffForm instead.</p>
    <button type="button" onClick={onCancel}>Cancel</button>
  </form>;
}

// ─── Timesheets types ────────────────────────────────────────────
type TSRow = {
  id: number; talentId: number; code: string; fullName: string; role: string; seniority: string;
  workingDays: number; approvedDays: number; overtimeHours: number;
  grossSalary: number | null; billingRate: number | null; billingCurrency: string;
  status: string; note: string; approvedBy: string; invoiceRef: string;
  dirty: boolean; saving: boolean;
};

function calcPnL(row: TSRow, overheadRate = 0.3) {
  if (!row.workingDays) return { revenue: 0, cost: 0, overhead: 0, profit: 0, margin: 0 };
  //
  // THU = Bill KH × (Ngày Duyệt + OT) / Ngày Công
  // CHI = Gross   × (Ngày Duyệt + OT) / Ngày Công
  //
  const effective = row.approvedDays + row.overtimeHours; // Ngày duyệt + OT
  const revenue  = (row.billingRate  ?? 0) * effective / row.workingDays;
  const cost     = (row.grossSalary  ?? 0) * effective / row.workingDays;
  const overhead = cost * overheadRate;
  const profit   = revenue - cost - overhead;
  const margin   = revenue > 0 ? (profit / revenue) * 100 : 0;
  return { revenue, cost, overhead, profit, margin };
}

const TS_STATUSES = ["Draft","HRSubmitted","CHRMApproved","BODApproved","ClientApproved","Invoiced","Disputed"];
const TS_STATUS_COLOR: Record<string, string> = {
  Draft:"bg-slate-100 text-slate-500", HRSubmitted:"bg-blue-100 text-blue-700",
  CHRMApproved:"bg-violet-100 text-violet-700", BODApproved:"bg-orange-100 text-orange-700",
  ClientApproved:"bg-green-100 text-green-700", Invoiced:"bg-emerald-100 text-emerald-700",
  Disputed:"bg-red-100 text-red-700",
};

function TimesheetsPanel({ lang, rows: _rows, onPatch: _onPatch, onRefresh }: {
  lang: Lang; rows: Row[];
  onPatch: (id: number, d: Row) => void;
  onRefresh: () => void;
}) {
  const [projects, setProjects] = useState<Row[]>([]);
  const [selProjectId, setSelProjectId] = useState("");
  const [selMonth, setSelMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [sheetRows, setSheetRows] = useState<TSRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [viewMode, setViewMode] = useState<"sheet" | "list">("sheet");

  useEffect(() => {
    fetch("/api/admin/projects").then(r => r.json()).then(d => setProjects(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const selProject = projects.find(p => String(p.id) === selProjectId);

  async function loadSheet() {
    if (!selProjectId || !selMonth) return;
    setLoading(true); setMsg(null);
    const res = await fetch(`/api/admin/timesheets/batch?projectId=${selProjectId}&month=${selMonth}`);
    const data = await res.json();
    if (res.ok && data.rows) {
      setSheetRows(data.rows.map((r: Row) => ({
        id:              Number(r.id),
        talentId:        Number(r.talentId),
        code:            fmt((r.talent as Row)?.code ?? ""),
        fullName:        fmt((r.talent as Row)?.fullName ?? "") || fmt((r.talent as Row)?.code ?? ""),
        role:            fmt((r.talent as Row)?.role ?? ""),
        seniority:       fmt((r.talent as Row)?.seniority ?? ""),
        workingDays:     Number(r.workingDays  ?? 22),
        approvedDays:    Number(r.approvedDays ?? 22),
        overtimeHours:   Number(r.overtimeHours ?? 0),
        grossSalary:     r.effectiveGross   != null ? Number(r.effectiveGross)   : null,
        billingRate:     r.effectiveBilling != null ? Number(r.effectiveBilling) : null,
        billingCurrency: fmt(r.effectiveCurrency ?? "VND"),
        status:          fmt(r.status ?? "Draft"),
        note:            fmt(r.note ?? ""),
        approvedBy:      fmt(r.approvedBy ?? ""),
        invoiceRef:      fmt(r.invoiceRef ?? ""),
        dirty: false, saving: false,
      } as TSRow)));
    } else {
      setMsg({ text: data.error ?? "Lỗi tải dữ liệu", ok: false });
    }
    setLoading(false);
  }

  async function createBatch() {
    if (!selProjectId || !selMonth) return;
    setCreating(true); setMsg(null);
    const res = await fetch("/api/admin/timesheets/batch", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: Number(selProjectId), month: selMonth }),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg({ text: `✓ Tạo ${data.created} timesheet, bỏ qua ${data.skipped} (đã có), ${data.workingDays} ngày công`, ok: true });
      await loadSheet();
    } else {
      setMsg({ text: data.error ?? "Lỗi tạo timesheets", ok: false });
    }
    setCreating(false);
  }

  function updateRow(id: number, field: keyof TSRow, value: unknown) {
    setSheetRows(prev => prev.map(r =>
      r.id === id ? { ...r, [field]: value, dirty: true } : r
    ));
  }

  async function saveRow(row: TSRow) {
    setSheetRows(prev => prev.map(r => r.id === row.id ? { ...r, saving: true } : r));
    const res = await fetch(`/api/admin/timesheets/${row.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workingDays:     row.workingDays,
        approvedDays:    row.approvedDays,
        overtimeHours:   row.overtimeHours,
        grossSalary:     row.grossSalary,
        billingRate:     row.billingRate,
        billingCurrency: row.billingCurrency,
        status:          row.status,
        note:            row.note || undefined,
        approvedBy:      row.approvedBy || undefined,
        invoiceRef:      row.invoiceRef || undefined,
      }),
    });
    if (res.ok) {
      setSheetRows(prev => prev.map(r => r.id === row.id ? { ...r, dirty: false, saving: false } : r));
    } else {
      setSheetRows(prev => prev.map(r => r.id === row.id ? { ...r, saving: false } : r));
    }
  }

  async function saveAll() {
    const dirty = sheetRows.filter(r => r.dirty);
    await Promise.all(dirty.map(r => saveRow(r)));
    setMsg({ text: `✓ Đã lưu ${dirty.length} dòng`, ok: true });
    onRefresh();
  }

  // Tổng P&L
  const overheadRate = selProject ? Number(selProject.overheadRate ?? 0.3) : 0.3;
  const totals = sheetRows.reduce((acc, r) => {
    const p = calcPnL(r, overheadRate);
    return { revenue: acc.revenue + p.revenue, cost: acc.cost + p.cost, overhead: acc.overhead + p.overhead, profit: acc.profit + p.profit };
  }, { revenue: 0, cost: 0, overhead: 0, profit: 0 });

  const currency = sheetRows[0]?.billingCurrency ?? "VND";
  const dirtyCount = sheetRows.filter(r => r.dirty).length;

  // ── Cell component (inline editable) ──
  function NumCell({ row, field, step = 1 }: { row: TSRow; field: keyof TSRow; step?: number }) {
    return (
      <input
        type="number" step={step} min={0}
        value={String(row[field] ?? "")}
        onChange={e => updateRow(row.id, field, e.target.value === "" ? null : Number(e.target.value))}
        className={`w-full rounded-md border px-2 py-1 text-right text-xs font-700 outline-none focus:ring-1 focus:ring-brand-blue ${
          row.dirty ? "border-orange-300 bg-orange-50" : "border-transparent bg-transparent hover:border-slate-200 hover:bg-white"
        }`}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-end gap-3 border-b border-slate-100 bg-white px-4 py-3">
        <label className="grid gap-1">
          <span className="text-xs font-700 text-slate-500">{lang === "vi" ? "Dự án" : "Project"}</span>
          <select value={selProjectId} onChange={e => { setSelProjectId(e.target.value); setSheetRows([]); setMsg(null); }}
            className="min-h-9 min-w-52 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-blue">
            <option value="">{lang === "vi" ? "-- Chọn dự án --" : "-- Select project --"}</option>
            {projects.map(p => (
              <option key={String(p.id)} value={String(p.id)}>
                {fmt(p.clientName)} — {fmt(p.name)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          <span className="text-xs font-700 text-slate-500">{lang === "vi" ? "Tháng" : "Month"}</span>
          <input type="month" value={selMonth} onChange={e => { setSelMonth(e.target.value); setSheetRows([]); setMsg(null); }}
            className="min-h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-blue" />
        </label>
        <div className="flex items-end gap-2 pb-0.5">
          <button onClick={loadSheet} disabled={!selProjectId || loading}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-700 text-slate-600 hover:bg-slate-50 disabled:opacity-40">
            {loading ? "..." : (lang === "vi" ? "📂 Mở" : "📂 Load")}
          </button>
          <button onClick={createBatch} disabled={!selProjectId || creating}
            className="rounded-lg bg-navy px-3 py-2 text-xs font-700 text-white hover:bg-navy/90 disabled:opacity-40">
            {creating ? "..." : (lang === "vi" ? "⚡ Tạo timesheets" : "⚡ Generate")}
          </button>
          {dirtyCount > 0 && (
            <button onClick={saveAll}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-700 text-white hover:bg-emerald-700 animate-pulse">
              💾 {lang === "vi" ? `Lưu tất cả (${dirtyCount})` : `Save all (${dirtyCount})`}
            </button>
          )}
          {sheetRows.length > 0 && selProjectId && selMonth && (
            <a
              href={`/api/admin/timesheets/export?projectId=${selProjectId}&month=${selMonth}`}
              download
              className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-700 text-emerald-700 hover:bg-emerald-50">
              <FileDown className="size-3.5" />
              {lang === "vi" ? "📊 Export Excel" : "📊 Export Excel"}
            </a>
          )}
        </div>
      </div>

      {/* Msg */}
      {msg && (
        <div className={`mx-4 mt-2 rounded-lg px-3 py-2 text-xs font-700 ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
          {msg.text}
        </div>
      )}

      {/* ── Empty state ── */}
      {!sheetRows.length && !loading && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
          <div className="text-4xl">📊</div>
          <p className="text-sm font-700">{lang === "vi" ? "Chọn dự án + tháng → Mở hoặc Tạo timesheets" : "Select project + month → Load or Generate"}</p>
          {selProjectId && (
            <p className="text-xs">{lang === "vi" ? "Nhấn ⚡ Tạo timesheets để auto-tạo cho toàn bộ nhân sự" : "Click ⚡ Generate to auto-create for all project staff"}</p>
          )}
        </div>
      )}

      {/* ── P&L Summary bar ── */}
      {sheetRows.length > 0 && (() => {
          // ── Derive batch status from individual rows ───────────────────────────
          const statusCounts: Record<string, number> = {};
          sheetRows.forEach(r => { statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1; });
          const dominantStatus = Object.entries(statusCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] ?? "Draft";
          const allSameStatus = Object.keys(statusCounts).length === 1;

          // Pipeline: Draft → HRSubmitted → BODApproved → ClientApproved → Invoiced
          const BATCH_PIPELINE = [
            { status: "Draft",          label: { vi: "Nháp",           en: "Draft" },         color: "bg-slate-100 text-slate-600",    role: "Kế toán",   icon: "📝" },
            { status: "HRSubmitted",    label: { vi: "HR đã review",   en: "HR Reviewed" },   color: "bg-blue-100 text-blue-700",     role: "HR",        icon: "👩‍💼" },
            { status: "BODApproved",    label: { vi: "BOD đã duyệt",   en: "BOD Approved" },  color: "bg-orange-100 text-orange-700", role: "BOD",       icon: "✅" },
            { status: "ClientApproved", label: { vi: "KH xác nhận",    en: "Client OK" },     color: "bg-green-100 text-green-700",   role: "Client",    icon: "🤝" },
            { status: "Invoiced",       label: { vi: "Đã xuất HĐ",     en: "Invoiced" },      color: "bg-emerald-100 text-emerald-700",role: "Kế toán", icon: "🧾" },
          ];
          const currentPipelineIdx = BATCH_PIPELINE.findIndex(p => p.status === dominantStatus);
          const nextPipeline = currentPipelineIdx < BATCH_PIPELINE.length - 1 ? BATCH_PIPELINE[currentPipelineIdx + 1] : null;
          const currentPipeline = BATCH_PIPELINE[currentPipelineIdx] ?? BATCH_PIPELINE[0];

          async function advanceBatch() {
            if (!nextPipeline) return;
            if (!confirm(`Chuyển toàn bộ ${sheetRows.length} timesheet sang "${nextPipeline.label.vi}"?`)) return;
            const results = await Promise.allSettled(
              sheetRows.map(r =>
                fetch(`/api/admin/timesheets/${r.id}`, {
                  method: "PATCH", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: nextPipeline.status }),
                })
              )
            );
            const ok = results.filter(r => r.status === "fulfilled").length;
            setMsg({ text: `✓ Đã chuyển ${ok}/${sheetRows.length} timesheet → ${nextPipeline.label.vi}`, ok: true });
            await loadSheet();
          }

          return (
          <>
          {/* ── Pipeline Status Bar ── */}
          <div className="border-b border-slate-200 bg-white px-4 py-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* Steps */}
              <div className="flex items-center gap-1 flex-1 flex-wrap">
                {BATCH_PIPELINE.map((step, i) => {
                  const isActive = step.status === dominantStatus;
                  const isDone   = i < currentPipelineIdx;
                  return (
                    <div key={step.status} className="flex items-center gap-1">
                      <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-800 transition ${
                        isActive ? step.color + " ring-2 ring-offset-1 " + (step.color.includes("blue") ? "ring-blue-300" : step.color.includes("orange") ? "ring-orange-300" : "ring-slate-300") :
                        isDone   ? "bg-emerald-50 text-emerald-500" :
                        "bg-slate-50 text-slate-300"
                      }`}>
                        <span>{isDone ? "✓" : step.icon}</span>
                        <span className="hidden sm:inline">{lang === "vi" ? step.label.vi : step.label.en}</span>
                        {isActive && !allSameStatus && (
                          <span className="text-[9px] opacity-70">({statusCounts[step.status]}/{sheetRows.length})</span>
                        )}
                      </div>
                      {i < BATCH_PIPELINE.length - 1 && <span className="text-slate-200 text-xs">→</span>}
                    </div>
                  );
                })}
              </div>
              {/* Advance button */}
              {nextPipeline && (
                <button onClick={advanceBatch}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-800 text-white shadow transition hover:opacity-90 ${
                    nextPipeline.color.includes("blue") ? "bg-blue-600" :
                    nextPipeline.color.includes("orange") ? "bg-orange-600" :
                    nextPipeline.color.includes("green") ? "bg-green-600" :
                    nextPipeline.color.includes("emerald") ? "bg-emerald-600" : "bg-slate-600"
                  }`}>
                  {nextPipeline.icon} {lang === "vi" ? `${nextPipeline.role} Duyệt` : `Submit to ${nextPipeline.role}`}
                </button>
              )}
              {nextPipeline === null && (
                <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-800 text-emerald-700">
                  🎉 Hoàn tất pipeline
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
            <span className="text-xs font-800 uppercase tracking-wider text-slate-400">
              {selProject ? fmt(selProject.name) : ""} · {selMonth} · {sheetRows.length} {lang === "vi" ? "nhân sự" : "staff"}
            </span>
            <div className="flex flex-wrap gap-3 ml-auto">
              {[
                ["💵 Thu", totals.revenue,  "text-navy font-900"],
                ["📉 Chi NS", totals.cost, "text-slate-600"],
                ["🏢 BG Office", totals.overhead, "text-orange-600"],
                [totals.profit >= 0 ? "📈 Lãi" : "🔴 Lỗ", Math.abs(totals.profit), totals.profit >= 0 ? "text-emerald-700 font-900" : "text-red-600 font-900"],
              ].map(([label, val, cls]) => (
                <div key={String(label)} className="text-right">
                  <p className="text-[10px] text-slate-400">{String(label)}</p>
                  <p className={`text-sm ${String(cls)}`}>{fmtMoney(val as number, currency)}</p>
                </div>
              ))}
              {totals.revenue > 0 && (
                <div className="text-right">
                  <p className="text-[10px] text-slate-400">Margin</p>
                  <p className={`text-sm font-900 ${totals.profit >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {((totals.profit / totals.revenue) * 100).toFixed(1)}%
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Spreadsheet table ── */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 text-left">
                  {[
                    ["Nhân sự", "160px"],
                    ["Ngày công", "90px"],
                    ["Duyệt", "80px"],
                    ["OT (h)", "80px"],
                    ["Gross/tháng", "130px"],
                    ["Bill KH/tháng ★", "130px"],
                    ["💵 Thu = Bill×(NgàyDuyệt+OT)/NgàyCông", "130px"],
                    ["📉 Chi+BG (30%)", "110px"],
                    ["📊 Lãi/Lỗ", "110px"],
                    ["Status", "130px"],
                    ["Ghi chú", "140px"],
                    ["", "60px"],
                  ].map(([label, width]) => (
                    <th key={String(label)} style={{ minWidth: String(width) }}
                      className="border-b border-slate-200 px-2 py-2 text-xs font-800 uppercase tracking-wider text-slate-500">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sheetRows.map((row, idx) => {
                  const pnl = calcPnL(row, overheadRate);
                  const rowBg = row.dirty ? "bg-orange-50/60" : idx % 2 === 0 ? "bg-white" : "bg-slate-50/40";
                  return (
                    <tr key={row.id} className={`${rowBg} hover:bg-blue-50/30 group transition-colors`}>
                      {/* Nhân sự */}
                      <td className="border-b border-slate-100 px-2 py-1.5">
                        <p className="font-800 text-navy text-xs">{row.fullName || row.code}</p>
                        <p className="text-[10px] text-slate-400">{row.code} · {row.role} · {row.seniority}</p>
                      </td>
                      {/* Ngày công */}
                      <td className="border-b border-slate-100 px-1 py-1">
                        <NumCell row={row} field="workingDays" />
                      </td>
                      {/* Approved days */}
                      <td className="border-b border-slate-100 px-1 py-1">
                        <NumCell row={row} field="approvedDays" />
                      </td>
                      {/* OT */}
                      <td className="border-b border-slate-100 px-1 py-1">
                        <NumCell row={row} field="overtimeHours" />
                      </td>
                      {/* Gross */}
                      <td className="border-b border-slate-100 px-1 py-1">
                        <NumCell row={row} field="grossSalary" step={100000} />
                      </td>
                      {/* Billing */}
                      <td className="border-b border-slate-100 px-1 py-1">
                        <div className="flex items-center gap-1">
                          <NumCell row={row} field="billingRate" step={100000} />
                          <select value={row.billingCurrency}
                            onChange={e => updateRow(row.id, "billingCurrency", e.target.value)}
                            className="w-14 rounded border-transparent bg-transparent text-[10px] text-slate-400 outline-none hover:border-slate-200 hover:bg-white">
                            <option value="VND">VND</option><option value="USD">USD</option>
                          </select>
                        </div>
                      </td>
                      {/* Revenue */}
                      <td className="border-b border-slate-100 px-2 py-1.5 text-right">
                        <span className="text-xs font-800 text-navy">{fmtMoney(pnl.revenue, row.billingCurrency)}</span>
                      </td>
                      {/* Cost + Overhead */}
                      <td className="border-b border-slate-100 px-2 py-1.5 text-right">
                        <p className="text-xs text-slate-500">{fmtMoney(pnl.cost, row.billingCurrency)}</p>
                        <p className="text-[10px] text-orange-500">+{fmtMoney(pnl.overhead, row.billingCurrency)}</p>
                      </td>
                      {/* Profit */}
                      <td className="border-b border-slate-100 px-2 py-1.5 text-right">
                        <p className={`text-xs font-900 ${pnl.profit >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                          {pnl.profit >= 0 ? "+" : ""}{fmtMoney(pnl.profit, row.billingCurrency)}
                        </p>
                        {pnl.revenue > 0 && (
                          <p className={`text-[10px] font-700 ${pnl.margin >= 0 ? "text-emerald-500" : "text-red-400"}`}>
                            {pnl.margin.toFixed(0)}%
                          </p>
                        )}
                      </td>
                      {/* Status */}
                      <td className="border-b border-slate-100 px-1 py-1">
                        <select value={row.status} onChange={e => updateRow(row.id, "status", e.target.value)}
                          className={`w-full rounded-md border px-1.5 py-1 text-xs font-700 outline-none focus:ring-1 focus:ring-brand-blue ${
                            TS_STATUS_COLOR[row.status] ?? "bg-slate-100 text-slate-600"
                          } ${row.dirty ? "border-orange-300" : "border-transparent"}`}>
                          {TS_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      {/* Note */}
                      <td className="border-b border-slate-100 px-1 py-1">
                        <input value={row.note} onChange={e => updateRow(row.id, "note", e.target.value)}
                          placeholder="Ghi chú..."
                          className={`w-full rounded-md border px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-brand-blue ${
                            row.dirty ? "border-orange-300 bg-orange-50" : "border-transparent bg-transparent hover:border-slate-200 hover:bg-white"
                          }`}
                        />
                      </td>
                      {/* Save + Delete */}
                      <td className="border-b border-slate-100 px-1 py-1 text-center">
                        <div className="flex gap-1 justify-center">
                          {row.dirty && (
                            <button onClick={() => saveRow(row)} disabled={row.saving}
                              className="rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-800 text-white hover:bg-emerald-700 disabled:opacity-60">
                              {row.saving ? "..." : "💾"}
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              if (!confirm(`Xóa timesheet của ${row.fullName || row.code}?`)) return;
                              await fetch(`/api/admin/timesheets/${row.id}`, { method: "DELETE" });
                              setSheetRows(prev => prev.filter(r => r.id !== row.id));
                            }}
                            className="grid size-6 place-items-center rounded-md border border-red-100 text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Xóa">
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Totals row */}
              <tfoot>
                <tr className="bg-navy/5 font-800">
                  <td colSpan={6} className="border-t border-slate-200 px-2 py-2 text-xs font-800 text-navy">
                    TỔNG ({sheetRows.length} nhân sự)
                  </td>
                  <td className="border-t border-slate-200 px-2 py-2 text-right text-xs font-900 text-navy">
                    {fmtMoney(totals.revenue, currency)}
                  </td>
                  <td className="border-t border-slate-200 px-2 py-2 text-right">
                    <p className="text-xs text-slate-600">{fmtMoney(totals.cost, currency)}</p>
                    <p className="text-[10px] text-orange-500">+{fmtMoney(totals.overhead, currency)}</p>
                  </td>
                  <td className="border-t border-slate-200 px-2 py-2 text-right">
                    <p className={`text-sm font-900 ${totals.profit >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                      {fmtMoney(totals.profit, currency)}
                    </p>
                    {totals.revenue > 0 && (
                      <p className={`text-[10px] font-700 ${totals.profit >= 0 ? "text-emerald-500" : "text-red-400"}`}>
                        {((totals.profit / totals.revenue) * 100).toFixed(1)}% margin
                      </p>
                    )}
                  </td>
                  <td colSpan={3} className="border-t border-slate-200" />
                </tr>
              </tfoot>
            </table>
          </div>
          </>
          );
        })()
      }
    </div>
  );
}


// ─── Projects Panel ───────────────────────────────────────────────
function fmtMoney(val: unknown, currency = "VND"): string {
  const n = Number(val);
  if (!val || isNaN(n)) return "—";
  if (currency === "USD") return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
  return `${n.toLocaleString("vi-VN")}đ`;
}

// ─── Project Type config ──────────────────────────────────────────
const PROJECT_TYPES = [
  { value: "Staffing",   labelVi: "Staffing",    color: "bg-blue-100 text-blue-700",    icon: "👤" },
  { value: "ODC",        labelVi: "ODC",         color: "bg-violet-100 text-violet-700",icon: "🏗️" },
  { value: "FixedPrice", labelVi: "Fixed Price", color: "bg-orange-100 text-orange-700",icon: "📄" },
];

// ─── TalentDualList ────────────────────────────────────
function TalentDualList({ lang, projectId, allTalents, assignments, onAdded, onRemoved }: {
  lang: Lang; projectId: number; allTalents: Row[]; assignments: Row[];
  onAdded: () => void; onRemoved: () => void;
}) {
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState<Row | null>(null);
  const [form, setForm] = useState({ role: "", grossSalary: "", netSalary: "", billingRate: "", billingCurrency: "VND" });
  const [saving, setSaving] = useState(false);

  const assignedIds = new Set(assignments.map(a => Number((a.talent as Row)?.id ?? a.talentId)));
  const available = allTalents.filter(t =>
    !assignedIds.has(Number(t.id)) &&
    (search === "" || (fmt(t.fullName)||fmt(t.code)).toLowerCase().includes(search.toLowerCase()) || fmt(t.role).toLowerCase().includes(search.toLowerCase()))
  );

  async function confirmAdd() {
    if (!adding) return;
    setSaving(true);
    await fetch(`/api/admin/projects/${projectId}/assignments`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        talentId: Number(adding.id), role: form.role || undefined,
        grossSalary: form.grossSalary ? Number(form.grossSalary) : undefined,
        netSalary:   form.netSalary   ? Number(form.netSalary)   : undefined,
        billingRate: form.billingRate ? Number(form.billingRate)  : undefined,
        billingCurrency: form.billingCurrency,
      }),
    });
    setSaving(false); setAdding(null);
    setForm({ role: "", grossSalary: "", netSalary: "", billingRate: "", billingCurrency: "VND" });
    onAdded();
  }

  async function removeAssignment(assignmentId: number) {
    await fetch(`/api/admin/projects/${projectId}/assignments?assignmentId=${assignmentId}`, { method: "DELETE" });
    onRemoved();
  }

  return (
    <div className="space-y-3">
      {adding && (
        <div className="rounded-2xl border border-brand-blue/30 bg-blue-50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-800 text-navy text-sm">➕ {fmt(adding.code)} — {fmt(adding.role)} <span className="text-slate-400 font-500">({fmt(adding.seniority)})</span></p>
            <button onClick={() => setAdding(null)}><X className="size-4 text-slate-400" /></button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {(["role", "grossSalary", "netSalary", "billingRate"] as const).map(key => (
              <label key={key} className="grid gap-1">
                <span className="text-xs font-700 text-slate-500">{key === "role" ? (lang === "vi" ? "Vai trò trong DA" : "Role") : key === "grossSalary" ? "💰 Gross (VND)" : key === "netSalary" ? "🟢 Net (VND)" : "⭐ Bill KH"}</span>
                <input type={key === "role" ? "text" : "number"}
                  value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="min-h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-blue" />
              </label>
            ))}
            <label className="grid gap-1">
              <span className="text-xs font-700 text-slate-500">Currency</span>
              <select value={form.billingCurrency} onChange={e => setForm(f => ({ ...f, billingCurrency: e.target.value }))}
                className="min-h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none">
                <option value="VND">VND</option><option value="USD">USD</option>
              </select>
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={confirmAdd} disabled={saving}
              className="rounded-lg bg-navy px-4 py-2 text-sm font-700 text-white disabled:opacity-60">
              {saving ? "..." : (lang === "vi" ? "✓ Thêm vào dự án" : "✓ Add to project")}
            </button>
            <button onClick={() => setAdding(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600">
              {lang === "vi" ? "Hủy" : "Cancel"}
            </button>
          </div>
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Left: Available */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50 px-3 py-2.5">
            <p className="text-xs font-800 uppercase tracking-wider text-slate-400">{lang === "vi" ? "Nhân sự có sẵn" : "Available"} ({available.length})</p>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={lang === "vi" ? "🔍 Tìm mã / vị trí..." : "🔍 Search..."}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-brand-blue" />
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
            {available.length === 0
              ? <p className="p-4 text-center text-xs text-slate-400 italic">{lang === "vi" ? "Không có" : "None"}</p>
              : available.map(t => (
              <div key={String(t.id)} className="group flex items-center justify-between px-3 py-2.5 hover:bg-blue-50">
                <div>
                  <p className="text-xs font-800 text-navy">{fmt(t.fullName) || fmt(t.code)} <span className="text-slate-400 font-500">({fmt(t.code)})</span></p>
                  <p className="text-[10px] text-slate-400">{fmt(t.role)} · {fmt(t.seniority)}{t.grossSalary != null ? ` · ${Number(t.grossSalary).toLocaleString("vi-VN")}đ` : ""}</p>
                </div>
                <button onClick={() => { setAdding(t); setForm({ role: "", grossSalary: t.grossSalary ? String(t.grossSalary) : "", netSalary: t.netSalary ? String(t.netSalary) : "", billingRate: "", billingCurrency: "VND" }); }}
                  className="rounded-lg bg-brand-blue px-2.5 py-1 text-xs font-700 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  Thêm →
                </button>
              </div>
            ))}
          </div>
        </div>
        {/* Right: In project */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50 px-3 py-2.5">
            <p className="text-xs font-800 uppercase tracking-wider text-slate-400">{lang === "vi" ? "Nhân sự trong dự án" : "In project"} ({assignments.length})</p>
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
            {assignments.length === 0
              ? <p className="p-4 text-center text-xs text-slate-400 italic">{lang === "vi" ? "Chưa có — thêm từ bên trái" : "None yet"}</p>
              : assignments.map(a => {
              const talent = (a.talent as Row) ?? {};
              const gross = a.grossSalary ?? talent.grossSalary;
              return (
                <div key={String(a.id)} className="group flex items-center justify-between px-3 py-2.5 hover:bg-red-50">
                  <div>
                    <p className="text-xs font-800 text-navy">{fmt(talent.fullName) || fmt(talent.code)} <span className="text-[10px] text-slate-400 font-500">({fmt(talent.code)})</span></p>
                    <p className="text-[10px] text-slate-400">{fmt(talent.role)}</p>
                    <div className="flex flex-wrap gap-2 mt-0.5">
                      {a.role != null && String(a.role).length > 0 && <span className="text-[10px] text-slate-500">{fmt(a.role)}</span>}
                      {gross != null && <span className="text-[10px] font-700 text-slate-500">💰{Number(gross).toLocaleString("vi-VN")}đ</span>}
                      {a.billingRate != null && <span className="text-[10px] font-700 text-brand-blue">⭐{fmtMoney(a.billingRate, fmt(a.billingCurrency))}</span>}
                    </div>
                  </div>
                  <button onClick={() => removeAssignment(Number(a.id))}
                    className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-700 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    ← Bỏ
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Projects Panel ─────────────────────────────────────────────
function ProjectsPanel({ lang, rows, onRefresh }: { lang: Lang; rows: Row[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("Staffing");
  const [editingProject, setEditingProject] = useState<Row | null>(null); // null = create mode
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [addingAssignment, setAddingAssignment] = useState<number | null>(null);
  const [talents, setTalents] = useState<Row[]>([]);
  const [pnlData, setPnlData] = useState<Record<number, Row>>({});
  const [saving, setSaving] = useState(false);
  const currentMonth = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    fetch("/api/admin/talents").then(r => r.json()).then(d => setTalents(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  async function saveProject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const raw = Object.fromEntries(new FormData(e.currentTarget));
    const data = {
      ...raw,
      isBackOffice: raw.isBackOffice === "on",
      overheadRate: raw.overheadRate ? Number(raw.overheadRate) / 100 : 0.3,
      contractValue: raw.contractValue ? Number(raw.contractValue) : undefined,
    };
    if (editingProject) {
      // Update existing project
      const res = await fetch(`/api/admin/projects/${editingProject.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      if (res.ok) { setShowForm(false); setEditingProject(null); onRefresh(); }
      else { const d = await res.json().catch(()=>({})); alert(`Lỗi: ${d.error??"Không lưu được"}`); }
    } else {
      // Create new project
      const res = await fetch("/api/admin/projects", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      if (res.ok) { setShowForm(false); onRefresh(); (e.target as HTMLFormElement).reset(); }
      else { const d = await res.json().catch(()=>({})); alert(`Lỗi: ${d.error??"Không tạo được"}`); }
    }
    setSaving(false);
  }

  async function deleteProject(id: number, name: string) {
    if (!confirm(`Xóa dự án "${name}"? Hành động này không thể hoàn tác.`)) return;
    const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    if (res.ok) { onRefresh(); setExpandedId(null); }
    else { const d = await res.json().catch(()=>({})); alert(`Lỗi: ${d.error??"Không xóa được"}`);
    }
  }

  function openEditForm(proj: Row) {
    setEditingProject(proj);
    setFormType(fmt(proj.projectType) || "Staffing");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function loadPnl(projectId: number, month = currentMonth) {
    try {
      const res = await fetch(`/api/admin/timesheets/pnl?projectId=${projectId}&month=${month}`);
      if (res.ok) { const d = await res.json(); setPnlData(p => ({ ...p, [projectId]: d })); }
    } catch {}
  }

  async function addAssignment(projectId: number, formData: FormData) {
    const talentId = Number(formData.get("talentId"));
    if (!talentId) return;
    await fetch(`/api/admin/projects/${projectId}/assignments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        talentId,
        role: formData.get("role") || undefined,
        grossSalary: formData.get("grossSalary") ? Number(formData.get("grossSalary")) : undefined,
        netSalary: formData.get("netSalary") ? Number(formData.get("netSalary")) : undefined,
        billingRate: formData.get("billingRate") ? Number(formData.get("billingRate")) : undefined,
        billingCurrency: formData.get("billingCurrency") || "VND",
      }),
    });
    setAddingAssignment(null);
    onRefresh();
  }

  async function removeAssignment(projectId: number, assignmentId: number) {
    await fetch(`/api/admin/projects/${projectId}/assignments?assignmentId=${assignmentId}`, { method: "DELETE" });
    onRefresh();
  }

  async function updateProjectStatus(id: number, status: string) {
    await fetch(`/api/admin/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    onRefresh();
  }

  const statusColors: Record<string, string> = {
    active:    "bg-green-100 text-green-700",
    completed: "bg-blue-100 text-blue-700",
    paused:    "bg-yellow-100 text-yellow-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-900 text-navy">{lang === "vi" ? "Dự án & Hợp đồng" : "Projects & Contracts"}</h2>
        <button onClick={() => { setShowForm(!showForm); setEditingProject(null); setFormType("Staffing"); }} className="flex items-center gap-1.5 rounded-lg bg-navy px-3 py-2 text-xs font-700 text-white">
          <Plus className="size-3.5" /> {lang === "vi" ? "Thêm dự án" : "New Project"}
        </button>
      </div>

      {showForm && (
          <form key={editingProject ? String(editingProject.id) : "create"} onSubmit={saveProject} className="rounded-2xl border border-brand-blue/20 bg-white shadow-lg p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-900 text-navy">{editingProject ? (lang === "vi" ? "✏️ Sửa dự án" : "✏️ Edit Project") : (lang === "vi" ? "📁 Tạo dự án mới" : "📁 Create New Project")}</h3>
              <button type="button" onClick={() => setShowForm(false)}><X className="size-5 text-slate-400" /></button>
            </div>

            {/* Section 1: Thông tin cơ bản */}
            <div>
              <p className="mb-3 text-xs font-800 uppercase tracking-wider text-slate-400">{lang === "vi" ? "🏢 Thông tin dự án" : "🏢 Project info"}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 sm:col-span-2">
                  <span className="text-xs font-700 text-slate-500">{lang === "vi" ? "Tên dự án / Hợp đồng *" : "Project / Contract name *"}</span>
                  <input name="name" required defaultValue={editingProject ? fmt(editingProject.name) : ""} className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-blue" placeholder="VD: Web Portal ERP — FPT Software" />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs font-700 text-slate-500">{lang === "vi" ? "Số hợp đồng" : "Contract no."}</span>
                  <input name="contractNumber" defaultValue={editingProject ? fmt(editingProject.contractNumber) : ""} className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-blue" placeholder="HD-2025-001" />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs font-700 text-slate-500">{lang === "vi" ? "Ngày bắt đầu *" : "Start date *"}</span>
                  <input name="startDate" type="date" defaultValue={editingProject?.startDate ? fmt(editingProject.startDate).slice(0,10) : ""} className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-blue" />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs font-700 text-slate-500">{lang === "vi" ? "Ngày kết thúc" : "End date"}</span>
                  <input name="endDate" type="date" defaultValue={editingProject?.endDate ? fmt(editingProject.endDate).slice(0,10) : ""} className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-blue" />
                </label>
                <label className="grid gap-1 sm:col-span-2">
                  <span className="text-xs font-700 text-slate-500">{lang === "vi" ? "Mô tả" : "Description"}</span>
                  <textarea name="description" rows={2} defaultValue={editingProject ? fmt(editingProject.description) : ""} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-blue" />
                </label>
              </div>
            </div>

            {/* Section 2: Khách hàng */}
            <div>
              <p className="mb-3 text-xs font-800 uppercase tracking-wider text-slate-400">{lang === "vi" ? "👤 Thông tin khách hàng" : "👤 Client info"}</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="grid gap-1 sm:col-span-1">
                  <span className="text-xs font-700 text-slate-500">{lang === "vi" ? "Tên khách hàng *" : "Client name *"}</span>
                  <input name="clientName" required defaultValue={editingProject ? fmt(editingProject.clientName) : ""} className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-blue" />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs font-700 text-slate-500">📧 Email</span>
                  <input name="clientEmail" type="email" defaultValue={editingProject ? fmt(editingProject.clientEmail) : ""} className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-blue" />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs font-700 text-slate-500">📱 SĐT</span>
                  <input name="clientPhone" type="tel" defaultValue={editingProject ? fmt(editingProject.clientPhone) : ""} className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-blue" />
                </label>
              </div>
            </div>

            {/* Section 3: Loại dự án */}
            <div>
              <p className="mb-3 text-xs font-800 uppercase tracking-wider text-slate-400">{lang === "vi" ? "📂 Loại dự án & Tài chính" : "📂 Project type & Finance"}</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {/* Type selector as cards */}
                <div className="grid gap-1 sm:col-span-2 lg:col-span-4">
                  <span className="text-xs font-700 text-slate-500">{lang === "vi" ? "Loại dự án *" : "Project type *"}</span>
                  <div className="flex gap-2 flex-wrap">
                    {PROJECT_TYPES.map(pt => (
                      <label key={pt.value} className="cursor-pointer">
                        <input type="radio" name="projectType" value={pt.value} defaultChecked={pt.value === "Staffing"}
                          onChange={() => setFormType(pt.value)} className="sr-only" />
                        <span className={`flex items-center gap-1.5 rounded-xl border-2 px-4 py-2 text-sm font-700 transition ${
                          formType === pt.value ? "border-navy bg-navy text-white" : "border-slate-200 text-slate-600 hover:border-navy/30"
                        }`}>{pt.icon} {pt.value === "FixedPrice" ? (lang === "vi" ? "Fixed Price" : "Fixed Price") : pt.labelVi}</span>
                      </label>
                    ))}
                  </div>
                  {formType !== "FixedPrice" && (
                    <p className="mt-1 text-xs text-slate-400">ℹ️ {lang === "vi" ? "Giá được tính theo từng nhân sự load vào dự án" : "Price is calculated per individual talent in the project"}</p>
                  )}
                </div>
                {formType === "FixedPrice" && (
                  <>
                    <label className="grid gap-1">
                      <span className="text-xs font-700 text-slate-500">💵 {lang === "vi" ? "Giá trị HĐ *" : "Contract value *"}</span>
                      <input name="contractValue" type="number" min="0" defaultValue={editingProject ? String(editingProject.contractValue ?? "") : ""} className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-blue" placeholder="VD: 500000000" />
                    </label>
                    <label className="grid gap-1">
                      <span className="text-xs font-700 text-slate-500">Currency</span>
                      <select name="currency" className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none">
                        <option value="VND">VND</option><option value="USD">USD</option>
                      </select>
                    </label>
                  </>
                )}
                <label className="grid gap-1">
                  <span className="text-xs font-700 text-slate-500">{lang === "vi" ? "% Back Office overhead" : "% Back Office overhead"}</span>
                  <div className="flex items-center gap-2">
                    <input name="overheadRate" type="number" min="0" max="100" step="5" defaultValue={editingProject ? String(Math.round(Number(editingProject.overheadRate ?? 0.3) * 100)) : "30"}
                      className="min-h-10 w-24 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-blue" />
                    <span className="text-sm text-slate-500">%</span>
                  </div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer pt-5">
                  <input name="isBackOffice" type="checkbox" className="size-4 rounded" />
                  <span className="text-sm font-700 text-slate-600">{lang === "vi" ? "🏢 Là dự án Back Office" : "🏢 Back Office project"}</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 border-t border-slate-100 pt-4">
              <button disabled={saving} className="rounded-xl bg-navy px-6 py-2.5 text-sm font-700 text-white hover:bg-navy/90 disabled:opacity-60">
                {saving ? "⏳..." : editingProject ? (lang === "vi" ? "✓ Lưu thay đổi" : "✓ Save changes") : (lang === "vi" ? "✓ Tạo dự án" : "✓ Create project")}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingProject(null); }}
                className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm text-slate-600">
                {lang === "vi" ? "Hủy" : "Cancel"}
              </button>
            </div>
          </form>
      )}

      {!rows.length ? <Empty lang={lang} /> : (
        <div className="space-y-4">
          {rows.map(proj => {
            const id = Number(proj.id);
            const assignments = (proj.assignments as Row[]) ?? [];
            const isExpanded = expandedId === id;
            const pType = PROJECT_TYPES.find(t => t.value === fmt(proj.projectType)) ?? PROJECT_TYPES[0];
            return (
              <div key={id} className={`rounded-2xl border bg-white shadow-sm overflow-hidden transition ${
                proj.isBackOffice ? "border-orange-200 bg-orange-50/30" : "border-slate-200"
              }`}>
                {/* Card header — click to expand */}
                <div className="flex flex-wrap items-start gap-3 p-5 cursor-pointer hover:bg-slate-50/80"
                  onClick={() => setExpandedId(isExpanded ? null : id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {Boolean(proj.isBackOffice) && <span className="text-xs">🏢</span>}
                      <h3 className="font-900 text-navy text-base">{fmt(proj.name)}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-800 ${pType.color}`}>{pType.icon} {pType.labelVi}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-700 ${statusColors[fmt(proj.status)] ?? "bg-slate-100 text-slate-600"}`}>{fmt(proj.status)}</span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span>🏢 {fmt(proj.clientName)}</span>
                      {proj.contractNumber != null && <span>📄 {fmt(proj.contractNumber)}</span>}
                      {proj.startDate != null && <span>📅 {new Date(String(proj.startDate)).toLocaleDateString("vi-VN")}</span>}
                      {proj.clientPhone != null && <span>📱 {fmt(proj.clientPhone)}</span>}
                      {proj.clientEmail != null && <span>📧 {fmt(proj.clientEmail)}</span>}
                    </div>
                    {proj.projectType === "FixedPrice" && proj.contractValue != null && (
                      <p className="mt-1 text-xs font-800 text-orange-600">💵 HGĐ: {fmtMoney(proj.contractValue, fmt(proj.currency))}</p>
                    )}
                    {proj.description != null && <p className="mt-1 text-xs text-slate-400 line-clamp-1">{fmt(proj.description)}</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-700 text-blue-700">
                      {assignments.length} {lang === "vi" ? "nhân sự" : "staff"}
                    </span>
                    <select value={fmt(proj.status)}
                      onChange={e => { e.stopPropagation(); updateProjectStatus(id, e.target.value); }}
                      onClick={e => e.stopPropagation()}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-600 text-slate-600 outline-none">
                      {["active","completed","paused","cancelled"].map(s => <option key={s}>{s}</option>)}
                    </select>
                    {/* Edit / Delete */}
                    <button onClick={e => { e.stopPropagation(); openEditForm(proj); }}
                      className="grid size-7 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-brand-blue"
                      title={lang === "vi" ? "Sửa dự án" : "Edit project"}>
                      <Edit2 className="size-3.5" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); deleteProject(id, fmt(proj.name)); }}
                      className="grid size-7 place-items-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50"
                      title={lang === "vi" ? "Xóa dự án" : "Delete project"}>
                      <Trash2 className="size-3.5" />
                    </button>
                    <ChevronDown className={`size-4 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 space-y-5">

                    {/* P&L Summary */}
                    {!proj.isBackOffice && (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-800 uppercase tracking-wider text-slate-400">📊 P&L {currentMonth}</p>
                          <button onClick={() => loadPnl(id)} className="text-xs font-700 text-brand-blue hover:underline">
                            {lang === "vi" ? "Tính lại" : "Recalculate"}
                          </button>
                        </div>
                        {(() => {
                          const pnl = pnlData[id];
                          if (!pnl) return (
                            <button onClick={() => loadPnl(id)} className="text-xs font-700 text-brand-blue">
                              → {lang === "vi" ? "Xem P&L tháng này" : "View this month P&L"}
                            </button>
                          );
                          const profit = Number(pnl.profit ?? 0);
                          const margin = Number(pnl.margin ?? 0);
                          return (
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                              {([
                                ["💵 Thu", fmtMoney(pnl.revenue, fmt(pnl.currency)), "text-navy"],
                                ["📉 Chi NS", fmtMoney(pnl.directCost, fmt(pnl.currency)), "text-slate-600"],
                                ["🏢 Back Office", fmtMoney(pnl.backOfficeOverhead, fmt(pnl.currency)), "text-orange-600"],
                                [profit >= 0 ? "📈 Lãi" : "🔴 Lỗ", fmtMoney(Math.abs(profit), fmt(pnl.currency)), profit >= 0 ? "text-emerald-700 font-900" : "text-red-600 font-900"],
                              ] as [string, string, string][]).map(([label, val, cls]) => (
                                <div key={label} className="rounded-lg bg-white p-2 border border-slate-100">
                                  <p className="text-[10px] text-slate-400">{label}</p>
                                  <p className={`text-sm font-800 ${cls}`}>{val}</p>
                                </div>
                              ))}
                              <div className="col-span-2 sm:col-span-4 text-right text-xs font-700">
                                {margin >= 0
                                  ? <span className="text-emerald-600">↗ Margin: {margin.toFixed(1)}%</span>
                                  : <span className="text-red-500">↘ Margin: {margin.toFixed(1)}%</span>}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Talent dual-list */}
                    <div>
                      <p className="mb-3 text-xs font-800 uppercase tracking-wider text-slate-400">
                        {lang === "vi" ? "👥 Nhân sự dự án" : "👥 Project staff"}
                      </p>
                      <TalentDualList
                        lang={lang}
                        projectId={id}
                        allTalents={talents}
                        assignments={assignments}
                        onAdded={onRefresh}
                        onRemoved={onRefresh}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Contacts Panel ───────────────────────────────────────────────
function ContactsPanel({ lang, rows, onPatch, onDelete }: { lang: Lang; rows: Row[]; onPatch: (id: number, d: Row) => void; onDelete: (id: number) => void }) {
  if (!rows.length) return <Empty lang={lang} />;
  const STATUS_COLOR: Record<string, string> = { new: "bg-orange-100 text-orange-700", contacted: "bg-blue-100 text-blue-700", qualified: "bg-green-100 text-green-700", closed: "bg-slate-200 text-slate-500" };
  return (
    <div className="divide-y divide-slate-100">
      {rows.map(row => {
        const id = Number(row.id);
        const status = fmt(row.status) || "new";
        return (
          <div key={id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-900 text-navy">{fmt(row.name)}</h3>
                  {row.company ? <span className="text-sm text-slate-500">· {fmt(row.company)}</span> : null}
                  <Badge label={status} color={STATUS_COLOR[status]} />
                </div>
                <p className="text-sm text-slate-600 mt-0.5">
                  <a href={`mailto:${fmt(row.email)}`} className="text-brand-blue hover:underline">{fmt(row.email)}</a>
                  {row.phone ? ` · ${fmt(row.phone)}` : ""}
                </p>
                {row.service ? <p className="text-xs font-700 text-brand-blue mt-0.5">{fmt(row.service)}</p> : null}
                <p className="mt-1.5 text-sm text-slate-700">{fmt(row.message)}</p>
                <p className="mt-1 text-xs text-slate-400">{fmtDate(row.createdAt)}</p>
              </div>
              <div className="flex gap-2">
                <select value={status} onChange={e => onPatch(id, { status: e.target.value })}
                  className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-700 text-slate-700 outline-none focus:border-cyan-500">
                  {CONTACT_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
                <a href={`mailto:${fmt(row.email)}`} className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
                  <Globe className="size-3.5" />
                </a>
                <button onClick={() => onDelete(id)} className="grid size-8 place-items-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Jobs Panel ───────────────────────────────────────────────────
function JobsPanel({ lang, rows, onEdit, onDelete, onPatch }: { lang: Lang; rows: Row[]; onEdit: (r: Row) => void; onDelete: (id: number) => void; onPatch: (id: number, d: Row) => void }) {
  if (!rows.length) return <Empty lang={lang} />;
  return (
    <div className="divide-y divide-slate-100">
      {rows.map(row => {
        const id = Number(row.id);
        return (
          <div key={id} className="flex flex-wrap items-start gap-3 p-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-900 text-navy">{fmt(row.title)}</h3>
                {row.headcount != null && Number(row.headcount) > 1 && (
                  <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-800 text-orange-700">
                    👥 {String(row.headcount)} vị trí
                  </span>
                )}
                <Badge label={fmt(row.level)} />
                <Badge label={fmt(row.department)} color="bg-violet-100 text-violet-700" />
                <Badge label={row.published ? "Published" : "Draft"} color={row.published ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"} />
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-0.5">
                <span>📍 {fmt(row.location)}</span>
                {row.expiresAt != null && <span className="text-orange-500">⏰ Hết hạn: {formatDate(row.expiresAt)}</span>}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{fmt(row.description)}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onPatch(id, { published: !row.published })} className={`grid size-8 place-items-center rounded-lg border text-xs ${row.published ? "border-green-200 text-green-600 hover:bg-green-50" : "border-slate-200 text-slate-400 hover:bg-slate-50"}`}>
                {row.published ? <Check className="size-4" /> : <Globe className="size-4" />}
              </button>
              <button onClick={() => onEdit(row)} className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
                <Edit2 className="size-3.5" />
              </button>
              <button onClick={() => onDelete(id)} className="grid size-8 place-items-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50">
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function JobForm({ lang, initial, onSubmit, onCancel }: { lang: Lang; initial?: Row; onSubmit: (e: FormEvent<HTMLFormElement>) => void; onCancel: () => void }) {
  return (
    <form onSubmit={onSubmit} className="border-b border-slate-200 p-5 bg-slate-50 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-900 text-navy">{initial ? tx(lang, "edit") : tx(lang, "add")} {lang === "vi" ? "Vị trí tuyển dụng" : "Job Opening"}</h3>
        <button type="button" onClick={onCancel}><X className="size-5 text-slate-400" /></button>
      </div>

      {/* Row 1: Basic info */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="grid gap-1 sm:col-span-2">
          <span className="text-xs font-700 text-slate-500">{lang === "vi" ? "Tiêu đề vị trí *" : "Job title *"}</span>
          <input name="title" required defaultValue={initial ? fmt(initial.title) : ""} className={fc()} placeholder="VD: Senior Backend Developer" />
        </label>
        <label className="grid gap-1">
          <span className="text-xs font-700 text-slate-500">{lang === "vi" ? "Phòng ban" : "Department"}</span>
          <input name="department" defaultValue={initial ? fmt(initial.department) : ""} className={fc()} />
        </label>
        <label className="grid gap-1">
          <span className="text-xs font-700 text-slate-500">{lang === "vi" ? "Địa điểm" : "Location"}</span>
          <input name="location" defaultValue={initial ? fmt(initial.location) : "Hà Nội"} className={fc()} />
        </label>
      </div>

      {/* Row 2: Level, Headcount, ExpiresAt */}
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1">
          <span className="text-xs font-700 text-slate-500">{lang === "vi" ? "Số lượng tuyển" : "Headcount"}</span>
          <input name="headcount" type="number" min="1" defaultValue={initial?.headcount ? String(initial.headcount) : "1"} className={fc()} />
        </label>
        <label className="grid gap-1">
          <span className="text-xs font-700 text-slate-500">{lang === "vi" ? "Level / Seniority" : "Level"}</span>
          <select name="level" defaultValue={initial ? fmt(initial.level) : "Mid"} className={fc()}>
            {["Junior","Mid","Mid-Senior","Senior","Lead","Any"].map(l => <option key={l}>{l}</option>)}
          </select>
        </label>
        <label className="grid gap-1">
          <span className="text-xs font-700 text-slate-500">{lang === "vi" ? "Ngày hết hạn" : "Expires at"}</span>
          <input name="expiresAt" type="date" defaultValue={initial?.expiresAt ? fmt(initial.expiresAt).slice(0,10) : ""} className={fc()} />
        </label>
      </div>

      {/* Description, Requirements, Benefits */}
      {([["description", lang === "vi" ? "Mô tả công việc *" : "Job description *", true],
         ["requirements", lang === "vi" ? "Yêu cầu ứng viên" : "Candidate requirements", false],
         ["benefits", lang === "vi" ? "Chế độ đãi ngộ" : "Benefits & perks", false]
        ] as [string, string, boolean][]).map(([name, label, req]) => (
        <label key={name} className="grid gap-1">
          <span className="text-xs font-700 text-slate-500">{label}</span>
          <textarea name={name} rows={4} required={req} defaultValue={initial && initial[name] ? fmt(initial[name]) : ""} className={fc()} placeholder={name === "description" ? "Mô tả công việc chi tiết..." : name === "requirements" ? "VD: 3+ năm kinh nghiệm Node.js, kỹ năng giao tiếp tốt..." : "VD: Lương cạnh tranh, thưởng dự án, 12 ngày phép/năm..."} />
        </label>
      ))}

      <label className="flex items-center gap-2 text-sm font-700 text-slate-600">
        <input name="published" type="checkbox" defaultChecked={initial ? Boolean(initial.published) : true} className="size-4" /> Published
      </label>
      <div className="flex gap-2">
        <button className="rounded-lg bg-navy px-4 py-2 text-sm font-700 text-white">{tx(lang, "save")}</button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-700 text-slate-600">{tx(lang, "cancel")}</button>
      </div>
    </form>
  );
}

// ─── Posts Panel ──────────────────────────────────────────────────
function PostsPanel({ lang, rows, onEdit, onDelete }: { lang: Lang; rows: Row[]; onEdit: (r: Row) => void; onDelete: (slug: string) => void }) {
  if (!rows.length) return <Empty lang={lang} />;
  return (
    <div className="divide-y divide-slate-100">
      {rows.map(row => (
        <div key={String(row.slug)} className="flex items-start gap-3 p-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Badge label={fmt(row.category)} color="bg-violet-100 text-violet-700" />
              <Badge label={row.published ? "Published" : "Draft"} color={row.published ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-500"} />
            </div>
            <h3 className="font-800 text-navy truncate">{lang === "vi" ? fmt(row.titleVi) : fmt(row.titleEn)}</h3>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{lang === "vi" ? fmt(row.excerptVi) : fmt(row.excerptEn)}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">slug: {fmt(row.slug)} · {fmtDate(row.createdAt, true)}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => onEdit(row)} className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"><Edit2 className="size-3.5" /></button>
            <button onClick={() => onDelete(String(row.slug))} className="grid size-8 place-items-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50"><Trash2 className="size-3.5" /></button>
          </div>
        </div>
      ))}
    </div>
  );
}

function PostForm({ lang, initial, onSubmit, onCancel }: { lang: Lang; initial?: Row; onSubmit: (e: FormEvent<HTMLFormElement>) => void; onCancel: () => void }) {
  return (
    <form onSubmit={onSubmit} className="border-b border-slate-200 p-5 bg-slate-50">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-900 text-navy">{initial ? tx(lang, "edit") : tx(lang, "add")} Blog post</h3>
        <button type="button" onClick={onCancel}><X className="size-5 text-slate-400" /></button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {[["slug","Slug","text",true],["category","Category","text",false],["titleVi","Tiêu đề VI","text",true],["titleEn","Title EN","text",true]].map(([n,l,t,req]) => (
          <label key={String(n)} className="grid gap-1">
            <span className="text-xs font-700 text-slate-500">{l as string}</span>
            <input name={String(n)} type={String(t)} required={Boolean(req)} defaultValue={initial ? fmt(initial[n as string]) : ""} className={fc()} />
          </label>
        ))}
        {[["excerptVi","Excerpt VI",2],["excerptEn","Excerpt EN",2],["contentVi","Nội dung VI",5],["contentEn","Content EN",5]].map(([n,l,r]) => (
          <label key={String(n)} className="grid gap-1 sm:col-span-2">
            <span className="text-xs font-700 text-slate-500">{l as string}</span>
            <textarea name={String(n)} rows={Number(r)} defaultValue={initial ? fmt(initial[n as string]) : ""} className={fc()} />
          </label>
        ))}
        <label className="flex items-center gap-2 text-sm font-700 text-slate-600">
          <input name="published" type="checkbox" defaultChecked={initial ? Boolean(initial.published) : true} className="size-4" /> Published
        </label>
      </div>
      <div className="mt-3 flex gap-2">
        <button className="rounded-lg bg-navy px-4 py-2 text-sm font-700 text-white">{tx(lang, "save")}</button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-700 text-slate-600">{tx(lang, "cancel")}</button>
      </div>
    </form>
  );
}

// ─── Content CMS Panel ────────────────────────────────────────────
function ContentPanel({ lang, rows, onEdit, onDelete }: { lang: Lang; rows: Row[]; onEdit: (r: Row) => void; onDelete: (id: number) => void }) {
  if (!rows.length) return <Empty lang={lang} />;
  return (
    <div className="divide-y divide-slate-100">
      {rows.map(row => (
        <div key={Number(row.id)} className="flex items-start gap-3 p-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Badge label={fmt(row.page)} color="bg-cyan-100 text-cyan-700" />
              <Badge label={fmt(row.section)} color="bg-slate-100 text-slate-600" />
              <Badge label={row.published ? "Live" : "Hidden"} color={row.published ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-500"} />
            </div>
            <h3 className="font-800 text-navy truncate">{lang === "vi" ? (fmt(row.titleVi) || fmt(row.titleEn)) : (fmt(row.titleEn) || fmt(row.titleVi))}</h3>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{lang === "vi" ? fmt(row.bodyVi) : fmt(row.bodyEn)}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => onEdit(row)} className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"><Edit2 className="size-3.5" /></button>
            <button onClick={() => onDelete(Number(row.id))} className="grid size-8 place-items-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50"><Trash2 className="size-3.5" /></button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ContentForm({ lang, initial, onSubmit, onCancel }: { lang: Lang; initial?: Row; onSubmit: (e: FormEvent<HTMLFormElement>) => void; onCancel: () => void }) {
  return (
    <form onSubmit={onSubmit} className="border-b border-slate-200 p-5 bg-cyan-50/40">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-900 text-navy">{initial ? tx(lang, "edit") : tx(lang, "add")} Content Block</h3>
        <button type="button" onClick={onCancel}><X className="size-5 text-slate-400" /></button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {[["page","Page (about/home/staffing…)","text",true],["section","Section key","text",true],["order","Order","number",false],["titleVi","Tiêu đề VI","text",false],["titleEn","Title EN","text",false]].map(([n,l,t,req]) => (
          <label key={String(n)} className="grid gap-1">
            <span className="text-xs font-700 text-slate-500">{l as string}</span>
            <input name={String(n)} type={String(t)} required={Boolean(req)} defaultValue={initial ? fmt(initial[n as string]) : ""} className={fc()} />
          </label>
        ))}
        {[["bodyVi","Nội dung VI",4],["bodyEn","Content EN",4],["meta","Meta JSON (optional)",2]].map(([n,l,r]) => (
          <label key={String(n)} className="grid gap-1 sm:col-span-2">
            <span className="text-xs font-700 text-slate-500">{l as string}</span>
            <textarea name={String(n)} rows={Number(r)} defaultValue={initial ? fmt(initial[n as string]) : ""} className={fc()} />
          </label>
        ))}
        <label className="flex items-center gap-2 text-sm font-700 text-slate-600">
          <input name="published" type="checkbox" defaultChecked={initial ? Boolean(initial.published) : true} className="size-4" /> Published
        </label>
      </div>
      <div className="mt-3 flex gap-2">
        <button className="rounded-lg bg-navy px-4 py-2 text-sm font-700 text-white">{tx(lang, "save")}</button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-700 text-slate-600">{tx(lang, "cancel")}</button>
      </div>
    </form>
  );
}

// ─── Generic table ────────────────────────────────────────────────
function GenericPanel({ rows, cols }: { rows: Row[]; cols: string[] }) {
  if (!rows.length) return <div className="p-10 text-center text-sm text-slate-400">No data</div>;
  const keys = cols.filter(k => rows[0] && k in rows[0]);
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] text-sm">
        <thead><tr className="border-b border-slate-200 bg-slate-50">
          {keys.map(k => <th key={k} className="px-3 py-2.5 text-left text-xs font-700 uppercase text-slate-400">{k}</th>)}
        </tr></thead>
        <tbody>{rows.map((row, i) => (
          <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
            {keys.map(k => <td key={k} className="max-w-[180px] truncate px-3 py-2.5 text-slate-700">{fmt(row[k])}</td>)}
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

// ─── Dashboard Panel ──────────────────────────────────────────────
function DashboardPanel({ lang, rows }: { lang: Lang; rows: Row[] }) {
  const available = rows.filter(r => fmt(r.status) === "Available");
  const stats = TALENT_STATUSES.map(s => ({ label: s, count: rows.filter(r => fmt(r.status) === s).length }));
  const [seedState, setSeedState] = useState<"idle"|"loading"|"done"|"error">("idle");
  const [seedMsg, setSeedMsg] = useState("");

  async function runSeedDemo() {
    setSeedState("loading");
    try {
      const res = await fetch("/api/admin/seed-demo", { method: "POST" });
      const data = await res.json();
      if (res.ok) { setSeedMsg(data.message ?? "Done"); setSeedState("done"); }
      else { setSeedMsg(data.error ?? "Error"); setSeedState("error"); }
    } catch { setSeedMsg("Network error"); setSeedState("error"); }
  }

  return (
    <div className="p-4 space-y-6">
      {/* Quick Setup */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-800 text-blue-900">{lang === "vi" ? "⚙️ Cài đặt nhanh dữ liệu mẫu" : "⚙️ Quick Demo Data Setup"}</p>
            <p className="text-xs text-blue-600 mt-0.5">{lang === "vi" ? "Tạo dữ liệu mẫu cho Tỏ việc, Nội dung CMS và Inquiries sản phẩm" : "Seed demo data for Jobs, CMS Content and Product Inquiries"}</p>
          </div>
          <button
            onClick={runSeedDemo}
            disabled={seedState === "loading" || seedState === "done"}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-700 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {seedState === "loading" ? "⏳ Đang seed..." : seedState === "done" ? "✅ Done" : lang === "vi" ? "Seed dữ liệu mẫu" : "Seed Demo Data"}
          </button>
        </div>
        {seedMsg && <p className={`mt-2 text-xs font-600 ${seedState === "done" ? "text-green-700" : "text-red-600"}`}>{seedMsg}</p>}
      </div>
      {/* Section B - Stats */}
      <div>
        <h3 className="mb-3 text-sm font-900 text-navy">{lang === "vi" ? "Thống kê nhanh" : "Quick Stats"}</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-900 text-navy">{rows.length}</p>
            <p className="text-xs text-slate-400 mt-1">{lang === "vi" ? "Tổng" : "Total"}</p>
          </div>
          {stats.map(({ label, count }) => (
            <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 text-center">
              <p className={`text-2xl font-900 ${label === "Available" ? "text-green-600" : label === "Interviewing" ? "text-yellow-600" : label === "Assigned" ? "text-blue-600" : "text-slate-500"}`}>{count}</p>
              <p className="text-xs text-slate-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section A - Available Talents */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-900 text-navy">{lang === "vi" ? "Nhân sự nhàn rỗi" : "Available Talents"}</h3>
          <span className="text-xs text-slate-400">{lang === "vi" ? "Dữ liệu chốt cuối tháng để báo cáo BOD" : "Data locked end-of-month for BOD report"}</span>
        </div>
        {!available.length ? (
          <div className="rounded-xl border border-slate-100 bg-white py-10 text-center text-sm text-slate-400">
            {lang === "vi" ? "Không có nhân sự rảnh" : "No available talents"}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[640px] text-sm">
              <thead><tr className="border-b border-slate-200 bg-slate-50">
                {["Code","Role","Seniority","Skills","Exp","Location","English"].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-700 uppercase text-slate-400">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {available.map(row => (
                  <tr key={String(row.id)} className="border-b border-slate-100 hover:bg-green-50/30">
                    <td className="px-3 py-2.5 text-[10px] font-700 text-slate-400">{fmt(row.code)}</td>
                    <td className="px-3 py-2.5 font-700 text-navy">{fmt(row.role)}</td>
                    <td className="px-3 py-2.5 text-slate-600">{fmt(row.seniority)}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {fmt(row.skills).split(",").slice(0, 3).map(s => (
                          <span key={s} className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-600 text-green-700">{s.trim()}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center text-slate-600">{fmt(row.yearsExperience)}yr</td>
                    <td className="px-3 py-2.5 text-slate-600">{fmt(row.location)}</td>
                    <td className="px-3 py-2.5 text-slate-600">{fmt(row.englishLevel)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Users Panel ──────────────────────────────────────────────────
function UsersPanel({ lang, rows, onEdit, onDelete, onPatch }: {
  lang: Lang; rows: Row[];
  onEdit: (r: Row) => void;
  onDelete: (id: number) => void;
  onPatch: (id: number, d: Row) => void;
}) {
  if (!rows.length) return <Empty lang={lang} />;
  void onPatch;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-sm">
        <thead><tr className="border-b border-slate-200 bg-slate-50">
          {["ID","Name","Email","Role","Created",""].map(h => (
            <th key={h} className="px-3 py-2.5 text-left text-xs font-700 uppercase text-slate-400">{h}</th>
          ))}
        </tr></thead>
        <tbody>
          {rows.map(row => {
            const id = Number(row.id);
            return (
              <tr key={id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-3 py-2.5 text-slate-400 text-xs">{id}</td>
                <td className="px-3 py-2.5 font-700 text-navy">{fmt(row.name)}</td>
                <td className="px-3 py-2.5 text-slate-600">{fmt(row.email)}</td>
                <td className="px-3 py-2.5">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-700 ${
                    fmt(row.role) === "admin" ? "bg-violet-100 text-violet-700" :
                    fmt(row.role) === "hr" ? "bg-blue-100 text-blue-700" :
                    "bg-orange-100 text-orange-700"
                  }`}>{fmt(row.role)}</span>
                </td>
                <td className="px-3 py-2.5 text-xs text-slate-400">{fmtDate(row.createdAt, true)}</td>
                <td className="px-3 py-2.5">
                  <div className="flex gap-2">
                    <button onClick={() => onEdit(row)} className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
                      <Edit2 className="size-3.5" />
                    </button>
                    <button onClick={() => onDelete(id)} className="grid size-8 place-items-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function UserForm({ lang, initial, onSubmit, onCancel }: {
  lang: Lang; initial?: Row;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="border-b border-slate-200 p-5 bg-slate-50">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-900 text-navy">{initial ? tx(lang, "edit") : tx(lang, "add")} {lang === "vi" ? "người dùng" : "user"}</h3>
        <button type="button" onClick={onCancel}><X className="size-5 text-slate-400" /></button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-xs font-700 text-slate-500">Name *</span>
          <input name="name" required defaultValue={initial ? fmt(initial.name) : ""} className={fc()} />
        </label>
        <label className="grid gap-1">
          <span className="text-xs font-700 text-slate-500">Email *</span>
          <input name="email" type="email" required defaultValue={initial ? fmt(initial.email) : ""} className={fc()} />
        </label>
        {!initial && (
          <label className="grid gap-1">
            <span className="text-xs font-700 text-slate-500">Password *</span>
            <input name="password" type="password" required className={fc()} />
          </label>
        )}
        <label className="grid gap-1">
          <span className="text-xs font-700 text-slate-500">Role *</span>
          <select name="role" defaultValue={initial ? fmt(initial.role) : "admin"} className={fc()}>
            <option value="admin">Admin</option>
            <option value="hr">HR</option>
            <option value="sales">Sales</option>
          </select>
        </label>
      </div>
      <div className="mt-3 flex gap-2">
        <button className="rounded-lg bg-navy px-4 py-2 text-sm font-700 text-white">{tx(lang, "save")}</button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-700 text-slate-600">{tx(lang, "cancel")}</button>
      </div>
    </form>
  );
}

// ─── Product Inquiries Panel ──────────────────────────────────────
function ProductInquiriesPanel({ lang, rows, onPatch, onDelete }: {
  lang: Lang; rows: Row[];
  onPatch: (id: number, d: Row) => void;
  onDelete: (id: number) => void;
}) {
  if (!rows.length) return <Empty lang={lang} />;
  const STATUS_COLOR: Record<string, string> = { new: "bg-orange-100 text-orange-700", contacted: "bg-blue-100 text-blue-700", qualified: "bg-green-100 text-green-700", closed: "bg-slate-200 text-slate-500" };
  return (
    <div className="divide-y divide-slate-100">
      {rows.map(row => {
        const id = Number(row.id);
        const status = fmt(row.status) || "new";
        return (
          <div key={id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-900 text-navy">{fmt(row.name)}</h3>
                  {row.company ? <span className="text-sm text-slate-500">· {fmt(row.company)}</span> : null}
                  <Badge label={status} color={STATUS_COLOR[status]} />
                </div>
                <p className="mt-0.5 text-xs font-700 text-brand-blue">{fmt(row.product)}</p>
                <p className="text-sm text-slate-600 mt-0.5">
                  <a href={`mailto:${fmt(row.email)}`} className="text-brand-blue hover:underline">{fmt(row.email)}</a>
                  {row.phone ? ` · ${fmt(row.phone)}` : ""}
                </p>
                {row.message ? <p className="mt-1.5 text-sm text-slate-700">{fmt(row.message)}</p> : null}
                <p className="mt-1 text-xs text-slate-400">{fmtDate(row.createdAt)}</p>
              </div>
              <div className="flex gap-2">
                <select value={status} onChange={e => onPatch(id, { status: e.target.value })}
                  className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-700 text-slate-700 outline-none focus:border-cyan-500">
                  {CONTACT_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
                <button onClick={() => onDelete(id)} className="grid size-8 place-items-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Empty({ lang }: { lang: Lang }) {
  return <div className="p-12 text-center text-sm font-600 text-slate-400">{tx(lang, "noData")}</div>;
}
