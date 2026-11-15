import { SignupForm } from "../forms";

export const metadata = { title: "회원가입 — ATELIER", description: "ATELIER 회원가입 후 미니멀 데일리 웨어를 주문해 보세요.", robots: { index: false, follow: false } };

export default async function Signup({ searchParams }) {
  const sp = await searchParams;
  return (
    <div className="narrow">
      <h1 className="page-title">회원가입</h1>
      <SignupForm next={sp.next || "/"} />
    </div>
  );
}
