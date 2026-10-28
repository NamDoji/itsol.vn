import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

const dbPath = resolve(process.cwd(), process.env.DATABASE_PATH || "./data/itsol.sqlite");
mkdirSync(dirname(dbPath), { recursive: true });
const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS site_content (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const content = {
  hero_title_vi: "Xây dựng đội ngũ IT và giải pháp công nghệ cho kỷ nguyên AI",
  hero_title_en: "Build trusted IT teams and technology solutions for the AI era",
  hero_subtitle_vi:
    "ITSOL giúp doanh nghiệp mở rộng năng lực công nghệ thông qua IT staffing, outsourcing phần mềm, dedicated team, product development và AI solutions.",
  hero_subtitle_en:
    "ITSOL helps businesses scale technology capabilities through IT staffing, software outsourcing, dedicated teams, product development, and AI solutions."
};

const stmt = db.prepare(
  "INSERT INTO site_content (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
);
Object.entries(content).forEach(([key, value]) => stmt.run(key, value));

console.log(`Seeded ITSOL database at ${dbPath}`);
