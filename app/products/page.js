import Link from "next/link";
import { readDb } from "@/lib/db";
import { ProductCard } from "../components";

const CATS = ["아우터", "상의", "하의", "잡화"];
const SORTS = { new: "신상품순", low: "낮은 가격순", high: "높은 가격순" };

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const category = CATS.includes(sp.category) ? sp.category : "";
  const filtered = !!(sp.q || sp.sort); // 검색·정렬 변형 URL은 중복 콘텐츠이므로 색인 제외, canonical 은 카테고리 기준
  return {
    title: `${category || "전체 상품"} — ATELIER`,
    description: category
      ? `ATELIER ${category} 상품 모아보기. 미니멀 데일리 웨어, 5만 원 이상 무료배송.`
      : "ATELIER 전체 상품. 아우터·상의·하의·잡화 미니멀 데일리 웨어, 5만 원 이상 무료배송.",
    alternates: { canonical: category ? `/products?category=${encodeURIComponent(category)}` : "/products" },
    ...(filtered && { robots: { index: false, follow: true } }),
  };
}

export default async function Products({ searchParams }) {
  const sp = await searchParams;
  const category = CATS.includes(sp.category) ? sp.category : "";
  const q = (sp.q || "").toString().trim();
  const sort = SORTS[sp.sort] ? sp.sort : "new";
  let list = (await readDb()).products.filter(
    (p) => (!category || p.category === category) && (!q || p.name.includes(q))
  );
  list.sort((a, b) =>
    sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : b.createdAt.localeCompare(a.createdAt)
  );
  const href = (o) => {
    const p = new URLSearchParams({ ...(category && { category }), ...(q && { q }), sort, ...o });
    for (const [k, v] of [...p]) if (!v) p.delete(k);
    return `/products?${p}`;
  };
  return (
    <>
      <h1 className="page-title">{category || "전체 상품"}</h1>
      <div className="filters">
        <div className="chips">
          <Link href={href({ category: "" })} className={`chip ${!category ? "on" : ""}`}>전체</Link>
          {CATS.map((c) => (
            <Link key={c} href={href({ category: c })} className={`chip ${category === c ? "on" : ""}`}>{c}</Link>
          ))}
        </div>
        <form action="/products" className="search">
          {category && <input type="hidden" name="category" value={category} />}
          <input type="hidden" name="sort" value={sort} />
          <input name="q" defaultValue={q} placeholder="상품 검색" aria-label="상품 검색" />
          <button className="btn small">검색</button>
        </form>
      </div>
      <div className="chips sorts">
        {Object.entries(SORTS).map(([k, v]) => (
          <Link key={k} href={href({ sort: k })} className={`chip ${sort === k ? "on" : ""}`}>{v}</Link>
        ))}
        <span className="muted small count">{list.length}개 상품</span>
      </div>
      {list.length ? (
        <div className="grid">{list.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      ) : (
        <p className="empty">조건에 맞는 상품이 없습니다.</p>
      )}
    </>
  );
}
