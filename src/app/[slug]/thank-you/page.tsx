"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

export default function ThankYou() {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "#FF1A6C", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="w-full max-w-sm text-center">
        <div className="text-5xl mb-4">🎀</div>
        <h2
          className="text-white mb-2"
          style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.15 }}
        >
          Your gift has been assigned.
        </h2>
        <p className="mb-8" style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
          No take-backs.
        </p>
        <div
          className="rounded-2xl py-5 px-6 text-center mb-8"
          style={{ background: "#FFE600" }}
        >
          <p style={{ color: "#0f0a0a", fontWeight: 700, fontSize: 15 }}>
            📸 Screenshot sent. The proof is in your hands now.
          </p>
        </div>
        <Link
          href="/"
          className="inline-block w-full py-4 rounded-full text-center font-bold transition-all"
          style={{
            background: "white",
            color: "#0f0a0a",
          }}
        >
          Make your own →
        </Link>
      </div>
    </div>
  );
}
