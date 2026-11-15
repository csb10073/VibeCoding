import { readDb } from "@/lib/db";
import { abs } from "@/lib/site";

export const dynamic = "force-dynamic"; // 상품이 추가/수정되면 즉시 반영

const CATS = ["아우터", "상의", "하의", "잡화"];

export default async function sitemap() {
  const { products } = await readDb();
  const newest = products.reduce((m, p) => (p.createdAt > m ? p.createdAt : m), "2026-01-01T00:00:00.000Z");
  return [
    { url: abs("/"), lastModified: newest, changeFrequency: "daily", priority: 1 },
    { url: abs("/products"), lastModified: newest, changeFrequency: "daily", priority: 0.9 },
    ...CATS.map((c) => ({
      url: abs(`/products?category=${encodeURIComponent(c)}`),
      lastModified: newest, changeFrequency: "daily", priority: 0.8,
    })),
    { url: abs("/faq"), changeFrequency: "monthly", priority: 0.6 },
    ...products.map((p) => ({
      url: abs(`/products/${p.id}`),
      lastModified: p.createdAt, changeFrequency: "weekly", priority: 0.7,
    })),
  ];
}
