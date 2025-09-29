import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "../../lib/db";
import { RBACService } from "../../services/rbacService";
import { PermissionAction, PermissionResource } from "../../types/rbac";
import { protectedProcedure, router } from "../trpc";

export const propfirmAccountTypeRouter = router({
  // Get all account types by propfirm ID
  getByPropfirmId: protectedProcedure
    .input(z.object({ propfirmId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Check permission
      if (ctx.user?.id) {
        const hasPermission = await RBACService.hasPermission(
          ctx.user.id,
          PermissionAction.READ,
          PermissionResource.PROPFIRM
        );
        if (!hasPermission) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to view propfirm account types",
          });
        }
      }

      // Verify propfirm exists
      const propfirm = await prisma.propfirm.findUnique({
        where: { id: input.propfirmId },
      });

      if (!propfirm) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Propfirm not found",
        });
      }

      return await prisma.propfirmAccountType.findMany({
        where: {
          propfirmId: input.propfirmId,
          isActive: true,
        },
        orderBy: { createdAt: "asc" },
      });
    }),

  // Get account type by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      // Check permission
      if (ctx.user?.id) {
        const hasPermission = await RBACService.hasPermission(
          ctx.user.id,
          PermissionAction.READ,
          PermissionResource.PROPFIRM
        );
        if (!hasPermission) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to view propfirm account types",
          });
        }
      }

      const accountType = await prisma.propfirmAccountType.findUnique({
        where: { id: input.id },
        include: {
          propfirm: {
            select: {
              id: true,
              name: true,
              displayName: true,
            },
          },
        },
      });

      if (!accountType) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account type not found",
        });
      }

      return accountType;
    }),

  // Create account type
  create: protectedProcedure
    .input(
      z.object({
        propfirmId: z.string().min(1, "Propfirm ID is required"),
        typeName: z.string().min(1, "Type name is required"),
        displayName: z.string().min(1, "Display name is required"),
        initialBalance: z
          .number()
          .min(0, "Initial balance must be 0 or greater"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check permission
      if (ctx.user?.id) {
        const hasPermission = await RBACService.hasPermission(
          ctx.user.id,
          PermissionAction.CREATE,
          PermissionResource.PROPFIRM
        );
        if (!hasPermission) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message:
              "You don't have permission to create propfirm account types",
          });
        }
      }

      // Verify propfirm exists
      const propfirm = await prisma.propfirm.findUnique({
        where: { id: input.propfirmId },
      });

      if (!propfirm) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Propfirm not found",
        });
      }

      // Check if type name already exists for this propfirm
      const existingAccountType = await prisma.propfirmAccountType.findFirst({
        where: {
          propfirmId: input.propfirmId,
          typeName: input.typeName,
          isActive: true,
        },
      });

      if (existingAccountType) {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            "An account type with this name already exists for this propfirm",
        });
      }

      return await prisma.propfirmAccountType.create({
        data: {
          propfirmId: input.propfirmId,
          typeName: input.typeName,
          displayName: input.displayName,
          initialBalance: input.initialBalance,
        },
      });
    }),

  // Update account type
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        typeName: z.string().min(1, "Type name is required"),
        displayName: z.string().min(1, "Display name is required"),
        initialBalance: z
          .number()
          .min(0, "Initial balance must be 0 or greater"),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check permission
      if (ctx.user?.id) {
        const hasPermission = await RBACService.hasPermission(
          ctx.user.id,
          PermissionAction.UPDATE,
          PermissionResource.PROPFIRM
        );
        if (!hasPermission) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message:
              "You don't have permission to update propfirm account types",
          });
        }
      }

      // Check if account type exists
      const existingAccountType = await prisma.propfirmAccountType.findUnique({
        where: { id: input.id },
      });

      if (!existingAccountType) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account type not found",
        });
      }

      // Check if type name is being changed and if new name already exists
      if (input.typeName !== existingAccountType.typeName) {
        const nameExists = await prisma.propfirmAccountType.findFirst({
          where: {
            propfirmId: existingAccountType.propfirmId,
            typeName: input.typeName,
            isActive: true,
            id: { not: input.id },
          },
        });

        if (nameExists) {
          throw new TRPCError({
            code: "CONFLICT",
            message:
              "An account type with this name already exists for this propfirm",
          });
        }
      }

      return await prisma.propfirmAccountType.update({
        where: { id: input.id },
        data: {
          typeName: input.typeName,
          displayName: input.displayName,
          initialBalance: input.initialBalance,
          isActive: input.isActive,
        },
      });
    }),

  // Delete account type (soft delete)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Check permission
      if (ctx.user?.id) {
        const hasPermission = await RBACService.hasPermission(
          ctx.user.id,
          PermissionAction.DELETE,
          PermissionResource.PROPFIRM
        );
        if (!hasPermission) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message:
              "You don't have permission to delete propfirm account types",
          });
        }
      }

      // Check if account type exists
      const existingAccountType = await prisma.propfirmAccountType.findUnique({
        where: { id: input.id },
      });

      if (!existingAccountType) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account type not found",
        });
      }

      // Check if account type has associated trading accounts or rules configurations
      const hasTradingAccounts = await prisma.tradingAccount.findFirst({
        where: { accountTypeId: input.id },
      });

      if (hasTradingAccounts) {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            "Cannot delete account type with associated trading accounts",
        });
      }

      const hasRulesConfigurations =
        await prisma.propfirmRulesConfiguration.findFirst({
          where: { accountTypeId: input.id },
        });

      if (hasRulesConfigurations) {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            "Cannot delete account type with associated rules configurations",
        });
      }

      // Soft delete by setting isActive to false
      return await prisma.propfirmAccountType.update({
        where: { id: input.id },
        data: { isActive: false },
      });
    }),
});
