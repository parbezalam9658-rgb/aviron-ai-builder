"use client";

import Script from "next/script";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/app/providers/auth-provider";
import { setUserPlan } from "@/lib/firestore";

type Plan = {
  name: "Free" | "Pro" | "Pro+";
  priceLabel: string;
  amountInPaise: number;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
};

type RazorpayHandlerResponse = {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
};

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

const plans: Plan[] = [
  {
    name: "Free",
    priceLabel: "$0/mo",
    amountInPaise: 0,
    description: "For creators validating ideas in preview mode.",
    cta: "Current Plan",
    features: [
      "Preview ads and videos",
      "No website publishing",
      "No subdomain/custom domain",
      "AI image generation + download",
    ],
  },
  {
    name: "Pro",
    priceLabel: "$39/mo",
    amountInPaise: 2900 * 100,
    description: "For founders shipping production websites.",
    cta: "Upgrade to Pro",
    highlighted: true,
    features: ["Free subdomain publishing", "Custom domains", "Website deployments", "Premium templates"],
  },
  {
    name: "Pro+",
    priceLabel: "$99/mo",
    amountInPaise: 9900 * 100,
    description: "For scale teams needing enterprise-grade AI velocity.",
    cta: "Upgrade to Pro+",
    features: [
      "Unlimited deployments",
      "Premium AI tools",
      "Advanced hosting",
      "Faster AI generations + priority support",
    ],
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [processingPlan, setProcessingPlan] = useState<Plan["name"] | null>(null);

  const closePopup = () => setSuccessMessage("");

  const handleUpgrade = (plan: Plan) => {
    setErrorMessage("");
    if (plan.name === "Free") {
      setSuccessMessage("You are already on the Free plan.");
      return;
    }

    const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!key) {
      setErrorMessage("Missing Razorpay key. Add NEXT_PUBLIC_RAZORPAY_KEY_ID in .env.local");
      return;
    }

    if (typeof window === "undefined" || !window.Razorpay) {
      setErrorMessage("Razorpay SDK not loaded. Please refresh and try again.");
      return;
    }

    setProcessingPlan(plan.name);

    const options: Record<string, unknown> = {
      key,
      amount: plan.amountInPaise,
      currency: "INR",
      name: "Aviron AI Builder",
      description: `${plan.name} subscription`,
      theme: { color: "#8b5cf6" },
      handler: (response: RazorpayHandlerResponse) => {
        if (user) {
          localStorage.setItem(`aviron_plan_${user.uid}`, plan.name);
          void setUserPlan(user.uid, plan.name);
        }
        setSuccessMessage(`Payment successful! ID: ${response.razorpay_payment_id}`);
        setProcessingPlan(null);
      },
      modal: {
        ondismiss: () => {
          setProcessingPlan(null);
        },
      },
      prefill: {
        name: "Aviron User",
        email: "user@example.com",
      },
    };

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch {
      setErrorMessage("Unable to open Razorpay checkout. Please try again.");
      setProcessingPlan(null);
    }
  };

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white sm:px-6 md:py-16">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.22),transparent_45%)]" />

      <section className="relative mx-auto w-full max-w-7xl">
        <div className="mb-8 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
          <p className="text-sm text-zinc-300">Aviron AI Builder Pricing</p>
          <div className="flex gap-2">
            <Link
              href="/"
              className="rounded-lg border border-purple-300/35 bg-purple-500/15 px-3 py-2 text-xs font-medium text-purple-100 transition hover:bg-purple-500/25"
            >
              Back to Builder
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-100 transition hover:bg-white/10"
            >
              Dashboard
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full border border-purple-300/40 bg-purple-500/10 px-4 py-1 text-xs uppercase tracking-[0.18em] text-purple-200">
            Subscription Plans
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">Choose your growth plan</h1>
          <p className="mt-4 text-zinc-300">
            Subscription logic built for Free, Pro, and Pro+ teams scaling AI products with enterprise reliability.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-2xl border p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-1 ${
                plan.highlighted
                  ? "border-purple-300/50 bg-purple-500/10 shadow-[0_0_50px_rgba(139,92,246,0.3)]"
                  : "border-white/10 bg-white/5 hover:border-purple-300/35"
              }`}
            >
              <h2 className="text-xl font-semibold">{plan.name}</h2>
              <p className="mt-2 text-3xl font-bold text-white">{plan.priceLabel}</p>
              <p className="mt-2 text-sm text-zinc-300">{plan.description}</p>

              <ul className="mt-5 space-y-2 text-sm text-zinc-200">
                {plan.features.map((feature) => (
                  <li key={feature} className="rounded-md border border-white/10 bg-black/30 px-3 py-2">
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => handleUpgrade(plan)}
                disabled={processingPlan === plan.name}
                className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  plan.highlighted
                    ? "bg-gradient-to-r from-white to-purple-200 text-black hover:opacity-90"
                    : "border border-purple-300/35 bg-purple-500/10 text-purple-100 hover:bg-purple-500/20"
                } disabled:cursor-not-allowed disabled:opacity-70`}
              >
                {processingPlan === plan.name ? "Opening Checkout..." : plan.cta}
              </button>
            </article>
          ))}
        </div>

        {errorMessage ? (
          <p className="mt-5 rounded-lg border border-red-300/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{errorMessage}</p>
        ) : null}
      </section>

      {successMessage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-emerald-300/40 bg-zinc-950 p-6 text-center shadow-[0_0_80px_rgba(16,185,129,0.35)] animate-[fadeIn_.2s_ease]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
              <span className="relative flex h-6 w-6">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex h-6 w-6 rounded-full bg-emerald-300" />
              </span>
            </div>
            <h3 className="text-xl font-semibold text-white">Payment successful</h3>
            <p className="mt-2 text-sm text-zinc-300">{successMessage}</p>
            <button
              type="button"
              onClick={closePopup}
              className="mt-5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              Continue
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
