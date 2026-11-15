"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { login, signup, createOrder, saveProduct } from "@/lib/actions";
import { toTossOrderId } from "@/lib/tossId";

function Err({ state }) {
  return state?.error ? <p className="error" role="alert">{state.error}</p> : null;
}
function Field({ label, children }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

export function LoginForm({ next }) {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="form">
      <input type="hidden" name="next" value={next} />
      <Field label="이메일"><input name="email" type="email" required autoComplete="email" /></Field>
      <Field label="비밀번호"><input name="password" type="password" required autoComplete="current-password" /></Field>
      <Err state={state} />
      <button className="btn block" disabled={pending}>{pending ? "로그인 중…" : "로그인"}</button>
      <button type="button" className="btn block kakao" disabled title="데모에서는 비활성화(앱 키 필요)">카카오로 시작하기 (준비 중)</button>
      <p className="muted small center">계정이 없으신가요? <Link href={`/signup?next=${encodeURIComponent(next)}`}>회원가입</Link></p>
    </form>
  );
}

export function SignupForm({ next }) {
  const [state, action, pending] = useActionState(signup, null);
  return (
    <form action={action} className="form">
      <input type="hidden" name="next" value={next} />
      <Field label="이름"><input name="name" required autoComplete="name" /></Field>
      <Field label="이메일"><input name="email" type="email" required autoComplete="email" /></Field>
      <Field label="비밀번호 (8자 이상)"><input name="password" type="password" minLength={8} required autoComplete="new-password" /></Field>
      <Err state={state} />
      <button className="btn block" disabled={pending}>{pending ? "처리 중…" : "가입하기"}</button>
      <p className="muted small center">이미 계정이 있으신가요? <Link href={`/login?next=${encodeURIComponent(next)}`}>로그인</Link></p>
    </form>
  );
}

export function ShippingForm({ defaultName }) {
  const [state, action, pending] = useActionState(createOrder, null);
  return (
    <form action={action} className="form">
      <Field label="수령인"><input name="receiver" defaultValue={defaultName} required /></Field>
      <Field label="연락처"><input name="phone" placeholder="010-1234-5678" inputMode="tel" required /></Field>
      <Field label="우편번호"><input name="zip" inputMode="numeric" maxLength={5} required /></Field>
      <Field label="주소"><input name="address" placeholder="기본 주소 + 상세 주소" required /></Field>
      <Field label="배송 메모 (선택)"><input name="memo" /></Field>
      <Err state={state} />
      <button className="btn block" disabled={pending}>{pending ? "주문 생성 중…" : "결제 단계로"}</button>
    </form>
  );
}

const CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

export function PayForm(props) {
  // 키 없음(개발 환경) → 모의 결제 / gck 키 → 결제위젯 / ck 키 → 결제창
  if (!CLIENT_KEY && process.env.NODE_ENV !== "production") return <MockPay {...props} />;
  if (CLIENT_KEY?.includes("_gck_")) return <WidgetPay {...props} />;
  return <WindowPay {...props} />;
}

function MockPay({ orderId, total, initialError }) {
  const base = `/checkout/${orderId}`;
  return (
    <div className="form">
      <p className="test-banner">모의 결제 모드입니다. 토스 키가 없어 실제 결제창 없이 결제 결과만 흉내 냅니다.</p>
      {initialError && <p className="error" role="alert">{initialError}</p>}
      <a className="btn block" href={`${base}/success?paymentKey=mock_${Date.now()}&orderId=${toTossOrderId(orderId)}&amount=${total}`}>
        {total.toLocaleString("ko-KR")}원 결제하기 (가짜 · 성공)
      </a>
      <a className="btn block ghost" href={`${base}?message=${encodeURIComponent("모의 결제 실패: 카드사에서 승인이 거절되었습니다.")}`}>
        결제 실패 시뮬레이션
      </a>
    </div>
  );
}

