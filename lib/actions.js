"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  readDb, writeDb, nextId, hashPassword, verifyPassword, shippingFor,
} from "./db";
import { createSession, destroySession, requireUser, requireAdmin } from "./auth";

const str = (fd, k) => String(fd.get(k) ?? "").trim();
const safeNext = (n) => (n && n.startsWith("/") && !n.startsWith("//") ? n : "/");

// ---------- 인증 ----------
export async function signup(_prev, fd) {
  const email = str(fd, "email").toLowerCase();
  const name = str(fd, "name");
  const pw = str(fd, "password");
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "이메일 형식이 올바르지 않습니다." };
  if (!name) return { error: "이름을 입력해 주세요." };
  if (pw.length < 8) return { error: "비밀번호는 8자 이상이어야 합니다." };
  const db = readDb();
  if (db.users.some((u) => u.email === email)) return { error: "이미 가입된 이메일입니다." };
  const user = { id: nextId(db, "u"), email, name, role: "user", passwordHash: hashPassword(pw) };
  db.users.push(user);
  writeDb(db);
  await createSession(user.id);
  redirect(safeNext(str(fd, "next")));
}

export async function login(_prev, fd) {
  const email = str(fd, "email").toLowerCase();
  const user = readDb().users.find((u) => u.email === email);
  if (!user || !verifyPassword(str(fd, "password"), user.passwordHash))
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  await createSession(user.id);
  redirect(safeNext(str(fd, "next")));
}

export async function logout() {
  await destroySession();
  redirect("/");
}

// ---------- 장바구니 ----------
export async function addToCart(fd) {
  const productId = str(fd, "productId");
  const user = await requireUser(`/products/${productId}`);
  const color = str(fd, "color"), size = str(fd, "size");
  const qty = Math.max(1, Math.min(10, parseInt(str(fd, "qty")) || 1));
  const db = readDb();
  const p = db.products.find((x) => x.id === productId);
  const have = p?.stock[`${color}|${size}`];
  if (!p || !have) redirect(`/products/${productId}?error=soldout`);
  const cart = (db.carts[user.id] ||= []);
  const line = cart.find((l) => l.productId === productId && l.color === color && l.size === size);
  const total = (line?.qty || 0) + qty;
  if (total > have) redirect(`/products/${productId}?error=stock`);
  if (line) line.qty = total;
  else cart.push({ productId, color, size, qty });
  writeDb(db);
  revalidatePath("/", "layout");
  redirect("/cart");
}

export async function updateCartQty(fd) {
  const user = await requireUser("/cart");
  const db = readDb();
  const cart = db.carts[user.id] || [];
  const idx = parseInt(str(fd, "idx"));
  const line = cart[idx];
  if (!line) return;
  const p = db.products.find((x) => x.id === line.productId);
  const max = Math.min(10, p?.stock[`${line.color}|${line.size}`] || 0);
  const qty = Math.max(1, Math.min(max, parseInt(str(fd, "qty")) || 1));
  line.qty = qty;
  writeDb(db);
  revalidatePath("/", "layout");
}

export async function removeFromCart(fd) {
  const user = await requireUser("/cart");
  const db = readDb();
  const cart = db.carts[user.id] || [];
  cart.splice(parseInt(str(fd, "idx")), 1);
  writeDb(db);
  revalidatePath("/", "layout");
}

// ---------- 주문 / 결제 ----------
function priceCart(db, cart) {
  const items = [];
  for (const l of cart) {
    const p = db.products.find((x) => x.id === l.productId);
    if (!p) continue;
    items.push({
      productId: p.id, name: p.name, color: l.color, size: l.size,
      qty: l.qty, unitPrice: p.price,
    });
  }
  const subtotal = items.reduce((a, i) => a + i.unitPrice * i.qty, 0);
  const shipping = shippingFor(subtotal);
  return { items, subtotal, shipping, total: subtotal + shipping };
}

