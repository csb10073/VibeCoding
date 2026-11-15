// 사이트 공통 SEO 상수. 도메인은 Vercel 환경변수 NEXT_PUBLIC_SITE_URL 로 지정 (예: https://내도메인.com)
const raw =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  (process.env.NODE_ENV === "production" ? "https://vibe-coding-eight-ruby.vercel.app" : "http://localhost:3000");

export const SITE_URL = raw.replace(/\/$/, "");
export const SITE_NAME = "ATELIER";
export const SITE_DESC =
  "ATELIER는 아우터·상의·하의·잡화를 판매하는 미니멀 데일리 웨어 쇼핑몰입니다. 5만 원 이상 구매 시 무료배송.";

export const abs = (path = "/") => (/^https?:\/\//.test(path) ? path : `${SITE_URL}${path}`);

// JSON-LD 를 <script> 안에 안전하게 넣기 위한 직렬화 ("<" 이스케이프)
export const jsonLd = (obj) => JSON.stringify(obj).replace(/</g, "\\u003c");
