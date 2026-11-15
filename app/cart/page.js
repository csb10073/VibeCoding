import Link from "next/link";
import { readDb, won, shippingFor, FREE_SHIPPING_FROM } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { updateCartQty, removeFromCart } from "@/lib/actions";
import { ProductImage } from "../components";

export const metadata = { title: "장바구니 — ATELIER" };

export default async function Cart() {
  const user = await requireUser("/cart");
  const db = readDb();
  const lines = (db.carts[user.id] || [])
    .map((l, idx) => {
      const p = db.products.find((x) => x.id === l.productId);
      return p && { ...l, idx, p, stock: p.stock[`${l.color}|${l.size}`] || 0 };
    })
    .filter(Boolean);
  const subtotal = lines.reduce((a, l) => a + l.p.price * l.qty, 0);
  const shipping = shippingFor(subtotal);
  const bad = lines.some((l) => l.qty > l.stock);

  return (
    <>
      <h1 className="page-title">장바구니</h1>
      {!lines.length ? (
        <div className="empty">
          <p>장바구니가 비어 있습니다.</p>
          <Link href="/products" className="btn">쇼핑 계속하기</Link>
        </div>
      ) : (
        <div className="cart">
          <ul className="lines">
            {lines.map((l) => (
              <li key={l.idx} className="line">
                <div className="line-img"><ProductImage product={{ ...l.p, colors: [l.p.colors.find((c) => c.name === l.color) || l.p.colors[0]] }} size={96} /></div>
                <div className="line-info">
                  <Link href={`/products/${l.p.id}`} className="card-name">{l.p.name}</Link>
                  <div className="muted small">{l.color} / {l.size}</div>
                  {l.qty > l.stock && <div className="error small">재고 부족 (남은 수량 {l.stock}개)</div>}
                  <div className="line-actions">
                    <form action={updateCartQty} className="qty-form">
                      <input type="hidden" name="idx" value={l.idx} />
                      <input type="number" name="qty" min="1" max={Math.min(10, l.stock) || 1} defaultValue={l.qty} aria-label="수량" />
                      <button className="btn small ghost">변경</button>
                    </form>
                    <form action={removeFromCart}>
                      <input type="hidden" name="idx" value={l.idx} />
                      <button className="link">삭제</button>
                    </form>
                  </div>
                </div>
                <div className="price">{won(l.p.price * l.qty)}</div>
              </li>
            ))}
          </ul>
          <aside className="summary">
            <div className="row"><span>상품 금액</span><span>{won(subtotal)}</span></div>
            <div className="row"><span>배송비</span><span>{shipping ? won(shipping) : "무료"}</span></div>
            {shipping > 0 && <p className="muted small">{won(FREE_SHIPPING_FROM - subtotal)} 더 담으면 무료배송</p>}
            <div className="row total"><span>합계</span><span>{won(subtotal + shipping)}</span></div>
            {bad ? <button className="btn block" disabled>재고를 확인해 주세요</button>
              : <Link href="/checkout" className="btn block">주문하기</Link>}
          </aside>
        </div>
      )}
    </>
  );
}
