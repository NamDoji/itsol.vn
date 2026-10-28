/**
 * POST /api/admin/seed-staff
 * Tạo dữ liệu mẫu nhân sự cho Talent Pool và Company Staff
 */
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";

const SAMPLE_STAFF = [
  { code: "SOL-DEV-001", fullName: "Nguyễn Văn An", role: "Senior Backend Developer", department: "Engineering", seniority: "Senior", yearsExperience: 7, skills: "Node.js, TypeScript, PostgreSQL, Redis, Docker, Microservices", englishLevel: "B2", japaneseLevel: "None", location: "Hà Nội", workingModel: "Remote", status: "Available", grossSalary: 35000000, billingRate: 40000000, contractType: "fulltime", gender: "male" },
  { code: "SOL-DEV-002", fullName: "Trần Thị Bình", role: "Frontend Developer", department: "Engineering", seniority: "Mid", yearsExperience: 4, skills: "React, Next.js, TypeScript, TailwindCSS, Vue.js", englishLevel: "B1", japaneseLevel: "None", location: "Hà Nội", workingModel: "Hybrid", status: "Available", grossSalary: 22000000, billingRate: 28000000, contractType: "fulltime", gender: "female" },
  { code: "SOL-DEV-003", fullName: "Lê Minh Cường", role: "Full-stack Developer", department: "Engineering", seniority: "Senior", yearsExperience: 6, skills: "React, Node.js, PostgreSQL, AWS, TypeScript, GraphQL", englishLevel: "B2", japaneseLevel: "N3", location: "Hà Nội", workingModel: "Onsite", status: "Onboarded", grossSalary: 38000000, billingRate: 45000000, contractType: "fulltime", gender: "male" },
  { code: "SOL-DEV-004", fullName: "Phạm Quỳnh Hương", role: "Mobile Developer (React Native)", department: "Engineering", seniority: "Senior", yearsExperience: 5, skills: "React Native, iOS, Android, TypeScript, Firebase, Redux", englishLevel: "B2", japaneseLevel: "None", location: "TP.HCM", workingModel: "Remote", status: "Available", grossSalary: 32000000, billingRate: 38000000, contractType: "fulltime", gender: "female" },
  { code: "SOL-DEV-005", fullName: "Hoàng Đức Mạnh", role: "Java/.NET Developer", department: "Engineering", seniority: "Senior", yearsExperience: 8, skills: "Java, Spring Boot, .NET, C#, SQL Server, Oracle, Microservices", englishLevel: "B1", japaneseLevel: "N2", location: "Hà Nội", workingModel: "Onsite", status: "Assigned", grossSalary: 42000000, billingRate: 50000000, contractType: "fulltime", gender: "male" },
  { code: "SOL-QA-001", fullName: "Vũ Thị Lan", role: "QA/Test Engineer", department: "QA", seniority: "Mid", yearsExperience: 4, skills: "Selenium, Cypress, Postman, Jira, TestNG, Python, Appium", englishLevel: "B1", japaneseLevel: "None", location: "Hà Nội", workingModel: "Hybrid", status: "Available", grossSalary: 18000000, billingRate: 22000000, contractType: "fulltime", gender: "female" },
  { code: "SOL-QA-002", fullName: "Đinh Văn Tùng", role: "Senior QA Engineer", department: "QA", seniority: "Senior", yearsExperience: 6, skills: "Automation Testing, Selenium, K6, Performance Testing, SQL", englishLevel: "B2", japaneseLevel: "N3", location: "Hà Nội", workingModel: "Onsite", status: "Assigned", grossSalary: 28000000, billingRate: 35000000, contractType: "fulltime", gender: "male" },
  { code: "SOL-PM-001", fullName: "Ngô Thị Mai", role: "Project Manager", department: "Management", seniority: "Senior", yearsExperience: 9, skills: "Agile, Scrum, Jira, Confluence, Risk Management, PMP", englishLevel: "C1", japaneseLevel: "N2", location: "Hà Nội", workingModel: "Onsite", status: "Available", grossSalary: 50000000, billingRate: 60000000, contractType: "fulltime", gender: "female" },
  { code: "SOL-BA-001", fullName: "Trương Hữu Khoa", role: "Business Analyst", department: "Management", seniority: "Mid", yearsExperience: 4, skills: "Requirements Analysis, UML, BPMN, SQL, Figma, Jira", englishLevel: "B2", japaneseLevel: "N3", location: "Hà Nội", workingModel: "Hybrid", status: "Available", grossSalary: 24000000, billingRate: 30000000, contractType: "fulltime", gender: "male" },
  { code: "SOL-DEVOPS-001", fullName: "Bùi Quang Minh", role: "DevOps/Cloud Engineer", department: "Infrastructure", seniority: "Senior", yearsExperience: 6, skills: "AWS, GCP, Kubernetes, Docker, Terraform, CI/CD, Linux", englishLevel: "B2", japaneseLevel: "None", location: "TP.HCM", workingModel: "Remote", status: "Available", grossSalary: 45000000, billingRate: 55000000, contractType: "fulltime", gender: "male" },
  { code: "SOL-AI-001", fullName: "Phan Thị Hồng Nhung", role: "AI/ML Engineer", department: "AI Lab", seniority: "Senior", yearsExperience: 5, skills: "Python, TensorFlow, PyTorch, LLM, RAG, OpenCV, FastAPI", englishLevel: "C1", japaneseLevel: "None", location: "Hà Nội", workingModel: "Remote", status: "Available", grossSalary: 55000000, billingRate: 70000000, contractType: "fulltime", gender: "female" },
  { code: "SOL-HR-001", fullName: "Nguyễn Thị Thùy Linh", role: "HR Manager", department: "HR", seniority: "Mid", yearsExperience: 5, skills: "Recruitment, HR Management, Labor Law, Training, HRIS", englishLevel: "B2", japaneseLevel: "None", location: "Hà Nội", workingModel: "Onsite", status: "Available", grossSalary: 22000000, contractType: "fulltime", gender: "female" },
  { code: "SOL-BOD-001", fullName: "Đỗ Chí Cường", role: "CEO", department: "BOD", seniority: "Lead", yearsExperience: 15, skills: "Leadership, Strategy, Business Development, Technology", englishLevel: "C1", japaneseLevel: "N2", location: "Hà Nội", workingModel: "Onsite", status: "Available", grossSalary: 80000000, contractType: "fulltime", gender: "male" },
  { code: "SOL-BrSE-001", fullName: "Kitagawa Takashi", role: "BrSE (Bridge Software Engineer)", department: "Japan Bridge", seniority: "Senior", yearsExperience: 8, skills: "Japanese Bridge, Requirement Analysis, Java, Spring, Agile", englishLevel: "B1", japaneseLevel: "N1", location: "Hà Nội", workingModel: "Onsite", status: "Assigned", grossSalary: 65000000, billingRate: 90000000, billingCurrency: "VND", contractType: "fulltime", gender: "male" },
  { code: "SOL-INTERN-001", fullName: "Lý Minh Tuấn", role: "Intern Frontend", department: "Engineering", seniority: "Junior", yearsExperience: 0, skills: "HTML, CSS, JavaScript, React, Git", englishLevel: "B1", japaneseLevel: "None", location: "Hà Nội", workingModel: "Onsite", status: "Available", grossSalary: 5000000, contractType: "intern", gender: "male" },
];

