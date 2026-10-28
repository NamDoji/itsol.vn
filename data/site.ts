export type Locale = "vi" | "en";

export function t(locale: Locale, vi: string, en: string): string {
  return locale === "vi" ? vi : en;
}

export const contactInfo = {
  email: "info@itsol.vn",
  phone: "+84 24 6666 8866",
  address: "Hà Nội, Việt Nam",
};

// Thông tin pháp lý theo Giấy chứng nhận ĐKDN (đăng ký thay đổi lần 9, 15/05/2026)
export const companyInfo = {
  nameVi: "Công ty Cổ phần Phần mềm ITSOL Holdings",
  nameEn: "ITSOL Holdings Software Joint Stock Company",
  shortName: "ITSOL HOLDINGS., JSC",
  taxCode: "0106199152",
  issuedDate: "06/06/2013",
  issuedByVi: "Phòng Đăng ký kinh doanh và Tài chính doanh nghiệp – Sở Tài chính thành phố Hà Nội",
  issuedByEn: "Business Registration and Corporate Finance Office – Hanoi Department of Finance",
  addressVi: "Số 21 Hẻm 93/83/69 Hoàng Văn Thái, Phường Phương Liệt, Thành phố Hà Nội, Việt Nam",
  addressEn: "No. 21, Alley 93/83/69 Hoang Van Thai, Phuong Liet Ward, Hanoi, Vietnam",
  hotline: "0904 290 583",
  // Link hồ sơ trên online.gov.vn — để null cho tới khi website được Bộ Công Thương xác nhận thông báo
  bctNotificationUrl: null as string | null,
};

export const products = [
  {
    slug: "master-ekyc",
    name: "Master eKYC",
    category: { vi: "Xác thực danh tính", en: "Identity Verification" },
    summary: {
      vi: "Giải pháp xác thực danh tính điện tử toàn diện — OCR giấy tờ, nhận diện khuôn mặt, phát hiện giả mạo theo chuẩn VNePay & NAPAS.",
      en: "End-to-end eKYC platform with document OCR, face recognition, and liveness detection compliant with VNePay & NAPAS standards.",
    },
    tags: ["OCR", "Face Recognition", "Liveness", "NAPAS"],
    features: [
      "OCR nhận diện CCCD, hộ chiếu, bằng lái xe",
      "So khớp khuôn mặt độ chính xác >99.5%",
      "Phát hiện giả mạo (anti-spoofing) đa tầng",
      "Tích hợp API RESTful & SDK mobile",
      "Tuân thủ chuẩn VNePay, NAPAS, eIDAS",
    ],
    useCases: [
      "Mở tài khoản ngân hàng trực tuyến",
      "Onboarding khách hàng FinTech",
      "Xác thực nhân viên nội bộ",
      "Đăng ký dịch vụ viễn thông",
      "Kiểm soát truy cập vật lý",
      "Hệ thống bỏ phiếu điện tử",
    ],
  },
  {
    slug: "docchain-kss",
    name: "DocChain KSS",
    category: { vi: "Ký số & Quản lý tài liệu", en: "Digital Signing & Document Management" },
    summary: {
      vi: "Nền tảng ký số và lưu trữ tài liệu trên blockchain — đảm bảo toàn vẹn, truy vết và pháp lý theo Luật Giao dịch Điện tử Việt Nam.",
      en: "Blockchain-backed digital signing and document storage ensuring integrity, traceability, and compliance with Vietnamese e-transaction law.",
    },
    tags: ["Blockchain", "Digital Signing", "PKI", "Audit Trail"],
    features: [
      "Ký số theo chuẩn PKI & USB token",
      "Lưu trữ tài liệu bất biến trên blockchain",
      "Xác minh tính toàn vẹn file tức thì",
      "Luồng phê duyệt đa cấp tùy chỉnh",
      "Xuất báo cáo kiểm toán đầy đủ",
    ],
    useCases: [
      "Ký hợp đồng điện tử doanh nghiệp",
      "Quản lý tài liệu nội bộ",
      "Chuỗi cung ứng và logistics",
      "Hồ sơ pháp lý & tư pháp",
      "Chứng từ tài chính & kế toán",
      "Quản lý bằng chứng số",
    ],
  },
  {
    slug: "horus-camera-ai",
    name: "Horus Camera AI",
    category: { vi: "Trí tuệ nhân tạo thị giác", en: "Computer Vision AI" },
    summary: {
      vi: "Hệ thống camera AI phân tích hành vi, nhận diện đối tượng và cảnh báo thời gian thực cho an ninh, giao thông và nhà máy.",
      en: "AI camera system for real-time behavior analysis, object recognition and alerts across security, traffic, and industrial environments.",
    },
    tags: ["Object Detection", "Behavior Analytics", "Real-time", "Edge AI"],
    features: [
      "Nhận diện đối tượng, khuôn mặt, biển số",
      "Phân tích hành vi bất thường tự động",
      "Cảnh báo thời gian thực qua Zalo/Email/SMS",
      "Xử lý edge trên thiết bị NVIDIA Jetson",
      "Dashboard quản lý tập trung đa camera",
    ],
    useCases: [
      "Giám sát an ninh tòa nhà, khu đô thị",
      "Đếm lượng khách hàng bán lẻ",
      "Kiểm soát an toàn lao động nhà máy",
      "Phân tích dòng chảy giao thông",
      "Phát hiện xâm nhập trái phép",
      "Giám sát bãi đỗ xe thông minh",
    ],
  },
  {
    slug: "ong-but-ai",
    name: "Ông Bụt AI",
    category: { vi: "Công nghệ giáo dục", en: "EdTech" },
    summary: {
      vi: "Nền tảng học tập thông minh dành cho học sinh tiểu học — tích hợp AI chấm bài, gợi ý lộ trình và video bài giảng cá nhân hóa.",
      en: "Smart learning platform for primary students with AI grading, adaptive learning paths, and personalized lesson videos.",
    },
    tags: ["AI Grading", "Adaptive Learning", "Video Lessons", "K-12"],
    features: [
      "AI chấm bài tự luận & trắc nghiệm tức thì",
      "Lộ trình học cá nhân hóa theo năng lực",
      "Video bài giảng với giọng thầy giáo AI",
      "Bài tập về nhà tương tác có gợi ý",
      "Báo cáo tiến độ cho phụ huynh",
    ],
    useCases: [
      "Học toán tư duy tiểu học",
      "Luyện thi Tin học Trẻ",
      "Ôn tập sau giờ học tại nhà",
      "Phụ huynh theo dõi tiến độ con",
      "Giáo viên giao & chấm bài tự động",
      "Trung tâm gia sư & dạy thêm",
    ],
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const services: any[] = [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const awards: any[] = [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const caseStudies: any[] = [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const industries: any[] = [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const staffingProcess: any[] = [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const staffingRoles: any[] = [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const technologies: any[] = [];
