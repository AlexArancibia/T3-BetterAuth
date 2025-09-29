import { TRPCError } from "@trpc/server";
import { t } from "./context";

// Base router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;

// Protected procedure that requires authentication
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // Now user is guaranteed to be defined
    },
  });
});

// Admin procedure that requires admin role
export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  // Import isAdmin here to avoid circular dependencies
  const { isAdmin } = await import("../services/rbacService");
  const adminCheck = await isAdmin(ctx.user.id);

  if (!adminCheck) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You must be an admin to access this resource",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Super admin procedure that requires super admin role
export const superAdminProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  // Import isSuperAdmin here to avoid circular dependencies
  const { isSuperAdmin } = await import("../services/rbacService");
  const superAdminCheck = await isSuperAdmin(ctx.user.id);

  if (!superAdminCheck) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You must be a super admin to access this resource",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});
