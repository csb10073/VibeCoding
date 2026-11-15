import { notFound, redirect } from "next/navigation";
import { readDb, won } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PayForm } from "../../forms";

export const metadata = { title: "결제 — ATELIER", robots: { index: false, follow: false } };

export default async function Pay({ params, searchParams }) {
  const { id } = await params;
  const { error, message } = await searchParams; // error: 서버 승인 실패 / message: 토스 failUrl 파라미터
  const user = await requireUser("/orders");
  const order = (await readDb()).orders.find((o) => o.id === id && o.userId === user.id);
  if (!order) notFound();
  if (order.status !== "결제대기") redirect(`/checkout/${id}/done`);
  return (
    <div className="narrow">
      <h1 className="page-title">결제</h1>
      <p className="muted">주문번호 {order.id} · {order.items.length}개 상품 · 배송비 {order.shipping ? won(order.shipping) : "무료"}</p>
      <PayForm
        orderId={order.id}
        total={order.total}
        orderName={order.items.length > 1 ? `${order.items[0].name} 외 ${order.items.length - 1}건` : order.items[0].name}
        customerName={order.shippingInfo.receiver}
        initialError={error || message}
      />
    </div>
  );
}
