import { ImageResponse } from "next/og";

export const alt = "BS Travels, Jaffna, Sri Lanka: Your next chapter begins here.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          color: "#f4eee2",
          background: "radial-gradient(70% 90% at 80% 100%, #d0815e 0%, #3a2a48 40%, #0a1326 75%)",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 6, color: "#e3b467" }}>BS TRAVELS · JAFFNA, SRI LANKA</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 88, lineHeight: 1.02, maxWidth: 900 }}>Your next chapter begins here.</div>
          <div style={{ fontSize: 30, marginTop: 24, color: "#cdc6b8" }}>Visas · Flights · Immigration · Translation · Tours · Courier</div>
        </div>
      </div>
    ),
    size,
  );
}
