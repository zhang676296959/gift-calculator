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

interface Gift {
  id: string;
  name: string;
  order: number;
}

interface Tier {
  id: string;
  key: string;
  label: string;
  emoji: string;
  verdict: string;
  order: number;
  gifts: Gift[];
}

interface EventData {
  id: string;
  title: string;
  slug: string;
  questions: Question[];
  tiers: Tier[];
}

export default function EditEvent() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const id = params.id as string;

  const [event, setEvent] = useState<EventData | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
      return;
    }
    if (status !== "authenticated") return;

    fetch(`/api/events/${id}`)
      .then((res) => res.json())
      .then((data: EventData) => {
        setEvent(data);
        setTitle(data.title);
        setQuestions(data.questions);
        setTiers(data.tiers);
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
        body: JSON.stringify({
          title,
          questions: questions.map((q) => ({
            type: q.type,
            title: q.title,
            options: q.options,
          })),
          tiers: tiers.map((t) => ({
            key: t.key,
            label: t.label,
            emoji: t.emoji,
            verdict: t.verdict,
            gifts: t.gifts.map((g) => g.name),
          })),
        }),
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

  // Question helpers
  const updateQuestion = (index: number, field: string, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  const addCustomQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        type: "custom",
        title: "New question?",
        order: prev.length + 1,
        options: [
          { label: "Option 1", value: "option_1" },
          { label: "Option 2", value: "option_2" },
        ],
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  // Tier helpers
  const updateTier = (index: number, field: string, value: string) => {
    setTiers((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    );
  };

  const addGift = (tierIndex: number) => {
    setTiers((prev) =>
      prev.map((t, i) =>
        i === tierIndex
          ? {
              ...t,
              gifts: [
                ...t.gifts,
                { id: `new-${Date.now()}`, name: "", order: t.gifts.length + 1 },
              ],
            }
          : t
      )
    );
  };

  const updateGift = (tierIndex: number, giftIndex: number, name: string) => {
    setTiers((prev) =>
      prev.map((t, ti) =>
        ti === tierIndex
          ? {
              ...t,
              gifts: t.gifts.map((g, gi) =>
                gi === giftIndex ? { ...g, name } : g
              ),
            }
          : t
      )
    );
  };

  const removeGift = (tierIndex: number, giftIndex: number) => {
    setTiers((prev) =>
      prev.map((t, ti) =>
        ti === tierIndex
          ? { ...t, gifts: t.gifts.filter((_, gi) => gi !== giftIndex) }
          : t
      )
    );
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
      <header className="flex items-center justify-between px-6 py-4">
        <Link href={`/dashboard/${id}`} className="text-white/70 hover:text-white text-sm font-semibold transition-colors">
          ← Back
        </Link>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-white text-[#0f0a0a] font-bold px-6 py-2 rounded-full text-sm transition-all hover:bg-[#FFE600]"
        >
          {saving ? "Saving..." : saved ? "✓ Saved!" : "Save"}
        </button>
      </header>

      <main className="max-w-xl mx-auto px-6 pb-12">
        <h1 className="text-white font-extrabold text-2xl mb-1">Edit Event</h1>
        <p className="text-white/50 text-sm mb-6">Customize your gift calculator</p>

        {/* ── Title ── */}
        <Section title="1. Event Title">
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
        </Section>

        {/* ── Questions ── */}
        <Section title={`2. Questions (${questions.length})`}>
          <div className="flex flex-col gap-3">
            {questions.map((q, qi) => (
              <div
                key={q.id}
                className="rounded-xl p-4"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: "rgba(255,255,255,0.4)" }}>
                    {q.type === "closeness" ? "① Closeness" : q.type === "annoyance" ? "② Annoyance" : q.type === "budget" ? "③ Budget" : "✦ Custom"}
                  </span>
                  {q.type === "custom" && (
                    <button
                      onClick={() => removeQuestion(qi)}
                      className="ml-auto text-[10px] px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(255,0,0,0.2)", color: "rgba(255,255,255,0.7)" }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={q.title}
                  onChange={(e) => updateQuestion(qi, "title", e.target.value)}
                  className="w-full py-2 px-3 rounded-lg text-sm font-semibold outline-none"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                />
              </div>
            ))}
          </div>
          <button
            onClick={addCustomQuestion}
            className="w-full mt-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.7)",
              border: "1px dashed rgba(255,255,255,0.3)",
            }}
          >
            + Add Custom Question
          </button>
        </Section>

        {/* ── Tiers & Gifts ── */}
        <Section title={`3. Gift Tiers (${tiers.length})`}>
          <div className="flex flex-col gap-4">
            {tiers.map((tier, ti) => (
              <div
                key={tier.key}
                className="rounded-xl p-4"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                {/* Tier row */}
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={tier.emoji}
                    onChange={(e) => updateTier(ti, "emoji", e.target.value)}
                    className="w-10 h-10 rounded-lg text-center text-lg outline-none"
                    style={{ background: "rgba(255,255,255,0.12)" }}
                    maxLength={2}
                  />
                  <input
                    type="text"
                    value={tier.label}
                    onChange={(e) => updateTier(ti, "label", e.target.value)}
                    className="flex-1 py-2 px-3 rounded-lg text-sm font-bold outline-none"
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
                  />
                </div>

                {/* Verdict */}
                <input
                  type="text"
                  value={tier.verdict}
                  onChange={(e) => updateTier(ti, "verdict", e.target.value)}
                  placeholder="Verdict quote..."
                  className="w-full py-2 px-3 rounded-lg text-xs italic outline-none mb-3"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                />

                {/* Gifts */}
                <div className="flex flex-col gap-1.5">
                  {tier.gifts.map((gift, gi) => (
                    <div key={gift.id} className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                        {gi + 1}.
                      </span>
                      <input
                        type="text"
                        value={gift.name}
                        onChange={(e) => updateGift(ti, gi, e.target.value)}
                        placeholder="Gift name"
                        className="flex-1 py-1.5 px-3 rounded-lg text-sm outline-none"
                        style={{
                          background: "rgba(255,255,255,0.1)",
                          color: "white",
                          border: "1px solid rgba(255,255,255,0.12)",
                        }}
                      />
                      <button
                        onClick={() => removeGift(ti, gi)}
                        className="text-xs px-2 py-1 rounded-full"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => addGift(ti)}
                  className="w-full mt-2 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.5)",
                    border: "1px dashed rgba(255,255,255,0.2)",
                  }}
                >
                  + Add gift
                </button>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Bottom Save ── */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-4 rounded-full font-bold text-base transition-all"
            style={{
              background: "white",
              color: "#0f0a0a",
            }}
          >
            {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Changes"}
          </button>
          <Link
            href={`/dashboard/${id}`}
            className="py-4 px-6 rounded-full font-bold text-sm transition-all"
            style={{
              background: "rgba(255,255,255,0.15)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          >
            View Results →
          </Link>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-white/80 font-bold text-sm mb-3 tracking-wide uppercase">
        {title}
      </h2>
      {children}
    </div>
  );
}
