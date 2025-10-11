import {
  PermissionAction,
  PermissionResource,
  PrismaClient,
  SymbolCategory,
} from "@prisma/client";
import { auth } from "../src/lib/auth";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting complete seed process...");

  // ================================
  // 1. CLEAR ALL DATA
  // ================================
  console.log("🗑️ Clearing all existing data...");

  // Delete in correct order to avoid foreign key constraints
  await prisma.trade.deleteMany({});
  await prisma.accountLink.deleteMany({});
  await prisma.tradingAccount.deleteMany({});
  await prisma.symbolConfiguration.deleteMany({});
  await prisma.userRole.deleteMany({});
  await prisma.userPayment.deleteMany({});
  await prisma.userSubscription.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.verification.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.rolePermission.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.permission.deleteMany({});
  await prisma.propfirmRulesConfiguration.deleteMany({});
  await prisma.propfirmAccountType.deleteMany({});
  await prisma.propfirmPhase.deleteMany({});
  await prisma.propfirm.deleteMany({});
  await prisma.broker.deleteMany({});
  await prisma.symbol.deleteMany({});
  await prisma.companyInfo.deleteMany({});

  console.log("✅ All data cleared successfully");

  // ================================
  // 2. COMPANY INFORMATION
  // ================================
  console.log("📋 Creating company information...");
  await prisma.companyInfo.create({
    data: {
      id: "company-feniz-001",
      name: "Feniz",
      displayName: "Feniz Trading Platform",
      description:
        "La plataforma de trading más avanzada para traders profesionales",
      email: "info@feniz.com",
      phone: "+1 (555) 123-4567",
      address: "123 Trading Street",
      city: "New York",
      country: "USA",
      website: "https://feniz.com",
      facebookUrl: "https://facebook.com/feniz",
      twitterUrl: "https://twitter.com/feniz",
      instagramUrl: "https://instagram.com/feniz",
      linkedinUrl: "https://linkedin.com/company/feniz",
      youtubeUrl: "https://youtube.com/feniz",
      foundedYear: 2020,
      logoUrl: "/images/feniz-logo.png",
      faviconUrl: "/favicon.ico",
      metaTitle: "Feniz - Plataforma de Trading Profesional",
      metaDescription:
        "Gestiona tus cuentas de trading, conecta con brokers y propfirms, analiza tu rendimiento",
      metaKeywords: "trading, forex, propfirm, broker, análisis, rendimiento",
      termsUrl: "/terms",
      privacyUrl: "/privacy",
      cookiesUrl: "/cookies",
      complaintsUrl: "/complaints",
    },
  });

  // ================================
  // 3. ROLES AND PERMISSIONS
  // ================================
  console.log("👥 Creating roles and permissions...");

  // Create all permissions
  const permissions = [
    // Dashboard permissions
    { action: PermissionAction.READ, resource: PermissionResource.DASHBOARD },

    // User management permissions
    { action: PermissionAction.CREATE, resource: PermissionResource.USER },
    { action: PermissionAction.READ, resource: PermissionResource.USER },
    { action: PermissionAction.UPDATE, resource: PermissionResource.USER },
    { action: PermissionAction.DELETE, resource: PermissionResource.USER },
    { action: PermissionAction.MANAGE, resource: PermissionResource.USER },

    // Role management permissions
    { action: PermissionAction.CREATE, resource: PermissionResource.ROLE },
    { action: PermissionAction.READ, resource: PermissionResource.ROLE },
    { action: PermissionAction.UPDATE, resource: PermissionResource.ROLE },
    { action: PermissionAction.DELETE, resource: PermissionResource.ROLE },
    { action: PermissionAction.MANAGE, resource: PermissionResource.ROLE },

    // Permission management
    {
      action: PermissionAction.CREATE,
      resource: PermissionResource.PERMISSION,
    },
    { action: PermissionAction.READ, resource: PermissionResource.PERMISSION },
    {
      action: PermissionAction.UPDATE,
      resource: PermissionResource.PERMISSION,
    },
    {
      action: PermissionAction.DELETE,
      resource: PermissionResource.PERMISSION,
    },
    {
      action: PermissionAction.MANAGE,
      resource: PermissionResource.PERMISSION,
    },

    // Trading account permissions
    {
      action: PermissionAction.CREATE,
      resource: PermissionResource.TRADING_ACCOUNT,
    },
    {
      action: PermissionAction.READ,
      resource: PermissionResource.TRADING_ACCOUNT,
    },
    {
      action: PermissionAction.UPDATE,
      resource: PermissionResource.TRADING_ACCOUNT,
    },
    {
      action: PermissionAction.DELETE,
      resource: PermissionResource.TRADING_ACCOUNT,
    },
    {
      action: PermissionAction.MANAGE,
      resource: PermissionResource.TRADING_ACCOUNT,
    },

    // Trade permissions
    { action: PermissionAction.CREATE, resource: PermissionResource.TRADE },
    { action: PermissionAction.READ, resource: PermissionResource.TRADE },
    { action: PermissionAction.UPDATE, resource: PermissionResource.TRADE },
    { action: PermissionAction.DELETE, resource: PermissionResource.TRADE },
    { action: PermissionAction.MANAGE, resource: PermissionResource.TRADE },

    // Propfirm permissions
    { action: PermissionAction.CREATE, resource: PermissionResource.PROPFIRM },
    { action: PermissionAction.READ, resource: PermissionResource.PROPFIRM },
    { action: PermissionAction.UPDATE, resource: PermissionResource.PROPFIRM },
    { action: PermissionAction.DELETE, resource: PermissionResource.PROPFIRM },
    { action: PermissionAction.MANAGE, resource: PermissionResource.PROPFIRM },

    // Broker permissions
    { action: PermissionAction.CREATE, resource: PermissionResource.BROKER },
    { action: PermissionAction.READ, resource: PermissionResource.BROKER },
    { action: PermissionAction.UPDATE, resource: PermissionResource.BROKER },
    { action: PermissionAction.DELETE, resource: PermissionResource.BROKER },
    { action: PermissionAction.MANAGE, resource: PermissionResource.BROKER },

    // Symbol permissions
    { action: PermissionAction.CREATE, resource: PermissionResource.SYMBOL },
    { action: PermissionAction.READ, resource: PermissionResource.SYMBOL },
    { action: PermissionAction.UPDATE, resource: PermissionResource.SYMBOL },
    { action: PermissionAction.DELETE, resource: PermissionResource.SYMBOL },
    { action: PermissionAction.MANAGE, resource: PermissionResource.SYMBOL },

    // Subscription permissions
    {
      action: PermissionAction.CREATE,
      resource: PermissionResource.SUBSCRIPTION,
    },
    {
      action: PermissionAction.READ,
      resource: PermissionResource.SUBSCRIPTION,
    },
    {
      action: PermissionAction.UPDATE,
      resource: PermissionResource.SUBSCRIPTION,
    },
    {
      action: PermissionAction.DELETE,
      resource: PermissionResource.SUBSCRIPTION,
    },
    {
      action: PermissionAction.MANAGE,
      resource: PermissionResource.SUBSCRIPTION,
    },

    // Admin permissions
    { action: PermissionAction.READ, resource: PermissionResource.ADMIN },
    { action: PermissionAction.MANAGE, resource: PermissionResource.ADMIN },
  ];

  const createdPermissions = [];
  for (const perm of permissions) {
    const permission = await prisma.permission.create({
      data: {
        action: perm.action,
        resource: perm.resource,
        description: `${perm.action} permission for ${perm.resource}`,
      },
    });
    createdPermissions.push(permission);
  }

  // Create roles
  const superAdminRole = await prisma.role.create({
    data: {
      name: "super_admin",
      displayName: "Super Admin",
      description: "Full system access with all permissions",
      isSystem: true,
    },
  });

  const adminRole = await prisma.role.create({
    data: {
      name: "admin",
      displayName: "Admin",
      description: "Administrative access to manage users and system settings",
      isSystem: true,
    },
  });

  const moderatorRole = await prisma.role.create({
    data: {
      name: "moderator",
      displayName: "Moderator",
      description: "User management and basic system monitoring",
      isSystem: true,
    },
  });

  const traderRole = await prisma.role.create({
    data: {
      name: "trader",
      displayName: "Trader",
      description: "Full trading access and account management",
      isSystem: true,
    },
  });

  const viewerRole = await prisma.role.create({
    data: {
      name: "viewer",
      displayName: "Viewer",
      description: "Read-only access to basic features",
      isSystem: true,
    },
  });

  // Assign permissions to roles

  // Super Admin gets all permissions
  for (const permission of createdPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: superAdminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Admin gets most permissions except super admin specific ones
  const adminPermissions = createdPermissions.filter(
    (p) => !p.resource.includes("ROLE") || p.action !== PermissionAction.MANAGE
  );
  for (const permission of adminPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Moderator gets user management and basic permissions
  const moderatorPermissions = createdPermissions.filter(
    (p) =>
      (p.resource === PermissionResource.USER &&
        p.action !== PermissionAction.DELETE) ||
      p.resource === PermissionResource.DASHBOARD ||
      (p.resource === PermissionResource.TRADE &&
        p.action === PermissionAction.READ) ||
      (p.resource === PermissionResource.TRADING_ACCOUNT &&
        p.action === PermissionAction.READ)
  );
  for (const permission of moderatorPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: moderatorRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Trader gets trading permissions
  const traderPermissions = createdPermissions.filter(
    (p) =>
      p.resource === PermissionResource.DASHBOARD ||
      (p.resource === PermissionResource.TRADING_ACCOUNT &&
        [
          PermissionAction.READ,
          PermissionAction.CREATE,
          PermissionAction.UPDATE,
        ].includes(p.action as any)) ||
      (p.resource === PermissionResource.TRADE &&
        [
          PermissionAction.READ,
          PermissionAction.CREATE,
          PermissionAction.UPDATE,
        ].includes(p.action as any)) ||
      (p.resource === PermissionResource.PROPFIRM &&
        p.action === PermissionAction.READ) ||
      (p.resource === PermissionResource.BROKER &&
        p.action === PermissionAction.READ) ||
      (p.resource === PermissionResource.SYMBOL &&
        p.action === PermissionAction.READ)
  );
  for (const permission of traderPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: traderRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Viewer gets only read permissions
  const viewerPermissions = createdPermissions.filter(
    (p) =>
      (p.resource === PermissionResource.DASHBOARD &&
        p.action === PermissionAction.READ) ||
      (p.resource === PermissionResource.TRADE &&
        p.action === PermissionAction.READ) ||
      (p.resource === PermissionResource.TRADING_ACCOUNT &&
        p.action === PermissionAction.READ) ||
      (p.resource === PermissionResource.PROPFIRM &&
        p.action === PermissionAction.READ) ||
      (p.resource === PermissionResource.BROKER &&
        p.action === PermissionAction.READ) ||
      (p.resource === PermissionResource.SYMBOL &&
        p.action === PermissionAction.READ)
  );
  for (const permission of viewerPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: viewerRole.id,
        permissionId: permission.id,
      },
    });
  }

  // ================================
  // 4. PROPFIRMS
  // ================================
  console.log("🏢 Creating propfirms...");

  const propfirms = [
    {
      id: "propfirm-ftmo-001",
      name: "ftmo",
      displayName: "FTMO",
      description: "Prop firm líder en el mercado con excelentes condiciones",
      website: "https://ftmo.com",
      logoUrl: "/images/propfirms/ftmo-logo.png",
    },
    {
      id: "propfirm-mff-001",
      name: "myforexfunds",
      displayName: "MyForexFunds",
      description: "Prop firm innovadora con múltiples fases de evaluación",
      website: "https://myforexfunds.com",
      logoUrl: "/images/propfirms/mff-logo.png",
    },
    {
      id: "propfirm-tft-001",
      name: "thefundedtrader",
      displayName: "The Funded Trader",
      description: "Prop firm con enfoque en traders profesionales",
      website: "https://thefundedtrader.com",
      logoUrl: "/images/propfirms/tft-logo.png",
    },
  ];

  const createdPropFirms = [];
  for (const propfirm of propfirms) {
    const created = await prisma.propfirm.create({ data: propfirm });
    createdPropFirms.push(created);
  }

  // Create phases for FTMO
  const ftmo = createdPropFirms[0];
  if (!ftmo) throw new Error("FTMO propfirm not created");
  const ftmoPhases = [];
  const phases = [
    {
      phaseName: "challenge",
      displayName: "Challenge Phase",
      displayOrder: 1,
      isEvaluation: true,
    },
    {
      phaseName: "verification",
      displayName: "Verification Phase",
      displayOrder: 2,
      isEvaluation: true,
    },
    {
      phaseName: "funded",
      displayName: "Funded Account",
      displayOrder: 3,
      isEvaluation: false,
    },
  ];

  for (const phase of phases) {
    const created = await prisma.propfirmPhase.create({
      data: {
        propfirmId: ftmo.id,
        ...phase,
      },
    });
    ftmoPhases.push(created);
  }

  // Create account types for FTMO
  const ftmoAccountTypes = [];
  const accountTypes = [
    { typeName: "10k", displayName: "10,000 USD", initialBalance: 10000 },
    { typeName: "25k", displayName: "25,000 USD", initialBalance: 25000 },
    { typeName: "50k", displayName: "50,000 USD", initialBalance: 50000 },
    { typeName: "100k", displayName: "100,000 USD", initialBalance: 100000 },
  ];

  for (const accountType of accountTypes) {
    const created = await prisma.propfirmAccountType.create({
      data: {
        propfirmId: ftmo.id,
        ...accountType,
      },
    });
    ftmoAccountTypes.push(created);
  }

  // Create rules configuration for FTMO
  const challengePhase = ftmoPhases[0];
  if (!challengePhase) throw new Error("Challenge phase not created");
  for (const accountType of ftmoAccountTypes) {
    await prisma.propfirmRulesConfiguration.create({
      data: {
        propfirmId: ftmo.id,
        accountTypeId: accountType.id,
        phaseId: challengePhase.id,
        maxDrawdown: 10.0,
        dailyDrawdown: 5.0,
        profitTarget: 10.0,
      },
    });
  }

  // Create phases and account types for MyForexFunds
  const mff = createdPropFirms[1];
  if (mff) {
    const mffPhases = [];
    const mffPhaseData = [
      {
        phaseName: "challenge",
        displayName: "Challenge Phase",
        displayOrder: 1,
        isEvaluation: true,
      },
      {
        phaseName: "verification",
        displayName: "Verification Phase",
        displayOrder: 2,
        isEvaluation: true,
      },
      {
        phaseName: "funded",
        displayName: "Funded Account",
        displayOrder: 3,
        isEvaluation: false,
      },
    ];

    for (const phase of mffPhaseData) {
      const created = await prisma.propfirmPhase.create({
        data: {
          propfirmId: mff.id,
          ...phase,
        },
      });
      mffPhases.push(created);
    }

    const mffAccountTypes = [];
    const mffAccountTypeData = [
      { typeName: "10k", displayName: "10,000 USD", initialBalance: 10000 },
      { typeName: "25k", displayName: "25,000 USD", initialBalance: 25000 },
      { typeName: "50k", displayName: "50,000 USD", initialBalance: 50000 },
      { typeName: "100k", displayName: "100,000 USD", initialBalance: 100000 },
      { typeName: "200k", displayName: "200,000 USD", initialBalance: 200000 },
    ];

    for (const accountType of mffAccountTypeData) {
      const created = await prisma.propfirmAccountType.create({
        data: {
          propfirmId: mff.id,
          ...accountType,
        },
      });
      mffAccountTypes.push(created);
    }

    // Create rules configuration for MFF
    const mffChallengePhase = mffPhases[0];
    if (!mffChallengePhase) throw new Error("MFF Challenge phase not created");
    for (const accountType of mffAccountTypes) {
      await prisma.propfirmRulesConfiguration.create({
        data: {
          propfirmId: mff.id,
          accountTypeId: accountType.id,
          phaseId: mffChallengePhase.id,
          maxDrawdown: 12.0,
          dailyDrawdown: 6.0,
          profitTarget: 8.0,
        },
      });
    }
  }

  // Create phases and account types for The Funded Trader
  const tft = createdPropFirms[2];
  if (tft) {
    const tftPhases = [];
    const tftPhaseData = [
      {
        phaseName: "challenge",
        displayName: "Challenge Phase",
        displayOrder: 1,
        isEvaluation: true,
      },
      {
        phaseName: "verification",
        displayName: "Verification Phase",
        displayOrder: 2,
        isEvaluation: true,
      },
      {
        phaseName: "funded",
        displayName: "Funded Account",
        displayOrder: 3,
        isEvaluation: false,
      },
    ];

    for (const phase of tftPhaseData) {
      const created = await prisma.propfirmPhase.create({
        data: {
          propfirmId: tft.id,
          ...phase,
        },
      });
      tftPhases.push(created);
    }

    const tftAccountTypes = [];
    const tftAccountTypeData = [
      { typeName: "5k", displayName: "5,000 USD", initialBalance: 5000 },
      { typeName: "10k", displayName: "10,000 USD", initialBalance: 10000 },
      { typeName: "25k", displayName: "25,000 USD", initialBalance: 25000 },
      { typeName: "50k", displayName: "50,000 USD", initialBalance: 50000 },
      { typeName: "100k", displayName: "100,000 USD", initialBalance: 100000 },
      { typeName: "200k", displayName: "200,000 USD", initialBalance: 200000 },
    ];

    for (const accountType of tftAccountTypeData) {
      const created = await prisma.propfirmAccountType.create({
        data: {
          propfirmId: tft.id,
          ...accountType,
        },
      });
      tftAccountTypes.push(created);
    }

    // Create rules configuration for TFT
    const tftChallengePhase = tftPhases[0];
    if (!tftChallengePhase) throw new Error("TFT Challenge phase not created");
    for (const accountType of tftAccountTypes) {
      await prisma.propfirmRulesConfiguration.create({
        data: {
          propfirmId: tft.id,
          accountTypeId: accountType.id,
          phaseId: tftChallengePhase.id,
          maxDrawdown: 8.0,
          dailyDrawdown: 4.0,
          profitTarget: 12.0,
        },
      });
    }
  }

  // ================================
  // 5. BROKERS
  // ================================
  console.log("🏦 Creating brokers...");

  const brokers = [
    {
      id: "broker-oanda-001",
      name: "oanda",
      displayName: "OANDA",
      description: "Broker regulado con excelente liquidez",
      website: "https://oanda.com",
      logoUrl: "/images/brokers/oanda-logo.png",
    },
    {
      id: "broker-icmarkets-001",
      name: "icmarkets",
      displayName: "IC Markets",
      description: "Broker ECN con spreads competitivos",
      website: "https://icmarkets.com",
      logoUrl: "/images/brokers/icmarkets-logo.png",
    },
    {
      id: "broker-pepperstone-001",
      name: "pepperstone",
      displayName: "Pepperstone",
      description: "Broker australiano con tecnología avanzada",
      website: "https://pepperstone.com",
      logoUrl: "/images/brokers/pepperstone-logo.png",
    },
  ];

  const createdBrokers = [];
  for (const broker of brokers) {
    const created = await prisma.broker.create({ data: broker });
    createdBrokers.push(created);
  }

  // ================================
  // 6. SYMBOLS
  // ================================
  console.log("📈 Creating symbols...");

  const symbols = [
    {
      symbol: "EURUSD",
      displayName: "Euro/US Dollar",
      category: SymbolCategory.FOREX,
      baseCurrency: "EUR",
      quoteCurrency: "USD",
      pipDecimalPosition: 4,
    },
    {
      symbol: "GBPUSD",
      displayName: "Pound/US Dollar",
      category: SymbolCategory.FOREX,
      baseCurrency: "GBP",
      quoteCurrency: "USD",
      pipDecimalPosition: 4,
    },
    {
      symbol: "USDJPY",
      displayName: "US Dollar/Japanese Yen",
      category: SymbolCategory.FOREX,
      baseCurrency: "USD",
      quoteCurrency: "JPY",
      pipDecimalPosition: 2,
    },
    {
      symbol: "AUDUSD",
      displayName: "Australian Dollar/US Dollar",
      category: SymbolCategory.FOREX,
      baseCurrency: "AUD",
      quoteCurrency: "USD",
      pipDecimalPosition: 4,
    },
    {
      symbol: "USDCAD",
      displayName: "US Dollar/Canadian Dollar",
      category: SymbolCategory.FOREX,
      baseCurrency: "USD",
      quoteCurrency: "CAD",
      pipDecimalPosition: 4,
    },
    {
      symbol: "NZDUSD",
      displayName: "New Zealand Dollar/US Dollar",
      category: SymbolCategory.FOREX,
      baseCurrency: "NZD",
      quoteCurrency: "USD",
      pipDecimalPosition: 4,
    },
    {
      symbol: "EURJPY",
      displayName: "Euro/Japanese Yen",
      category: SymbolCategory.FOREX,
      baseCurrency: "EUR",
      quoteCurrency: "JPY",
      pipDecimalPosition: 2,
    },
    {
      symbol: "GBPJPY",
      displayName: "Pound/Japanese Yen",
      category: SymbolCategory.FOREX,
      baseCurrency: "GBP",
      quoteCurrency: "JPY",
      pipDecimalPosition: 2,
    },
    {
      symbol: "XAUUSD",
      displayName: "Gold/US Dollar",
      category: SymbolCategory.COMMODITIES,
      baseCurrency: "XAU",
      quoteCurrency: "USD",
      pipDecimalPosition: 2,
    },
    {
      symbol: "USOIL",
      displayName: "Crude Oil WTI",
      category: SymbolCategory.COMMODITIES,
      baseCurrency: "OIL",
      quoteCurrency: "USD",
      pipDecimalPosition: 2,
    },
    {
      symbol: "SPX500",
      displayName: "S&P 500",
      category: SymbolCategory.INDICES,
      baseCurrency: "SPX",
      quoteCurrency: "USD",
      pipDecimalPosition: 2,
    },
    {
      symbol: "NAS100",
      displayName: "NASDAQ 100",
      category: SymbolCategory.INDICES,
      baseCurrency: "NAS",
      quoteCurrency: "USD",
      pipDecimalPosition: 2,
    },
    {
      symbol: "BTCUSD",
      displayName: "Bitcoin/US Dollar",
      category: SymbolCategory.CRYPTO,
      baseCurrency: "BTC",
      quoteCurrency: "USD",
      pipDecimalPosition: 2,
    },
    {
      symbol: "ETHUSD",
      displayName: "Ethereum/US Dollar",
      category: SymbolCategory.CRYPTO,
      baseCurrency: "ETH",
      quoteCurrency: "USD",
      pipDecimalPosition: 2,
    },
  ];

  const allSymbols: any[] = [];
  for (const symbol of symbols) {
    const created = await prisma.symbol.create({ data: symbol });
    allSymbols.push(created);
  }

  // ================================
  // 7. SYMBOL CONFIGURATIONS
  // ================================
  console.log("⚙️ Creating symbol configurations...");

  const oanda = createdBrokers[0];
  const icmarkets = createdBrokers[1];
  if (!oanda || !icmarkets) throw new Error("Brokers not created");

  // OANDA configurations
  for (const symbol of allSymbols) {
    await prisma.symbolConfiguration.create({
      data: {
        brokerId: oanda.id,
        symbolId: symbol.id,
        pipValuePerLot:
          symbol.category === "FOREX"
            ? 10.0
            : symbol.category === "CRYPTO"
              ? 1.0
              : 1.0,
        pipTicks:
          symbol.category === "FOREX" && symbol.quoteCurrency === "JPY"
            ? 1
            : 10,
        spreadTypical:
          symbol.category === "FOREX"
            ? 1.5
            : symbol.category === "CRYPTO"
              ? 50.0
              : 0.5,
        spreadRecommended:
          symbol.category === "FOREX"
            ? 1.2
            : symbol.category === "CRYPTO"
              ? 45.0
              : 0.4,
      },
    });
  }

  // IC Markets configurations
  for (const symbol of allSymbols) {
    await prisma.symbolConfiguration.create({
      data: {
        brokerId: icmarkets.id,
        symbolId: symbol.id,
        pipValuePerLot:
          symbol.category === "FOREX"
            ? 10.0
            : symbol.category === "CRYPTO"
              ? 1.0
              : 1.0,
        pipTicks:
          symbol.category === "FOREX" && symbol.quoteCurrency === "JPY"
            ? 1
            : 10,
        spreadTypical:
          symbol.category === "FOREX"
            ? 0.8
            : symbol.category === "CRYPTO"
              ? 25.0
              : 0.3,
        spreadRecommended:
          symbol.category === "FOREX"
            ? 0.6
            : symbol.category === "CRYPTO"
              ? 20.0
              : 0.2,
      },
    });
  }

  // ================================
  // 8. USER CREATION (ALL ROLES)
  // ================================
  console.log("👥 Creating users of all types...");

  const users = [
    {
      name: "Super Admin",
      email: "superadmin@feniz.com",
      password: "SuperAdmin123!@#",
      phone: "+1 (555) 000-0001",
      language: "EN" as const,
      defaultRiskPercentage: 0.0,
      role: superAdminRole,
    },
    {
      name: "Admin User",
      email: "admin@feniz.com",
      password: "Admin123!@#",
      phone: "+1 (555) 000-0002",
      language: "EN" as const,
      defaultRiskPercentage: 0.5,
      role: adminRole,
    },
    {
      name: "Moderator User",
      email: "moderator@feniz.com",
      password: "Moderator123!@#",
      phone: "+1 (555) 000-0003",
      language: "ES" as const,
      defaultRiskPercentage: 1.0,
      role: moderatorRole,
    },
    {
      name: "Alex Trader",
      email: "trader@feniz.com",
      password: "Trader123!@#",
      phone: "+1 (555) 987-6543",
      language: "ES" as const,
      defaultRiskPercentage: 1.5,
      role: traderRole,
    },
    {
      name: "Maria Rodriguez",
      email: "maria@feniz.com",
      password: "Maria123!@#",
      phone: "+1 (555) 123-4567",
      language: "ES" as const,
      defaultRiskPercentage: 2.0,
      role: traderRole,
    },
    {
      name: "John Smith",
      email: "john@feniz.com",
      password: "John123!@#",
      phone: "+1 (555) 456-7890",
      language: "EN" as const,
      defaultRiskPercentage: 1.0,
      role: traderRole,
    },
    {
      name: "Ana Silva",
      email: "ana@feniz.com",
      password: "Ana123!@#",
      phone: "+55 (11) 98765-4321",
      language: "PT" as const,
      defaultRiskPercentage: 1.8,
      role: traderRole,
    },
    {
      name: "Viewer User",
      email: "viewer@feniz.com",
      password: "Viewer123!@#",
      phone: "+1 (555) 000-0004",
      language: "EN" as const,
      defaultRiskPercentage: 0.0,
      role: viewerRole,
    },
  ];

  const createdUsers = [];

  for (const userData of users) {
    try {
      console.log(`🆕 Creating user: ${userData.email}`);

      const result = await auth.api.signUpEmail({
        body: {
          email: userData.email,
          password: userData.password,
          name: userData.name,
        },
      });

      if (!result.user) {
        console.error(
          `❌ Failed to create user ${userData.email}: No user returned`
        );
        continue;
      }

      // Update additional fields
      const newUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (newUser) {
        await prisma.user.update({
          where: { id: newUser.id },
          data: {
            phone: userData.phone,
            language: userData.language,
            defaultRiskPercentage: userData.defaultRiskPercentage,
            emailVerified: true,
            image: "/images/avatars/default-avatar.png",
          },
        });

        // Assign role
        await prisma.userRole.create({
          data: {
            userId: newUser.id,
            roleId: userData.role.id,
            assignedBy: "system",
          },
        });

        // Create subscription
        const subscription = await prisma.userSubscription.create({
          data: {
            id: `subscription-${newUser.id}`,
            userId: newUser.id,
            plan: userData.role.name === "viewer" ? "FREE" : "PREMIUM",
            status: "ACTIVE",
            paymentProvider: "STRIPE",
            providerCustomerId: `cus_${newUser.id}`,
            providerSubscriptionId: `sub_${newUser.id}`,
            currentPlanStart: new Date("2024-01-01"),
            currentPlanEnd: new Date("2025-01-01"),
          },
        });

        // Create payments for non-free plans
        if (subscription.plan !== "FREE") {
          const paymentAmounts = {
            BASIC: 29.99,
            PREMIUM: 59.99,
            ENTERPRISE: 199.99,
          };

          const amount =
            paymentAmounts[subscription.plan as keyof typeof paymentAmounts] ||
            29.99;

          // Create initial payment
          await prisma.userPayment.create({
            data: {
              id: `payment-initial-${newUser.id}`,
              userId: newUser.id,
              subscriptionId: subscription.id,
              paymentProvider: "STRIPE",
              providerPaymentId: `pi_${newUser.id}_initial`,
              amount: amount,
              currency: "USD",
              status: "COMPLETED",
              paymentMethod: "card",
              description: `Initial payment for ${subscription.plan} plan`,
              paidAt: new Date("2024-01-01"),
            },
          });

          // Create monthly recurring payments (last 6 months)
          for (let i = 1; i <= 6; i++) {
            const paymentDate = new Date("2024-01-01");
            paymentDate.setMonth(paymentDate.getMonth() + i);

            const status = Math.random() > 0.1 ? "COMPLETED" : "FAILED"; // 90% success rate

            await prisma.userPayment.create({
              data: {
                id: `payment-${i}-${newUser.id}`,
                userId: newUser.id,
                subscriptionId: subscription.id,
                paymentProvider: "STRIPE",
                providerPaymentId: `pi_${newUser.id}_${i}`,
                amount: amount,
                currency: "USD",
                status: status,
                paymentMethod: "card",
                description: `Monthly payment ${i} for ${subscription.plan} plan`,
                paidAt: status === "COMPLETED" ? paymentDate : null,
                failedAt: status === "FAILED" ? paymentDate : null,
              },
            });
          }
        }

        createdUsers.push(newUser);
        console.log(
          `✅ User ${userData.email} created successfully with role ${userData.role.name}`
        );
      }
    } catch (error: any) {
      console.error(
        `❌ Error creating user ${userData.email}:`,
        error.message || error
      );
    }
  }

  // Get the first trader for trading accounts and trades
  const traderUser = createdUsers.find((u) => u.email === "trader@feniz.com");
  if (!traderUser) {
    throw new Error("Trader user not found");
  }

  // ================================
  // 9. TRADING ACCOUNTS (for trader)
  // ================================
  console.log("💼 Creating trading accounts...");

  const fundedPhase = ftmoPhases[2];
  if (!fundedPhase) throw new Error("Funded phase not created");

  const tradingAccounts = [
    {
      id: "account-ftmo-10k-001",
      accountName: "FTMO 10K Challenge",
      accountType: "PROPFIRM" as const,
      accountNumber: "FTMO-10K-001",
      server: "FTMO-Server-1",
      propfirmId: ftmo.id,
      accountTypeId: ftmoAccountTypes[0]?.id,
      currentPhaseId: challengePhase.id,
      initialBalance: 10000,
      currentBalance: 10250.75,
      equity: 10250.75,
      status: "active",
    },
    {
      id: "account-ftmo-25k-001",
      accountName: "FTMO 25K Funded",
      accountType: "PROPFIRM" as const,
      accountNumber: "FTMO-25K-001",
      server: "FTMO-Server-1",
      propfirmId: ftmo.id,
      accountTypeId: ftmoAccountTypes[1]?.id,
      currentPhaseId: fundedPhase.id,
      initialBalance: 25000,
      currentBalance: 26750.25,
      equity: 26750.25,
      status: "active",
    },
    {
      id: "account-oanda-001",
      accountName: "OANDA Live Account",
      accountType: "BROKER" as const,
      accountNumber: "OANDA-001",
      server: "OANDA-Live",
      brokerId: oanda.id,
      initialBalance: 5000,
      currentBalance: 5234.5,
      equity: 5234.5,
      status: "active",
    },
    {
      id: "account-icmarkets-001",
      accountName: "IC Markets Live",
      accountType: "BROKER" as const,
      accountNumber: "ICM-001",
      server: "ICM-Live",
      brokerId: icmarkets.id,
      initialBalance: 3000,
      currentBalance: 3156.8,
      equity: 3156.8,
      status: "active",
    },
  ];

  const createdTradingAccounts = [];
  for (const account of tradingAccounts) {
    const created = await prisma.tradingAccount.create({
      data: {
        ...account,
        userId: traderUser.id,
      },
    });
    createdTradingAccounts.push(created);
  }

  // ================================
  // 10. ACCOUNT LINKS (CONEXIONES)
  // ================================
  console.log("🔗 Creating account links...");

  const ftmoAccounts = createdTradingAccounts.filter(
    (acc) => acc.accountType === "PROPFIRM"
  );
  const brokerAccounts = createdTradingAccounts.filter(
    (acc) => acc.accountType === "BROKER"
  );

  const accountLinks = [
    {
      id: "link-ftmo-oanda-001",
      propfirmAccountId: ftmoAccounts[1]?.id,
      brokerAccountId: brokerAccounts[0]?.id,
      autoCopyEnabled: true,
      maxRiskPerTrade: 2.0,
      lastCopyAt: new Date(),
    },
    {
      id: "link-ftmo-icmarkets-001",
      propfirmAccountId: ftmoAccounts[0]?.id,
      brokerAccountId: brokerAccounts[1]?.id,
      autoCopyEnabled: false,
      maxRiskPerTrade: 1.5,
      lastCopyAt: null,
    },
  ];

  const createdAccountLinks = [];
  for (const link of accountLinks) {
    if (link.propfirmAccountId && link.brokerAccountId) {
      const created = await prisma.accountLink.create({
        data: {
          id: link.id,
          userId: traderUser.id,
          propfirmAccountId: link.propfirmAccountId,
          brokerAccountId: link.brokerAccountId,
          autoCopyEnabled: link.autoCopyEnabled,
          maxRiskPerTrade: link.maxRiskPerTrade,
          lastCopyAt: link.lastCopyAt,
        },
      });
      createdAccountLinks.push(created);
    }
  }

  // ================================
  // 11. TRADES GENERATION (OPERACIONES DE PRUEBA)
  // ================================
  console.log("📊 Creating test trades for connections...");

  // Datos de prueba basados en el formato proporcionado
  const testTradesData = [
    // Primera conexión - FTMO 25K con OANDA
    {
      connectionId: "link-ftmo-oanda-001",
      propfirmTrades: [
        {
          externalTradeId: "159351633",
          symbol: "EURUSD",
          direction: "sell",
          lotSize: 13.33,
          entryPrice: 1.12457,
          exitPrice: 1.12607,
          stopLoss: 1.12081,
          takeProfit: 1.12608,
          openTime: "2025-05-20T14:01:05",
          closeTime: "2025-05-20T17:09:52",
          profitLoss: -40.0,
          commission: 0,
          swap: 0,
          netProfit: -2012.83,
          entryMethod: "MANUAL" as const,
          notes: "Operación de prueba - EURUSD Sell",
        },
        {
          externalTradeId: "159351634",
          symbol: "GBPUSD",
          direction: "buy",
          lotSize: 5.25,
          entryPrice: 1.26543,
          exitPrice: 1.2689,
          stopLoss: 1.262,
          takeProfit: 1.27,
          openTime: "2025-05-20T10:30:15",
          closeTime: "2025-05-20T15:45:30",
          profitLoss: 182.25,
          commission: -26.25,
          swap: 5.5,
          netProfit: 161.5,
          entryMethod: "API" as const,
          notes: "Operación de prueba - GBPUSD Buy",
        },
        {
          externalTradeId: "159351635",
          symbol: "USDJPY",
          direction: "sell",
          lotSize: 8.75,
          entryPrice: 149.85,
          exitPrice: 149.42,
          stopLoss: 150.2,
          takeProfit: 149.0,
          openTime: "2025-05-19T16:20:10",
          closeTime: "2025-05-20T08:15:45",
          profitLoss: 376.25,
          commission: -43.75,
          swap: -12.3,
          netProfit: 320.2,
          entryMethod: "COPY_TRADING" as const,
          notes: "Operación de prueba - USDJPY Sell",
        },
        {
          externalTradeId: "159351636",
          symbol: "XAUUSD",
          direction: "buy",
          lotSize: 2.1,
          entryPrice: 2015.5,
          exitPrice: 2022.8,
          stopLoss: 2010.0,
          takeProfit: 2025.0,
          openTime: "2025-05-19T12:45:20",
          closeTime: "2025-05-19T18:30:15",
          profitLoss: 153.3,
          commission: -10.5,
          swap: 8.75,
          netProfit: 151.55,
          entryMethod: "MANUAL" as const,
          notes: "Operación de prueba - Gold Buy",
        },
      ],
      brokerTrades: [
        {
          externalTradeId: "99120719",
          symbol: "EURUSD",
          direction: "buy",
          lotSize: 1.32,
          entryPrice: 1.12461,
          exitPrice: 1.12081,
          stopLoss: 1.12607,
          takeProfit: 1.12613,
          openTime: "2025-05-20T14:01:05",
          closeTime: "2025-05-20T17:09:52",
          profitLoss: -7.52,
          commission: 0,
          swap: 200.64,
          netProfit: 193.12,
          entryMethod: "MANUAL" as const,
          notes: "Operación de prueba - EURUSD Buy (Broker)",
        },
        {
          externalTradeId: "99120720",
          symbol: "GBPUSD",
          direction: "sell",
          lotSize: 2.5,
          entryPrice: 1.265,
          exitPrice: 1.2685,
          stopLoss: 1.262,
          takeProfit: 1.27,
          openTime: "2025-05-20T10:30:15",
          closeTime: "2025-05-20T15:45:30",
          profitLoss: -87.5,
          commission: -12.5,
          swap: -8.25,
          netProfit: -108.25,
          entryMethod: "API" as const,
          notes: "Operación de prueba - GBPUSD Sell (Broker)",
        },
        {
          externalTradeId: "99120721",
          symbol: "USDJPY",
          direction: "buy",
          lotSize: 4.2,
          entryPrice: 149.9,
          exitPrice: 149.5,
          stopLoss: 150.3,
          takeProfit: 149.2,
          openTime: "2025-05-19T16:20:10",
          closeTime: "2025-05-20T08:15:45",
          profitLoss: -168.0,
          commission: -21.0,
          swap: 15.75,
          netProfit: -173.25,
          entryMethod: "COPY_TRADING" as const,
          notes: "Operación de prueba - USDJPY Buy (Broker)",
        },
        {
          externalTradeId: "99120722",
          symbol: "XAUUSD",
          direction: "sell",
          lotSize: 1.05,
          entryPrice: 2018.2,
          exitPrice: 2020.5,
          stopLoss: 2015.0,
          takeProfit: 2022.0,
          openTime: "2025-05-19T12:45:20",
          closeTime: "2025-05-19T18:30:15",
          profitLoss: -24.15,
          commission: -5.25,
          swap: -3.5,
          netProfit: -32.9,
          entryMethod: "MANUAL" as const,
          notes: "Operación de prueba - Gold Sell (Broker)",
        },
      ],
    },
    // Segunda conexión - FTMO 10K con IC Markets
    {
      connectionId: "link-ftmo-icmarkets-001",
      propfirmTrades: [
        {
          externalTradeId: "159351637",
          symbol: "AUDUSD",
          direction: "buy",
          lotSize: 7.5,
          entryPrice: 0.6589,
          exitPrice: 0.6623,
          stopLoss: 0.656,
          takeProfit: 0.664,
          openTime: "2025-05-21T09:15:30",
          closeTime: "2025-05-21T14:20:45",
          profitLoss: 255.0,
          commission: -37.5,
          swap: 12.25,
          netProfit: 229.75,
          entryMethod: "MANUAL" as const,
          notes: "Operación de prueba - AUDUSD Buy",
        },
        {
          externalTradeId: "159351638",
          symbol: "USDCAD",
          direction: "sell",
          lotSize: 6.25,
          entryPrice: 1.3645,
          exitPrice: 1.3618,
          stopLoss: 1.367,
          takeProfit: 1.36,
          openTime: "2025-05-20T11:45:20",
          closeTime: "2025-05-20T16:30:10",
          profitLoss: 168.75,
          commission: -31.25,
          swap: -8.75,
          netProfit: 128.75,
          entryMethod: "API" as const,
          notes: "Operación de prueba - USDCAD Sell",
        },
      ],
      brokerTrades: [
        {
          externalTradeId: "99120723",
          symbol: "AUDUSD",
          direction: "sell",
          lotSize: 3.75,
          entryPrice: 0.6592,
          exitPrice: 0.6625,
          stopLoss: 0.6565,
          takeProfit: 0.6645,
          openTime: "2025-05-21T09:15:30",
          closeTime: "2025-05-21T14:20:45",
          profitLoss: -123.75,
          commission: -18.75,
          swap: -6.25,
          netProfit: -148.75,
          entryMethod: "MANUAL" as const,
          notes: "Operación de prueba - AUDUSD Sell (Broker)",
        },
        {
          externalTradeId: "99120724",
          symbol: "USDCAD",
          direction: "buy",
          lotSize: 3.1,
          entryPrice: 1.3648,
          exitPrice: 1.3622,
          stopLoss: 1.368,
          takeProfit: 1.361,
          openTime: "2025-05-20T11:45:20",
          closeTime: "2025-05-20T16:30:10",
          profitLoss: -80.6,
          commission: -15.5,
          swap: 4.35,
          netProfit: -91.75,
          entryMethod: "API" as const,
          notes: "Operación de prueba - USDCAD Buy (Broker)",
        },
      ],
    },
  ];

  // Crear operaciones para cada conexión
  for (const connectionData of testTradesData) {
    const connection = createdAccountLinks.find(
      (link) => link.id === connectionData.connectionId
    );
    if (!connection) continue;

    const propfirmAccount = await prisma.tradingAccount.findUnique({
      where: { id: connection.propfirmAccountId },
    });

    const brokerAccount = await prisma.tradingAccount.findUnique({
      where: { id: connection.brokerAccountId },
    });

    if (!propfirmAccount || !brokerAccount) continue;

    // Crear operaciones del propfirm
    for (const tradeData of connectionData.propfirmTrades) {
      const symbol = allSymbols.find((s) => s.symbol === tradeData.symbol);
      if (!symbol) continue;

      await prisma.trade.create({
        data: {
          externalTradeId: tradeData.externalTradeId,
          accountId: propfirmAccount.id,
          symbolId: symbol.id,
          direction: tradeData.direction,
          entryPrice: tradeData.entryPrice,
          exitPrice: tradeData.exitPrice,
          lotSize: tradeData.lotSize,
          stopLoss: tradeData.stopLoss,
          takeProfit: tradeData.takeProfit,
          openTime: new Date(tradeData.openTime),
          closeTime: new Date(tradeData.closeTime),
          profitLoss: tradeData.profitLoss,
          commission: tradeData.commission,
          swap: tradeData.swap,
          netProfit: tradeData.netProfit,
          status: "CLOSED" as const,
          entryMethod: tradeData.entryMethod,
          notes: tradeData.notes,
        },
      });
    }

    // Crear operaciones del broker
    for (const tradeData of connectionData.brokerTrades) {
      const symbol = allSymbols.find((s) => s.symbol === tradeData.symbol);
      if (!symbol) continue;

      await prisma.trade.create({
        data: {
          externalTradeId: tradeData.externalTradeId,
          accountId: brokerAccount.id,
          symbolId: symbol.id,
          direction: tradeData.direction,
          entryPrice: tradeData.entryPrice,
          exitPrice: tradeData.exitPrice,
          lotSize: tradeData.lotSize,
          stopLoss: tradeData.stopLoss,
          takeProfit: tradeData.takeProfit,
          openTime: new Date(tradeData.openTime),
          closeTime: new Date(tradeData.closeTime),
          profitLoss: tradeData.profitLoss,
          commission: tradeData.commission,
          swap: tradeData.swap,
          netProfit: tradeData.netProfit,
          status: "CLOSED" as const,
          entryMethod: tradeData.entryMethod,
          notes: tradeData.notes,
        },
      });
    }
  }

  console.log("✅ Complete seed finished successfully!");
  console.log(`
📊 Summary:
- Company: Feniz Trading Platform
- Users: ${createdUsers.length} users (1 super admin, 1 admin, 1 moderator, 4 traders, 1 viewer)
- Propfirms: ${createdPropFirms.length} (FTMO, MyForexFunds, The Funded Trader)
- Brokers: ${createdBrokers.length} (OANDA, IC Markets, Pepperstone)
- Symbols: ${allSymbols.length} (Forex, Crypto, Commodities, Indices)
- Trading Accounts: ${createdTradingAccounts.length}
- Account Links: ${createdAccountLinks.length}
- Test Trades: 10 trades (4 propfirm + 4 broker for first connection, 2 propfirm + 2 broker for second connection)
- Roles & Permissions: Complete RBAC system

🔐 Login Credentials:
- Super Admin: superadmin@feniz.com / SuperAdmin123!@#
- Admin: admin@feniz.com / Admin123!@#
- Moderator: moderator@feniz.com / Moderator123!@#
- Trader: trader@feniz.com / Trader123!@#
- Trader: maria@feniz.com / Maria123!@#
- Trader: john@feniz.com / John123!@#
- Trader: ana@feniz.com / Ana123!@#
- Viewer: viewer@feniz.com / Viewer123!@#

📈 Test Operations Created:
- Connection 1: FTMO 25K ↔ OANDA (8 trades: 4 propfirm + 4 broker)
- Connection 2: FTMO 10K ↔ IC Markets (4 trades: 2 propfirm + 2 broker)
- Symbols: EURUSD, GBPUSD, USDJPY, XAUUSD, AUDUSD, USDCAD
- All trades include externalTradeId (position numbers)
  `);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
