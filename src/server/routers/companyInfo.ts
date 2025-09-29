import { z } from "zod";
import { prisma } from "../../lib/db";
import { RBACService } from "../../services/rbacService";
import { PermissionAction, PermissionResource } from "../../types/rbac";
import { protectedProcedure, router } from "../trpc";

export const companyInfoRouter = router({
  // Get company information (public)
  get: protectedProcedure.query(async () => {
    const companyInfo = await prisma.companyInfo.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" },
    });

    return companyInfo;
  }),

  // Update company information (admin only)
  update: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        displayName: z.string().optional(),
        description: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        website: z.string().url().optional(),
        facebookUrl: z.string().url().optional().nullable(),
        twitterUrl: z.string().url().optional().nullable(),
        instagramUrl: z.string().url().optional().nullable(),
        linkedinUrl: z.string().url().optional().nullable(),
        youtubeUrl: z.string().url().optional().nullable(),
        foundedYear: z
          .number()
          .int()
          .min(1800)
          .max(new Date().getFullYear())
          .optional(),
        logoUrl: z.string().url().optional().nullable(),
        faviconUrl: z.string().url().optional().nullable(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
        termsUrl: z.string().optional(),
        privacyUrl: z.string().optional(),
        cookiesUrl: z.string().optional(),
        complaintsUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user has permission to manage company info
      const canManage = await RBACService.hasPermission(
        ctx.user.id,
        PermissionAction.UPDATE,
        PermissionResource.ADMIN
      );

      if (!canManage) {
        throw new Error(
          "No tienes permisos para actualizar la información de la empresa"
        );
      }

      // Get existing company info or create new one
      const existingInfo = await prisma.companyInfo.findFirst({
        where: { isActive: true },
      });

      if (existingInfo) {
        // Update existing
        const updatedInfo = await prisma.companyInfo.update({
          where: { id: existingInfo.id },
          data: {
            ...input,
            updatedAt: new Date(),
          },
        });
        return updatedInfo;
      }
      // Create new
      const newInfo = await prisma.companyInfo.create({
        data: {
          ...input,
          isActive: true,
        },
      });
      return newInfo;
    }),

  // Get company info for admin dashboard
  getForAdmin: protectedProcedure.query(async ({ ctx }) => {
    // Check if user has permission to view admin data
    const canView = await RBACService.hasPermission(
      ctx.user.id,
      PermissionAction.READ,
      PermissionResource.ADMIN
    );

    if (!canView) {
      throw new Error(
        "No tienes permisos para ver la información de administración"
      );
    }

    const companyInfo = await prisma.companyInfo.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" },
    });

    return companyInfo;
  }),
});
