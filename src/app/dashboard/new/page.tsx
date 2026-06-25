"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function NewEvent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  if (status === "unauthenticated") {
    router.push("/sign-in");
    return null;
  }

  const handleCreate = async () => {
    if (!title.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });
      const data = await res.json();
      if (data.event) {
        router.push(`/dashboard/${data.event.id}`);
      }
    } catch {
      alert("Failed to create event. Try again.");
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#FF1A6C", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <header className="flex items-center px-6 py-4">
        <Link href="/dashboard" className="text-white/70 hover:text-white text-sm font-semibold transition-colors">
          ← Back
        </Link>
      </header>

      <main className="max-w-sm mx-auto px-6 pb-12">
        <h1 className="text-white font-extrabold text-2xl mb-2">New Event</h1>
        <p className="text-white/60 text-sm mb-8">
          Create a gift calculator for your birthday
        </p>

        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
          <label className="block text-white/80 text-sm font-semibold mb-2">
            Event Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Molly's 22nd Birthday"
            className="w-full py-3.5 px-5 rounded-2xl text-base font-semibold outline-none mb-6"
            style={{
              background: "rgba(255,255,255,0.15)",
              color: "white",
              border: "2px solid rgba(255,255,255,0.25)",
            }}
          />

          <button
            onClick={handleCreate}
            disabled={!title.trim() || creating}
            className="w-full py-4 rounded-full text-center font-bold transition-all"
            style={{
              background: title.trim() ? "white" : "rgba(255,255,255,0.25)",
              color: title.trim() ? "#0f0a0a" : "rgba(255,255,255,0.5)",
              cursor: title.trim() ? "pointer" : "not-allowed",
            }}
          >
            {creating ? "Creating..." : "Create Event →"}
          </button>
        </div>

        <p className="text-white/40 text-xs mt-4 text-center">
          You can customize questions and gift tiers later.
        </p>
      </main>
    </div>
  );
}
