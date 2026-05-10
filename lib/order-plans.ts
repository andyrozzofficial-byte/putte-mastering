export const ORDER_PLANS = [
  {
    title: "Standard Master",
    price: "1 500 kr",
    features: [
      "Professionell mastering",
      "1 revision",
      "Leverans inom 2–3 dagar",
    ],
    popular: false as boolean,
  },
  {
    title: "Premium Master",
    price: "2 000 kr",
    features: [
      "Professionell mastering",
      "2 revisioner",
      "Expressleverans (1–2 dagar)",
    ],
    popular: true as boolean,
  },
  {
    title: "Stem Master",
    price: "3 000 kr",
    features: ["För stems / mixar", "Mer kontroll & balans", "2 revisioner"],
    popular: false as boolean,
  },
] as const;

export type OrderPlan = (typeof ORDER_PLANS)[number];
