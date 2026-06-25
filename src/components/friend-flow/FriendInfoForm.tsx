"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface FriendInfoFormProps {
  onSubmit: (data: { name: string; isAnonymous: boolean; message: string }) => void;
}

export default function FriendInfoForm({ onSubmit }: FriendInfoFormProps) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const canSubmit = name.trim().length > 0 || isAnonymous;

  return (
    <motion.div
      key="info-form"
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -60, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <h2
        className="text-white mb-2"
        style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.15 }}
      >
        Almost done!
      </h2>
      <p className="mb-7" style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
        Let them know who you are (or don&apos;t)
      </p>

      <div className="flex flex-col gap-4">
        {/* Name input */}
        <div>
          <label
            className="block mb-2 text-sm font-semibold"
            style={{ color: "rgba(255,255,255,0.8)" }}
          >
            Your name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            disabled={isAnonymous}
            className="w-full py-3.5 px-5 rounded-2xl text-base font-semibold outline-none transition-all"
            style={{
              background: isAnonymous
                ? "rgba(255,255,255,0.1)"
                : "rgba(255,255,255,0.15)",
              color: "white",
              border: "2px solid rgba(255,255,255,0.25)",
              opacity: isAnonymous ? 0.5 : 1,
            }}
          />
        </div>

        {/* Anonymous toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            className="flex-shrink-0 rounded-md transition-all duration-200 flex items-center justify-center"
            style={{
              width: 22,
              height: 22,
              background: isAnonymous ? "#FFE600" : "rgba(255,255,255,0.2)",
              border: isAnonymous ? "none" : "2px solid rgba(255,255,255,0.5)",
            }}
            onClick={() => {
              setIsAnonymous(!isAnonymous);
              if (!isAnonymous) setName("");
            }}
          >
            {isAnonymous && (
              <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                <path
                  d="M1.5 5L5 8.5L11.5 1.5"
                  stroke="#0f0a0a"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <span style={{ color: "white", fontWeight: 600, fontSize: 14 }}>
            Remain anonymous
          </span>
        </label>

        {/* Message */}
        <div>
          <label
            className="block mb-2 text-sm font-semibold"
            style={{ color: "rgba(255,255,255,0.8)" }}
          >
            Message (optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write something nice..."
            rows={3}
            className="w-full py-3.5 px-5 rounded-2xl text-base font-semibold outline-none resize-none transition-all"
            style={{
              background: "rgba(255,255,255,0.15)",
              color: "white",
              border: "2px solid rgba(255,255,255,0.25)",
            }}
          />
        </div>
      </div>

      <motion.button
        onClick={() => onSubmit({ name, isAnonymous, message })}
        className="w-full py-4 rounded-full text-center transition-all duration-150 font-bold mt-6"
        style={{
          background: canSubmit ? "white" : "rgba(255,255,255,0.25)",
          color: canSubmit ? "#0f0a0a" : "rgba(255,255,255,0.5)",
          cursor: canSubmit ? "pointer" : "not-allowed",
        }}
        whileHover={canSubmit ? { scale: 1.03 } : {}}
        whileTap={canSubmit ? { scale: 0.97 } : {}}
      >
        Assign My Gift →
      </motion.button>
    </motion.div>
  );
}
