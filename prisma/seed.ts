import { createHash } from "node:crypto";
import { PrismaClient, TalentStatus, TimesheetStatus } from "@prisma/client";

const prisma = new PrismaClient();

function hashPassword(password: string) {
  const salt = process.env.JWT_SECRET || process.env.SESSION_SECRET || "itsol-dev-secret";
  return createHash("sha256").update(`${salt}:${password}`).digest("hex");
}

const talents = [
  ["ITS-FE-001", "Frontend Developer", "Senior", "React, Next.js, TypeScript, Tailwind CSS", 7, "Upper-Intermediate", "N4", "Immediate", "Hanoi", "Remote/Hybrid"],
  ["ITS-BE-002", "Backend Developer", "Senior", "Java, Spring Boot, Microservices, PostgreSQL", 8, "Intermediate", "N3", "2 weeks", "Hanoi", "Onsite/Hybrid"],
  ["ITS-FS-003", "Full-stack Developer", "Middle", "Node.js, React, GraphQL, MongoDB", 5, "Intermediate", "None", "Immediate", "Da Nang", "Remote"],
  ["ITS-MB-004", "Mobile Developer", "Senior", "Flutter, iOS, Android, Firebase", 6, "Intermediate", "N4", "1 month", "Hanoi", "Hybrid"],
  ["ITS-JV-005", "Java Developer", "Lead", "Java, Spring Cloud, Kafka, Banking", 10, "Upper-Intermediate", "N3", "2 weeks", "Hanoi", "Onsite"],
  ["ITS-DN-006", ".NET Developer", "Senior", ".NET Core, Azure, SQL Server, DDD", 8, "Intermediate", "None", "Immediate", "Ho Chi Minh", "Remote"],
  ["ITS-CC-007", "C/C++ Developer", "Senior", "C++, Linux, Embedded, IoT", 9, "Intermediate", "N3", "1 month", "Hanoi", "Onsite/Hybrid"],
  ["ITS-PH-008", "PHP Developer", "Middle", "Laravel, MySQL, Redis, REST API", 4, "Basic", "None", "Immediate", "Hanoi", "Remote"],
  ["ITS-QA-009", "Tester/QA/QC", "Middle", "Manual Testing, API Testing, Banking UAT", 5, "Intermediate", "N4", "Immediate", "Hanoi", "Hybrid"],
  ["ITS-AU-010", "Automation Tester", "Senior", "Playwright, Selenium, Cypress, CI/CD", 6, "Upper-Intermediate", "None", "2 weeks", "Remote", "Remote"],
  ["ITS-BA-011", "Business Analyst", "Senior", "Banking, BPMN, User Stories, SQL", 7, "Upper-Intermediate", "N3", "Immediate", "Hanoi", "Onsite"],
  ["ITS-PM-012", "Project Manager", "Lead", "Agile, Scrum, Delivery Governance, Banking", 11, "Advanced", "N3", "1 month", "Hanoi", "Hybrid"],
  ["ITS-SM-013", "Scrum Master", "Senior", "Scrum, Kanban, Jira, Team Facilitation", 8, "Advanced", "None", "2 weeks", "Hanoi", "Remote/Hybrid"],
  ["ITS-BR-014", "BrSE", "Senior", "Japanese Bridge, Requirement Analysis, Web Systems", 8, "Intermediate", "N2", "Immediate", "Hanoi", "Onsite/Hybrid"],
  ["ITS-JC-015", "Japanese Comtor", "Middle", "Japanese Interpretation, IT Documents, QA Support", 4, "Basic", "N2", "Immediate", "Hanoi", "Onsite"],
  ["ITS-SA-016", "Solution Architect", "Architect", "Enterprise Architecture, Cloud, Microservices, Security", 13, "Advanced", "N3", "1 month", "Hanoi", "Hybrid"],
  ["ITS-DO-017", "DevOps Engineer", "Senior", "AWS, Docker, Kubernetes, Terraform, CI/CD", 7, "Upper-Intermediate", "None", "2 weeks", "Remote", "Remote"],
  ["ITS-AI-018", "AI Engineer", "Senior", "Python, OCR, LLM, Computer Vision, MLOps", 6, "Upper-Intermediate", "None", "Immediate", "Hanoi", "Hybrid"],
  ["ITS-DE-019", "Data Engineer", "Middle", "Python, Spark, Airflow, PostgreSQL, Data Lake", 5, "Intermediate", "None", "Immediate", "Da Nang", "Remote"],
  ["ITS-SE-020", "Security Engineer", "Senior", "AppSec, ISO 27001, Pentest, Cloud Security", 8, "Upper-Intermediate", "None", "1 month", "Hanoi", "Hybrid"]
] as const;