export async function createOrder(_prev, fd) {
  const user = await requireUser("/cart");
  const info = {
    receiver: str(fd, "receiver"), phone: str(fd, "phone"),
    zip: str(fd, "zip"), address: str(fd, "address"), memo: str(fd, "memo"),
  };
  if (!info.receiver || !info.address || !info.zip) return { error: "수령인·우편번호·주소를 입력해 주세요." };
  if (!/^01\d[-\s]?\d{3,4}[-\s]?\d{4}$/.test(info.phone)) return { error: "연락처 형식이 올바르지 않습니다. (예: 010-1234-5678)" };
  const db = readDb();
  const cart = db.carts[user.id] || [];
  if (!cart.length) return { error: "장바구니가 비어 있습니다." };
  for (const l of cart) {
    if ((db.products.find((p) => p.id === l.productId)?.stock[`${l.color}|${l.size}`] || 0) < l.qty)
      return { error: "재고가 부족한 상품이 있습니다. 장바구니를 확인해 주세요." };
  }
  const priced = priceCart(db, cart);
  const order = {
    id: nextId(db, "O"), userId: user.id, ...priced, status: "결제대기",
    shippingInfo: info, createdAt: new Date().toISOString(), paidAt: null,
  };
  db.orders.push(order);
  writeDb(db);
  redirect(`/checkout/${order.id}`);
}

export async function cancelMyOrder(fd) {
  const user = await requireUser("/orders");
  const db = readDb();
  const o = db.orders.find((x) => x.id === str(fd, "orderId") && x.userId === user.id);
  if (o && o.status === "결제대기") {
    o.status = "취소";
    writeDb(db);
  }
  revalidatePath("/orders");
}

// ---------- 관리자 ----------
export async function setOrderStatus(fd) {
  await requireAdmin();
  const status = str(fd, "status");
  if (!["배송중", "배송완료"].includes(status)) return;
  const db = readDb();
  const o = db.orders.find((x) => x.id === str(fd, "orderId"));
  const okFrom = status === "배송중" ? "결제완료" : "배송중";
  if (o && o.status === okFrom) {
    o.status = status;
    writeDb(db);
  }
  revalidatePath("/admin/orders");
}

export async function adminCancelOrder(fd) {
  await requireAdmin();
  const db = readDb();
  const o = db.orders.find((x) => x.id === str(fd, "orderId"));
  if (o && ["결제완료", "배송중"].includes(o.status)) {
    for (const i of o.items) {
      const p = db.products.find((x) => x.id === i.productId);
      if (p) p.stock[`${i.color}|${i.size}`] = (p.stock[`${i.color}|${i.size}`] || 0) + i.qty;
    }
    o.status = "취소";
    writeDb(db);
  }
  revalidatePath("/admin/orders");
}

export async function saveProduct(_prev, fd) {
  await requireAdmin();
  const name = str(fd, "name");
  const price = parseInt(str(fd, "price"));
  const category = str(fd, "category");
  if (!name || !(price > 0)) return { error: "상품명과 가격을 올바르게 입력해 주세요." };
  const colorNames = str(fd, "colors").split(",").map((s) => s.trim()).filter(Boolean);
  const sizes = str(fd, "sizes").split(",").map((s) => s.trim()).filter(Boolean);
  if (!colorNames.length || !sizes.length) return { error: "색상과 사이즈를 하나 이상 입력해 주세요." };
  const qty = Math.max(0, parseInt(str(fd, "qty")) || 0);
  const db = readDb();
  const id = str(fd, "id");
  const existing = id ? db.products.find((p) => p.id === id) : null;
  const stock = {};
  for (const c of colorNames) for (const s of sizes) {
    const key = `${c}|${s}`;
    stock[key] = fd.get("qtyMode") === "keep" && existing?.stock[key] != null ? existing.stock[key] : qty;
  }
  const hexOf = (n) => existing?.colors.find((c) => c.name === n)?.hex
    || { 블랙: "#222222", 아이보리: "#efe8d8", 베이지: "#cdb99a", 네이비: "#26324d", 카키: "#6d7358", 그레이: "#9a9a9a", 브라운: "#6b4a35", 블루: "#6f8fb5" }[n]
    || "#bbbbbb";
  const data = {
    name, price, category, desc: str(fd, "desc"), sizes, stock,
    colors: colorNames.map((n) => ({ name: n, hex: hexOf(n) })),
    featured: fd.get("featured") === "on",
  };
  if (existing) Object.assign(existing, data);
  else db.products.push({ id: nextId(db, "p"), ...data, createdAt: new Date().toISOString() });
  writeDb(db);
  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function soldOutProduct(fd) {
  await requireAdmin();
  const db = readDb();
  const p = db.products.find((x) => x.id === str(fd, "id"));
  if (p) {
    for (const k of Object.keys(p.stock)) p.stock[k] = 0;
    writeDb(db);
  }
  revalidatePath("/", "layout");
}
