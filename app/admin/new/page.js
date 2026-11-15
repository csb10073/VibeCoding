import { requireAdmin } from "@/lib/auth";
import { ProductForm } from "../../forms";

export const metadata = { title: "상품 등록 — ATELIER", description: "ATELIER 관리자 페이지입니다.", robots: { index: false, follow: false } };

export default async function NewProduct() {
  await requireAdmin();
  return (
    <>
      <h1 className="page-title">상품 등록</h1>
      <ProductForm />
    </>
  );
}
