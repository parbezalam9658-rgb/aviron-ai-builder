"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { useAuth } from "@/app/providers/auth-provider";

export default function LoginPage() {
  const router = useRouter();
  const { user, authLoading, loginWithEmail, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [authLoading, user, router]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      router.push("/dashboard");
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      router.push("/dashboard");
    } catch {
      setError("Google sign-in failed. Check Firebase Auth providers.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.24),transparent_45%)]" />
      <section className="relative mx-auto w-full max-w-md rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl">
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="mt-2 text-sm text-zinc-300">Log in to continue building premium websites.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-white/15 bg-zinc-950/90 px-4 py-3 text-sm outline-none focus:border-purple-400/70"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-white/15 bg-zinc-950/90 px-4 py-3 text-sm outline-none focus:border-purple-400/70"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-white to-purple-200 px-4 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <button
          type="button"
          onClick={onGoogleLogin}
          disabled={loading}
          className="mt-3 w-full rounded-xl border border-purple-300/35 bg-purple-500/10 px-4 py-3 text-sm font-semibold text-purple-100 transition hover:bg-purple-500/20 disabled:opacity-70"
        >
          Continue with Google
        </button>

        {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}

        <p className="mt-4 text-sm text-zinc-300">
          New here?{" "}
          <Link href="/signup" className="text-purple-200 underline">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