const blogPosts = [
  ["it-staffing-vietnam-enterprise", "Staffing IT cho doanh nghiệp lớn: cần gì ngoài tốc độ?", "IT staffing for enterprises: what matters beyond speed?", "Staffing", "Cách đánh giá năng lực, governance và cam kết thay thế khi thuê nhân sự IT.", "How to evaluate skill, governance and replacement commitment when hiring IT talent."],
  ["odc-vietnam-playbook", "ODC tại Việt Nam: playbook xây đội ngũ bền vững", "Vietnam ODC playbook for sustainable teams", "ODC", "Các bước thiết kế dedicated team, vận hành, bảo mật và mở rộng năng lực.", "Steps to design, operate, secure and scale a dedicated engineering center."],
  ["banking-ekyc-ai", "AI eKYC trong ngân hàng: từ OCR tới chống gian lận", "AI eKYC in banking: from OCR to fraud detection", "Banking", "Những thành phần kỹ thuật quan trọng khi triển khai định danh điện tử.", "Core technical components for digital identity implementation."],
  ["software-outsourcing-governance", "Outsourcing phần mềm cần governance như thế nào?", "What governance does software outsourcing need?", "Outsourcing", "Một mô hình quản trị delivery giúp giảm rủi ro và tăng minh bạch.", "A delivery governance model that reduces risk and improves transparency."],
  ["ai-camera-enterprise-safety", "Camera AI cho an toàn nhà máy và trường học", "Camera AI for factory and school safety", "AI", "Biến camera thường thành hệ thống cảnh báo thông minh theo thời gian thực.", "Turn ordinary cameras into real-time intelligent alert systems."],
  ["mobile-engineering-quality", "Checklist chất lượng cho dự án mobile enterprise", "Quality checklist for enterprise mobile projects", "Software Engineering", "Từ kiến trúc, testing tới bảo mật và release mobile app.", "From architecture and testing to security and mobile app release."]
];

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@itsol.vn";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123456";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: hashPassword(adminPassword), role: "admin", name: "ITSOL Admin" },
    create: { email: adminEmail, passwordHash: hashPassword(adminPassword), role: "admin", name: "ITSOL Admin" }
  });

  for (const [code, role, seniority, skills, yearsExperience, englishLevel, japaneseLevel, availability, location, workingModel] of talents) {
    await prisma.talent.upsert({
      where: { code },
      update: {},
      create: {
        code,
        role,
        seniority,
        skills,
        yearsExperience,
        englishLevel,
        japaneseLevel,
        availability,
        location,
        workingModel,
        status: availability === "Immediate" ? TalentStatus.Available : TalentStatus.Interviewing,
        expectedRate: "Contact us for quotation",
        summary: `${seniority} ${role} with ${yearsExperience}+ years across ${skills}. Screened by ITSOL technical experts.`
      }
    });
  }

  const talent = await prisma.talent.findFirst();

  if ((await prisma.staffingRequest.count()) === 0) {
    await prisma.staffingRequest.createMany({
      data: [
      {
        companyName: "Demo Banking Client",
        contactPerson: "Procurement Lead",
        email: "client@example.com",
        phone: "+84 900 000 001",
        country: "Vietnam",
        serviceModel: "Hybrid",
        numberOfTalents: 5,
        role: "Java Developer",
        seniority: "Senior",
        technologyStack: "Java, Spring Boot, Oracle, Kafka",
        englishLevel: "Intermediate",
        japaneseLevel: "N/A",
        startDate: "ASAP",
        duration: "12 months",
        budgetRange: "Enterprise quotation",
        notes: "Core banking modernization squad",
        status: "MatchingTalents",
        owner: "Sales Team"
      },
      {
        companyName: "Demo AI Startup",
        contactPerson: "Founder",
        email: "founder@example.com",
        phone: "+65 800 000",
        country: "Singapore",
        serviceModel: "ODC",
        numberOfTalents: 4,
        role: "AI Engineer",
        seniority: "Middle/Senior",
        technologyStack: "Python, OCR, LLM, Computer Vision",
        englishLevel: "Upper-Intermediate",
        japaneseLevel: "N/A",
        startDate: "Next month",
        duration: "6 months",
        budgetRange: "Contact us",
        notes: "AI product lab setup",
        status: "Analyzing",
        owner: "ODC Lead"
      }
      ]
    });
  }

  if (talent && (await prisma.timesheet.count()) === 0) {
    await prisma.timesheet.createMany({
      data: [
        { talentId: talent.id, clientName: "Demo Banking Client", month: "2026-06", workingDays: 22, approvedDays: 21, overtimeHours: 8, status: TimesheetStatus.Approved, clientRating: 5, note: "Stable delivery, one approved leave day." },
        { talentId: talent.id, clientName: "Demo Retail Client", month: "2026-05", workingDays: 22, approvedDays: 22, overtimeHours: 4, status: TimesheetStatus.Billed, clientRating: 4, note: "Frontend sprint support." }
      ]
    });
  }

  if ((await prisma.job.count()) === 0) {
    await prisma.job.createMany({
      data: [
      { title: "Senior Java Developer", department: "Delivery", location: "Hanoi/Hybrid", level: "Senior", description: "Spring Boot, microservices, banking domain." },
      { title: "AI Engineer", department: "AI Lab", location: "Hanoi", level: "Middle/Senior", description: "OCR, LLM, Computer Vision, MLOps." },
      { title: "Business Analyst", department: "Consulting", location: "Hanoi", level: "Senior", description: "Banking, enterprise systems, stakeholder workshops." },
      { title: "DevOps Engineer", department: "Platform", location: "Remote", level: "Senior", description: "AWS/Azure, Docker, Kubernetes, CI/CD." },
      { title: "Japanese BrSE", department: "Japan Delivery", location: "Hanoi", level: "Senior", description: "N2+, bridge communication, requirement analysis." }
      ]
    });
  }

  for (const [slug, titleVi, titleEn, category, excerptVi, excerptEn] of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        titleVi,
        titleEn,
        category,
        excerptVi,
        excerptEn,
        contentVi: `${excerptVi}\n\nITSOL nhìn nhận chủ đề này từ góc độ vận hành thực tế: con người, quy trình, công nghệ và cam kết dài hạn với khách hàng.`,
        contentEn: `${excerptEn}\n\nITSOL approaches this topic from practical delivery: people, process, technology and long-term customer commitment.`
      }
    });
  }

  if ((await prisma.contactRequest.count()) === 0) {
    await prisma.contactRequest.createMany({
      data: [
      { name: "Nguyen Demo", company: "Enterprise Co.", email: "demo.contact@example.com", phone: "0900000000", service: "IT Staffing", message: "Need 3 senior Java developers for banking project." },
      { name: "Jane Client", company: "Global Product", email: "jane@example.com", phone: "+65 9000 0000", service: "Product Development", message: "Looking for MVP team in Vietnam." }
      ]
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
