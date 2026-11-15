import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readDb } from "./db";

const SECRET = process.env.SESSION_SECRET || "dev-only-secret-change-me";
const sign = (v) => crypto.createHmac("sha256", SECRET).update(v).digest("hex");

export async function createSession(userId) {
  const jar = await cookies();
  jar.set("sid", `${userId}.${sign(userId)}`, {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7,
  });
}
export async function destroySession() {
  (await cookies()).delete("sid");
}
export async function getUser() {
  const raw = (await cookies()).get("sid")?.value;
  if (!raw) return null;
  const i = raw.lastIndexOf(".");
  const id = raw.slice(0, i), mac = raw.slice(i + 1);
  const good = sign(id);
  if (mac.length !== good.length || !crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(good))) return null;
  return readDb().users.find((u) => u.id === id) || null;
}
export async function requireUser(next = "/") {
  const u = await getUser();
  if (!u) redirect(`/login?next=${encodeURIComponent(next)}`);
  return u;
}
export async function requireAdmin() {
  const u = await getUser();
  if (!u || u.role !== "admin") redirect("/");
  return u;
}
