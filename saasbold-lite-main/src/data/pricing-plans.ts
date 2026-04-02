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
    badge: "Try it first",
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
    badge: "Solo seller",
    description:
      "For one-person sellers who need daily control over payments, follow-ups, and delivery updates.",
    ctaLabel: "Get Started Today",
    ctaHref: "/register",
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
    badge: "Growing business",
    description:
      "Built for growing social commerce teams that need shared workflows and tighter operations.",
    ctaLabel: "Get Started Today",
    ctaHref: "/register",
    highlight: true,
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
    badge: "Team workflow",
    description:
      "For established East African sellers running multi-channel teams and higher daily volume.",
    ctaLabel: "Get Started Today",
    ctaHref: "/register",
    features: [
      "Everything in Growth",
      "5 team members included",
      "Operational reviews",
      "Early access features",
    ],
  },
];
