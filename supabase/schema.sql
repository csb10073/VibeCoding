-- Supabase SQL Editor 에서 한 번 실행하세요.
-- 앱 전체 데이터(users, products, carts, orders ...)를 jsonb 문서 1행으로 저장합니다.
create table if not exists app_state (
  id int primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- RLS 활성화 + 정책 없음 = anon/공개 키로는 접근 불가.
-- 서버가 service_role 키로만 접근합니다 (service_role 은 RLS 를 우회).
alter table app_state enable row level security;
