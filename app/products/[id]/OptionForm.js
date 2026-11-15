"use client";

import { useState } from "react";
import { addToCart } from "@/lib/actions";

export default function OptionForm({ product, loggedIn }) {
  const firstAvail = product.colors.find((c) => product.sizes.some((s) => product.stock[`${c.name}|${s}`] > 0));
  const [color, setColor] = useState(firstAvail?.name || product.colors[0].name);
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const left = size ? product.stock[`${color}|${size}`] : null;
  const colorSold = (c) => product.sizes.every((s) => product.stock[`${c}|${s}`] === 0);

  return (
    <form action={addToCart} className="options">
      <input type="hidden" name="productId" value={product.id} />
      <input type="hidden" name="color" value={color} />
      <input type="hidden" name="size" value={size} />
      <input type="hidden" name="qty" value={qty} />

      <div className="opt-label">색상 <b>{color}</b></div>
      <div className="swatches">
        {product.colors.map((c) => (
          <button type="button" key={c.name} title={c.name} disabled={colorSold(c.name)}
            className={`swatch ${color === c.name ? "on" : ""}`} style={{ background: c.hex }}
            aria-label={c.name} aria-pressed={color === c.name}
            onClick={() => { setColor(c.name); setSize(""); setQty(1); }} />
        ))}
      </div>

      <div className="opt-label">사이즈</div>
      <div className="chips">
        {product.sizes.map((s) => {
          const n = product.stock[`${color}|${s}`];
          return (
            <button type="button" key={s} disabled={n === 0} aria-pressed={size === s}
              className={`chip ${size === s ? "on" : ""}`} onClick={() => { setSize(s); setQty(1); }}>
              {s}{n === 0 ? " (품절)" : ""}
            </button>
          );
        })}
      </div>
      {left !== null && <p className="muted small">{left <= 3 ? `남은 수량 ${left}개` : "재고 있음"}</p>}

      <div className="opt-label">수량</div>
      <div className="qty">
        <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="수량 감소">−</button>
        <span>{qty}</span>
        <button type="button" onClick={() => setQty(Math.min(left || 1, 10, qty + 1))} aria-label="수량 증가">＋</button>
      </div>

      <button className="btn block" disabled={!size}>
        {size ? (loggedIn ? "장바구니 담기" : "로그인 후 담기") : "사이즈를 선택해 주세요"}
      </button>
    </form>
  );
}
