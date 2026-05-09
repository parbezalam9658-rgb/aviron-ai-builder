"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/app/providers/auth-provider";
import { setUserRole } from "@/lib/firestore";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Admin" | "Premium User" | "Normal User";
  plan: "Free" | "Pro" | "Pro+";
  status: "active" | "suspended";
  aiUsage: number;
  projects: number;
  revenue: number;
};

type NotificationItem = {
  id: string;
  title: string;
  detail: string;
  level: "info" | "warning" | "critical";
  time: string;
};

const seedUsers: AdminUser[] = [
  { id: "u1", name: "Aarav Shah", email: "aarav@brandlabs.com", role: "Super Admin", plan: "Pro+", status: "active", aiUsage: 943, projects: 34, revenue: 499 },
  { id: "u2", name: "Mia Patel", email: "mia@founderkit.ai", role: "Admin", plan: "Pro", status: "active", aiUsage: 602, projects: 21, revenue: 129 },
  { id: "u3", name: "Noah Verma", email: "noah@creativemint.com", role: "Normal User", plan: "Free", status: "active", aiUsage: 118, projects: 7, revenue: 0 },
  { id: "u4", name: "Sara Khan", email: "sara@growthfuse.co", role: "Premium User", plan: "Pro", status: "suspended", aiUsage: 320, projects: 13, revenue: 99 },
  { id: "u5", name: "Leo Gupta", email: "leo@shopaccelerate.io", role: "Premium User", plan: "Pro+", status: "active", aiUsage: 1203, projects: 51, revenue: 899 },
  { id: "u6", name: "Anika Roy", email: "anika@luxethemes.ai", role: "Normal User", plan: "Free", status: "active", aiUsage: 74, projects: 4, revenue: 0 },
];

const usageByDay = [
  { day: "Mon", value: 38 },
  { day: "Tue", value: 52 },
  { day: "Wed", value: 44 },
  { day: "Thu", value: 68 },
  { day: "Fri", value: 71 },
  { day: "Sat", value: 59 },
  { day: "Sun", value: 63 },
];

const notificationsSeed: NotificationItem[] = [
  { id: "n1", title: "High API usage spike", detail: "AI requests increased 34% in the last hour.", level: "warning", time: "2m ago" },
  { id: "n2", title: "Payment webhook delay", detail: "Razorpay webhook queue is 3 minutes behind.", level: "critical", time: "9m ago" },
  { id: "n3", title: "New Pro+ conversion", detail: "A Pro user upgraded to Pro+ plan.", level: "info", time: "21m ago" },
];

