import { SHIPPING_FEE, FREE_SHIPPING_FROM, won } from "@/lib/db";
import { jsonLd } from "@/lib/site";

// AEO: 답변 엔진/AI 검색이 그대로 인용할 수 있는 질문-답변 형식. 화면에 보이는 내용과 JSON-LD 가 동일해야 한다.
const FAQ = [
  {
    q: "배송비는 얼마인가요?",
    a: `기본 배송비는 ${won(SHIPPING_FEE)}이며, ${won(FREE_SHIPPING_FROM)} 이상 구매 시 무료배송입니다. 국내 배송만 가능합니다.`,
  },
  {
    q: "어떤 결제 수단을 사용할 수 있나요?",
    a: "토스페이먼츠 결제창을 통해 카드, 간편결제 등 다양한 수단으로 결제할 수 있습니다.",
  },
  {
    q: "주문을 취소할 수 있나요?",
    a: "결제 전(결제대기 상태)에는 마이페이지 주문 내역에서 직접 취소할 수 있습니다. 결제 완료 후 취소는 고객센터를 통해 요청해 주세요.",
  },
  {
    q: "어떤 상품을 판매하나요?",
    a: "아우터, 상의, 하의, 잡화(가방·머플러·모자·지갑 등) 카테고리의 미니멀 데일리 웨어를 판매합니다.",
  },
  {
    q: "사이즈와 재고는 어떻게 확인하나요?",
    a: "상품 상세 페이지에서 색상과 사이즈를 선택하면 해당 옵션의 재고 여부를 확인할 수 있으며, 품절 옵션은 선택할 수 없습니다.",
  },
];

export const metadata = {
  title: "자주 묻는 질문 — ATELIER",
  description: "ATELIER 배송비, 결제, 주문 취소, 사이즈·재고에 대한 자주 묻는 질문과 답변입니다.",
  alternates: { canonical: "/faq" },
  openGraph: {
    type: "website", url: "/faq", title: "자주 묻는 질문 — ATELIER",
    description: "ATELIER 배송비, 결제, 주문 취소, 사이즈·재고에 대한 자주 묻는 질문과 답변입니다.",
    images: [{ url: "/opengraph-image", alt: "ATELIER" }],
  },
};

export default function Faq() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <>
      <h1 className="page-title">자주 묻는 질문</h1>
      <dl>
        {FAQ.map((f) => (
          <div key={f.q} style={{ marginBottom: 24 }}>
            <dt><h2 className="section-title">{f.q}</h2></dt>
            <dd style={{ margin: 0 }}>{f.a}</dd>
          </div>
        ))}
      </dl>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
    </>
  );
}
