import Link from "next/link";
import "./globals.css";
import { getUser } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { logout } from "@/lib/actions";

export const metadata = {
  title: "ATELIER — 미니멀 데일리 웨어",
  description: "의류·잡화를 직접 판매하는 미니멀 쇼핑몰 (데모)",
};

export default async function RootLayout({ children }) {
  const user = await getUser();
  const cartCount = user ? ((await readDb()).carts[user.id] || []).reduce((a, l) => a + l.qty, 0) : 0;
  return (
    <html lang="ko">
      <body>
        <div className="notice">5만 원 이상 구매 시 무료배송 · 데모 쇼핑몰 (실제 결제·배송 없음)</div>
        <header className="header">
          <div className="wrap header-in">
            <Link href="/" className="logo">ATELIER</Link>
            <nav className="nav">
              <Link href="/products">전체</Link>
              <Link href="/products?category=아우터">아우터</Link>
              <Link href="/products?category=상의">상의</Link>
              <Link href="/products?category=하의">하의</Link>
              <Link href="/products?category=잡화">잡화</Link>
            </nav>
            <div className="util">
              {user ? (
                <>
                  {user.role === "admin" && <Link href="/admin">관리자</Link>}
                  <Link href="/orders">{user.name}님</Link>
                  <form action={logout}><button className="link">로그아웃</button></form>
                </>
              ) : (
                <>
                  <Link href="/login">로그인</Link>
                  <Link href="/signup">가입</Link>
                </>
              )}
              <Link href="/cart" className="cart-link">장바구니{cartCount > 0 && <b>{cartCount}</b>}</Link>
            </div>
          </div>
        </header>
        <main className="wrap main">{children}</main>
        <footer className="footer">
          <div className="wrap">© ATELIER (임시 브랜드명) · 포트폴리오용 데모 사이트입니다.</div>
        </footer>
      </body>
    </html>
  );
}