// 결제위젯(gck 키): 결제수단 선택 UI + 약관을 페이지 안에 렌더링
function WidgetPay({ orderId, total, orderName, customerName, initialError }) {
  const [error, setError] = useState(initialError || null);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);
  const widgetsRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    // StrictMode(개발)에서 효과가 2번 실행돼도 위젯은 한 번만 렌더링한다.
    if (startedRef.current) return;
    startedRef.current = true;
    (async () => {
      try {
        const toss = await loadTossPayments(CLIENT_KEY);
        const widgets = toss.widgets({ customerKey: ANONYMOUS });
        await widgets.setAmount({ currency: "KRW", value: total });
        await Promise.all([
          widgets.renderPaymentMethods({ selector: "#payment-method", variantKey: "DEFAULT" }),
          widgets.renderAgreement({ selector: "#agreement", variantKey: "AGREEMENT" }),
        ]);
        widgetsRef.current = widgets;
        setReady(true);
      } catch (e) {
        setError(e?.message || "결제 위젯을 불러오지 못했습니다.");
      }
    })();
  }, [total]);

  async function pay() {
    setPending(true);
    setError(null);
    try {
      await widgetsRef.current.requestPayment({
        orderId: toTossOrderId(orderId),
        orderName,
        customerName,
        successUrl: `${window.location.origin}/checkout/${orderId}/success`,
        failUrl: `${window.location.origin}/checkout/${orderId}`,
      });
    } catch (e) {
      if (e?.code !== "USER_CANCEL") setError(e?.message || "결제를 진행할 수 없습니다.");
      setPending(false);
    }
  }

  return (
    <div className="form">
      <p className="test-banner">테스트 결제입니다. 실제 금액은 청구되지 않습니다.</p>
      <div id="payment-method" />
      <div id="agreement" />
      {error && <p className="error" role="alert">{error}</p>}
      <button className="btn block" onClick={pay} disabled={!ready || pending}>
        {pending ? "결제 진행 중…" : `${total.toLocaleString("ko-KR")}원 결제하기`}
      </button>
    </div>
  );
}

// 결제창(ck 키)
function WindowPay({ orderId, total, orderName, customerName, initialError }) {
  const [error, setError] = useState(initialError || null);
  const [pending, setPending] = useState(false);

  async function pay() {
    setPending(true);
    setError(null);
    try {
      const tossPayments = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY);
      // 비회원 결제용 customerKey (회원 식별이 필요하면 유저 id 기반 고유값으로 교체)
      const payment = tossPayments.payment({ customerKey: ANONYMOUS });
      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: total },
        orderId: toTossOrderId(orderId),
        orderName,
        customerName,
        successUrl: `${window.location.origin}/checkout/${orderId}/success`,
        failUrl: `${window.location.origin}/checkout/${orderId}`,
      });
    } catch (e) {
      // 사용자가 결제창을 닫은 경우 등
      if (e?.code !== "USER_CANCEL") setError(e?.message || "결제창을 열 수 없습니다.");
      setPending(false);
    }
  }

  return (
    <div className="form">
      <p className="test-banner">테스트 결제입니다. 실제 금액은 청구되지 않습니다.</p>
      {error && <p className="error" role="alert">{error}</p>}
      <button className="btn block" onClick={pay} disabled={pending}>
        {pending ? "결제창 여는 중…" : `${total.toLocaleString("ko-KR")}원 결제하기`}
      </button>
    </div>
  );
}

export function ProductForm({ product }) {
  const [state, action, pending] = useActionState(saveProduct, null);
  const p = product;
  return (
    <form action={action} className="form wide">
      {p && <input type="hidden" name="id" value={p.id} />}
      <Field label="상품명"><input name="name" defaultValue={p?.name} required /></Field>
      <div className="two">
        <Field label="카테고리">
          <select name="category" defaultValue={p?.category || "상의"}>
            {["아우터", "상의", "하의", "잡화"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="가격(원)"><input name="price" type="number" min="1" defaultValue={p?.price} required /></Field>
      </div>
      <Field label="설명"><textarea name="desc" rows={3} defaultValue={p?.desc} /></Field>
      <div className="two">
        <Field label="색상 (쉼표 구분)"><input name="colors" defaultValue={p?.colors.map((c) => c.name).join(", ")} placeholder="블랙, 아이보리" required /></Field>
        <Field label="사이즈 (쉼표 구분)"><input name="sizes" defaultValue={p?.sizes.join(", ")} placeholder="S, M, L" required /></Field>
      </div>
      <Field label="옵션별 재고 수량">
        <input name="qty" type="number" min="0" defaultValue={p ? 0 : 10} />
      </Field>
      {p && (
        <label className="check">
          <input type="radio" name="qtyMode" value="keep" defaultChecked /> 기존 재고 유지(새 옵션만 위 수량 적용)
          <input type="radio" name="qtyMode" value="set" /> 모든 옵션을 위 수량으로 덮어쓰기
        </label>
      )}
      <label className="check"><input type="checkbox" name="featured" defaultChecked={p?.featured} /> 홈 추천 상품으로 노출</label>
      <Err state={state} />
      <button className="btn" disabled={pending}>{pending ? "저장 중…" : "저장"}</button>
    </form>
  );
}
