"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollableTable } from "@/components/ui/scrollable-table";
import { trpc } from "@/utils/trpc";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Cable,
  DollarSign,
  Eye,
  Plus,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";

// Types for the data we're working with
interface Connection {
  id: string;
  userId: string;
  propfirmAccountId: string;
  brokerAccountId: string;
  autoCopyEnabled: boolean;
  maxRiskPerTrade: number;
  isActive: boolean;
  lastCopyAt: string | null;
  createdAt: string;
  updatedAt: string;
  propfirmAccount: {
    id: string;
    accountName: string;
    propfirm: { name: string; displayName: string } | null;
    broker: { name: string; displayName: string } | null;
  };
  brokerAccount: {
    id: string;
    accountName: string;
    propfirm: { name: string; displayName: string } | null;
    broker: { name: string; displayName: string } | null;
  };
}

interface Trade {
  id: string;
  symbol: { symbol: string; id: string; displayName: string };
  direction: "buy" | "sell";
  entryPrice: number;
  exitPrice: number | null;
  lotSize: number;
  profitLoss: number;
  netProfit: number;
  status: "OPEN" | "CLOSED";
  openTime: string;
  closeTime: string | null;
  createdAt: string;
  accountId: string;
  account?: {
    id: string;
    accountName: string;
    propfirm: { name: string; displayName: string } | null;
    broker: { name: string; displayName: string } | null;
  };
}

interface TradingAccount {
  id: string;
  accountName: string;
  currentBalance: string | number;
  netProfit: string | number;
}

