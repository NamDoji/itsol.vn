import { prisma } from "../lib/prisma";

const jobs = [
  {
    title: "Senior Java Developer",
    department: "Engineering",
    location: "Hà Nội / Remote",
    level: "Senior",
    description:
      "Tham gia phát triển hệ thống Banking & Fintech. Yêu cầu 4+ năm Java Spring Boot, microservices.",
    published: true,
  },
  {
    title: "Frontend Developer (React)",
    department: "Engineering",
    location: "Hà Nội / Hybrid",
    level: "Mid",
    description:
      "Xây dựng UI cho các sản phẩm fintech và AI. Yêu cầu 2+ năm React/TypeScript.",
    published: true,
  },
  {
    title: "Business Analyst",
    department: "Delivery",
    location: "Hà Nội",
    level: "Mid-Senior",
    description:
      "Phân tích nghiệp vụ cho khách hàng Banking. Yêu cầu 3+ năm BA, hiểu quy trình ngân hàng.",
    published: true,
  },
  {
    title: "DevOps Engineer",
    department: "Infrastructure",
    location: "Remote",
    level: "Senior",
    description:
      "Quản lý hạ tầng cloud AWS/GCP, CI/CD, Kubernetes. 3+ năm kinh nghiệm DevOps.",
    published: true,
  },
  {
    title: "AI/ML Engineer",
    department: "AI Lab",
    location: "Hà Nội",
    level: "Senior",
    description:
      "Phát triển mô hình AI cho sản phẩm OCR, Computer Vision. Python, PyTorch, 3+ năm.",
    published: true,
  },
];

async function main() {
  const count = await prisma.job.count();
  if (count === 0) {
    await prisma.job.createMany({ data: jobs });
    console.log(`✅ Seeded ${jobs.length} jobs successfully.`);
  } else {
    console.log(`ℹ️  Jobs already exist (${count} records), skipping seed.`);
  }
}

main()
  .catch(err => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
