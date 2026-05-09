"use client";

import Link from "next/link";
import { useState } from "react";

import { useAuth } from "@/app/providers/auth-provider";

export default function DeployPage() {
  const { plan, role, isPro, isProPlus, isAdmin } = useAuth();
  const [history] = useState([
    { id: "d1", name: "Summer storefront", state: "Live", time: "2 min ago", url: "https://summer-drop.aviron.site" },
    { id: "d2", name: "Founders launch", state: "Live", time: "14 min ago", url: "https://founders-launch.aviron.site" },
    { id: "d3", name: "Campaign microsite", state: "Queued", time: "1 hr ago", url: "https://campaign.aviron.site" },
  ]);
  const canPublish = isPro || isProPlus || isAdmin || role === "Super Admin";

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-6xl space-y-4 rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Hosting Dashboard</h1>
            <p className="mt-2 text-sm text-zinc-300">
              Framer + Shopify + Vercel style deployment control center for one-click shipping.
            </p>
          </div>
          <span className="rounded-full border border-purple-300/35 bg-purple-500/15 px-3 py-1 text-xs text-purple-100">
            {plan} • {role}
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <article className="rounded-xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">Publishing Access</p>
            <p className="mt-2 text-sm text-zinc-100">{canPublish ? "Enabled" : "Locked"}</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">Subdomain</p>
            <p className="mt-2 text-sm text-zinc-100">{canPublish ? "Auto-provisioned" : "Upgrade required"}</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">Custom Domains</p>
            <p className="mt-2 text-sm text-zinc-100">{canPublish ? "Connected via DNS wizard" : "Upgrade required"}</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">Hosting Tier</p>
            <p className="mt-2 text-sm text-zinc-100">{plan === "Pro+" ? "Advanced edge hosting" : "Standard edge hosting"}</p>
          </article>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="rounded-xl border border-white/10 bg-black/40 p-4">
            <h2 className="text-lg font-semibold">Website Management Panel</h2>
            <div className="mt-3 space-y-2">
              {history.map((site) => (
                <article key={site.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{site.name}</p>
                    <span className={`rounded-full px-2 py-1 text-[10px] ${site.state === "Live" ? "bg-emerald-500/20 text-emerald-200" : "bg-amber-500/20 text-amber-200"}`}>
                      {site.state}
                    </span>
                  </div>
                  <a href={site.url} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-blue-200 underline">
                    {site.url}
                  </a>
                  <p className="mt-1 text-xs text-zinc-400">{site.time}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-black/40 p-4">
            <h2 className="text-lg font-semibold">Publish History</h2>
            <div className="mt-3 space-y-2">
              {history.map((site) => (
                <article key={`${site.id}-history`} className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-zinc-200">{site.name} deployment {site.state.toLowerCase()}</p>
                  <p className="mt-1 text-[11px] text-zinc-500">{site.time}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/" className="inline-flex rounded-lg border border-purple-300/35 bg-purple-500/15 px-4 py-2 text-sm text-purple-100">
            Back to AI OS
          </Link>
          <Link href="/domains" className="inline-flex rounded-lg border border-blue-300/35 bg-blue-500/10 px-4 py-2 text-sm text-blue-100">
            Open Domain Manager
          </Link>
        </div>
      </div>
    </main>
  );
}
