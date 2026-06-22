export const ORDER_PLANS = [
  {
    title: "Standard Master",
    price: "$1",
    features: [
      "WAV + MP3",
      "Revisions included",
      "Manual mastering",
      "3 business days",
    ],
    popular: false as boolean,
  },
  {
    title: "Express Master",
    price: "$80",
    features: [
      "WAV + MP3",
      "Revisions included",
      "Manual mastering",
      "24 hour delivery",
    ],
    popular: false as boolean,
  },
] as const;

export type OrderPlan = (typeof ORDER_PLANS)[number];
