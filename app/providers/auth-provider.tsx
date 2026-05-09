"use client";

import React from "react";

type AuthType = {
  user: null;
  authLoading: boolean;
  role: string;
  plan: string;
  isAdmin: boolean;
  isPro: boolean;
  isProPlus: boolean;
  logout: () => Promise<void>;
};

export function useAuth(): AuthType {
  return {
    user: null,
    authLoading: false,
    role: "user",
    plan: "free",
    isAdmin: false,
    isPro: false,
    isProPlus: false,
    logout: async () => {},
  };
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}