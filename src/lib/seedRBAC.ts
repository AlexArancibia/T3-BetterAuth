import { prisma } from "@/lib/db";
import {
  DEFAULT_PERMISSIONS,
  DEFAULT_ROLES,
  PermissionAction,
  PermissionResource,
} from "@/types/rbac";

export async function seedRBAC() {
  // Create permissions
  const permissions = await Promise.all(
    Object.entries(DEFAULT_PERMISSIONS).map(async ([_key, permission]) => {
      const result = await prisma.permission.upsert({
        where: {
          action_resource: {
            action: permission.action,
            resource: permission.resource,
          },
        },
        update: {},
        create: {
          action: permission.action,
          resource: permission.resource,
          description: `Permission to ${permission.action.toLowerCase()} ${permission.resource.toLowerCase()}`,
        },
      });
      return result;
    })
  );

  // Create roles

  // Super Admin Role
  const superAdminRole = await prisma.role.upsert({
    where: { name: DEFAULT_ROLES.SUPER_ADMIN },
    update: {},
    create: {
      name: DEFAULT_ROLES.SUPER_ADMIN,
      displayName: "Super Administrator",
      description: "Full system access with all permissions",
      isSystem: true,
      isActive: true,
    },
  });

  // Admin Role
  const adminRole = await prisma.role.upsert({
    where: { name: DEFAULT_ROLES.ADMIN },
    update: {},
    create: {
      name: DEFAULT_ROLES.ADMIN,
      displayName: "Administrator",
      description: "Administrative access to most system features",
      isSystem: true,
      isActive: true,
    },
  });

  // Moderator Role
  const moderatorRole = await prisma.role.upsert({
    where: { name: DEFAULT_ROLES.MODERATOR },
    update: {},
    create: {
      name: DEFAULT_ROLES.MODERATOR,
      displayName: "Moderator",
      description: "Moderation access to user content and basic management",
      isSystem: true,
      isActive: true,
    },
  });

  // Trader Role
  const traderRole = await prisma.role.upsert({
    where: { name: DEFAULT_ROLES.TRADER },
    update: {},
    create: {
      name: DEFAULT_ROLES.TRADER,
      displayName: "Trader",
      description: "Full trading access and account management",
      isSystem: true,
      isActive: true,
    },
  });

  // Viewer Role
  const viewerRole = await prisma.role.upsert({
    where: { name: DEFAULT_ROLES.VIEWER },
    update: {},
    create: {
      name: DEFAULT_ROLES.VIEWER,
      displayName: "Viewer",
      description: "Read-only access to basic features",
      isSystem: true,
      isActive: true,
    },
  });

  // Assign permissions to roles

  // Super Admin gets all permissions
  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Admin gets most permissions except super admin specific ones
  const adminPermissions = permissions.filter(
    (p) => !p.resource.includes("ROLE") || p.action !== PermissionAction.MANAGE
  );
  for (const permission of adminPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Moderator gets user management and basic permissions
  const moderatorPermissions = permissions.filter(
    (p) =>
      (p.resource === PermissionResource.USER &&
        p.action !== PermissionAction.DELETE) ||
      p.resource === PermissionResource.DASHBOARD ||
      (p.resource === PermissionResource.TRADE &&
        p.action === PermissionAction.READ)
  );
  for (const permission of moderatorPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: moderatorRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: moderatorRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Trader gets trading-related permissions
  const traderPermissions = permissions.filter(
    (p) =>
      p.resource === PermissionResource.TRADING_ACCOUNT ||
      p.resource === PermissionResource.TRADE ||
      p.resource === PermissionResource.DASHBOARD ||
      p.resource === PermissionResource.SYMBOL ||
      p.resource === PermissionResource.PROPFIRM ||
      p.resource === PermissionResource.BROKER
  );
  for (const permission of traderPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: traderRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: traderRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Viewer gets read-only permissions
  const viewerPermissions = permissions.filter(
    (p) =>
      p.action === PermissionAction.READ &&
      (p.resource === PermissionResource.DASHBOARD ||
        p.resource === PermissionResource.TRADE ||
        p.resource === PermissionResource.SYMBOL ||
        p.resource === PermissionResource.PROPFIRM ||
        p.resource === PermissionResource.BROKER)
  );
  for (const permission of viewerPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: viewerRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: viewerRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Assign default role to existing users
  const existingUsers = await prisma.user.findMany({
    where: {
      userRoles: {
        none: {},
      },
    },
  });

  for (const user of existingUsers) {
    // Assign trader role by default
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: traderRole.id,
      },
    });
  }

  return {
    roles: [superAdminRole, adminRole, moderatorRole, traderRole, viewerRole],
    permissions: permissions.length,
  };
}

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedRBAC()
    .then(() => {
      process.exit(0);
    })
    .catch((_error) => {
      process.exit(1);
    });
}
