import { ImageResponse } from "next/og";

export const alt = "Select Your Sauna – Planungshilfe für private Saunen";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#fbf8ef",
          color: "#17362f",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: "68%",
            padding: "62px 72px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 58,
                height: 58,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 29,
                background: "#17362f",
                color: "#fbf8ef",
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              SYS
            </div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>Select Your Sauna</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ color: "#b94928", fontSize: 17, fontWeight: 700, letterSpacing: 2.4 }}>
              PLANUNG UND PRODUKTVERGLEICH
            </div>
            <div style={{ maxWidth: 700, fontFamily: "Georgia, serif", fontSize: 64, lineHeight: 1.05 }}>
              Saunaplanung mit nachvollziehbaren Daten.
            </div>
          </div>
          <div style={{ fontSize: 19, color: "#31554c" }}>Platz · Strom · Budget · Wärmeart</div>
        </div>
        <div
          style={{
            width: "32%",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#d95f37",
          }}
        >
          <div
            style={{
              width: 250,
              height: 330,
              position: "relative",
              display: "flex",
              border: "5px solid #fffdf8",
            }}
          >
            <div style={{ position: "absolute", left: 38, right: 38, top: 76, height: 4, background: "#fffdf8" }} />
            <div style={{ position: "absolute", left: 38, right: 38, top: 146, height: 4, background: "#fffdf8" }} />
            <div style={{ position: "absolute", left: 38, right: 38, top: 216, height: 4, background: "#fffdf8" }} />
            <div style={{ position: "absolute", right: 38, bottom: 28, width: 54, height: 54, border: "4px solid #fffdf8" }} />
          </div>
        </div>
      </div>
    ),
    size,
  );
}
