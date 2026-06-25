export const DEFAULT_TIERS = [
  {
    key: "cute",
    label: "Cute but humble",
    emoji: "🩷",
    verdict: "Accepted, but don't get comfortable.",
    order: 1,
    gifts: [
      "Rhode lip gloss",
      "Starbucks gift card",
      "Cute phone case",
      "Claw clips",
      "Mini perfume",
    ],
  },
  {
    key: "sephora",
    label: "I can do Sephora",
    emoji: "✨",
    verdict: "This is a respectable apology.",
    order: 2,
    gifts: [
      "Summer Fridays lip balm",
      "Sol de Janeiro spray",
      "Dior lip oil",
      "Rare Beauty blush",
      "Sephora gift card",
    ],
  },
  {
    key: "invested",
    label: "I'm emotionally invested",
    emoji: "🎯",
    verdict: "You understand the assignment.",
    order: 3,
    gifts: [
      "Labubu",
      "Lululemon shorts",
      "New Balance 530s",
      "Charm necklace",
      "Digital camera",
    ],
  },
  {
    key: "debt",
    label: "Put me in debt",
    emoji: "👑",
    verdict: "You're healing the family.",
    order: 4,
    gifts: [
      "Dyson Airwrap",
      "Birthday dinner at Nobu",
      "Billie Eilish tickets",
      "House of CB dress",
      "Vegas weekend",
    ],
  },
  {
    key: "posting",
    label: "Whatever keeps you from posting about me",
    emoji: "🤐",
    verdict: "Smart. Very smart.",
    order: 5,
    gifts: [
      "All of the above",
      "A heartfelt apology letter",
      "Never mentioning it again",
      "Therapy (for both of us)",
      "A Venmo labeled 'friendship tax'",
    ],
  },
] as const;

export const DEFAULT_QUESTIONS = [
  {
    type: "closeness",
    title: "How close are we?",
    order: 1,
    options: [
      { label: "Immediate family", value: "immediate_family" },
      { label: "Best friend", value: "best_friend" },
      { label: "Friend", value: "friend" },
      { label: "Guy who likes my stories", value: "story_guy" },
      { label: "Person who forgot last year", value: "forgot_last_year" },
    ],
  },
  {
    type: "annoyance",
    title: "Have you annoyed me this year?",
    order: 2,
    options: [
      { label: "No, I'm innocent", value: "innocent" },
      { label: "A little", value: "a_little" },
      { label: "Yes, but I'm funny", value: "yes_funny" },
      { label: "Yes, and I owe you", value: "yes_owe" },
      { label: "I plead the fifth", value: "plead_fifth" },
    ],
  },
  {
    type: "budget",
    title: "What's your budget?",
    order: 3,
    options: DEFAULT_TIERS.map((t) => ({
      label: t.label,
      value: t.key,
    })),
  },
] as const;

export const FREE_TIER_LIMIT = 10;
export const PRICE_AMOUNT = 499; // $4.99 in cents
