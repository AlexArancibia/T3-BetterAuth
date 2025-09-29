import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  calculateOffset,
  createPaginatedResponse,
  paginationInputSchema,
} from "../../lib/pagination";
import { RBACService } from "../../services/rbacService";
import { PermissionAction, PermissionResource } from "../../types/rbac";
import { adminProcedure, publicProcedure, router } from "../trpc";

export const rbacRouter = router({
  // Get all roles (simple array without pagination)
  getRoles: publicProcedure.query(async () => {
    return await RBACService.getAllRoles();
  }),

  // Get all roles (with pagination)
  getAllRoles: publicProcedure
    .input(paginationInputSchema.optional())
    .query(async ({ input }) => {
      const roles = await RBACService.getAllRoles();

      if (!input) {
        // Si no hay paginación, devolver todos los roles en formato compatible
        return createPaginatedResponse(roles, roles.length, 1, roles.length);
      }

      const { page = 1, limit = 100 } = input;
      const offset = calculateOffset(page, limit);
      const paginatedRoles = roles.slice(offset, offset + limit);

      return createPaginatedResponse(paginatedRoles, roles.length, page, limit);
    }),

  // Get all permissions
  getAllPermissions: publicProcedure
    .input(paginationInputSchema.optional())
    .query(async ({ input }) => {
      const permissions = await RBACService.getAllPermissions();

      if (!input) {
        return createPaginatedResponse(
          permissions,
          permissions.length,
          1,
          permissions.length
        );
      }

      const { page = 1, limit = 100 } = input;
      const offset = calculateOffset(page, limit);
      const paginatedPermissions = permissions.slice(offset, offset + limit);

      return createPaginatedResponse(
        paginatedPermissions,
        permissions.length,
        page,
        limit
      );
    }),

  // Get permissions for a specific role
  getRolePermissions: publicProcedure
    .input(z.object({ roleId: z.string() }))
    .query(async ({ input }) => {
      return await RBACService.getRolePermissions(input.roleId);
    }),

  // Get user roles
  getUserRoles: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return await RBACService.getUserRoles(input.userId);
    }),

  // Get user permissions
  getUserPermissions: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return await RBACService.getUserPermissions(input.userId);
    }),

  // Check user permission
  checkPermission: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        action: z.nativeEnum(PermissionAction),
        resource: z.nativeEnum(PermissionResource),
      })
    )
    .query(async ({ input }) => {
      return await RBACService.hasPermission(
        input.userId,
        input.action,
        input.resource
      );
    }),

  // Check user role
  checkRole: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        roleName: z.string(),
      })
    )
    .query(async ({ input }) => {
      return await RBACService.hasRole(input.userId, input.roleName);
    }),

  // Create role
  createRole: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        displayName: z.string().min(1),
        description: z.string().optional(),
        isSystem: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user has permission to create roles
      if (ctx.user?.id) {
        const canCreateRole = await RBACService.hasPermission(
          ctx.user.id,
          PermissionAction.CREATE,
          PermissionResource.ROLE
        );
        if (!canCreateRole) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Insufficient permissions to create roles",
          });
        }
      }

      return await RBACService.createRole(input);
    }),

  // Update role
  updateRole: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        displayName: z.string().min(1).optional(),
        description: z.string().optional(),
        isSystem: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user has permission to update roles
      if (ctx.user?.id) {
        const canUpdateRole = await RBACService.hasPermission(
          ctx.user.id,
          PermissionAction.UPDATE,
          PermissionResource.ROLE
        );
        if (!canUpdateRole) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Insufficient permissions to update roles",
          });
        }
      }

      return await RBACService.updateRole(input);
    }),

  // Delete role
  deleteRole: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Check if user has permission to delete roles
      if (ctx.user?.id) {
        const canDeleteRole = await RBACService.hasPermission(
          ctx.user.id,
          PermissionAction.DELETE,
          PermissionResource.ROLE
        );
        if (!canDeleteRole) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Insufficient permissions to delete roles",
          });
        }
      }

      return await RBACService.deleteRole(input.id);
    }),

  // Create permission
  createPermission: adminProcedure
    .input(
      z.object({
        action: z.nativeEnum(PermissionAction),
        resource: z.nativeEnum(PermissionResource),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user has permission to create permissions
      if (ctx.user?.id) {
        const canCreatePermission = await RBACService.hasPermission(
          ctx.user.id,
          PermissionAction.CREATE,
          PermissionResource.PERMISSION
        );
        if (!canCreatePermission) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Insufficient permissions to create permissions",
          });
        }
      }

      return await RBACService.createPermission(input);
    }),

  // Assign role to user
  assignRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        roleId: z.string(),
        assignedBy: z.string().optional(),
        expiresAt: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user has permission to assign roles
      if (ctx.user?.id) {
        const canAssignRole = await RBACService.hasPermission(
          ctx.user.id,
          PermissionAction.UPDATE,
          PermissionResource.ROLE
        );
        if (!canAssignRole) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Insufficient permissions to assign roles",
          });
        }
      }

      return await RBACService.assignRole(
        input.userId,
        input.roleId,
        input.assignedBy,
        input.expiresAt
      );
    }),

  // Remove role from user
  removeRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        roleId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user has permission to remove roles
      if (ctx.user?.id) {
        const canRemoveRole = await RBACService.hasPermission(
          ctx.user.id,
          PermissionAction.UPDATE,
          PermissionResource.ROLE
        );
        if (!canRemoveRole) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Insufficient permissions to remove roles",
          });
        }
      }

      await RBACService.removeRole(input.userId, input.roleId);
      return { success: true };
    }),

  // Assign permission to role
  assignPermissionToRole: adminProcedure
    .input(
      z.object({
        roleId: z.string(),
        permissionId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user has permission to manage roles
      if (ctx.user?.id) {
        const canManageRole = await RBACService.hasPermission(
          ctx.user.id,
          PermissionAction.UPDATE,
          PermissionResource.ROLE
        );
        if (!canManageRole) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Insufficient permissions to manage role permissions",
          });
        }
      }

      await RBACService.assignPermissionToRole(
        input.roleId,
        input.permissionId
      );
      return { success: true };
    }),

  // Remove permission from role
  removePermissionFromRole: adminProcedure
    .input(
      z.object({
        roleId: z.string(),
        permissionId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user has permission to manage roles
      if (ctx.user?.id) {
        const canManageRole = await RBACService.hasPermission(
          ctx.user.id,
          PermissionAction.UPDATE,
          PermissionResource.ROLE
        );
        if (!canManageRole) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Insufficient permissions to manage role permissions",
          });
        }
      }

      await RBACService.removePermissionFromRole(
        input.roleId,
        input.permissionId
      );
      return { success: true };
    }),

  // Get role by name
  getRoleByName: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input }) => {
      return await RBACService.getRoleByName(input.name);
    }),

  // Get permission by action and resource
  getPermissionByActionAndResource: publicProcedure
    .input(
      z.object({
        action: z.nativeEnum(PermissionAction),
        resource: z.nativeEnum(PermissionResource),
      })
    )
    .query(async ({ input }) => {
      return await RBACService.getPermissionByActionAndResource(
        input.action,
        input.resource
      );
    }),

  // Check if user is admin
  isAdmin: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return await RBACService.isAdmin(input.userId);
    }),

  // Check if user is super admin
  isSuperAdmin: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return await RBACService.isSuperAdmin(input.userId);
    }),

  // Check if user can manage users
  canManageUsers: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return await RBACService.canManageUsers(input.userId);
    }),

  // Check if user can manage roles
  canManageRoles: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return await RBACService.canManageRoles(input.userId);
    }),

  // Check if user can access admin panel
  canAccessAdmin: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return await RBACService.canAccessAdmin(input.userId);
    }),

  // Check if user can manage trading accounts
  canManageTradingAccounts: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return await RBACService.canManageTradingAccounts(input.userId);
    }),

  // Check if user can manage trades
  canManageTrades: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return await RBACService.canManageTrades(input.userId);
    }),

  // Check if user can view dashboard
  canViewDashboard: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return await RBACService.canViewDashboard(input.userId);
    }),

  // Get RBAC context for user
  getRBACContext: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return await RBACService.getRBACContext(input.userId);
    }),
});
