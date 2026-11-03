"use client";

import { usePathname } from "next/navigation";
import { AppPageBackground } from "@/components/(base)/layout/AppPageBackground";

export default function AuthRoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <AppPageBackground centered={pathname === "/login"}>
      {children}
    </AppPageBackground>
  );
}
