/**
 * Type-safe enums and constants for the application
 * Centralized management of all enum values and their types
 */

// Trade Status Enum
export const TRADE_STATUS = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
  CANCELLED: "CANCELLED",
  PARTIALLY_CLOSED: "PARTIALLY_CLOSED",
} as const;

// Entry Method Enum
export const ENTRY_METHOD = {
  MANUAL: "MANUAL",
  API: "API",
  COPY_TRADING: "COPY_TRADING",
} as const;

// Trade Direction Enum
export const TRADE_DIRECTION = {
  BUY: "buy",
  SELL: "sell",
} as const;

// Account Type Enum
export const ACCOUNT_TYPE = {
  PROPFIRM: "PROPFIRM",
  BROKER: "BROKER",
} as const;

// Symbol Category Enum
export const SYMBOL_CATEGORY = {
  FOREX: "FOREX",
  STOCKS: "STOCKS",
  CRYPTO: "CRYPTO",
  COMMODITIES: "COMMODITIES",
  INDICES: "INDICES",
} as const;

// Subscription Status Enum
export const SUBSCRIPTION_STATUS = {
  TRIALING: "TRIALING",
  ACTIVE: "ACTIVE",
  PAST_DUE: "PAST_DUE",
  CANCELED: "CANCELED",
  INCOMPLETE: "INCOMPLETE",
} as const;

// Payment Provider Enum
export const PAYMENT_PROVIDER = {
  STRIPE: "STRIPE",
  PAYPAL: "PAYPAL",
  MERCADOPAGO: "MERCADOPAGO",
  CULQI: "CULQI",
} as const;

// User Role Enum
export const USER_ROLE = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  TRADER: "trader",
  VIEWER: "viewer",
} as const;

// Language Enum
export const LANGUAGE = {
  EN: "EN",
  ES: "ES",
  PT: "PT",
  FR: "FR",
} as const;

// Type definitions derived from the constants
export type TradeStatus = (typeof TRADE_STATUS)[keyof typeof TRADE_STATUS];
export type EntryMethod = (typeof ENTRY_METHOD)[keyof typeof ENTRY_METHOD];
export type TradeDirection =
  (typeof TRADE_DIRECTION)[keyof typeof TRADE_DIRECTION];
export type AccountType = (typeof ACCOUNT_TYPE)[keyof typeof ACCOUNT_TYPE];
export type SymbolCategory =
  (typeof SYMBOL_CATEGORY)[keyof typeof SYMBOL_CATEGORY];
export type SubscriptionStatus =
  (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];
export type PaymentProvider =
  (typeof PAYMENT_PROVIDER)[keyof typeof PAYMENT_PROVIDER];
export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];
export type Language = (typeof LANGUAGE)[keyof typeof LANGUAGE];

// Helper functions for validation
export const isValidTradeStatus = (status: string): status is TradeStatus => {
  return Object.values(TRADE_STATUS).includes(status as TradeStatus);
};

export const isValidEntryMethod = (method: string): method is EntryMethod => {
  return Object.values(ENTRY_METHOD).includes(method as EntryMethod);
};

export const isValidTradeDirection = (
  direction: string
): direction is TradeDirection => {
  return Object.values(TRADE_DIRECTION).includes(direction as TradeDirection);
};

export const isValidAccountType = (type: string): type is AccountType => {
  return Object.values(ACCOUNT_TYPE).includes(type as AccountType);
};

export const isValidSymbolCategory = (
  category: string
): category is SymbolCategory => {
  return Object.values(SYMBOL_CATEGORY).includes(category as SymbolCategory);
};

export const isValidUserRole = (role: string): role is UserRole => {
  return Object.values(USER_ROLE).includes(role as UserRole);
};

export const isValidLanguage = (lang: string): lang is Language => {
  return Object.values(LANGUAGE).includes(lang as Language);
};
