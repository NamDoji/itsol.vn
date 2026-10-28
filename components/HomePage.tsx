import Link from "next/link";
import Image from "next/image";
import { BrandLogo } from "./BrandLogo";
import { SectionHeader } from "./SectionHeader";
import type { Locale } from "@/lib/i18n";
import { localize } from "@/lib/i18n";
import type { BlogPost, CaseStudy, Service } from "@/lib/types";

const CLIENTS = [
  { name: "Viettel",      logo: "/clients/viettel.svg",      url: "https://viettel.com.vn",        color: "#E31E24" },
  { name: "Vingroup",     logo: "/clients/vingroup.svg",     url: "https://vingroup.net",          color: "#8B1A2B" },
  { name: "FPT",          logo: "/clients/fpt.svg",          url: "https://fpt.com.vn",            color: "#F47920" },
  { name: "Bảo Việt",    logo: "/clients/baoviet.svg",      url: "https://baoviet.com.vn",        color: "#003087" },
  { name: "Techcombank",  logo: "/clients/techcombank.svg",  url: "https://techcombank.com.vn",    color: "#C8102E" },
  { name: "MB Bank",      logo: "/clients/mbbank.png",       url: "https://mbbank.com.vn",         color: "#00427A" },
  { name: "SeABank",      logo: "/clients/seabank.png",      url: "https://seabank.com.vn",        color: "#009944" },
  { name: "Luvina",       logo: "/clients/luvina.png",       url: "https://luvina.net",            color: "#003E9C" },
  { name: "VPBank",       logo: "/clients/vpbank.png",       url: "https://vpbank.com.vn",         color: "#008B3A" },
  { name: "EVN Hà Nội",  logo: "/clients/evnhanoi.svg",     url: "https://evnhanoi.com.vn",      color: "#003087" },
];

const FEATURED_PROJECTS = [
  {
    name: "Master eKYC",
    category: { vi: "Định danh điện tử AI", en: "AI Identity Verification" },
    description: {
      vi: "Hệ thống eKYC tích hợp OCR, face liveness và fraud detection — giúp ngân hàng số hóa toàn bộ quy trình mở tài khoản.",
      en: "eKYC platform with OCR, face liveness and fraud detection — enables banks to fully digitize account opening."
    },
    tags: ["AI", "Banking", "OCR", "Face Liveness"],
    metric: { value: "95%", label: { vi: "Tự động xác minh", en: "Auto-verify rate" } },
    icon: "🔐",
    accent: "#C8102E",
  },
  {
    name: "Horus Camera AI",
    category: { vi: "Giám sát AI thời gian thực", en: "Real-time AI Surveillance" },
    description: {
      vi: "Biến camera IP thường thành hệ thống giám sát thông minh — nhận diện biển số, phát hiện cháy và cảnh báo tức thì.",
      en: "Transform standard IP cameras into intelligent surveillance — license plates, fire detection, real-time alerts."
    },
    tags: ["Computer Vision", "Edge AI", "IoT", "Real-time"],
    metric: { value: "24/7", label: { vi: "Giám sát liên tục", en: "Continuous monitoring" } },
    icon: "📷",
    accent: "#003087",
  },
  {
    name: "DocChain KSS",
    category: { vi: "Quản lý chứng từ ngân hàng", en: "Banking Document Management" },
    description: {
      vi: "Số hóa, tìm kiếm và hậu kiểm hồ sơ chứng từ ngân hàng — giảm 70% thao tác thủ công, tăng tốc compliance.",
      en: "Digitize and post-control banking documents — 70% less manual work, faster compliance, full audit trail."
    },
    tags: ["Banking", "OCR", "Workflow", "Compliance"],
    metric: { value: "70%", label: { vi: "Giảm thủ công", en: "Manual work reduced" } },
    icon: "📄",
    accent: "#009944",
  },
  {
    name: "Ông Bụt AI",
    category: { vi: "Hệ sinh thái giáo dục AI", en: "AI Education Ecosystem" },
    description: {
      vi: "Nền tảng giáo dục AI cho giáo viên và học sinh — chấm bài tự động, OCR tài liệu, học tập cá nhân hoá.",
      en: "AI education platform for teachers and students — auto grading, document OCR, personalized learning paths."
    },
    tags: ["AI", "Education", "LLM", "EdTech"],
    metric: { value: "4-in-1", label: { vi: "Học tập · Thi · Phân tích · AI", en: "Learn · Exam · Analytics · AI" } },
    icon: "🎓",
    accent: "#F47920",
  },
];

