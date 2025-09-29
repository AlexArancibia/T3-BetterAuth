import ProtectedRoute from "@/components/ProtectedRoute";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = generateSEOMetadata({
  title: "Platform",
  description: "Plataforma de trading y gestión administrativa.",
  keywords: ["platform", "trading", "gestión", "dashboard"],
});

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
