"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "./logo";

export function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 3000); // 3-second delay before redirecting

    return () => clearTimeout(timer); // Cleanup the timer
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="animate-splash">
        <Logo className="transform-gpu" />
      </div>
    </div>
  );
}
