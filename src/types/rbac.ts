// RBAC Types
export enum PermissionAction {
  CREATE = "CREATE",
  READ = "READ",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  MANAGE = "MANAGE",
}

export enum PermissionResource {
  USER = "USER",
  ROLE = "ROLE",
  PERMISSION = "PERMISSION",
  TRADING_ACCOUNT = "TRADING_ACCOUNT",
  TRADE = "TRADE",
  PROPFIRM = "PROPFIRM",
  BROKER = "BROKER",
  SYMBOL = "SYMBOL",
  SUBSCRIPTION = "SUBSCRIPTION",
  DASHBOARD = "DASHBOARD",
  ADMIN = "ADMIN",
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string | null;
  isActive: boolean;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
  permissions?: Permission[];
}

export interface Permission {
  id: string;
  action: PermissionAction;
  resource: PermissionResource;
  description?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRoleAssignment {
  id: string;
  userId: string;
  roleId: string;
  role: Role;
  assignedAt: Date;
  assignedBy?: string | null;
  expiresAt?: Date | null;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  role: Role;
  permission: Permission;
  createdAt: Date;
}

// Extended User type with roles
export interface UserWithRoles {
  id: string;
  email: string;
  name: string;
  phone?: string;
  image?: string;
  emailVerified: boolean;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
  userRoles: UserRoleAssignment[];
}

// Permission checking types
export interface PermissionCheck {
  action: PermissionAction;
  resource: PermissionResource;
}

export interface RBACContext {
  userId: string;
  userRoles: Role[];
  permissions: Permission[];
}

// Default roles
export const DEFAULT_ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  MODERATOR: "moderator",
  TRADER: "trader",
  VIEWER: "viewer",
} as const;

