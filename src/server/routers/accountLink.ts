import { z } from "zod";
import { prisma } from "../../lib/db";
import {
  calculateOffset,
  createPaginatedResponse,
  createSearchFilter,
  createSortOrder,
  paginationInputSchema,
} from "../../lib/pagination";
import { hasPermission } from "../../services/rbacService";
import { PermissionAction, PermissionResource } from "../../types/rbac";
import { protectedProcedure, router } from "../trpc";

export const accountLinkRouter = router({
  // Get all account links for current user
  getByUser: protectedProcedure.query(async ({ ctx }) => {
    const accountLinks = await prisma.accountLink.findMany({
      where: { userId: ctx.user.id },
      include: {
        propfirmAccount: {
          include: {
            propfirm: true,
            broker: true,
          },
        },
        brokerAccount: {
          include: {
            propfirm: true,
            broker: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return accountLinks;
  }),

  // Get account links by user ID (for admin view)
  getByUserId: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Check if user has permission to view other users' data
      const canManageUsers = await hasPermission(
        ctx.user.id,
        PermissionAction.READ,
        PermissionResource.USER
      );

      if (input.userId !== ctx.user.id && !canManageUsers) {
        throw new Error(
          "No tienes permisos para ver las conexiones de este usuario"
        );
      }

      const accountLinks = await prisma.accountLink.findMany({
        where: { userId: input.userId },
        include: {
          propfirmAccount: {
            include: {
              propfirm: true,
              broker: true,
            },
          },
          brokerAccount: {
            include: {
              propfirm: true,
              broker: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return accountLinks;
    }),

  // Get all account links with pagination (for admin)
  getAll: protectedProcedure
    .input(paginationInputSchema.optional())
    .query(async ({ input, ctx }) => {
      const {
        page = 1,
        limit = 100,
        search,
        sortBy,
        sortOrder = "desc",
      } = input || {};
      const offset = calculateOffset(page, limit);

      const searchFilter = createSearchFilter(search, [
        "propfirmAccount.accountName",
        "brokerAccount.accountName",
      ]);

      // Map frontend field names to database field names
      const fieldMapping: Record<string, string> = {
        status: "isActive",
        lastActivity: "lastCopyAt",
      };

      const orderBy = createSortOrder(sortBy, sortOrder, fieldMapping);

      const [accountLinks, total] = await Promise.all([
        prisma.accountLink.findMany({
          where: {
            userId: ctx.user.id, // Only show user's own links for now
            ...searchFilter,
          },
          include: {
            propfirmAccount: {
              include: {
                propfirm: true,
                broker: true,
              },
            },
            brokerAccount: {
              include: {
                propfirm: true,
                broker: true,
              },
            },
          },
          orderBy,
          skip: offset,
          take: limit,
        }),
        prisma.accountLink.count({
          where: {
            userId: ctx.user.id,
            ...searchFilter,
          },
        }),
      ]);

      return createPaginatedResponse(accountLinks, total, page, limit);
    }),

  // Get account link by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const accountLink = await prisma.accountLink.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id, // Only allow access to user's own links
        },
        include: {
          propfirmAccount: {
            include: {
              propfirm: true,
              broker: true,
              trades: {
                orderBy: { createdAt: "desc" },
                include: {
                  symbol: true,
                },
              },
            },
          },
          brokerAccount: {
            include: {
              propfirm: true,
              broker: true,
              trades: {
                orderBy: { createdAt: "desc" },
                include: {
                  symbol: true,
                },
              },
            },
          },
        },
      });

      if (!accountLink) {
        throw new Error("Account link not found or access denied");
      }

      return accountLink;
    }),

  // Create new account link
  create: protectedProcedure
    .input(
      z.object({
        propfirmAccountId: z.string(),
        brokerAccountId: z.string(),
        autoCopyEnabled: z.boolean().default(false),
        maxRiskPerTrade: z.number().min(0.1).max(100).default(1.0),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify both accounts belong to the user
      const [propfirmAccount, brokerAccount] = await Promise.all([
        prisma.tradingAccount.findFirst({
          where: { id: input.propfirmAccountId, userId: ctx.user.id },
        }),
        prisma.tradingAccount.findFirst({
          where: { id: input.brokerAccountId, userId: ctx.user.id },
        }),
      ]);

      if (!propfirmAccount || !brokerAccount) {
        throw new Error("One or both accounts not found or access denied");
      }

      // Verify one is propfirm and other is broker
      if (
        propfirmAccount.accountType !== "PROPFIRM" ||
        brokerAccount.accountType !== "BROKER"
      ) {
        throw new Error("Invalid account types for link");
      }

      const accountLink = await prisma.accountLink.create({
        data: {
          userId: ctx.user.id,
          propfirmAccountId: input.propfirmAccountId,
          brokerAccountId: input.brokerAccountId,
          autoCopyEnabled: input.autoCopyEnabled,
          maxRiskPerTrade: input.maxRiskPerTrade,
        },
        include: {
          propfirmAccount: {
            include: { propfirm: true, broker: true },
          },
          brokerAccount: {
            include: { propfirm: true, broker: true },
          },
        },
      });

      return accountLink;
    }),

  // Update account link
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        autoCopyEnabled: z.boolean().optional(),
        maxRiskPerTrade: z.number().min(0.1).max(100).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;

      // Verify ownership
      const existingLink = await prisma.accountLink.findFirst({
        where: { id, userId: ctx.user.id },
      });

      if (!existingLink) {
        throw new Error("Account link not found or access denied");
      }

      const accountLink = await prisma.accountLink.update({
        where: { id },
        data: updateData,
        include: {
          propfirmAccount: {
            include: { propfirm: true, broker: true },
          },
          brokerAccount: {
            include: { propfirm: true, broker: true },
          },
        },
      });

      return accountLink;
    }),

  // Delete account link
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const existingLink = await prisma.accountLink.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });

      if (!existingLink) {
        throw new Error("Account link not found or access denied");
      }

      await prisma.accountLink.delete({
        where: { id: input.id },
      });

      return true;
    }),
});
