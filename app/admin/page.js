import Link from "next/link";
import { readDb, won, totalStock } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { soldOutProduct } from "@/lib/actions";

export const metadata = { title: "관리자 · 상품 — ATELIER" };

export function AdminNav() {
  return (
    <div className="chips admin-nav">
      <Link href="/admin" className="chip">상품 관리</Link>
      <Link href="/admin/orders" className="chip">주문 관리</Link>
      <Link href="/admin/new" className="btn small">+ 상품 등록</Link>
    </div>
  );
}

export default async function Admin() {
  await requireAdmin();
  const { products } = readDb();
  return (
    <>
      <h1 className="page-title">관리자 · 상품</h1>
      <AdminNav />
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>ID</th><th>상품명</th><th>카테고리</th><th>가격</th><th>총 재고</th><th></th></tr></thead>
          <tbody>
            {products.map((p) => {
              const s = totalStock(p);
              return (
                <tr key={p.id}>
                  <td>{p.id}</td><td>{p.name}</td><td>{p.category}</td><td>{won(p.price)}</td>
                  <td>{s === 0 ? <b className="error">품절</b> : s}</td>
                  <td className="actions">
                    <Link href={`/admin/${p.id}`} className="btn small ghost">수정</Link>
                    <form action={soldOutProduct}><input type="hidden" name="id" value={p.id} /><button className="btn small ghost" disabled={s === 0}>품절 처리</button></form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
