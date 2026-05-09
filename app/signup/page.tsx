"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { useAuth } from "@/app/providers/auth-provider";

export default function SignupPage() {
  const router = useRouter();
  const { user, authLoading, signupWithEmail, loginWithGoogle } = useAuth();
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
      await signupWithEmail(email, password);
      router.push("/dashboard");
    } catch {
      setError("Unable to create account. Password must be at least 6 characters.");
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignup = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      router.push("/dashboard");
    } catch {
      setError("Google signup failed. Check Firebase configuration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.24),transparent_45%)]" />
      <section className="relative mx-auto w-full max-w-md rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl">
        <h1 className="text-3xl font-bold">Create your account</h1>
        <p className="mt-2 text-sm text-zinc-300">Start generating premium websites in minutes.</p>

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
            {loading ? "Creating account..." : "Signup"}
          </button>
        </form>

        <button
          type="button"
          onClick={onGoogleSignup}
          disabled={loading}
          className="mt-3 w-full rounded-xl border border-purple-300/35 bg-purple-500/10 px-4 py-3 text-sm font-semibold text-purple-100 transition hover:bg-purple-500/20 disabled:opacity-70"
        >
          Continue with Google
        </button>

        {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}

        <p className="mt-4 text-sm text-zinc-300">
          Already have an account?{" "}
          <Link href="/login" className="text-purple-200 underline">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
