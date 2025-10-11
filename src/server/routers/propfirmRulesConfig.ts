import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "../../lib/db";
import { hasPermission } from "../../services/rbacService";
import { PermissionAction, PermissionResource } from "../../types/rbac";
import { protectedProcedure, router } from "../trpc";

export const propfirmRulesConfigRouter = router({
  // Get all rules configurations by propfirm ID
  getByPropfirmId: protectedProcedure
    .input(z.object({ propfirmId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Check permission
      if (ctx.user?.id) {
        const userHasPermission = await hasPermission(
          ctx.user.id,
          PermissionAction.READ,
          PermissionResource.PROPFIRM
        );
        if (!userHasPermission) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message:
              "You don't have permission to view propfirm rules configurations",
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

      return await prisma.propfirmRulesConfiguration.findMany({
        where: {
          propfirmId: input.propfirmId,
          isActive: true,
        },
        include: {
          accountType: {
            select: {
              id: true,
              typeName: true,
              displayName: true,
            },
          },
          phase: {
            select: {
              id: true,
              phaseName: true,
              displayName: true,
            },
          },
        },
        orderBy: [
          { accountType: { displayName: "asc" } },
          { phase: { displayOrder: "asc" } },
        ],
      });
    }),

  // Get rules configuration by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      // Check permission
      if (ctx.user?.id) {
        const userHasPermission = await hasPermission(
          ctx.user.id,
          PermissionAction.READ,
          PermissionResource.PROPFIRM
        );
        if (!userHasPermission) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message:
              "You don't have permission to view propfirm rules configurations",
          });
        }
      }

      const rulesConfig = await prisma.propfirmRulesConfiguration.findUnique({
        where: { id: input.id },
        include: {
          propfirm: {
            select: {
              id: true,
              name: true,
              displayName: true,
            },
          },
          accountType: {
            select: {
              id: true,
              typeName: true,
              displayName: true,
            },
          },
          phase: {
            select: {
              id: true,
              phaseName: true,
              displayName: true,
            },
          },
        },
      });

      if (!rulesConfig) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Rules configuration not found",
        });
      }

      return rulesConfig;
    }),

  // Create rules configuration
  create: protectedProcedure
    .input(
      z.object({
        propfirmId: z.string().min(1, "Propfirm ID is required"),
        accountTypeId: z.string().min(1, "Account type ID is required"),
        phaseId: z.string().min(1, "Phase ID is required"),
        maxDrawdown: z
          .number()
          .min(0)
          .max(100, "Max drawdown must be between 0 and 100"),
        dailyDrawdown: z
          .number()
          .min(0)
          .max(100, "Daily drawdown must be between 0 and 100"),
        profitTarget: z
          .number()
          .min(0)
          .max(100, "Profit target must be between 0 and 100")
          .optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check permission
      if (ctx.user?.id) {
        const userHasPermission = await hasPermission(
          ctx.user.id,
          PermissionAction.CREATE,
          PermissionResource.PROPFIRM
        );
        if (!userHasPermission) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message:
              "You don't have permission to create propfirm rules configurations",
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

      // Verify account type exists and belongs to propfirm
      const accountType = await prisma.propfirmAccountType.findFirst({
        where: {
          id: input.accountTypeId,
          propfirmId: input.propfirmId,
          isActive: true,
        },
      });

      if (!accountType) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account type not found or doesn't belong to this propfirm",
        });
      }

      // Verify phase exists and belongs to propfirm
      const phase = await prisma.propfirmPhase.findFirst({
        where: {
          id: input.phaseId,
          propfirmId: input.propfirmId,
          isActive: true,
        },
      });

      if (!phase) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Phase not found or doesn't belong to this propfirm",
        });
      }

      // Check if rules configuration already exists for this combination
      const existingConfig = await prisma.propfirmRulesConfiguration.findFirst({
        where: {
          propfirmId: input.propfirmId,
          accountTypeId: input.accountTypeId,
          phaseId: input.phaseId,
          isActive: true,
        },
      });

      if (existingConfig) {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            "Rules configuration already exists for this account type and phase combination",
        });
      }

      return await prisma.propfirmRulesConfiguration.create({
        data: {
          propfirmId: input.propfirmId,
          accountTypeId: input.accountTypeId,
          phaseId: input.phaseId,
          maxDrawdown: input.maxDrawdown,
          dailyDrawdown: input.dailyDrawdown,
          profitTarget: input.profitTarget,
        },
        include: {
          accountType: {
            select: {
              id: true,
              typeName: true,
              displayName: true,
            },
          },
          phase: {
            select: {
              id: true,
              phaseName: true,
              displayName: true,
            },
          },
        },
      });
    }),

  // Update rules configuration
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        accountTypeId: z.string().min(1, "Account type ID is required"),
        phaseId: z.string().min(1, "Phase ID is required"),
        maxDrawdown: z
          .number()
          .min(0)
          .max(100, "Max drawdown must be between 0 and 100"),
        dailyDrawdown: z
          .number()
          .min(0)
          .max(100, "Daily drawdown must be between 0 and 100"),
        profitTarget: z
          .number()
          .min(0)
          .max(100, "Profit target must be between 0 and 100")
          .optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check permission
      if (ctx.user?.id) {
        const userHasPermission = await hasPermission(
          ctx.user.id,
          PermissionAction.UPDATE,
          PermissionResource.PROPFIRM
        );
        if (!userHasPermission) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message:
              "You don't have permission to update propfirm rules configurations",
          });
        }
      }

      // Check if rules configuration exists
      const existingConfig = await prisma.propfirmRulesConfiguration.findUnique(
        {
          where: { id: input.id },
        }
      );

      if (!existingConfig) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Rules configuration not found",
        });
      }

      // Verify account type exists and belongs to propfirm
      const accountType = await prisma.propfirmAccountType.findFirst({
        where: {
          id: input.accountTypeId,
          propfirmId: existingConfig.propfirmId,
          isActive: true,
        },
      });

      if (!accountType) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account type not found or doesn't belong to this propfirm",
        });
      }

      // Verify phase exists and belongs to propfirm
      const phase = await prisma.propfirmPhase.findFirst({
        where: {
          id: input.phaseId,
          propfirmId: existingConfig.propfirmId,
          isActive: true,
        },
      });

      if (!phase) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Phase not found or doesn't belong to this propfirm",
        });
      }

      // Check if the combination is being changed and if it already exists
      if (
        input.accountTypeId !== existingConfig.accountTypeId ||
        input.phaseId !== existingConfig.phaseId
      ) {
        const duplicateConfig =
          await prisma.propfirmRulesConfiguration.findFirst({
            where: {
              propfirmId: existingConfig.propfirmId,
              accountTypeId: input.accountTypeId,
              phaseId: input.phaseId,
              isActive: true,
              id: { not: input.id },
            },
          });

        if (duplicateConfig) {
          throw new TRPCError({
            code: "CONFLICT",
            message:
              "Rules configuration already exists for this account type and phase combination",
          });
        }
      }

      return await prisma.propfirmRulesConfiguration.update({
        where: { id: input.id },
        data: {
          accountTypeId: input.accountTypeId,
          phaseId: input.phaseId,
          maxDrawdown: input.maxDrawdown,
          dailyDrawdown: input.dailyDrawdown,
          profitTarget: input.profitTarget,
          isActive: input.isActive,
        },
        include: {
          accountType: {
            select: {
              id: true,
              typeName: true,
              displayName: true,
            },
          },
          phase: {
            select: {
              id: true,
              phaseName: true,
              displayName: true,
            },
          },
        },
      });
    }),

  // Delete rules configuration (soft delete)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Check permission
      if (ctx.user?.id) {
        const userHasPermission = await hasPermission(
          ctx.user.id,
          PermissionAction.DELETE,
          PermissionResource.PROPFIRM
        );
        if (!userHasPermission) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message:
              "You don't have permission to delete propfirm rules configurations",
          });
        }
      }

      // Check if rules configuration exists
      const existingConfig = await prisma.propfirmRulesConfiguration.findUnique(
        {
          where: { id: input.id },
        }
      );

      if (!existingConfig) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Rules configuration not found",
        });
      }

      // Soft delete by setting isActive to false
      return await prisma.propfirmRulesConfiguration.update({
        where: { id: input.id },
        data: { isActive: false },
      });
    }),

  // Get rules configuration for a specific trading account
  getByTradingAccount: protectedProcedure
    .input(
      z.object({
        propfirmId: z.string(),
        accountTypeId: z.string(),
        phaseId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const rulesConfig = await prisma.propfirmRulesConfiguration.findFirst({
        where: {
          propfirmId: input.propfirmId,
          accountTypeId: input.accountTypeId,
          phaseId: input.phaseId,
          isActive: true,
        },
        include: {
          propfirm: {
            select: {
              id: true,
              name: true,
              displayName: true,
            },
          },
          accountType: {
            select: {
              id: true,
              typeName: true,
              displayName: true,
              initialBalance: true,
            },
          },
          phase: {
            select: {
              id: true,
              phaseName: true,
              displayName: true,
            },
          },
        },
      });

      return rulesConfig;
    }),
});
