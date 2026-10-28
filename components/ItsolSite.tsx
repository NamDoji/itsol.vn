"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Award, BarChart3, Bot, BrainCircuit, BriefcaseBusiness, Building2,
  CheckCircle2, ChevronDown, ChevronRight, Code2, Database, FileText,
  Globe2, Layers3, Mail, MapPin, Menu, Moon, Phone, Rocket,
  Search, Send, ShieldCheck, Sparkles, Sun, Users, X, Zap,
  Clock, Star, TrendingUp, Cpu, Network, Shield
} from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import {
  awards, caseStudies, companyInfo, contactInfo, industries, products,
  services, staffingProcess, staffingRoles, technologies,
  t, type Locale
} from "@/data/site";
import type { Talent } from "@prisma/client";

// ─── Types ─────────────────────────────────────────────────────
export type PageKey =
  | "home" | "about" | "services" | "staffing" | "odc"
  | "software-outsourcing" | "product-development" | "products"
  | "product-detail" | "industries" | "case-studies" | "awards"
  | "careers" | "insights" | "contact" | "policy";

type SubmitState = "idle" | "sending" | "success" | "error";

// ─── Navigation ─────────────────────────────────────────────────
const navItems = [
  { en: "Home",       vi: "Trang chủ",  href: "/" },
  { en: "About",      vi: "Giới thiệu", href: "/about" },
  {
    en: "Services", vi: "Dịch vụ", href: "/services",
    children: [
      { en: "IT Staffing",          vi: "IT Staffing",        href: "/services/staffing" },
      { en: "Software Outsourcing", vi: "Phần mềm",          href: "/services/software-outsourcing" },
      { en: "ODC",                  vi: "ODC",                href: "/services/odc" },
      { en: "Product Development",  vi: "Phát triển SP",     href: "/services/product-development" },
    ]
  },
  {
    en: "Products", vi: "Sản phẩm", href: "/products",
    children: [
      { en: "Master eKYC",      vi: "Master eKYC",   href: "/products/master-ekyc" },
      { en: "DocChain KSS",     vi: "DocChain KSS",  href: "/products/docchain-kss" },
      { en: "Horus Camera AI",  vi: "Horus Camera",  href: "/products/horus-camera-ai" },
      { en: "Ông Bụt AI",       vi: "Ông Bụt AI",    href: "/products/ong-but-ai" },
    ]
  },

  { en: "Insights",   vi: "Blog",        href: "/insights" },
  { en: "Careers",    vi: "Tuyển dụng", href: "/careers" },
];

function lp(path: string, locale: Locale) {
  return `${path}?lang=${locale}`;
}

function skillList(value?: string | null) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {
    // Seed data stores skills as comma-separated text.
  }
  return value.split(/[;,]/).map(s => s.trim()).filter(Boolean);
}

// ─── Helpers ─────────────────────────────────────────────────────
function useCounter(target: number, duration = 1600) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = target / (duration / 16);
        const id = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(id); }
          else setCount(Math.floor(start));
        }, 16);
        obs.disconnect();
      }
    }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return { count, ref };
}

// ─── Form helpers ─────────────────────────────────────────────────
function Field({ name, label, type = "text", required = false, textarea = false, options, className = "" }: {
  name: string; label: string; type?: string; required?: boolean;
  textarea?: boolean; options?: string[]; className?: string;
}) {
  return (
    <div className={`form-field ${className}`}>
      <label htmlFor={name}>{label}{required && <span className="ml-1 text-coral">*</span>}</label>
      {textarea ? (
        <textarea id={name} name={name} required={required} rows={4} className="form-input" />
      ) : options ? (
        <select id={name} name={name} required={required} className="form-input">
          <option value="">- {label} -</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input id={name} name={name} type={type} required={required} className="form-input" />
      )}
    </div>
  );
}

function FormStatus({ state, locale }: { state: SubmitState; locale: Locale }) {
  if (state === "idle") return null;
  if (state === "sending") return <p className="text-sm font-semibold text-cyan-700">{t(locale, "Đang gửi...", "Sending...")}</p>;
  if (state === "success") return (
    <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700">
      <CheckCircle2 className="size-5 shrink-0" />
      <p className="text-sm font-semibold">{t(locale, "Đã gửi thành công! ITSOL sẽ liên hệ lại sớm nhất.", "Sent successfully! ITSOL will follow up soon.")}</p>
    </div>
  );
  return <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{t(locale, "Có lỗi xảy ra. Vui lòng thử lại.", "Something went wrong. Please try again.")}</p>;
}

async function submitForm(e: React.FormEvent<HTMLFormElement>, endpoint: string, setState: (s: SubmitState) => void) {
  e.preventDefault();
  setState("sending");
  const form = e.currentTarget;
  const payload = Object.fromEntries(new FormData(form).entries());
  const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  setState(res.ok ? "success" : "error");
  if (res.ok) form.reset();
}

// ─── Header ──────────────────────────────────────────────────────
function Header({ locale, onLocaleChange, techMode, onTechMode }: {
  locale: Locale; onLocaleChange: (l: Locale) => void;
  techMode: boolean; onTechMode: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const headerBg = scrolled
    ? (techMode ? "bg-[#040e1e]/95 border-b border-white/10" : "bg-white/96 border-b border-slate-100")
    : "bg-transparent";
  const onDarkHeader = techMode || !scrolled;

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${headerBg} backdrop-blur-md`}>
      {/* Brand 3-color accent bar at very top */}
      <div className="absolute inset-x-0 top-0 h-[3px] brand-bar" />
      <div className="container-page flex h-[68px] items-center gap-4 pt-[2px]">
        {/* Logo */}
        <Link href={lp("/", locale)} className="mr-4 shrink-0">
          <BrandLogo compactOnMobile />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {navItems.map(item => (
            <div key={item.href} className="relative" onMouseEnter={() => setDropdown(item.href)} onMouseLeave={() => setDropdown(null)}>
              <Link
                href={lp(item.href, locale)}
                className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-600 transition-colors ${
                  onDarkHeader ? "text-white/90 hover:text-white hover:bg-white/10" : "text-slate-700 hover:text-navy hover:bg-slate-50"
                }`}
              >
                {locale === "vi" ? item.vi : item.en}
                {item.children && <ChevronDown className="size-3.5 opacity-60" />}
              </Link>
              {item.children && dropdown === item.href && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`absolute left-0 top-full mt-1 min-w-48 rounded-xl border p-2 shadow-2xl ${
                    techMode ? "bg-[#0d1b2e] border-white/10" : "bg-white border-slate-100"
                  }`}
                >
                  {item.children.map(c => (
                    <Link key={c.href} href={lp(c.href, locale)}
                      className={`block rounded-lg px-3 py-2 text-sm font-600 transition-colors ${
                        techMode ? "text-slate-300 hover:text-white hover:bg-white/10" : "text-slate-700 hover:text-navy hover:bg-slate-50"
                      }`}
                    >
                      {locale === "vi" ? c.vi : c.en}
                    </Link>
                  ))}
                </motion.div>
              )}
            </div>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Lang toggle */}
          <button
            onClick={() => onLocaleChange(locale === "vi" ? "en" : "vi")}
            className={`whitespace-nowrap h-9 rounded-lg px-3 text-sm font-700 transition-all ${
              onDarkHeader ? "border border-white/25 text-white hover:bg-white/10" : "border border-slate-200 text-slate-700 hover:border-brand-blue hover:text-brand-blue"
            }`}
          >
            {locale === "vi" ? "🇬🇧 EN" : "🇻🇳 VI"}
          </button>

          {/* Theme toggle */}
          <button
            onClick={onTechMode}
            aria-label="Toggle Tech Mode"
            className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all ${
              onDarkHeader ? "border border-white/25 text-white hover:bg-white/10" : "border border-slate-200 text-slate-600 hover:border-brand-blue"
            }`}
          >
            {techMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          {/* CTA */}
          <Link href={lp("/services/staffing", locale)} className="btn btn-primary hidden text-sm md:inline-flex">
            {t(locale, "Thuê IT Talent", "Request Talents")}
          </Link>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="flex h-9 w-9 items-center justify-center lg:hidden" aria-label="Menu">
            {menuOpen ? <X className={`size-5 ${onDarkHeader ? "text-white" : "text-navy"}`} /> : <Menu className={`size-5 ${onDarkHeader ? "text-white" : "text-navy"}`} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className={`border-t lg:hidden ${techMode ? "bg-[#040e1e] border-white/10" : "bg-white border-slate-100"}`}
          >
            <div className="container-page flex flex-col gap-1 pb-5 pt-3">
              {navItems.map(item => (
                <div key={item.href}>
                  <Link href={lp(item.href, locale)} onClick={() => setMenuOpen(false)}
                    className={`block rounded-lg px-3 py-2.5 text-sm font-700 ${
                      techMode ? "text-slate-200 hover:bg-white/10" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {locale === "vi" ? item.vi : item.en}
                  </Link>
                  {item.children?.map(c => (
                    <Link key={c.href} href={lp(c.href, locale)} onClick={() => setMenuOpen(false)}
                      className={`block rounded-lg pl-7 pr-3 py-2 text-sm font-600 ${
                        techMode ? "text-slate-400 hover:bg-white/10 hover:text-white" : "text-slate-500 hover:bg-slate-50 hover:text-navy"
                      }`}
                    >
                      → {locale === "vi" ? c.vi : c.en}
                    </Link>
                  ))}
                </div>
              ))}
              <Link href={lp("/services/staffing", locale)} onClick={() => setMenuOpen(false)} className="btn btn-primary mt-3 w-full justify-center">
                {t(locale, "Thuê IT Talent", "Request Talents")}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ─── Footer ───────────────────────────────────────────────────────
