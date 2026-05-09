"use client";

import React from "react";

export function useAuth() {
  return {
    user: null,
    authLoading: false,
    role: "user",
    plan: "free",
    isAdmin: false,
    isPro: false,
    isProPlus: false,
  };
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}