export function HomePage({
  content,
  services,
  caseStudies,
  blogPosts,
  locale
}: {
  content: Record<string, string>;
  services: Service[];
  caseStudies: CaseStudy[];
  blogPosts: BlogPost[];
  locale: Locale;
}) {
  const langPath = (path: string) => `${path}?lang=${locale}`;

  return (
    <>
      <section className="brand-surface relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-24 bg-white/80" />
        <div className="container-page relative grid min-h-[620px] items-center gap-10 py-12 md:py-16 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="reveal">
            <div className="eyebrow">Talents Trusted Partner for the AI Era</div>
            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-brand-navy md:text-5xl xl:text-6xl">
              {localize(
                locale,
                content.hero_title_vi || "Đối tác nhân lực IT và công nghệ đáng tin cậy cho kỷ nguyên AI",
                content.hero_title_en || "Build trusted IT teams and technology solutions for the AI era"
              )}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
              {localize(
                locale,
                content.hero_subtitle_vi ||
                  "ITSOL giúp doanh nghiệp mở rộng năng lực công nghệ thông qua IT staffing, outsourcing phần mềm, dedicated team, product development và AI solutions.",
                content.hero_subtitle_en ||
                  "ITSOL helps businesses scale technology capabilities through IT staffing, outsourcing, dedicated teams, product development, and AI solutions."
              )}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={langPath("/it-staffing")} className="btn btn-primary">
                {localize(locale, "Yêu cầu nhân sự", "Request Talent")}
              </Link>
              <Link href={langPath("/contact")} className="btn btn-secondary">
                {localize(locale, "Bắt đầu dự án", "Start a Project")}
              </Link>
              <Link href={langPath("/contact")} className="btn btn-ghost">
                {localize(locale, "Đặt lịch tư vấn", "Book Consultation")}
              </Link>
            </div>
          </div>
          <div className="reveal grid gap-4">
            <div className="brand-dark rounded-[8px] p-6 text-white shadow-soft">
              <div className="mb-7 inline-flex rounded-md bg-white px-3 py-2">
                <BrandLogo />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ["15+", localize(locale, "Năm kinh nghiệm", "Years")],
                  ["Top 10", localize(locale, "Ghi nhận CNTT", "ICT recognition")],
                  ["AI", localize(locale, "Sẵn sàng chuyển đổi", "Transformation ready")]
                ].map(([value, label]) => (
                  <div key={label} className="border-l border-white/20 pl-4">
                    <div className="text-3xl font-black md:text-4xl">{value}</div>
                    <div className="mt-2 text-xs uppercase text-white/62">{label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-lg bg-white p-5 text-brand-navy">
                <div className="text-sm font-bold text-brand-red">{localize(locale, "Quy trình phối hợp", "Engagement flow")}</div>
                <div className="mt-4 grid gap-3 text-sm font-semibold">
                  {localize(locale, "Gửi JD|Chốt yêu cầu|Shortlist ứng viên|Phỏng vấn|Onboard & scale", "Send JD|Shortlist talent|Interview|Onboard|Manage & scale").split("|").map((item, index) => (
                    <div key={item} className="flex items-center gap-3">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-red-50 text-xs text-brand-red">
                        {index + 1}
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="card p-5">
                <div className="text-sm font-bold text-brand-red">{localize(locale, "Cung ứng nhân lực IT", "Talent Supply")}</div>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {localize(locale, "Shortlist, phối hợp phỏng vấn, hỗ trợ onboard và mở rộng đội ngũ.", "Shortlist, interview coordination, onboarding support and team scaling.")}
                </p>
              </div>
              <div className="card p-5">
                <div className="text-sm font-bold text-brand-red">{localize(locale, "Đối tác công nghệ", "Technology Partner")}</div>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {localize(locale, "Phát triển phần mềm, managed team, ứng dụng AI và chuyển đổi số.", "Software delivery, managed teams, AI adoption and digital transformation.")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-white py-8">
        <div className="container-page grid gap-5 text-center md:grid-cols-4">
          {[
            ["15+ years", localize(locale, "Kinh nghiệm IT services và delivery", "IT services and delivery experience")],
            ["Top 10 ICT", localize(locale, "Khu vực ghi nhận/giải thưởng doanh nghiệp CNTT", "Recognition-ready corporate profile section")],
            ["Talent network", localize(locale, "Developer, tester, BA, PM, DevOps, Data và AI roles", "Developer, tester, BA, PM, DevOps, Data and AI roles")],
            ["AI-era partner", localize(locale, "Staffing, outsourcing, ODC và AI solutions", "Staffing, outsourcing, ODC and AI solutions")]
          ].map(([value, label]) => (
            <div key={value}>
              <div className="text-2xl font-black text-brand-navy">{value}</div>
              <div className="mt-2 text-sm leading-6 text-muted">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <SectionHeader
            eyebrow="Core services"
            title={localize(locale, "Năng lực công nghệ linh hoạt cho từng giai đoạn tăng trưởng", "Flexible technology capacity for every growth stage")}
            description={localize(locale, "ITSOL kết hợp thế mạnh nhân lực IT với năng lực phát triển phần mềm và triển khai AI thực dụng.", "ITSOL combines IT staffing strength with software delivery and AI implementation capability.")}
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Link key={service.slug} href={langPath(`/services/${service.slug}`)} className="card p-6 transition hover:-translate-y-1">
                <div className="text-sm font-black text-brand-red">{service.icon}</div>
                <h3 className="mt-4 text-xl font-black text-brand-navy">{localize(locale, service.title_vi, service.title_en)}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{localize(locale, service.summary_vi, service.summary_en)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-[#F8FAFC]">
        <div className="container-page">
          <SectionHeader
            eyebrow="Why ITSOL"
            title={localize(locale, "Được xây cho quan hệ đối tác dài hạn", "Built for long-term partnership, not one-off delivery")}
            description={localize(locale, "ITSOL giúp khách hàng đi nhanh hơn nhưng vẫn kiểm soát chất lượng nhân sự, governance kỹ thuật và mục tiêu kinh doanh.", "We help clients move fast while keeping hiring quality, engineering governance, and business alignment in view.")}
          />
          <div className="grid gap-5 md:grid-cols-4">
            {[
              [localize(locale, "Shortlist nhanh", "Fast shortlist"), localize(locale, "Nguồn ứng viên và quy trình sàng lọc cho nhu cầu tuyển IT gấp.", "Talent pipeline and screening process for urgent technical hiring.")],
              [localize(locale, "Governance delivery", "Delivery governance"), localize(locale, "Nhịp làm việc rõ, kiểm soát chất lượng, theo dõi rủi ro và truyền thông minh bạch.", "Clear cadence, quality control, risk tracking and transparent communication.")],
              [localize(locale, "Đội ngũ sẵn sàng AI", "AI-ready team"), localize(locale, "Năng lực triển khai AI thực dụng cho năng suất và tự động hóa.", "Practical AI implementation capability for productivity and automation.")],
              [localize(locale, "Mô hình linh hoạt", "Flexible models"), localize(locale, "Staffing, outsourcing, ODC và managed team trong một đối tác.", "Staffing, outsourcing, ODC and managed teams under one partner.")]
            ].map(([title, body]) => (
              <div key={title} className="card p-5">
                <h3 className="font-black text-brand-navy">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section brand-dark text-white">
        <div className="container-page grid gap-6 md:grid-cols-3">
          {[
            [
              "Mission",
              localize(locale, "Giúp doanh nghiệp xây dựng đội ngũ công nghệ tin cậy và triển khai sản phẩm số có giá trị kinh doanh rõ ràng.", "Help organizations build trusted technology teams and ship meaningful digital products with speed, transparency and measurable business value.")
            ],
            [
              "Vision",
              localize(locale, "Trở thành đối tác nhân lực IT và công nghệ hàng đầu từ Việt Nam cho doanh nghiệp trong kỷ nguyên AI.", "Become a leading Vietnam-based IT talent and technology partner for enterprises growing in the AI era.")
            ],
            [
              "Commitment",
              localize(locale, "Đồng hành dài hạn, nhân sự được sàng lọc, delivery có kỷ luật và ứng dụng AI thực dụng.", "Long-term partnership, qualified talent, disciplined delivery governance, and practical AI adoption instead of one-off implementation.")
            ]
          ].map(([title, body]) => (
            <div key={title} className="rounded-[8px] border border-white/16 bg-white/8 p-6">
              <div className="text-sm font-bold uppercase text-red-100">{title}</div>
              <p className="mt-4 text-lg font-semibold leading-8">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container-page grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="eyebrow">Case studies</div>
            <h2 className="mt-3 text-3xl font-black leading-tight text-brand-navy md:text-5xl">
              {localize(locale, "Kết quả trong nhân lực, phần mềm và AI", "Outcomes across talent, software and AI")}
            </h2>
            <p className="mt-5 leading-8 text-muted">
              {localize(locale, "Case study được trình bày theo kết quả kinh doanh để khách hàng thấy cách ITSOL giảm rủi ro delivery.", "Case studies are written as business outcomes, so customers can see how ITSOL reduces delivery risk.")}
            </p>
          </div>
          <div className="grid gap-4">
            {caseStudies.map((item) => (
              <div key={item.slug} className="card p-5">
                <div className="text-xs font-bold uppercase text-brand-red">{item.industry}</div>
                <h3 className="mt-2 text-xl font-black text-brand-navy">{localize(locale, item.title_vi, item.title_en)}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">{localize(locale, item.summary_vi, item.summary_en)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === KHÁCH HÀNG TIÊU BIỂU === */}
      <section className="section bg-white border-y border-line">
        <div className="container-page">
          <SectionHeader
            eyebrow={localize(locale, "Đối tác & khách hàng tiêu biểu", "Trusted clients & partners")}
            title={localize(locale, "Niềm tin từ các doanh nghiệp lớn tại Việt Nam", "Trusted by leading enterprises in Vietnam")}
            description={localize(locale, "ITSOL đã đồng hành cùng các tập đoàn, ngân hàng và doanh nghiệp công nghệ hàng đầu trong hơn 15 năm.", "Over 15 years, ITSOL has partnered with top corporations, banks, and technology companies across Vietnam.")}
          />
          {/* Scroll cards — snap on mobile, wrap on desktop */}
          <div className="-mx-4 px-4 md:mx-0 md:px-0">
            <div className="flex gap-4 overflow-x-auto pb-3 md:grid md:grid-cols-5 md:overflow-visible md:pb-0 snap-x snap-mandatory scrollbar-hide">
              {CLIENTS.map((client) => (
                <a
                  key={client.name}
                  href={client.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex-shrink-0 snap-start w-40 md:w-auto flex flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-md hover:border-brand-red/30"
                >
                  <div className="flex h-14 w-full items-center justify-center">
                    <img
                      src={client.logo}
                      alt={client.name}
                      className="max-h-12 max-w-[120px] w-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                      loading="lazy"
                    />
                  </div>
                  <span className="text-xs font-semibold text-muted group-hover:text-brand-navy transition-colors text-center leading-tight">
                    {client.name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* === DỰ ÁN TIÊU BIỂU === */}
      <section className="section bg-[#F8FAFC]">
        <div className="container-page">
          <SectionHeader
            eyebrow={localize(locale, "Dự án tiêu biểu", "Featured projects")}
            title={localize(locale, "Sản phẩm và giải pháp công nghệ ITSOL đã triển khai", "Technology products & solutions delivered by ITSOL")}
            description={localize(locale, "Từ AI banking đến giám sát thông minh và giáo dục số — ITSOL xây dựng sản phẩm thực chiến với kết quả đo lường được.", "From AI banking to intelligent surveillance and digital education — real-world products with measurable outcomes.")}
          />
          {/* Scroll cards — snap on mobile, 2-col on tablet, 4-col on desktop */}
          <div className="-mx-4 px-4 md:mx-0 md:px-0">
            <div className="flex gap-5 overflow-x-auto pb-3 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible md:pb-0 snap-x snap-mandatory scrollbar-hide">
              {FEATURED_PROJECTS.map((project) => (
                <div
                  key={project.name}
                  className="group flex-shrink-0 snap-start w-72 md:w-auto flex flex-col rounded-2xl border border-line bg-white shadow-soft overflow-hidden transition hover:-translate-y-1 hover:shadow-md"
                >
                  {/* Accent bar */}
                  <div className="h-1 w-full" style={{ background: project.accent }} />
                  <div className="p-6 flex flex-col flex-1 gap-3">
                    {/* Icon + category */}
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{project.icon}</span>
                      <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: project.accent }}>
                        {localize(locale, project.category.vi, project.category.en)}
                      </span>
                    </div>
                    {/* Name */}
                    <h3 className="text-lg font-black text-brand-navy leading-snug">{project.name}</h3>
                    {/* Description */}
                    <p className="text-sm leading-6 text-muted flex-1">
                      {localize(locale, project.description.vi, project.description.en)}
                    </p>
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                    {/* Metric */}
                    <div className="mt-2 flex items-center gap-3 rounded-xl border border-line bg-gray-50 px-4 py-3">
                      <span className="text-2xl font-black" style={{ color: project.accent }}>{project.metric.value}</span>
                      <span className="text-xs leading-4 text-muted">
                        {localize(locale, project.metric.label.vi, project.metric.label.en)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-brand-navy text-white">
        <div className="container-page grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <div className="eyebrow text-red-200">Ready to scale?</div>
            <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight md:text-5xl">
              {localize(locale, "Gửi JD hoặc brief dự án. ITSOL sẽ giúp bạn thiết kế đội ngũ phù hợp.", "Send your JD or product brief. ITSOL will help you shape the right team.")}
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={langPath("/it-staffing")} className="btn bg-white text-brand-navy">
              Send JD
            </Link>
            <Link href={langPath("/contact")} className="btn btn-primary">
              Contact ITSOL
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <SectionHeader eyebrow="Insights" title={localize(locale, "Góc nhìn cho đội ngũ công nghệ kỷ nguyên AI", "Thinking for the AI-era technology team")} />
          <div className="grid gap-5 md:grid-cols-2">
            {blogPosts.map((post) => (
              <Link key={post.slug} href={langPath("/blog")} className="card p-6">
                <div className="text-xs font-bold uppercase text-brand-red">{post.category}</div>
                <h3 className="mt-3 text-xl font-black text-brand-navy">{localize(locale, post.title_vi, post.title_en)}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{localize(locale, post.excerpt_vi, post.excerpt_en)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
