import { z } from "zod";

const text = (min = 1, max = 5000) => z.string().trim().min(min).max(max);
const optionalText = (max = 5000) => z.string().trim().max(max).optional().or(z.literal(""));

export const contactSchema = z.object({
  name: text(2, 120),
  company: optionalText(160),
  email: z.email(),
  phone: optionalText(60),
  service: optionalText(120),
  message: text(10, 5000),
  attachment: optionalText(500)
});

export const staffingRequestSchema = z.object({
  companyName: text(2, 180),
  contactPerson: text(2, 120),
  email: z.email(),
  phone: text(6, 60),
  country: optionalText(100),
  serviceModel: text(2, 80),
  numberOfTalents: z.coerce.number().int().min(1).max(200),
  role: text(2, 120),
  seniority: text(2, 80),
  technologyStack: text(2, 1000),
  englishLevel: optionalText(80),
  japaneseLevel: optionalText(80),
  startDate: optionalText(80),
  duration: optionalText(80),
  budgetRange: optionalText(120),
  jobDescription: optionalText(500),
  notes: optionalText(5000),
  consent: z.coerce.boolean().optional()
});

export const talentRequestSchema = z.object({
  companyName: text(2, 180),
  contactPerson: text(2, 120),
  email: z.email(),
  phone: optionalText(60),
  message: optionalText(2000)
});

export const jobApplicationSchema = z.object({
  jobId: z.coerce.number().int().optional(),
  name: text(2, 120),
  email: z.email(),
  phone: optionalText(60),
  position: text(2, 140),
  cvUrl: optionalText(500),
  message: optionalText(3000)
});

export const productInquirySchema = z.object({
  product: text(2, 120),
  name: text(2, 120),
  company: optionalText(160),
  email: z.email(),
  phone: optionalText(60),
  message: optionalText(3000)
});

export const newsletterSchema = z.object({
  email: z.email(),
  locale: z.enum(["vi", "en"]).default("en")
});

export const talentSchema = z.object({
  code: text(2, 60),
  // Personal info
  fullName: optionalText(200),
  email: z.email().optional().or(z.literal("")),
  phone: optionalText(60),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.enum(["male", "female", "other"]).optional().nullable(),
  idNumber: optionalText(30),
  address: optionalText(500),
  department: optionalText(120),
  // Professional
  role: text(2, 120),
  seniority: text(2, 80),
  skills: text(2, 1000),
  yearsExperience: z.coerce.number().int().min(0).max(40),
  englishLevel: text(1, 80),
  japaneseLevel: text(1, 80),
  availability: text(1, 100),
  location: text(1, 120),
  workingModel: text(1, 120),
  status: z.enum(["Available", "Interviewing", "Assigned", "Unavailable", "Onboarded", "Onsite", "Inactive"]).default("Available"),
  expectedRate: optionalText(120),
  summary: text(5, 1500),
  // Contract
  contractType: optionalText(50),
  contractStart: z.string().optional().nullable(),
  contractEnd: z.string().optional().nullable(),
  contractNumber: optionalText(100),
  // Salary & benefits
  grossSalary: z.coerce.number().optional().nullable(),
  netSalary: z.coerce.number().optional().nullable(),
  socialInsurance: z.coerce.number().optional().nullable(),
  healthInsurance: z.coerce.number().optional().nullable(),
  otherAllowance: z.coerce.number().optional().nullable(),
  totalCost: z.coerce.number().optional().nullable(),
  // Billing
  billingRate: z.coerce.number().optional().nullable(),
  billingRate2: z.coerce.number().optional().nullable(),
  billingCurrency: optionalText(10),
});

export const timesheetSchema = z.object({
  talentId: z.coerce.number().int().positive(),
  clientName: text(2, 160),
  month: text(4, 20),
  workingDays: z.coerce.number().int().min(0).max(31),
  approvedDays: z.coerce.number().int().min(0).max(31),
  overtimeHours: z.coerce.number().int().min(0).max(240).default(0),
  status: z.enum(["Draft", "HRSubmitted", "CHRMApproved", "BODApproved", "ClientApproved", "Invoiced", "Disputed", "Submitted", "Approved", "Billed"]).default("Draft"),
  clientRating: z.coerce.number().int().min(1).max(5).optional(),
  note: optionalText(2000),
  projectId: z.coerce.number().int().positive().optional(),
  approvedBy: optionalText(100),
  invoiceRef: optionalText(100),
});

export const blogSchema = z.object({
  slug: text(2, 160),
  titleVi: text(2, 220),
  titleEn: text(2, 220),
  excerptVi: text(5, 500),
  excerptEn: text(5, 500),
  contentVi: text(10, 10000),
  contentEn: text(10, 10000),
  category: text(2, 100),
  published: z.coerce.boolean().default(true)
});

export function parseJson<T>(schema: z.ZodSchema<T>, value: unknown) {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    return { error: Response.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 }) };
  }
  return { data: parsed.data };
}
