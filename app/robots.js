import { SITE_URL } from "@/lib/site";

// 검색엔진(Google/Naver/Bing)과 AI 검색 봇(GEO/AEO) 모두 공개 페이지 크롤링 허용.
// 로그인이 필요한 개인 페이지와 관리자 영역만 차단한다.
const PRIVATE = ["/admin", "/cart", "/checkout", "/orders", "/login", "/signup"];
const AI_BOTS = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User",
  "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "CCBot",
];

export default function robots() {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      { userAgent: AI_BOTS, allow: "/", disallow: PRIVATE },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
