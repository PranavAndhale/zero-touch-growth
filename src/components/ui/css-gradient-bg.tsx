"use client"

export default function CssGradientBg() {
  return (
    <>
      <style>{`
        @keyframes ztBlob1 {
          0%   { transform: translate(0px, 0px) scale(1); }
          33%  { transform: translate(120px, -80px) scale(1.15); }
          66%  { transform: translate(-60px, 100px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes ztBlob2 {
          0%   { transform: translate(0px, 0px) scale(1); }
          33%  { transform: translate(-100px, 60px) scale(0.85); }
          66%  { transform: translate(80px, -120px) scale(1.2); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes ztBlob3 {
          0%   { transform: translate(0px, 0px) scale(1); }
          50%  { transform: translate(60px, 80px) scale(1.1); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes ztBlob4 {
          0%   { transform: translate(0px, 0px) scale(1); }
          40%  { transform: translate(-80px, -60px) scale(1.25); }
          80%  { transform: translate(50px, 30px) scale(0.8); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
      `}</style>

      {/* Base */}
      <div style={{ position: "absolute", inset: 0, background: "#020818" }} />

      {/* Blob 1 — large primary blue, top-left */}
      <div style={{
        position: "absolute", borderRadius: "50%",
        width: 700, height: 700, top: -180, left: -150,
        background: "radial-gradient(circle, #1A64E8 0%, #0A3566 50%, transparent 75%)",
        filter: "blur(60px)", opacity: 0.55,
        animation: "ztBlob1 22s ease-in-out infinite",
      }} />

      {/* Blob 2 — medium accent blue, bottom-right */}
      <div style={{
        position: "absolute", borderRadius: "50%",
        width: 550, height: 550, bottom: -120, right: -100,
        background: "radial-gradient(circle, #66B3FF 0%, #1A64E8 45%, transparent 75%)",
        filter: "blur(70px)", opacity: 0.45,
        animation: "ztBlob2 28s ease-in-out infinite",
      }} />

      {/* Blob 3 — small bright, center */}
      <div style={{
        position: "absolute", borderRadius: "50%",
        width: 400, height: 400, top: "40%", left: "45%",
        background: "radial-gradient(circle, #3B82F6 0%, #1A64E8 40%, transparent 70%)",
        filter: "blur(80px)", opacity: 0.35,
        animation: "ztBlob3 18s ease-in-out infinite",
      }} />

      {/* Blob 4 — accent, top-right */}
      <div style={{
        position: "absolute", borderRadius: "50%",
        width: 500, height: 500, top: -80, right: -80,
        background: "radial-gradient(circle, #2563EB 0%, #1E40AF 50%, transparent 75%)",
        filter: "blur(65px)", opacity: 0.4,
        animation: "ztBlob4 24s ease-in-out infinite",
      }} />

      {/* Dark overlay for text readability */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(2,8,24,0.35)" }} />
    </>
  )
}
