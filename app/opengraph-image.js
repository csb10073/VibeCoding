import { ImageResponse } from "next/og";

export const alt = "ATELIER — Minimal Daily Wear";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 기본 폰트에는 한글 글리프가 없어 영문만 사용
export default function Image() {
  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", background: "#f3f1ed", color: "#222",
      }}>
        <div style={{ fontSize: 120, letterSpacing: 24, fontWeight: 700 }}>ATELIER</div>
        <div style={{ fontSize: 36, marginTop: 24, letterSpacing: 6 }}>MINIMAL DAILY WEAR</div>
      </div>
    ),
    size
  );
}
