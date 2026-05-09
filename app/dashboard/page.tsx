"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/app/providers/auth-provider";
import { CloudProject, UserProfile, deleteProject, subscribeProjects, subscribeUserProfile, updateProject } from "@/lib/firestore";

export default function DashboardPage() {
  const router = useRouter();
  const { user, authLoading, logout, role } = useAuth() as any;
  const [loggingOut, setLoggingOut] = useState(false);
  const [projects, setProjects] = useState<CloudProject[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrompt, setEditPrompt] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    const unsubProjects = subscribeProjects(user.uid, (rows) => {
      setProjects(rows);
      setDataLoading(false);
    });
    const unsubProfile = subscribeUserProfile(user.uid, (row) => {
      setProfile(row);
    });
    return () => {
      unsubProjects();
      unsubProfile();
    };
  }, [user]);

  const plan = useMemo(() => {
    return profile?.plan || "Free";
  }, [profile]);

  const onLogout = async () => {
    setLoggingOut(true);
    await logout();
    router.push("/login");
  };

  const startEdit = (project: CloudProject) => {
    setEditingId(project.id);
    setEditTitle(project.title);
    setEditPrompt(project.prompt);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditPrompt("");
  };

  const saveEdit = async () => {
    if (!user || !editingId) return;
    await updateProject(user.uid, editingId, { title: editTitle, prompt: editPrompt });
    cancelEdit();
  };

  const removeProject = async (projectId: string) => {
    if (!user) return;
    await deleteProject(user.uid, projectId);
  };

  if (authLoading || !user) {
    return (
      <main className="min-h-screen bg-black p-6 text-white">
        <p className="text-zinc-300">Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.2),transparent_45%)]" />
      <section className="relative mx-auto w-full max-w-7xl space-y-5">
        <div className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">User Dashboard</h1>
              <p className="mt-1 text-sm text-zinc-300">{user.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-purple-300/40 bg-purple-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-purple-100">
                {plan} {plan !== "Free" ? "Premium" : "Starter"} Badge
              </span>
              <span className="rounded-full border border-blue-300/40 bg-blue-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-blue-100">
                {role}
              </span>
              <button
                type="button"
                onClick={onLogout}
                disabled={loggingOut}
                className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-zinc-100 transition hover:bg-white/10 disabled:opacity-70"
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="/"
            className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-200 transition hover:border-purple-300/40 hover:bg-purple-500/10"
          >
            Create new website
          </Link>
          <Link
            href="/pricing"
            className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-200 transition hover:border-purple-300/40 hover:bg-purple-500/10"
          >
            Upgrade subscription
          </Link>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
            Cloud projects: <span className="font-semibold text-white">{projects.length}</span>
          </div>
        </div>

        <section className="rounded-2xl border border-white/10 bg-black/40 p-4 sm:p-5">
          <h2 className="text-lg font-semibold">Subscription Management</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <article className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">Current Plan</p>
              <p className="mt-2 text-lg font-semibold text-purple-100">{plan}</p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">Publishing Access</p>
              <p className="mt-2 text-sm text-zinc-200">{plan === "Free" ? "Locked (Upgrade to Pro)" : "Enabled"}</p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">AI Priority Tier</p>
              <p className="mt-2 text-sm text-zinc-200">{plan === "Pro+" ? "Priority (Pro+)" : plan === "Pro" ? "Fast" : "Standard"}</p>
            </article>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-zinc-200">Free: previews + image downloads</span>
            <span className="rounded-full border border-purple-300/35 bg-purple-500/10 px-3 py-1 text-purple-100">Pro: deploy + domain + premium templates</span>
            <span className="rounded-full border border-blue-300/35 bg-blue-500/10 px-3 py-1 text-blue-100">Pro+: unlimited deployments + premium AI tools</span>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-black/40 p-4 sm:p-5">
          <h2 className="text-lg font-semibold">Recent projects (cloud sync)</h2>
          {dataLoading ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="h-28 animate-pulse rounded-xl border border-white/10 bg-white/5" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-400">No projects saved yet. Generate websites, ads, or themes to sync them here.</p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {projects.map((project) => (
                <article key={project.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.15em] text-purple-200">{project.type}</p>
                  {editingId === project.id ? (
                    <div className="mt-2 space-y-2">
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full rounded-lg border border-white/15 bg-zinc-950/90 px-3 py-2 text-sm"
                      />
                      <textarea
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        className="h-20 w-full rounded-lg border border-white/15 bg-zinc-950/90 px-3 py-2 text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={saveEdit}
                          className="rounded-md border border-purple-300/35 bg-purple-500/10 px-3 py-1 text-xs text-purple-100"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="rounded-md border border-white/20 bg-white/5 px-3 py-1 text-xs text-zinc-100"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="mt-2 text-sm font-semibold text-zinc-100">{project.title}</p>
                      <p className="mt-1 text-sm text-zinc-300 line-clamp-2">{project.prompt}</p>
                    </>
                  )}
                  <p className="mt-2 text-xs text-zinc-400">{new Date(project.createdAt).toLocaleString()}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(project)}
                      className="rounded-md border border-purple-300/35 bg-purple-500/10 px-3 py-1 text-xs text-purple-100"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void removeProject(project.id)}
                      className="rounded-md border border-red-300/35 bg-red-500/10 px-3 py-1 text-xs text-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
