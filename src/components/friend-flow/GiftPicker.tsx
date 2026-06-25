"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface Gift {
  id: string;
  name: string;
}

interface GiftPickerProps {
  tier: {
    label: string;
    emoji: string;
    verdict: string;
    gifts: Gift[];
  };
  onConfirm: (giftIds: string[]) => void;
}

export default function GiftPicker({ tier, onConfirm }: GiftPickerProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleGift = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      // Max 3 selections
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  return (
    <motion.div
      key="gift-picker"
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -60, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <h2
        className="text-white mb-2"
        style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.15 }}
      >
        Pick your gift
      </h2>
      <p className="mb-6" style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
        Select 1-3 gifts from the {tier.label} tier {tier.emoji}
      </p>

      <div className="flex flex-col gap-3 mb-6">
        {tier.gifts.map((gift) => {
          const isSelected = selectedIds.includes(gift.id);
          return (
            <motion.button
              key={gift.id}
              onClick={() => toggleGift(gift.id)}
              className="w-full py-4 px-6 rounded-2xl text-left transition-all duration-150"
              style={{
                background: isSelected
                  ? "#FFE600"
                  : "rgba(255,255,255,0.15)",
                border: isSelected
                  ? "2px solid #FFE600"
                  : "2px solid rgba(255,255,255,0.25)",
                color: isSelected ? "#0f0a0a" : "white",
                fontWeight: 700,
                fontSize: 16,
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <span>{gift.name}</span>
                {isSelected && <span style={{ fontSize: 18 }}>✓</span>}
              </div>
            </motion.button>
          );
        })}
      </div>

      <p className="text-center mb-4" style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
        {selectedIds.length}/3 selected
      </p>

      <motion.button
        onClick={() => onConfirm(selectedIds)}
        className="w-full py-4 rounded-full text-center transition-all duration-150 font-bold"
        style={{
          background:
            selectedIds.length > 0 ? "white" : "rgba(255,255,255,0.25)",
          color:
            selectedIds.length > 0 ? "#0f0a0a" : "rgba(255,255,255,0.5)",
          cursor: selectedIds.length > 0 ? "pointer" : "not-allowed",
        }}
        whileHover={selectedIds.length > 0 ? { scale: 1.03 } : {}}
        whileTap={selectedIds.length > 0 ? { scale: 0.97 } : {}}
      >
        Next →
      </motion.button>
    </motion.div>
  );
}