export default function AdminPage() {
  const router = useRouter();
  const { user, authLoading, isAdmin } = useAuth();
  const [users, setUsers] = useState(seedUsers);
  const [search, setSearch] = useState("");
  const [notifications, setNotifications] = useState(notificationsSeed);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.replace("/");
    }
  }, [authLoading, user, isAdmin, router]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.plan.toLowerCase().includes(q) ||
        u.status.toLowerCase().includes(q),
    );
  }, [users, search]);

  const totals = useMemo(() => {
    const revenue = users.reduce((acc, u) => acc + u.revenue, 0);
    const aiUsage = users.reduce((acc, u) => acc + u.aiUsage, 0);
    const websites = users.reduce((acc, u) => acc + Math.round(u.projects * 1.7), 0);
    const ads = users.reduce((acc, u) => acc + Math.round(u.projects * 1.3), 0);
    const themes = users.reduce((acc, u) => acc + Math.round(u.projects * 0.8), 0);
    return { revenue, aiUsage, websites, ads, themes };
  }, [users]);

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === "active" ? "suspended" : "active" } : u,
      ),
    );
  };

  const promotePlan = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        if (u.plan === "Free") return { ...u, plan: "Pro", revenue: u.revenue + 99 };
        if (u.plan === "Pro") return { ...u, plan: "Pro+", revenue: u.revenue + 399 };
        return u;
      }),
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const changeRole = async (id: string, nextRole: AdminUser["role"]) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: nextRole } : u)));
    await setUserRole(id, nextRole);
  };

  if (authLoading || !user || !isAdmin) {
    return (
      <main className="min-h-screen bg-black p-6 text-white">
        <p className="text-zinc-300">Authorizing admin access...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-6">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_45%),radial-gradient(circle_at_25%_30%,rgba(139,92,246,0.2),transparent_42%)]" />

      <div className="relative mx-auto grid w-full max-w-[1500px] gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.16em] text-purple-200">Admin</p>
          <h1 className="mt-2 text-xl font-semibold">Aviron Control</h1>
          <nav className="mt-4 space-y-2 text-sm">
            {[
              "Overview",
              "User Management",
              "Subscriptions",
              "Payment Analytics",
              "AI Usage",
              "Notifications",
            ].map((item) => (
              <button
                key={item}
                type="button"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left transition hover:border-purple-300/40"
              >
                {item}
              </button>
            ))}
          </nav>
          <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-zinc-300">
            Billion-dollar SaaS mode enabled.
          </div>
          <div className="mt-4 flex gap-2">
            <Link href="/" className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs">
              AI OS
            </Link>
            <Link href="/dashboard" className="rounded-lg border border-purple-300/35 bg-purple-500/15 px-3 py-2 text-xs text-purple-100">
              Dashboard
            </Link>
          </div>
        </aside>

        <div className="space-y-4">
          <header className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
                <p className="text-sm text-zinc-300">Revenue, AI usage, subscriptions, and user operations in one command center.</p>
              </div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users, plans, status..."
                className="w-full rounded-xl border border-white/15 bg-zinc-950/90 px-4 py-2 text-sm outline-none sm:max-w-xs"
              />
            </div>
          </header>

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {[
              ["Revenue", `$${totals.revenue.toLocaleString()}`],
              ["AI Usage", `${totals.aiUsage.toLocaleString()} req`],
              ["Website Generations", totals.websites.toLocaleString()],
              ["AI Ads Generations", totals.ads.toLocaleString()],
              ["Theme Downloads", totals.themes.toLocaleString()],
            ].map(([label, value]) => (
              <article key={label} className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">{label}</p>
                <p className="mt-2 text-2xl font-semibold">{value}</p>
              </article>
            ))}
          </section>

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
            <article className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-xl">
              <h3 className="text-lg font-semibold">AI Usage Analytics</h3>
              <p className="text-sm text-zinc-300">Weekly platform usage trend</p>
              <div className="mt-4 grid grid-cols-7 gap-2">
                {usageByDay.map((d) => (
                  <div key={d.day} className="flex flex-col items-center gap-2">
                    <div className="flex h-44 w-full items-end rounded-lg bg-zinc-900/70 p-1">
                      <div
                        className="w-full rounded-md bg-gradient-to-t from-purple-500 to-blue-400 transition-all duration-500"
                        style={{ height: `${d.value}%` }}
                      />
                    </div>
                    <p className="text-xs text-zinc-400">{d.day}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-xl">
              <h3 className="text-lg font-semibold">Notifications</h3>
              <div className="mt-3 space-y-2">
                {notifications.length === 0 ? (
                  <p className="rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-zinc-400">No pending notifications.</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="rounded-lg border border-white/10 bg-black/40 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">{n.title}</p>
                        <button type="button" onClick={() => dismissNotification(n.id)} className="text-xs text-zinc-400 hover:text-zinc-200">
                          Dismiss
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-zinc-300">{n.detail}</p>
                      <p className="mt-1 text-[11px] text-zinc-500">{n.time}</p>
                    </div>
                  ))
                )}
              </div>
            </article>
          </section>

          <section className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-xl">
            <h3 className="text-lg font-semibold">User & Subscription Management</h3>
            <div className="mt-3 overflow-x-auto rounded-xl border border-white/10">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-white/5 text-zinc-300">
                  <tr>
                    <th className="px-3 py-2">User</th>
                    <th className="px-3 py-2">Role</th>
                    <th className="px-3 py-2">Plan</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">AI Usage</th>
                    <th className="px-3 py-2">Revenue</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-t border-white/10">
                      <td className="px-3 py-2">
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-zinc-400">{u.email}</p>
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={u.role}
                          onChange={(e) => void changeRole(u.id, e.target.value as AdminUser["role"])}
                          className="rounded-md border border-white/20 bg-zinc-900 px-2 py-1 text-xs"
                        >
                          {["Super Admin", "Admin", "Premium User", "Normal User"].map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">{u.plan}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            u.status === "active" ? "bg-emerald-500/20 text-emerald-200" : "bg-red-500/20 text-red-200"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">{u.aiUsage}</td>
                      <td className="px-3 py-2">${u.revenue}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => toggleUserStatus(u.id)}
                            className="rounded-md border border-white/20 bg-white/5 px-2 py-1 text-xs"
                          >
                            {u.status === "active" ? "Suspend" : "Activate"}
                          </button>
                          <button
                            type="button"
                            onClick={() => promotePlan(u.id)}
                            className="rounded-md border border-purple-300/35 bg-purple-500/10 px-2 py-1 text-xs text-purple-100"
                          >
                            Upgrade Plan
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-xl">
            <h3 className="text-lg font-semibold">Recent User Activity</h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {[
                "User upgraded Free -> Pro",
                "Website generation burst from Agency cohort",
                "AI Ads module CTR simulation completed",
                "Shopify theme downloads +19% today",
              ].map((item) => (
                <article key={item} className="rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-zinc-200">
                  {item}
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
