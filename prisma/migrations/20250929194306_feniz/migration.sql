-- CreateEnum
CREATE TYPE "public"."SubscriptionPlan" AS ENUM ('FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'INCOMPLETE', 'INCOMPLETE_EXPIRED', 'UNPAID');

-- CreateEnum
CREATE TYPE "public"."Language" AS ENUM ('ES', 'EN', 'PT');

-- CreateEnum
CREATE TYPE "public"."Theme" AS ENUM ('LIGHT', 'DARK', 'AUTO');

-- CreateEnum
CREATE TYPE "public"."AccountType" AS ENUM ('PROPFIRM', 'BROKER');

-- CreateEnum
CREATE TYPE "public"."TradeStatus" AS ENUM ('OPEN', 'CLOSED', 'CANCELLED', 'PARTIALLY_CLOSED');

-- CreateEnum
CREATE TYPE "public"."EntryMethod" AS ENUM ('MANUAL', 'API', 'COPY_TRADING');

-- CreateEnum
CREATE TYPE "public"."PaymentProvider" AS ENUM ('STRIPE', 'PAYPAL', 'MERCADOPAGO', 'CULQI');

-- CreateEnum
CREATE TYPE "public"."SymbolCategory" AS ENUM ('FOREX', 'INDICES', 'COMMODITIES', 'CRYPTO', 'STOCKS');

-- CreateEnum
CREATE TYPE "public"."PermissionAction" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE');

-- CreateEnum
CREATE TYPE "public"."PermissionResource" AS ENUM ('USER', 'ROLE', 'PERMISSION', 'TRADING_ACCOUNT', 'TRADE', 'PROPFIRM', 'BROKER', 'SYMBOL', 'SUBSCRIPTION', 'DASHBOARD', 'ADMIN');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "phone" TEXT,
    "language" "public"."Language" NOT NULL DEFAULT 'ES',
    "defaultRiskPercentage" DECIMAL(5,2) NOT NULL DEFAULT 1.00,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "idToken" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."permissions" (
    "id" TEXT NOT NULL,
    "action" "public"."PermissionAction" NOT NULL,
    "resource" "public"."PermissionResource" NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_roles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."role_permissions" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."company_info" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Feniz',
    "displayName" TEXT NOT NULL DEFAULT 'Feniz Trading Platform',
    "description" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "website" TEXT,
    "facebookUrl" TEXT,
    "twitterUrl" TEXT,
    "instagramUrl" TEXT,
    "linkedinUrl" TEXT,
    "youtubeUrl" TEXT,
    "foundedYear" INTEGER,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "metaKeywords" TEXT,
    "termsUrl" TEXT,
    "privacyUrl" TEXT,
    "cookiesUrl" TEXT,
    "complaintsUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" "public"."SubscriptionPlan" NOT NULL DEFAULT 'FREE',
    "status" "public"."SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
    "paymentProvider" "public"."PaymentProvider" NOT NULL,
    "providerCustomerId" TEXT,
    "providerSubscriptionId" TEXT,
    "currentPlanStart" TIMESTAMP(3),
    "currentPlanEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."propfirms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "propfirms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."propfirm_phases" (
    "id" TEXT NOT NULL,
    "propfirmId" TEXT NOT NULL,
    "phaseName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isEvaluation" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "propfirm_phases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."propfirm_account_types" (
    "id" TEXT NOT NULL,
    "propfirmId" TEXT NOT NULL,
    "typeName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "initialBalance" DECIMAL(15,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "propfirm_account_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."propfirm_rules_configuration" (
    "id" TEXT NOT NULL,
    "propfirmId" TEXT NOT NULL,
    "accountTypeId" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "maxDrawdown" DECIMAL(5,2) NOT NULL,
    "dailyDrawdown" DECIMAL(5,2) NOT NULL,
    "profitTarget" DECIMAL(5,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "propfirm_rules_configuration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."brokers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brokers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."symbols" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "category" "public"."SymbolCategory" NOT NULL,
    "baseCurrency" VARCHAR(3) NOT NULL,
    "quoteCurrency" VARCHAR(3) NOT NULL,
    "pipDecimalPosition" INTEGER NOT NULL DEFAULT 4,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "symbols_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."symbol_configurations" (
    "id" TEXT NOT NULL,
    "propfirmId" TEXT,
    "brokerId" TEXT,
    "symbolId" TEXT NOT NULL,
    "commissionPerLot" DECIMAL(10,4),
    "pipValuePerLot" DECIMAL(10,4) NOT NULL,
    "pipTicks" INTEGER NOT NULL DEFAULT 1,
    "spreadTypical" DECIMAL(8,4),
    "spreadRecommended" DECIMAL(8,4),
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "symbol_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trading_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountType" "public"."AccountType" NOT NULL,
    "accountNumber" TEXT,
    "server" TEXT,
    "propfirmId" TEXT,
    "brokerId" TEXT,
    "accountTypeId" TEXT,
    "initialBalance" DECIMAL(15,2) NOT NULL,
    "currentBalance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "equity" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "currentPhaseId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trading_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."account_links" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propfirmAccountId" TEXT NOT NULL,
    "brokerAccountId" TEXT NOT NULL,
    "autoCopyEnabled" BOOLEAN NOT NULL DEFAULT false,
    "maxRiskPerTrade" DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastCopyAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trades" (
    "id" TEXT NOT NULL,
    "externalTradeId" TEXT,
    "accountId" TEXT NOT NULL,
    "symbolId" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "entryPrice" DECIMAL(20,8) NOT NULL,
    "exitPrice" DECIMAL(20,8),
    "lotSize" DECIMAL(15,4) NOT NULL,
    "stopLoss" DECIMAL(20,8),
    "takeProfit" DECIMAL(20,8),
    "openTime" TIMESTAMP(3) NOT NULL,
    "closeTime" TIMESTAMP(3),
    "profitLoss" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "commission" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "swap" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "netProfit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "status" "public"."TradeStatus" NOT NULL DEFAULT 'OPEN',
    "entryMethod" "public"."EntryMethod" NOT NULL DEFAULT 'MANUAL',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trades_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "public"."Session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Account_providerId_accountId_key" ON "public"."Account"("providerId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Verification_identifier_value_key" ON "public"."Verification"("identifier", "value");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "public"."roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_action_resource_key" ON "public"."permissions"("action", "resource");

-- CreateIndex
CREATE INDEX "user_roles_userId_idx" ON "public"."user_roles"("userId");

-- CreateIndex
CREATE INDEX "user_roles_roleId_idx" ON "public"."user_roles"("roleId");

-- CreateIndex
CREATE INDEX "user_roles_expiresAt_idx" ON "public"."user_roles"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_userId_roleId_key" ON "public"."user_roles"("userId", "roleId");

-- CreateIndex
CREATE INDEX "role_permissions_roleId_idx" ON "public"."role_permissions"("roleId");

-- CreateIndex
CREATE INDEX "role_permissions_permissionId_idx" ON "public"."role_permissions"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_roleId_permissionId_key" ON "public"."role_permissions"("roleId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "propfirms_name_key" ON "public"."propfirms"("name");

-- CreateIndex
CREATE UNIQUE INDEX "propfirm_phases_propfirmId_phaseName_key" ON "public"."propfirm_phases"("propfirmId", "phaseName");

-- CreateIndex
CREATE UNIQUE INDEX "propfirm_account_types_propfirmId_typeName_key" ON "public"."propfirm_account_types"("propfirmId", "typeName");

-- CreateIndex
CREATE UNIQUE INDEX "propfirm_rules_configuration_propfirmId_accountTypeId_phase_key" ON "public"."propfirm_rules_configuration"("propfirmId", "accountTypeId", "phaseId");

-- CreateIndex
CREATE UNIQUE INDEX "brokers_name_key" ON "public"."brokers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "symbols_symbol_key" ON "public"."symbols"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "symbol_configurations_propfirmId_symbolId_key" ON "public"."symbol_configurations"("propfirmId", "symbolId");

-- CreateIndex
CREATE UNIQUE INDEX "symbol_configurations_brokerId_symbolId_key" ON "public"."symbol_configurations"("brokerId", "symbolId");

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "public"."permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_subscriptions" ADD CONSTRAINT "user_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."propfirm_phases" ADD CONSTRAINT "propfirm_phases_propfirmId_fkey" FOREIGN KEY ("propfirmId") REFERENCES "public"."propfirms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."propfirm_account_types" ADD CONSTRAINT "propfirm_account_types_propfirmId_fkey" FOREIGN KEY ("propfirmId") REFERENCES "public"."propfirms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."propfirm_rules_configuration" ADD CONSTRAINT "propfirm_rules_configuration_propfirmId_fkey" FOREIGN KEY ("propfirmId") REFERENCES "public"."propfirms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."propfirm_rules_configuration" ADD CONSTRAINT "propfirm_rules_configuration_accountTypeId_fkey" FOREIGN KEY ("accountTypeId") REFERENCES "public"."propfirm_account_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."propfirm_rules_configuration" ADD CONSTRAINT "propfirm_rules_configuration_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "public"."propfirm_phases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."symbol_configurations" ADD CONSTRAINT "symbol_configurations_propfirmId_fkey" FOREIGN KEY ("propfirmId") REFERENCES "public"."propfirms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."symbol_configurations" ADD CONSTRAINT "symbol_configurations_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "public"."brokers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."symbol_configurations" ADD CONSTRAINT "symbol_configurations_symbolId_fkey" FOREIGN KEY ("symbolId") REFERENCES "public"."symbols"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trading_accounts" ADD CONSTRAINT "trading_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trading_accounts" ADD CONSTRAINT "trading_accounts_propfirmId_fkey" FOREIGN KEY ("propfirmId") REFERENCES "public"."propfirms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trading_accounts" ADD CONSTRAINT "trading_accounts_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "public"."brokers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trading_accounts" ADD CONSTRAINT "trading_accounts_accountTypeId_fkey" FOREIGN KEY ("accountTypeId") REFERENCES "public"."propfirm_account_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trading_accounts" ADD CONSTRAINT "trading_accounts_currentPhaseId_fkey" FOREIGN KEY ("currentPhaseId") REFERENCES "public"."propfirm_phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."account_links" ADD CONSTRAINT "account_links_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."account_links" ADD CONSTRAINT "account_links_propfirmAccountId_fkey" FOREIGN KEY ("propfirmAccountId") REFERENCES "public"."trading_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."account_links" ADD CONSTRAINT "account_links_brokerAccountId_fkey" FOREIGN KEY ("brokerAccountId") REFERENCES "public"."trading_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trades" ADD CONSTRAINT "trades_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."trading_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trades" ADD CONSTRAINT "trades_symbolId_fkey" FOREIGN KEY ("symbolId") REFERENCES "public"."symbols"("id") ON DELETE CASCADE ON UPDATE CASCADE;
