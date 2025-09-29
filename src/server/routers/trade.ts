import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../lib/db";
import {
  calculateOffset,
  createPaginatedResponse,
  createSortOrder,
  paginationInputSchema,
} from "../../lib/pagination";
import { hasPermission } from "../../services/rbacService";
import {
  ENTRY_METHOD,
  type EntryMethod,
  TRADE_STATUS,
  type TradeDirection,
  type TradeStatus,
} from "../../types/enums";
import { PermissionAction, PermissionResource } from "../../types/rbac";
import {
  entryMethodSchema,
  tradeCreateSchema,
  tradeDirectionSchema,
  tradePairCreateSchema,
  tradeStatusSchema,
  tradeUpdateSchema,
} from "../../types/validation";
import { protectedProcedure, router } from "../trpc";

export const tradeRouter = router({
  // Get all trades for current user
  getByUser: protectedProcedure.query(async ({ ctx }) => {
    const trades = await prisma.trade.findMany({
      where: {
        account: {
          userId: ctx.user.id,
        },
      },
      include: {
        account: {
          include: {
            propfirm: true,
            broker: true,
          },
        },
        symbol: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100, // Limit for performance
    });

    return trades;
  }),

  // Get trades by user ID (for admin view)
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
          "No tienes permisos para ver los trades de este usuario"
        );
      }

      const trades = await prisma.trade.findMany({
        where: {
          account: {
            userId: input.userId,
          },
        },
        include: {
          account: {
            include: {
              propfirm: true,
              broker: true,
            },
          },
          symbol: true,
        },
        orderBy: { createdAt: "desc" },
        take: 100, // Limit for performance
      });

      return trades;
    }),

  // Get all trades with pagination and filters
  getAll: protectedProcedure
    .input(
      paginationInputSchema
        .extend({
          accountId: z.string().optional(),
          symbolId: z.string().optional(),
          status: tradeStatusSchema.optional(),
          entryMethod: entryMethodSchema.optional(),
          direction: tradeDirectionSchema.optional(),
          dateFrom: z.date().optional(),
          dateTo: z.date().optional(),
        })
        .optional()
    )
    .query(async ({ input, ctx }) => {
      const {
        page = 1,
        limit = 50,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
        accountId,
        symbolId,
        status,
        entryMethod,
        direction,
        dateFrom,
        dateTo,
      } = input || {};

      const offset = calculateOffset(page, limit);

      // Build where clause
      const whereClause: Prisma.TradeWhereInput = {
        account: {
          userId: ctx.user.id,
        },
      };

      if (accountId) whereClause.accountId = accountId;
      if (symbolId) whereClause.symbolId = symbolId;
      if (status) whereClause.status = status as TradeStatus;
      if (entryMethod) whereClause.entryMethod = entryMethod as EntryMethod;
      if (direction) whereClause.direction = direction as TradeDirection;

      if (dateFrom || dateTo) {
        whereClause.createdAt = {};
        if (dateFrom) whereClause.createdAt.gte = dateFrom;
        if (dateTo) whereClause.createdAt.lte = dateTo;
      }

      // Add search filter if provided
      if (search) {
        whereClause.OR = [
          { symbol: { symbol: { contains: search, mode: "insensitive" } } },
          {
            account: { accountName: { contains: search, mode: "insensitive" } },
          },
          { externalTradeId: { contains: search, mode: "insensitive" } },
        ];
      }

      const orderBy = createSortOrder(sortBy, sortOrder);

      const [trades, total] = await Promise.all([
        prisma.trade.findMany({
          where: whereClause,
          include: {
            account: {
              include: {
                propfirm: true,
                broker: true,
              },
            },
            symbol: true,
          },
          orderBy,
          skip: offset,
          take: limit,
        }),
        prisma.trade.count({
          where: whereClause,
        }),
      ]);

      return createPaginatedResponse(trades, total, page, limit);
    }),

  // Get trade by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const trade = await prisma.trade.findFirst({
        where: {
          id: input.id,
          account: {
            userId: ctx.user.id,
          },
        },
        include: {
          account: {
            include: {
              propfirm: true,
              broker: true,
              accountTypeRef: true,
            },
          },
          symbol: true,
        },
      });

      if (!trade) {
        throw new Error("Trade not found or access denied");
      }

      return trade;
    }),

  // Create new trade
  create: protectedProcedure
    .input(tradeCreateSchema)
    .mutation(async ({ input, ctx }) => {
      // Verify account ownership
      const account = await prisma.tradingAccount.findFirst({
        where: { id: input.accountId, userId: ctx.user.id },
      });

      if (!account) {
        throw new Error("Trading account not found or access denied");
      }

      // Verify symbol exists
      const symbol = await prisma.symbol.findUnique({
        where: { id: input.symbolId },
      });

      if (!symbol) {
        throw new Error("Symbol not found");
      }

      const trade = await prisma.trade.create({
        data: input,
        include: {
          account: {
            include: {
              propfirm: true,
              broker: true,
            },
          },
          symbol: true,
        },
      });

      return trade;
    }),

  // Update trade
  update: protectedProcedure
    .input(tradeUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;

      // Verify ownership
      const existingTrade = await prisma.trade.findFirst({
        where: {
          id,
          account: {
            userId: ctx.user.id,
          },
        },
      });

      if (!existingTrade) {
        throw new Error("Trade not found or access denied");
      }

      const trade = await prisma.trade.update({
        where: { id },
        data: updateData,
        include: {
          account: {
            include: {
              propfirm: true,
              broker: true,
            },
          },
          symbol: true,
        },
      });

      return trade;
    }),

  // Delete trade
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const existingTrade = await prisma.trade.findFirst({
        where: {
          id: input.id,
          account: {
            userId: ctx.user.id,
          },
        },
      });

      if (!existingTrade) {
        throw new Error("Trade not found or access denied");
      }

      await prisma.trade.delete({
        where: { id: input.id },
      });

      return true;
    }),

  // Get trade statistics for user
  getStats: protectedProcedure
    .input(
      z
        .object({
          accountId: z.string().optional(),
          dateFrom: z.date().optional(),
          dateTo: z.date().optional(),
        })
        .optional()
    )
    .query(async ({ input, ctx }) => {
      const whereClause: Prisma.TradeWhereInput = {
        account: {
          userId: ctx.user.id,
        },
      };

      if (input?.accountId) whereClause.accountId = input.accountId;

      if (input?.dateFrom || input?.dateTo) {
        whereClause.createdAt = {};
        if (input.dateFrom) whereClause.createdAt.gte = input.dateFrom;
        if (input.dateTo) whereClause.createdAt.lte = input.dateTo;
      }

      const [totalTrades, openTrades, closedTrades, totalVolume] =
        await Promise.all([
          prisma.trade.count({
            where: whereClause,
          }),
          prisma.trade.count({
            where: { ...whereClause, status: TRADE_STATUS.OPEN },
          }),
          prisma.trade.findMany({
            where: { ...whereClause, status: TRADE_STATUS.CLOSED },
            select: { netProfit: true, direction: true, lotSize: true },
          }),
          prisma.trade.aggregate({
            where: whereClause,
            _sum: {
              lotSize: true,
              netProfit: true,
              profitLoss: true,
              commission: true,
              swap: true,
            },
          }),
        ]);

      const winningTrades = closedTrades.filter(
        (trade) => Number(trade.netProfit) > 0
      );
      const losingTrades = closedTrades.filter(
        (trade) => Number(trade.netProfit) < 0
      );
      const totalPnL = Number(totalVolume._sum.netProfit || 0);
      const totalGross = Number(totalVolume._sum.profitLoss || 0);
      const totalCommission = Number(totalVolume._sum.commission || 0);
      const totalSwap = Number(totalVolume._sum.swap || 0);

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

      // Calculate daily P&L for last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split("T")[0];
      }).reverse();

      const dailyPnL = await Promise.all(
        last7Days.map(async (date) => {
          if (!date) return { date: "", pnl: 0 };
          const startDate = new Date(date);
          const endDate = new Date(date);
          endDate.setHours(23, 59, 59, 999);

          const dayTrades = await prisma.trade.aggregate({
            where: {
              ...whereClause,
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
            _sum: { netProfit: true },
          });

          return Number(dayTrades._sum.netProfit || 0);
        })
      );

      return {
        totalTrades,
        openTrades,
        closedTrades: closedTrades.length,
        winningTrades: winningTrades.length,
        losingTrades: losingTrades.length,
        totalPnL,
        totalGross,
        totalCommission,
        totalSwap,
        winRate,
        avgWin,
        avgLoss,
        profitFactor,
        totalVolume: Number(totalVolume._sum.lotSize || 0),
        dailyPnL,
        last7Days,
      };
    }),

  // Get open trades count
  getOpenTradesCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await prisma.trade.count({
      where: {
        account: {
          userId: ctx.user.id,
        },
        status: TRADE_STATUS.OPEN,
      },
    });

    return count;
  }),

  // Create trade pair (for propfirm and broker accounts)
  createPair: protectedProcedure
    .input(tradePairCreateSchema)
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

      if (!propfirmAccount) {
        throw new Error("Propfirm account not found or access denied");
      }

      if (!brokerAccount) {
        throw new Error("Broker account not found or access denied");
      }

      // Create both trades in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create propfirm trade
        const propfirmTrade = await tx.trade.create({
          data: {
            symbolId: input.symbolId,
            direction: input.propfirmDirection,
            entryPrice: input.propfirmOpenPrice,
            exitPrice: input.propfirmClosePrice,
            lotSize: input.propfirmLotSize,
            openTime: input.openTime,
            closeTime: input.closeTime,
            netProfit: input.propfirmNetProfit,
            status: input.status,
            entryMethod: ENTRY_METHOD.MANUAL,
            accountId: input.propfirmAccountId,
          },
          include: {
            symbol: true,
            account: true,
          },
        });

        // Create broker trade
        const brokerTrade = await tx.trade.create({
          data: {
            symbolId: input.symbolId,
            direction: input.brokerDirection,
            entryPrice: input.brokerOpenPrice,
            exitPrice: input.brokerClosePrice,
            lotSize: input.brokerLotSize,
            openTime: input.openTime,
            closeTime: input.closeTime,
            netProfit: input.brokerNetProfit,
            status: input.status,
            entryMethod: ENTRY_METHOD.MANUAL,
            accountId: input.brokerAccountId,
          },
          include: {
            symbol: true,
            account: true,
          },
        });

        return { propfirmTrade, brokerTrade };
      });

      return result;
    }),
});
