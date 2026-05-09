"use client";

import {
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { UserProfile, subscribeUserProfile, upsertUserProfile } from "@/lib/firestore";
import { auth } from "@/lib/firebase";

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  role: UserProfile["role"];
  plan: UserProfile["plan"];
  isPremium: boolean;
  isPro: boolean;
  isProPlus: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  authLoading: boolean;
  signupWithEmail: (email: string, password: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthLoading(false);
      if (nextUser) {
        void upsertUserProfile(nextUser);
      } else {
        setProfile(null);
        document.cookie = "aviron_auth=0; path=/";
        document.cookie = "aviron_role=Normal%20User; path=/";
        document.cookie = "aviron_plan=Free; path=/";
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeUserProfile(user.uid, (nextProfile) => {
      setProfile(nextProfile);
      const role = nextProfile?.role || "Normal User";
      const plan = nextProfile?.plan || "Free";
      document.cookie = "aviron_auth=1; path=/";
      document.cookie = `aviron_role=${encodeURIComponent(role)}; path=/`;
      document.cookie = `aviron_plan=${encodeURIComponent(plan)}; path=/`;
    });
    return () => unsub();
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      role: profile?.role ?? "Normal User",
      plan: profile?.plan ?? "Free",
      isPro: (profile?.plan ?? "Free") === "Pro",
      isProPlus:
        (profile?.plan ?? "Free") === "Pro+" ||
        (profile?.role ?? "Normal User") === "Admin" ||
        (profile?.role ?? "Normal User") === "Super Admin",
      isPremium:
        (profile?.plan ?? "Free") !== "Free" ||
        (profile?.role ?? "Normal User") === "Premium User" ||
        (profile?.role ?? "Normal User") === "Admin" ||
        (profile?.role ?? "Normal User") === "Super Admin",
      isAdmin:
        (profile?.role ?? "Normal User") === "Admin" ||
        (profile?.role ?? "Normal User") === "Super Admin",
      isSuperAdmin: (profile?.role ?? "Normal User") === "Super Admin",
      authLoading,
      signupWithEmail: async (email, password) => {
        await createUserWithEmailAndPassword(auth, email, password);
      },
      loginWithEmail: async (email, password) => {
        await signInWithEmailAndPassword(auth, email, password);
      },
      loginWithGoogle: async () => {
        await signInWithPopup(auth, new GoogleAuthProvider());
      },
      logout: async () => {
        await signOut(auth);
        document.cookie = "aviron_auth=0; path=/";
        document.cookie = "aviron_role=Normal%20User; path=/";
        document.cookie = "aviron_plan=Free; path=/";
      },
    }),
    [user, profile, authLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