export default function TraderDashboard() {
  // Real tRPC queries
  const { data: userAccountLinks, isLoading: linksLoading } =
    trpc.accountLink.getByUser.useQuery();
  const { data: userTradingAccounts, isLoading: accountsLoading } =
    trpc.tradingAccount.getByUser.useQuery();
  const { data: userTrades, isLoading: tradesLoading } =
    trpc.trade.getByUser.useQuery();

  const accountLinks = (userAccountLinks as unknown as Connection[]) || [];
  const tradingAccounts =
    (userTradingAccounts as unknown as TradingAccount[]) || [];
  const trades = (userTrades as unknown as Trade[]) || [];

  // Calculate stats
  const totalBalance =
    tradingAccounts?.reduce(
      (sum: number, acc: TradingAccount) => sum + Number(acc.currentBalance),
      0
    ) || 0;
  const totalPnL =
    trades?.reduce(
      (sum: number, trade: Trade) => sum + Number(trade.netProfit),
      0
    ) || 0;
  const activeConnections =
    accountLinks?.filter((link: Connection) => link.isActive).length || 0;

  const closedTrades =
    trades?.filter((trade: Trade) => trade.status === "CLOSED") || [];
  const winningTrades = closedTrades.filter(
    (trade: Trade) => Number(trade.netProfit) > 0
  );
  const winRate =
    closedTrades.length > 0
      ? (winningTrades.length / closedTrades.length) * 100
      : 0;

  // Today's trades
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTrades =
    trades?.filter((trade: Trade) => {
      const tradeDate = new Date(trade.createdAt);
      return tradeDate >= today;
    }) || [];
  const dailyPnL = todayTrades.reduce(
    (sum: number, trade: Trade) => sum + Number(trade.netProfit),
    0
  );

  const isLoading = linksLoading || accountsLoading || tradesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5 mr-8">
            Resumen de tu actividad de trading
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/trader/connections/create">
            <Button className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white border-0">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Conexión
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Balance Total
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  ${totalBalance.toLocaleString()}
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
                  Conexiones Activas
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  {activeConnections}
                </p>
              </div>
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <Cable className="h-5 w-5 text-primary" />
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
                <Activity className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Active Connections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Active Connections & Recent Trades */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Connections */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Conexiones Activas
                </h3>
                <Link href="/trader/connections">
                  <Button variant="ghost" size="sm">
                    Ver Todas
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {accountLinks?.slice(0, 3).map((link: Connection) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                          link.isActive
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-orange-100 text-orange-600"
                        }`}
                      >
                        <Cable className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {link.propfirmAccount.propfirm?.displayName ||
                            link.propfirmAccount.accountName}{" "}
                          →{" "}
                          {link.brokerAccount.broker?.displayName ||
                            link.brokerAccount.accountName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {link.lastCopyAt
                            ? new Date(link.lastCopyAt).toLocaleString()
                            : "Nunca copiado"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        Riesgo: {Number(link.maxRiskPerTrade)}%
                      </p>
                      <p
                        className={`text-xs font-medium ${
                          link.isActive ? "text-emerald-600" : "text-orange-600"
                        }`}
                      >
                        {link.isActive ? "Activa" : "Inactiva"}
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/trader/connections/${link.id}`}>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                )) || (
                  <p className="text-muted-foreground text-center py-8">
                    No se encontraron conexiones
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Últimos Movimientos */}
          <Card>
            <CardContent className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Últimos Movimientos
                </h3>
              </div>

              {trades && trades.length > 0 ? (
                <ScrollableTable
                  data={trades.slice(0, 10)}
                  columns={[
                    {
                      key: "symbol",
                      title: "Símbolo",
                      width: "120px",
                      render: (_, record: Trade) => (
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
                      key: "lotSize",
                      title: "Lotes",
                      width: "90px",
                      render: (_, record: Trade) => (
                        <div className="text-sm font-medium">
                          {Number(record.lotSize).toFixed(2)}
                        </div>
                      ),
                    },
                    {
                      key: "entryPrice",
                      title: "Apertura",
                      width: "110px",
                      render: (_, record: Trade) => (
                        <div className="text-sm">
                          {record.entryPrice
                            ? Number(record.entryPrice).toFixed(5)
                            : "-"}
                        </div>
                      ),
                    },
                    {
                      key: "exitPrice",
                      title: "Cierre",
                      width: "110px",
                      render: (_, record: Trade) => (
                        <div className="text-sm">
                          {record.exitPrice
                            ? Number(record.exitPrice).toFixed(5)
                            : "-"}
                        </div>
                      ),
                    },
                    {
                      key: "netProfit",
                      title: "P&L",
                      width: "110px",
                      render: (_, record: Trade) => (
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
                      key: "openTime",
                      title: "Fecha",
                      width: "140px",
                      render: (_, record: Trade) => (
                        <div className="text-sm" style={{ fontSize: "12px" }}>
                          {record.openTime
                            ? new Date(record.openTime).toLocaleString(
                                "es-ES",
                                {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : "-"}
                        </div>
                      ),
                    },
                  ]}
                  showPagination={false}
                  loading={tradesLoading}
                  emptyMessage="No se encontraron operaciones recientes"
                  emptyIcon={
                    <Activity className="h-12 w-12 text-muted-foreground" />
                  }
                />
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No se encontraron operaciones recientes
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                Acciones Rápidas
              </h3>
              <div className="space-y-2">
                <Link href="/trader/connections/create">
                  <Button
                    className="w-full justify-start"
                    variant="ghost"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Conexión
                  </Button>
                </Link>
                <Link href="/trader/accounts">
                  <Button
                    className="w-full justify-start"
                    variant="ghost"
                    size="sm"
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Ver Cuentas
                  </Button>
                </Link>
                <Link href="/trader/calculator">
                  <Button
                    className="w-full justify-start"
                    variant="ghost"
                    size="sm"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Calculadora
                  </Button>
                </Link>
                <Link href="/trader/connections">
                  <Button
                    className="w-full justify-start"
                    variant="ghost"
                    size="sm"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Ver Conexiones
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                Rendimiento de Hoy
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    P&L Diario
                  </span>
                  <span
                    className={`text-sm font-medium ${dailyPnL >= 0 ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {dailyPnL >= 0 ? "+" : ""}${dailyPnL.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Operaciones Hoy
                  </span>
                  <span className="text-sm font-medium">
                    {todayTrades.length}
                  </span>
                </div>
                <div className="flex items-center">
                  {dailyPnL >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 mr-2 text-emerald-600" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 mr-2 text-red-600" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {Math.abs(dailyPnL)} vs ayer
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
