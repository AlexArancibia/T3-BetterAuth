"use client";

import { CreateTradeModal } from "@/components/trader/CreateTradeModal";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollableTable } from "@/components/ui/scrollable-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePagination } from "@/hooks/usePagination";
import type { Trade } from "@/types/connection";
import { trpc } from "@/utils/trpc";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Building2,
  Calendar,
  DollarSign,
  Edit,
  Globe,
  Home,
  Plus,
  Settings,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

export default function TradingAccountDetailPage() {
  const params = useParams();
  const accountId = params.id as string;
  const [activeTab, setActiveTab] = useState("trades");
  const [isCreateTradeModalOpen, setIsCreateTradeModalOpen] = useState(false);

  // Pagination state
  const pagination = usePagination({ defaultLimit: 25 });

  // Real tRPC queries
  const {
    data: account,
    isLoading,
    error,
    refetch,
  } = trpc.tradingAccount.getById.useQuery({ id: accountId });

  // Get trades for this account
  const trades = account?.trades || [];

  // Calculate performance stats
  const totalTrades = trades.length;
  const openTrades = trades.filter(
    (trade: Trade) => trade.status === "OPEN"
  ).length;
  const closedTrades = trades.filter(
    (trade: Trade) => trade.status === "CLOSED"
  ).length;
  const winningTrades = trades.filter(
    (trade: Trade) =>
      trade.status === "CLOSED" && Number(trade.netProfit || 0) > 0
  ).length;
  const losingTrades = trades.filter(
    (trade: Trade) =>
      trade.status === "CLOSED" && Number(trade.netProfit || 0) < 0
  ).length;

  const totalPnL = trades.reduce(
    (sum: number, trade: Trade) => sum + Number(trade.netProfit || 0),
    0
  );
  const winRate = closedTrades > 0 ? (winningTrades / closedTrades) * 100 : 0;

  const avgWin =
    winningTrades > 0
      ? trades
          .filter(
            (trade: Trade) =>
              trade.status === "CLOSED" && Number(trade.netProfit || 0) > 0
          )
          .reduce(
            (sum: number, trade: Trade) => sum + Number(trade.netProfit || 0),
            0
          ) / winningTrades
      : 0;

  const avgLoss =
    losingTrades > 0
      ? Math.abs(
          trades
            .filter(
              (trade: Trade) =>
                trade.status === "CLOSED" && Number(trade.netProfit || 0) < 0
            )
            .reduce(
              (sum: number, trade: Trade) => sum + Number(trade.netProfit || 0),
              0
            ) / losingTrades
        )
      : 0;

  const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;
  const maxDrawdown =
    trades.length > 0
      ? Math.min(...trades.map((trade: Trade) => Number(trade.netProfit || 0)))
      : 0;

  // Prepare trades for table display
  const displayTrades: Trade[] = useMemo(() => {
    return trades.map((trade: Trade) => ({
      ...trade,
      symbolSort: trade.symbol?.symbol || "",
      sizeSort: Number(trade.lotSize) || 0,
      entryPriceSort: Number(trade.entryPrice) || 0,
      exitPriceSort: Number(trade.exitPrice) || 0,
      pnlSort: Number(trade.netProfit) || 0,
      statusSort: trade.status || "",
      openTimeSort: trade.openTime ? new Date(trade.openTime).getTime() : 0,
    }));
  }, [trades]);

  const tabs = [
    { id: "trades", label: "Operaciones", icon: TrendingUp },
    { id: "account-info", label: "Información de Cuenta", icon: Settings },
    { id: "analytics", label: "Análisis", icon: BarChart3 },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Cuenta no encontrada
          </h2>
          <p className="text-gray-600 mb-4">
            La cuenta que buscas no existe o no tienes acceso a ella.
          </p>
          <Link href="/trader/accounts">
            <Button>Volver a Cuentas</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="px-1">
        <Breadcrumb>
          <BreadcrumbList className="text-xs">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href="/trader"
                  className="flex items-center text-muted-foreground hover:text-foreground"
                >
                  <Home className="h-3 w-3 mr-1" />
                  Trader
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-muted-foreground" />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href="/trader/accounts"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Cuentas de Trading
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-muted-foreground" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground font-medium">
                {account.accountName}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Main Header Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                  account.accountType === "PROPFIRM"
                    ? "bg-gradient-to-br from-blue-500 to-blue-600"
                    : "bg-gradient-to-br from-red-500 to-red-600"
                }`}
              >
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {account.accountName}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {account.propfirm?.displayName ||
                    account.broker?.displayName ||
                    "Cuenta de Trading"}{" "}
                  •{account.accountTypeRef?.displayName || account.accountType}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("analytics")}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Análisis
              </Button>
              <Button
                onClick={() => setIsCreateTradeModalOpen(true)}
                size="sm"
                className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white border-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Operación
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Balance Actual
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  ${Number(account.currentBalance).toLocaleString()}
                </p>
              </div>
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Equity
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  ${Number(account.equity).toLocaleString()}
                </p>
              </div>
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  P&L Total
                </p>
                <p
                  className={`text-2xl font-semibold ${totalPnL >= 0 ? "text-emerald-600" : "text-red-600"}`}
                >
                  {totalPnL >= 0 ? "+" : ""}${totalPnL.toLocaleString()}
                </p>
              </div>
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                {totalPnL >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Win Rate
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  {winRate.toFixed(1)}%
                </p>
              </div>
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shadcn Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-fit grid-cols-3">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2 text-sm"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="trades" className="mt-0">
          <ScrollableTable
            data={displayTrades}
            columns={[
              {
                key: "symbolSort",
                title: "Símbolo",
                width: "120px",
                render: (_, record) => (
                  <div className="flex items-center space-x-2">
                    <div
                      className={`h-6 w-6 rounded flex items-center justify-center ${
                        record.direction === "buy"
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {record.direction === "buy" ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        {record.symbol?.symbol || "N/A"}
                      </div>
                      <div
                        className="text-sm text-gray-500"
                        style={{ fontSize: "12px" }}
                      >
                        {record.direction === "buy" ? "BUY" : "SELL"}
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                key: "sizeSort",
                title: "Lotes",
                width: "90px",
                render: (_, record) => (
                  <div className="text-sm font-medium">
                    {Number(record.lotSize).toFixed(2)}
                  </div>
                ),
              },
              {
                key: "entryPriceSort",
                title: "Apertura",
                width: "110px",
                render: (_, record) => (
                  <div className="text-sm">
                    {record.entryPrice
                      ? Number(record.entryPrice).toFixed(5)
                      : "-"}
                  </div>
                ),
              },
              {
                key: "exitPriceSort",
                title: "Cierre",
                width: "110px",
                render: (_, record) => (
                  <div className="text-sm">
                    {record.exitPrice
                      ? Number(record.exitPrice).toFixed(5)
                      : "-"}
                  </div>
                ),
              },
              {
                key: "pnlSort",
                title: "P&L",
                width: "110px",
                render: (_, record) => (
                  <div
                    className={`text-sm font-medium ${
                      Number(record.netProfit || 0) >= 0
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {Number(record.netProfit || 0) >= 0 ? "+" : ""}$
                    {Number(record.netProfit || 0).toFixed(2)}
                  </div>
                ),
              },
              {
                key: "openTimeSort",
                title: "Fecha",
                width: "140px",
                render: (_, record) => (
                  <div className="text-sm" style={{ fontSize: "12px" }}>
                    {record.openTime
                      ? new Date(record.openTime).toLocaleString("es-ES", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </div>
                ),
              },
            ]}
            pagination={{
              page: pagination.page,
              limit: pagination.limit,
              total: displayTrades.length,
              totalPages: Math.ceil(displayTrades.length / pagination.limit),
              hasNext:
                pagination.page <
                Math.ceil(displayTrades.length / pagination.limit),
              hasPrev: pagination.page > 1,
            }}
            onPageChange={pagination.setPage}
            onPageSizeChange={pagination.setLimit}
            loading={false}
            showPagination={true}
            emptyMessage="No se encontraron operaciones"
            emptyIcon={<Activity className="h-12 w-12 text-muted-foreground" />}
          />
        </TabsContent>

        <TabsContent value="account-info" className="mt-0">
          <div className="space-y-6">
            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1 text-foreground">
                      ${Number(account.initialBalance).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Balance Inicial
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1 text-foreground">
                      ${Number(account.currentBalance).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Balance Actual
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1 text-foreground">
                      ${Number(account.equity).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Equity</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div
                      className={`text-2xl font-bold mb-1 ${
                        totalPnL >= 0 ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      P&L Total
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Account Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                    Información Básica
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Nombre
                      </span>
                      <span className="text-sm font-medium">
                        {account.accountName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Tipo
                      </span>
                      <span className="text-sm font-medium">
                        {account.accountType === "PROPFIRM"
                          ? "Propfirm"
                          : "Broker"}
                      </span>
                    </div>
                    {account.accountNumber && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Número
                        </span>
                        <span className="text-sm font-medium font-mono">
                          {account.accountNumber}
                        </span>
                      </div>
                    )}
                    {account.server && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Servidor
                        </span>
                        <span className="text-sm font-medium font-mono">
                          {account.server}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Estado
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          account.status === "active"
                            ? "text-emerald-600"
                            : "text-orange-600"
                        }`}
                      >
                        {account.status === "active" ? "Activa" : "Inactiva"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                    {account.accountType === "PROPFIRM" ? "Propfirm" : "Broker"}
                  </h3>
                  <div className="space-y-3">
                    {account.propfirm && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Propfirm
                        </span>
                        <span className="text-sm font-medium">
                          {account.propfirm.displayName}
                        </span>
                      </div>
                    )}
                    {account.broker && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Broker
                        </span>
                        <span className="text-sm font-medium">
                          {account.broker.displayName}
                        </span>
                      </div>
                    )}
                    {account.accountTypeRef && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Tipo de Cuenta
                        </span>
                        <span className="text-sm font-medium">
                          {account.accountTypeRef.displayName}
                        </span>
                      </div>
                    )}
                    {account.currentPhase && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Fase Actual
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {account.currentPhase.displayName}
                          </span>
                          <Badge
                            variant={
                              account.currentPhase.phaseName === "funded"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {account.currentPhase.phaseName === "funded"
                              ? "Live"
                              : "Evaluación"}
                          </Badge>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Creada
                      </span>
                      <span className="text-sm font-medium">
                        {new Date(account.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Summary */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                  Rendimiento
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold mb-1 text-foreground">
                      {(
                        ((Number(account.currentBalance) -
                          Number(account.initialBalance)) /
                          Number(account.initialBalance)) *
                        100
                      ).toFixed(2)}
                      %
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Retorno Total
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold mb-1 text-foreground">
                      {totalTrades}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Operaciones
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold mb-1 text-foreground">
                      {winRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Win Rate
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-0">
          <div className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1 text-foreground">
                      {totalTrades}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Operaciones
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1 text-foreground">
                      {openTrades}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Abiertas
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1 text-foreground">
                      {winningTrades}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Ganadoras
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1 text-foreground">
                      {profitFactor.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Profit Factor
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                    Rendimiento
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Ganancia Promedio
                      </span>
                      <span className="text-sm font-medium text-emerald-600">
                        +${avgWin.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Pérdida Promedio
                      </span>
                      <span className="text-sm font-medium text-red-600">
                        -${avgLoss.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Máxima Pérdida
                      </span>
                      <span className="text-sm font-medium text-red-600">
                        ${maxDrawdown.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                    Información de la Cuenta
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Balance Inicial
                      </span>
                      <span className="text-sm font-medium">
                        ${Number(account.initialBalance).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Retorno
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          totalPnL >= 0 ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {(
                          ((Number(account.currentBalance) -
                            Number(account.initialBalance)) /
                            Number(account.initialBalance)) *
                          100
                        ).toFixed(2)}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Estado
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          account.status === "active"
                            ? "text-emerald-600"
                            : "text-orange-600"
                        }`}
                      >
                        {account.status === "active" ? "Activa" : "Inactiva"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Trade Modal */}
      {isCreateTradeModalOpen && account && (
        <CreateTradeModal
          connection={{
            id: `temp-connection-${accountId}`,
            propfirmAccountId: accountId,
            brokerAccountId: accountId,
            autoCopyEnabled: false,
            maxRiskPerTrade: 0,
            isActive: true,
            propfirmAccount: account,
            brokerAccount: account,
          }}
          isOpen={isCreateTradeModalOpen}
          onClose={() => setIsCreateTradeModalOpen(false)}
          onSuccess={() => {
            refetch();
            setIsCreateTradeModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
