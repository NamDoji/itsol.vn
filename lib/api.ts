import { NextRequest } from "next/server";
import { getDb } from "./db";

export async function readJson<T>(request: NextRequest) {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

export function requireFields(payload: Record<string, unknown> | null, fields: string[]) {
  if (!payload) return "Invalid JSON body";
  const missing = fields.filter((field) => !String(payload[field] || "").trim());
  if (missing.length) return `Missing fields: ${missing.join(", ")}`;
  return null;
}

export async function listTable(table: string, order = "id DESC") {
  const db = await getDb();
  return db.prepare(`SELECT * FROM ${table} ORDER BY ${order}`).all();
}

export async function upsertById(table: string, payload: Record<string, unknown>, allowed: string[]) {
  const db = await getDb();
  const fields = allowed.filter((field) => payload[field] !== undefined);
  const id = payload.id ? Number(payload.id) : null;

  if (id) {
    const sets = fields.map((field) => `${field} = ?`).join(", ");
    db.prepare(`UPDATE ${table} SET ${sets}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(
      ...fields.map((field) => payload[field]),
      id
    );
    return db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
  }

  const placeholders = fields.map(() => "?").join(", ");
  const result = db
    .prepare(`INSERT INTO ${table} (${fields.join(", ")}) VALUES (${placeholders})`)
    .run(...fields.map((field) => payload[field])) as { lastInsertRowid?: number | bigint };
  return db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(Number(result.lastInsertRowid));
}

export async function deleteById(table: string, id: number) {
  const db = await getDb();
  db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
}
