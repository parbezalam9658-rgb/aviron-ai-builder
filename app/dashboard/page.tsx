"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/app/providers/auth-provider";

import {
  CloudProject,
  UserProfile,
  deleteProject,
  subscribeProjects,
  subscribeUserProfile,
  updateProject,
} from "@/lib/firestore";

export default function DashboardPage() {
  const router = useRouter();

  const auth = useAuth() as any;

  const user = auth.user;
  const authLoading = auth.authLoading;
  const logout = auth.logout;
  const role = auth.role;

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

    const unsubProjects = subscribeProjects(
      user.uid,
      (rows: CloudProject[]) => {
        setProjects(rows);
        setDataLoading(false);
      }
    );

    const unsubProfile = subscribeUserProfile(
      user.uid,
      (row: UserProfile | null) => {
        setProfile(row);
      }
    );

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
    setEditPrompt(project.prompt || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditPrompt("");
  };

  const saveEdit = async () => {
    if (!user || !editingId) return;

    await updateProject(user.uid, editingId, {
      title: editTitle,
      prompt: editPrompt,
    });

    cancelEdit();
  };

  const removeProject = async (projectId: string) => {
    if (!user) return;

    await deleteProject(user.uid, projectId);
  };

  if (authLoading || !user) {
    return (
      <main className="min-h-screen bg-black p-6 text-white">
        <p className="text-zinc-300">
          Loading dashboard...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white sm:px-6">
      <section className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                Aviron AI Dashboard
              </h1>

              <p className="mt-2 text-zinc-400">
                Welcome back{" "}
                {user?.email || "Guest"}
              </p>
            </div>

            <button
              onClick={onLogout}
              className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white"
            >
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
            <h2 className="text-xl font-semibold">
              Profile
            </h2>

            <div className="mt-4 space-y-2 text-sm text-zinc-300">
              <p>
                Name:{" "}
                {profile?.displayName ||
                  "Aviron User"}
              </p>

              <p>
                Email:{" "}
                {profile?.email ||
                  "demo@example.com"}
              </p>

              <p>Role: {role}</p>

              <p>Plan: {plan}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
            <h2 className="text-xl font-semibold">
              Quick Links
            </h2>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/deploy"
                className="rounded-xl bg-purple-500 px-4 py-2 text-sm font-semibold text-white"
              >
                Deploy
              </Link>

              <Link
                href="/pricing"
                className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white"
              >
                Pricing
              </Link>

              <Link
                href="/domains"
                className="rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white"
              >
                Domains
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">
              Projects
            </h2>

            <span className="text-sm text-zinc-400">
              {projects.length} projects
            </span>
          </div>

          {dataLoading ? (
            <p className="mt-4 text-zinc-400">
              Loading projects...
            </p>
          ) : projects.length === 0 ? (
            <p className="mt-4 text-zinc-400">
              No projects found.
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-xl border border-white/10 bg-black/40 p-4"
                >
                  {editingId === project.id ? (
                    <div className="space-y-3">
                      <input
                        value={editTitle}
                        onChange={(e) =>
                          setEditTitle(e.target.value)
                        }
                        className="w-full rounded-lg border border-white/10 bg-zinc-950 p-3 text-white"
                      />

                      <textarea
                        value={editPrompt}
                        onChange={(e) =>
                          setEditPrompt(e.target.value)
                        }
                        className="w-full rounded-lg border border-white/10 bg-zinc-950 p-3 text-white"
                      />

                      <div className="flex gap-2">
                        <button
                          onClick={saveEdit}
                          className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold"
                        >
                          Save
                        </button>

                        <button
                          onClick={cancelEdit}
                          className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {project.title}
                        </h3>

                        <p className="mt-1 text-sm text-zinc-400">
                          {project.prompt ||
                            "No prompt added"}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            startEdit(project)
                          }
                          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            removeProject(project.id)
                          }
                          className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}