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

export const brokerRouter = router({
  getAll: protectedProcedure
    .input(paginationInputSchema)
    .query(async ({ input }) => {
      const { page, limit, search, sortBy, sortOrder } = input;
      const offset = calculateOffset(page, limit);

      const searchFilter = createSearchFilter(search, [
        "name",
        "displayName",
        "description",
      ]);
      const orderBy = createSortOrder(sortBy, sortOrder);

      const [brokers, total] = await Promise.all([
        prisma.broker.findMany({
          where: searchFilter,
          select: {
            id: true,
            name: true,
            displayName: true,
            description: true,
            website: true,
            logoUrl: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy,
          skip: offset,
          take: limit,
        }),
        prisma.broker.count({
          where: searchFilter,
        }),
      ]);

      return createPaginatedResponse(brokers, total, page, limit);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const broker = await prisma.broker.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          name: true,
          displayName: true,
          description: true,
          website: true,
          logoUrl: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      if (!broker) throw new Error("Broker no encontrado");
      return broker;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
        displayName: z
          .string()
          .min(2, "Nombre de visualización debe tener al menos 2 caracteres"),
        description: z.string().optional(),
        website: z.string().url("URL inválida").optional().or(z.literal("")),
        logoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
      })
    )
    .mutation(async ({ input }) => {
      const exists = await prisma.broker.findUnique({
        where: { name: input.name },
      });
      if (exists) throw new Error("Ya existe un broker con este nombre");

      const broker = await prisma.broker.create({
        data: {
          name: input.name,
          displayName: input.displayName,
          description: input.description || null,
          website: input.website || null,
          logoUrl: input.logoUrl || null,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          displayName: true,
          description: true,
          website: true,
          logoUrl: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return broker;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
        displayName: z
          .string()
          .min(2, "Nombre de visualización debe tener al menos 2 caracteres"),
        description: z.string().optional(),
        website: z.string().url("URL inválida").optional().or(z.literal("")),
        logoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
      })
    )
    .mutation(async ({ input }) => {
      const broker = await prisma.broker.findUnique({
        where: { id: input.id },
      });
      if (!broker) throw new Error("Broker no encontrado");

      // Check if name is already taken by another broker
      if (input.name !== broker.name) {
        const existingBroker = await prisma.broker.findUnique({
          where: { name: input.name },
        });
        if (existingBroker)
          throw new Error("Ya existe un broker con este nombre");
      }

      const updated = await prisma.broker.update({
        where: { id: input.id },
        data: {
          name: input.name,
          displayName: input.displayName,
          description: input.description || null,
          website: input.website || null,
          logoUrl: input.logoUrl || null,
        },
        select: {
          id: true,
          name: true,
          displayName: true,
          description: true,
          website: true,
          logoUrl: true,
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
      const broker = await prisma.broker.findUnique({
        where: { id: input.id },
      });
      if (!broker) throw new Error("Broker no encontrado");

      await prisma.broker.delete({ where: { id: input.id } });
      return true;
    }),

  toggleActive: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const broker = await prisma.broker.findUnique({
        where: { id: input.id },
      });
      if (!broker) throw new Error("Broker no encontrado");

      const updated = await prisma.broker.update({
        where: { id: input.id },
        data: { isActive: !broker.isActive },
        select: {
          id: true,
          name: true,
          displayName: true,
          description: true,
          website: true,
          logoUrl: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return updated;
    }),
});
