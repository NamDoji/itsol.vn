import Link from "next/link";
import { BrandLogo } from "./BrandLogo";
import { ContactForm } from "./ContactForms";
import { SectionHeader } from "./SectionHeader";
import type { Locale } from "@/lib/i18n";
import { localize } from "@/lib/i18n";
import type { BlogPost, CaseStudy, Job, Service } from "@/lib/types";

export function InnerHero({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <section className="brand-surface py-16 md:py-24">
      <div className="container-page max-w-4xl">
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="mt-4 text-4xl font-black leading-tight text-brand-navy md:text-6xl">{title}</h1>
        <p className="mt-6 text-lg leading-8 text-muted">{description}</p>
      </div>
    </section>
  );
}

export function AboutPage({ locale }: { locale: Locale }) {
  return (
    <>
      <InnerHero
        eyebrow="About ITSOL"
        title={localize(locale, "Đối tác nhân lực IT và công nghệ đáng tin cậy từ Việt Nam", "A trusted IT talent and technology partner from Vietnam")}
        description={localize(locale, "ITSOL được xây dựng từ một niềm tin thực tế: doanh nghiệp cần con người đáng tin cậy, delivery có kỷ luật và công nghệ tạo ra tiến bộ đo lường được.", "ITSOL was built around a practical belief: businesses need reliable people, disciplined delivery, and technology that creates measurable progress.")}
      />
      <section className="section">
        <div className="container-page grid gap-6 md:grid-cols-3">
          {[
            [localize(locale, "Nền tảng nhân lực", "Talent core"), localize(locale, "Mạng lưới ứng viên IT và đội ngũ kỹ thuật cho nhu cầu gấp cũng như chiến lược dài hạn.", "A strong network of IT candidates and engineering teams for urgent and strategic needs.")],
            [localize(locale, "Tư duy delivery", "Delivery mindset"), localize(locale, "Kỷ luật phát triển phần mềm từ yêu cầu, kiến trúc, triển khai, QA đến vận hành.", "Software delivery discipline across requirement, architecture, implementation, QA and operation.")],
            [localize(locale, "Định hướng AI", "AI direction"), localize(locale, "Ứng dụng AI thực dụng cho năng suất, tự động hóa và chuyển đổi số.", "Practical AI adoption for productivity, automation and digital transformation.")]
          ].map(([title, body]) => (
            <div key={title} className="card p-6">
              <h2 className="text-xl font-black text-brand-navy">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="section brand-dark text-white">
        <div className="container-page grid gap-8 md:grid-cols-2">
          <div>
            <div className="eyebrow text-red-200">Vietnamese</div>
            <h2 className="mt-3 text-3xl font-black">Đối tác nhân lực IT và công nghệ đáng tin cậy</h2>
            <p className="mt-4 leading-8 text-white/72">
              ITSOL giúp doanh nghiệp xây dựng đội ngũ kỹ thuật, phát triển phần mềm và ứng dụng AI để tăng tốc
              chuyển đổi số.
            </p>
          </div>
          <div>
            <div className="eyebrow text-red-200">English</div>
            <h2 className="mt-3 text-3xl font-black">Talents Trusted Partner for the AI Era</h2>
            <p className="mt-4 leading-8 text-white/72">
              ITSOL helps businesses build engineering teams, deliver software products, and adopt AI-powered digital
              transformation.
            </p>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container-page grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="mb-6 inline-flex rounded-md border border-line bg-white px-3 py-2 shadow-soft">
              <BrandLogo />
            </div>
            <SectionHeader
              eyebrow="Mission, Vision & Values"
              title={localize(locale, "Phát triển bằng năng lực con người, kỷ luật delivery và AI thực dụng", "Grow through trusted people, delivery discipline, and practical AI")}
              description={localize(locale, "ITSOL định vị là đối tác song hành dài hạn: vừa cung cấp nhân lực IT tin cậy, vừa triển khai phần mềm và giải pháp AI có giá trị kinh doanh rõ ràng.", "ITSOL is positioned as a long-term partner that supplies trusted IT talent while delivering software and AI solutions with clear business value.")}
            />
          </div>
          <div className="grid gap-4">
            {[
              ["Mission", localize(locale, "Giúp doanh nghiệp xây dựng đội ngũ công nghệ đáng tin cậy, phát triển sản phẩm phần mềm chất lượng và ứng dụng AI để tăng năng suất, giảm rủi ro vận hành.", "Help businesses build trusted technology teams, deliver quality software products, and apply AI to improve productivity and reduce operational risk.")],
              [
                "Vision",
                localize(locale, "Trở thành đối tác nhân lực IT và công nghệ hàng đầu từ Việt Nam cho các doanh nghiệp trong khu vực, đặc biệt trong giai đoạn chuyển đổi sang mô hình vận hành có AI.", "Become a leading Vietnam-based IT talent and technology partner for regional enterprises, especially as operations shift into the AI era.")
              ],
              [
                "Core values",
                localize(locale, "Tin cậy trong cam kết, thực chiến trong triển khai, minh bạch trong phối hợp, học hỏi liên tục và đặt hiệu quả kinh doanh của khách hàng làm trọng tâm.", "Reliable commitments, practical execution, transparent collaboration, continuous learning, and customer business outcomes at the center.")
              ]
            ].map(([title, body]) => (
              <div key={title} className="card p-6">
                <h2 className="text-xl font-black text-brand-navy">{title}</h2>
                <p className="mt-3 leading-8 text-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section bg-[#F8FAFC]">
        <div className="container-page">
          <SectionHeader
            eyebrow="Recognition & Credentials"
            title={localize(locale, "Nền tảng niềm tin cho khách hàng doanh nghiệp", "Trust signals for enterprise customers")}
            description={localize(locale, "Khu vực này dùng để thể hiện các giải thưởng, chứng nhận và cột mốc uy tín của ITSOL. Nội dung có thể cập nhật qua CMS khi có danh sách chứng nhận chính thức.", "This section presents ITSOL awards, certifications, and credibility milestones. It can be updated in CMS when the official recognition list is available.")}
          />
          <div className="grid gap-5 md:grid-cols-4">
            {[
              ["Top 10 ICT company", localize(locale, "Vinh danh/định vị nhóm doanh nghiệp CNTT tiêu biểu, sẵn sàng cập nhật năm và hạng mục chính xác.", "Recognition-ready area for ICT company awards, ready to update with exact year and category.")],
              ["15+ years experience", localize(locale, "Kinh nghiệm đồng hành cùng doanh nghiệp trong nhân lực IT, outsourcing và hệ thống phần mềm.", "Experience supporting enterprises in IT talent, outsourcing, and software systems.")],
              ["Enterprise delivery", localize(locale, "Quy trình làm việc rõ ràng cho yêu cầu, tiến độ, chất lượng, bảo mật và phối hợp đa bên.", "Clear working process for requirements, progress, quality, security, and stakeholder collaboration.")],
              ["AI transformation", localize(locale, "Năng lực triển khai chatbot, RAG, automation, OCR, dashboard và trợ lý AI nội bộ.", "Capability to deliver chatbots, RAG, automation, OCR, dashboards, and internal AI assistants.")]
            ].map(([title, body]) => (
              <div key={title} className="card p-5">
                <h3 className="font-black text-brand-navy">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function ListingPage({
  eyebrow,
  title,
  description,
  items
}: {
  eyebrow: string;
  title: string;
  description: string;
  items: { title: string; meta?: string; body: string; href?: string }[];
}) {
  return (
    <>
      <InnerHero eyebrow={eyebrow} title={title} description={description} />
      <section className="section">
        <div className="container-page grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const content = (
              <div className="card h-full p-6 transition hover:-translate-y-1">
                {item.meta ? <div className="text-xs font-bold uppercase text-brand-red">{item.meta}</div> : null}
                <h2 className="mt-2 text-xl font-black text-brand-navy">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted">{item.body}</p>
              </div>
            );
            return item.href ? (
              <Link href={item.href} key={item.title}>
                {content}
              </Link>
            ) : (
              <div key={item.title}>{content}</div>
            );
          })}
        </div>
      </section>
    </>
  );
}

export function ServiceDetail({ service, locale }: { service: Service; locale: Locale }) {
  const details = serviceDetails[service.slug] || serviceDetails.default;
  const langPath = (path: string) => `${path}?lang=${locale}`;

  return (
    <>
      <InnerHero
        eyebrow="Service"
        title={localize(locale, service.title_vi, service.title_en)}
        description={localize(locale, service.summary_vi, service.summary_en)}
      />
      <section className="section">
        <div className="container-page grid gap-8 lg:grid-cols-[1fr_360px]">
          <article className="prose max-w-none">
            <h2 className="text-3xl font-black text-brand-navy">{localize(locale, "ITSOL hỗ trợ như thế nào", "How ITSOL helps")}</h2>
            <p className="mt-4 text-lg leading-8 text-muted">{localize(locale, service.body_vi, service.body_en)}</p>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {details.map((group) => (
                <div key={group.title_en} className="card p-6">
                  <h3 className="text-xl font-black text-brand-navy">{localize(locale, group.title_vi, group.title_en)}</h3>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-muted">
                    {localize(locale, group.items_vi, group.items_en).map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-red" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <h3 className="mt-10 text-2xl font-black text-brand-navy">{localize(locale, "Tóm tắt song ngữ", "Bilingual overview")}</h3>
            <p className="mt-4 leading-8 text-muted">{localize(locale, service.body_en, service.body_vi)}</p>
          </article>
          <aside className="card h-fit p-6">
            <div className="eyebrow">CTA</div>
            <h3 className="mt-3 text-2xl font-black text-brand-navy">{localize(locale, "Bạn cần năng lực này?", "Need this capability?")}</h3>
            <p className="mt-3 text-sm leading-7 text-muted">{localize(locale, "Gửi brief hoặc JD. ITSOL sẽ phản hồi với phương án phù hợp.", "Send your brief or JD. ITSOL will respond with a suitable approach.")}</p>
            <Link href={service.slug === "it-staffing" ? langPath("/it-staffing") : langPath("/contact")} className="btn btn-primary mt-5 w-full">
              {service.slug === "it-staffing" ? "Send JD" : localize(locale, "Bắt đầu dự án", "Start a Project")}
            </Link>
          </aside>
        </div>
      </section>
    </>
  );
}

const serviceDetails: Record<string, { title_vi: string; title_en: string; items_vi: string[]; items_en: string[] }[]> = {
  "it-staffing": [
    {
      title_vi: "Phạm vi",
      title_en: "Scope",
      items_vi: [
        "Developer, tester, BA, PM, DevOps, data engineer, AI engineer và các vai trò IT chuyên sâu.",
        "Hiệu chỉnh JD, chiến lược sourcing, sàng lọc, shortlist, phối hợp phỏng vấn và hỗ trợ offer.",
        "Tăng cường nhân sự ngắn hạn, hỗ trợ tuyển dài hạn và cung ứng nhân lực theo dự án."
      ],
      items_en: [
        "Developer, tester, BA, PM, DevOps, data engineer, AI engineer and niche technical roles.",
        "JD calibration, sourcing strategy, screening, shortlist, interview coordination and offer support.",
        "Short-term augmentation, long-term hiring support and project-based talent supply."
      ]
    },
    {
      title_vi: "Giá trị kinh doanh",
      title_en: "Business value",
      items_vi: [
        "Rút ngắn thời gian tuyển dụng nhưng vẫn giữ tiêu chuẩn kỹ thuật và độ phù hợp văn hóa.",
        "Cải thiện chất lượng ứng viên nhờ pipeline có cấu trúc và hiểu đúng yêu cầu vai trò.",
        "Hỗ trợ onboarding và phương án thay thế để bảo vệ nhịp delivery."
      ],
      items_en: [
        "Reduce hiring lead time while keeping technical and culture-fit screening visible.",
        "Improve candidate quality with a structured pipeline and practical role understanding.",
        "Support onboarding and replacement coordination so delivery momentum is protected."
      ]
    }
  ],
  "software-outsourcing": [
    {
      title_vi: "Phạm vi",
      title_en: "Scope",
      items_vi: [
        "Web, mobile, backend, tích hợp API, workflow doanh nghiệp và hệ thống cloud-ready.",
        "Discovery, UX/UI, kiến trúc, phát triển, kiểm thử, release và bảo trì.",
        "Thiết lập đội ngũ linh hoạt cho dự án fixed-scope hoặc roadmap sản phẩm agile."
      ],
      items_en: [
        "Web, mobile, backend, API integration, enterprise workflows and cloud-ready systems.",
        "Discovery, UX/UI, architecture, development, testing, release and maintenance.",
        "Flexible team setup for fixed-scope projects or agile product roadmaps."
      ]
    },
    {
      title_vi: "Quản trị delivery",
      title_en: "Governance",
      items_vi: [
        "Nhịp delivery rõ ràng, báo cáo sprint, theo dõi rủi ro và checkpoint chất lượng.",
        "Tiêu chuẩn kỹ thuật cho code review, testing, tài liệu và khả năng bảo trì.",
        "Truyền thông minh bạch với stakeholders kinh doanh và chủ sở hữu kỹ thuật."
      ],
      items_en: [
        "Clear delivery cadence, sprint reporting, risk tracking and quality checkpoints.",
        "Engineering standards for code review, testing, documentation and maintainability.",
        "Transparent communication with business stakeholders and technical owners."
      ]
    }
  ],
  "dedicated-team-odc": [
    {
      title_vi: "Mô hình đội ngũ",
      title_en: "Team model",
      items_vi: [
        "Kỹ sư, QA, BA, PM và technical leadership chuyên trách theo backlog khách hàng.",
        "Managed team có báo cáo, theo dõi hiệu suất và kỷ luật delivery.",
        "Scale up hoặc down theo roadmap, ngân sách và áp lực tiến độ."
      ],
      items_en: [
        "Dedicated engineers, QA, BA, PM and technical leadership aligned with client backlog.",
        "Managed team operation with reporting, performance follow-up and delivery discipline.",
        "Scale up or down based on roadmap, budget and delivery pressure."
      ]
    },
    {
      title_vi: "Phù hợp nhất",
      title_en: "Best fit",
      items_vi: [
        "Phát triển sản phẩm dài hạn, nơi tri thức dự án cần được giữ ổn định.",
        "Hệ thống doanh nghiệp cần năng lực ổn định và nhịp delivery dự đoán được.",
        "Khách hàng muốn kiểm soát và minh bạch mà không phải tự xây mọi vai trò nội bộ."
      ],
      items_en: [
        "Long-term product development where knowledge retention matters.",
        "Enterprise systems that need stable capacity and predictable delivery rhythm.",
        "Clients who want control and transparency without building every role internally."
      ]
    }
  ],
  "ai-solutions": [
    {
      title_vi: "Use case",
      title_en: "Use cases",
      items_vi: [
        "RAG knowledge base, AI assistant nội bộ, chatbot, OCR và xử lý tài liệu.",
        "Workflow automation, trợ lý báo cáo, tìm kiếm dữ liệu và productivity copilot.",
        "Tích hợp AI vào CRM, ERP, HRM, LMS và workflow chăm sóc khách hàng."
      ],
      items_en: [
        "RAG knowledge base, internal AI assistant, chatbot, OCR and document processing.",
        "Workflow automation, reporting assistant, data search and productivity copilots.",
        "AI integration into existing CRM, ERP, HRM, LMS and customer service workflows."
      ]
    },
    {
      title_vi: "Cách tiếp cận",
      title_en: "Approach",
      items_vi: [
        "Bắt đầu từ quy trình kinh doanh, không chạy theo công nghệ.",
        "Prototype nhanh, đo giá trị, rồi hoàn thiện bảo mật, dữ liệu và vận hành.",
        "Kết hợp AI engineering với software delivery để pilot trở thành hệ thống dùng được."
      ],
      items_en: [
        "Start from a business process, not from technology hype.",
        "Prototype quickly, measure value, then harden security, data access and operations.",
        "Combine AI engineering with software delivery so pilots can become usable systems."
      ]
    }
  ],
  "product-development": [
    {
      title_vi: "Từ ý tưởng tới sản phẩm",
      title_en: "From idea to product",
      items_vi: [
        "Định hình bài toán, user journey, UX/UI prototype, phạm vi MVP và kiến trúc kỹ thuật.",
        "Phát triển agile với kế hoạch release, analytics và vòng phản hồi.",
        "Mở rộng module, tích hợp và vận hành sau khi sản phẩm được kiểm chứng."
      ],
      items_en: [
        "Problem framing, user journey, UX/UI prototype, MVP scope and technical architecture.",
        "Agile development with release planning, analytics and feedback loops.",
        "Scale product modules, integrations and operations after market validation."
      ]
    },
    {
      title_vi: "Kỷ luật sản phẩm",
      title_en: "Product discipline",
      items_vi: [
        "Cân bằng mục tiêu kinh doanh, trải nghiệm người dùng, chi phí và nợ kỹ thuật.",
        "Ưu tiên tính năng theo tác động, độ phức tạp và tín hiệu sử dụng.",
        "Giữ roadmap, delivery và quyết định kỹ thuật minh bạch với founder/stakeholder."
      ],
      items_en: [
        "Balance business goals, user experience, cost and technical debt.",
        "Prioritize features by impact, complexity and adoption signals.",
        "Keep roadmap, delivery and technical decisions visible to founders and stakeholders."
      ]
    }
  ],
  default: [
    {
      title_vi: "Phạm vi",
      title_en: "Scope",
      items_vi: ["Tư vấn, thiết lập đội ngũ, triển khai, kiểm thử và cải tiến liên tục."],
      items_en: ["Consulting, team setup, implementation, testing and ongoing improvement."]
    },
    {
      title_vi: "Giá trị",
      title_en: "Value",
      items_vi: ["Mô hình thực thi rõ ràng, quản trị delivery thực dụng và kết quả đo lường được."],
      items_en: ["Clear execution model, practical delivery governance and measurable outcomes."]
    }
  ]
};

export function ContactPage({ locale }: { locale: Locale }) {
  return (
    <>
      <InnerHero
        eyebrow="Contact"
        title={localize(locale, "Cho ITSOL biết bạn cần xây dựng, tuyển dụng hay chuyển đổi điều gì", "Tell ITSOL what you need to build, hire or transform")}
        description={localize(locale, "Dùng form bên dưới cho tư vấn dự án, trao đổi hợp tác hoặc liên hệ chung.", "Use the form below for project consultation, partnership discussion, or general contact.")}
      />
      <section className="section">
        <div className="container-page grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <div className="eyebrow">Office</div>
            <h2 className="mt-3 text-3xl font-black text-brand-navy">ITSOL Vietnam</h2>
            <p className="mt-4 leading-8 text-muted">
              {localize(locale, "Hà Nội, Việt Nam. Để phản hồi nhanh hơn, vui lòng gửi mục tiêu kinh doanh, timeline và profile đội ngũ mong muốn.", "Hanoi, Vietnam. For faster response, include your business objective, timeline and expected team profile.")}
            </p>
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}

export function ItStaffingLanding({ locale }: { locale: Locale }) {
  const langPath = (path: string) => `${path}?lang=${locale}`;

  return (
    <>
      <section className="bg-brand-navy py-16 text-white md:py-24">
        <div className="container-page grid items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <div className="eyebrow text-red-200">IT Staffing Landing Page</div>
            <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">{localize(locale, "Xây dựng đội ngũ IT nhanh hơn với ITSOL", "Build your IT team faster with ITSOL")}</h1>
            <p className="mt-6 text-lg leading-8 text-white/72">
              {localize(locale, "Gửi JD cho ITSOL. Chúng tôi phân tích yêu cầu, shortlist ứng viên phù hợp, phối hợp phỏng vấn và hỗ trợ onboarding.", "Send your JD. ITSOL will analyze the requirement, shortlist matching candidates, coordinate interviews and support onboarding.")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#request" className="btn btn-primary">
                {localize(locale, "Yêu cầu nhân sự", "Request Talent")}
              </a>
              <Link href={langPath("/contact")} className="btn bg-white text-brand-navy">
                {localize(locale, "Đặt lịch tư vấn", "Book Consultation")}
              </Link>
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 text-brand-navy">
            <div className="grid gap-4">
              {localize(locale, "Gửi JD|Chốt yêu cầu|Shortlist ứng viên|Hỗ trợ phỏng vấn|Onboard và quản lý", "Send JD|Requirement calibration|Candidate shortlist|Interview support|Onboard and manage").split("|").map(
                (step, index) => (
                  <div key={step} className="flex items-center gap-4 rounded-lg border border-line p-4">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-red-50 font-black text-brand-red">
                      {index + 1}
                    </span>
                    <span className="font-bold">{step}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>
      <section className="section" id="request">
        <div className="container-page grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <SectionHeader
              eyebrow="Request Talent"
              title={localize(locale, "Chia sẻ vị trí bạn đang cần", "Share the roles you need")}
              description={localize(locale, "ITSOL có thể hỗ trợ developer, tester, BA, PM, DevOps, data và AI roles.", "ITSOL can support developers, testers, BA, PM, DevOps, data and AI roles.")}
            />
          </div>
          <ContactForm mode="talent" />
        </div>
      </section>
    </>
  );
}

export function CareersPage({ jobs, locale }: { jobs: Job[]; locale: Locale }) {
  return (
    <ListingPage
      eyebrow="Careers"
      title={localize(locale, "Gia nhập đội ngũ xây dựng phần mềm, mạng lưới nhân tài và giải pháp AI", "Join teams building software, talent networks and AI solutions")}
      description={localize(locale, "Các vị trí mở cho engineering, AI delivery và talent operations.", "Open roles for engineering, AI delivery and talent operations.")}
      items={jobs.map((job) => ({
        title: job.title,
        meta: `${job.department} / ${job.location} / ${job.level}`,
        body: job.description
      }))}
    />
  );
}

export function BlogPage({ posts, locale }: { posts: BlogPost[]; locale: Locale }) {
  return (
    <ListingPage
      eyebrow="Insights"
      title={localize(locale, "Góc nhìn thực tế về nhân lực IT, delivery và AI", "Practical thinking for IT talent, delivery and AI")}
      description={localize(locale, "Trung tâm nội dung cho insight thị trường, giáo dục dịch vụ và SEO.", "Draft content hub for market insight, service education and SEO.")}
      items={posts.map((post) => ({
        title: localize(locale, post.title_vi, post.title_en),
        meta: post.category,
        body: localize(locale, post.excerpt_vi, post.excerpt_en)
      }))}
    />
  );
}

export function CaseStudiesPage({ items, locale }: { items: CaseStudy[]; locale: Locale }) {
  return (
    <ListingPage
      eyebrow="Case Studies"
      title={localize(locale, "Dẫn chứng năng lực theo ngành và mô hình delivery", "Proof points across industries and delivery models")}
      description={localize(locale, "Các câu chuyện theo kết quả cho thấy ITSOL giúp khách hàng mở rộng năng lực và delivery.", "Outcome-focused stories showing how ITSOL helps clients scale capacity and delivery.")}
      items={items.map((item) => ({
        title: localize(locale, item.title_vi, item.title_en),
        meta: item.industry,
        body: localize(locale, `${item.summary_vi} ${item.impact_vi}`, `${item.summary_en} ${item.impact_en}`)
      }))}
    />
  );
}
