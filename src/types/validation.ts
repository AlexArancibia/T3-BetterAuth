/**
 * Zod validation schemas using centralized enums
 * Reusable validation schemas for consistent validation across the app
 */

import { z } from "zod";
import {
  ACCOUNT_TYPE,
  ENTRY_METHOD,
  LANGUAGE,
  SYMBOL_CATEGORY,
  TRADE_DIRECTION,
  TRADE_STATUS,
  USER_ROLE,
} from "./enums";

// Trade validation schemas
export const tradeStatusSchema = z.enum([
  TRADE_STATUS.OPEN,
  TRADE_STATUS.CLOSED,
  TRADE_STATUS.CANCELLED,
  TRADE_STATUS.PARTIALLY_CLOSED,
]);

export const entryMethodSchema = z.enum([
  ENTRY_METHOD.MANUAL,
  ENTRY_METHOD.API,
  ENTRY_METHOD.COPY_TRADING,
]);

export const tradeDirectionSchema = z.enum([
  TRADE_DIRECTION.BUY,
  TRADE_DIRECTION.SELL,
]);

// Account validation schemas
export const accountTypeSchema = z.enum([
  ACCOUNT_TYPE.PROPFIRM,
  ACCOUNT_TYPE.BROKER,
]);

// Symbol validation schemas
export const symbolCategorySchema = z.enum([
  SYMBOL_CATEGORY.FOREX,
  SYMBOL_CATEGORY.STOCKS,
  SYMBOL_CATEGORY.CRYPTO,
  SYMBOL_CATEGORY.COMMODITIES,
  SYMBOL_CATEGORY.INDICES,
]);

// User validation schemas
export const userRoleSchema = z.enum([
  USER_ROLE.SUPER_ADMIN,
  USER_ROLE.ADMIN,
  USER_ROLE.TRADER,
  USER_ROLE.VIEWER,
]);

export const languageSchema = z.enum([
  LANGUAGE.EN,
  LANGUAGE.ES,
  LANGUAGE.PT,
  LANGUAGE.FR,
]);

// Common validation schemas
export const positiveNumberSchema = z.number().positive();
export const nonNegativeNumberSchema = z.number().min(0);
export const emailSchema = z.string().email();
export const passwordSchema = z.string().min(8);
export const phoneSchema = z.string().regex(/^\+?[\d\s\-()]+$/);

// Trade-specific validation schemas
export const lotSizeSchema = z.number().positive().max(1000);
export const priceSchema = z.number().positive();
export const profitLossSchema = z.number();
export const commissionSchema = z.number().min(0);
export const swapSchema = z.number();

// Date validation schemas
export const dateSchema = z
  .string()
  .refine((str) => !Number.isNaN(Date.parse(str)), {
    message: "Invalid date format",
  })
  .transform((str) => new Date(str));
export const optionalDateSchema = z
  .string()
  .refine((str) => !Number.isNaN(Date.parse(str)), {
    message: "Invalid date format",
  })
  .transform((str) => new Date(str))
  .optional();

// String validation schemas
export const requiredStringSchema = z.string().min(1);
export const optionalStringSchema = z.string().optional();
export const externalTradeIdSchema = z.string().optional();
export const notesSchema = z.string().optional();

// Composite schemas for common use cases
export const tradeCreateSchema = z.object({
  externalTradeId: externalTradeIdSchema,
  accountId: requiredStringSchema,
  symbolId: requiredStringSchema,
  direction: tradeDirectionSchema,
  entryPrice: priceSchema,
  exitPrice: priceSchema.optional(),
  lotSize: lotSizeSchema,
  stopLoss: priceSchema.optional(),
  takeProfit: priceSchema.optional(),
  openTime: dateSchema,
  closeTime: optionalDateSchema,
  profitLoss: profitLossSchema.default(0),
  commission: commissionSchema.default(0),
  swap: swapSchema.default(0),
  netProfit: profitLossSchema.default(0),
  status: tradeStatusSchema.default(TRADE_STATUS.OPEN),
  entryMethod: entryMethodSchema.default(ENTRY_METHOD.MANUAL),
  notes: notesSchema,
});

export const tradeUpdateSchema = z.object({
  id: requiredStringSchema,
  exitPrice: priceSchema.optional(),
  closeTime: optionalDateSchema,
  profitLoss: profitLossSchema.optional(),
  commission: commissionSchema.optional(),
  swap: swapSchema.optional(),
  netProfit: profitLossSchema.optional(),
  status: tradeStatusSchema.optional(),
  notes: notesSchema,
});

export const tradePairCreateSchema = z.object({
  symbolId: requiredStringSchema,
  // Propfirm trade data
  propfirmDirection: tradeDirectionSchema,
  propfirmLotSize: lotSizeSchema,
  propfirmOpenPrice: priceSchema,
  propfirmClosePrice: priceSchema.optional(),
  propfirmNetProfit: profitLossSchema.default(0),
  // Broker trade data
  brokerDirection: tradeDirectionSchema,
  brokerLotSize: lotSizeSchema,
  brokerOpenPrice: priceSchema,
  brokerClosePrice: priceSchema.optional(),
  brokerNetProfit: profitLossSchema.default(0),
  // Shared fields
  status: z
    .enum([TRADE_STATUS.OPEN, TRADE_STATUS.CLOSED])
    .default(TRADE_STATUS.OPEN),
  openTime: dateSchema,
  closeTime: optionalDateSchema,
  propfirmAccountId: requiredStringSchema,
  brokerAccountId: requiredStringSchema,
});
