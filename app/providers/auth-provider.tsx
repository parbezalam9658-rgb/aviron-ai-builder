"use client";

import React from "react";

type AuthType = {
  user: {
    uid: string;
  };
  authLoading: boolean;
  role: string;
  plan: string;
  isAdmin: boolean;
  isPro: boolean;
  isProPlus: boolean;
  logout: () => Promise<void>;
  loginWithEmail: (
    email: string,
    password: string
  ) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
};

export function useAuth(): AuthType {
  return {
    user: { uid: "demo-user" },
    authLoading: false,
    role: "user",
    plan: "free",
    isAdmin: false,
    isPro: false,
    isProPlus: false,

    logout: async () => {},

    loginWithEmail: async (
      email: string,
      password: string
    ) => {},

    loginWithGoogle: async () => {},
  };
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}