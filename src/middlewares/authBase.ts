import { auth } from "@/lib/auth";
import { RBACService } from "@/services/rbacService";
import type {
  PermissionAction,
  PermissionCheck,
  PermissionResource,
} from "@/types/rbac";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Create authentication middleware
 */
export function createAuthMiddleware() {
  return async (req: NextRequest) => {
    try {
      const session = await auth.api.getSession({
        headers: req.headers,
      });

      if (!session?.user) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }

      return { user: session.user };
    } catch (error) {
      console.error("Auth middleware error:", error);
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }
  };
}

/**
 * Create permission middleware
 */
export function createPermissionMiddleware(
  action: PermissionAction,
  resource: PermissionResource
) {
  return async (req: NextRequest) => {
    const authResult = await createAuthMiddleware()(req);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    try {
      const hasPermission = await RBACService.hasPermission(
        user.id,
        action,
        resource
      );

      if (!hasPermission) {
        return NextResponse.json(
          { error: "Insufficient permissions" },
          { status: 403 }
        );
      }

      return { user };
    } catch (error) {
      console.error("Permission check error:", error);
      return NextResponse.json(
        { error: "Permission check failed" },
        { status: 500 }
      );
    }
  };
}

/**
 * Create multi-permission middleware
 */
export function createMultiPermissionMiddleware(
  permissionChecks: PermissionCheck[],
  requireAll = false
) {
  return async (req: NextRequest) => {
    const authResult = await createAuthMiddleware()(req);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    try {
      let hasPermission = false;

      if (requireAll) {
        hasPermission = await RBACService.hasAllPermissions(
          user.id,
          permissionChecks
        );
      } else {
        hasPermission = await RBACService.hasAnyPermission(
          user.id,
          permissionChecks
        );
      }

      if (!hasPermission) {
        return NextResponse.json(
          { error: "Insufficient permissions" },
          { status: 403 }
        );
      }

      return { user };
    } catch (error) {
      console.error("Multi-permission check error:", error);
      return NextResponse.json(
        { error: "Permission check failed" },
        { status: 500 }
      );
    }
  };
}

/**
 * Create role middleware
 */
export function createRoleMiddleware(roleName: string) {
  return async (req: NextRequest) => {
    const authResult = await createAuthMiddleware()(req);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    try {
      const hasRole = await RBACService.hasRole(user.id, roleName);

      if (!hasRole) {
        return NextResponse.json(
          { error: "Insufficient role permissions" },
          { status: 403 }
        );
      }

      return { user };
    } catch (error) {
      console.error("Role check error:", error);
      return NextResponse.json({ error: "Role check failed" }, { status: 500 });
    }
  };
}
