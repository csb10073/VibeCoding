import Link from "next/link";
import { readDb, won } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { cancelMyOrder } from "@/lib/actions";

export const metadata = { title: "마이페이지 — ATELIER" };

export default async function Orders() {
  const user = await requireUser("/orders");
  const orders = (await readDb()).orders.filter((o) => o.userId === user.id).reverse();
  return (
    <>
      <h1 className="page-title">마이페이지 · 주문 내역</h1>
      <p className="muted">{user.name} ({user.email})</p>
      {!orders.length ? (
        <div className="empty"><p>주문 내역이 없습니다.</p><Link href="/products" className="btn">쇼핑하러 가기</Link></div>
      ) : orders.map((o) => (
        <section key={o.id} className="order">
          <div className="order-head">
            <div><b>{o.id}</b> <span className="muted small">{new Date(o.createdAt).toLocaleString("ko-KR")}</span></div>
            <span className={`status s-${o.status}`}>{o.status}</span>
          </div>
          {o.items.map((i, k) => (
            <div key={k} className="row small"><span>{i.name} ({i.color}/{i.size}) × {i.qty}</span><span>{won(i.unitPrice * i.qty)}</span></div>
          ))}
          <div className="row total"><span>합계 (배송비 {o.shipping ? won(o.shipping) : "무료"})</span><span>{won(o.total)}</span></div>
          <div className="muted small">배송지: {o.shippingInfo.receiver} · {o.shippingInfo.phone} · ({o.shippingInfo.zip}) {o.shippingInfo.address}</div>
          {o.status === "결제대기" && (
            <div className="actions">
              <Link href={`/checkout/${o.id}`} className="btn small">결제하기</Link>
              <form action={cancelMyOrder}><input type="hidden" name="orderId" value={o.id} /><button className="btn small ghost">주문 취소</button></form>
            </div>
          )}
          {["결제완료", "배송중"].includes(o.status) && <p className="muted small">결제 후 취소·환불은 고객센터(관리자)를 통해 처리됩니다.</p>}
        </section>
      ))}
    </>
  );
}
