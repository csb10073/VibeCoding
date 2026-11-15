import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readDb, writeDb } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { confirmPayment } from "@/lib/toss";
import { toTossOrderId } from "@/lib/tossId";

// 토스 결제창 성공 후 돌아오는 URL: ?paymentKey=...&orderId=...&amount=...
export async function GET(request, { params }) {
  const { id } = await params;
  const user = await requireUser("/orders");
  const sp = request.nextUrl.searchParams;
  const paymentKey = sp.get("paymentKey");
  const amount = Number(sp.get("amount"));
  const to = (path) => NextResponse.redirect(new URL(path, request.url));
  const fail = (msg) => to(`/checkout/${id}?error=${encodeURIComponent(msg)}`);

  const db = readDb();
  const order = db.orders.find((o) => o.id === id && o.userId === user.id);
  if (!order) return to("/orders");
  if (order.status !== "결제대기") return to(`/checkout/${id}/done`);

  // 위변조 방지: 쿼리스트링 값이 아니라 서버(DB)의 주문 정보와 대조한다.
  if (!paymentKey || sp.get("orderId") !== toTossOrderId(order.id) || amount !== order.total)
    return fail("결제 정보가 주문과 일치하지 않습니다.");

  for (const i of order.items) {
    const p = db.products.find((x) => x.id === i.productId);
    if ((p?.stock[`${i.color}|${i.size}`] || 0) < i.qty)
      return fail(`재고 부족: ${i.name} (${i.color}/${i.size}) — 결제는 승인되지 않았습니다.`);
  }

  // 모의 결제: 시크릿 키가 없는 개발 환경에서만 토스 승인 호출을 건너뛴다.
  const mock = !process.env.TOSS_SECRET_KEY && process.env.NODE_ENV !== "production";
  let payment;
  if (mock) {
    payment = { method: "모의결제", approvedAt: new Date().toISOString() };
  } else {
    try {
      payment = await confirmPayment({ paymentKey, orderId: toTossOrderId(order.id), amount: order.total });
    } catch (e) {
      return fail(e.message || "결제 승인에 실패했습니다.");
    }
  }

  // 승인 직후 최신 상태로 다시 확인(중복 요청 방지) 후 반영
  const fresh = readDb();
  const o = fresh.orders.find((x) => x.id === id);
  if (o.status === "결제대기") {
    for (const i of o.items) fresh.products.find((x) => x.id === i.productId).stock[`${i.color}|${i.size}`] -= i.qty;
    o.status = "결제완료";
    o.paidAt = new Date().toISOString();
    o.payment = { paymentKey, method: payment.method, approvedAt: payment.approvedAt };
    fresh.carts[user.id] = [];
    writeDb(fresh);
    revalidatePath("/", "layout");
  }
  return to(`/checkout/${id}/done`);
}
