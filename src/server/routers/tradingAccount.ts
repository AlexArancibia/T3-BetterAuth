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

export const tradingAccountRouter = router({
  // Get all trading accounts for current user
  getByUser: protectedProcedure.query(async ({ ctx }) => {
    const tradingAccounts = await prisma.tradingAccount.findMany({
      where: { userId: ctx.user.id },
      include: {
        propfirm: true,
        broker: true,
        accountTypeRef: true,
        currentPhase: true,
        trades: {
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            symbol: true,
          },
        },
        _count: {
          select: {
            trades: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return tradingAccounts;
  }),

  // Get trading accounts by user ID (for admin view)
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
          "No tienes permisos para ver las cuentas de este usuario"
        );
      }

      const tradingAccounts = await prisma.tradingAccount.findMany({
        where: { userId: input.userId },
        include: {
          propfirm: true,
          broker: true,
          accountTypeRef: true,
          currentPhase: true,
          trades: {
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
              symbol: true,
            },
          },
          _count: {
            select: {
              trades: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return tradingAccounts;
    }),

  // Get all trading accounts with pagination
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
        "accountName",
        "accountNumber",
      ]);

      // Map frontend field names to database field names
      const fieldMapping: Record<string, string> = {
        lastActivity: "updatedAt",
      };

      const orderBy = createSortOrder(sortBy, sortOrder, fieldMapping);

      const [tradingAccounts, total] = await Promise.all([
        prisma.tradingAccount.findMany({
          where: {
            userId: ctx.user.id,
            ...searchFilter,
          },
          include: {
            propfirm: true,
            broker: true,
            accountTypeRef: true,
            currentPhase: true,
            trades: {
              select: {
                netProfit: true,
                status: true,
              },
            },
            _count: {
              select: {
                trades: true,
              },
            },
          },
          orderBy,
          skip: offset,
          take: limit,
        }),
        prisma.tradingAccount.count({
          where: {
            userId: ctx.user.id,
            ...searchFilter,
          },
        }),
      ]);

      return createPaginatedResponse(tradingAccounts, total, page, limit);
    }),

  // Get trading account by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const tradingAccount = await prisma.tradingAccount.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
        include: {
          propfirm: true,
          broker: true,
          accountTypeRef: true,
          currentPhase: true,
          trades: {
            take: 20,
            orderBy: { createdAt: "desc" },
            include: {
              symbol: true,
            },
          },
          propfirmLinks: {
            include: {
              brokerAccount: {
                include: {
                  broker: true,
                },
              },
            },
          },
          brokerLinks: {
            include: {
              propfirmAccount: {
                include: {
                  propfirm: true,
                },
              },
            },
          },
          _count: {
            select: {
              trades: true,
            },
          },
        },
      });

      if (!tradingAccount) {
        throw new Error("Trading account not found or access denied");
      }

      return tradingAccount;
    }),

  // Create new trading account
  create: protectedProcedure
    .input(
      z.object({
        accountName: z.string().min(1),
        accountType: z.enum(["PROPFIRM", "BROKER"]),
        accountNumber: z.string().optional(),
        server: z.string().optional(),
        propfirmId: z.string().optional(),
        brokerId: z.string().optional(),
        accountTypeId: z.string().optional(),
        initialBalance: z.number().positive(),
        currentBalance: z.number().optional(),
        equity: z.number().optional(),
        accountCost: z.number().positive().optional(),
        currentPhaseId: z.string().optional(),
        status: z.string().default("active"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Validate account type constraints
      if (input.accountType === "PROPFIRM" && !input.propfirmId) {
        throw new Error("Propfirm ID is required for propfirm accounts");
      }
      if (input.accountType === "BROKER" && !input.brokerId) {
        throw new Error("Broker ID is required for broker accounts");
      }

      const tradingAccount = await prisma.tradingAccount.create({
        data: {
          userId: ctx.user.id,
          accountName: input.accountName,
          accountType: input.accountType,
          accountNumber: input.accountNumber,
          server: input.server,
          propfirmId: input.propfirmId,
          brokerId: input.brokerId,
          accountTypeId: input.accountTypeId,
          initialBalance: input.initialBalance,
          currentBalance: input.currentBalance || input.initialBalance,
          equity: input.equity || input.initialBalance,
          accountCost: input.accountCost,
          currentPhaseId: input.currentPhaseId,
          status: input.status,
        },
        include: {
          propfirm: true,
          broker: true,
          accountTypeRef: true,
          currentPhase: true,
        },
      });

      return tradingAccount;
    }),

  // Update trading account
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        accountName: z.string().min(1).optional(),
        accountNumber: z.string().optional(),
        server: z.string().optional(),
        currentBalance: z.number().optional(),
        equity: z.number().optional(),
        accountCost: z.number().positive().optional(),
        currentPhaseId: z.string().optional(),
        status: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;

      // Verify ownership
      const existingAccount = await prisma.tradingAccount.findFirst({
        where: { id, userId: ctx.user.id },
      });

      if (!existingAccount) {
        throw new Error("Trading account not found or access denied");
      }

      const tradingAccount = await prisma.tradingAccount.update({
        where: { id },
        data: updateData,
        include: {
          propfirm: true,
          broker: true,
          accountTypeRef: true,
          currentPhase: true,
        },
      });

      return tradingAccount;
    }),

  // Delete trading account
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const existingAccount = await prisma.tradingAccount.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });

      if (!existingAccount) {
        throw new Error("Trading account not found or access denied");
      }

      // Check if account has any active links
      const activeLinks = await prisma.accountLink.count({
        where: {
          OR: [{ propfirmAccountId: input.id }, { brokerAccountId: input.id }],
          isActive: true,
        },
      });

      if (activeLinks > 0) {
        throw new Error(
          "Cannot delete account with active links. Please remove all links first."
        );
      }

      await prisma.tradingAccount.delete({
        where: { id: input.id },
      });

      return true;
    }),

  // Get account statistics
  getStats: protectedProcedure
    .input(z.object({ accountId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Verify ownership
      const account = await prisma.tradingAccount.findFirst({
        where: { id: input.accountId, userId: ctx.user.id },
      });

      if (!account) {
        throw new Error("Trading account not found or access denied");
      }

      const [totalTrades, openTrades, closedTrades, totalVolume] =
        await Promise.all([
          prisma.trade.count({
            where: { accountId: input.accountId },
          }),
          prisma.trade.count({
            where: { accountId: input.accountId, status: "OPEN" },
          }),
          prisma.trade.findMany({
            where: { accountId: input.accountId, status: "CLOSED" },
            select: { netProfit: true },
          }),
          prisma.trade.aggregate({
            where: { accountId: input.accountId },
            _sum: { lotSize: true },
          }),
        ]);

      const winningTrades = closedTrades.filter(
        (trade) => Number(trade.netProfit) > 0
      );
      const losingTrades = closedTrades.filter(
        (trade) => Number(trade.netProfit) < 0
      );
      const totalPnL = closedTrades.reduce(
        (sum, trade) => sum + Number(trade.netProfit),
        0
      );
      const winRate =
        closedTrades.length > 0
          ? (winningTrades.length / closedTrades.length) * 100
          : 0;
      const avgWin =
        winningTrades.length > 0
          ? winningTrades.reduce(
              (sum, trade) => sum + Number(trade.netProfit),
              0
            ) / winningTrades.length
          : 0;
      const avgLoss =
        losingTrades.length > 0
          ? Math.abs(
              losingTrades.reduce(
                (sum, trade) => sum + Number(trade.netProfit),
                0
              ) / losingTrades.length
            )
          : 0;
      const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;

      return {
        totalTrades,
        openTrades,
        closedTrades: closedTrades.length,
        winningTrades: winningTrades.length,
        losingTrades: losingTrades.length,
        totalPnL,
        winRate,
        avgWin,
        avgLoss,
        profitFactor,
        totalVolume: Number(totalVolume._sum.lotSize || 0),
        currentBalance: Number(account.currentBalance),
        equity: Number(account.equity),
        initialBalance: Number(account.initialBalance),
        return: (totalPnL / Number(account.initialBalance)) * 100,
      };
    }),
});
