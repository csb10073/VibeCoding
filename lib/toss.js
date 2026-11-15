// 토스페이먼츠 공통 설정. 키는 .env.local 에서 읽는다. (시크릿 키는 서버 전용)
import "server-only";

const SECRET_KEY = process.env.TOSS_SECRET_KEY;

// 결제 승인 API 호출. 성공 시 결제 객체, 실패 시 { code, message } 를 던진다.
export async function confirmPayment({ paymentKey, orderId, amount }) {
  if (!SECRET_KEY) throw { code: "NO_SECRET_KEY", message: "서버에 TOSS_SECRET_KEY 가 설정되지 않았습니다." };
  const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(SECRET_KEY + ":").toString("base64"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw { code: data.code || "CONFIRM_FAILED", message: data.message || "결제 승인에 실패했습니다." };
  return data;
}
