"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const emojiList = ["🎂", "🎁", "💝", "✨", "🎀", "🩷", "👑", "🤐"];

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#FF1A6C", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4">
        <span className="text-white font-extrabold text-lg tracking-tight">
          Gift Calculator
        </span>
        <div className="flex gap-3">
          <Link
            href="/sign-in"
            className="text-white/80 hover:text-white text-sm font-semibold transition-colors px-4 py-2"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="bg-white text-[#FF1A6C] rounded-full px-5 py-2 text-sm font-bold transition-all hover:scale-105"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-lg"
        >
          {/* Emoji row */}
          <div className="flex justify-center gap-2 mb-6 text-2xl">
            {emojiList.map((emoji, i) => (
              <motion.span
                key={emoji}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * i, type: "spring" }}
              >
                {emoji}
              </motion.span>
            ))}
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 mb-6">
            <span className="text-yellow-300 text-sm">🔥</span>
            <span className="text-white/90 text-xs font-semibold tracking-wide">
              4.3M Views on TikTok
            </span>
          </div>

          <h1 className="text-white font-black text-3xl sm:text-[40px] leading-[1.1] tracking-[-0.02em] uppercase mb-4">
            The Gift Calculator
          </h1>
          <p className="text-white/80 text-lg mb-2 font-medium">
            Find out what you owe me. 💸
          </p>
          <p className="text-white/60 text-sm mb-8 max-w-md mx-auto">
            Create your birthday gift calculator, share the link with friends,
            and let them pick the perfect gift for you. No more &quot;anything is fine&quot;.
          </p>

          <Link
            href="/sign-up"
            className="inline-block bg-white text-[#0f0a0a] font-bold text-lg px-10 py-4 rounded-full transition-all hover:bg-[#FFE600] hover:scale-105 active:scale-95"
          >
            Create Your Calculator →
          </Link>

          <p className="text-white/40 text-xs mt-4">
            Results are legally binding. No take-backs.
          </p>
        </motion.div>

        {/* Preview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full"
        >
          {[
            { emoji: "🎮", title: "3 Simple Questions", desc: "Closeness, annoyance, budget – that's it." },
            { emoji: "🎁", title: "Friends Pick Gifts", desc: "They choose 1-3 gifts from their tier." },
            { emoji: "📸", title: "Share the Results", desc: "Generate a poster for your Instagram Story." },
          ].map((feature, i) => (
            <div
              key={feature.title}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 text-left border border-white/20"
            >
              <div className="text-2xl mb-2">{feature.emoji}</div>
              <h3 className="text-white font-bold text-sm mb-1">{feature.title}</h3>
              <p className="text-white/60 text-xs">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6">
        <p className="text-white/30 text-xs">
          © 2026 Gift Calculator. Made with 🩷 for birthday people.
        </p>
      </footer>
    </div>
  );
}
