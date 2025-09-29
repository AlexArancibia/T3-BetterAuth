import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "../../lib/db";
import { RBACService } from "../../services/rbacService";
import { PermissionAction, PermissionResource } from "../../types/rbac";
import { protectedProcedure, router } from "../trpc";

export const propfirmPhaseRouter = router({
  // Get all phases by propfirm ID
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
            message: "You don't have permission to view propfirm phases",
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

      return await prisma.propfirmPhase.findMany({
        where: {
          propfirmId: input.propfirmId,
          isActive: true,
        },
        orderBy: { displayOrder: "asc" },
      });
    }),

  // Get phase by ID
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
            message: "You don't have permission to view propfirm phases",
          });
        }
      }

      const phase = await prisma.propfirmPhase.findUnique({
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

      if (!phase) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Phase not found",
        });
      }

      return phase;
    }),

  // Create phase
  create: protectedProcedure
    .input(
      z.object({
        propfirmId: z.string().min(1, "Propfirm ID is required"),
        phaseName: z.string().min(1, "Phase name is required"),
        displayName: z.string().min(1, "Display name is required"),
        displayOrder: z
          .number()
          .min(0, "Display order must be 0 or greater")
          .default(0),
        isEvaluation: z.boolean().default(true),
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
            message: "You don't have permission to create propfirm phases",
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

      // Check if phase name already exists for this propfirm
      const existingPhase = await prisma.propfirmPhase.findFirst({
        where: {
          propfirmId: input.propfirmId,
          phaseName: input.phaseName,
          isActive: true,
        },
      });

      if (existingPhase) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A phase with this name already exists for this propfirm",
        });
      }

      return await prisma.propfirmPhase.create({
        data: {
          propfirmId: input.propfirmId,
          phaseName: input.phaseName,
          displayName: input.displayName,
          displayOrder: input.displayOrder,
          isEvaluation: input.isEvaluation,
        },
      });
    }),

  // Update phase
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        phaseName: z.string().min(1, "Phase name is required"),
        displayName: z.string().min(1, "Display name is required"),
        displayOrder: z.number().min(0, "Display order must be 0 or greater"),
        isEvaluation: z.boolean(),
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
            message: "You don't have permission to update propfirm phases",
          });
        }
      }

      // Check if phase exists
      const existingPhase = await prisma.propfirmPhase.findUnique({
        where: { id: input.id },
      });

      if (!existingPhase) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Phase not found",
        });
      }

      // Check if phase name is being changed and if new name already exists
      if (input.phaseName !== existingPhase.phaseName) {
        const nameExists = await prisma.propfirmPhase.findFirst({
          where: {
            propfirmId: existingPhase.propfirmId,
            phaseName: input.phaseName,
            isActive: true,
            id: { not: input.id },
          },
        });

        if (nameExists) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A phase with this name already exists for this propfirm",
          });
        }
      }

      return await prisma.propfirmPhase.update({
        where: { id: input.id },
        data: {
          phaseName: input.phaseName,
          displayName: input.displayName,
          displayOrder: input.displayOrder,
          isEvaluation: input.isEvaluation,
          isActive: input.isActive,
        },
      });
    }),

  // Delete phase (soft delete)
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
            message: "You don't have permission to delete propfirm phases",
          });
        }
      }

      // Check if phase exists
      const existingPhase = await prisma.propfirmPhase.findUnique({
        where: { id: input.id },
      });

      if (!existingPhase) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Phase not found",
        });
      }

      // Check if phase has associated trading accounts or rules
      const hasTradingAccounts = await prisma.tradingAccount.findFirst({
        where: { currentPhaseId: input.id },
      });

      if (hasTradingAccounts) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Cannot delete phase with associated trading accounts",
        });
      }

      const hasRulesConfigurations =
        await prisma.propfirmRulesConfiguration.findFirst({
          where: { phaseId: input.id },
        });

      if (hasRulesConfigurations) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Cannot delete phase with associated rules configurations",
        });
      }

      // Soft delete by setting isActive to false
      return await prisma.propfirmPhase.update({
        where: { id: input.id },
        data: { isActive: false },
      });
    }),

  // Reorder phases
  reorder: protectedProcedure
    .input(
      z.object({
        propfirmId: z.string(),
        phaseOrders: z.array(
          z.object({
            id: z.string(),
            displayOrder: z.number(),
          })
        ),
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
            message: "You don't have permission to reorder propfirm phases",
          });
        }
      }

      // Verify all phases belong to the propfirm
      const phases = await prisma.propfirmPhase.findMany({
        where: {
          id: { in: input.phaseOrders.map((p) => p.id) },
          propfirmId: input.propfirmId,
        },
      });

      if (phases.length !== input.phaseOrders.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Some phases do not belong to this propfirm",
        });
      }

      // Update display orders in a transaction
      return await prisma.$transaction(
        input.phaseOrders.map((phaseOrder) =>
          prisma.propfirmPhase.update({
            where: { id: phaseOrder.id },
            data: { displayOrder: phaseOrder.displayOrder },
          })
        )
      );
    }),
});
