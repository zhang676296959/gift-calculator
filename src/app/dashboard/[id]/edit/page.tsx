"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Question {
  id: string;
  type: string;
  title: string;
  order: number;
  options: { label: string; value: string }[];
}

interface Tier {
  id: string;
  key: string;
  label: string;
  emoji: string;
  verdict: string;
  order: number;
  gifts: { id: string; name: string; order: number }[];
}

export default function EditEvent() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const id = params.id as string;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
      return;
    }
    if (status !== "authenticated") return;

    fetch(`/api/events/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setTitle(data.title);
        setSlug(data.slug);
        setLoading(false);
      })
      .catch(() => router.push("/dashboard"));
  }, [id, status, router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      alert("Failed to save");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FF1A6C" }}>
        <div className="text-4xl animate-bounce">🎀</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#FF1A6C", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <header className="flex items-center px-6 py-4">
        <Link href={`/dashboard/${id}`} className="text-white/70 hover:text-white text-sm font-semibold transition-colors">
          ← Back
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-6 pb-12">
        <h1 className="text-white font-extrabold text-2xl mb-2">Edit Event</h1>
        <p className="text-white/60 text-sm mb-8">
          Customize your gift calculator
        </p>

        {/* Title */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 mb-4">
          <label className="block text-white/80 text-sm font-semibold mb-2">
            Event Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full py-3 px-4 rounded-xl text-base font-semibold outline-none"
            style={{
              background: "rgba(255,255,255,0.15)",
              color: "white",
              border: "2px solid rgba(255,255,255,0.25)",
            }}
          />
        </div>

        {/* Slug */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 mb-6">
          <label className="block text-white/80 text-sm font-semibold mb-2">
            Share Link
          </label>
          <div
            className="py-3 px-4 rounded-xl text-sm font-mono"
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)",
              border: "2px solid rgba(255,255,255,0.15)",
            }}
          >
            giftcalc.app/{slug}
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 rounded-full text-center font-bold transition-all"
          style={{
            background: "white",
            color: "#0f0a0a",
          }}
        >
          {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Changes"}
        </button>
      </main>
    </div>
  );
}
