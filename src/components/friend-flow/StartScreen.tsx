"use client";

import { motion } from "framer-motion";

interface StartScreenProps {
  title: string;
  onStart: () => void;
}

export default function StartScreen({ title, onStart }: StartScreenProps) {
  return (
    <motion.div
      key="start"
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -60, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="text-center"
    >
      {/* Decorative emoji */}
      <div className="relative flex items-center justify-center mb-6" style={{ height: 120 }}>
        <span className="text-6xl">🎂</span>
      </div>

      {/* Badge */}
      <div className="flex justify-center mb-4">
        <span
          className="inline-block rounded-full px-4 py-1.5"
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "1.5px solid rgba(255,255,255,0.3)",
            color: "white",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.01em",
          }}
        >
          Find out what you owe me. 💸
        </span>
      </div>

      {/* Title */}
      <h1
        className="text-white font-black mb-8"
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 900,
          fontSize: 28,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
        }}
      >
        {title}
      </h1>

      {/* CTA */}
      <motion.button
        onClick={onStart}
        className="w-full py-4 rounded-full text-center transition-all duration-150 font-bold text-lg"
        style={{
          background: "white",
          color: "#0f0a0a",
          fontWeight: 800,
          fontSize: 17,
          letterSpacing: "-0.01em",
        }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
      >
        Let&apos;s go →
      </motion.button>

      <p className="mt-4" style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
        Results are legally binding.
      </p>
    </motion.div>
  );
}
