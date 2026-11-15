import { LoginForm } from "../forms";

export const metadata = { title: "로그인 — ATELIER", robots: { index: false, follow: false } };

export default async function Login({ searchParams }) {
  const sp = await searchParams;
  return (
    <div className="narrow">
      <h1 className="page-title">로그인</h1>
      <LoginForm next={sp.next || "/"} />
    </div>
  );
}
