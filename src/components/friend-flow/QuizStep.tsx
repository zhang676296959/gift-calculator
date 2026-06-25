"use client";

import { motion } from "framer-motion";

interface QuizStepProps {
  question: {
    title: string;
    options: { label: string; value: string }[];
  };
  stepNumber: number;
  totalSteps: number;
  onSelect: (value: string) => void;
}

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex justify-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i === current ? 24 : 8,
            height: 8,
            background:
              i <= current ? "#FFE600" : "rgba(255,255,255,0.3)",
          }}
        />
      ))}
    </div>
  );
}

export default function QuizStep({
  question,
  stepNumber,
  totalSteps,
  onSelect,
}: QuizStepProps) {
  return (
    <motion.div
      key={`step-${stepNumber}`}
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -60, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <ProgressDots current={stepNumber} total={totalSteps} />

      <h2
        className="text-white mb-7"
        style={{
          fontSize: 28,
          fontWeight: 800,
          lineHeight: 1.15,
        }}
      >
        {question.title}
      </h2>

      <div className="flex flex-col gap-3">
        {question.options.map((option) => (
          <motion.button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className="w-full py-4 rounded-full text-center transition-colors duration-150"
            style={{
              background: "white",
              color: "#0f0a0a",
              fontWeight: 700,
              fontSize: 16,
            }}
            whileHover={{ scale: 1.02, backgroundColor: "#FFE600" }}
            whileTap={{ scale: 0.98 }}
          >
            {option.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
