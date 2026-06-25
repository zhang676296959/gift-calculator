"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { PRICE_AMOUNT } from "@/lib/defaults";

interface ResultsData {
  title: string;
  slug: string;
  totalFriends: number;
  isPaid: boolean;
  tierBreakdown: {
    key: string;
    label: string;
    emoji: string;
    count: number;
    percentage: number;
  }[];
  giftWall: {
    key: string;
    label: string;
    emoji: string;
    gifts: {
      id: string;
      name: string;
      selectedCount: number;
      selectedBy: { friendId: string; name: string | null; isAnonymous: boolean }[];
    }[];
  }[];
  socialCards: {
    id: string;
    name: string | null;
    isAnonymous: boolean;
    message: string | null;
    selectedTierKey: string;
    tierLabel?: string;
    tierEmoji?: string;
    tierVerdict?: string;
    gifts: string[];
    answers: Record<string, string>;
    createdAt: string;
  }[];
  answerBreakdown: Record<string, Record<string, number>>;
}

function generateTags(answers: Record<string, string>) {
  const tags: string[] = [];
  if (answers.annoyance === "innocent") tags.push("😇 Innocent this year");
  else if (answers.annoyance === "a_little") tags.push("🚨 Slightly problematic");
  else if (answers.annoyance === "yes_funny") tags.push("🎭 Funny but guilty");
  else if (answers.annoyance === "yes_owe") tags.push("💸 Owes you big time");
  else if (answers.annoyance === "plead_fifth") tags.push("🤐 Pleads the fifth");

  if (answers.closeness === "immediate_family") tags.push("👨‍👩‍👧 Family");
  else if (answers.closeness === "best_friend") tags.push("💎 Bestie");
  else if (answers.closeness === "friend") tags.push("🤝 Friend");
  else if (answers.closeness === "story_guy") tags.push("👀 Story stalker");

  return tags;
}

/** Payment modal — shown when free user tries to access locked features */
function PaymentModal({
  eventId,
  feature,
  onClose,
}: {
  eventId: string;
  feature: string;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-8 max-w-sm w-full text-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 text-lg"
        >
          ✕
        </button>

        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-2xl font-extrabold text-zinc-900 mb-2">
          Unlock {feature}
        </h2>
        <p className="text-zinc-500 text-sm mb-6">
          Upgrade to Pro to download posters, view the full gift wall, and remove watermarks.
        </p>

        <div className="bg-zinc-50 rounded-2xl p-4 mb-6 text-left space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500">✅</span>
            <span className="text-zinc-700 font-medium">Unlimited friends</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500">✅</span>
            <span className="text-zinc-700 font-medium">HD poster download</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500">✅</span>
            <span className="text-zinc-700 font-medium">No watermarks</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500">✅</span>
            <span className="text-zinc-700 font-medium">Full gift wall view</span>
          </div>
        </div>

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full py-4 rounded-full font-bold text-lg transition-all"
          style={{
            background: "#FFE600",
            color: "#0f0a0a",
          }}
        >
          {loading ? "Redirecting..." : `Upgrade — $${(PRICE_AMOUNT / 100).toFixed(2)}`}
        </button>
        <p className="text-zinc-400 text-xs mt-3">One-time payment. No subscription.</p>
      </div>
    </div>
  );
}

