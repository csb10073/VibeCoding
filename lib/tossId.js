// 클라이언트/서버 공용 (시크릿 키와 무관한 순수 함수만 둔다)
// 토스 orderId 규칙: 6~64자, 영문/숫자/-/_ . 내부 주문번호("O1001")는 5자라 접두어를 붙인다.
const PREFIX = "ATELIER-";
export const toTossOrderId = (id) => `${PREFIX}${id}`;
export const fromTossOrderId = (tid) => (tid?.startsWith(PREFIX) ? tid.slice(PREFIX.length) : null);
