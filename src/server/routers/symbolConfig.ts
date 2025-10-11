import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../lib/db";
import {
  calculateOffset,
  createPaginatedResponse,
  createSortOrder,
  paginationInputSchema,
} from "../../lib/pagination";
import { protectedProcedure, router } from "../trpc";

export const symbolConfigRouter = router({
  getAll: protectedProcedure
    .input(paginationInputSchema)
    .query(async ({ input }) => {
      const { page, limit, search, sortBy, sortOrder } = input;
      const offset = calculateOffset(page, limit);

      // Para search en configuraciones de símbolos, necesitamos buscar en campos relacionados
      const searchConditions = search
        ? {
            OR: [
              {
                symbol: {
                  symbol: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              },
              {
                symbol: {
                  displayName: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              },
              {
                propfirm: {
                  displayName: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              },
              {
                broker: {
                  displayName: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              },
            ],
          }
        : ({} as const);

      const orderBy = createSortOrder(sortBy, sortOrder);

      const [configs, total] = await Promise.all([
        prisma.symbolConfiguration.findMany({
          where: searchConditions,
          select: {
            id: true,
            propfirmId: true,
            brokerId: true,
            symbolId: true,
            commissionPerLot: true,
            pipValuePerLot: true,
            pipTicks: true,
            spreadTypical: true,
            spreadRecommended: true,
            isAvailable: true,
            createdAt: true,
            updatedAt: true,
            propfirm: {
              select: {
                name: true,
                displayName: true,
              },
            },
            broker: {
              select: {
                name: true,
                displayName: true,
              },
            },
            symbol: {
              select: {
                symbol: true,
                displayName: true,
                category: true,
              },
            },
          },
          orderBy,
          skip: offset,
          take: limit,
        }),
        prisma.symbolConfiguration.count({
          where: searchConditions,
        }),
      ]);

      return createPaginatedResponse(configs, total, page, limit);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const config = await prisma.symbolConfiguration.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          propfirmId: true,
          brokerId: true,
          symbolId: true,
          commissionPerLot: true,
          pipValuePerLot: true,
          pipTicks: true,
          spreadTypical: true,
          spreadRecommended: true,
          isAvailable: true,
          createdAt: true,
          updatedAt: true,
          propfirm: {
            select: {
              name: true,
              displayName: true,
            },
          },
          broker: {
            select: {
              name: true,
              displayName: true,
            },
          },
          symbol: {
            select: {
              symbol: true,
              displayName: true,
              category: true,
            },
          },
        },
      });
      if (!config) throw new Error("Configuración no encontrada");
      return config;
    }),

  create: protectedProcedure
    .input(
      z.object({
        propfirmId: z.string().optional(),
        brokerId: z.string().optional(),
        symbolId: z.string().min(1, "Símbolo es requerido"),
        commissionPerLot: z.number().min(0).optional(),
        pipValuePerLot: z.number().min(0),
        pipTicks: z.number().min(1).default(1),
        spreadTypical: z.number().min(0).optional(),
        spreadRecommended: z.number().min(0).optional(),
        isAvailable: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      // Validate that at least one of propfirmId or brokerId is provided
      if (!input.propfirmId && !input.brokerId) {
        throw new Error("Debe especificar al menos un propfirm o broker");
      }

      // Check if symbol exists
      const symbol = await prisma.symbol.findUnique({
        where: { id: input.symbolId },
      });
      if (!symbol) throw new Error("Símbolo no encontrado");

      // Check if propfirm exists (if provided)
      if (input.propfirmId) {
        const propfirm = await prisma.propfirm.findUnique({
          where: { id: input.propfirmId },
        });
        if (!propfirm) throw new Error("Propfirm no encontrado");
      }

      // Check if broker exists (if provided)
      if (input.brokerId) {
        const broker = await prisma.broker.findUnique({
          where: { id: input.brokerId },
        });
        if (!broker) throw new Error("Broker no encontrado");
      }

      // Check for duplicate configuration
      const existingConfig = await prisma.symbolConfiguration.findFirst({
        where: {
          symbolId: input.symbolId,
          propfirmId: input.propfirmId || null,
          brokerId: input.brokerId || null,
        },
      });
      if (existingConfig) {
        throw new Error(
          "Ya existe una configuración para esta combinación de símbolo, propfirm y broker"
        );
      }

      const config = await prisma.symbolConfiguration.create({
        data: {
          propfirmId: input.propfirmId || null,
          brokerId: input.brokerId || null,
          symbolId: input.symbolId,
          commissionPerLot: input.commissionPerLot || null,
          pipValuePerLot: input.pipValuePerLot,
          pipTicks: input.pipTicks,
          spreadTypical: input.spreadTypical || null,
          spreadRecommended: input.spreadRecommended || null,
          isAvailable: input.isAvailable,
        },
        select: {
          id: true,
          propfirmId: true,
          brokerId: true,
          symbolId: true,
          commissionPerLot: true,
          pipValuePerLot: true,
          pipTicks: true,
          spreadTypical: true,
          spreadRecommended: true,
          isAvailable: true,
          createdAt: true,
          updatedAt: true,
          propfirm: {
            select: {
              name: true,
              displayName: true,
            },
          },
          broker: {
            select: {
              name: true,
              displayName: true,
            },
          },
          symbol: {
            select: {
              symbol: true,
              displayName: true,
              category: true,
            },
          },
        },
      });
      return config;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        propfirmId: z.string().optional(),
        brokerId: z.string().optional(),
        symbolId: z.string().min(1, "Símbolo es requerido"),
        commissionPerLot: z.number().min(0).optional(),
        pipValuePerLot: z.number().min(0),
        pipTicks: z.number().min(1),
        spreadTypical: z.number().min(0).optional(),
        spreadRecommended: z.number().min(0).optional(),
        isAvailable: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const config = await prisma.symbolConfiguration.findUnique({
        where: { id: input.id },
        include: {
          propfirm: true,
          broker: true,
          symbol: true,
        },
      });
      if (!config) throw new Error("Configuración no encontrada");

      // Validate that at least one of propfirmId or brokerId is provided
      if (!input.propfirmId && !input.brokerId) {
        throw new Error("Debe especificar al menos un propfirm o broker");
      }

      // Check if symbol exists
      const symbol = await prisma.symbol.findUnique({
        where: { id: input.symbolId },
      });
      if (!symbol) throw new Error("Símbolo no encontrado");

      // Check if propfirm exists (if provided)
      if (input.propfirmId) {
        const propfirm = await prisma.propfirm.findUnique({
          where: { id: input.propfirmId },
        });
        if (!propfirm) throw new Error("Propfirm no encontrado");
      }

      // Check if broker exists (if provided)
      if (input.brokerId) {
        const broker = await prisma.broker.findUnique({
          where: { id: input.brokerId },
        });
        if (!broker) throw new Error("Broker no encontrado");
      }

      // Check for duplicate configuration (excluding current one)
      const existingConfig = await prisma.symbolConfiguration.findFirst({
        where: {
          symbolId: input.symbolId,
          propfirmId: input.propfirmId || null,
          brokerId: input.brokerId || null,
          id: { not: input.id },
        },
      });
      if (existingConfig) {
        throw new Error(
          "Ya existe una configuración para esta combinación de símbolo, propfirm y broker"
        );
      }

      const updated = await prisma.symbolConfiguration.update({
        where: { id: input.id },
        data: {
          propfirmId: input.propfirmId || null,
          brokerId: input.brokerId || null,
          symbolId: input.symbolId,
          commissionPerLot: input.commissionPerLot || null,
          pipValuePerLot: input.pipValuePerLot,
          pipTicks: input.pipTicks,
          spreadTypical: input.spreadTypical || null,
          spreadRecommended: input.spreadRecommended || null,
          isAvailable: input.isAvailable,
        },
        select: {
          id: true,
          propfirmId: true,
          brokerId: true,
          symbolId: true,
          commissionPerLot: true,
          pipValuePerLot: true,
          pipTicks: true,
          spreadTypical: true,
          spreadRecommended: true,
          isAvailable: true,
          createdAt: true,
          updatedAt: true,
          propfirm: {
            select: {
              name: true,
              displayName: true,
            },
          },
          broker: {
            select: {
              name: true,
              displayName: true,
            },
          },
          symbol: {
            select: {
              symbol: true,
              displayName: true,
              category: true,
            },
          },
        },
      });
      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const config = await prisma.symbolConfiguration.findUnique({
        where: { id: input.id },
      });
      if (!config) throw new Error("Configuración no encontrada");

      await prisma.symbolConfiguration.delete({ where: { id: input.id } });
      return true;
    }),

  toggleAvailable: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const config = await prisma.symbolConfiguration.findUnique({
        where: { id: input.id },
      });
      if (!config) throw new Error("Configuración no encontrada");

      const updated = await prisma.symbolConfiguration.update({
        where: { id: input.id },
        data: { isAvailable: !config.isAvailable },
        select: {
          id: true,
          propfirmId: true,
          brokerId: true,
          symbolId: true,
          commissionPerLot: true,
          pipValuePerLot: true,
          pipTicks: true,
          spreadTypical: true,
          spreadRecommended: true,
          isAvailable: true,
          createdAt: true,
          updatedAt: true,
          propfirm: {
            select: {
              name: true,
              displayName: true,
            },
          },
          broker: {
            select: {
              name: true,
              displayName: true,
            },
          },
          symbol: {
            select: {
              symbol: true,
              displayName: true,
              category: true,
            },
          },
        },
      });
      return updated;
    }),

  // Get symbol configurations for a specific trading account
  getByTradingAccount: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        category: z
          .enum(["FOREX", "INDICES", "COMMODITIES", "CRYPTO", "STOCKS"])
          .optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      // Verify account ownership
      const tradingAccount = await prisma.tradingAccount.findFirst({
        where: {
          id: input.accountId,
          userId: ctx.user.id,
        },
        include: {
          propfirm: true,
          broker: true,
        },
      });

      if (!tradingAccount) {
        throw new Error("Trading account not found or access denied");
      }

      // Build where condition based on account type
      const whereCondition: Prisma.SymbolConfigurationWhereInput = {
        isAvailable: true,
      };

      // Add category filter if provided
      if (input.category) {
        whereCondition.symbol = {
          category: input.category,
        };
      }

      // Filter by propfirm or broker based on account type
      if (
        tradingAccount.accountType === "PROPFIRM" &&
        tradingAccount.propfirmId
      ) {
        whereCondition.propfirmId = tradingAccount.propfirmId;
      } else if (
        tradingAccount.accountType === "BROKER" &&
        tradingAccount.brokerId
      ) {
        whereCondition.brokerId = tradingAccount.brokerId;
      }

      const configs = await prisma.symbolConfiguration.findMany({
        where: whereCondition,
        select: {
          id: true,
          propfirmId: true,
          brokerId: true,
          symbolId: true,
          commissionPerLot: true,
          pipValuePerLot: true,
          pipTicks: true,
          spreadTypical: true,
          spreadRecommended: true,
          isAvailable: true,
          createdAt: true,
          updatedAt: true,
          propfirm: {
            select: {
              name: true,
              displayName: true,
            },
          },
          broker: {
            select: {
              name: true,
              displayName: true,
            },
          },
          symbol: {
            select: {
              symbol: true,
              displayName: true,
              category: true,
              baseCurrency: true,
              quoteCurrency: true,
              pipDecimalPosition: true,
            },
          },
        },
        orderBy: [
          { symbol: { category: "asc" } },
          { symbol: { symbol: "asc" } },
        ],
      });

      return {
        tradingAccount: {
          id: tradingAccount.id,
          accountName: tradingAccount.accountName,
          accountType: tradingAccount.accountType,
          propfirm: tradingAccount.propfirm,
          broker: tradingAccount.broker,
        },
        symbolConfigurations: configs,
      };
    }),

  // Get symbol configurations for both propfirm and broker in a connection
  getByConnection: protectedProcedure
    .input(
      z.object({
        propfirmId: z.string().optional(),
        brokerId: z.string().optional(),
        category: z
          .enum(["FOREX", "INDICES", "COMMODITIES", "CRYPTO", "STOCKS"])
          .optional(),
      })
    )
    .query(async ({ input }) => {
      const { propfirmId, brokerId, category } = input;

      // Build where conditions for both propfirm and broker
      const baseWhereCondition: Prisma.SymbolConfigurationWhereInput = {
        isAvailable: true,
      };

      // Add category filter if provided
      if (category) {
        baseWhereCondition.symbol = {
          category: category,
        };
      }

      // Get propfirm configurations
      const propfirmConfigs = propfirmId
        ? await prisma.symbolConfiguration.findMany({
            where: {
              ...baseWhereCondition,
              propfirmId: propfirmId,
            },
            select: {
              id: true,
              propfirmId: true,
              brokerId: true,
              symbolId: true,
              commissionPerLot: true,
              pipValuePerLot: true,
              pipTicks: true,
              spreadTypical: true,
              spreadRecommended: true,
              isAvailable: true,
              createdAt: true,
              updatedAt: true,
              propfirm: {
                select: {
                  name: true,
                  displayName: true,
                },
              },
              broker: {
                select: {
                  name: true,
                  displayName: true,
                },
              },
              symbol: {
                select: {
                  symbol: true,
                  displayName: true,
                  category: true,
                  baseCurrency: true,
                  quoteCurrency: true,
                  pipDecimalPosition: true,
                },
              },
            },
            orderBy: [
              { symbol: { category: "asc" } },
              { symbol: { symbol: "asc" } },
            ],
          })
        : [];

      // Get broker configurations
      const brokerConfigs = brokerId
        ? await prisma.symbolConfiguration.findMany({
            where: {
              ...baseWhereCondition,
              brokerId: brokerId,
            },
            select: {
              id: true,
              propfirmId: true,
              brokerId: true,
              symbolId: true,
              commissionPerLot: true,
              pipValuePerLot: true,
              pipTicks: true,
              spreadTypical: true,
              spreadRecommended: true,
              isAvailable: true,
              createdAt: true,
              updatedAt: true,
              propfirm: {
                select: {
                  name: true,
                  displayName: true,
                },
              },
              broker: {
                select: {
                  name: true,
                  displayName: true,
                },
              },
              symbol: {
                select: {
                  symbol: true,
                  displayName: true,
                  category: true,
                  baseCurrency: true,
                  quoteCurrency: true,
                  pipDecimalPosition: true,
                },
              },
            },
            orderBy: [
              { symbol: { category: "asc" } },
              { symbol: { symbol: "asc" } },
            ],
          })
        : [];

      return {
        propfirmConfigurations: propfirmConfigs,
        brokerConfigurations: brokerConfigs,
      };
    }),
});
