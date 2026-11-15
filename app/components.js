import Link from "next/link";
import { won, totalStock } from "@/lib/db";

// 상품 사진(product.image). 사진이 없는 상품(관리자 신규 등록 등)은 SVG 플레이스홀더로 대체한다.
export function ProductImage({ product, size = 400 }) {
  if (product.image)
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={product.image} alt={product.name} width={size} height={size} loading="lazy"
        style={{ width: "100%", height: "auto", aspectRatio: "1 / 1", objectFit: "cover", display: "block" }} />
    );
  const hex = product.colors[0]?.hex || "#ddd";
  const dark = ["#222222", "#26324d", "#6b4a35", "#6d7358"].includes(hex);
  const fg = dark ? "#ffffff" : "#222222";
  const cat = product.category;
  let shape;
  if (cat === "아우터")
    shape = <path d="M120 120 L160 100 Q200 130 240 100 L280 120 L330 200 L290 220 L280 190 L280 320 L120 320 L120 190 L110 220 L70 200 Z" />;
  else if (cat === "상의")
    shape = <path d="M130 110 L170 100 Q200 125 230 100 L270 110 L320 170 L285 200 L270 180 L270 310 L130 310 L130 180 L115 200 L80 170 Z" />;
  else if (cat === "하의")
    shape = <path d="M130 90 H270 L290 320 H215 L200 170 L185 320 H110 Z" />;
  else
    shape = <g><rect x="110" y="150" width="180" height="150" rx="14" /><path d="M150 150 Q150 90 200 90 Q250 90 250 150" fill="none" stroke={fg} strokeWidth="14" /></g>;
  return (
    <svg viewBox="0 0 400 400" width={size} height={size} role="img" aria-label={product.name} style={{ width: "100%", height: "auto", display: "block" }}>
      <rect width="400" height="400" fill="#f3f1ed" />
      <g fill={hex} stroke={dark ? "#00000033" : "#00000022"} strokeWidth="2">{shape}</g>
    </svg>
  );
}

export function ProductCard({ product }) {
  const sold = totalStock(product) === 0;
  return (
    <Link href={`/products/${product.id}`} className="card">
      <div className="thumb">
        <ProductImage product={product} />
        {sold && <span className="badge">SOLD OUT</span>}
      </div>
      <div className="card-body">
        <div className="muted small">{product.category}</div>
        <div className="card-name">{product.name}</div>
        <div className="price">{won(product.price)}</div>
        <div className="dots">
          {product.colors.map((c) => (
            <span key={c.name} title={c.name} style={{ background: c.hex }} />
          ))}
        </div>
      </div>
    </Link>
  );
}