export default function EventResults() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const id = params.id as string;

  const [data, setData] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"stats" | "wall" | "people">("stats");
  const [showPayment, setShowPayment] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
      return;
    }
    if (status !== "authenticated") return;

    fetch(`/api/events/${id}/results`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setData)
      .catch(() => router.push("/dashboard"))
      .finally(() => setLoading(false));
  }, [id, status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FF1A6C" }}>
        <div className="text-4xl animate-bounce">🎀</div>
      </div>
    );
  }

  if (!data) return null;

  const handlePosterClick = () => {
    if (!data.isPaid) {
      setShowPayment("Poster Download");
      return;
    }
    window.open(`/api/poster/${data.slug}`, "_blank");
  };

  const handleGiftWallClick = (tab: "stats" | "wall" | "people") => {
    if (tab === "wall" && !data.isPaid) {
      setShowPayment("Gift Wall");
      return;
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen" style={{ background: "#FF1A6C", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/dashboard" className="text-white/70 hover:text-white text-sm font-semibold transition-colors">
          ← Dashboard
        </Link>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/${id}/edit`}
            className="text-white/70 hover:text-white text-xs bg-white/10 px-3 py-1.5 rounded-full transition-colors"
          >
            Edit
          </Link>
          <Link
            href={`/dashboard/${id}/share`}
            className="text-white/70 hover:text-white text-xs bg-white/10 px-3 py-1.5 rounded-full transition-colors"
          >
            Share
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pb-12">
        {/* Event title */}
        <div className="mb-6">
          <h1 className="text-white font-extrabold text-2xl">{data.title}</h1>
          <p className="text-white/50 text-sm mt-1">
            {data.totalFriends} friends participated · /{data.slug}
          </p>
        </div>

        {/* Poster button — locked for free users */}
        {data.totalFriends > 0 && (
          <div className="mb-6">
            <button
              onClick={handlePosterClick}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-center font-bold text-sm transition-all hover:scale-[1.02]"
              style={{
                background: data.isPaid
                  ? "rgba(255,255,255,0.15)"
                  : "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))",
                color: data.isPaid ? "white" : "rgba(255,255,255,0.6)",
                border: data.isPaid
                  ? "1.5px solid rgba(255,255,255,0.3)"
                  : "1.5px dashed rgba(255,255,255,0.2)",
              }}
            >
              {data.isPaid ? "📸 Generate Instagram Poster" : "🔒 Generate Instagram Poster"}
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-white/10 rounded-2xl p-1 mb-6">
          {[
            { key: "stats" as const, label: "📊 Stats" },
            { key: "wall" as const, label: "🎁 Gift Wall" },
            { key: "people" as const, label: "👥 People" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleGiftWallClick(tab.key)}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{
                background: activeTab === tab.key ? "white" : "transparent",
                color: activeTab === tab.key ? "#0f0a0a" : "rgba(255,255,255,0.7)",
              }}
            >
              {tab.key === "wall" && !data.isPaid ? "🔒 Gift Wall" : tab.label}
            </button>
          ))}
        </div>

        {/* Stats Tab (always free) */}
        {activeTab === "stats" && (
          <div className="flex flex-col gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
              <h2 className="text-white font-bold text-lg mb-3">Overview</h2>
              <div className="text-white font-extrabold text-4xl mb-1">
                {data.totalFriends}
              </div>
              <p className="text-white/60 text-sm">
                friends participated in your gift calculator
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
              <h2 className="text-white font-bold text-lg mb-4">Gift Tier Breakdown</h2>
              <div className="flex flex-col gap-3">
                {data.tierBreakdown.map((tier) => (
                  <div key={tier.key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white font-semibold">
                        {tier.emoji} {tier.label}
                      </span>
                      <span className="text-white/70">
                        {tier.count} ({tier.percentage}%)
                      </span>
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.15)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${tier.percentage}%`,
                          background: "#FFE600",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
              <h2 className="text-white font-bold text-lg mb-3">Fun Stats</h2>
              <div className="text-white/80 text-sm space-y-2">
                {data.tierBreakdown.find((t) => t.key === "debt") && (
                  <p>
                    👑 <strong className="text-white">{data.tierBreakdown.find((t) => t.key === "debt")!.count}</strong>{" "}
                    friends decided to splurge on you
                  </p>
                )}
                {data.tierBreakdown.find((t) => t.key === "cute") && (
                  <p>
                    🩷 <strong className="text-white">{data.tierBreakdown.find((t) => t.key === "cute")!.count}</strong>{" "}
                    friends kept it cute and humble
                  </p>
                )}
                {data.tierBreakdown.find((t) => t.key === "posting") && (
                  <p>
                    🤐 <strong className="text-white">{data.tierBreakdown.find((t) => t.key === "posting")!.count}</strong>{" "}
                    friends are terrified of being posted
                  </p>
                )}
                <p className="text-white/50 text-xs mt-3">
                  {data.isPaid
                    ? `You received a total of ${data.socialCards.reduce((sum, c) => sum + c.gifts.length, 0)} gift selections!`
                    : "Upgrade to see the full gift wall and download your poster."}
                </p>
              </div>
            </div>

            {/* Upgrade teaser for free users */}
            {!data.isPaid && (
              <button
                onClick={() => setShowPayment("all features")}
                className="w-full py-4 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02]"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.8)",
                  border: "1.5px dashed rgba(255,255,255,0.25)",
                }}
              >
                ✨ Unlock all features for ${(PRICE_AMOUNT / 100).toFixed(2)}
              </button>
            )}
          </div>
        )}

        {/* Gift Wall Tab — locked for free users */}
        {activeTab === "wall" && data.isPaid && (
          <div className="flex flex-col gap-6">
            {data.giftWall.map((tier) => (
              <div key={tier.key}>
                <h2 className="text-white font-bold text-lg mb-3">
                  {tier.emoji} {tier.label}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tier.gifts.map((gift) => (
                    <div
                      key={gift.id}
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 transition-all hover:scale-[1.02]"
                    >
                      <p className="text-white font-bold text-sm mb-1">{gift.name}</p>
                      <p className="text-white/50 text-xs">
                        Selected {gift.selectedCount} time{gift.selectedCount !== 1 ? "s" : ""}
                      </p>
                      {gift.selectedBy.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {gift.selectedBy.slice(0, 3).map((friend) => (
                            <span
                              key={friend.friendId}
                              className="text-[10px] bg-white/10 text-white/70 px-1.5 py-0.5 rounded-full"
                            >
                              {friend.isAnonymous ? "Anonymous" : friend.name}
                            </span>
                          ))}
                          {gift.selectedBy.length > 3 && (
                            <span className="text-[10px] text-white/40">
                              +{gift.selectedBy.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === "wall" && !data.isPaid && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔒</div>
            <p className="text-white font-bold text-lg mb-2">Gift Wall is locked</p>
            <p className="text-white/50 text-sm mb-6">
              Upgrade to see who picked what, and the full gift popularity breakdown.
            </p>
            <button
              onClick={() => setShowPayment("Gift Wall")}
              className="bg-white text-[#0f0a0a] font-bold px-8 py-3 rounded-full transition-all hover:bg-[#FFE600]"
            >
              Unlock for ${(PRICE_AMOUNT / 100).toFixed(2)}
            </button>
          </div>
        )}

        {/* People Tab (always free) */}
        {activeTab === "people" && (
          <div className="flex flex-col gap-3">
            {data.socialCards.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/50">No friends have participated yet.</p>
              </div>
            ) : (
              data.socialCards.map((card) => (
                <div
                  key={card.id}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-bold text-base">
                        {card.isAnonymous ? "👤 Anonymous" : `👤 ${card.name}`}
                      </h3>
                      <p className="text-white/50 text-xs">
                        {card.tierEmoji} {card.tierLabel}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {generateTags(card.answers).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] bg-white/10 text-white/70 px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-2">
                    {card.gifts.map((gift, i) => (
                      <span
                        key={i}
                        className="text-sm bg-white/15 text-white px-3 py-1 rounded-full font-semibold"
                      >
                        🎁 {gift}
                      </span>
                    ))}
                  </div>

                  {card.message && (
                    <p className="text-white/60 text-xs italic mt-2 border-t border-white/10 pt-2">
                      &ldquo;{card.message}&rdquo;
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Payment modal */}
      {showPayment && (
        <PaymentModal
          eventId={id}
          feature={showPayment}
          onClose={() => setShowPayment(null)}
        />
      )}
    </div>
  );
}
