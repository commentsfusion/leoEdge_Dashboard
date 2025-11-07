"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function RequireAuth({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // read token from localStorage (your source of truth)
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      // redirect to login with "next" so we come back after login

      router.replace("/");
    } else {
      setReady(true);
    }
  }, [pathname, router]);

  if (!ready) return null;            // no flicker while checking
  return <>{children}</>;
}
