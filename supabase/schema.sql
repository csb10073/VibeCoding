-- Supabase 전환용 스키마 (현재 구현은 로컬 JSON DB를 사용하며, 이 스키마는 이전 시 참고용)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null,
  role text not null default 'user' check (role in ('user','admin'))
);

create table products (
  id bigint generated always as identity primary key,
  name text not null,
  category text not null check (category in ('아우터','상의','하의','잡화')),
  price int not null check (price > 0),
  description text,
  featured boolean default false,
  created_at timestamptz default now()
);

create table product_options (
  id bigint generated always as identity primary key,
  product_id bigint references products on delete cascade,
  color text not null, color_hex text, size text not null,
  stock int not null default 0 check (stock >= 0),
  unique (product_id, color, size)
);

create table cart_items (
  id bigint generated always as identity primary key,
  user_id uuid references profiles on delete cascade,
  option_id bigint references product_options on delete cascade,
  qty int not null check (qty between 1 and 10),
  unique (user_id, option_id)
);

create table orders (
  id bigint generated always as identity primary key,
  user_id uuid references profiles,
  status text not null default '결제대기'
    check (status in ('결제대기','결제완료','배송중','배송완료','취소')),
  subtotal int not null, shipping int not null, total int not null,
  receiver text, phone text, zip text, address text, memo text,
  created_at timestamptz default now(), paid_at timestamptz
);

create table order_items (
  id bigint generated always as identity primary key,
  order_id bigint references orders on delete cascade,
  option_id bigint references product_options,
  name text, color text, size text, qty int, unit_price int
);

-- RLS: 본인 데이터만 접근, 상품은 모두 읽기 가능, 관리자는 전체 쓰기
alter table products enable row level security;
create policy "read products" on products for select using (true);
alter table cart_items enable row level security;
create policy "own cart" on cart_items using (auth.uid() = user_id);
alter table orders enable row level security;
create policy "own orders" on orders for select using (auth.uid() = user_id);
