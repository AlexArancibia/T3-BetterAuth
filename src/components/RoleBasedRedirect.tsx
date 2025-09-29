"use client";

import { useAuthContext } from "@/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

interface RoleBasedRedirectProps {
  children: React.ReactNode;
}

export function RoleBasedRedirect({ children }: RoleBasedRedirectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const { primaryRole, isLoading: roleLoading } = useUserRole();

  useEffect(() => {
    // Don't redirect if still loading or not authenticated
    if (authLoading || roleLoading || !isAuthenticated) {
      return;
    }

    // Define routes that should be accessible to authenticated users without redirection
    const isOnSignInRoutes =
      pathname.startsWith("/signin") ||
      pathname.startsWith("/signup") ||
      pathname.startsWith("/forgot-password") ||
      pathname.startsWith("/reset-password") ||
      pathname.startsWith("/confirm-email");

    const isOnLandingPage = pathname === "/"; // Landing page - redirect traders automatically
    const isOnApiRoutes = pathname.startsWith("/api");
    const isOnPublicRoutes = pathname.startsWith("/(public)"); // Allow access to public routes

    // Don't redirect if user is on allowed routes (except landing page for traders)
    if (isOnSignInRoutes || isOnApiRoutes || isOnPublicRoutes) {
      return;
    }

    // If user is on landing page, redirect based on role
    if (isOnLandingPage) {
      switch (primaryRole) {
        case "trader":
          router.replace("/trader");
          return;
        case "admin":
        case "super_admin":
        case "viewer":
          router.replace("/dashboard");
          return;
        default:
          router.replace("/trader");
          return;
      }
    }

    // If user is already on a dashboard route, don't redirect
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/trader")) {
      return;
    }

    // Redirect based on user role (only if not already on appropriate route)
    switch (primaryRole) {
      case "trader":
        router.replace("/trader");
        break;

      case "admin":
      case "super_admin":
        router.replace("/dashboard");
        break;

      case "viewer":
        router.replace("/dashboard");
        break;

      default:
        // For unknown roles, redirect to trader by default (most common use case)
        router.replace("/trader");
        break;
    }
  }, [
    primaryRole,
    pathname,
    router,
    isAuthenticated,
    authLoading,
    roleLoading,
  ]);

  // Show loading state while determining role
  if (authLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
