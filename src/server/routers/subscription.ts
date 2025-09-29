import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../lib/db";
import { hasPermission } from "../../services/rbacService";
import { PermissionAction, PermissionResource } from "../../types/rbac";
import { protectedProcedure, router } from "../trpc";

export const subscriptionRouter = router({
  // Get current user's subscription
  getCurrentUserSubscription: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await prisma.userSubscription.findFirst({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: "desc" },
    });

    return subscription;
  }),

  // Get subscription by user ID (for admin view)
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
          "No tienes permisos para ver las suscripciones de este usuario"
        );
      }

      const subscription = await prisma.userSubscription.findFirst({
        where: { userId: input.userId },
        orderBy: { createdAt: "desc" },
      });

      return subscription;
    }),

  // Create a new subscription (simulated payment)
  createSubscription: protectedProcedure
    .input(
      z.object({
        plan: z.enum(["FREE", "BASIC", "PREMIUM", "ENTERPRISE"]),
        paymentProvider: z.enum(["STRIPE", "PAYPAL", "MERCADOPAGO", "CULQI"]),
        providerCustomerId: z.string().optional(),
        providerSubscriptionId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user already has an active subscription
      const existingSubscription = await prisma.userSubscription.findFirst({
        where: {
          userId: ctx.user.id,
          status: { in: ["ACTIVE", "TRIALING"] },
        },
      });

      if (existingSubscription) {
        throw new Error("Ya tienes una suscripción activa");
      }

      // Create new subscription
      const subscription = await prisma.userSubscription.create({
        data: {
          userId: ctx.user.id,
          plan: input.plan,
          status: "ACTIVE", // Simulated payment always succeeds
          paymentProvider: input.paymentProvider,
          providerCustomerId: input.providerCustomerId,
          providerSubscriptionId: input.providerSubscriptionId,
          currentPlanStart: new Date(),
          currentPlanEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
      });

      return subscription;
    }),

  // Update subscription status (for admin)
  updateSubscriptionStatus: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        status: z.enum([
          "TRIALING",
          "ACTIVE",
          "PAST_DUE",
          "CANCELED",
          "INCOMPLETE",
          "INCOMPLETE_EXPIRED",
          "UNPAID",
        ]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user has permission to manage subscriptions
      const canManageUsers = await hasPermission(
        ctx.user.id,
        PermissionAction.UPDATE,
        PermissionResource.USER
      );

      if (!canManageUsers) {
        throw new Error("No tienes permisos para actualizar suscripciones");
      }

      const subscription = await prisma.userSubscription.updateMany({
        where: { userId: input.userId },
        data: {
          status: input.status,
          updatedAt: new Date(),
        },
      });

      return subscription;
    }),

  // Cancel subscription
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const subscription = await prisma.userSubscription.updateMany({
      where: {
        userId: ctx.user.id,
        status: { in: ["ACTIVE", "TRIALING"] },
      },
      data: {
        status: "CANCELED",
        updatedAt: new Date(),
      },
    });

    return subscription;
  }),

  // Get all subscriptions with pagination (for admin)
  getAll: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        status: z
          .enum([
            "TRIALING",
            "ACTIVE",
            "PAST_DUE",
            "CANCELED",
            "INCOMPLETE",
            "INCOMPLETE_EXPIRED",
            "UNPAID",
          ])
          .optional(),
        plan: z.enum(["FREE", "BASIC", "PREMIUM", "ENTERPRISE"]).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      // Check if user has permission to view all subscriptions
      const canManageUsers = await hasPermission(
        ctx.user.id,
        PermissionAction.READ,
        PermissionResource.USER
      );

      if (!canManageUsers) {
        throw new Error("No tienes permisos para ver todas las suscripciones");
      }

      const { page, limit, search, status, plan } = input;
      const offset = (page - 1) * limit;

      const where: Prisma.UserSubscriptionWhereInput = {};

      if (search) {
        where.user = {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        };
      }

      if (status) {
        where.status = status;
      }

      if (plan) {
        where.plan = plan;
      }

      const [subscriptions, total] = await Promise.all([
        prisma.userSubscription.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: offset,
          take: limit,
        }),
        prisma.userSubscription.count({ where }),
      ]);

      return {
        subscriptions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }),
});
