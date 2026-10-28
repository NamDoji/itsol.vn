import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { homeContent, servicesSeed, caseStudiesSeed, blogSeed, jobsSeed } from "./seed-data";
import type { BlogPost, CaseStudy, Job, Service } from "./types";

type SqliteDatabase = {
  exec(sql: string): void;
  prepare(sql: string): {
    run(...params: unknown[]): unknown;
    get(...params: unknown[]): Record<string, unknown> | undefined;
    all(...params: unknown[]): Record<string, unknown>[];
  };
};

let cachedDb: SqliteDatabase | null = null;

export async function getDb() {
  if (cachedDb) return cachedDb;

  const sqlite = await import("node:sqlite");
  const dbPath = resolve(process.cwd(), process.env.DATABASE_PATH || "./data/itsol.sqlite");
  mkdirSync(dirname(dbPath), { recursive: true });
  cachedDb = new sqlite.DatabaseSync(dbPath) as SqliteDatabase;
  initialize(cachedDb);
  return cachedDb;
}

function initialize(db: SqliteDatabase) {
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title_vi TEXT NOT NULL,
      title_en TEXT NOT NULL,
      summary_vi TEXT NOT NULL,
      summary_en TEXT NOT NULL,
      body_vi TEXT NOT NULL,
      body_en TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT 'Code',
      sort_order INTEGER NOT NULL DEFAULT 0,
      published INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS case_studies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title_vi TEXT NOT NULL,
      title_en TEXT NOT NULL,
      industry TEXT NOT NULL,
      summary_vi TEXT NOT NULL,
      summary_en TEXT NOT NULL,
      impact_vi TEXT NOT NULL,
      impact_en TEXT NOT NULL,
      published INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title_vi TEXT NOT NULL,
      title_en TEXT NOT NULL,
      excerpt_vi TEXT NOT NULL,
      excerpt_en TEXT NOT NULL,
      content_vi TEXT NOT NULL,
      content_en TEXT NOT NULL,
      category TEXT NOT NULL,
      published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      department TEXT NOT NULL,
      location TEXT NOT NULL,
      level TEXT NOT NULL,
      description TEXT NOT NULL,
      published INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS contact_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS talent_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT NOT NULL,
      role TEXT NOT NULL,
      seniority TEXT,
      quantity INTEGER NOT NULL DEFAULT 1,
      timeline TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const contentCount = db.prepare("SELECT COUNT(*) AS count FROM site_content").get()?.count as number;
  if (!contentCount) {
    const stmt = db.prepare("INSERT INTO site_content (key, value) VALUES (?, ?)");
    Object.entries(homeContent).forEach(([key, value]) => stmt.run(key, value));
  }

  seedTable(db, "services", servicesSeed);
  seedTable(db, "case_studies", caseStudiesSeed);
  seedTable(db, "blog_posts", blogSeed);
  seedTable(db, "jobs", jobsSeed);
}

function seedTable(db: SqliteDatabase, table: string, rows: Record<string, unknown>[]) {
  const count = db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get()?.count as number;
  if (count || rows.length === 0) return;

  rows.forEach((row) => {
    const keys = Object.keys(row);
    const placeholders = keys.map(() => "?").join(", ");
    db.prepare(`INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`).run(
      ...keys.map((key) => row[key])
    );
  });
}

export async function getPublicSiteData() {
  const db = await getDb();
  const contentRows = db.prepare("SELECT key, value FROM site_content").all();
  const content = Object.fromEntries(contentRows.map((row) => [row.key, row.value])) as Record<string, string>;

  return {
    content,
    services: db.prepare("SELECT * FROM services WHERE published = 1 ORDER BY sort_order ASC").all() as Service[],
    caseStudies: db.prepare("SELECT * FROM case_studies WHERE published = 1 ORDER BY id DESC").all() as CaseStudy[],
    blogPosts: db.prepare("SELECT * FROM blog_posts WHERE published = 1 ORDER BY created_at DESC").all() as BlogPost[],
    jobs: db.prepare("SELECT * FROM jobs WHERE published = 1 ORDER BY id DESC").all() as Job[]
  };
}
