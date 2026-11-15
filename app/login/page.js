import { LoginForm } from "../forms";

export const metadata = { title: "로그인 — ATELIER", description: "ATELIER에 로그인하고 주문 내역과 장바구니를 확인하세요.", robots: { index: false, follow: false } };

export default async function Login({ searchParams }) {
  const sp = await searchParams;
  return (
    <div className="narrow">
      <h1 className="page-title">로그인</h1>
      <LoginForm next={sp.next || "/"} />
    </div>
  );
}
