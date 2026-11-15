import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// 로컬 JSON 파일 DB. Supabase로 전환할 때 이 파일의 함수들만 교체하면 된다.
const DIR = path.join(process.cwd(), "data");
const FILE = path.join(DIR, "db.json");

export function hashPassword(pw, salt = crypto.randomBytes(16).toString("hex")) {
  const h = crypto.scryptSync(pw, salt, 32).toString("hex");
  return `${salt}:${h}`;
}
export function verifyPassword(pw, stored) {
  const [salt, h] = stored.split(":");
  const t = crypto.scryptSync(pw, salt, 32).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(h, "hex"), Buffer.from(t, "hex"));
}

const SIZES = ["S", "M", "L", "XL"];
const PALETTE = {
  블랙: "#222222", 아이보리: "#efe8d8", 베이지: "#cdb99a", 네이비: "#26324d",
  카키: "#6d7358", 그레이: "#9a9a9a", 브라운: "#6b4a35", 블루: "#6f8fb5",
};

function mk(i, name, category, price, colors, desc, featured = false) {
  const sizes = category === "잡화" ? ["FREE"] : SIZES;
  const stock = {};
  colors.forEach((c, ci) =>
    sizes.forEach((s, si) => {
      stock[`${c}|${s}`] = (i * 3 + ci * 5 + si * 2) % 9 + 2;
    })
  );
  return {
    id: `p${i}`, name, category, price, desc,
    colors: colors.map((c) => ({ name: c, hex: PALETTE[c] })),
    sizes, stock, featured,
    createdAt: new Date(2026, 9, 1 + i).toISOString(),
  };
}

function seed() {
  const products = [
    mk(1, "오버사이즈 울 코트", "아우터", 189000, ["블랙", "베이지"], "부드러운 울 혼방 소재의 롱 코트. 넉넉한 핏으로 어떤 스타일에도 어울립니다.", true),
    mk(2, "라이트 패딩 점퍼", "아우터", 129000, ["네이비", "카키"], "가볍고 따뜻한 숏 패딩. 간절기부터 한겨울까지 활용하기 좋습니다.", true),
    mk(3, "워싱 데님 재킷", "아우터", 99000, ["블루", "블랙"], "자연스러운 워싱의 데님 재킷."),
    mk(4, "코튼 블루종", "아우터", 89000, ["카키", "베이지"], "단정한 실루엣의 코튼 블루종."),
    mk(5, "릴렉스 후드 집업", "아우터", 69000, ["그레이", "블랙"], "도톰한 기모 안감의 후드 집업."),
    mk(6, "헤비 코튼 티셔츠", "상의", 29000, ["아이보리", "블랙", "그레이"], "20수 헤비 코튼 원단의 베이직 반팔 티.", true),
    mk(7, "옥스포드 셔츠", "상의", 49000, ["블루", "아이보리"], "탄탄한 옥스포드 면 셔츠."),
    mk(8, "램스울 니트", "상의", 59000, ["브라운", "네이비", "아이보리"], "촉감 좋은 램스울 라운드 니트.", true),
    mk(9, "스트라이프 롱슬리브", "상의", 35000, ["네이비", "아이보리"], "데일리로 입기 좋은 스트라이프 티."),
    mk(10, "맨투맨 스웨트셔츠", "상의", 45000, ["그레이", "블랙", "베이지"], "쫀쫀한 기모 맨투맨."),
    mk(11, "폴로 카라 니트", "상의", 52000, ["블랙", "카키"], "클래식한 폴로 카라 니트."),
    mk(12, "린넨 블렌드 셔츠", "상의", 55000, ["베이지", "블루"], "시원한 린넨 혼방 셔츠."),
    mk(13, "와이드 데님 팬츠", "하의", 59000, ["블루", "블랙"], "여유로운 와이드 핏 데님.", true),
    mk(14, "코튼 치노 팬츠", "하의", 49000, ["베이지", "네이비", "카키"], "깔끔한 일자 핏 치노 팬츠."),
    mk(15, "슬랙스 팬츠", "하의", 55000, ["블랙", "그레이"], "구김이 적은 데일리 슬랙스."),
    mk(16, "카고 조거 팬츠", "하의", 52000, ["카키", "블랙"], "실용적인 포켓의 카고 조거."),
    mk(17, "플리츠 스커트", "하의", 45000, ["블랙", "베이지"], "움직임이 예쁜 플리츠 스커트."),
    mk(18, "스웨트 팬츠", "하의", 39000, ["그레이", "네이비"], "편안한 기모 스웨트 팬츠."),
    mk(19, "캔버스 토트백", "잡화", 39000, ["아이보리", "블랙"], "넉넉한 수납의 캔버스 에코백.", true),
    mk(20, "울 머플러", "잡화", 35000, ["그레이", "브라운", "네이비"], "포근한 울 머플러."),
    mk(21, "볼캡", "잡화", 25000, ["블랙", "베이지", "네이비"], "어디에나 어울리는 코튼 볼캡."),
    mk(22, "레더 카드지갑", "잡화", 32000, ["브라운", "블랙"], "슬림한 가죽 카드지갑."),
    mk(23, "니트 비니", "잡화", 22000, ["그레이", "블랙", "카키"], "신축성 좋은 니트 비니."),
    mk(24, "크로스 숄더백", "잡화", 69000, ["블랙", "브라운"], "미니멀한 디자인의 크로스백."),
  ];
  return {
    users: [
      { id: "u_admin", email: "admin@atelier.test", name: "관리자", role: "admin", passwordHash: hashPassword("admin1234") },
    ],
    products, carts: {}, orders: [], seq: 1000,
  };
}

let cache = null;
export function readDb() {
  if (cache) return cache;
  if (!fs.existsSync(FILE)) {
    fs.mkdirSync(DIR, { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(seed(), null, 2));
  }
  cache = JSON.parse(fs.readFileSync(FILE, "utf8"));
  // public/products/<상품id>.jpg 가 있으면 상품 사진으로 연결 (기존 db.json 에도 적용)
  for (const p of cache.products) {
    if (!p.image && fs.existsSync(path.join(process.cwd(), "public", "products", `${p.id}.jpg`)))
      p.image = `/products/${p.id}.jpg`;
  }
  return cache;
}
export function writeDb(db) {
  cache = db;
  fs.writeFileSync(FILE, JSON.stringify(db, null, 2));
}
export function nextId(db, prefix) {
  db.seq += 1;
  return `${prefix}${db.seq}`;
}

export function totalStock(p) {
  return Object.values(p.stock).reduce((a, b) => a + b, 0);
}
export const SHIPPING_FEE = 3000;
export const FREE_SHIPPING_FROM = 50000;
export function shippingFor(subtotal) {
  return subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
}
export const won = (n) => n.toLocaleString("ko-KR") + "원";