function Footer({ locale, techMode }: { locale: Locale; techMode: boolean }) {
  const [email, setEmail] = useState("");
  const [nlState, setNlState] = useState<SubmitState>("idle");

  async function subscribeNewsletter(e: React.FormEvent) {
    e.preventDefault();
    setNlState("sending");
    const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, locale }) });
    setNlState(res.ok ? "success" : "error");
    if (res.ok) setEmail("");
  }

  const base = techMode ? "bg-[#030b18] text-slate-400 border-white/8" : "bg-navy text-slate-400 border-white/10";

  return (
    <footer className={`${base} border-t`}>
      <div className="container-page py-16">
        <div className="grid gap-12 lg:grid-cols-[1.8fr_1fr_1fr_1.3fr]">
          {/* Company legal info */}
          <div>
            <h4 className="mb-4 text-sm font-800 uppercase tracking-wider text-white">{t(locale, "Giới thiệu ITSOL", "About ITSOL")}</h4>
            <ul className="flex flex-col gap-2.5 text-sm leading-6">
              <li className="font-700 text-white">{t(locale, companyInfo.nameVi, companyInfo.nameEn)}</li>
              <li>{t(locale, "Mã số doanh nghiệp/MST", "Business/Tax code")}: {companyInfo.taxCode}</li>
              <li>{t(locale, "Ngày cấp", "Issued on")}: {companyInfo.issuedDate}</li>
              <li>{t(locale, "Nơi cấp", "Issued by")}: {t(locale, companyInfo.issuedByVi, companyInfo.issuedByEn)}</li>
              <li className="flex items-start gap-2">
                <MapPin className="size-4 mt-1 shrink-0" />{t(locale, companyInfo.addressVi, companyInfo.addressEn)}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 shrink-0" />{t(locale, "Tổng đài CSKH", "Hotline")}:
                <a href={`tel:${companyInfo.hotline.replace(/\s/g, "")}`} className="font-800 text-white hover:text-brand-blue transition-colors">{companyInfo.hotline}</a>
              </li>
              <li>
                <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-2 hover:text-brand-blue transition-colors">
                  <Mail className="size-4 shrink-0" />{contactInfo.email}
                </a>
              </li>
            </ul>
            {companyInfo.bctNotificationUrl && (
              <a href={companyInfo.bctNotificationUrl} target="_blank" rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-3 rounded-xl border border-white/15 bg-white/8 px-4 py-2.5 hover:bg-white/12 transition-colors"
              >
                <ShieldCheck className="size-8 text-brand-blue" />
                <span className="text-xs font-800 uppercase leading-5 text-white">
                  {t(locale, "Đã thông báo", "Registered with")}<br />{t(locale, "Bộ Công Thương", "Ministry of Industry and Trade")}
                </span>
              </a>
            )}
          </div>

          {/* Services */}
          <div>
            <h4 className="mb-4 text-sm font-800 uppercase tracking-wider text-white">{t(locale, "Dịch vụ", "Services")}</h4>
            <ul className="flex flex-col gap-2 text-sm">
              {[
                [t(locale, "IT Staffing", "IT Staffing"), "/services/staffing"],
                ["Software Outsourcing", "/services/software-outsourcing"],
                ["ODC", "/services/odc"],
                [t(locale, "Phát triển sản phẩm", "Product Development"), "/services/product-development"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={lp(href, locale)} className="hover:text-brand-blue transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="mb-4 text-sm font-800 uppercase tracking-wider text-white">{t(locale, "Sản phẩm", "Products")}</h4>
            <ul className="flex flex-col gap-2 text-sm">
              {[
                ["Master eKYC", "/products/master-ekyc"],
                ["DocChain KSS", "/products/docchain-kss"],
                ["Horus Camera AI", "/products/horus-camera-ai"],
                ["Ông Bụt AI", "/products/ong-but-ai"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={lp(href, locale)} className="hover:text-brand-blue transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="mb-4 text-sm font-800 uppercase tracking-wider text-white">{t(locale, "Nhận tin tức", "Newsletter")}</h4>
            <p className="mb-4 text-sm leading-6">{t(locale, "Nhận thông tin mới nhất về IT staffing, AI và outsourcing.", "Get the latest on IT staffing, AI and outsourcing.")}</p>
            {nlState === "success" ? (
              <p className="text-sm font-600 text-emerald-400">{t(locale, "Đăng ký thành công!", "Subscribed!")}</p>
            ) : (
              <form onSubmit={subscribeNewsletter} className="flex gap-2">
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Email" required
                  className="form-input h-10 flex-1 rounded-lg border border-white/15 bg-white/8 text-white placeholder:text-slate-500 focus:border-brand-blue"
                />
                <button type="submit" className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-blue text-white hover:bg-brand-cyan transition-colors">
                  <Send className="size-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-8 text-sm sm:flex-row">
          <p>© {new Date().getFullYear()} {companyInfo.shortName} {t(locale, "Bảo lưu mọi quyền.", "All rights reserved.")}</p>
          <div className="flex flex-wrap justify-center gap-5">
            <Link href={lp("/policy", locale)} className="hover:text-brand-blue transition-colors">{t(locale, "Chính sách", "Policies")}</Link>
            <Link href={lp("/about", locale)} className="hover:text-brand-blue transition-colors">{t(locale, "Giới thiệu", "About")}</Link>
            <Link href={lp("/careers", locale)} className="hover:text-brand-blue transition-colors">{t(locale, "Tuyển dụng", "Careers")}</Link>
            <Link href={lp("/contact", locale)} className="hover:text-brand-blue transition-colors">{t(locale, "Liên hệ", "Contact")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Section Title ─────────────────────────────────────────────────
function SectionTitle({ eyebrow, title, desc, light = false }: { eyebrow: string; title: string; desc?: string; light?: boolean }) {
  return (
    <div className="mx-auto mb-12 max-w-3xl text-center">
      {/* 3-color brand accent line */}
      <div className="mx-auto mb-4 w-10 brand-bar" />
      <span className="eyebrow">{eyebrow}</span>
      <h2 className={`mt-2 text-3xl font-900 leading-tight md:text-5xl ${light ? "text-white" : "text-navy"}`}>{title}</h2>
      {desc && <p className={`mt-5 text-base leading-8 ${light ? "text-blue-100/80" : "text-slate-600"}`}>{desc}</p>}
    </div>
  );
}

// ─── Metric (hero) ─────────────────────────────────────────────────
function HeroMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="metric-card">
      <div className="metric-val">{value}</div>
      <div className="metric-lbl">{label}</div>
    </div>
  );
}

// ─── Animated Hero Dashboard ───────────────────────────────────────
function HeroDashboard({ locale }: { locale: Locale }) {
  const profiles = [
    { role: "Senior Java Dev", domain: "Banking / Fintech", avail: t(locale, "Sẵn sàng", "Available"), color: "emerald" },
    { role: "AI Engineer",     domain: "OCR / LLM",         avail: t(locale, "2 tuần", "2 weeks"),    color: "blue" },
    { role: "BrSE N2",         domain: "Japan project",     avail: t(locale, "Ngay lập tức", "Immediate"), color: "orange" },
    { role: "DevOps Engineer", domain: "AWS / K8s",         avail: t(locale, "Sẵn sàng", "Available"), color: "emerald" },
  ];

  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    orange: "bg-orange-50 text-orange-700",
  };

  return (
    <div className="relative select-none">
      {/* Main card */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="glass-card p-5 text-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-800 uppercase tracking-widest text-cyan-200">Talent Matching OS</p>
            <h3 className="mt-1 text-lg font-900">{t(locale, "Shortlist trong vài ngày", "Shortlist in days")}</h3>
          </div>
          <div className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-coral to-orange-400 text-white shadow-lg">
            <BrainCircuit className="size-5" />
          </div>
        </div>

        {/* Talent cards */}
        <div className="mt-4 flex flex-col gap-2.5">
          {profiles.map((p, i) => (
            <motion.div
              key={p.role}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.15 }}
              className="flex items-center justify-between rounded-xl bg-white px-3.5 py-2.5 text-navy shadow-sm"
            >
              <div>
                <p className="text-sm font-800">{p.role}</p>
                <p className="text-xs text-slate-500">{p.domain}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-800 ${colorMap[p.color]}`}>{p.avail}</span>
            </motion.div>
          ))}
        </div>

        {/* Code snippet */}
        <div className="mt-4 rounded-xl bg-slate-950 p-3.5 font-mono text-xs">
          <p className="text-slate-400">// ITSOL Talent Matcher</p>
          <p className="mt-1.5 text-cyan-300">skills.match(<span className="text-green-300">["Java", "Banking", "Senior"]</span>)</p>
          <p className="mt-1.5 text-emerald-400">→ <span className="text-white">12 vetted profiles found</span></p>
        </div>
      </motion.div>

      {/* Pipeline badge */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-10 -left-6 hidden rounded-2xl border border-white/20 bg-white/95 p-4 shadow-2xl backdrop-blur md:block"
      >
        <p className="mb-2 text-xs font-800 uppercase tracking-wider text-coral">Staffing Pipeline</p>
        <div className="flex items-center gap-1.5 text-xs font-700 text-slate-600">
          {["Request", "Screen", "Shortlist", "Interview", "Onboard"].map((s, i) => (
            <span key={s} className="flex items-center gap-1">
              <span className="rounded-full bg-slate-100 px-2 py-0.5">{s}</span>
              {i < 4 && <ChevronRight className="size-3 text-slate-300" />}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Trust badge */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -top-8 -right-4 hidden rounded-2xl border border-white/20 bg-green/90 p-3 text-white shadow-xl md:block"
      >
        <div className="flex items-center gap-2">
          <Award className="size-5" />
          <div>
            <p className="text-xs font-900">10 Sao Khuê</p>
            <p className="text-xs opacity-80">Awards</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Featured Clients & Projects Data ───────────────────────────────
const FEATURED_CLIENTS = [
  { name: "Viettel",     logo: "/clients/viettel.svg",     url: "https://viettel.com.vn" },
  { name: "Vingroup",    logo: "/clients/vingroup.svg",    url: "https://vingroup.net" },
  { name: "FPT",         logo: "/clients/fpt.svg",         url: "https://fpt.com.vn" },
  { name: "Bảo Việt",   logo: "/clients/baoviet.svg",     url: "https://baoviet.com.vn" },
  { name: "Techcombank", logo: "/clients/techcombank.svg", url: "https://techcombank.com.vn" },
  { name: "MB Bank",     logo: "/clients/mbbank.png",      url: "https://mbbank.com.vn" },
  { name: "SeABank",     logo: "/clients/seabank.png",     url: "https://seabank.com.vn" },
  { name: "Luvina",      logo: "/clients/luvina.png",      url: "https://luvina.net" },
  { name: "VPBank",      logo: "/clients/vpbank.png",      url: "https://vpbank.com.vn" },
  { name: "EVN Hà Nội",  logo: "/clients/evnhanoi.svg",    url: "https://evnhanoi.com.vn" },
];

const PROJECTS_BY_SERVICE: Record<string, Array<{icon:string;accent:string;name:string;category:{vi:string;en:string};desc:{vi:string;en:string};tags:string[];metric:{value:string;label:{vi:string;en:string}}}>> = {
  staffing: [
    { icon: "🏦", accent: "#C8102E", name: "Techcombank IT Staffing", category:{vi:"Ngân hàng & Fintech",en:"Banking & Fintech"}, desc:{vi:"Cung ứng 30+ kỹ sư Java/.NET cho đội ngũ Core Banking và Digital Channels của Techcombank.",en:"Supplied 30+ Java/.NET engineers for Techcombank's Core Banking and Digital Channels teams."}, tags:["Java",".NET","Banking","Onsite"], metric:{value:"30+",label:{vi:"Kỹ sư được cung cấp",en:"Engineers supplied"}} },
    { icon: "📱", accent: "#00427A", name: "MB Bank Digital Team", category:{vi:"Ngân hàng số",en:"Digital Banking"}, desc:{vi:"Dedicated team 15 kỹ sư phát triển ứng dụng MBBank — đạt 10 triệu MAU sau 12 tháng.",en:"Dedicated 15-engineer team delivering MBBank app — reached 10M MAU in 12 months."}, tags:["Mobile","React Native","Agile","Dedicated"], metric:{value:"10M",label:{vi:"MAU đạt được",en:"Monthly active users"}} },
    { icon: "⚡", accent: "#003087", name: "EVN Hà Nội — System Modernization", category:{vi:"Năng lượng & Tiện ích",en:"Energy & Utilities"}, desc:{vi:"Nhân sự IT cho chương trình hiện đại hóa hệ thống quản lý khách hàng và hóa đơn điện tử EVN HN.",en:"IT staffing for EVN Hanoi's customer management and e-billing system modernization program."}, tags:["Java","ERP","System Modernization","Onsite"], metric:{value:"3 năm",label:{vi:"Hợp tác liên tục",en:"Continuous partnership"}} },
  ],
  "software-outsourcing": [
    { icon: "📄", accent: "#009944", name: "DocChain KSS", category:{vi:"Ngân hàng — Quản lý chứng từ",en:"Banking Document Management"}, desc:{vi:"Số hóa, tìm kiếm và hậu kiểm hồ sơ chứng từ ngân hàng — giảm 70% thao tác thủ công, tăng tốc compliance.",en:"Digitize and post-control banking documents — 70% less manual work, faster compliance, full audit trail."}, tags:["Banking","OCR","Workflow","Compliance"], metric:{value:"70%",label:{vi:"Giảm thủ công",en:"Manual work reduced"}} },
    { icon: "📷", accent: "#003087", name: "Horus Camera AI", category:{vi:"Giám sát AI thời gian thực",en:"AI Surveillance Platform"}, desc:{vi:"Biến camera IP thường thành hệ thống giám sát thông minh — nhận diện biển số, phát hiện cháy, cảnh báo tức thì.",en:"Transform IP cameras into intelligent surveillance — license plates, fire detection, real-time alerts."}, tags:["Computer Vision","Edge AI","IoT","Real-time"], metric:{value:"24/7",label:{vi:"Giám sát liên tục",en:"Continuous monitoring"}} },
    { icon: "🏗️", accent: "#6366F1", name: "Enterprise ERP — Vingroup", category:{vi:"Enterprise System",en:"Enterprise System"}, desc:{vi:"Outsource phát triển module quản lý nội bộ, HR và tài chính cho hệ thống ERP của Vingroup.",en:"Outsourced development of internal management, HR and finance modules for Vingroup ERP."}, tags:["ERP","Microservices","Java","Enterprise"], metric:{value:"12+",label:{vi:"Module triển khai",en:"Modules delivered"}} },
  ],
  odc: [
    { icon: "🌐", accent: "#003E9C", name: "Luvina — Long-term ODC Partner", category:{vi:"ODC Dài hạn — Nhật Bản",en:"Long-term ODC — Japan"}, desc:{vi:"Trung tâm kỹ sư Vietnam cung cấp cho Luvina (JP) hơn 8 năm — 50+ kỹ sư, BrSE, Comtor và PM chuyên Nhật.",en:"Vietnam engineering center for Luvina (Japan) for 8+ years — 50+ engineers, BrSEs and Japanese-speaking PMs."}, tags:["BrSE","Comtor","Agile","Japan"], metric:{value:"50+",label:{vi:"Kỹ sư biên chế",en:"Engineers on team"}} },
    { icon: "📡", accent: "#E31E24", name: "Viettel — Dedicated Engineering Squad", category:{vi:"Viễn thông & Hạ tầng số",en:"Telecom & Digital Infrastructure"}, desc:{vi:"Đội ngũ kỹ sư 20+ người phát triển hệ thống BSS/OSS cho Viettel — 5 năm hợp tác liên tục.",en:"20+ engineer squad building BSS/OSS systems for Viettel — 5 years of continuous collaboration."}, tags:["BSS/OSS","Java","DevOps","Scale"], metric:{value:"5 năm",label:{vi:"Đối tác liên tục",en:"Ongoing partnership"}} },
    { icon: "🔒", accent: "#C8102E", name: "Banking ODC — Fintech Cluster", category:{vi:"ODC Ngân hàng & Fintech",en:"Banking & Fintech ODC"}, desc:{vi:"ODC tập trung cho 3 ngân hàng top-tier — MB Bank, SeABank, VPBank — mô hình Build-Operate-Transfer.",en:"Concentrated ODC for 3 top-tier banks — MB Bank, SeABank, VPBank — Build-Operate-Transfer model."}, tags:["Banking","BOT","Security","Compliance"], metric:{value:"3",label:{vi:"Ngân hàng đối tác",en:"Bank partners"}} },
  ],
  "product-development": [
    { icon: "🔐", accent: "#C8102E", name: "Master eKYC", category:{vi:"Định danh điện tử AI",en:"AI Identity Verification"}, desc:{vi:"Hệ thống eKYC tích hợp OCR, face liveness và fraud detection — giúp ngân hàng số hóa toàn bộ quy trình mở tài khoản.",en:"eKYC platform with OCR, face liveness and fraud detection — enables banks to fully digitize account opening."}, tags:["AI","Banking","OCR","Face Liveness"], metric:{value:"95%",label:{vi:"Tự động xác minh",en:"Auto-verify rate"}} },
    { icon: "📷", accent: "#003087", name: "Horus Camera AI", category:{vi:"Giám sát AI thời gian thực",en:"Real-time AI Surveillance"}, desc:{vi:"Biến camera IP thường thành hệ thống giám sát thông minh — nhận diện biển số, phát hiện cháy và cảnh báo tức thì.",en:"Transform standard IP cameras into intelligent surveillance — license plates, fire detection, real-time alerts."}, tags:["Computer Vision","Edge AI","IoT","Real-time"], metric:{value:"24/7",label:{vi:"Giám sát liên tục",en:"Continuous monitoring"}} },
    { icon: "🎓", accent: "#F47920", name: "Ông Bụt AI", category:{vi:"Hệ sinh thái giáo dục AI",en:"AI Education Ecosystem"}, desc:{vi:"Nền tảng giáo dục AI cho giáo viên và học sinh — chấm bài tự động, OCR tài liệu, học tập cá nhân hoá.",en:"AI education platform for teachers and students — auto grading, document OCR, personalized learning paths."}, tags:["AI","Education","LLM","EdTech"], metric:{value:"4-in-1",label:{vi:"Học · Thi · Phân tích · AI",en:"Learn · Exam · Analytics · AI"}} },
    { icon: "📄", accent: "#009944", name: "DocChain KSS", category:{vi:"Quản lý chứng từ ngân hàng",en:"Banking Document Management"}, desc:{vi:"Số hóa, tìm kiếm và hậu kiểm hồ sơ chứng từ ngân hàng — giảm 70% thao tác thủ công, tăng tốc compliance.",en:"Digitize and post-control banking documents — 70% less manual work, faster compliance, full audit trail."}, tags:["Banking","OCR","Workflow","Compliance"], metric:{value:"70%",label:{vi:"Giảm thủ công",en:"Manual work reduced"}} },
  ],
};

function FeaturedClientsSection({ locale }: { locale: Locale }) {
  return (
    <section className="section bg-white border-y border-slate-100">
      <div className="container-page">
        <SectionTitle
          eyebrow={t(locale, "Đối tác & Khách hàng tiêu biểu", "Trusted Clients & Partners")}
          title={t(locale, "Niềm tin từ các doanh nghiệp lớn tại Việt Nam", "Trusted by leading enterprises in Vietnam")}
          desc={t(locale, "ITSOL đã đồng hành cùng các tập đoàn, ngân hàng và doanh nghiệp công nghệ hàng đầu trong hơn 15 năm.", "Over 15 years, ITSOL has partnered with top corporations, banks, and technology companies across Vietnam.")}
        />
        <div className="-mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-5 md:overflow-visible md:pb-0">
            {FEATURED_CLIENTS.map((client) => (
              <a
                key={client.name}
                href={client.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex-shrink-0 snap-start w-40 md:w-auto flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md hover:border-brand-blue/30"
              >
                <div className="flex h-14 w-full items-center justify-center">
                  <img
                    src={client.logo}
                    alt={client.name}
                    className="max-h-12 max-w-[120px] w-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                    loading="lazy"
                  />
                </div>
                <span className="text-xs font-600 text-slate-500 group-hover:text-navy transition-colors text-center leading-tight">
                  {client.name}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ServiceProjectsSection({ locale, serviceKey }: { locale: Locale; serviceKey: string }) {
  const projects = PROJECTS_BY_SERVICE[serviceKey] ?? [];
  if (!projects.length) return null;
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      {/* === DESKTOP background: dark tech === */}
      <div className="absolute inset-0 hidden md:block" style={{ background: "linear-gradient(135deg,#040e24 0%,#071a3e 60%,#0a2454 100%)" }} />
      {/* Code grid overlay — desktop only */}
      <div className="pointer-events-none absolute inset-0 hidden md:block opacity-[0.06]" style={{ backgroundImage: "linear-gradient(rgba(0,200,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,255,.6) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
      {/* Glow spots */}
      <div className="pointer-events-none absolute -top-24 -left-24 hidden h-96 w-96 rounded-full md:block" style={{ background: "radial-gradient(circle,rgba(0,87,217,.35) 0%,transparent 70%)" }} />
      <div className="pointer-events-none absolute -bottom-24 -right-24 hidden h-80 w-80 rounded-full md:block" style={{ background: "radial-gradient(circle,rgba(0,200,200,.2) 0%,transparent 70%)" }} />
      {/* === MOBILE background: light === */}
      <div className="absolute inset-0 md:hidden" style={{ background: "linear-gradient(135deg,#f0f7ff 0%,#fafbff 100%)" }} />

      <div className="container-page relative">
        {/* Header */}
        <div className="mb-10 text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 backdrop-blur md:bg-cyan-400/10 bg-brand-blue/10">
            <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse md:block hidden" />
            <span className="text-xs font-900 uppercase tracking-widest text-cyan-700 md:text-cyan-300">{t(locale, "Dự án tiêu biểu", "Featured Projects")}</span>
          </div>
          <h2 className="mt-3 text-3xl font-900 leading-tight text-navy md:text-4xl md:text-white">
            {t(locale, "Case study từ thực tế", "Real-world case studies")}
          </h2>
          <p className="mt-2 text-base leading-7 text-slate-600 md:text-slate-400">
            {t(locale, "Các dự án ITSOL đã triển khai thành công — kết quả đo lường được.", "Projects delivered by ITSOL — with measurable outcomes.")}
          </p>
        </div>

        {/* Cards */}
        <div className="-mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex gap-5 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-3 md:overflow-visible md:pb-0 md:gap-6">
            {projects.map((project, i) => (
              <motion.div
                key={project.name}
                initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                className="group flex-shrink-0 snap-start w-72 md:w-auto flex flex-col overflow-hidden transition
                  rounded-2xl bg-white shadow-md border border-white/80 hover:-translate-y-1.5 hover:shadow-xl
                  md:rounded-2xl md:bg-white/[0.05] md:border md:border-white/10 md:backdrop-blur-sm
                  md:hover:-translate-y-2 md:hover:shadow-[0_20px_60px_rgba(0,150,255,0.15)] md:hover:border-cyan-400/30"
              >
                {/* Accent bar */}
                <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${project.accent}, ${project.accent}55)` }} />

                <div className="p-6 flex flex-col flex-1 gap-4">
                  {/* Category + icon */}
                  <div className="flex items-center gap-3">
                    <div className="grid size-11 shrink-0 place-items-center rounded-xl text-xl transition group-hover:scale-110"
                      style={{ background: `${project.accent}20`, border: `1px solid ${project.accent}30` }}>
                      {project.icon}
                    </div>
                    <span className="text-[10px] font-800 uppercase tracking-widest md:text-cyan-300/80 text-slate-400">
                      {t(locale, project.category.vi, project.category.en)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-900 leading-snug text-navy md:text-white">{project.name}</h3>

                  {/* Description */}
                  <p className="text-sm leading-6 text-slate-500 md:text-slate-400 flex-1">{t(locale, project.desc.vi, project.desc.en)}</p>

                  {/* Tags — tech chip style on desktop */}
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <span key={tag}
                        className="inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-700
                          border text-slate-600 border-slate-200/80 bg-slate-50
                          md:border-cyan-400/20 md:text-cyan-300 md:bg-cyan-400/[0.06]"
                      >{tag}</span>
                    ))}
                  </div>

                  {/* Metric — highlighted */}
                  <div className="flex items-center gap-4 rounded-xl px-4 py-3
                    bg-slate-50 border border-slate-100
                    md:bg-white/[0.06] md:border-white/10">
                    <span className="text-3xl font-900 tabular-nums" style={{ color: project.accent }}>{project.metric.value}</span>
                    <div>
                      <p className="text-xs font-700 leading-tight text-slate-600 md:text-slate-300">{t(locale, project.metric.label.vi, project.metric.label.en)}</p>
                      <div className="mt-1 h-1 w-12 rounded-full" style={{ background: `linear-gradient(90deg,${project.accent},${project.accent}44)` }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Home Page ─────────────────────────────────────────────────────
function Home({ locale }: { locale: Locale }) {
  return (
    <>
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden pt-[68px]">
        {/* Brand 3-color top bar */}
        <div className="absolute inset-x-0 top-0 h-1 brand-bar" />
        {/* Tech grid overlay */}
        <div className="hero-grid-overlay" />
        {/* Electric glow accents */}
        <div className="pointer-events-none absolute -left-32 top-20 size-96 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #0095E8 0%, transparent 70%)" }} />
        <div className="pointer-events-none absolute -right-20 top-10 size-72 rounded-full opacity-15 blur-3xl" style={{ background: "radial-gradient(circle, #7DC338 0%, transparent 70%)" }} />
        <div className="pointer-events-none absolute bottom-0 right-1/3 size-64 rounded-full opacity-12 blur-3xl" style={{ background: "radial-gradient(circle, #F5820A 0%, transparent 70%)" }} />

        <div className="container-page grid min-h-[660px] items-center gap-14 py-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            {/* Pill badge */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 text-xs font-800 text-white backdrop-blur"
            >
              <Sparkles className="size-3.5" style={{ color: "#7DC338" }} />
              {t(locale, "Đối tác nhân sự IT và giải pháp phần mềm", "The right IT talent — at the right time — at the right price")}
            </motion.div>

            {/* Headline */}
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-5 max-w-2xl text-5xl font-900 leading-[1.04] text-white md:text-6xl"
            >
              {t(locale,
                "Đội ngũ IT đúng người — đúng thời điểm — đúng giá",
                "The right IT talent — at the right time — at the right price"
              )}
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-5 max-w-xl text-lg font-500 leading-8 text-cyan-50"
            >
              {t(locale,
                "ITSOL cung cấp kỹ sư IT đã được sàng lọc, xây dựng phần mềm và triển khai AI cho doanh nghiệp tại Việt Nam và quốc tế từ năm 2009.",
                "ITSOL delivers vetted IT engineers, custom software and AI solutions for enterprises in Vietnam and globally — since 2009."
              )}
            </motion.p>

            {/* CTA buttons */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link href={lp("/services/staffing", locale)} className="btn btn-primary text-base">
                {t(locale, "Gửi yêu cầu nhân sự", "Request IT Talents")}
                <ArrowRight className="size-4" />
              </Link>
              <Link href={lp("/services", locale)} className="btn btn-white text-base">
                {t(locale, "Xem dịch vụ", "Explore Services")}
              </Link>
              <Link href={lp("/contact", locale)} className="btn btn-outline-white text-base">
                {t(locale, "Tư vấn miễn phí", "Talk to Expert")}
              </Link>
            </motion.div>

            {/* Metrics */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }}
              className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-5"
            >
              {[
                { v: "2009", l: t(locale, "Thành lập", "Founded") },
                { v: "250+", l: t(locale, "Kỹ sư IT", "IT Engineers") },
                { v: "10×", l: "Sao Khuê" },
                { v: "Top 10", l: "Vietnam ICT" },
                { v: "AI+", l: "Banking/IoT" },
              ].map(m => <HeroMetric key={m.l} value={m.v} label={m.l} />)}
            </motion.div>
          </div>

          {/* Dashboard */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.3 }}>
            <HeroDashboard locale={locale} />
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="section bg-light">
        <div className="container-page">
          <SectionTitle
            eyebrow={t(locale, "Dịch vụ cốt lõi", "Core Services")}
            title={t(locale, "Năng lực công nghệ cho doanh nghiệp lớn", "Technology capacity for enterprise growth")}
            desc={t(locale,
              "ITSOL kết hợp staffing, outsourcing, ODC và product development để giúp doanh nghiệp mở rộng năng lực delivery.",
              "ITSOL combines staffing, outsourcing, ODC and product development to scale your delivery capacity."
            )}
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {services.map((svc, i) => {
              const icons = [Users, Code2, Globe2, Rocket];
              const Icon = icons[i] ?? Code2;
              return (
                <motion.div key={svc.slug} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                >
                  <Link href={lp(svc.href, locale)} className="card group block p-7">
                    <div className="flex items-start justify-between">
                      <div className="grid size-12 place-items-center rounded-xl bg-cyan-50 text-brand-blue transition-colors group-hover:bg-brand-blue group-hover:text-white">
                        <Icon className="size-6" />
                      </div>
                      {svc.badge && <span className="badge-hot">{svc.badge}</span>}
                    </div>
                    <h3 className="mt-5 text-lg font-800 text-navy">{svc.title[locale]}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{svc.summary[locale]}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {svc.points.map((p: string) => (
                        <span key={p} className="rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-600 text-slate-600">{p}</span>
                      ))}
                    </div>
                    <div className="mt-5 flex items-center gap-1.5 text-sm font-700 text-brand-blue">
                      {t(locale, "Tìm hiểu thêm", "Learn more")} <ChevronRight className="size-4" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Staffing Highlight */}
      <StaffingHighlight locale={locale} />

      {/* Products */}
      <ProductShowcase locale={locale} />

      {/* Awards */}
      <AwardsSection locale={locale} />

      {/* Featured Clients */}
      <FeaturedClientsSection locale={locale} />

      {/* Industries */}
      <IndustriesSection locale={locale} />

      {/* Contact CTA */}
      <ContactCTA locale={locale} />
    </>
  );
}

// ─── Staffing Highlight ──────────────────────────────────────────
function StaffingHighlight({ locale }: { locale: Locale }) {
  const pipeline = [
    { icon: FileText, color: "from-blue-600 to-cyan-500", en: "Requirement intake", vi: "Tiếp nhận JD", descVi: "Chuẩn hóa vai trò, seniority, tech stack, domain và ngân sách.", descEn: "Clarify role, seniority, tech stack, domain and budget." },
    { icon: Search, color: "from-indigo-600 to-blue-500", en: "Requirement analysis", vi: "Phân tích kỹ thuật", descVi: "Senior engineer bóc tách tiêu chí bắt buộc, tiêu chí cộng điểm và rủi ro.", descEn: "Senior engineers define must-have skills, nice-to-haves and risks." },
    { icon: BrainCircuit, color: "from-violet-600 to-fuchsia-500", en: "Talent matching", vi: "Matching talent pool", descVi: "Đối chiếu hồ sơ theo kỹ năng, domain, availability và mô hình làm việc.", descEn: "Match profiles by skill, domain, availability and work model." },
    { icon: Code2, color: "from-cyan-600 to-emerald-500", en: "Technical screening", vi: "Sàng lọc kỹ thuật", descVi: "Kiểm tra code, system design, kinh nghiệm dự án và khả năng giao tiếp.", descEn: "Validate coding, system design, project experience and communication." },
    { icon: Users, color: "from-emerald-600 to-teal-500", en: "Curated shortlist", vi: "Shortlist tinh gọn", descVi: "Gửi shortlist 3–5 hồ sơ phù hợp kèm nhận xét kỹ thuật rõ ràng.", descEn: "Send 3–5 fit profiles with clear technical notes." },
    { icon: Network, color: "from-orange-500 to-amber-400", en: "Interview coordination", vi: "Điều phối phỏng vấn", descVi: "Sắp lịch, chuẩn bị tiêu chí đánh giá và hỗ trợ phản hồi sau phỏng vấn.", descEn: "Schedule interviews, prepare scorecards and capture feedback." },
    { icon: ShieldCheck, color: "from-slate-700 to-blue-700", en: "Contract & compliance", vi: "Hợp đồng & bảo mật", descVi: "Hoàn thiện hợp đồng, NDA, điều khoản thay thế và quy trình onboard.", descEn: "Handle contract, NDA, replacement terms and onboarding workflow." },
    { icon: BarChart3, color: "from-rose-500 to-orange-500", en: "Delivery tracking", vi: "Theo dõi delivery", descVi: "Theo dõi timesheet, hiệu suất, SLA và mức độ hài lòng của khách hàng.", descEn: "Track timesheets, performance, SLA and customer satisfaction." },
  ];

  return (
    <section className="section bg-white">
      <div className="container-page">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <span className="eyebrow">IT Staffing</span>
            <h2 className="mt-2 text-3xl font-900 leading-tight text-navy md:text-5xl">
              {t(locale, "Nhân sự IT chất lượng trong 3–5 ngày làm việc", "Quality IT talent in 3–5 business days")}
            </h2>
            <p className="mt-5 leading-8 text-slate-600">
              {t(locale,
                "Không như các công ty tuyển dụng thông thường, ITSOL sàng lọc kỹ thuật mỗi ứng viên bằng đội senior engineers nội bộ trước khi giới thiệu. Bạn chỉ gặp người đã đủ tiêu chuẩn.",
                "Unlike typical recruitment firms, ITSOL pre-screens every candidate with our in-house senior engineers. You only meet people who've already passed the technical bar."
              )}
            </p>
            <ul className="mt-6 flex flex-col gap-3">
              {[
                t(locale, "Pre-screening kỹ thuật bởi senior engineers", "Technical pre-screening by senior engineers"),
                t(locale, "Shortlist trong 3-5 ngày làm việc", "Shortlist in 3-5 business days"),
                t(locale, "Mô hình linh hoạt: onsite, remote, hybrid, dedicated team", "Flexible models: onsite, remote, hybrid, dedicated team"),
                t(locale, "Cam kết thay thế nhân sự không phù hợp", "Replacement commitment for unsuitable candidates"),
              ].map(item => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green" />
                  <span className="text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={lp("/services/staffing", locale)} className="btn btn-primary">
                {t(locale, "Gửi yêu cầu nhân sự", "Submit Staffing Request")}
                <ArrowRight className="size-4" />
              </Link>
              <Link href={lp("/services/staffing", locale)} className="btn btn-outline-navy border border-navy text-navy">
                {t(locale, "Xem talent pool", "View Talent Pool")}
              </Link>
            </div>
          </div>

          {/* Pipeline */}
          <div>
            <p className="mb-5 text-center text-xs font-800 uppercase tracking-widest text-slate-500">{t(locale, "Quy trình staffing", "Staffing Process")}</p>
            <div className="hidden grid-cols-2 gap-3 lg:grid xl:grid-cols-4">
              {pipeline.map((step, i) => (
                <motion.div key={step.en} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                  className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-cyan-200 hover:shadow-lg"
                >
                  {/* Gradient header bar */}
                  <div className={`bg-gradient-to-r ${step.color} px-3 py-3 flex items-center gap-2.5`}>
                    <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/20">
                      <step.icon className="size-4 text-white" />
                    </div>
                    <div>
                      <span className="text-[9px] font-900 uppercase tracking-widest text-white/60">Step {String(i + 1).padStart(2, "0")}</span>
                      <p className="text-[11px] font-900 leading-tight text-white">{locale === "vi" ? step.vi : step.en}</p>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-[11px] leading-5 text-slate-500">{locale === "vi" ? step.descVi : step.descEn}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 lg:hidden">
              {pipeline.map((step, i) => (
                <motion.div
                  key={step.en}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="relative rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <div className={`grid size-10 place-items-center rounded-xl bg-gradient-to-br ${step.color} text-white shadow`}>
                    <step.icon className="size-5" />
                  </div>
                  <p className="mt-3 text-xs font-900 text-navy leading-tight">{locale === "vi" ? step.vi : step.en}</p>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-500">{locale === "vi" ? step.descVi : step.descEn}</p>
                </motion.div>
              ))}
            </div>

            {/* Roles grid */}
            <div className="mt-8">
              <p className="mb-3 text-xs font-800 uppercase tracking-widest text-slate-500">{t(locale, "Vị trí cung cấp", "Roles we provide")}</p>
              <div className="flex flex-wrap gap-2">
                {staffingRoles.slice(0, 15).map(role => (
                  <span key={role} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-600 text-slate-700 shadow-sm">{role}</span>
                ))}
                <Link href={lp("/services/staffing", locale)} className="rounded-full border border-brand-blue bg-cyan-50 px-3 py-1 text-xs font-700 text-brand-blue">
                  +{staffingRoles.length - 15} more
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Product Showcase ─────────────────────────────────────────────
function ProductShowcase({ locale }: { locale: Locale }) {
  const colors = [
    "from-blue-600 to-cyan-500",
    "from-violet-600 to-blue-500",
    "from-slate-700 to-slate-600",
    "from-emerald-600 to-teal-500",
  ];

  return (
    <section className="section bg-light-2">
      <div className="container-page">
        <SectionTitle
          eyebrow={t(locale, "Sản phẩm công nghệ", "Technology Products")}
          title={t(locale, "Các sản phẩm AI tiêu biểu của ITSOL", "ITSOL flagship AI products")}
          desc={t(locale,
            "Từ eKYC đến Camera AI và nền tảng giáo dục - ITSOL xây dựng sản phẩm công nghệ thực sự giải quyết bài toán nghiệp vụ.",
            "From eKYC to Camera AI and education platforms - ITSOL builds products that solve real business problems."
          )}
        />
        <div className="grid gap-5 md:grid-cols-2">
          {products.map((p, i) => (
            <motion.div key={p.slug} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            >
              <Link href={lp(`/products/${p.slug}`, locale)} className="card group block overflow-hidden">
                <div className={`h-2 w-full bg-gradient-to-r ${colors[i]}`} />
                <div className="p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-800 uppercase tracking-wider text-brand-blue">{p.category[locale]}</p>
                      <h3 className="mt-2 text-xl font-800 text-navy">{p.name}</h3>
                    </div>
                    <div className={`grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${colors[i]} text-white shadow-lg`}>
                      <Bot className="size-5" />
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{p.summary[locale]}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.tags.map(tag => <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-600 text-slate-600">{tag}</span>)}
                  </div>
                  <div className="mt-5 flex items-center gap-1.5 text-sm font-700 text-brand-blue transition-all group-hover:gap-2.5">
                    {t(locale, "Xem chi tiết", "View details")} <ArrowRight className="size-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Awards Section ───────────────────────────────────────────────
function AwardsSection({ locale }: { locale: Locale }) {
  const { count: yr, ref: yrRef } = useCounter(17);
  const { count: eng, ref: engRef } = useCounter(250);
  const { count: clients, ref: clRef } = useCounter(500);

  return (
    <section className="section blue-gradient relative overflow-hidden">
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-blue/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-green/10 blur-3xl" />

      <div className="container-page relative">
        <SectionTitle
          eyebrow={t(locale, "Giải thưởng & Công nhận", "Awards & Recognition")}
          title={t(locale, "17 năm xây dựng — 10 năm được công nhận", "17 years building — 10 years recognized")}
          desc={t(locale,
            "Sao Khuê Awards và Top 10 Vietnam ICT không phải tự nhiên mà có. Đó là kết quả từ những dự án được giao đúng hạn, đội ngũ cam kết và khách hàng quay lại.",
            "Sao Khuê and Top 10 Vietnam ICT don't happen by accident. They come from projects delivered on time, teams that commit, and clients who come back."
          )}
          light
        />

        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              icon: Award, color: "from-yellow-500 to-orange-400",
              title: t(locale, "10 năm Sao Khuê", "10× Sao Khuê Awards"),
              desc: t(locale, "Giải thưởng phần mềm xuất sắc hàng đầu Việt Nam", "Vietnam's top software excellence award"),
              year: "2015-2024"
            },
            {
              icon: TrendingUp, color: "from-cyan-500 to-blue-500",
              title: t(locale, "Top 10 Vietnam ICT", "Top 10 Vietnam ICT"),
              desc: t(locale, "10 năm liên tiếp trong Top 10 công ty ICT Việt Nam", "10 consecutive years in Vietnam's Top 10 ICT companies"),
              year: "2015-2024"
            },
            {
              icon: ShieldCheck, color: "from-emerald-500 to-teal-500",
              title: t(locale, "Sao Khuê Tư vấn Banking", "Sao Khuê Banking Consulting"),
              desc: t(locale, "Top 10 giải pháp tư vấn hệ thống ngân hàng", "Top 10 banking system consulting solution"),
              year: "2018"
            },
          ].map((a, i) => (
            <motion.div key={a.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              className="award-card text-white"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              <div className={`mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-gradient-to-br ${a.color} shadow-lg`}>
                <a.icon className="size-7" />
              </div>
              <h3 className="text-lg font-800">{a.title}</h3>
              <p className="mt-2 text-sm leading-6 text-cyan-100">{a.desc}</p>
              <p className="mt-3 text-xs font-800 text-orange/90">{a.year}</p>
            </motion.div>
          ))}
        </div>

        {/* Counters */}
        <div className="mt-14 grid grid-cols-3 divide-x divide-white/15 rounded-2xl border border-white/15 bg-white/8 backdrop-blur">
          {[
            { ref: yrRef,  val: yr,      suffix: "+", label: t(locale, "Năm kinh nghiệm", "Years of experience") },
            { ref: engRef, val: eng,     suffix: "+", label: t(locale, "Kỹ sư & chuyên gia", "Engineers & experts") },
            { ref: clRef,  val: clients, suffix: "+", label: t(locale, "Dự án thành công", "Successful projects") },
          ].map((c, i) => (
            <div key={i} ref={c.ref} className="py-8 text-center text-white">
              <div className="text-4xl font-900" style={{ background: "linear-gradient(135deg,#fff,#94d6f5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {c.val}{c.suffix}
              </div>
              <p className="mt-2 text-sm font-600 text-cyan-100">{c.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Industries Section ───────────────────────────────────────────
function IndustriesSection({ locale }: { locale: Locale }) {
  const meta = [
    { icon: Building2, color: "from-blue-600 to-cyan-500",    tag: "Core" },
    { icon: Shield,    color: "from-emerald-600 to-teal-500", tag: "Risk" },
    { icon: Globe2,    color: "from-violet-600 to-blue-500",  tag: "B2B" },
    { icon: Network,   color: "from-orange-500 to-amber-400", tag: "BSS" },
    { icon: Bot,       color: "from-pink-600 to-rose-400",    tag: "AI" },
    { icon: Database,  color: "from-slate-700 to-slate-500",  tag: "Data" },
    { icon: Cpu,       color: "from-lime-600 to-green-500",   tag: "MES" },
    { icon: Rocket,    color: "from-indigo-600 to-blue-500",  tag: "Fleet" },
    { icon: Zap,       color: "from-yellow-500 to-orange-400",tag: "Edge" },
    { icon: Layers3,   color: "from-cyan-600 to-blue-400",    tag: "Gov" },
  ];
  return (
    <section className="section bg-white">
      <div className="container-page">
        <SectionTitle
          eyebrow={t(locale, "Ngành dọc", "Industries")}
          title={t(locale, "Chuyên môn sâu theo ngành", "Deep domain expertise")}
          desc={t(locale, "ITSOL đã triển khai giải pháp và nhân sự IT cho 10+ ngành dọc khác nhau.", "ITSOL has deployed IT solutions and talent across 10+ distinct industries.")}
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {industries.map((ind, i) => {
            const { icon: Icon, color, tag } = meta[i] ?? meta[0];
            return (
              <motion.div key={ind.slug}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${color}`} />
                <div className={`grid size-11 place-items-center rounded-xl bg-gradient-to-br ${color} text-white shadow`}>
                  <Icon className="size-5" />
                </div>
                <p className="mt-3 text-sm font-800 leading-tight text-navy">{ind.name[locale]}</p>
                <p className="mt-1 text-xs leading-4 text-slate-400">{ind.desc[locale]}</p>
                <span className="mt-3 inline-block rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-800 uppercase tracking-wider text-slate-500">{tag}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Contact CTA ──────────────────────────────────────────────────
function ContactCTA({ locale }: { locale: Locale }) {
  return (
    <section className="section bg-light">
      <div className="container-page">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-navy via-navy-mid to-[#0070bf] px-8 py-14 text-center md:px-16">
          <p className="eyebrow" style={{ background: "rgba(245,130,10,0.20)", borderColor: "rgba(245,130,10,0.40)", color: "#FFB347" }}>{t(locale, "Liên hệ ngay", "Get started today")}</p>
          <h2 className="mt-2 text-3xl font-900 text-white md:text-5xl">
            {t(locale, "Cần kỹ sư IT? Gặp chúng tôi hôm nay.", "Need IT engineers? Talk to us today.")}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-cyan-100">
            {t(locale,
              "Từ một kỹ sư đến cả ODC — ITSOL có thể bắt đầu nhanh. Trao đổi 30 phút để biết mình có thể giúp được gì.",
              "From a single engineer to a full ODC — ITSOL can start fast. A 30-minute conversation to see if we're the right fit."
            )}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href={lp("/services/staffing", locale)} className="btn btn-primary text-base">
              {t(locale, "Gửi yêu cầu nhân sự", "Request IT Talents")}
              <ArrowRight className="size-4" />
            </Link>
            <Link href={lp("/contact", locale)} className="btn btn-outline-white text-base">
              {t(locale, "Liên hệ tư vấn", "Talk to an expert")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── About Page ───────────────────────────────────────────────────
function About({ locale }: { locale: Locale }) {
  const timeline = [
    { year: "2009", en: "Founded with a mission to build great software products", vi: "Thành lập với sứ mệnh xây dựng phần mềm chất lượng" },
    { year: "2013", en: "Rebranded as ITSOL, focused on IT solutions & resources", vi: "Đổi thương hiệu thành ITSOL, tập trung vào giải pháp & nhân lực IT" },
    { year: "2015", en: "First Sao Khuê Award for IT Staffing & Recruitment", vi: "Sao Khuê đầu tiên hạng mục Staffing & Recruitment" },
    { year: "2018", en: "Top 10 Sao Khuê for Banking Solution Consulting", vi: "Top 10 Sao Khuê tư vấn hệ thống ngân hàng" },
    { year: "2019+", en: "Continued award recognition and rapid team growth", vi: "Liên tiếp đạt giải và tăng trưởng mạnh" },
    { year: "2024+", en: "AI, product development and ODC expansion", vi: "Mở rộng AI, phát triển sản phẩm và ODC" },
  ];

  const values = [
    { en: "Kindness", vi: "Tử tế", icon: "💚", desc: { en: "We treat people with care and respect", vi: "Đối xử với mọi người bằng sự quan tâm và tôn trọng" } },
    { en: "Intelligence", vi: "Trí tuệ", icon: "🧠", desc: { en: "We apply smart thinking to every challenge", vi: "Áp dụng tư duy thông minh vào mọi thách thức" } },
    { en: "Trust", vi: "Tin cậy", icon: "🤝", desc: { en: "We build long-term relationships on reliability", vi: "Xây dựng quan hệ dài hạn dựa trên độ tin cậy" } },
    { en: "Commitment", vi: "Cam kết", icon: "🎯", desc: { en: "We deliver what we promise, always", vi: "Chúng tôi thực hiện đúng những gì đã cam kết" } },
    { en: "Sustainability", vi: "Bền vững", icon: "🌱", desc: { en: "We create lasting value for people and society", vi: "Tạo ra giá trị bền vững cho con người và xã hội" } },
  ];

  return (
    <>
      {/* Hero */}
      <section className="hero-gradient pb-20 pt-32 text-white">
        <div className="container-page text-center">
          <span className="eyebrow text-orange">{t(locale, "Về chúng tôi", "About ITSOL")}</span>
          <h1 className="mt-3 text-4xl font-900 md:text-6xl">{t(locale, "Làm công nghệ bằng trí tuệ — phục vụ bằng sự tử tế", "Technology built with intelligence — delivered with care")}</h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-cyan-100">
            {t(locale,
              "Từ năm 2009, ITSOL đã xây dựng đội ngũ kỹ sư, phát triển phần mềm và ra mắt sản phẩm AI cho hàng trăm khách hàng trong nước và quốc tế.",
              "Since 2009, ITSOL has built engineering teams, delivered software and launched AI products for hundreds of clients in Vietnam and beyond."
            )}
          </p>
        </div>
      </section>

      {/* Vision / Mission */}
      <section className="section bg-white">
        <div className="container-page">
          <div className="grid gap-6 md:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy to-[#0070bf] p-8 text-white md:p-10"
            >
              <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-brand-blue/20 blur-2xl" />
              <div className="mb-5 grid size-12 place-items-center rounded-xl bg-white/15">
                <Globe2 className="size-6" />
              </div>
              <p className="text-xs font-800 uppercase tracking-widest text-cyan-200">{t(locale, "Tầm nhìn", "Vision")}</p>
              <h3 className="mt-3 text-2xl font-900 leading-tight">
                {t(locale, "Trở thành đối tác công nghệ tin cậy nhất Việt Nam", "Vietnam's most trusted technology partner")}
              </h3>
              <p className="mt-3 text-base leading-8 text-cyan-100">
                {t(locale,
                  "Nơi kỹ sư giỏi muốn làm việc và khách hàng muốn quay lại.",
                  "A place great engineers want to work and clients want to return to."
                )}
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3a7d12] to-[#8cc63f] p-8 text-white md:p-10"
            >
              <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="mb-5 grid size-12 place-items-center rounded-xl bg-white/15">
                <Rocket className="size-6" />
              </div>
              <p className="text-xs font-800 uppercase tracking-widest text-green-100">{t(locale, "Sứ mệnh", "Mission")}</p>
              <h3 className="mt-3 text-2xl font-900 leading-tight">
                {t(locale, "Đúng người — đúng hạn — đúng chất lượng", "Right people — on time — at the right quality")}
              </h3>
              <p className="mt-3 text-base leading-8 text-green-50">
                {t(locale,
                  "Không bán hàng xong rồi thôi — ITSOL ở lại cùng khách hàng.",
                  "Serve customers with kindness."
                )}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section bg-light">
        <div className="container-page">
          <SectionTitle eyebrow={t(locale, "Hành trình", "Our Journey")} title={t(locale, "17+ năm hình thành và phát triển", "17+ years of growth")} />
          <div className="mx-auto max-w-2xl">
            {timeline.map((item, i) => (
              <motion.div key={item.year} initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="timeline-item mb-8"
              >
                <span className="text-xs font-900 uppercase tracking-widest text-brand-blue">{item.year}</span>
                <p className="mt-1 font-600 text-navy">{locale === "vi" ? item.vi : item.en}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section bg-white">
        <div className="container-page">
          <SectionTitle eyebrow={t(locale, "Giá trị cốt lõi", "Core Values")} title={t(locale, "Những giá trị định hình ITSOL", "Values that define ITSOL")} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {values.map((v, i) => (
              <motion.div key={v.en} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="card p-6 text-center"
              >
                <div className="text-4xl">{v.icon}</div>
                <h3 className="mt-3 font-900 text-navy">{locale === "vi" ? v.vi : v.en}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{v.desc[locale]}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="section bg-light">
        <div className="container-page">
          <SectionTitle eyebrow={t(locale, "Lãnh đạo", "Leadership")} title={t(locale, "Đội ngũ lãnh đạo ITSOL", "ITSOL Leadership")} />
          <div className="-mx-5 overflow-x-auto px-5 pb-4 [scroll-snap-type:x_mandatory]">
            <div className="flex gap-5">
            {[
              { name: "Đỗ Cường", nameEn: "Do Cuong", role: { vi: "Chủ tịch HĐQT & Đồng sáng lập", en: "Chairman & Co-founder" }, photo: "/brand/ceo-photo.jpg", bio: { vi: "17+ năm dẫn dắt ITSOL từ công ty phần mềm nhỏ thành đối tác IT tin cậy của ngân hàng và doanh nghiệp lớn.", en: "17+ years building ITSOL into a trusted IT partner for banks and enterprises." }, color: "from-blue-700 to-cyan-500", email: contactInfo.email },
              { name: "Ngô Quang", nameEn: "Ngo Quang", role: { vi: "Giám đốc điều hành (COO)", en: "Chief Operating Officer" }, photo: null, bio: { vi: "Quản lý vận hành, delivery và nâng cao chất lượng dự án toàn công ty.", en: "Oversees operations, delivery excellence and quality across all projects." }, color: "from-emerald-600 to-teal-500", email: null },
              { name: "Bùi Nam", nameEn: "Bui Nam", role: { vi: "Giám đốc nhân sự (CHRM)", en: "Chief HR Manager" }, photo: null, bio: { vi: "Xây dựng đội ngũ và văn hóa ITSOL, tìm kiếm và phát triển nhân tài IT chất lượng cao.", en: "Builds ITSOL team and culture, sourcing and growing top IT talent." }, color: "from-orange-500 to-rose-400", email: null },
            ].map((person, i) => (
              <motion.div key={person.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="w-[310px] shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm [scroll-snap-align:start] sm:w-[360px]"
              >
                <div className={`relative h-48 w-full bg-gradient-to-br ${person.color}`}>
                  {person.photo ? (
                    <Image src={person.photo} alt={person.name} fill className="object-cover object-top" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="grid size-20 place-items-center rounded-full bg-white/20 text-white"><Users className="size-10" /></div>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="inline-block rounded-full bg-black/30 px-3 py-1 text-xs font-800 text-white backdrop-blur-sm">
                      {locale === "vi" ? person.role.vi : person.role.en}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-900 text-navy">{locale === "vi" ? person.name : person.nameEn}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{locale === "vi" ? person.bio.vi : person.bio.en}</p>
                  {person.email ? (
                    <a href={`mailto:${person.email}`} className="mt-3 inline-flex items-center gap-1.5 text-xs font-700 text-brand-blue hover:underline">
                      <Mail className="size-3.5" /> {person.email}
                    </a>
                  ) : null}
                </div>
              </motion.div>
            ))}
            </div>
          </div>
        </div>
      </section>

      <ContactCTA locale={locale} />
    </>
  );
}

// ─── Services Page ────────────────────────────────────────────────
function Services({ locale }: { locale: Locale }) {
  return (
    <>
      <section className="hero-gradient pb-20 pt-32 text-white">
        <div className="container-page text-center">
          <span className="eyebrow text-orange">{t(locale, "Dịch vụ", "Services")}</span>
          <h1 className="mt-3 text-4xl font-900 md:text-6xl">{t(locale, "Giải pháp IT toàn diện", "End-to-end IT solutions")}</h1>
        </div>
      </section>
      <section className="section bg-light">
        <div className="container-page">
          <div className="grid gap-6 md:grid-cols-2">
            {services.map((svc, i) => {
              const icons = [Users, Code2, Globe2, Rocket];
              const Icon = icons[i] ?? Code2;
              return (
                <Link key={svc.slug} href={lp(svc.href, locale)} className="card group block p-8">
                  <div className="flex items-center gap-4">
                    <div className="grid size-14 place-items-center rounded-xl bg-cyan-50 text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
                      <Icon className="size-7" />
                    </div>
                    {svc.badge && <span className="badge-hot">{svc.badge}</span>}
                  </div>
                  <h3 className="mt-5 text-2xl font-900 text-navy">{svc.title[locale]}</h3>
                  <p className="mt-3 leading-8 text-slate-600">{svc.summary[locale]}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {svc.points.map((p: string) => <span key={p} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-600 text-slate-600">{p}</span>)}
                  </div>
                  <div className="mt-6 flex items-center gap-2 font-700 text-brand-blue">
                    {t(locale, "Tìm hiểu thêm", "Learn more")} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      <ContactCTA locale={locale} />
    </>
  );
}

// ─── Staffing Upload Form ───────────────────────────────────────
function StaffingUploadForm({ locale }: { locale: Locale }) {
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    try {
      const formData = new FormData(e.currentTarget);
      const res = await fetch("/api/staffing/upload", { method: "POST", body: formData });
      if (res.ok) {
        setState("success");
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error ?? "Upload failed");
        setState("error");
      }
    } catch {
      setErrorMsg("Network error");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="card p-8 text-center">
        <div className="text-4xl">✅</div>
        <h3 className="mt-4 text-xl font-800 text-navy">{t(locale, "Gửi thành công!", "Uploaded successfully!")}</h3>
        <p className="mt-2 text-sm text-slate-600">{t(locale, "ITSOL sẽ liên hệ trong vòng 24 giờ làm việc.", "ITSOL will contact you within 24 business hours.")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-8">
      <h3 className="mb-6 text-lg font-800 text-navy">{t(locale, "Upload yêu cầu của bạn", "Upload your request")}</h3>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="grid gap-1">
          <label className="text-sm font-700 text-slate-700">{t(locale, "Tên công ty", "Company Name")} <span className="text-red-500">*</span></label>
          <input name="companyName" required className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-100" />
        </div>
        <div className="grid gap-1">
          <label className="text-sm font-700 text-slate-700">Email <span className="text-red-500">*</span></label>
          <input name="email" type="email" required className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-100" />
        </div>
        <div className="grid gap-1">
          <label className="text-sm font-700 text-slate-700">{t(locale, "Số điện thoại", "Phone")}</label>
          <input name="phone" className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-100" />
        </div>
        <div className="grid gap-1">
          <label className="text-sm font-700 text-slate-700">
            {t(locale, "File yêu cầu (.xlsx/.xls/.csv)", "Request file (.xlsx/.xls/.csv)")}
            <span className="text-red-500"> *</span>
          </label>
          <input
            name="file"
            type="file"
            accept=".xlsx,.xls,.csv"
            required
            className="min-h-11 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-brand-blue file:px-3 file:py-1 file:text-xs file:font-700 file:text-white"
          />
        </div>
      </div>
      {state === "error" && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-600 text-red-600">{errorMsg}</p>
      )}
      <button
        type="submit"
        disabled={state === "sending"}
        className="btn btn-primary mt-6 w-full justify-center text-base disabled:opacity-60"
      >
        {state === "sending" ? t(locale, "Đang gửi...", "Uploading...") : t(locale, "Gửi yêu cầu", "Submit Request")}
        <Send className="size-4" />
      </button>
    </form>
  );
}

// ─── Staffing Page ────────────────────────────────────────────────
function Staffing({ locale }: { locale: Locale }) {
  const [filter, setFilter] = useState("All");
  const [formState, setFormState] = useState<SubmitState>("idle");
  const [talents, setTalents] = useState<Talent[]>([]);
  const [talentFilter, setTalentFilter] = useState("All");
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);

  useEffect(() => {
    fetch("/api/talents").then(r => r.json()).then(d => setTalents(Array.isArray(d) ? d : (d.talents ?? []))).catch(() => {});
  }, []);

  const models = [
    { en: "Onsite", vi: "Onsite", icon: Building2, desc: { en: "Work at client's office", vi: "Làm việc tại văn phòng khách hàng" } },
    { en: "Remote", vi: "Remote", icon: Globe2, desc: { en: "Work from ITSOL's office", vi: "Làm việc từ xa" } },
    { en: "Hybrid", vi: "Hybrid", icon: Layers3, desc: { en: "Mix of onsite and remote", vi: "Kết hợp onsite và remote" } },
    { en: "Dedicated Team", vi: "Dedicated Team", icon: Users, desc: { en: "Full team allocation", vi: "Đội ngũ chuyên trách" } },
    { en: "ODC", vi: "ODC", icon: Building2, desc: { en: "Offshore development center", vi: "Trung tâm phát triển offshore" } },
    { en: "Contract-to-Hire", vi: "Contract-to-Hire", icon: FileText, desc: { en: "Trial before permanent hire", vi: "Thử việc trước khi tuyển chính thức" } },
  ];

  const roles = staffingRoles;
  const categories = ["All", "Developer", "Testing", "Management", "DevOps/AI"];
  const filteredRoles = filter === "All" ? roles : roles.filter(r => {
    if (filter === "Developer") return r.includes("Developer") || r.includes("Full-stack") || r.includes("Android") || r.includes("Java") || r.includes(".NET") || r.includes("PHP") || r.includes("C/C");
    if (filter === "Testing") return r.includes("Test") || r.includes("QA") || r.includes("QC");
    if (filter === "Management") return r.includes("Manager") || r.includes("BA") || r.includes("Scrum") || r.includes("Architect") || r.includes("BrSE") || r.includes("Comtor");
    if (filter === "DevOps/AI") return r.includes("DevOps") || r.includes("AI") || r.includes("Data");
    return true;
  });

  const filteredTalents = talentFilter === "All" ? talents : talents.filter(t => t.role.includes(talentFilter));

  return (
    <>
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden pb-24 pt-32 text-white">
        <div className="hero-grid-overlay" />
        <div className="absolute inset-x-0 top-0 h-1 brand-bar" />
        <div className="pointer-events-none absolute -right-20 top-0 size-96 rounded-full opacity-15 blur-3xl" style={{ background: "radial-gradient(circle, #7DC338 0%, transparent 70%)" }} />
        <div className="container-page relative grid gap-12 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <span className="eyebrow" style={{ color: "#29ABE2" }}>IT Staffing</span>
            <h1 className="mt-3 text-4xl font-900 md:text-6xl">
              {t(locale, "Thuê IT Talent đã được sàng lọc nhanh hơn", "Hire vetted IT talents faster with ITSOL")}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-cyan-100">
              {t(locale,
                "Không như các công ty tuyển dụng thông thường, ITSOL sàng lọc kỹ thuật mỗi ứng viên bằng đội senior engineers nội bộ trước khi giới thiệu. Bạn chỉ gặp người đã đủ tiêu chuẩn.",
                "Unlike typical recruitment firms, ITSOL pre-screens every candidate with our in-house senior engineers. You only meet people who've already passed the technical bar."
              )}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#staffing-form" className="btn btn-primary">
                {t(locale, "Gửi yêu cầu nhân sự", "Submit Staffing Request")}
                <ArrowRight className="size-4" />
              </a>
              <a href="#talent-pool" className="btn btn-outline-white">
                {t(locale, "Xem Talent Pool", "View Talent Pool")}
              </a>
            </div>
          </div>
          <HeroDashboard locale={locale} />
        </div>
      </section>

      {/* Staffing Models */}
      <section className="section bg-light">
        <div className="container-page">
          <SectionTitle eyebrow={t(locale, "Mô hình cung cấp", "Staffing Models")} title={t(locale, "6 mô hình linh hoạt", "6 flexible models")} />
          {/* Mobile + Desktop: 3-row grid (2 per row on mobile, 3 on lg) */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 sm:hidden">
            {[
              { en: "Onsite",          vi: "Onsite",          icon: Building2, color: "from-blue-600 to-cyan-500",     emoji: "🏢", descVi: "Làm việc tại văn phòng khách hàng",        descEn: "Work at client’s office" },
              { en: "Remote",          vi: "Remote",          icon: Globe2,    color: "from-violet-600 to-blue-500",  emoji: "🌍", descVi: "Làm việc toàn bộ từ xa",                   descEn: "Fully remote work" },
              { en: "Hybrid",          vi: "Hybrid",          icon: Layers3,   color: "from-pink-500 to-rose-400",   emoji: "🔄", descVi: "Kết hợp onsite và remote linh hoạt",       descEn: "Flexible onsite – remote mix" },
              { en: "Dedicated Team",  vi: "Dedicated Team",  icon: Users,     color: "from-orange-500 to-amber-400", emoji: "👥", descVi: "Đội ngũ chuyên trách toàn thời gian",       descEn: "Full-time dedicated squad" },
              { en: "ODC",             vi: "ODC",             icon: Building2, color: "from-emerald-600 to-teal-400", emoji: "🏗️", descVi: "Trung tâm kỹ sư offshore riêng",           descEn: "Your own offshore center" },
              { en: "Contract-to-Hire",vi: "Contract-to-Hire",icon: FileText,  color: "from-slate-700 to-slate-500",  emoji: "📄", descVi: "Thử việc trước khi tuyển chính thức",       descEn: "Trial before permanent hire" },
            ].map((m, i) => (
              <motion.div key={m.en}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className={`rounded-2xl bg-gradient-to-br ${m.color} p-4 text-white shadow-md`}
              >
                <div className="text-2xl">{m.emoji}</div>
                <h3 className="mt-2 text-sm font-900 leading-tight">{locale === "vi" ? m.vi : m.en}</h3>
                <p className="mt-1.5 text-xs leading-4 text-white/75">{locale === "vi" ? m.descVi : m.descEn}</p>
              </motion.div>
            ))}
          </div>
          {/* Desktop: premium gradient cards */}
          <div className="hidden gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-3">
            {([
              { en: "Onsite",           vi: "Onsite",           icon: Building2, from: "#003087", to: "#0057D9", emoji: "🏢", stat: "100%", statLabel: { vi: "tại văn phòng KH", en: "at client office" }, descVi: "Kỹ sư làm việc trực tiếp tại văn phòng khách hàng, hòa nhập đội ngũ nội bộ.", descEn: "Engineers embedded at client site, fully integrated with in-house teams." },
              { en: "Remote",           vi: "Remote",           icon: Globe2,    from: "#6D28D9", to: "#3B82F6", emoji: "🌍", stat: "GMT±0", statLabel: { vi: "timezone linh hoạt", en: "flexible timezone" }, descVi: "Kỹ sư làm việc từ xa toàn bộ, cam kết giờ làm việc và daily stand-up.", descEn: "Fully remote with fixed working hours, daily stand-up and transparent comms." },
              { en: "Hybrid",           vi: "Hybrid",           icon: Layers3,   from: "#DB2777", to: "#F97316", emoji: "🔄", stat: "2–3×", statLabel: { vi: "onsite/tuần", en: "onsite/week" }, descVi: "Kết hợp linh hoạt giữa onsite và remote theo nhu cầu từng sprint.", descEn: "Flexible onsite–remote split adapted to sprint needs." },
              { en: "Dedicated Team",   vi: "Dedicated Team",   icon: Users,     from: "#D97706", to: "#F59E0B", emoji: "👥", stat: "3–20+", statLabel: { vi: "kỹ sư/đội", en: "engineers/team" }, descVi: "Đội ngũ chuyên trách toàn thời gian — BA, Dev, QA, PM — dưới sự điều hành của bạn.", descEn: "Full-time squad — BA, Dev, QA, PM — under your direct management." },
              { en: "ODC",              vi: "ODC",              icon: Building2, from: "#059669", to: "#14B8A6", emoji: "🏗️", stat: "BOT", statLabel: { vi: "Build · Operate · Transfer", en: "Build · Operate · Transfer" }, descVi: "Trung tâm kỹ sư offshore của riêng bạn tại Việt Nam — từ hạ tầng đến tuyển dụng.", descEn: "Your own offshore engineering center in Vietnam — from infra to hiring." },
              { en: "Contract-to-Hire", vi: "Contract-to-Hire", icon: FileText,  from: "#374151", to: "#6B7280", emoji: "📄", stat: "0", statLabel: { vi: "rủi ro tuyển dụng", en: "hiring risk" }, descVi: "Thử việc qua dự án thực tế trước khi chuyển sang hợp đồng chính thức.", descEn: "Real-project trial before full permanent hire — zero hiring risk." },
            ] as const).map((m, i) => (
              <motion.div key={m.en} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.09 }}
                className="group relative overflow-hidden rounded-2xl p-6 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
                style={{ background: `linear-gradient(135deg, ${m.from} 0%, ${m.to} 100%)` }}
              >
                {/* Subtle grid overlay */}
                <div className="pointer-events-none absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)", backgroundSize: "24px 24px" }} />
                <div className="relative flex items-start justify-between">
                  <div className="grid size-12 place-items-center rounded-xl bg-white/15 text-2xl backdrop-blur-sm">{m.emoji}</div>
                  <div className="text-right">
                    <div className="text-xl font-900 leading-none">{m.stat}</div>
                    <div className="mt-0.5 text-[10px] font-600 leading-tight text-white/70">{locale === "vi" ? m.statLabel.vi : m.statLabel.en}</div>
                  </div>
                </div>
                <h3 className="relative mt-4 text-lg font-900 leading-tight">{locale === "vi" ? m.vi : m.en}</h3>
                <p className="relative mt-2 text-sm leading-6 text-white/80">{locale === "vi" ? m.descVi : m.descEn}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section className="section bg-white">
        <div className="container-page">
          <SectionTitle eyebrow={t(locale, "Quy trình", "Process")} title={t(locale, "8 bước staffing chuyên nghiệp", "8-step professional staffing process")} />
          {/* Mobile: vertical timeline */}
          <div className="relative sm:hidden">
            <div className="absolute left-5 top-0 h-full w-0.5 bg-gradient-to-b from-brand-blue via-cyan-400 to-emerald-400" />
            <div className="flex flex-col gap-0">
              {staffingProcess.map((step, i) => (
                <motion.div key={step.en}
                  initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="relative flex items-start gap-4 pb-6"
                >
                  <div className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-blue to-cyan-400 text-sm font-900 text-white shadow-lg ring-4 ring-white">
                    {i + 1}
                  </div>
                  <div className="mt-1.5 flex-1 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
                    <p className="text-sm font-800 text-navy">{locale === "vi" ? step.vi : step.en}</p>
                    {i === 2 && <span className="mt-1 inline-block rounded-full bg-cyan-50 px-2 py-0.5 text-xs font-700 text-brand-blue">AI matching</span>}
                    {i === 3 && <span className="mt-1 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-700 text-emerald-600">{t(locale, "Senior engineers", "Senior engineers")}</span>}
                    {i === 4 && <span className="mt-1 inline-block rounded-full bg-orange-50 px-2 py-0.5 text-xs font-700 text-orange-600">3–5 {t(locale, "ngày", "days")}</span>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          {/* Desktop: 2-row pipeline timeline */}
          {(() => {
            const badges: Record<number, { label: string; color: string }> = {
              2: { label: "AI matching", color: "bg-violet-100 text-violet-700" },
              3: { label: locale === "vi" ? "Senior engineers" : "Senior engineers", color: "bg-cyan-100 text-cyan-700" },
              4: { label: locale === "vi" ? "3–5 ngày" : "3–5 days", color: "bg-orange-100 text-orange-700" },
              6: { label: locale === "vi" ? "Được bảo hành" : "Guaranteed", color: "bg-emerald-100 text-emerald-700" },
            };
            const STEP_ICONS = ["📥","🔍","⚡","🛡️","📤","🤝","📄","📊"];
            const row1 = staffingProcess.slice(0, 4);
            const row2 = staffingProcess.slice(4, 8);
            return (
              <div className="hidden sm:block space-y-3">
                {[row1, row2].map((row, rowIdx) => (
                  <div key={rowIdx} className="relative grid grid-cols-4 gap-0">
                    {/* Connector line */}
                    <div className="pointer-events-none absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-brand-blue via-cyan-400 to-brand-blue/40" />
                    {row.map((step, idx) => {
                      const globalIdx = rowIdx * 4 + idx;
                      const badge = badges[globalIdx];
                      return (
                        <motion.div key={step.en}
                          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: globalIdx * 0.07 }}
                          className="group flex flex-col items-center px-3 pb-1 pt-0"
                        >
                          {/* Circle */}
                          <div className="relative z-10 flex size-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-white shadow-md ring-2 ring-brand-blue/20 group-hover:ring-brand-blue/60 transition">
                            <span className="text-xl">{STEP_ICONS[globalIdx]}</span>
                            <span className="text-[10px] font-900 text-brand-blue">{globalIdx + 1}</span>
                          </div>
                          {/* Label */}
                          <div className="mt-3 text-center">
                            <p className="text-sm font-800 text-navy leading-snug">{locale === "vi" ? step.vi : step.en}</p>
                            {badge && (
                              <span className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-700 ${badge.color}`}>{badge.label}</span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </section>

      {/* Roles */}
      <section className="section bg-light">
        <div className="container-page">
          <SectionTitle eyebrow={t(locale, "Vị trí", "Roles")} title={t(locale, "20+ vị trí IT đa dạng", "20+ diverse IT roles")} />
          <div className="mb-6 flex flex-wrap gap-2">
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-700 transition-all ${filter === cat ? "bg-brand-blue text-white shadow" : "border border-slate-200 text-slate-600 hover:border-brand-blue"}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2.5">
            {filteredRoles.map(role => (
              <span key={role} className="card px-4 py-2 text-sm font-600 text-navy hover:border-brand-blue hover:text-brand-blue transition-colors cursor-default">
                {role}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="section bg-white">
        <div className="container-page">
          <SectionTitle eyebrow="Technologies" title={t(locale, "Tech stack đa dạng", "Broad technology stack")} />
          <div className="flex flex-wrap gap-2.5">
            {technologies.map(tech => (
              <span key={tech} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-700 text-slate-700 shadow-sm">{tech}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Why ITSOL */}
      <section className="section bg-light">
        <div className="container-page">
          <SectionTitle eyebrow={t(locale, "Tại sao chọn ITSOL", "Why ITSOL")} title={t(locale, "Lợi thế cạnh tranh", "Competitive advantages")} />
          {/* Mobile: stacked bold cards */}
          <div className="flex flex-col gap-4 sm:hidden">
            {[
              { icon: ShieldCheck, color: "bg-blue-600",    stat: "IT only", title: t(locale, "Chuyên biệt IT", "IT-only staffing"),      desc: t(locale, "Chỉ tập trung vào nhân sự IT, không đa ngành", "Specialized in IT only, not multi-industry") },
              { icon: Zap,         color: "bg-orange-500",  stat: "3–5 days", title: t(locale, "Shortlist nhanh", "Fast shortlist"),         desc: t(locale, "Shortlist trong 3-5 ngày làm việc", "Shortlist in 3-5 business days") },
              { icon: CheckCircle2,color: "bg-emerald-600", stat: "Free",    title: t(locale, "Cam kết thay thế", "Replacement guarantee"), desc: t(locale, "Thay thế miễn phí nếu nhân sự không phù hợp", "Free replacement if talent doesn't fit") },
              { icon: Star,        color: "bg-yellow-500",  stat: "10×",     title: t(locale, "17 năm uy tín", "17 years of trust"),       desc: t(locale, "10 năm liên tiếp Sao Khuê & Top 10 Vietnam ICT", "10 consecutive years Sao Khuê & Top 10 Vietnam ICT") },
            ].map((item, i) => (
              <motion.div key={item.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm border border-slate-100"
              >
                <div className={`grid size-14 shrink-0 place-items-center rounded-2xl ${item.color} text-white shadow`}>
                  <item.icon className="size-7" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-900 text-navy">{item.title}</h3>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-800 text-slate-600">{item.stat}</span>
                  </div>
                  <p className="mt-1 text-sm leading-5 text-slate-500">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          {/* Desktop: grid */}
          <div className="hidden gap-5 sm:grid md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ShieldCheck, color: "bg-blue-600",    title: t(locale, "Chuyên biệt IT", "IT-only staffing"),      desc: t(locale, "Chỉ tập trung vào nhân sự IT, không đa ngành", "Specialized in IT only, not multi-industry") },
              { icon: Zap,         color: "bg-orange-500",  title: t(locale, "Shortlist nhanh", "Fast shortlist"),         desc: t(locale, "Shortlist trong 3-5 ngày làm việc", "Shortlist in 3-5 business days") },
              { icon: CheckCircle2,color: "bg-emerald-600", title: t(locale, "Cam kết thay thế", "Replacement guarantee"), desc: t(locale, "Thay thế miễn phí nếu nhân sự không phù hợp", "Free replacement if talent doesn't fit") },
              { icon: Star,        color: "bg-yellow-500",  title: t(locale, "17 năm uy tín", "17 years of trust"),       desc: t(locale, "10 năm liên tiếp Sao Khuê & Top 10 Vietnam ICT", "10 consecutive years Sao Khuê & Top 10 Vietnam ICT") },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="card p-6"
              >
                <div className={`grid size-12 place-items-center rounded-xl ${item.color} text-white`}>
                  <item.icon className="size-6" />
                </div>
                <h3 className="mt-4 font-800 text-navy">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Talent Pool */}
      <section id="talent-pool" className="section bg-white">
        <div className="container-page">
          <SectionTitle eyebrow="Talent Pool" title={t(locale, "Xem talent pool", "Browse talent pool")} />
          {talents.length === 0 ? (
            <div className="card p-12 text-center">
              <Users className="mx-auto mb-4 size-12 text-slate-300" />
              <p className="text-slate-500">{t(locale, "Đang tải talent pool...", "Loading talent pool...")}</p>
            </div>
          ) : (
            <>
              <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-2">
                {["All", ...Array.from(new Set(talents.map(t => t.role))).slice(0, 8)].map(r => (
                  <button key={r} onClick={() => setTalentFilter(r)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-700 transition-all ${talentFilter === r ? "bg-brand-blue text-white" : "border border-slate-200 text-slate-600"}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTalents.slice(0, 9).map(talent => (
                  <div key={talent.id} className="card p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="grid size-10 place-items-center rounded-xl bg-cyan-50 text-base font-900 text-brand-blue">
                        {talent.code.slice(0, 2)}
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-800 ${talent.status === "Available" ? "bg-emerald-50 text-emerald-700" : talent.status === "Interviewing" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                        {talent.status}
                      </span>
                    </div>
                    {/* Show code prominently, not full name — privacy */}
                    <p className="mt-3 text-xs font-900 text-brand-blue tracking-wider">{talent.code}</p>
                    <h3 className="font-800 text-navy">{talent.role}</h3>
                    <p className="text-xs text-slate-500">{talent.seniority} · {talent.yearsExperience}y exp · {talent.location}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {skillList(talent.skills).slice(0, 4).map((s: string) => (
                        <span key={s} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-600 text-slate-600">{s}</span>
                      ))}
                    </div>
                    <div className="mt-2 flex gap-2 text-xs font-700 text-slate-500">
                      <span>🇬🇧 {talent.englishLevel}</span>
                      {talent.japaneseLevel !== "None" && <span>🇯🇵 {talent.japaneseLevel}</span>}
                    </div>
                    <button
                      onClick={() => setSelectedTalent(talent)}
                      className="btn btn-outline-navy mt-4 w-full justify-center border border-navy text-sm text-navy hover:bg-navy hover:text-white transition-colors"
                    >
                      {t(locale, "Xem hồ sơ", "View profile")}
                      <ArrowRight className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Staffing Request Form */}
      <section id="staffing-form" className="section bg-light">
        <div className="container-page">
          <SectionTitle
            eyebrow={t(locale, "Yêu cầu nhân sự", "Staffing Request")}
            title={t(locale, "Gửi yêu cầu nhân sự IT", "Submit your staffing request")}
            desc={t(locale, "Tải file mẫu, điền thông tin, rồi upload lên - ITSOL sẽ phản hồi trong vòng 24 giờ làm việc.", "Download the template, fill in your requirements, then upload - ITSOL will respond within 24 business hours.")}
          />
          <div className="mx-auto max-w-2xl">
            {/* Step guide */}
            <div className="mb-8 flex items-center justify-center gap-4 text-sm font-700">
              <span className="flex items-center gap-2 rounded-full bg-brand-blue/10 px-4 py-2 text-brand-blue">
                <span className="grid size-6 place-items-center rounded-full bg-brand-blue text-white text-xs">1</span>
                {t(locale, "Tải file mẫu", "Download template")}
              </span>
              <ChevronRight className="size-4 text-slate-400" />
              <span className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-slate-600">
                <span className="grid size-6 place-items-center rounded-full bg-slate-400 text-white text-xs">2</span>
                {t(locale, "Điền thông tin", "Fill in details")}
              </span>
              <ChevronRight className="size-4 text-slate-400" />
              <span className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-slate-600">
                <span className="grid size-6 place-items-center rounded-full bg-slate-400 text-white text-xs">3</span>
                {t(locale, "Upload lên", "Upload here")}
              </span>
            </div>

            {/* Download template */}
            <div className="card mb-6 flex items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-green-50">
                  <FileText className="size-5 text-green-600" />
                </div>
                <div>
                  <p className="font-800 text-navy">{t(locale, "File mẫu yêu cầu nhân sự", "Staffing Request Template")}</p>
                  <p className="text-xs text-slate-500">{t(locale, "staffing-request-template.xlsx • Excel", "staffing-request-template.xlsx • Excel")}</p>
                </div>
              </div>
              <a
                href="/templates/staffing-request-template.xlsx"
                download
                className="btn btn-primary shrink-0"
              >
                {t(locale, "Tải xuống", "Download")}
                <ArrowRight className="size-4" />
              </a>
            </div>

            {/* Upload form */}
            <StaffingUploadForm locale={locale} />
          </div>
        </div>
      </section>

      {/* Featured projects */}
      <ServiceProjectsSection locale={locale} serviceKey="staffing" />

      {/* Talent Profile Modal */}
      <AnimatePresence>
        {selectedTalent && (
          <motion.div
            key="talent-modal"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
            onClick={e => { if (e.target === e.currentTarget) setSelectedTalent(null); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-start justify-between bg-gradient-to-r from-navy to-[#0057D9] p-6 text-white">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="grid size-12 place-items-center rounded-xl bg-white/15 font-mono text-lg font-900 tracking-wider">
                      {selectedTalent.code.slice(0, 3)}
                    </div>
                    <div>
                      {/* Show code only — not full name (privacy) */}
                      <p className="text-xs font-700 text-cyan-200 tracking-widest">{selectedTalent.code}</p>
                      <h3 className="text-lg font-900">{selectedTalent.role}</h3>
                      <p className="text-sm text-cyan-100">{selectedTalent.seniority} · {selectedTalent.yearsExperience} {t(locale, "năm KN", "yrs exp")}</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedTalent(null)}
                  className="rounded-lg p-1.5 text-white/70 hover:bg-white/20 hover:text-white">
                  <X className="size-5" />
                </button>
              </div>

              {/* Body */}
              <div className="max-h-[65vh] space-y-4 overflow-y-auto p-6">
                {/* Status + location */}
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-800 ${
                    selectedTalent.status === "Available" ? "bg-emerald-50 text-emerald-700" :
                    selectedTalent.status === "Interviewing" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"
                  }`}>{selectedTalent.status}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-700 text-slate-600">📍 {selectedTalent.location}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-700 text-slate-600">🖥️ {selectedTalent.workingModel}</span>
                </div>

                {/* Summary */}
                {selectedTalent.summary && (
                  <div>
                    <p className="mb-1 text-xs font-800 uppercase tracking-wider text-slate-400">{t(locale, "Tóm tắt", "Summary")}</p>
                    <p className="text-sm leading-6 text-slate-700">{selectedTalent.summary}</p>
                  </div>
                )}

                {/* Skills */}
                <div>
                  <p className="mb-2 text-xs font-800 uppercase tracking-wider text-slate-400">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {skillList(selectedTalent.skills).map((s: string) => (
                      <span key={s} className="rounded-md border border-brand-blue/20 bg-cyan-50 px-2.5 py-0.5 text-xs font-700 text-brand-blue">{s}</span>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div className="flex gap-4">
                  <div className="rounded-xl bg-slate-50 px-4 py-3 text-center">
                    <p className="text-xs text-slate-400">🇬🇧 English</p>
                    <p className="mt-1 font-800 text-navy">{selectedTalent.englishLevel}</p>
                  </div>
                  {selectedTalent.japaneseLevel !== "None" && (
                    <div className="rounded-xl bg-slate-50 px-4 py-3 text-center">
                      <p className="text-xs text-slate-400">🇯🇵 Japanese</p>
                      <p className="mt-1 font-800 text-navy">{selectedTalent.japaneseLevel}</p>
                    </div>
                  )}
                  {selectedTalent.expectedRate && (
                    <div className="rounded-xl bg-slate-50 px-4 py-3 text-center">
                      <p className="text-xs text-slate-400">💰 Rate</p>
                      <p className="mt-1 text-sm font-800 text-emerald-700">{selectedTalent.expectedRate}</p>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <a href="#staffing-form" onClick={() => setSelectedTalent(null)}
                  className="btn btn-primary w-full justify-center">
                  {t(locale, "Ứng tuyển / Yêu cầu talent này", "Request this talent")}
                  <ArrowRight className="size-4" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Contact Page ─────────────────────────────────────────────────
function Contact({ locale }: { locale: Locale }) {
  const [formState, setFormState] = useState<SubmitState>("idle");
  return (
    <>
      <section className="hero-gradient pb-20 pt-32 text-white">
        <div className="container-page text-center">
          <span className="eyebrow text-orange">{t(locale, "Liên hệ", "Contact")}</span>
          <h1 className="mt-3 text-4xl font-900 md:text-6xl">{t(locale, "Hãy bắt đầu câu chuyện", "Let's start a conversation")}</h1>
        </div>
      </section>
      <section className="section bg-light">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">
          {/* Info */}
          <div className="flex flex-col gap-5">
            {[
              { icon: Mail, label: "Email", value: contactInfo.email, href: `mailto:${contactInfo.email}` },
              { icon: Phone, label: t(locale, "Điện thoại", "Phone"), value: contactInfo.phone, href: `tel:${contactInfo.phone}` },
              { icon: MapPin, label: t(locale, "Địa chỉ", "Address"), value: contactInfo.address, href: "" },
            ].map(item => (
              <div key={item.label} className="card flex items-start gap-4 p-5">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-cyan-50 text-brand-blue">
                  <item.icon className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-800 uppercase tracking-wider text-slate-500">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="mt-1 text-sm font-600 text-navy hover:text-brand-blue transition-colors">{item.value}</a>
                  ) : (
                    <p className="mt-1 text-sm font-600 text-navy">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
            <div className="card p-5">
              <p className="text-xs font-800 uppercase tracking-wider text-slate-500 mb-3">{t(locale, "Bản đồ", "Map")}</p>
              <div className="h-48 rounded-xl bg-slate-100 flex items-center justify-center">
                <p className="text-sm text-slate-400">{t(locale, "Cầu Giấy, Hà Nội", "Cau Giay, Ha Noi")}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={e => submitForm(e, "/api/contact", setFormState)} className="card p-8">
            <h3 className="mb-6 text-xl font-900 text-navy">{t(locale, "Gửi tin nhắn", "Send a message")}</h3>
            <div className="grid gap-5 md:grid-cols-2">
              <Field name="name" label={t(locale, "Họ tên", "Full Name")} required />
              <Field name="company" label={t(locale, "Công ty", "Company")} />
              <Field name="email" label="Email" type="email" required />
              <Field name="phone" label={t(locale, "Điện thoại", "Phone")} />
            </div>
            <Field name="service" label={t(locale, "Dịch vụ quan tâm", "Service interested")} className="mt-5"
              options={["IT Staffing", "Software Outsourcing", "ODC", "Product Development", "AI Solutions", "Other"]} />
            <Field name="message" label={t(locale, "Nội dung", "Message")} textarea required className="mt-5" />
            <FormStatus state={formState} locale={locale} />
            <button type="submit" disabled={formState === "sending" || formState === "success"} className="btn btn-primary mt-5 w-full justify-center disabled:opacity-60">
              {formState === "sending" ? t(locale, "Đang gửi...", "Sending...") : t(locale, "Gửi tin nhắn", "Send message")}
              <Send className="size-4" />
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

// ─── Awards Page ──────────────────────────────────────────────────
function Awards({ locale }: { locale: Locale }) {
  const awardList = [
    { year: "2015-2024", icon: "🏆", title: t(locale, "Sao Khuê Awards", "Sao Khuê Awards"), desc: t(locale, "10 năm liên tiếp - giải thưởng phần mềm uy tín nhất Việt Nam", "10 consecutive years - Vietnam's most prestigious software award") },
    { year: "2015-2024", icon: "🥇", title: t(locale, "Top 10 Vietnam ICT", "Top 10 Vietnam ICT"), desc: t(locale, "10 năm liên tiếp trong Top 10 công ty ICT hàng đầu Việt Nam", "10 consecutive years in Vietnam's Top 10 ICT companies") },
    { year: "2015", icon: "🌟", title: t(locale, "Sao Khuê - Staffing & Recruitment", "Sao Khuê - Staffing & Recruitment"), desc: t(locale, "Giải pháp tuyển dụng và cung cấp nhân lực IT xuất sắc", "Excellence in IT staffing and recruitment solutions") },
    { year: "2018", icon: "🏅", title: t(locale, "Sao Khuê Top 10 - Tư vấn Banking", "Sao Khuê Top 10 - Banking Consulting"), desc: t(locale, "Top 10 giải pháp tư vấn hệ thống ngân hàng", "Top 10 banking system consulting solution") },
  ];

  return (
    <>
      <section className="hero-gradient pb-20 pt-32 text-white">
        <div className="container-page text-center">
          <span className="eyebrow text-orange">{t(locale, "Giải thưởng", "Awards")}</span>
          <h1 className="mt-3 text-4xl font-900 md:text-6xl">{t(locale, "Được công nhận qua nhiều năm", "Recognized year after year")}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-cyan-100">
            {t(locale,
              "10 năm liên tiếp được vinh danh bởi Sao Khuê Awards và Top 10 Vietnam ICT.",
              "10 consecutive years honored by Sao Khuê Awards and Top 10 Vietnam ICT."
            )}
          </p>
        </div>
      </section>
      <section className="section bg-light">
        <div className="container-page">
          <div className="grid gap-6 md:grid-cols-2">
            {awardList.map((a, i) => (
              <motion.div key={a.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                className="award-card"
              >
                <div className="text-5xl">{a.icon}</div>
                <p className="mt-4 text-xs font-800 uppercase tracking-wider text-brand-blue">{a.year}</p>
                <h3 className="mt-2 text-xl font-900 text-navy">{a.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{a.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <AwardsSection locale={locale} />
    </>
  );
}

// ─── Policy ───────────────────────────────────────────────────────
function Policy({ locale }: { locale: Locale }) {
  const companyName = t(locale, companyInfo.nameVi, companyInfo.nameEn);
  const sections = [
    {
      id: "privacy",
      title: t(locale, "1. Chính sách bảo mật thông tin", "1. Privacy Policy"),
      items: [
        t(locale,
          `${companyName} (“ITSOL”) thu thập các thông tin bạn chủ động cung cấp qua website như họ tên, email, số điện thoại, tên công ty, nội dung yêu cầu và hồ sơ ứng tuyển (CV).`,
          `${companyName} (“ITSOL”) collects information you voluntarily provide on this website, such as your name, email, phone number, company, request details and job applications (CVs).`),
        t(locale,
          "Thông tin được sử dụng để phản hồi yêu cầu tư vấn, báo giá, xử lý hồ sơ tuyển dụng, gửi bản tin khi bạn đăng ký và cải thiện chất lượng dịch vụ.",
          "Information is used to respond to consultation and quotation requests, process job applications, send newsletters you subscribe to and improve our services."),
        t(locale,
          "ITSOL không bán, trao đổi hay cho thuê thông tin cá nhân cho bên thứ ba. Thông tin chỉ được chia sẻ khi có sự đồng ý của bạn hoặc theo yêu cầu của cơ quan nhà nước có thẩm quyền.",
          "ITSOL does not sell, trade or rent personal data to third parties. Data is shared only with your consent or when required by competent authorities."),
        t(locale,
          "Dữ liệu được lưu trữ trên hệ thống có kiểm soát truy cập và chỉ được lưu trong thời gian cần thiết cho mục đích thu thập hoặc theo quy định pháp luật.",
          "Data is stored on access-controlled systems and retained only as long as necessary for its purpose or as required by law."),
      ],
    },
    {
      id: "personal-data",
      title: t(locale, "2. Quyền của chủ thể dữ liệu", "2. Data Subject Rights"),
      items: [
        t(locale,
          "Theo Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân, bạn có quyền được biết, đồng ý hoặc rút lại sự đồng ý, truy cập, chỉnh sửa, yêu cầu xóa và hạn chế xử lý dữ liệu cá nhân của mình.",
          "Under Decree 13/2023/ND-CP on personal data protection, you have the right to be informed, to consent or withdraw consent, and to access, correct, delete or restrict the processing of your personal data."),
        t(locale,
          `Để thực hiện các quyền này, vui lòng liên hệ ${contactInfo.email} hoặc tổng đài ${companyInfo.hotline}. ITSOL sẽ phản hồi trong thời hạn theo quy định pháp luật.`,
          `To exercise these rights, contact ${contactInfo.email} or call ${companyInfo.hotline}. ITSOL will respond within the time limits required by law.`),
      ],
    },
    {
      id: "terms",
      title: t(locale, "3. Điều khoản sử dụng website", "3. Terms of Use"),
      items: [
        t(locale,
          "Nội dung trên website (văn bản, hình ảnh, logo, tài liệu) thuộc quyền sở hữu của ITSOL hoặc đối tác được cấp phép. Mọi hình thức sao chép, sử dụng cho mục đích thương mại cần có sự đồng ý bằng văn bản của ITSOL.",
          "Website content (text, images, logos, documents) is owned by ITSOL or its licensors. Any copying or commercial use requires ITSOL's written consent."),
        t(locale,
          "Người dùng cam kết cung cấp thông tin chính xác và không sử dụng website cho các hành vi vi phạm pháp luật, phát tán mã độc hoặc gây ảnh hưởng đến hoạt động của hệ thống.",
          "Users agree to provide accurate information and not to use the website for unlawful acts, distributing malware or disrupting the system."),
        t(locale,
          "Thông tin trên website mang tính tham khảo. Phạm vi, chi phí và điều kiện dịch vụ cụ thể được xác định trong hợp đồng ký kết giữa ITSOL và khách hàng.",
          "Website information is for reference. Specific scope, pricing and service terms are defined in the contract between ITSOL and the client."),
      ],
    },
    {
      id: "cookies",
      title: t(locale, "4. Cookie", "4. Cookies"),
      items: [
        t(locale,
          "Website sử dụng cookie và bộ nhớ trình duyệt để ghi nhớ lựa chọn ngôn ngữ, giao diện và đo lường lượt truy cập. Bạn có thể tắt cookie trong cài đặt trình duyệt; một số tính năng có thể không hoạt động đầy đủ.",
          "The website uses cookies and browser storage to remember language and display preferences and to measure traffic. You can disable cookies in your browser settings; some features may not work fully."),
      ],
    },
    {
      id: "changes",
      title: t(locale, "5. Thay đổi chính sách", "5. Policy Changes"),
      items: [
        t(locale,
          "ITSOL có thể cập nhật chính sách này theo thời gian. Phiên bản mới có hiệu lực kể từ khi được đăng tải trên trang này.",
          "ITSOL may update this policy from time to time. The new version takes effect once published on this page."),
      ],
    },
  ];

  return (
    <>
      <SimpleHero
        locale={locale}
        eyebrow={t(locale, "Chính sách", "Policies")}
        title={t(locale, "Chính sách & Điều khoản", "Policies & Terms")}
        desc={t(locale,
          "Cách ITSOL thu thập, sử dụng và bảo vệ thông tin của bạn khi sử dụng website.",
          "How ITSOL collects, uses and protects your information when you use this website."
        )}
      />
      <section className="section bg-light">
        <div className="container-page grid gap-10 lg:grid-cols-[240px_1fr]">
          <nav className="hidden lg:block">
            <ul className="sticky top-28 flex flex-col gap-2 text-sm font-600 text-slate-600">
              {sections.map(s => (
                <li key={s.id}><a href={`#${s.id}`} className="hover:text-brand-blue transition-colors">{s.title}</a></li>
              ))}
            </ul>
          </nav>
          <div className="flex flex-col gap-8">
            {sections.map(s => (
              <article key={s.id} id={s.id} className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
                <h2 className="text-xl font-900 text-navy">{s.title}</h2>
                <ul className="mt-4 flex flex-col gap-3 text-sm leading-7 text-slate-600">
                  {s.items.map(item => (
                    <li key={item} className="flex gap-3">
                      <CheckCircle2 className="mt-1 size-4 shrink-0 text-brand-blue" />{item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
            <article className="rounded-2xl border border-slate-200 bg-white p-6 text-sm leading-7 text-slate-600 md:p-8">
              <h2 className="text-xl font-900 text-navy">{t(locale, "Thông tin liên hệ", "Contact")}</h2>
              <p className="mt-4 font-700 text-navy">{companyName}</p>
              <p>{t(locale, "Mã số doanh nghiệp", "Business code")}: {companyInfo.taxCode} — {t(locale, "cấp ngày", "issued on")} {companyInfo.issuedDate}</p>
              <p>{t(locale, "Địa chỉ", "Address")}: {t(locale, companyInfo.addressVi, companyInfo.addressEn)}</p>
              <p>{t(locale, "Điện thoại", "Phone")}: {companyInfo.hotline} — Email: {contactInfo.email}</p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}

// ─── Generic page shells ──────────────────────────────────────────
function SimpleHero({ eyebrow, title, desc, locale: _locale }: { eyebrow: string; title: string; desc?: string; locale: Locale }) {
  return (
    <section className="hero-gradient relative overflow-hidden pb-20 pt-32 text-white">
      <div className="hero-grid-overlay" />
      {/* Brand 3-color top accent bar */}
      <div className="absolute inset-x-0 top-0 h-1 brand-bar" />
      <div className="container-page relative text-center">
        <span className="eyebrow" style={{ color: "#29ABE2", letterSpacing: "0.25em" }}>{eyebrow}</span>
        <h1 className="mt-3 text-4xl font-900 leading-tight md:text-5xl">{title}</h1>
        {desc && <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-blue-100/80">{desc}</p>}
      </div>
    </section>
  );
}

function Industries({ locale }: { locale: Locale }) {
  const icons = [Building2, Layers3, Globe2, Network, Bot, Database, Cpu, Shield, FileText, BarChart3];
  return (
    <>
      <SimpleHero locale={locale} eyebrow={t(locale, "Ngành dọc", "Industries")} title={t(locale, "Chuyên môn theo ngành", "Industry expertise")} />
      <section className="section bg-light">
        <div className="container-page grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((ind, i) => {
            const Icon = icons[i] ?? Globe2;
            return (
              <motion.div key={ind.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="card p-6"
              >
                <div className="grid size-12 place-items-center rounded-xl bg-cyan-50 text-brand-blue">
                  <Icon className="size-6" />
                </div>
                <h3 className="mt-4 text-lg font-800 text-navy">{ind.name[locale]}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{ind.desc[locale]}</p>
              </motion.div>
            );
          })}
        </div>
      </section>
      <ContactCTA locale={locale} />
    </>
  );
}

function CaseStudies({ locale }: { locale: Locale }) {
  return (
    <>
      <SimpleHero locale={locale} eyebrow="Case Studies" title={t(locale, "Dự án tiêu biểu", "Featured projects")} />
      <section className="section bg-light">
        <div className="container-page grid gap-6 md:grid-cols-2">
          {caseStudies.map((cs, i) => (
            <motion.div key={cs.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="card overflow-hidden"
            >
              <div className="h-2 bg-gradient-to-r from-brand-blue to-green" />
              <div className="p-7">
                <p className="text-xs font-800 uppercase tracking-wider text-brand-blue">{cs.industry[locale]}</p>
                <h3 className="mt-2 text-xl font-800 text-navy">{cs.title[locale]}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{cs.summary[locale]}</p>
                <div className="mt-5 grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-3">
                  {cs.results.map(r => (
                    <div key={r.label} className="rounded-lg bg-white px-3 py-4 text-center shadow-sm">
                      <p className="text-lg font-900 leading-none text-navy">{r.value}</p>
                      <p className="mt-1 text-xs leading-4 text-slate-500">{r.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {cs.tech.map(t => <span key={t} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-600 text-slate-600">{t}</span>)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      <ContactCTA locale={locale} />
    </>
  );
}

function Insights({ locale }: { locale: Locale }) {
  const [posts, setPosts] = useState<Array<{ slug: string; titleVi: string; titleEn: string; excerptVi: string; excerptEn: string; contentVi?: string; contentEn?: string; category: string; createdAt: string }>>([]);
  useEffect(() => { fetch("/api/posts").then(r => r.json()).then(d => setPosts(Array.isArray(d) ? d : (d.posts ?? []))).catch(() => setPosts([])); }, []);
  return (
    <>
      <SimpleHero locale={locale} eyebrow="Insights" title={t(locale, "Bài viết & Kiến thức", "Blog & Insights")} />
      <section className="section bg-light">
        <div className="container-page">
          {posts.length === 0 ? (
            <div className="card p-12 text-center">
              <FileText className="mx-auto mb-4 size-12 text-slate-300" />
              <p className="text-slate-500">{t(locale, "Chưa có bài viết", "No posts yet")}</p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, i) => (
                <motion.div key={post.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="card overflow-hidden"
                >
                  <div className="h-1.5 bg-gradient-to-r from-brand-blue to-green" />
                  <div className="p-6">
                    <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-700 text-brand-blue">{post.category}</span>
                    <h3 className="mt-3 font-800 text-navy leading-tight">{locale === "vi" ? post.titleVi : post.titleEn}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600 line-clamp-3">{locale === "vi" ? (post.excerptVi || post.contentVi) : (post.excerptEn || post.contentEn)}</p>
                    <p className="mt-4 text-xs text-slate-400">{new Date(post.createdAt).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
      <ContactCTA locale={locale} />
    </>
  );
}

// ─── Job type for Careers page ───────────────────────────────────
type JobListing = { id: number; title: string; department: string; location: string; level: string; headcount?: number; description?: string; requirements?: string; benefits?: string; expiresAt?: string; };

function Careers({ locale }: { locale: Locale }) {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  // 'detail' = xem chi tiết, 'apply' = form nộp hồ sơ
  const [modalStep, setModalStep] = useState<"detail" | "apply">("detail");
  const [applyState, setApplyState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [applyError, setApplyError] = useState("");

  useEffect(() => {
    fetch("/api/careers/apply")
      .then(r => r.json())
      .then(d => setJobs(Array.isArray(d.jobs) ? d.jobs : []))
      .catch(() => setJobs([]))
      .finally(() => setJobsLoading(false));
  }, []);

  function openModal(job: JobListing) {
    setSelectedJob(job);
    setModalStep("detail");
    setApplyState("idle");
    setApplyError("");
  }

  function closeModal() {
    setSelectedJob(null);
    setModalStep("detail");
    setApplyState("idle");
    setApplyError("");
  }

  async function handleApply(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setApplyState("sending");
    try {
      const formData = new FormData(e.currentTarget);
      // Validate file size (≤ 5 MB)
      const file = formData.get("file") as File | null;
      if (file && file.size > 5 * 1024 * 1024) {
        setApplyError(t(locale, "File CV vượt quá 5MB. Vui lòng compress hoặc dùng link Google Drive.", "CV file exceeds 5MB. Please compress it or share a Google Drive link."));
        setApplyState("error");
        return;
      }
      const res = await fetch("/api/careers/apply", { method: "POST", body: formData });
      if (res.ok) {
        setApplyState("success");
      } else {
        const data = await res.json().catch(() => ({}));
        setApplyError(data.error ?? t(locale, "Có lỗi xảy ra. Vui lòng thử lại hoặc gửi email trực tiếp về careers@itsol.vn", "Something went wrong. Please try again or email careers@itsol.vn"));
        setApplyState("error");
      }
    } catch {
      setApplyError(t(locale, "Lỗi kết nối mạng. Vui lòng gửi CV tới careers@itsol.vn", "Network error. Please email your CV to careers@itsol.vn"));
      setApplyState("error");
    }
  }

  const levelColors: Record<string, string> = {
    Senior: "bg-orange-100 text-orange-700",
    Mid: "bg-blue-100 text-blue-700",
    Junior: "bg-green-100 text-green-700",
    "Mid-Senior": "bg-purple-100 text-purple-700",
  };

  return (
    <>
      <SimpleHero locale={locale}
        eyebrow={t(locale, "Tuyển dụng", "Careers")}
        title={t(locale, "Gia nhập đội ngũ ITSOL", "Join the ITSOL team")}
        desc={t(locale, "Chúng tôi tìm kiếm những người tài năng, đam mê công nghệ và muốn tạo ra tác động thực sự.", "We look for talented people passionate about technology who want to make a real impact.")}
      />

      {/* Why join */}
      <section className="section bg-light">
        <div className="container-page">
          <SectionTitle eyebrow={t(locale, "Tại sao ITSOL", "Why ITSOL")} title={t(locale, "Lý do để gia nhập", "Reasons to join")} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: "🚀", title: t(locale, "Cơ hội phát triển", "Growth opportunities"), desc: t(locale, "Lộ trình rõ ràng, mentoring từ senior", "Clear career path, mentoring from seniors") },
              { icon: "💚", title: t(locale, "Văn hóa tử tế", "Kind culture"), desc: t(locale, "Môi trường làm việc nhân văn, tôn trọng", "Humane and respectful work environment") },
              { icon: "🌏", title: t(locale, "Dự án quốc tế", "International projects"), desc: t(locale, "Làm việc với khách hàng Nhật Bản, Hàn Quốc, Singapore, Mỹ", "Work with clients from Japan, Korea, Singapore, US") },
              { icon: "💡", title: t(locale, "Công nghệ mới", "Latest technology"), desc: t(locale, "AI, Cloud, Microservices, Fintech", "AI, Cloud, Microservices, Fintech") },
            ].map((v) => (
              <div key={v.title} className="card p-6 text-center">
                <div className="text-4xl">{v.icon}</div>
                <h3 className="mt-3 font-800 text-navy">{v.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section className="section bg-white">
        <div className="container-page">
          <SectionTitle
            eyebrow={t(locale, "Vị trí tuyển dụng", "Open Positions")}
            title={t(locale, "Chúng tôi đang tuyển dụng", "We're hiring")}
            desc={t(locale, "Khám phá các cơ hội nghề nghiệp phù hợp với bạn tại ITSOL.", "Explore career opportunities that match your skills and ambitions.")}
          />
          {jobsLoading ? (
            <div className="flex justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-blue border-t-transparent" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="mx-auto max-w-md rounded-2xl border border-slate-100 bg-slate-50 p-10 text-center">
              <div className="text-4xl">📋</div>
              <p className="mt-4 font-700 text-navy">{t(locale, "Hiện chưa có vị trí nào", "No open positions right now")}</p>
              <p className="mt-2 text-sm text-slate-500">{t(locale, "Gửi CV của bạn, chúng tôi sẽ liên hệ khi có cơ hội phù hợp.", "Send your CV and we'll reach out when a matching role opens.")}</p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-blue/30 hover:shadow-lg"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-blue to-brand-cyan" />
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-cyan-50 text-brand-blue">
                      <BriefcaseBusiness className="size-5" />
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-700 ${levelColors[job.level] ?? "bg-slate-100 text-slate-600"}`}>
                      {job.level}
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-800 leading-tight text-navy">{job.title}</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Building2 className="size-3.5" />{job.department}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="size-3.5" />{job.location}
                    </span>
                  </div>
                  {/* Headcount + expiry */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(job.headcount ?? 1) > 1 && (
                      <span className="rounded-full bg-orange-50 border border-orange-200 px-2.5 py-0.5 text-[11px] font-700 text-orange-700">
                        👥 {job.headcount} {t(locale, "vị trí", "openings")}
                      </span>
                    )}
                    {job.expiresAt && (
                      <span className="rounded-full bg-red-50 border border-red-100 px-2.5 py-0.5 text-[11px] font-700 text-red-500">
                        ⏰ {new Date(job.expiresAt).toLocaleDateString("vi-VN")}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => openModal(job)}
                    className="btn btn-primary mt-5 w-full justify-center text-sm"
                  >
                    {t(locale, "Xem chi tiết", "View details")}
                    <ArrowRight className="size-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Apply Modal */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div
            key="apply-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              {/* Modal header */}
              <div className="flex items-start justify-between bg-gradient-to-r from-navy to-[#0070bf] p-6 text-white">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {modalStep === "apply" && (
                      <button onClick={() => setModalStep("detail")}
                        className="mr-1 flex items-center gap-1 rounded-lg bg-white/15 px-2 py-1 text-xs font-700 text-white hover:bg-white/25">
                        ← {t(locale, "Chi tiết", "Details")}
                      </button>
                    )}
                    <p className="text-xs font-800 uppercase tracking-wider text-cyan-200">
                      {modalStep === "detail"
                        ? t(locale, "💼 Vị trí tuyển dụng", "💼 Job Opening")
                        : t(locale, "📨 Nộp hồ sơ", "📨 Submit Application")}
                    </p>
                  </div>
                  <h3 className="mt-1 text-lg font-900 leading-snug">{selectedJob.title}</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="flex items-center gap-1 text-xs text-cyan-100"><Building2 className="size-3" />{selectedJob.department}</span>
                    <span className="flex items-center gap-1 text-xs text-cyan-100"><MapPin className="size-3" />{selectedJob.location}</span>
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-700">{selectedJob.level}</span>
                  </div>
                </div>
                <button onClick={closeModal} className="ml-4 mt-0.5 shrink-0 rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/20 hover:text-white">
                  <X className="size-5" />
                </button>
              </div>

              {/* Modal body */}
              <div className="max-h-[70vh] overflow-y-auto p-6">
                {applyState === "success" ? (
                  <div className="py-8 text-center">
                    <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                      <CheckCircle2 className="size-8" />
                    </div>
                    <h3 className="text-xl font-800 text-navy">{t(locale, "Nộp hồ sơ thành công!", "Application submitted!")}</h3>
                    <p className="mt-2 text-sm text-slate-600">{t(locale, "ITSOL sẽ liên hệ bạn sớm nhất.", "ITSOL will reach out to you shortly.")}</p>
                    <button onClick={closeModal} className="btn btn-primary mt-6">{t(locale, "Đóng", "Close")}</button>
                  </div>

                ) : modalStep === "detail" ? (
                  /* ── Step 1: Job detail ── */
                  <div className="space-y-5">
                    {/* Headcount + Expiry */}
                    {(selectedJob.headcount ?? 1) > 1 || selectedJob.expiresAt ? (
                      <div className="flex flex-wrap gap-2">
                        {(selectedJob.headcount ?? 1) > 1 && (
                          <span className="rounded-full bg-orange-50 border border-orange-200 px-3 py-1 text-xs font-700 text-orange-700">
                            👥 {locale === "vi" ? `Tuyển ${selectedJob.headcount} người` : `${selectedJob.headcount} positions`}
                          </span>
                        )}
                        {selectedJob.expiresAt && (
                          <span className="rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-700 text-red-600">
                            ⏰ {locale === "vi" ? "Hết hạn" : "Expires"}: {new Date(selectedJob.expiresAt).toLocaleDateString("vi-VN")}
                          </span>
                        )}
                      </div>
                    ) : null}

                    {/* Mô tả công việc */}
                    {selectedJob.description ? (
                      <div>
                        <p className="mb-2 text-xs font-800 uppercase tracking-wider text-slate-400">📋 {t(locale, "Mô tả công việc", "Job Description")}</p>
                        <div className="rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-700 whitespace-pre-line">{selectedJob.description}</div>
                      </div>
                    ) : null}

                    {/* Yêu cầu ứng viên */}
                    {selectedJob.requirements ? (
                      <div>
                        <p className="mb-2 text-xs font-800 uppercase tracking-wider text-slate-400">✅ {t(locale, "Yêu cầu ứng viên", "Requirements")}</p>
                        <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm leading-7 text-slate-700 whitespace-pre-line">{selectedJob.requirements}</div>
                      </div>
                    ) : null}

                    {/* Chế độ đãi ngộ */}
                    {selectedJob.benefits ? (
                      <div>
                        <p className="mb-2 text-xs font-800 uppercase tracking-wider text-slate-400">🎁 {t(locale, "Chế độ đãi ngộ", "Benefits")}</p>
                        <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-sm leading-7 text-slate-700 whitespace-pre-line">{selectedJob.benefits}</div>
                      </div>
                    ) : (
                      /* Default benefits chips khi chưa có */
                      <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                        {[
                          t(locale, "💰 Lương cạnh tranh", "💰 Competitive salary"),
                          t(locale, "🌟 Thưởng hiệu suất", "🌟 Performance bonus"),
                          t(locale, "🏥 BHXH đầy đủ", "🏥 Full insurance"),
                          t(locale, "📚 Đào tạo & phát triển", "📚 Training & growth"),
                          t(locale, "☀️ Nghỉ hè hàng năm", "☀️ Annual leave"),
                        ].map(b => (
                          <span key={b} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-700 text-emerald-700 border border-emerald-200">{b}</span>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => setModalStep("apply")}
                      className="btn btn-primary w-full justify-center"
                    >
                      {t(locale, "Ứng tuyển ngay", "Apply Now")}
                      <ArrowRight className="size-4" />
                    </button>
                  </div>

                ) : (
                  /* ── Step 2: Apply form ── */
                  <form onSubmit={handleApply}>
                    <input type="hidden" name="position" value={selectedJob.title} />
                    <div className="grid gap-4">
                      <div className="grid gap-1.5">
                        <label className="text-sm font-700 text-slate-700">{t(locale, "Họ tên", "Full Name")} <span className="text-red-500">*</span></label>
                        <input
                          name="name" required
                          placeholder={t(locale, "Nguyễn Văn A", "John Doe")}
                          className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-100"
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <label className="text-sm font-700 text-slate-700">Email <span className="text-red-500">*</span></label>
                        <input
                          name="email" type="email" required
                          placeholder="email@example.com"
                          className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-100"
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <label className="text-sm font-700 text-slate-700">{t(locale, "Số điện thoại", "Phone Number")}</label>
                        <input
                          name="phone"
                          placeholder="0901 234 567"
                          className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-100"
                        />
                      </div>
                      <div className="grid gap-1.5 sm:col-span-2">
                        <label className="text-sm font-700 text-slate-700">
                          {t(locale, "Upload CV (.pdf/.doc/.docx, tối đa 4MB)", "Upload CV (.pdf/.doc/.docx, max 4MB)")}
                          <span className="ml-1 text-xs font-500 text-slate-400">{t(locale, "(tùy chọn)", "(optional)")}</span>
                        </label>
                        <input
                          name="file" type="file"
                          accept=".pdf,.doc,.docx"
                          className="min-h-11 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-brand-blue file:px-3 file:py-1 file:text-xs file:font-700 file:text-white"
                        />
                      </div>
                      <div className="grid gap-1.5 sm:col-span-2">
                        <label className="text-sm font-700 text-slate-700">
                          {t(locale, "Hoặc dán link CV (Google Drive / Dropbox)", "Or paste CV link (Google Drive / Dropbox)")}
                          <span className="ml-1 text-xs font-500 text-slate-400">{t(locale, "(tùy chọn)", "(optional)")}</span>
                        </label>
                        <input
                          name="cv_link" type="url"
                          placeholder="https://drive.google.com/..."
                          className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-100"
                        />
                      </div>
                      <div className="grid gap-1.5 sm:col-span-2">
                        <label className="text-sm font-700 text-slate-700">{t(locale, "Lời giới thiệu ngắn", "Brief cover message")}</label>
                        <textarea
                          name="message" rows={2}
                          placeholder={t(locale, "Giới thiệu bản thân và lý do muốn ứng tuyển...", "Introduce yourself and why you want to apply...")}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-100 resize-none"
                        />
                      </div>
                    </div>
                    {applyState === "error" && (
                      <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-600 text-red-600">{applyError}</p>
                    )}
                    <div className="mt-5 flex gap-3">
                      <button type="button" onClick={closeModal} className="btn flex-1 justify-center border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                        {t(locale, "Hủy", "Cancel")}
                      </button>
                      <button
                        type="submit"
                        disabled={applyState === "sending"}
                        className="btn btn-primary flex-1 justify-center disabled:opacity-60"
                      >
                        {applyState === "sending" ? t(locale, "Đang gửi...", "Submitting...") : t(locale, "Gửi hồ sơ", "Submit")}
                        <Send className="size-4" />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ContactCTA locale={locale} />
    </>
  );
}

// ─── Products pages are handled by data/site.ts in /products/[slug] pages ──

// ─── Main Site Wrapper ────────────────────────────────────────────
export function ItsolSite({ page, initialLocale, initialProductSlug }: { page: PageKey; initialLocale: Locale; initialProductSlug?: string }) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [techMode, setTechMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("itsol-locale") as Locale;
    if (saved && (saved === "vi" || saved === "en")) setLocale(saved);
    const tm = localStorage.getItem("itsol-techmode");
    if (tm === "1") setTechMode(true);
  }, []);

  function changeLocale(l: Locale) {
    setLocale(l);
    localStorage.setItem("itsol-locale", l);
  }

  function toggleTechMode() {
    const next = !techMode;
    setTechMode(next);
    localStorage.setItem("itsol-techmode", next ? "1" : "");
  }

  const pageMap: Record<PageKey, React.ReactNode> = {
    home:                <Home locale={locale} />,
    about:               <About locale={locale} />,
    services:            <Services locale={locale} />,
    staffing:            <Staffing locale={locale} />,
    odc:                 <SimpleODC locale={locale} />,
    "software-outsourcing": <SimpleOutsourcing locale={locale} />,
    "product-development":  <SimpleProductDev locale={locale} />,
    products:            <ProductShowcasePage locale={locale} />,
    "product-detail":    initialProductSlug
      ? <ProductDetailPage locale={locale} slug={initialProductSlug} />
      : <ProductShowcasePage locale={locale} />,
    industries:          <Industries locale={locale} />,
    "case-studies":      <CaseStudies locale={locale} />,
    awards:              <Awards locale={locale} />,
    careers:             <Careers locale={locale} />,
    insights:            <Insights locale={locale} />,
    contact:             <Contact locale={locale} />,
    policy:              <Policy locale={locale} />,
  };

  return (
    <div className={techMode ? "tech-mode" : ""}>
      <Header locale={locale} onLocaleChange={changeLocale} techMode={techMode} onTechMode={toggleTechMode} />
      <main className="pt-0">
        {pageMap[page] ?? <Home locale={locale} />}
      </main>
      <Footer locale={locale} techMode={techMode} />
    </div>
  );
}

// ─── Simple service sub-pages ─────────────────────────────────────
function SimpleODC({ locale }: { locale: Locale }) {
  const steps = [
    {
      en: "Discovery & Planning", vi: "Khám phá & Lập kế hoạch",
      icon: Search, color: "from-blue-600 to-cyan-500",
      descVi: "Phân tích nhu cầu, định rõ scope, roadmap và mục tiêu kỹ thuật.",
      descEn: "Analyze requirements, define scope, roadmap and technical goals."
    },
    {
      en: "Team Structure Design", vi: "Thiết kế Đội ngũ",
      icon: Users, color: "from-violet-600 to-purple-500",
      descVi: "Xác định cơ cấu team, vai trò, senior/junior ratio và quy trình làm việc.",
      descEn: "Define team structure, roles, senior/junior ratio and working process."
    },
    {
      en: "Recruitment & Staffing", vi: "Tuyển dụng & Onboard",
      icon: BriefcaseBusiness, color: "from-orange-500 to-amber-400",
      descVi: "Sàng lọc kỹ thuật, phỏng vấn và onboard kỹ sư phù hợp với văn hóa khách hàng.",
      descEn: "Technical screening, interviews and onboard engineers aligned with your culture."
    },
    {
      en: "Infrastructure Setup", vi: "Thiết lập Hạ tầng",
      icon: Network, color: "from-slate-700 to-slate-500",
      descVi: "Cài đặt môi trường dev, CI/CD, VPN, bảo mật dữ liệu và công cụ hợp tác.",
      descEn: "Dev environment, CI/CD, VPN, data security and collaboration tools."
    },
    {
      en: "Governance & Processes", vi: "Quản trị & Quy trình",
      icon: ShieldCheck, color: "from-emerald-600 to-teal-500",
      descVi: "Thiết lập KPI, sprint cadence, báo cáo hiệu suất và escalation process.",
      descEn: "KPIs, sprint cadence, performance reporting and escalation process."
    },
    {
      en: "Delivery Management", vi: "Quản lý Delivery",
      icon: Rocket, color: "from-pink-600 to-rose-500",
      descVi: "Agile/Scrum delivery, code review, quality gate và cải tiến liên tục.",
      descEn: "Agile/Scrum delivery, code review, quality gates and continuous improvement."
    },
    {
      en: "Scale-up", vi: "Mở rộng & Phát triển",
      icon: TrendingUp, color: "from-green-600 to-lime-500",
      descVi: "Mở rộng team khi cần, chuyển giao tri thức và hỗ trợ Build-Operate-Transfer.",
      descEn: "Expand team on demand, knowledge transfer and Build-Operate-Transfer support."
    },
  ];

  const odcModels = [
    { icon: Building2, en: "Build-Operate-Transfer",    vi: "Build-Operate-Transfer",    descVi: "ITSOL xây, vận hành, sau đó bàn giao cho bạn", descEn: "ITSOL builds, runs, then transfers ownership to you" },
    { icon: Users,     en: "Dedicated Agile Squad",     vi: "Dedicated Agile Squad",     descVi: "Squad chuyên trách theo sprint, vận hành Agile",   descEn: "Dedicated squad running full Agile sprints" },
    { icon: Layers3,   en: "Extended Engineering Team", vi: "Mở rộng Team Hiện có",     descVi: "Bổ sung kỹ sư tích hợp vào team sẵn có của bạn", descEn: "Engineers embedded into your existing team" },
    { icon: Rocket,    en: "Product Lab",                vi: "Product Lab",               descVi: "Team R&D độc lập, tập trung phát triển sản phẩm",descEn: "Independent R&D team focused on product innovation" },
  ];

  return (
    <>
      <SimpleHero locale={locale} eyebrow="ODC" title={t(locale, "Offshore Development Center", "Offshore Development Center")}
        desc={t(locale, "Xây dựng trung tâm kỹ sư Việt Nam riêng cho doanh nghiệp — governance chặt chẽ, bảo mật cao, scale khi cần.", "Your own Vietnam engineering hub — tight governance, high security, scale on demand.")} />

      <section className="section bg-light">
        <div className="container-page">
          <SectionTitle eyebrow={t(locale, "Quy trình", "How it works")} title={t(locale, "7 bước thành lập ODC", "7 steps to launch your ODC")} />
          {/* Mobile: vertical timeline */}
          <div className="relative sm:hidden">
            <div className="absolute left-5 top-0 h-full w-0.5 bg-gradient-to-b from-blue-500 via-emerald-400 to-green-500" />
            <div className="flex flex-col gap-0">
              {steps.map((step, i) => (
                <motion.div key={step.en}
                  initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="relative flex items-start gap-4 pb-6"
                >
                  <div className={`relative z-10 grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br ${step.color} text-white shadow-lg ring-4 ring-white`}>
                    <step.icon className="size-4" />
                  </div>
                  <div className="flex-1 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <p className="text-xs font-900 uppercase tracking-widest text-brand-blue">Step {i + 1}</p>
                    <h4 className="mt-1 font-800 text-navy">{locale === "vi" ? step.vi : step.en}</h4>
                    <p className="mt-1.5 text-xs leading-5 text-slate-500">{locale === "vi" ? step.descVi : step.descEn}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          {/* Desktop: 2-col alternating cards */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((step, i) => (
              <motion.div key={step.en} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="card p-5"
              >
                <div className={`grid size-10 place-items-center rounded-xl bg-gradient-to-br ${step.color} text-white shadow`}>
                  <step.icon className="size-5" />
                </div>
                <p className="mt-3 text-xs font-900 uppercase tracking-wider text-slate-400">Step {i + 1}</p>
                <h4 className="mt-1 font-800 text-navy">{locale === "vi" ? step.vi : step.en}</h4>
                <p className="mt-2 text-xs leading-5 text-slate-500">{locale === "vi" ? step.descVi : step.descEn}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-page">
          <SectionTitle eyebrow={t(locale, "Mô hình", "Models")} title={t(locale, "4 mô hình ODC phù hợp", "4 ODC models to fit your needs")} />
          <div className="grid gap-5 sm:grid-cols-2">
            {odcModels.map((m, i) => (
              <motion.div key={m.en} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-blue to-cyan-400 text-white shadow">
                  <m.icon className="size-6" />
                </div>
                <div>
                  <h3 className="font-900 text-navy">{locale === "vi" ? m.vi : m.en}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-slate-500">{locale === "vi" ? m.descVi : m.descEn}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured projects */}
      <ServiceProjectsSection locale={locale} serviceKey="odc" />

      <ContactCTA locale={locale} />
    </>
  );
}

function SimpleOutsourcing({ locale }: { locale: Locale }) {
  const capabilities = [
    {
      icon: Code2, color: "from-blue-600 to-cyan-500",
      en: "Custom Software", vi: "Phần mềm Custom",
      descVi: "Thiết kế và xây dựng phần mềm theo đúng yêu cầu nghiệp vụ, không dùng template sẵn.",
      descEn: "Designed and built to your exact requirements — no off-the-shelf shortcuts.",
      code: `// ITSOL clean architecture\nclass OrderService {\n  async placeOrder(cmd: PlaceOrderCmd) {\n    const order = Order.create(cmd);\n    await this.repo.save(order);\n    return order.id;\n  }\n}`
    },
    {
      icon: Globe2, color: "from-violet-600 to-blue-500",
      en: "Web Application", vi: "Ứng dụng Web",
      descVi: "SPA, SSR, micro-frontend — React, Next.js, Vue với hiệu suất cao và SEO tốt.",
      descEn: "SPA, SSR, micro-frontend — React, Next.js, Vue with high performance and SEO.",
      code: `// Next.js App Router\nexport default async function Page() {\n  const data = await fetchData();\n  return <Dashboard data={data} />;\n}`
    },
    {
      icon: Cpu, color: "from-orange-500 to-amber-400",
      en: "Mobile App", vi: "Ứng dụng Mobile",
      descVi: "iOS, Android, Flutter, React Native — UI mượt mà, offline-first và tích hợp device API.",
      descEn: "iOS, Android, Flutter, React Native — smooth UI, offline-first, native device APIs.",
      code: `// Flutter widget\nWidget build(BuildContext ctx) =>\n  Scaffold(\n    body: StreamBuilder(\n      stream: bloc.state,\n      builder: (ctx, snap) => UI(snap),\n    )\n  );`
    },
    {
      icon: Building2, color: "from-slate-700 to-slate-500",
      en: "Enterprise System", vi: "Hệ thống Enterprise",
      descVi: "ERP, CRM, workflow nội bộ — microservices, event-driven, phân quyền chặt chẽ.",
      descEn: "ERP, CRM, internal workflow — microservices, event-driven, fine-grained access control.",
      code: `// Event-driven microservice\n@EventHandler\nasync handle(e: OrderCreated) {\n  await inventory.reserve(e.items);\n  await notify.send(e.userId);\n}`
    },
    {
      icon: Shield, color: "from-emerald-600 to-teal-500",
      en: "Banking / Fintech", vi: "Banking / Fintech",
      descVi: "Core banking, eKYC, payment gateway — bảo mật cao, audit trail đầy đủ, tuân thủ quy định.",
      descEn: "Core banking, eKYC, payment gateway — high security, full audit trail, regulatory compliance.",
      code: `// Transaction with audit\nasync transfer(req: TransferReq) {\n  await db.tx(async t => {\n    await t.debit(req.from, req.amount);\n    await t.credit(req.to, req.amount);\n    await audit.log(req); // immutable\n  });\n}`
    },
    {
      icon: Network, color: "from-pink-600 to-rose-500",
      en: "IoT / Embedded", vi: "IoT / Embedded",
      descVi: "Firmware, RTOS, edge computing — từ thiết bị thu thập dữ liệu đến dashboard thời gian thực.",
      descEn: "Firmware, RTOS, edge computing — from data collection devices to real-time dashboards.",
      code: `// ESP32 sensor loop\nvoid loop() {\n  float temp = sensor.read();\n  if (temp > THRESHOLD)\n    mqtt.publish("alert", temp);\n  delay(1000);\n}`
    },
  ];

  return (
    <>
      <SimpleHero locale={locale} eyebrow="Software Outsourcing"
        title={t(locale, "Phát triển phần mềm theo đơn hàng", "Software built to your specifications")}
        desc={t(locale,
          "Kỹ sư Việt Nam đã qua sàng lọc, công việc được giao đúng hạn, code được review kỹ lưỡng — từ MVP đến hệ thống enterprise.",
          "Vetted Vietnamese engineers, on-time delivery, rigorous code review — from MVP to enterprise systems."
        )} />

      <section className="section bg-light">
        <div className="container-page">
          <SectionTitle
            eyebrow={t(locale, "Năng lực", "Capabilities")}
            title={t(locale, "6 lĩnh vực chuyên sâu", "6 deep specializations")}
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((cap, i) => (
              <motion.div key={cap.en}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
              >
                {/* Header */}
                <div className={`bg-gradient-to-r ${cap.color} px-5 py-4 flex items-center gap-3`}>
                  <div className="grid size-9 place-items-center rounded-xl bg-white/20">
                    <cap.icon className="size-5 text-white" />
                  </div>
                  <h3 className="font-900 text-white">{locale === "vi" ? cap.vi : cap.en}</h3>
                </div>
                {/* Description */}
                <div className="px-5 py-4">
                  <p className="text-sm leading-6 text-slate-600">{locale === "vi" ? cap.descVi : cap.descEn}</p>
                </div>
                {/* Code snippet */}
                <div className="mx-5 mb-5 overflow-hidden rounded-xl bg-slate-950 px-4 py-3 font-mono text-[11px] leading-5">
                  {cap.code.split("\n").map((line, j) => (
                    <div key={j} className={`${
                      line.trim().startsWith("//") ? "text-slate-400" :
                      line.includes("async ") || line.includes("function") || line.includes("class ") || line.includes("void ") || line.includes("Widget") ? "text-cyan-300" :
                      line.includes("return") || line.includes("await") ? "text-orange-300" :
                      line.includes(".") && !line.startsWith(" ") ? "text-green-400" :
                      "text-slate-200"
                    }`}>{line || "\u00a0"}</div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-page">
          <SectionTitle eyebrow={t(locale, "Quy trình", "Delivery")} title={t(locale, "Cách ITSOL deliver", "How ITSOL delivers")} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: FileText,  color: "bg-blue-600",    en: "Requirements",  vi: "Phân tích yêu cầu",   descVi: "Kick-off, clarify scope, đặt KPI", descEn: "Kick-off, scope clarity, set KPIs" },
              { icon: Code2,     color: "bg-violet-600",  en: "Development",   vi: "Phát triển",           descVi: "Sprint 2 tuần, demo cuối sprint",   descEn: "2-week sprints, end-of-sprint demos" },
              { icon: ShieldCheck,color:"bg-emerald-600", en: "QA & Review",   vi: "QA & Code review",     descVi: "Tự động hóa test, peer review",     descEn: "Automated tests, peer review" },
              { icon: Rocket,    color: "bg-orange-500",  en: "Delivery",      vi: "Giao hàng",             descVi: "Deploy, hướng dẫn và hỗ trợ sản xuất",descEn: "Deploy, handover and production support" },
            ].map((step, i) => (
              <motion.div key={step.en} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-col"
              >
                <div className={`grid size-10 shrink-0 place-items-center rounded-xl ${step.color} text-white shadow`}>
                  <step.icon className="size-5" />
                </div>
                <div>
                  <h4 className="font-900 text-navy">{locale === "vi" ? step.vi : step.en}</h4>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{locale === "vi" ? step.descVi : step.descEn}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured projects */}
      <ServiceProjectsSection locale={locale} serviceKey="software-outsourcing" />

      <ContactCTA locale={locale} />
    </>
  );
}

function SimpleProductDev({ locale }: { locale: Locale }) {
  const phases = [
    { label: "Discovery",       labelVi: "Khám phá",              icon: Search,      color: "from-violet-600 to-purple-500", descVi: "Hiểu bài toán, xác định user, định nghĩa scope và OKR.",         descEn: "Understand the problem, define users, scope and OKRs.",                   tech: ["User interviews", "Jobs-to-be-done", "Lean canvas"] },
    { label: "Market Analysis", labelVi: "Phân tích thị trường",  icon: BarChart3,   color: "from-blue-600 to-cyan-500",    descVi: "Phân tích đối thủ, xu hướng và cơ hội tăng trưởng.",           descEn: "Competitive analysis, market trends and growth opportunities.",           tech: ["Competitor mapping", "TAM/SAM", "GTM strategy"] },
    { label: "UX / UI",         labelVi: "UX / UI Design",        icon: Layers3,     color: "from-pink-600 to-rose-500",    descVi: "Thiết kế wireframe, prototype và UI hành trình người dùng.",   descEn: "Wireframes, interactive prototype and full UI system.",                   tech: ["Figma", "Design system", "Usability testing"] },
    { label: "MVP",             labelVi: "Xây dựng MVP",          icon: Rocket,      color: "from-orange-500 to-amber-400", descVi: "Ra mắt tính năng cốt lõi nhanh nhất để validate thị trường.", descEn: "Ship core features fast to validate with real users.",                    tech: ["Next.js / React", "REST API", "CI/CD pipeline"] },
    { label: "Architecture",    labelVi: "Kiến trúc hệ thống",    icon: Network,     color: "from-slate-700 to-slate-500",  descVi: "Thiết kế microservices, scale strategy và bảo mật.",          descEn: "Microservices, scaling strategy and security architecture.",              tech: ["Microservices", "Docker / K8s", "Zero-trust"] },
    { label: "Development",     labelVi: "Phát triển",            icon: Code2,       color: "from-brand-blue to-cyan-500",  descVi: "Sprint 2 tuần, code review, QA tự động hóa, coverage > 80%.", descEn: "2-week sprints, code review, automated QA, 80%+ coverage.",              tech: ["TDD", "Peer review", "SonarQube"] },
    { label: "AI Integration",  labelVi: "Tích hợp AI",           icon: Bot,         color: "from-emerald-600 to-teal-400", descVi: "Gắn AI vào luồng nghiệp vụ: LLM, OCR, recommendation.",       descEn: "Embed AI into workflows: LLM, OCR, recommendations.",                    tech: ["OpenAI API", "Hugging Face", "RAG pipeline"] },
    { label: "Growth & Scale",  labelVi: "Tăng trưởng",           icon: TrendingUp,  color: "from-green-600 to-lime-400",   descVi: "Phân tích tăng trưởng, tối ưu hiệu suất và scale infra.",     descEn: "Growth analytics, performance optimization and infra scaling.",           tech: ["Analytics", "CDN / caching", "Auto-scaling"] },
  ];
  return (
    <>
      <SimpleHero locale={locale}
        eyebrow={t(locale, "Phát triển sản phẩm", "Product Development")}
        title={t(locale, "Từ ý tưởng đến sản phẩm scale", "From idea to scalable product")}
        desc={t(locale, "ITSOL đồng hành từ discovery đến production — kỹ sư kỹ thuật đi cùng product thinker.", "ITSOL walks with you from discovery to production — engineers paired with product thinkers.")}
      />
      <section className="section bg-light">
        <div className="container-page">
          <SectionTitle eyebrow="8 phases" title={t(locale, "Quy trình phát triển sản phẩm", "Product development lifecycle")} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {phases.map((phase, i) => (
              <motion.div key={phase.label}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
              >
                <div className={`bg-gradient-to-r ${phase.color} px-4 py-3 flex items-center gap-3`}>
                  <div className="grid size-8 place-items-center rounded-lg bg-white/20">
                    <phase.icon className="size-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-900 uppercase tracking-widest text-white/60">Phase {String(i+1).padStart(2,"0")}</p>
                    <p className="text-sm font-900 text-white leading-tight">{locale === "vi" ? phase.labelVi : phase.label}</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs leading-5 text-slate-500">{locale === "vi" ? phase.descVi : phase.descEn}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {phase.tech.map(tech => (
                      <span key={tech} className="rounded-full bg-slate-950 px-2 py-0.5 font-mono text-[10px] font-600 text-cyan-400">{tech}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <ProductShowcase locale={locale} />

      {/* Featured projects */}
      <ServiceProjectsSection locale={locale} serviceKey="product-development" />

      <ContactCTA locale={locale} />
    </>
  );
}


// ─── Product Detail Page ─────────────────────────────────────────
const PRODUCT_ACCENTS: Record<string, { from: string; to: string; hex: string }> = {
  "master-ekyc":     { from: "from-blue-600",    to: "to-cyan-500",    hex: "#2563EB" },
  "docchain-kss":    { from: "from-violet-600",  to: "to-blue-500",   hex: "#7C3AED" },
  "horus-camera-ai": { from: "from-slate-700",   to: "to-slate-500",  hex: "#334155" },
  "ong-but-ai":      { from: "from-emerald-600", to: "to-teal-500",   hex: "#059669" },
};

function ProductDetailPage({ locale, slug }: { locale: Locale; slug: string }) {
  const product = products.find(p => p.slug === slug);
  const accent  = PRODUCT_ACCENTS[slug] ?? PRODUCT_ACCENTS["master-ekyc"];

  const [formState, setFormState] = useState<"idle"|"sending"|"success"|"error">("idle");
  const [formError, setFormError]  = useState("");

  if (!product) return <ProductShowcasePage locale={locale} />;

  async function handleInquiry(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState("sending");
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch("/api/product-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, product: product!.name }),
      });
      const json = await res.json();
      if (res.ok) { setFormState("success"); (e.target as HTMLFormElement).reset(); }
      else { setFormError(json.error ?? "Lỗi gửi"); setFormState("error"); }
    } catch { setFormError("Lỗi kết nối"); setFormState("error"); }
  }

  return (
    <>
      {/* Hero */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${accent.from} ${accent.to} pb-24 pt-32 text-white`}>
        <div className="pointer-events-none absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 70% 50%, rgba(255,255,255,.3) 0%, transparent 60%)" }} />
        <div className="container-page grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <span className="inline-block rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-800 uppercase tracking-widest text-white/90 backdrop-blur">
              {t(locale, product.category.vi, product.category.en)}
            </span>
            <h1 className="mt-4 text-4xl font-900 leading-tight md:text-6xl">{product.name}</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/85">{t(locale, product.summary.vi, product.summary.en)}</p>
            <div className="mt-7 flex flex-wrap gap-2">
              {product.tags.map(tag => (
                <span key={tag} className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-700 text-white">{tag}</span>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#inquiry" className="btn bg-white font-800" style={{ color: accent.hex }}>
                {t(locale, "📧 Gửi yêu cầu tư vấn", "📧 Request a demo")}
              </a>
              <Link href={lp("/contact", locale)} className="btn border border-white/30 bg-white/10 text-white hover:bg-white/20">
                {t(locale, "Liên hệ ITSOL", "Talk to ITSOL")}
              </Link>
            </div>
          </div>
          {/* Feature list card */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
            className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm"
          >
            <p className="mb-4 text-xs font-800 uppercase tracking-widest text-white/60">{t(locale, "Tính năng chính", "Key features")}</p>
            <ul className="flex flex-col gap-3">
              {product.features.map(f => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-white/70" />
                  <span className="text-white/90 font-600">{f}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Use cases */}
      <section className="section bg-white">
        <div className="container-page">
          <SectionTitle
            eyebrow={t(locale, "Trường hợp sử dụng", "Use cases")}
            title={t(locale, "Ứng dụng thực tiễn", "Practical applications")}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {product.useCases.map((uc, i) => (
              <motion.div key={uc}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r" style={{ background: `linear-gradient(90deg, ${accent.hex}, ${accent.hex}66)` }} />
                <div className="grid size-10 place-items-center rounded-xl" style={{ background: `${accent.hex}15` }}>
                  <Rocket className="size-5" style={{ color: accent.hex }} />
                </div>
                <p className="mt-3 font-800 text-navy">{uc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry form */}
      <section id="inquiry" className="section" style={{ background: "linear-gradient(135deg,#f0f7ff 0%,#fafbff 100%)" }}>
        <div className="container-page">
          <div className="mx-auto max-w-2xl">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5" style={{ background: `${accent.hex}18` }}>
                <span className="text-xs font-900 uppercase tracking-widest" style={{ color: accent.hex }}>
                  {t(locale, "Liên hệ tư vấn", "Inquiry")}
                </span>
              </div>
              <h2 className="mt-3 text-3xl font-900 text-navy">{t(locale, `Gửi yêu cầu tư vấn ${product.name}`, `Request ${product.name} demo`)}</h2>
              <p className="mt-2 text-slate-500">{t(locale, "ITSOL sẽ liên hệ trong vòng 24 giờ làm việc.", "ITSOL will respond within 24 business hours.")}</p>
            </div>

            {formState === "success" ? (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center"
              >
                <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="size-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-900 text-emerald-800">{t(locale, "Gửi yêu cầu thành công!", "Inquiry sent!")}</h3>
                <p className="mt-2 text-emerald-700">{t(locale, "ITSOL sẽ liên hệ bạn sớm nhất. Cảm ơn đã quan tâm đến {product.name}.", `Thank you for your interest in ${product.name}. We'll be in touch shortly.`)}</p>
                <button onClick={() => setFormState("idle")} className="btn btn-primary mt-6">
                  {t(locale, "Gửi yêu cầu khác", "Send another inquiry")}
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleInquiry} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md md:p-8">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <label className="text-sm font-700 text-slate-700">{t(locale, "Họ tên", "Full name")} <span className="text-red-500">*</span></label>
                    <input name="name" required placeholder={t(locale, "Nguyễn Văn A", "John Doe")}
                      className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-100" />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm font-700 text-slate-700">{t(locale, "Tên công ty", "Company")}</label>
                    <input name="company" placeholder={t(locale, "Công ty ABC", "ABC Corp")}
                      className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-100" />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm font-700 text-slate-700">Email <span className="text-red-500">*</span></label>
                    <input name="email" type="email" required placeholder="email@example.com"
                      className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-100" />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm font-700 text-slate-700">{t(locale, "Số điện thoại", "Phone")}</label>
                    <input name="phone" placeholder="0901 234 567"
                      className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-100" />
                  </div>
                  <div className="grid gap-1.5 sm:col-span-2">
                    <label className="text-sm font-700 text-slate-700">{t(locale, "Thông tin yêu cầu", "Your message")}</label>
                    <textarea name="message" rows={3}
                      placeholder={t(locale, `Nôi dung yêu cầu tư vấn ${product.name}...`, `Tell us about your ${product.name} requirements...`)}
                      className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-100" />
                  </div>
                </div>
                {formError && (
                  <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-600 text-red-600">{formError}</p>
                )}
                <button type="submit" disabled={formState === "sending"}
                  className="btn btn-primary mt-5 w-full justify-center text-base disabled:opacity-60"
                  style={{ background: accent.hex }}
                >
                  {formState === "sending" ? t(locale, "⏳ Đang gửi...", "Sending...") : t(locale, "📧 Gửi yêu cầu tư vấn", "📧 Send inquiry")}
                </button>
                <p className="mt-3 text-center text-xs text-slate-400">
                  {t(locale, "Hoặc gửi email trực tiếp", "Or email us directly")}: <a href="mailto:sales@itsol.vn" className="font-700 text-brand-blue hover:underline">sales@itsol.vn</a>
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Other products */}
      <ProductShowcase locale={locale} />
      <ContactCTA locale={locale} />
    </>
  );
}

function ProductShowcasePage({ locale }: { locale: Locale }) {
  return (
    <>
      <SimpleHero locale={locale} eyebrow={t(locale, "Sản phẩm", "Products")} title={t(locale, "Các sản phẩm AI của ITSOL", "ITSOL AI Products")} />
      <ProductShowcase locale={locale} />
      <ContactCTA locale={locale} />
    </>
  );
}
