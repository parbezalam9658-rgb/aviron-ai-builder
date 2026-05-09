"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Silent fail to avoid blocking core app flow.
    });
  }, []);

  return null;
}
