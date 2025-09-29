import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "../../lib/db";
import {
  calculateOffset,
  createPaginatedResponse,
  createSearchFilter,
  createSortOrder,
  paginationInputSchema,
} from "../../lib/pagination";
import { RBACService } from "../../services/rbacService";
import { PermissionAction, PermissionResource } from "../../types/rbac";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const propfirmRouter = router({
  // Get all propfirms
  getAll: publicProcedure
    .input(paginationInputSchema.optional())
    .query(async ({ input }) => {
      // Si no se proporciona input de paginación, usar valores por defecto
      const {
        page = 1,
        limit = 100,
        search,
        sortBy,
        sortOrder = "desc",
      } = input || {};
      const offset = calculateOffset(page, limit);

      const searchFilter = createSearchFilter(search, [
        "name",
        "displayName",
        "description",
      ]);
      const orderBy = createSortOrder(sortBy, sortOrder);

      const [propfirms, total] = await Promise.all([
        prisma.propfirm.findMany({
          where: {
            isActive: true,
            ...searchFilter,
          },
          orderBy,
          skip: offset,
          take: limit,
        }),
        prisma.propfirm.count({
          where: {
            isActive: true,
            ...searchFilter,
          },
        }),
      ]);

      return createPaginatedResponse(propfirms, total, page, limit);
    }),

  // Get propfirm by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const propfirm = await prisma.propfirm.findUnique({
        where: { id: input.id },
        include: {
          phases: {
            where: { isActive: true },
            orderBy: { displayOrder: "asc" },
          },
          accountTypes: {
            where: { isActive: true },
            orderBy: { createdAt: "asc" },
          },
          rulesConfigurations: {
            where: { isActive: true },
            include: {
              accountType: true,
              phase: true,
            },
          },
          symbolConfigurations: {
            where: { isAvailable: true },
            include: {
              symbol: true,
            },
          },
        },
      });

      if (!propfirm) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Propfirm not found",
        });
      }

      return propfirm;
    }),

  // Create propfirm
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        displayName: z.string().min(1, "Display name is required"),
        description: z.string().optional(),
        website: z.string().url().optional().or(z.literal("")),
        logoUrl: z.string().url().optional().or(z.literal("")),
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
            message: "You don't have permission to create propfirms",
          });
        }
      }

      // Check if name already exists
      const existingPropfirm = await prisma.propfirm.findUnique({
        where: { name: input.name },
      });

      if (existingPropfirm) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A propfirm with this name already exists",
        });
      }

      return await prisma.propfirm.create({
        data: {
          name: input.name,
          displayName: input.displayName,
          description: input.description,
          website: input.website || null,
          logoUrl: input.logoUrl || null,
        },
      });
    }),

  // Update propfirm
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required"),
        displayName: z.string().min(1, "Display name is required"),
        description: z.string().optional(),
        website: z.string().url().optional().or(z.literal("")),
        logoUrl: z.string().url().optional().or(z.literal("")),
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
            message: "You don't have permission to update propfirms",
          });
        }
      }

      // Check if propfirm exists
      const existingPropfirm = await prisma.propfirm.findUnique({
        where: { id: input.id },
      });

      if (!existingPropfirm) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Propfirm not found",
        });
      }

      // Check if name is being changed and if new name already exists
      if (input.name !== existingPropfirm.name) {
        const nameExists = await prisma.propfirm.findUnique({
          where: { name: input.name },
        });

        if (nameExists) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A propfirm with this name already exists",
          });
        }
      }

      return await prisma.propfirm.update({
        where: { id: input.id },
        data: {
          name: input.name,
          displayName: input.displayName,
          description: input.description,
          website: input.website || null,
          logoUrl: input.logoUrl || null,
          isActive: input.isActive,
        },
      });
    }),

  // Delete propfirm (soft delete)
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
            message: "You don't have permission to delete propfirms",
          });
        }
      }

      // Check if propfirm exists
      const existingPropfirm = await prisma.propfirm.findUnique({
        where: { id: input.id },
      });

      if (!existingPropfirm) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Propfirm not found",
        });
      }

      // Check if propfirm has associated trading accounts
      const hasTradingAccounts = await prisma.tradingAccount.findFirst({
        where: { propfirmId: input.id },
      });

      if (hasTradingAccounts) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Cannot delete propfirm with associated trading accounts",
        });
      }

      // Soft delete by setting isActive to false
      return await prisma.propfirm.update({
        where: { id: input.id },
        data: { isActive: false },
      });
    }),

  // Get propfirm statistics
  getStats: protectedProcedure
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
            message: "You don't have permission to view propfirm statistics",
          });
        }
      }

      const [tradingAccounts, phases, accountTypes, rulesConfigurations] =
        await Promise.all([
          prisma.tradingAccount.count({
            where: { propfirmId: input.id },
          }),
          prisma.propfirmPhase.count({
            where: { propfirmId: input.id, isActive: true },
          }),
          prisma.propfirmAccountType.count({
            where: { propfirmId: input.id, isActive: true },
          }),
          prisma.propfirmRulesConfiguration.count({
            where: { propfirmId: input.id, isActive: true },
          }),
        ]);

      return {
        tradingAccounts,
        phases,
        accountTypes,
        rulesConfigurations,
      };
    }),
});
