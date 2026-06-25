"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

const REMINDER_TEXTS = [
  {
    label: "😊 Friendly",
    text: "Hey! I made this fun gift calculator for my birthday — you should try it! 👉",
  },
  {
    label: "😈 Threatening",
    text: "⏰ My gift calculator is waiting for you. Don't make me remind you again. 👉",
  },
  {
    label: "🤡 Funny",
    text: "My gift calculator says you haven't picked a gift for me yet. It's very disappointed. 😤 👉",
  },
  {
    label: "🥺 Guilt Trip",
    text: "Everyone else has already done the gift calculator... just saying. 👉",
  },
];

export default function ShareEvent() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const id = params.id as string;

  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [reminderCopied, setReminderCopied] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
      return;
    }
    if (status !== "authenticated") return;

    fetch(`/api/events/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setSlug(data.slug);
        setLoading(false);
      })
      .catch(() => router.push("/dashboard"));
  }, [id, status, router]);

  const shareUrl = `${window.location.origin}/${slug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyReminder = (text: string) => {
    navigator.clipboard.writeText(`${text} ${shareUrl}`);
    setReminderCopied(true);
    setTimeout(() => setReminderCopied(false), 2000);
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
        <h1 className="text-white font-extrabold text-2xl mb-2">Share</h1>
        <p className="text-white/60 text-sm mb-8">
          Spread the word and collect gifts!
        </p>

        {/* Share link */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 mb-6">
          <h2 className="text-white font-bold text-sm mb-3">🔗 Your Link</h2>
          <div
            className="py-3 px-4 rounded-xl text-sm font-mono mb-3 truncate"
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.9)",
              border: "2px solid rgba(255,255,255,0.2)",
            }}
          >
            {shareUrl}
          </div>
          <button
            onClick={copyLink}
            className="w-full py-3 rounded-full text-center font-bold text-sm transition-all"
            style={{
              background: copied ? "#FFE600" : "white",
              color: "#0f0a0a",
            }}
          >
            {copied ? "✓ Copied!" : "Copy Link"}
          </button>
        </div>

        {/* Reminder texts */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
          <h2 className="text-white font-bold text-sm mb-1">📨 Reminder Texts</h2>
          <p className="text-white/50 text-xs mb-4">
            Copy and send to friends who haven&apos;t participated yet
          </p>

          <div className="flex flex-col gap-3">
            {REMINDER_TEXTS.map((item) => (
              <button
                key={item.label}
                onClick={() => copyReminder(item.text)}
                className="w-full text-left py-3 px-4 rounded-xl text-sm transition-all hover:scale-[1.02]"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.9)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <span className="font-bold block mb-1">{item.label}</span>
                <span className="text-white/60 text-xs">{item.text}</span>
              </button>
            ))}
          </div>

          {reminderCopied && (
            <p className="text-center text-yellow-300 text-xs mt-3 font-semibold">
              ✓ Copied! Now go send it to someone who hasn&apos;t participated 💪
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
