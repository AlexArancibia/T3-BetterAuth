import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../lib/db";
import { hasPermission } from "../../services/rbacService";
import { PermissionAction, PermissionResource } from "../../types/rbac";
import { protectedProcedure, router } from "../trpc";

export const paymentRouter = router({
  // Get payments by user ID
  getByUserId: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        status: z
          .enum([
            "PENDING",
            "PROCESSING",
            "COMPLETED",
            "FAILED",
            "CANCELLED",
            "REFUNDED",
            "PARTIALLY_REFUNDED",
          ])
          .optional(),
        paymentProvider: z
          .enum(["STRIPE", "PAYPAL", "MERCADOPAGO", "CULQI"])
          .optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      // Check if user has permission to view other users' payments
      const canManageUsers = await hasPermission(
        ctx.user.id,
        PermissionAction.READ,
        PermissionResource.USER
      );

      if (input.userId !== ctx.user.id && !canManageUsers) {
        throw new Error(
          "No tienes permisos para ver los pagos de este usuario"
        );
      }

      const { page, limit, status, paymentProvider } = input;
      const offset = (page - 1) * limit;

      const where: Prisma.UserPaymentWhereInput = {
        userId: input.userId,
      };

      if (status) {
        where.status = status;
      }

      if (paymentProvider) {
        where.paymentProvider = paymentProvider;
      }

      const [payments, total] = await Promise.all([
        prisma.userPayment.findMany({
          where,
          include: {
            subscription: {
              select: {
                id: true,
                plan: true,
                status: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: offset,
          take: limit,
        }),
        prisma.userPayment.count({ where }),
      ]);

      return {
        payments,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }),

  // Get payment by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const payment = await prisma.userPayment.findUnique({
        where: { id: input.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          subscription: {
            select: {
              id: true,
              plan: true,
              status: true,
            },
          },
        },
      });

      if (!payment) {
        throw new Error("Pago no encontrado");
      }

      // Check if user has permission to view this payment
      const canManageUsers = await hasPermission(
        ctx.user.id,
        PermissionAction.READ,
        PermissionResource.USER
      );

      if (payment.userId !== ctx.user.id && !canManageUsers) {
        throw new Error("No tienes permisos para ver este pago");
      }

      return payment;
    }),

  // Create a new payment
  create: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        subscriptionId: z.string(),
        paymentProvider: z.enum(["STRIPE", "PAYPAL", "MERCADOPAGO", "CULQI"]),
        amount: z.number().positive(),
        currency: z.string().default("USD"),
        paymentMethod: z.string().optional(),
        description: z.string().optional(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user has permission to create payments for other users
      const canManageUsers = await hasPermission(
        ctx.user.id,
        PermissionAction.MANAGE,
        PermissionResource.USER
      );

      if (input.userId !== ctx.user.id && !canManageUsers) {
        throw new Error(
          "No tienes permisos para crear pagos para este usuario"
        );
      }

      // Verify subscription exists and belongs to user
      const subscription = await prisma.userSubscription.findFirst({
        where: {
          id: input.subscriptionId,
          userId: input.userId,
        },
      });

      if (!subscription) {
        throw new Error("Suscripción no encontrada o no pertenece al usuario");
      }

      const payment = await prisma.userPayment.create({
        data: {
          userId: input.userId,
          subscriptionId: input.subscriptionId,
          paymentProvider: input.paymentProvider,
          amount: input.amount,
          currency: input.currency,
          paymentMethod: input.paymentMethod,
          description: input.description,
          metadata: input.metadata,
          status: "PENDING",
        },
        include: {
          subscription: {
            select: {
              id: true,
              plan: true,
              status: true,
            },
          },
        },
      });

      return payment;
    }),

  // Update payment status
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum([
          "PENDING",
          "PROCESSING",
          "COMPLETED",
          "FAILED",
          "CANCELLED",
          "REFUNDED",
          "PARTIALLY_REFUNDED",
        ]),
        providerPaymentId: z.string().optional(),
        paidAt: z.date().optional(),
        failedAt: z.date().optional(),
        refundedAt: z.date().optional(),
        refundAmount: z.number().optional(),
        refundReason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user has permission to update payments
      const canManageUsers = await hasPermission(
        ctx.user.id,
        PermissionAction.MANAGE,
        PermissionResource.USER
      );

      const payment = await prisma.userPayment.findUnique({
        where: { id: input.id },
        include: {
          user: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!payment) {
        throw new Error("Pago no encontrado");
      }

      if (payment.userId !== ctx.user.id && !canManageUsers) {
        throw new Error("No tienes permisos para actualizar este pago");
      }

      const updateData: Prisma.UserPaymentUpdateInput = {
        status: input.status,
      };

      if (input.providerPaymentId) {
        updateData.providerPaymentId = input.providerPaymentId;
      }

      if (input.paidAt) {
        updateData.paidAt = input.paidAt;
      }

      if (input.failedAt) {
        updateData.failedAt = input.failedAt;
      }

      if (input.refundedAt) {
        updateData.refundedAt = input.refundedAt;
      }

      if (input.refundAmount !== undefined) {
        updateData.refundAmount = input.refundAmount;
      }

      if (input.refundReason) {
        updateData.refundReason = input.refundReason;
      }

      const updatedPayment = await prisma.userPayment.update({
        where: { id: input.id },
        data: updateData,
        include: {
          subscription: {
            select: {
              id: true,
              plan: true,
              status: true,
            },
          },
        },
      });

      return updatedPayment;
    }),

  // Get payment statistics for a user
  getStats: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Check if user has permission to view other users' payment stats
      const canManageUsers = await hasPermission(
        ctx.user.id,
        PermissionAction.READ,
        PermissionResource.USER
      );

      if (input.userId !== ctx.user.id && !canManageUsers) {
        throw new Error(
          "No tienes permisos para ver las estadísticas de pagos de este usuario"
        );
      }

      const [
        totalPayments,
        completedPayments,
        failedPayments,
        totalAmount,
        completedAmount,
        lastPayment,
      ] = await Promise.all([
        prisma.userPayment.count({
          where: { userId: input.userId },
        }),
        prisma.userPayment.count({
          where: {
            userId: input.userId,
            status: "COMPLETED",
          },
        }),
        prisma.userPayment.count({
          where: {
            userId: input.userId,
            status: "FAILED",
          },
        }),
        prisma.userPayment.aggregate({
          where: { userId: input.userId },
          _sum: { amount: true },
        }),
        prisma.userPayment.aggregate({
          where: {
            userId: input.userId,
            status: "COMPLETED",
          },
          _sum: { amount: true },
        }),
        prisma.userPayment.findFirst({
          where: { userId: input.userId },
          orderBy: { createdAt: "desc" },
          include: {
            subscription: {
              select: {
                plan: true,
              },
            },
          },
        }),
      ]);

      return {
        totalPayments,
        completedPayments,
        failedPayments,
        totalAmount: totalAmount._sum.amount || 0,
        completedAmount: completedAmount._sum.amount || 0,
        lastPayment,
        successRate:
          totalPayments > 0 ? (completedPayments / totalPayments) * 100 : 0,
      };
    }),

  // Get all payments with pagination (admin only)
  getAll: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        status: z
          .enum([
            "PENDING",
            "PROCESSING",
            "COMPLETED",
            "FAILED",
            "CANCELLED",
            "REFUNDED",
            "PARTIALLY_REFUNDED",
          ])
          .optional(),
        paymentProvider: z
          .enum(["STRIPE", "PAYPAL", "MERCADOPAGO", "CULQI"])
          .optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      // Check if user has permission to view all payments
      const canManageUsers = await hasPermission(
        ctx.user.id,
        PermissionAction.READ,
        PermissionResource.USER
      );

      if (!canManageUsers) {
        throw new Error("No tienes permisos para ver todos los pagos");
      }

      const { page, limit, search, status, paymentProvider } = input;
      const offset = (page - 1) * limit;

      const where: Prisma.UserPaymentWhereInput = {};

      if (search) {
        where.OR = [
          {
            user: {
              name: { contains: search, mode: "insensitive" },
            },
          },
          {
            user: {
              email: { contains: search, mode: "insensitive" },
            },
          },
          {
            providerPaymentId: { contains: search, mode: "insensitive" },
          },
        ];
      }

      if (status) {
        where.status = status;
      }

      if (paymentProvider) {
        where.paymentProvider = paymentProvider;
      }

      const [payments, total] = await Promise.all([
        prisma.userPayment.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            subscription: {
              select: {
                id: true,
                plan: true,
                status: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: offset,
          take: limit,
        }),
        prisma.userPayment.count({ where }),
      ]);

      return {
        payments,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }),

  // Get global payment statistics (admin only)
  getGlobalStats: protectedProcedure
    .input(z.object({ userId: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const userId = input.userId;

      // Check if user has permission to view global payment stats
      const canManageUsers = await hasPermission(
        ctx.user.id,
        PermissionAction.READ,
        PermissionResource.USER
      );

      if (userId && userId !== ctx.user.id && !canManageUsers) {
        throw new Error(
          "No tienes permisos para ver las estadísticas de pagos de este usuario"
        );
      }

      // If no userId provided, get global stats (admin only)
      if (!userId && !canManageUsers) {
        throw new Error(
          "No tienes permisos para ver estadísticas globales de pagos"
        );
      }

      const whereClause = userId ? { userId } : {};

      const [
        totalPayments,
        completedPayments,
        failedPayments,
        totalAmount,
        completedAmount,
        lastPayment,
      ] = await Promise.all([
        prisma.userPayment.count({
          where: whereClause,
        }),
        prisma.userPayment.count({
          where: {
            ...whereClause,
            status: "COMPLETED",
          },
        }),
        prisma.userPayment.count({
          where: {
            ...whereClause,
            status: "FAILED",
          },
        }),
        prisma.userPayment.aggregate({
          where: whereClause,
          _sum: { amount: true },
        }),
        prisma.userPayment.aggregate({
          where: {
            ...whereClause,
            status: "COMPLETED",
          },
          _sum: { amount: true },
        }),
        prisma.userPayment.findFirst({
          where: whereClause,
          orderBy: { createdAt: "desc" },
          include: {
            subscription: {
              select: {
                plan: true,
              },
            },
          },
        }),
      ]);

      return {
        totalPayments,
        completedPayments,
        failedPayments,
        totalAmount: totalAmount._sum.amount || 0,
        completedAmount: completedAmount._sum.amount || 0,
        lastPayment,
        successRate:
          totalPayments > 0 ? (completedPayments / totalPayments) * 100 : 0,
      };
    }),
});
