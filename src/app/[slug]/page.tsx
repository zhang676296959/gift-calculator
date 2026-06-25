"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import StartScreen from "@/components/friend-flow/StartScreen";
import QuizStep from "@/components/friend-flow/QuizStep";
import GiftPicker from "@/components/friend-flow/GiftPicker";
import FriendInfoForm from "@/components/friend-flow/FriendInfoForm";

type Step = "loading" | "start" | "closeness" | "annoyance" | "budget" | "gift-pick" | "info" | "submitting" | "done";

interface EventData {
  title: string;
  themeColor: string;
  questions: {
    id: string;
    type: string;
    title: string;
    options: { label: string; value: string }[];
  }[];
  tiers: {
    key: string;
    label: string;
    emoji: string;
    verdict: string;
    gifts: { id: string; name: string }[];
  }[];
}

export default function FriendFlow() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [step, setStep] = useState<Step>("loading");
  const [event, setEvent] = useState<EventData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Quiz answers
  const [answers, setAnswers] = useState<Record<string, string>>({});
  // Selected tier determined by budget answer
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  // Selected gift IDs
  const [selectedGiftIds, setSelectedGiftIds] = useState<string[]>([]);

  // Fetch event data
  useEffect(() => {
    fetch(`/api/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setEvent(data);
        setStep("start");
      })
      .catch(() => {
        setError("This gift calculator doesn't exist yet!");
      });
  }, [slug]);

  // Questions from event (default 3: closeness, annoyance, budget)
  const questions = event?.questions || [];
  const closenessQ = questions.find((q) => q.type === "closeness");
  const annoyanceQ = questions.find((q) => q.type === "annoyance");
  const budgetQ = questions.find((q) => q.type === "budget");
  const totalQuizSteps = questions.length;

  const handleStart = () => setStep("closeness");

  const handleCloseness = (value: string) => {
    setAnswers((prev) => ({ ...prev, closeness: value }));
    setStep("annoyance");
  };

  const handleAnnoyance = (value: string) => {
    setAnswers((prev) => ({ ...prev, annoyance: value }));
    setStep("budget");
  };

  const handleBudget = (value: string) => {
    setAnswers((prev) => ({ ...prev, budget: value }));
    setSelectedTier(value);
    setStep("gift-pick");
  };

  const handleGiftsConfirm = (giftIds: string[]) => {
    setSelectedGiftIds(giftIds);
    setStep("info");
  };

  const handleInfoSubmit = useCallback(
    async (data: { name: string; isAnonymous: boolean; message: string }) => {
      setStep("submitting");
      try {
        const res = await fetch(`/api/${slug}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            isAnonymous: data.isAnonymous,
            message: data.message,
            answers,
            selectedTierKey: selectedTier,
            giftIds: selectedGiftIds,
          }),
        });

        if (!res.ok) throw new Error("Failed to submit");

        setStep("done");
      } catch {
        setError("Something went wrong. Try again!");
      }
    },
    [slug, answers, selectedTier, selectedGiftIds]
  );

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: "#FF1A6C" }}
      >
        <div className="text-center">
          <span className="text-5xl block mb-4">😅</span>
          <h1 className="text-white font-bold text-xl mb-2">{error}</h1>
          <button
            onClick={() => router.push("/")}
            className="bg-white text-[#0f0a0a] font-bold px-8 py-3 rounded-full mt-4"
          >
            Make your own →
          </button>
        </div>
      </div>
    );
  }

  if (step === "loading") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#FF1A6C" }}
      >
        <div className="text-4xl animate-bounce">🎀</div>
      </div>
    );
  }

  const tier = event?.tiers.find((t) => t.key === selectedTier);

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-6"
      style={{
        background: "#FF1A6C",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          {step === "start" && event && (
            <StartScreen title={event.title} onStart={handleStart} />
          )}

          {step === "closeness" && closenessQ && (
            <QuizStep
              question={closenessQ}
              stepNumber={0}
              totalSteps={totalQuizSteps}
              onSelect={handleCloseness}
            />
          )}

          {step === "annoyance" && annoyanceQ && (
            <QuizStep
              question={annoyanceQ}
              stepNumber={1}
              totalSteps={totalQuizSteps}
              onSelect={handleAnnoyance}
            />
          )}

          {step === "budget" && budgetQ && (
            <QuizStep
              question={budgetQ}
              stepNumber={2}
              totalSteps={totalQuizSteps}
              onSelect={handleBudget}
            />
          )}

          {step === "gift-pick" && tier && (
            <GiftPicker tier={tier} onConfirm={handleGiftsConfirm} />
          )}

          {step === "info" && (
            <FriendInfoForm onSubmit={handleInfoSubmit} />
          )}

          {step === "done" && (
            <div className="text-center">
              <div className="text-5xl mb-4">🎀</div>
              <h2
                className="text-white mb-2"
                style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.15 }}
              >
                Your gift has been assigned.
              </h2>
              <p className="mb-6" style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
                No take-backs.
              </p>
              <div
                className="rounded-2xl py-5 px-6 text-center mb-6"
                style={{ background: "#FFE600" }}
              >
                <p style={{ color: "#0f0a0a", fontWeight: 700, fontSize: 15 }}>
                  📸 Screenshot sent. The proof is in your hands now.
                </p>
              </div>
              {/* Viral CTA — invite friend to make their own */}
              <div
                className="rounded-2xl p-5 text-left"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1.5px solid rgba(255,255,255,0.25)",
                }}
              >
                <p className="text-white font-bold text-sm mb-1">
                  🎂 Also have a birthday coming up?
                </p>
                <p className="text-white/60 text-xs mb-4">
                  Create your own gift calculator and let your friends pick the perfect gift for you.
                </p>
                <a
                  href="/sign-up"
                  className="block w-full py-3 rounded-full text-center font-bold text-sm transition-all hover:scale-[1.02]"
                  style={{
                    background: "white",
                    color: "#0f0a0a",
                  }}
                >
                  Make Your Own →
                </a>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
