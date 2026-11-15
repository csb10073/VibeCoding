import { notFound } from "next/navigation";
import Link from "next/link";
import { readDb, won, totalStock, FREE_SHIPPING_FROM } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { ProductImage } from "../../components";
import OptionForm from "./OptionForm";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const p = readDb().products.find((x) => x.id === id);
  return { title: p ? `${p.name} — ATELIER` : "상품 없음" };
}

export default async function ProductPage({ params, searchParams }) {
  const [{ id }, sp, user] = await Promise.all([params, searchParams, getUser()]);
  const product = readDb().products.find((p) => p.id === id);
  if (!product) notFound();
  const sold = totalStock(product) === 0;
  return (
    <>
      <p className="crumb"><Link href="/products">전체</Link> / <Link href={`/products?category=${product.category}`}>{product.category}</Link></p>
      <div className="detail">
        <div className="detail-img"><ProductImage product={product} size={640} /></div>
        <div className="detail-info">
          <h1>{product.name}</h1>
          <div className="price big">{won(product.price)}</div>
          <p className="desc">{product.desc}</p>
          <p className="muted small">{won(FREE_SHIPPING_FROM)} 이상 무료배송 · 국내 배송 · 결제 전 취소 가능</p>
          {sp.error === "soldout" && <p className="error">선택한 옵션이 품절되었습니다.</p>}
          {sp.error === "stock" && <p className="error">장바구니 수량이 재고를 초과합니다.</p>}
          {sold ? <button className="btn block" disabled>SOLD OUT</button>
            : <OptionForm product={product} loggedIn={!!user} />}
        </div>
      </div>
    </>
  );
}
