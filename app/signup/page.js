import { SignupForm } from "../forms";

export const metadata = { title: "회원가입 — ATELIER", robots: { index: false, follow: false } };

export default async function Signup({ searchParams }) {
  const sp = await searchParams;
  return (
    <div className="narrow">
      <h1 className="page-title">회원가입</h1>
      <SignupForm next={sp.next || "/"} />
    </div>
  );
}
