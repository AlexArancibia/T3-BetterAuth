import { z } from "zod";
import { prisma } from "../../lib/db";
import {
  calculateOffset,
  createPaginatedResponse,
  createSearchFilter,
  createSortOrder,
  paginationInputSchema,
} from "../../lib/pagination";
import { protectedProcedure, router } from "../trpc";

export const symbolRouter = router({
  getAll: protectedProcedure
    .input(paginationInputSchema)
    .query(async ({ input }) => {
      const { page, limit, search, sortBy, sortOrder } = input;
      const offset = calculateOffset(page, limit);

      const searchFilter = createSearchFilter(search, [
        "symbol",
        "displayName",
        "baseCurrency",
        "quoteCurrency",
      ]);
      const orderBy = createSortOrder(sortBy, sortOrder);

      const [symbols, total] = await Promise.all([
        prisma.symbol.findMany({
          where: searchFilter,
          select: {
            id: true,
            symbol: true,
            displayName: true,
            category: true,
            baseCurrency: true,
            quoteCurrency: true,
            pipDecimalPosition: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy,
          skip: offset,
          take: limit,
        }),
        prisma.symbol.count({
          where: searchFilter,
        }),
      ]);

      return createPaginatedResponse(symbols, total, page, limit);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const symbol = await prisma.symbol.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          symbol: true,
          displayName: true,
          category: true,
          baseCurrency: true,
          quoteCurrency: true,
          pipDecimalPosition: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      if (!symbol) throw new Error("Símbolo no encontrado");
      return symbol;
    }),

  create: protectedProcedure
    .input(
      z.object({
        symbol: z.string().min(1, "Símbolo es requerido"),
        displayName: z
          .string()
          .min(2, "Nombre de visualización debe tener al menos 2 caracteres"),
        category: z.enum([
          "FOREX",
          "INDICES",
          "COMMODITIES",
          "CRYPTO",
          "STOCKS",
        ]),
        baseCurrency: z
          .string()
          .min(3, "Moneda base debe tener 3 caracteres")
          .max(3),
        quoteCurrency: z
          .string()
          .min(3, "Moneda cotizada debe tener 3 caracteres")
          .max(3),
        pipDecimalPosition: z.number().min(0).max(8).default(4),
      })
    )
    .mutation(async ({ input }) => {
      const exists = await prisma.symbol.findUnique({
        where: { symbol: input.symbol },
      });
      if (exists) throw new Error("Ya existe un símbolo con este nombre");

      const symbol = await prisma.symbol.create({
        data: {
          symbol: input.symbol,
          displayName: input.displayName,
          category: input.category,
          baseCurrency: input.baseCurrency,
          quoteCurrency: input.quoteCurrency,
          pipDecimalPosition: input.pipDecimalPosition,
          isActive: true,
        },
        select: {
          id: true,
          symbol: true,
          displayName: true,
          category: true,
          baseCurrency: true,
          quoteCurrency: true,
          pipDecimalPosition: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return symbol;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        symbol: z.string().min(1, "Símbolo es requerido"),
        displayName: z
          .string()
          .min(2, "Nombre de visualización debe tener al menos 2 caracteres"),
        category: z.enum([
          "FOREX",
          "INDICES",
          "COMMODITIES",
          "CRYPTO",
          "STOCKS",
        ]),
        baseCurrency: z
          .string()
          .min(3, "Moneda base debe tener 3 caracteres")
          .max(3),
        quoteCurrency: z
          .string()
          .min(3, "Moneda cotizada debe tener 3 caracteres")
          .max(3),
        pipDecimalPosition: z.number().min(0).max(8),
      })
    )
    .mutation(async ({ input }) => {
      const symbol = await prisma.symbol.findUnique({
        where: { id: input.id },
      });
      if (!symbol) throw new Error("Símbolo no encontrado");

      // Check if symbol name is already taken by another symbol
      if (input.symbol !== symbol.symbol) {
        const existingSymbol = await prisma.symbol.findUnique({
          where: { symbol: input.symbol },
        });
        if (existingSymbol)
          throw new Error("Ya existe un símbolo con este nombre");
      }

      const updated = await prisma.symbol.update({
        where: { id: input.id },
        data: {
          symbol: input.symbol,
          displayName: input.displayName,
          category: input.category,
          baseCurrency: input.baseCurrency,
          quoteCurrency: input.quoteCurrency,
          pipDecimalPosition: input.pipDecimalPosition,
        },
        select: {
          id: true,
          symbol: true,
          displayName: true,
          category: true,
          baseCurrency: true,
          quoteCurrency: true,
          pipDecimalPosition: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const symbol = await prisma.symbol.findUnique({
        where: { id: input.id },
      });
      if (!symbol) throw new Error("Símbolo no encontrado");

      await prisma.symbol.delete({ where: { id: input.id } });
      return true;
    }),

  toggleActive: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const symbol = await prisma.symbol.findUnique({
        where: { id: input.id },
      });
      if (!symbol) throw new Error("Símbolo no encontrado");

      const updated = await prisma.symbol.update({
        where: { id: input.id },
        data: { isActive: !symbol.isActive },
        select: {
          id: true,
          symbol: true,
          displayName: true,
          category: true,
          baseCurrency: true,
          quoteCurrency: true,
          pipDecimalPosition: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return updated;
    }),
});
