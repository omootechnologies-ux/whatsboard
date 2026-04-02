export type PricingPlan = {
  key: "free" | "starter" | "growth" | "business";
  name: string;
  priceLabel: string;
  cadence: string;
  badge: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  highlight?: boolean;
  features: string[];
};

export const pricingPlans: PricingPlan[] = [
  {
    key: "free",
    name: "Free",
    priceLabel: "TZS 0",
    cadence: "/forever",
    badge: "Start here",
    description:
      "Track your first orders and see how structured selling feels without paying upfront.",
    ctaLabel: "Start Free",
    ctaHref: "/register",
    features: [
      "Up to 30 orders per month",
      "Basic orders board",
      "Customer records",
      "Mobile-first dashboard",
    ],
  },
  {
    key: "starter",
    name: "Starter",
    priceLabel: "TZS 15,000",
    cadence: "/month",
    badge: "Most active sellers",
    description:
      "For sellers who need daily control over payments, follow-ups, and delivery updates.",
    ctaLabel: "Choose Starter",
    ctaHref: "/register",
    highlight: true,
    features: [
      "Unlimited orders",
      "Payment tracking",
      "Follow-up reminders",
      "Dispatch workflow",
      "TZS-focused reporting",
    ],
  },
  {
    key: "growth",
    name: "Growth",
    priceLabel: "TZS 35,000",
    cadence: "/month",
    badge: "Scaling teams",
    description:
      "Built for fast-growing social commerce teams with shared workflows and tighter operations.",
    ctaLabel: "Choose Growth",
    ctaHref: "/register",
    features: [
      "Everything in Starter",
      "2 team members included",
      "Advanced analytics",
      "Priority support",
    ],
  },
  {
    key: "business",
    name: "Business",
    priceLabel: "TZS 70,000",
    cadence: "/month",
    badge: "For serious operations",
    description:
      "For established East African sellers running multi-channel teams and higher daily volume.",
    ctaLabel: "Choose Business",
    ctaHref: "/register",
    features: [
      "Everything in Growth",
      "5 team members included",
      "Operational reviews",
      "Early access features",
    ],
  },
];
