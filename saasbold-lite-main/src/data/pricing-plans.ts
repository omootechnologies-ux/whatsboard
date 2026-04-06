import {
  buildPlanRegisterHref,
  formatPlanPriceLabel,
} from "@/lib/billing/plans";

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
    priceLabel: formatPlanPriceLabel(0),
    cadence: "/forever",
    badge: "Try it first",
    description:
      "Track your first orders and see how structured selling feels without paying upfront.",
    ctaLabel: "Start Free",
    ctaHref: buildPlanRegisterHref("free"),
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
    priceLabel: formatPlanPriceLabel(15_000),
    cadence: "/month",
    badge: "Solo seller",
    description:
      "For one-person sellers who need daily control over payments, follow-ups, and delivery updates.",
    ctaLabel: "Get Started Today",
    ctaHref: buildPlanRegisterHref("starter"),
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
    priceLabel: formatPlanPriceLabel(35_000),
    cadence: "/month",
    badge: "Growing business",
    description:
      "Built for growing social commerce teams that need shared workflows and tighter operations.",
    ctaLabel: "Get Started Today",
    ctaHref: buildPlanRegisterHref("growth"),
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
    priceLabel: formatPlanPriceLabel(70_000),
    cadence: "/month",
    badge: "Team workflow",
    description:
      "For established East African sellers running multi-channel teams and higher daily volume.",
    ctaLabel: "Get Started Today",
    ctaHref: buildPlanRegisterHref("business"),
    features: [
      "Everything in Growth",
      "5 team members included",
      "Operational reviews",
      "Early access features",
    ],
  },
];

export function getPricingPlans(locale?: string): PricingPlan[] {
  if (locale !== "sw") {
    return pricingPlans;
  }

  return [
    {
      key: "free",
      name: "Bure",
      priceLabel: formatPlanPriceLabel(0),
      cadence: "/milele",
      badge: "Jaribu kwanza",
      description:
        "Fuatilia orders zako za mwanzo na uone biashara yenye mpangilio bila kulipa mwanzo.",
      ctaLabel: "Anza Bure",
      ctaHref: buildPlanRegisterHref("free"),
      features: [
        "Hadi order 30 kwa mwezi",
        "Board ya orders ya msingi",
        "Rekodi za wateja",
        "Dashibodi rafiki kwa simu",
      ],
    },
    {
      key: "starter",
      name: "Starter",
      priceLabel: formatPlanPriceLabel(15_000),
      cadence: "/mwezi",
      badge: "Muuzaji solo",
      description:
        "Kwa wauzaji wa mtu mmoja wanaohitaji udhibiti wa kila siku wa malipo, follow-ups na delivery.",
      ctaLabel: "Anza Leo",
      ctaHref: buildPlanRegisterHref("starter"),
      features: [
        "Order zisizo na kikomo",
        "Ufuatiliaji wa malipo",
        "Vikumbusho vya follow-up",
        "Workflow ya dispatch",
        "Ripoti za TZS",
      ],
    },
    {
      key: "growth",
      name: "Growth",
      priceLabel: formatPlanPriceLabel(35_000),
      cadence: "/mwezi",
      badge: "Biashara inayokua",
      description:
        "Imetengenezwa kwa timu zinazokua kwenye social commerce zinazohitaji kazi za pamoja na operesheni madhubuti.",
      ctaLabel: "Anza Leo",
      ctaHref: buildPlanRegisterHref("growth"),
      highlight: true,
      features: [
        "Vyote vya Starter",
        "Wanachama 2 wa timu wamejumuishwa",
        "Analytics za juu",
        "Support ya kipaumbele",
      ],
    },
    {
      key: "business",
      name: "Business",
      priceLabel: formatPlanPriceLabel(70_000),
      cadence: "/mwezi",
      badge: "Workflow ya timu",
      description:
        "Kwa wauzaji waliokomaa Afrika Mashariki wanaoendesha timu za channels nyingi na volume kubwa ya kila siku.",
      ctaLabel: "Anza Leo",
      ctaHref: buildPlanRegisterHref("business"),
      features: [
        "Vyote vya Growth",
        "Wanachama 5 wa timu wamejumuishwa",
        "Mapitio ya operesheni",
        "Vipengele vya mapema",
      ],
    },
  ];
}
