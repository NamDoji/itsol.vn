"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { BrandLogo } from "./BrandLogo";

const nav = [
  ["About", "/about"],
  ["Services", "/services/it-staffing"],
  ["Case Studies", "/case-studies"],
  ["AI Ecosystem", "/products-ai-ecosystem"],
  ["Careers", "/careers"],
  ["Insights", "/blog"]
];

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const lang = searchParams.get("lang") === "en" ? "en" : "vi";
  const hrefWithLang = (href: string, nextLang = lang) => `${href}?lang=${nextLang}`;
  const toggleHref = (nextLang: "vi" | "en") => `${pathname}?lang=${nextLang}`;

  return (
    <div>
      <header className="sticky top-0 z-40 border-b border-line bg-white/92 backdrop-blur">
        <div className="container-page flex h-[var(--nav-height)] items-center justify-between gap-4">
          <Link href={hrefWithLang("/")} aria-label="ITSOL Home" onClick={() => setOpen(false)}>
            <BrandLogo inverted />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-700 lg:flex">
            {nav.map(([label, href]) => (
              <Link key={href} href={hrefWithLang(href)} className="hover:text-brand-red">
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden rounded-lg border border-line bg-white p-1 text-xs font-black sm:flex">
              <Link href={toggleHref("vi")} className={`whitespace-nowrap rounded-md px-2 py-1 ${lang === "vi" ? "bg-brand-red text-white" : "text-slate-600"}`}>
                VI
              </Link>
              <Link href={toggleHref("en")} className={`whitespace-nowrap rounded-md px-2 py-1 ${lang === "en" ? "bg-brand-red text-white" : "text-slate-600"}`}>
                EN
              </Link>
            </div>
            <Link href={hrefWithLang("/it-staffing")} className="btn btn-ghost hidden xl:inline-flex">
              Send JD
            </Link>
            <Link href={hrefWithLang("/contact")} className="btn btn-primary hidden sm:inline-flex">
              Contact
            </Link>
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-lg border border-line bg-white lg:hidden"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
            >
              <span className="grid gap-1.5">
                <span className="block h-0.5 w-5 bg-brand-navy" />
                <span className="block h-0.5 w-5 bg-brand-navy" />
                <span className="block h-0.5 w-5 bg-brand-navy" />
              </span>
            </button>
          </div>
        </div>
        {open ? (
          <div className="border-t border-line bg-white lg:hidden">
            <div className="container-page grid gap-2 py-4">
              {nav.map(([label, href]) => (
                <Link
                  key={href}
                  href={hrefWithLang(href)}
                  className="rounded-lg px-3 py-3 text-sm font-bold text-brand-navy hover:bg-brand-blush"
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link href={hrefWithLang("/it-staffing")} className="btn btn-ghost" onClick={() => setOpen(false)}>
                  Send JD
                </Link>
                <Link href={hrefWithLang("/contact")} className="btn btn-primary" onClick={() => setOpen(false)}>
                  Contact
                </Link>
              </div>
              <div className="mt-2 grid grid-cols-2 rounded-lg border border-line bg-white p-1 text-center text-sm font-black">
                <Link href={toggleHref("vi")} className={`whitespace-nowrap rounded-md px-3 py-2 ${lang === "vi" ? "bg-brand-red text-white" : "text-slate-600"}`} onClick={() => setOpen(false)}>
                  VI
                </Link>
                <Link href={toggleHref("en")} className={`whitespace-nowrap rounded-md px-3 py-2 ${lang === "en" ? "bg-brand-red text-white" : "text-slate-600"}`} onClick={() => setOpen(false)}>
                  EN
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </header>
      <main>{children}</main>
      <footer className="border-t border-line bg-brand-navy py-12 text-white">
        <div className="container-page grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="max-w-xl text-sm leading-7 text-white/72">
              ITSOL is a trusted IT talent and technology partner helping businesses build engineering teams,
              deliver software products, and adopt AI-powered digital transformation.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold">Services</h3>
            <div className="mt-4 grid gap-3 text-sm text-white/70">
              <Link href={hrefWithLang("/services/it-staffing")}>IT Staffing</Link>
              <Link href={hrefWithLang("/services/software-outsourcing")}>Software Outsourcing</Link>
              <Link href={hrefWithLang("/services/dedicated-team-odc")}>Dedicated Team / ODC</Link>
              <Link href={hrefWithLang("/services/ai-solutions")}>AI Solutions</Link>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold">Contact</h3>
            <div className="mt-4 grid gap-3 text-sm text-white/70">
              <span>Hanoi, Vietnam</span>
              <span>contact@itsol.vn</span>
              <Link href="/admin" className="text-white/50 hover:text-white">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
