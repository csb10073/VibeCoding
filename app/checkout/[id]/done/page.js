import Link from "next/link";
import { notFound } from "next/navigation";
import { readDb, won } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "주문 완료 — ATELIER", description: "ATELIER 배송 정보를 입력하고 안전하게 결제합니다.", robots: { index: false, follow: false } };

export default async function Done({ params }) {
  const { id } = await params;
  const user = await requireUser("/orders");
  const o = (await readDb()).orders.find((x) => x.id === id && x.userId === user.id);
  if (!o) notFound();
  return (
    <div className="narrow center">
      <h1 className="page-title">{o.status === "결제대기" ? "결제 대기 중" : "주문이 완료되었습니다"}</h1>
      <p>주문번호 <b>{o.id}</b> · 결제 금액 <b>{won(o.total)}</b></p>
      <p className="muted">상태: {o.status}</p>
      <div className="actions">
        <Link href="/orders" className="btn">주문 내역</Link>
        <Link href="/products" className="btn ghost">쇼핑 계속하기</Link>
      </div>
    </div>
  );
}
