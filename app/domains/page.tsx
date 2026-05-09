"use client";

import Link from "next/link";

import { useAuth } from "@/app/providers/auth-provider";

export default function DomainsPage() {
  const { plan } = useAuth();

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-4xl rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl">
        <h1 className="text-3xl font-bold">Domain Manager</h1>
        <p className="mt-2 text-sm text-zinc-300">Connect branded domains and control SSL + DNS from one dashboard.</p>
        <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-zinc-200">
          Active subscription: <span className="font-semibold text-purple-100">{plan}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-zinc-200">Custom domains on Pro and Pro+</span>
          <span className="rounded-full border border-blue-300/35 bg-blue-500/10 px-3 py-1 text-xs text-blue-100">Subdomain included with Pro</span>
        </div>
        <Link href="/" className="mt-5 inline-flex rounded-lg border border-purple-300/35 bg-purple-500/15 px-4 py-2 text-sm text-purple-100">
          Back to AI OS
        </Link>
      </div>
    </main>
  );
}
