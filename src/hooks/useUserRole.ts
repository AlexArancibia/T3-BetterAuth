"use client";

import { useAuthContext } from "@/AuthContext";
import { useRBAC } from "@/hooks/useRBAC";
import { useEffect, useState } from "react";

export type UserRole =
  | "trader"
  | "admin"
  | "viewer"
  | "super_admin"
  | "unknown";

export function useUserRole() {
  const { user: _user, isAuthenticated } = useAuthContext();
  const { userRoles, isLoading } = useRBAC();
  const [primaryRole, setPrimaryRole] = useState<UserRole>("unknown");

  useEffect(() => {
    if (!isAuthenticated || isLoading || !userRoles?.length) {
      setPrimaryRole("unknown");
      return;
    }

    // Priority order: super_admin > admin > trader > viewer
    const roleHierarchy: Record<string, UserRole> = {
      super_admin: "super_admin",
      admin: "admin",
      trader: "trader",
      viewer: "viewer",
    };

    // Find the highest priority role
    let highestRole: UserRole = "viewer"; // Start with lowest priority

    for (const userRole of userRoles) {
      if (userRole.isActive && roleHierarchy[userRole.name]) {
        const mappedRole = roleHierarchy[userRole.name];

        // Set role based on priority
        if (mappedRole === "super_admin") {
          highestRole = "super_admin";
          break; // Super admin has highest priority
        }
        if (mappedRole === "admin") {
          highestRole = "admin";
        } else if (mappedRole === "trader") {
          if (highestRole === "viewer") {
            highestRole = "trader";
          }
        } else if (mappedRole === "viewer" && highestRole === "trader") {
          // Keep trader role as it has higher priority than viewer
        }
      }
    }

    setPrimaryRole(highestRole);
  }, [isAuthenticated, userRoles, isLoading]);

  return {
    primaryRole,
    isLoading,
    isTrader: primaryRole === "trader",
    isAdmin: ["admin", "super_admin"].includes(primaryRole),
    isSuperAdmin: primaryRole === "super_admin",
    isViewer: primaryRole === "viewer",
  };
}
