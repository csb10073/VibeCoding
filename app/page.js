import Link from "next/link";
import { readDb } from "@/lib/db";
import { ProductCard } from "./components";

export default function Home() {
  const { products } = readDb();
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const latest = [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);
  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">2026 WINTER COLLECTION</p>
          <h1>꾸안꾸, 매일 입는<br />미니멀 웨어</h1>
          <p className="muted">군더더기 없는 실루엣과 좋은 소재로 만든 데일리 아이템.</p>
          <Link href="/products" className="btn">전체 상품 보기</Link>
        </div>
      </section>

      <section className="cats">
        {["아우터", "상의", "하의", "잡화"].map((c) => (
          <Link key={c} href={`/products?category=${c}`} className="cat">{c}</Link>
        ))}
      </section>

      <h2 className="section-title">추천 상품</h2>
      <div className="grid">{featured.map((p) => <ProductCard key={p.id} product={p} />)}</div>

      <h2 className="section-title">신상품</h2>
      <div className="grid">{latest.map((p) => <ProductCard key={p.id} product={p} />)}</div>
    </>
  );
}
