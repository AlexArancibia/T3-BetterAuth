"use client";

import { PaymentManager } from "@/components/PaymentManager";
import { SubscriptionManager } from "@/components/SubscriptionManager";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollableTable } from "@/components/ui/scrollable-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/utils/trpc";
import {
  Activity,
  ArrowDownRight,
  BarChart3,
  Cable,
  DollarSign,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react";
import { useParams } from "next/navigation";

// Type for trading account with relations
type TradingAccount = {
  id: string;
  userId: string;
  accountName: string;
  accountType: "PROPFIRM" | "BROKER";
  accountNumber: string | null;
  server: string | null;
  propfirmId: string | null;
  brokerId: string | null;
  accountTypeId: string | null;
  initialBalance: string | number;
  currentBalance: string | number;
  equity: string | number;
  accountCost: string | number | null;
  currentPhaseId: string | null;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  propfirm: {
    name: string;
    displayName: string;
  } | null;
  broker: {
    name: string;
    displayName: string;
  } | null;
  accountTypeDetails: {
    name: string;
    displayName: string;
  } | null;
  currentPhase: {
    id: string;
    createdAt: string;
    updatedAt: string;
    propfirmId: string;
    isActive: boolean;
    displayName: string;
    phaseName: string;
    displayOrder: number;
    isEvaluation: boolean;
  } | null;
};

// Type for trade
type Trade = {
  id: string;
  externalTradeId: string | null;
  accountId: string;
  symbolId: string;
  symbol: {
    symbol: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    displayName: string;
    category: string;
    baseCurrency: string;
    quoteCurrency: string;
    pipDecimalPosition: number;
  };
  direction: "buy" | "sell";
  lotSize: string | number;
  entryPrice: string | number;
  exitPrice: string | number | null;
  stopLoss: string | number | null;
  takeProfit: string | number | null;
  profitLoss: string | number;
  commission: string | number;
  swap: string | number;
  netProfit: string | number;
  status: "OPEN" | "CLOSED" | "CANCELLED" | "PARTIALLY_CLOSED";
  entryMethod: "MANUAL" | "API" | "COPY_TRADING";
  openTime: Date | string;
  closeTime: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  account: {
    accountName: string;
  };
  notes: string | null;
};

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;

  // Get user details
  const { data: user, isLoading: userLoading } = trpc.user.getById.useQuery({
    id: userId,
  });

  // Get user roles
  const { data: userRoles, isLoading: rolesLoading } =
    trpc.user.getUserRoles.useQuery({ userId });

  // Get user trading accounts (if trader)
  const { data: userTradingAccounts, isLoading: accountsLoading } =
    trpc.tradingAccount.getByUserId.useQuery({ userId });

  // Get user trades (if trader)
  const { data: userTrades, isLoading: tradesLoading } =
    trpc.trade.getByUserId.useQuery({ userId });

  // Get user account links (if trader)
  const { data: userAccountLinks } = trpc.accountLink.getByUserId.useQuery({
    userId,
  });

  // Get user subscriptions
  const { data: userSubscriptions } = trpc.subscription.getByUserId.useQuery({
    userId,
  });

  // Get user payments
  const { data: userPayments } = trpc.payment.getByUserId.useQuery({
    userId,
    page: 1,
    limit: 10,
  });

  // Get subscription statistics
  trpc.subscription.getStats.useQuery({ userId });

  // Get payment statistics
  trpc.payment.getStats.useQuery({ userId });

  const isLoading = userLoading || rolesLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={`skeleton-${i + 1}`}
              className="h-32 bg-muted rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Usuario no encontrado
          </h2>
          <p className="text-muted-foreground">
            El usuario que buscas no existe o no tienes permisos para verlo.
          </p>
        </div>
      </div>
    );
  }

  const isTrader = userRoles?.some((role) => role.roleDisplayName === "Trader");

  // Calculate trader stats if user is a trader
  const totalBalance = isTrader
    ? userTradingAccounts?.reduce(
        (sum, acc) => sum + Number(acc.currentBalance),
        0
      ) || 0
    : 0;
  const totalPnL = isTrader
    ? userTrades?.reduce((sum, trade) => sum + Number(trade.netProfit), 0) || 0
    : 0;
  const activeConnections = isTrader
    ? userAccountLinks?.filter((link) => link.isActive).length || 0
    : 0;

  const closedTrades = isTrader
    ? userTrades?.filter((trade) => trade.status === "CLOSED") || []
    : [];
  const winningTrades = closedTrades.filter(
    (trade) => Number(trade.netProfit) > 0
  );
  const winRate =
    closedTrades.length > 0
      ? (winningTrades.length / closedTrades.length) * 100
      : 0;

  // Trading accounts columns
  const tradingAccountsColumns = [
    {
      key: "accountName",
      title: "Cuenta",
      render: (_: unknown, record: TradingAccount) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Wallet className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">
              {record.accountName}
            </div>
            <div className="text-xs text-muted-foreground">
              {record.accountType === "PROPFIRM"
                ? record.propfirm?.displayName
                : record.broker?.displayName}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "accountType",
      title: "Tipo",
      render: (_: unknown, record: TradingAccount) => (
        <Badge
          variant="outline"
          className={`text-xs font-medium ${
            record.accountType === "PROPFIRM"
              ? "bg-blue-50 text-blue-600 border-blue-200"
              : "bg-green-50 text-green-600 border-green-200"
          }`}
        >
          {record.accountType}
        </Badge>
      ),
    },
    {
      key: "accountNumber",
      title: "Número",
      render: (_: unknown, record: TradingAccount) => (
        <div className="text-sm text-foreground font-mono">
          {record.accountNumber || "N/A"}
        </div>
      ),
    },
    {
      key: "initialBalance",
      title: "Balance Inicial",
      render: (_: unknown, record: TradingAccount) => (
        <div className="text-sm text-foreground">
          ${Number(record.initialBalance).toLocaleString()}
        </div>
      ),
    },
    {
      key: "currentBalance",
      title: "Balance Actual",
      render: (_: unknown, record: TradingAccount) => (
        <div className="text-sm font-medium text-foreground">
          ${Number(record.currentBalance).toLocaleString()}
        </div>
      ),
    },
    {
      key: "equity",
      title: "Equity",
      render: (_: unknown, record: TradingAccount) => (
        <div className="text-sm font-medium text-foreground">
          ${Number(record.equity).toLocaleString()}
        </div>
      ),
    },
    {
      key: "accountCost",
      title: "Costo de Cuenta",
      render: (_: unknown, record: TradingAccount) => (
        <div className="text-sm font-medium text-foreground">
          {record.accountType === "PROPFIRM" && record.accountCost
            ? `$${Number(record.accountCost).toLocaleString()}`
            : record.accountType === "PROPFIRM"
              ? "N/A"
              : "-"}
        </div>
      ),
    },
    {
      key: "status",
      title: "Estado",
      render: (_: unknown, record: TradingAccount) => (
        <Badge
          variant="outline"
          className={`text-xs font-medium ${
            record.status === "ACTIVE"
              ? "bg-green-50 text-green-600 border-green-200"
              : record.status === "PENDING"
                ? "bg-yellow-50 text-yellow-600 border-yellow-200"
                : "bg-red-50 text-red-600 border-red-200"
          }`}
        >
          {record.status}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      title: "Fecha Creación",
      render: (_: unknown, record: TradingAccount) => (
        <div className="text-sm text-foreground">
          {new Date(record.createdAt).toLocaleDateString("es-ES")}
        </div>
      ),
    },
  ];

  // Trades columns
  const tradesColumns = [
    {
      key: "symbol",
      title: "Símbolo",
      render: (_: unknown, record: Trade) => (
        <div className="text-sm font-medium text-foreground">
          {record.symbol?.symbol || "N/A"}
        </div>
      ),
    },
    {
      key: "direction",
      title: "Lado",
      render: (_: unknown, record: Trade) => (
        <Badge
          variant="outline"
          className={`text-xs font-medium ${
            record.direction === "buy"
              ? "bg-green-50 text-green-600 border-green-200"
              : "bg-red-50 text-red-600 border-red-200"
          }`}
        >
          {record.direction.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: "lotSize",
      title: "Volumen",
      render: (_: unknown, record: Trade) => (
        <div className="text-sm text-foreground">{record.lotSize || "N/A"}</div>
      ),
    },
    {
      key: "entryPrice",
      title: "Precio Entrada",
      render: (_: unknown, record: Trade) => (
        <div className="text-sm text-foreground">
          {record.entryPrice ? Number(record.entryPrice).toFixed(5) : "N/A"}
        </div>
      ),
    },
    {
      key: "exitPrice",
      title: "Precio Salida",
      render: (_: unknown, record: Trade) => (
        <div className="text-sm text-foreground">
          {record.exitPrice ? Number(record.exitPrice).toFixed(5) : "N/A"}
        </div>
      ),
    },
    {
      key: "stopLoss",
      title: "Stop Loss",
      render: (_: unknown, record: Trade) => (
        <div className="text-sm text-foreground">
          {record.stopLoss ? Number(record.stopLoss).toFixed(5) : "N/A"}
        </div>
      ),
    },
    {
      key: "takeProfit",
      title: "Take Profit",
      render: (_: unknown, record: Trade) => (
        <div className="text-sm text-foreground">
          {record.takeProfit ? Number(record.takeProfit).toFixed(5) : "N/A"}
        </div>
      ),
    },
    {
      key: "commission",
      title: "Comisión",
      render: (_: unknown, record: Trade) => (
        <div className="text-sm text-foreground">
          ${Number(record.commission || 0).toFixed(2)}
        </div>
      ),
    },
    {
      key: "swap",
      title: "Swap",
      render: (_: unknown, record: Trade) => (
        <div
          className={`text-sm font-medium ${
            Number(record.swap) >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          ${Number(record.swap || 0).toFixed(2)}
        </div>
      ),
    },
    {
      key: "netProfit",
      title: "P&L",
      render: (_: unknown, record: Trade) => (
        <div
          className={`text-sm font-medium ${
            Number(record.netProfit) >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          ${Number(record.netProfit || 0).toLocaleString()}
        </div>
      ),
    },
    {
      key: "duration",
      title: "Duración",
      render: (_: unknown, record: Trade) => {
        if (!record.openTime)
          return <div className="text-sm text-foreground">N/A</div>;

        const openTime = new Date(record.openTime);
        const closeTime = record.closeTime
          ? new Date(record.closeTime)
          : new Date();
        const durationMs = closeTime.getTime() - openTime.getTime();

        const days = Math.floor(durationMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (durationMs % (1000 * 60 * 60)) / (1000 * 60)
        );

        let duration = "";
        if (days > 0) duration += `${days}d `;
        if (hours > 0) duration += `${hours}h `;
        if (minutes > 0) duration += `${minutes}m`;
        if (!duration) duration = "<1m";

        return <div className="text-sm text-foreground">{duration.trim()}</div>;
      },
    },
    {
      key: "openTime",
      title: "Fecha Apertura",
      render: (_: unknown, record: Trade) => (
        <div className="text-sm text-foreground">
          {record.openTime
            ? new Date(record.openTime).toLocaleString("es-ES")
            : "N/A"}
        </div>
      ),
    },
    {
      key: "closeTime",
      title: "Fecha Cierre",
      render: (_: unknown, record: Trade) => (
        <div className="text-sm text-foreground">
          {record.closeTime
            ? new Date(record.closeTime).toLocaleString("es-ES")
            : "N/A"}
        </div>
      ),
    },
    {
      key: "status",
      title: "Estado",
      render: (_: unknown, record: Trade) => (
        <Badge
          variant="outline"
          className={`text-xs font-medium ${
            record.status === "CLOSED"
              ? "bg-green-50 text-green-600 border-green-200"
              : record.status === "OPEN"
                ? "bg-blue-50 text-blue-600 border-blue-200"
                : "bg-gray-50 text-gray-600 border-gray-200"
          }`}
        >
          {record.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="px-1">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex items-center hover:text-foreground transition-colors"
          >
            <ArrowDownRight className="h-3 w-3 mr-1" />
            Dashboard
          </button>
          <span>/</span>
          <span className="text-foreground font-medium">
            Detalles de Usuario
          </span>
        </div>
      </div>

      {/* Main Header Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={user.image || undefined}
                  alt={user.name || "Usuario"}
                />
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {user.name || "Usuario"}
                </h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  {userRoles?.map((userRole) => (
                    <Badge
                      key={userRole.id}
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs"
                    >
                      {userRole.roleDisplayName}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              size="sm"
            >
              <ArrowDownRight className="h-4 w-4 mr-1" />
              Volver
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trading Stats Grid - Solo para traders */}
      {isTrader && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Trading Balance Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Balance Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalBalance.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                En {userTradingAccounts?.length || 0} cuentas
              </p>
            </CardContent>
          </Card>

          {/* P&L Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">P&L Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  totalPnL >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                ${totalPnL.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {closedTrades.length} trades cerrados
              </p>
            </CardContent>
          </Card>

          {/* Win Rate Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tasa de Éxito
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{winRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {winningTrades.length} de {closedTrades.length} trades ganadores
              </p>
            </CardContent>
          </Card>

          {/* Active Connections Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Conexiones Activas
              </CardTitle>
              <Cable className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeConnections}</div>
              <p className="text-xs text-muted-foreground">
                Enlaces de cuentas activos
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs for detailed information */}
      <Tabs
        defaultValue={isTrader ? "accounts" : "overview"}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Información</TabsTrigger>
          <TabsTrigger value="subscriptions">Suscripciones</TabsTrigger>
          {isTrader && <TabsTrigger value="accounts">Cuentas</TabsTrigger>}
          {isTrader && <TabsTrigger value="trades">Trades</TabsTrigger>}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Información del Usuario</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Email
                  </div>
                  <p className="text-sm">{user.email}</p>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Estado de Cuenta
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      user.emailVerified
                        ? "bg-green-50 text-green-600 border-green-200"
                        : "bg-yellow-50 text-yellow-600 border-yellow-200"
                    }`}
                  >
                    {user.emailVerified ? "Verificado" : "Pendiente"}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Roles
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {userRoles?.map((userRole) => (
                      <Badge
                        key={userRole.id}
                        variant="secondary"
                        className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs"
                      >
                        {userRole.roleDisplayName}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Miembro desde
                  </div>
                  <p className="text-sm">
                    {new Date(user.createdAt).toLocaleDateString("es-ES")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          {/* Subscription Management */}
          <SubscriptionManager
            userId={userId}
            subscriptions={
              userSubscriptions
                ? [
                    {
                      id: userSubscriptions.id,
                      plan: userSubscriptions.plan,
                      paymentProvider: userSubscriptions.paymentProvider,
                      status: userSubscriptions.status,
                      currentPlanStart: userSubscriptions.currentPlanStart
                        ? new Date(userSubscriptions.currentPlanStart)
                        : undefined,
                      currentPlanEnd: userSubscriptions.currentPlanEnd
                        ? new Date(userSubscriptions.currentPlanEnd)
                        : undefined,
                      createdAt: userSubscriptions.createdAt,
                      updatedAt: userSubscriptions.updatedAt,
                    },
                  ]
                : []
            }
            onRefresh={() => {
              // Refresh all subscription-related data
              window.location.reload();
            }}
          />

          {/* Payment Management */}
          <PaymentManager
            userId={userId}
            subscriptions={
              userSubscriptions
                ? [
                    {
                      id: userSubscriptions.id,
                      plan: userSubscriptions.plan,
                      status: userSubscriptions.status,
                    },
                  ]
                : []
            }
            payments={(userPayments?.payments as any) || []}
            onRefresh={() => {
              // Refresh all payment-related data
              window.location.reload();
            }}
          />
        </TabsContent>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-6">
          {userTradingAccounts && userTradingAccounts.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wallet className="h-5 w-5" />
                  <span>Cuentas de Trading</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollableTable
                  data={
                    (userTradingAccounts as unknown as TradingAccount[]) || []
                  }
                  columns={tradingAccountsColumns}
                  emptyMessage="No se encontraron cuentas de trading"
                  emptyIcon={
                    <Wallet className="h-12 w-12 text-muted-foreground" />
                  }
                  loading={accountsLoading}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Sin Cuentas de Trading
                </h3>
                <p className="text-muted-foreground">
                  Este trader no tiene cuentas de trading registradas.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Trades Tab */}
        <TabsContent value="trades" className="space-y-6">
          {userTrades && userTrades.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Historial de Trades</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollableTable
                  data={(userTrades as unknown as Trade[]) || []}
                  columns={tradesColumns}
                  emptyMessage="No se encontraron trades"
                  emptyIcon={
                    <Activity className="h-12 w-12 text-muted-foreground" />
                  }
                  loading={tradesLoading}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Sin Trades Registrados
                </h3>
                <p className="text-muted-foreground">
                  Este trader no tiene trades registrados en el sistema.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
