"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, CheckCircle2, ChevronDown, Clock, FileText,
  Plus, Send, User, X
} from "lucide-react";
import type { Locale } from "@/lib/i18n";

// ─── i18n helper ─────────────────────────────────────────────────
function t(locale: Locale, vi: string, en: string) {
  return locale === "vi" ? vi : en;
}

// ─── Types ───────────────────────────────────────────────────────
type TimesheetStatus = "Draft" | "Submitted" | "Approved" | "Disputed" | "Billed";

type Timesheet = {
  id: number;
  clientName: string;
  month: string;
  workingDays: number;
  approvedDays: number;
  overtimeHours: number;
  status: TimesheetStatus;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

type TalentInfo = {
  id: number;
  code: string;
  role: string;
  seniority: string;
};

// ─── Status Badge ─────────────────────────────────────────────────
const STATUS_COLORS: Record<TimesheetStatus, string> = {
  Draft: "bg-slate-100 text-slate-600",
  Submitted: "bg-blue-100 text-blue-700",
  Approved: "bg-emerald-100 text-emerald-700",
  Disputed: "bg-red-100 text-red-700",
  Billed: "bg-purple-100 text-purple-700",
};

const STATUS_LABELS: Record<TimesheetStatus, { vi: string; en: string }> = {
  Draft: { vi: "Nháp", en: "Draft" },
  Submitted: { vi: "Đã gửi", en: "Submitted" },
  Approved: { vi: "Đã duyệt", en: "Approved" },
  Disputed: { vi: "Tranh chấp", en: "Disputed" },
  Billed: { vi: "Đã thanh toán", en: "Billed" },
};

function StatusBadge({ status, locale }: { status: TimesheetStatus; locale: Locale }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-700 ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status][locale]}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────
export default function TimesheetsPortal({ initialLocale }: { initialLocale: Locale }) {
  const [locale, setLocale] = useState<Locale>(initialLocale);

  // Step 1: Enter code
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);

  // Step 2: View timesheets
  const [talent, setTalent] = useState<TalentInfo | null>(null);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [createState, setCreateState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [createError, setCreateError] = useState("");

  // Submit state per timesheet
  const [submitting, setSubmitting] = useState<Record<number, boolean>>({});

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setCodeError(t(locale, "Vui lòng nhập mã talent.", "Please enter your talent code."));
      return;
    }
    setCodeError("");
    setLookupLoading(true);
    try {
      const res = await fetch(`/api/timesheets?code=${encodeURIComponent(trimmed)}`);
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setCodeError(d.error ?? t(locale, "Không tìm thấy talent.", "Talent not found."));
        return;
      }
      const data = await res.json();
      setTalent(data.talent);
      setTimesheets(data.timesheets ?? []);
    } catch {
      setCodeError(t(locale, "Lỗi kết nối. Vui lòng thử lại.", "Connection error. Please try again."));
    } finally {
      setLookupLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!talent) return;
    setCreateState("sending");
    setCreateError("");
    const fd = new FormData(e.currentTarget);
    const body = {
      talentCode: talent.code,
      clientName: fd.get("clientName"),
      month: fd.get("month"),
      workingDays: fd.get("workingDays"),
      overtimeHours: fd.get("overtimeHours") || 0,
      note: fd.get("note") || undefined,
    };
    try {
      const res = await fetch("/api/timesheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setCreateError(d.error ?? t(locale, "Có lỗi xảy ra.", "Something went wrong."));
        setCreateState("error");
        return;
      }
      const created = await res.json();
      setTimesheets(prev => [created, ...prev]);
      setCreateState("success");
      (e.target as HTMLFormElement).reset();
      setTimeout(() => {
        setShowCreate(false);
        setCreateState("idle");
      }, 1500);
    } catch {
      setCreateError(t(locale, "Lỗi kết nối.", "Connection error."));
      setCreateState("error");
    }
  }

  async function handleSubmitTimesheet(id: number) {
    setSubmitting(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/timesheets/${id}`, { method: "PATCH" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert(d.error ?? "Error");
        return;
      }
      const updated = await res.json();
      setTimesheets(prev => prev.map(ts => ts.id === id ? { ...ts, status: updated.status } : ts));
    } catch {
      alert(t(locale, "Lỗi kết nối.", "Connection error."));
    } finally {
      setSubmitting(prev => ({ ...prev, [id]: false }));
    }
  }

  function resetLookup() {
    setTalent(null);
    setTimesheets([]);
    setCode("");
    setCodeError("");
  }

  // Get current month default for form
  const currentMonth = new Date().toISOString().slice(0, 7);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow">
              <FileText className="size-5" />
            </div>
            <div>
              <p className="text-xs font-700 uppercase tracking-wider text-slate-500">ITSOL</p>
              <h1 className="text-base font-900 leading-tight text-navy">
                {t(locale, "Cổng nộp Timesheet", "Timesheet Portal")}
              </h1>
            </div>
          </div>
          <button
            onClick={() => setLocale(l => l === "vi" ? "en" : "vi")}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-700 text-slate-600 transition-colors hover:border-blue-400 hover:text-blue-600"
          >
            {locale === "vi" ? "🇬🇧 EN" : "🇻🇳 VI"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">

        {/* ── Step 1: Enter Code ── */}
        {!talent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-md"
          >
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                  <User className="size-8" />
                </div>
                <h2 className="text-xl font-900 text-navy">
                  {t(locale, "Xác nhận danh tính", "Identify Yourself")}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {t(
                    locale,
                    "Nhập mã talent của bạn (ví dụ: DEV001) để xem và nộp timesheet.",
                    "Enter your talent code (e.g. DEV001) to view and submit timesheets."
                  )}
                </p>
              </div>

              <form onSubmit={handleLookup} className="flex flex-col gap-4">
                <div className="grid gap-1.5">
                  <label className="text-sm font-700 text-slate-700">
                    {t(locale, "Mã Talent", "Talent Code")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    placeholder="DEV001"
                    className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-center text-base font-800 tracking-widest text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    autoFocus
                  />
                  {codeError && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-600 text-red-600">{codeError}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={lookupLoading}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 font-700 text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                >
                  {lookupLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      {t(locale, "Tra cứu", "Look up")}
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* ── Step 2: Timesheet List ── */}
        {talent && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Talent info */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <User className="size-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{t(locale, "Đã xác nhận", "Verified")}</p>
                  <p className="font-900 text-navy">{talent.code} — {talent.role}</p>
                  <p className="text-xs text-slate-500">{talent.seniority}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreate(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-700 text-white transition-colors hover:bg-blue-700"
                >
                  <Plus className="size-4" />
                  {t(locale, "Tạo Timesheet", "New Timesheet")}
                </button>
                <button
                  onClick={resetLookup}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-700 text-slate-600 transition-colors hover:bg-slate-50"
                >
                  {t(locale, "Đổi mã", "Change code")}
                </button>
              </div>
            </div>

            {/* Timesheets list */}
            {timesheets.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <div className="text-4xl">📋</div>
                <p className="mt-4 font-700 text-navy">{t(locale, "Chưa có timesheet nào", "No timesheets yet")}</p>
                <p className="mt-2 text-sm text-slate-500">
                  {t(locale, "Nhấn \"Tạo Timesheet\" để bắt đầu.", "Click \"New Timesheet\" to get started.")}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {timesheets.map((ts, i) => (
                  <motion.div
                    key={ts.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 p-5">
                      <div className="flex items-start gap-4">
                        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-100">
                          <Clock className="size-5 text-slate-500" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-800 text-navy">{ts.month}</p>
                            <StatusBadge status={ts.status} locale={locale} />
                          </div>
                          <p className="mt-1 text-sm text-slate-600">
                            {t(locale, "Khách hàng", "Client")}: <strong>{ts.clientName}</strong>
                          </p>
                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                            <span>
                              {t(locale, "Ngày làm việc", "Working days")}: <strong className="text-slate-700">{ts.workingDays}</strong>
                            </span>
                            {ts.overtimeHours > 0 && (
                              <span>
                                {t(locale, "Overtime", "Overtime")}: <strong className="text-slate-700">{ts.overtimeHours}h</strong>
                              </span>
                            )}
                            {ts.approvedDays > 0 && (
                              <span>
                                {t(locale, "Ngày đã duyệt", "Approved days")}: <strong className="text-emerald-700">{ts.approvedDays}</strong>
                              </span>
                            )}
                          </div>
                          {ts.note && (
                            <p className="mt-2 text-xs text-slate-400 italic">{ts.note}</p>
                          )}
                        </div>
                      </div>

                      {ts.status === "Draft" && (
                        <button
                          onClick={() => handleSubmitTimesheet(ts.id)}
                          disabled={!!submitting[ts.id]}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-700 text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
                        >
                          {submitting[ts.id] ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : (
                            <>
                              <Send className="size-3.5" />
                              {t(locale, "Nộp", "Submit")}
                            </>
                          )}
                        </button>
                      )}
                      {ts.status === "Submitted" && (
                        <div className="flex items-center gap-1.5 text-sm font-700 text-blue-600">
                          <CheckCircle2 className="size-4" />
                          {t(locale, "Đã nộp", "Submitted")}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── Create Timesheet Modal ── */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
              onClick={e => { if (e.target === e.currentTarget) { setShowCreate(false); setCreateState("idle"); } }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
              >
                {/* Header */}
                <div className="flex items-center justify-between bg-gradient-to-r from-blue-700 to-cyan-600 p-6 text-white">
                  <div>
                    <p className="text-xs font-800 uppercase tracking-wider text-cyan-200">
                      {talent?.code} — {talent?.role}
                    </p>
                    <h3 className="mt-1 text-lg font-900">
                      {t(locale, "Tạo Timesheet Mới", "Create New Timesheet")}
                    </h3>
                  </div>
                  <button
                    onClick={() => { setShowCreate(false); setCreateState("idle"); }}
                    className="rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="max-h-[75vh] overflow-y-auto p-6">
                  {createState === "success" ? (
                    <div className="py-8 text-center">
                      <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                        <CheckCircle2 className="size-8" />
                      </div>
                      <h3 className="text-xl font-800 text-navy">
                        {t(locale, "Tạo timesheet thành công!", "Timesheet created!")}
                      </h3>
                      <p className="mt-2 text-sm text-slate-500">
                        {t(locale, "Trạng thái: Nháp. Nhấn \"Nộp\" để gửi cho ITSOL xét duyệt.", "Status: Draft. Click \"Submit\" to send for approval.")}
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleCreate} className="grid gap-4">
                      <div className="grid gap-1.5">
                        <label className="text-sm font-700 text-slate-700">
                          {t(locale, "Tháng (YYYY-MM)", "Month (YYYY-MM)")} <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="month"
                          type="month"
                          defaultValue={currentMonth}
                          required
                          className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />
                      </div>

                      <div className="grid gap-1.5">
                        <label className="text-sm font-700 text-slate-700">
                          {t(locale, "Tên khách hàng / Dự án", "Client Name / Project")} <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="clientName"
                          required
                          placeholder={t(locale, "Ví dụ: ABC Bank", "e.g. ABC Bank")}
                          className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-1.5">
                          <label className="text-sm font-700 text-slate-700">
                            {t(locale, "Số ngày làm việc", "Working Days")} <span className="text-red-500">*</span>
                          </label>
                          <input
                            name="workingDays"
                            type="number"
                            min={0}
                            max={31}
                            required
                            placeholder="22"
                            className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          />
                        </div>
                        <div className="grid gap-1.5">
                          <label className="text-sm font-700 text-slate-700">
                            {t(locale, "Giờ Overtime", "Overtime Hours")}
                          </label>
                          <input
                            name="overtimeHours"
                            type="number"
                            min={0}
                            max={240}
                            defaultValue={0}
                            className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          />
                        </div>
                      </div>

                      <div className="grid gap-1.5">
                        <label className="text-sm font-700 text-slate-700">
                          {t(locale, "Ghi chú", "Note")}
                        </label>
                        <textarea
                          name="note"
                          rows={3}
                          placeholder={t(locale, "Thông tin bổ sung...", "Additional notes...")}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />
                      </div>

                      {createState === "error" && (
                        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-600 text-red-600">{createError}</p>
                      )}

                      <div className="flex gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => { setShowCreate(false); setCreateState("idle"); }}
                          className="flex flex-1 min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-700 text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          {t(locale, "Hủy", "Cancel")}
                        </button>
                        <button
                          type="submit"
                          disabled={createState === "sending"}
                          className="flex flex-1 min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-700 text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                        >
                          {createState === "sending" ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : (
                            <>
                              <Plus className="size-4" />
                              {t(locale, "Tạo Timesheet", "Create Timesheet")}
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} ITSOL JSC — {t(locale, "Cổng dành riêng cho Talent", "Talent Self-Service Portal")}
      </footer>
    </div>
  );
}
