import { notFound } from "next/navigation";
import Link from "next/link";
import { readDb, won, totalStock, FREE_SHIPPING_FROM } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { ProductImage } from "../../components";
import OptionForm from "./OptionForm";
import { SITE_NAME, abs, jsonLd } from "@/lib/site";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const p = (await readDb()).products.find((x) => x.id === id);
  if (!p) return { title: "상품 없음", robots: { index: false } };
  const description = `${p.name} · ${p.category} · ${won(p.price)}. ${p.desc} 색상 ${p.colors.map((c) => c.name).join(", ")}, 사이즈 ${p.sizes.join("/")}.`;
  const images = p.image ? [{ url: p.image, alt: p.name }] : undefined;
  return {
    title: `${p.name} — ATELIER`,
    description,
    alternates: { canonical: `/products/${p.id}` },
    openGraph: { type: "website", title: p.name, description, url: `/products/${p.id}`, images },
    twitter: { card: "summary_large_image", title: p.name, description, images: images?.map((i) => i.url) },
  };
}

export default async function ProductPage({ params, searchParams }) {
  const [{ id }, sp, user] = await Promise.all([params, searchParams, getUser()]);
  const product = (await readDb()).products.find((p) => p.id === id);
  if (!product) notFound();
  const sold = totalStock(product) === 0;
  const ld = [
    {
      "@context": "https://schema.org", "@type": "Product",
      name: product.name, description: product.desc, sku: product.id,
      category: product.category, brand: { "@type": "Brand", name: SITE_NAME },
      ...(product.image && { image: [abs(product.image)] }),
      color: product.colors.map((c) => c.name).join(", "),
      size: product.sizes.join(", "),
      offers: {
        "@type": "Offer", url: abs(`/products/${product.id}`),
        priceCurrency: "KRW", price: product.price,
        availability: sold ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
      },
    },
    {
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "홈", item: abs("/") },
        { "@type": "ListItem", position: 2, name: product.category, item: abs(`/products?category=${encodeURIComponent(product.category)}`) },
        { "@type": "ListItem", position: 3, name: product.name, item: abs(`/products/${product.id}`) },
      ],
    },
  ];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
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
