"use client";

import dynamic from "next/dynamic";

export const NavbarClient = dynamic(
  () => import("@/layout/Navbar").then((m) => ({ default: m.Navbar })),
  { ssr: false }
);
