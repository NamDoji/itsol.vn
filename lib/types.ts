export type Locale = "vi" | "en";

export type LocalizedText = {
  vi: string;
  en: string;
};

export type Service = {
  id: number;
  slug: string;
  title_vi: string;
  title_en: string;
  summary_vi: string;
  summary_en: string;
  body_vi: string;
  body_en: string;
  icon: string;
  sort_order: number;
  published: number;
};

export type CaseStudy = {
  id: number;
  slug: string;
  title_vi: string;
  title_en: string;
  industry: string;
  summary_vi: string;
  summary_en: string;
  impact_vi: string;
  impact_en: string;
  published: number;
};

export type BlogPost = {
  id: number;
  slug: string;
  title_vi: string;
  title_en: string;
  excerpt_vi: string;
  excerpt_en: string;
  content_vi: string;
  content_en: string;
  category: string;
  published: number;
  created_at: string;
};

export type Job = {
  id: number;
  title: string;
  department: string;
  location: string;
  level: string;
  description: string;
  published: number;
};