export async function POST() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const existingCodes = new Set(
    (await prisma.talent.findMany({ select: { code: true } })).map(t => t.code)
  );

  let created = 0, skipped = 0;
  for (const staff of SAMPLE_STAFF) {
    if (existingCodes.has(staff.code)) { skipped++; continue; }
    try {
      const s = staff as Record<string, unknown>;
      await prisma.talent.create({
        data: {
          code:            s.code as string,
          fullName:        s.fullName as string,
          role:            s.role as string,
          department:      s.department as string,
          seniority:       s.seniority as string,
          yearsExperience: s.yearsExperience as number,
          skills:          s.skills as string,
          englishLevel:    s.englishLevel as string,
          japaneseLevel:   s.japaneseLevel as string,
          location:        s.location as string,
          workingModel:    s.workingModel as string,
          status:          (s.status === "Available" || s.status === "Interviewing" || s.status === "Assigned" ? s.status : "Available") as "Available" | "Interviewing" | "Assigned",
          grossSalary:     (s.grossSalary as number) ?? null,
          billingRate:     (s.billingRate as number) ?? null,
          billingRate2:    (s.billingRate2 as number) ?? null,
          billingCurrency: (s.billingCurrency as string) ?? "VND",
          contractType:    s.contractType as string,
          gender:          s.gender as string,
          availability:    "Immediate",
          summary:         `${s.fullName} — ${s.role} tại ITSOL. ${s.yearsExperience} năm kinh nghiệm.`,
        },
      });
      created++;
    } catch (e) {
      console.error("Seed error:", (e as Error).message.slice(0, 80));
    }
  }

  const total = await prisma.talent.count();
  return Response.json({
    ok: true,
    created, skipped,
    totalStaff: total,
    message: `Đã tạo ${created} nhân sự mẫu (bỏ qua ${skipped} đã có). Tổng: ${total} nhân sự.`,
  });
}
