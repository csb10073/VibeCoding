import Link from "next/link";
import "./globals.css";
import { getUser } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { logout } from "@/lib/actions";
import { SITE_URL, SITE_NAME, SITE_DESC, jsonLd } from "@/lib/site";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: "ATELIER — 미니멀 데일리 웨어",
  description: SITE_DESC,
  applicationName: SITE_NAME,
  keywords: ["미니멀 의류", "데일리 웨어", "아우터", "상의", "하의", "잡화", "온라인 쇼핑몰", "ATELIER"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website", siteName: SITE_NAME, locale: "ko_KR", url: "/",
    title: "ATELIER — 미니멀 데일리 웨어", description: SITE_DESC,
  },
  twitter: { card: "summary_large_image", title: "ATELIER — 미니멀 데일리 웨어", description: SITE_DESC },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  // Search Console / 네이버 서치어드바이저 소유 확인 (Vercel 환경변수로 값만 넣으면 메타태그가 생성됨)
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.NAVER_SITE_VERIFICATION ? { "naver-site-verification": process.env.NAVER_SITE_VERIFICATION } : undefined,
  },
};

const siteLd = [
  {
    "@context": "https://schema.org", "@type": "Organization",
    name: SITE_NAME, url: SITE_URL, description: SITE_DESC,
  },
  {
    "@context": "https://schema.org", "@type": "WebSite",
    name: SITE_NAME, url: SITE_URL, inLanguage: "ko-KR",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/products?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  },
];

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
          <div className="wrap">© ATELIER (임시 브랜드명) · 포트폴리오용 데모 사이트입니다. · <Link href="/faq">자주 묻는 질문</Link></div>
        </footer>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(siteLd) }} />
      </body>
    </html>
  );
}
