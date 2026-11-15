import { readDb, won } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { setOrderStatus, adminCancelOrder } from "@/lib/actions";
import { AdminNav } from "../page";

export const metadata = { title: "관리자 · 주문 — ATELIER" };

function Btn({ id, status, label }) {
  return (
    <form action={setOrderStatus}>
      <input type="hidden" name="orderId" value={id} /><input type="hidden" name="status" value={status} />
      <button className="btn small">{label}</button>
    </form>
  );
}

export default async function AdminOrders() {
  await requireAdmin();
  const db = await readDb();
  const orders = [...db.orders].reverse();
  return (
    <>
      <h1 className="page-title">관리자 · 주문</h1>
      <AdminNav />
      {!orders.length ? <p className="empty">주문이 없습니다.</p> : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>주문번호</th><th>주문자</th><th>상품</th><th>금액</th><th>상태</th><th>처리</th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}<div className="muted small">{new Date(o.createdAt).toLocaleDateString("ko-KR")}</div></td>
                  <td>{db.users.find((u) => u.id === o.userId)?.name}<div className="muted small">{o.shippingInfo.phone}</div></td>
                  <td>{o.items.map((i) => `${i.name}(${i.color}/${i.size})×${i.qty}`).join(", ")}</td>
                  <td>{won(o.total)}</td>
                  <td><span className={`status s-${o.status}`}>{o.status}</span></td>
                  <td className="actions">
                    {o.status === "결제완료" && <Btn id={o.id} status="배송중" label="배송 시작" />}
                    {o.status === "배송중" && <Btn id={o.id} status="배송완료" label="배송 완료" />}
                    {["결제완료", "배송중"].includes(o.status) && (
                      <form action={adminCancelOrder}><input type="hidden" name="orderId" value={o.id} /><button className="btn small ghost">취소·재고복원</button></form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
