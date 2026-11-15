import { redirect } from "next/navigation";
import { readDb, won, shippingFor } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ShippingForm } from "../forms";

export const metadata = { title: "주문하기 — ATELIER" };

export default async function Checkout() {
  const user = await requireUser("/checkout");
  const db = readDb();
  const cart = db.carts[user.id] || [];
  if (!cart.length) redirect("/cart");
  const rows = cart.map((l) => ({ ...l, p: db.products.find((p) => p.id === l.productId) })).filter((l) => l.p);
  const subtotal = rows.reduce((a, l) => a + l.p.price * l.qty, 0);
  const shipping = shippingFor(subtotal);
  return (
    <>
      <h1 className="page-title">주문하기</h1>
      <div className="cart">
        <div><h2 className="section-title">배송 정보</h2><ShippingForm defaultName={user.name} /></div>
        <aside className="summary">
          <h2 className="section-title">주문 상품</h2>
          {rows.map((l, i) => (
            <div key={i} className="row small"><span>{l.p.name} ({l.color}/{l.size}) × {l.qty}</span><span>{won(l.p.price * l.qty)}</span></div>
          ))}
          <div className="row"><span>배송비</span><span>{shipping ? won(shipping) : "무료"}</span></div>
          <div className="row total"><span>결제 금액</span><span>{won(subtotal + shipping)}</span></div>
        </aside>
      </div>
    </>
  );
}
