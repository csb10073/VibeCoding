import { notFound } from "next/navigation";
import { readDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ProductForm } from "../../forms";

export const metadata = { title: "상품 수정 — ATELIER", description: "ATELIER 관리자 페이지입니다.", robots: { index: false, follow: false } };

export default async function EditProduct({ params }) {
  await requireAdmin();
  const { id } = await params;
  const p = (await readDb()).products.find((x) => x.id === id);
  if (!p) notFound();
  return (
    <>
      <h1 className="page-title">상품 수정 · {p.name}</h1>
      <ProductForm product={p} />
    </>
  );
}