// Default permissions
export const DEFAULT_PERMISSIONS = {
  // User management
  USER_CREATE: {
    action: PermissionAction.CREATE,
    resource: PermissionResource.USER,
  },
  USER_READ: {
    action: PermissionAction.READ,
    resource: PermissionResource.USER,
  },
  USER_UPDATE: {
    action: PermissionAction.UPDATE,
    resource: PermissionResource.USER,
  },
  USER_DELETE: {
    action: PermissionAction.DELETE,
    resource: PermissionResource.USER,
  },
  USER_MANAGE: {
    action: PermissionAction.MANAGE,
    resource: PermissionResource.USER,
  },

  // Role management
  ROLE_CREATE: {
    action: PermissionAction.CREATE,
    resource: PermissionResource.ROLE,
  },
  ROLE_READ: {
    action: PermissionAction.READ,
    resource: PermissionResource.ROLE,
  },
  ROLE_UPDATE: {
    action: PermissionAction.UPDATE,
    resource: PermissionResource.ROLE,
  },
  ROLE_DELETE: {
    action: PermissionAction.DELETE,
    resource: PermissionResource.ROLE,
  },
  ROLE_MANAGE: {
    action: PermissionAction.MANAGE,
    resource: PermissionResource.ROLE,
  },

  // Trading account management
  TRADING_ACCOUNT_CREATE: {
    action: PermissionAction.CREATE,
    resource: PermissionResource.TRADING_ACCOUNT,
  },
  TRADING_ACCOUNT_READ: {
    action: PermissionAction.READ,
    resource: PermissionResource.TRADING_ACCOUNT,
  },
  TRADING_ACCOUNT_UPDATE: {
    action: PermissionAction.UPDATE,
    resource: PermissionResource.TRADING_ACCOUNT,
  },
  TRADING_ACCOUNT_DELETE: {
    action: PermissionAction.DELETE,
    resource: PermissionResource.TRADING_ACCOUNT,
  },
  TRADING_ACCOUNT_MANAGE: {
    action: PermissionAction.MANAGE,
    resource: PermissionResource.TRADING_ACCOUNT,
  },

  // Trade management
  TRADE_CREATE: {
    action: PermissionAction.CREATE,
    resource: PermissionResource.TRADE,
  },
  TRADE_READ: {
    action: PermissionAction.READ,
    resource: PermissionResource.TRADE,
  },
  TRADE_UPDATE: {
    action: PermissionAction.UPDATE,
    resource: PermissionResource.TRADE,
  },
  TRADE_DELETE: {
    action: PermissionAction.DELETE,
    resource: PermissionResource.TRADE,
  },
  TRADE_MANAGE: {
    action: PermissionAction.MANAGE,
    resource: PermissionResource.TRADE,
  },

  // Propfirm management
  PROPFIRM_CREATE: {
    action: PermissionAction.CREATE,
    resource: PermissionResource.PROPFIRM,
  },
  PROPFIRM_READ: {
    action: PermissionAction.READ,
    resource: PermissionResource.PROPFIRM,
  },
  PROPFIRM_UPDATE: {
    action: PermissionAction.UPDATE,
    resource: PermissionResource.PROPFIRM,
  },
  PROPFIRM_DELETE: {
    action: PermissionAction.DELETE,
    resource: PermissionResource.PROPFIRM,
  },
  PROPFIRM_MANAGE: {
    action: PermissionAction.MANAGE,
    resource: PermissionResource.PROPFIRM,
  },

  // Broker management
  BROKER_CREATE: {
    action: PermissionAction.CREATE,
    resource: PermissionResource.BROKER,
  },
  BROKER_READ: {
    action: PermissionAction.READ,
    resource: PermissionResource.BROKER,
  },
  BROKER_UPDATE: {
    action: PermissionAction.UPDATE,
    resource: PermissionResource.BROKER,
  },
  BROKER_DELETE: {
    action: PermissionAction.DELETE,
    resource: PermissionResource.BROKER,
  },
  BROKER_MANAGE: {
    action: PermissionAction.MANAGE,
    resource: PermissionResource.BROKER,
  },

  // Symbol management
  SYMBOL_CREATE: {
    action: PermissionAction.CREATE,
    resource: PermissionResource.SYMBOL,
  },
  SYMBOL_READ: {
    action: PermissionAction.READ,
    resource: PermissionResource.SYMBOL,
  },
  SYMBOL_UPDATE: {
    action: PermissionAction.UPDATE,
    resource: PermissionResource.SYMBOL,
  },
  SYMBOL_DELETE: {
    action: PermissionAction.DELETE,
    resource: PermissionResource.SYMBOL,
  },
  SYMBOL_MANAGE: {
    action: PermissionAction.MANAGE,
    resource: PermissionResource.SYMBOL,
  },

  // Subscription management
  SUBSCRIPTION_CREATE: {
    action: PermissionAction.CREATE,
    resource: PermissionResource.SUBSCRIPTION,
  },
  SUBSCRIPTION_READ: {
    action: PermissionAction.READ,
    resource: PermissionResource.SUBSCRIPTION,
  },
  SUBSCRIPTION_UPDATE: {
    action: PermissionAction.UPDATE,
    resource: PermissionResource.SUBSCRIPTION,
  },
  SUBSCRIPTION_DELETE: {
    action: PermissionAction.DELETE,
    resource: PermissionResource.SUBSCRIPTION,
  },
  SUBSCRIPTION_MANAGE: {
    action: PermissionAction.MANAGE,
    resource: PermissionResource.SUBSCRIPTION,
  },

  // Dashboard access
  DASHBOARD_READ: {
    action: PermissionAction.READ,
    resource: PermissionResource.DASHBOARD,
  },

  // Admin access
  ADMIN_CREATE: {
    action: PermissionAction.CREATE,
    resource: PermissionResource.ADMIN,
  },
  ADMIN_READ: {
    action: PermissionAction.READ,
    resource: PermissionResource.ADMIN,
  },
  ADMIN_UPDATE: {
    action: PermissionAction.UPDATE,
    resource: PermissionResource.ADMIN,
  },
  ADMIN_DELETE: {
    action: PermissionAction.DELETE,
    resource: PermissionResource.ADMIN,
  },
  ADMIN_MANAGE: {
    action: PermissionAction.MANAGE,
    resource: PermissionResource.ADMIN,
  },
} as const;
