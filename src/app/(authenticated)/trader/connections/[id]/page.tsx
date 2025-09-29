"use client";

import { CreateTradeModal } from "@/components/trader/CreateTradeModal";
import { TradingCalculator } from "@/components/trader/TradingCalculator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollableTable } from "@/components/ui/scrollable-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePagination } from "@/hooks/usePagination";
import type {
  CalculationsTabProps,
  Trade,
  TradeStats,
} from "@/types/connection";
import { trpc } from "@/utils/trpc";
import {
  Activity,
  AlertTriangle,
  Cable,
  Home,
  Plus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

// Helper function to calculate trade statistics
function calculateTradeStats(
  propfirmTrades: Trade[],
  brokerTrades: Trade[]
): TradeStats {
  const allTrades = [...propfirmTrades, ...brokerTrades];

  const totalTrades = allTrades.length;
  const openTrades = allTrades.filter(
    (trade) => trade.status === "OPEN"
  ).length;
  const closedTrades = allTrades.filter(
    (trade) => trade.status === "CLOSED"
  ).length;

  const winningTrades = allTrades.filter(
    (trade) => trade.status === "CLOSED" && Number(trade.netProfit || 0) > 0
  ).length;

  const losingTrades = allTrades.filter(
    (trade) => trade.status === "CLOSED" && Number(trade.netProfit || 0) < 0
  ).length;

  const totalPnL = allTrades.reduce(
    (sum: number, trade) => sum + Number(trade.netProfit || 0),
    0
  );
  const winRate = closedTrades > 0 ? (winningTrades / closedTrades) * 100 : 0;

  const propfirmPnL = propfirmTrades.reduce(
    (sum: number, trade) => sum + Number(trade.netProfit || 0),
    0
  );
  const brokerPnL = brokerTrades.reduce(
    (sum: number, trade) => sum + Number(trade.netProfit || 0),
    0
  );

  const avgWin =
    winningTrades > 0
      ? allTrades
          .filter(
            (trade) =>
              trade.status === "CLOSED" && Number(trade.netProfit || 0) > 0
          )
          .reduce(
            (sum: number, trade) => sum + Number(trade.netProfit || 0),
            0
          ) / winningTrades
      : 0;

  const avgLoss =
    losingTrades > 0
      ? Math.abs(
          allTrades
            .filter(
              (trade) =>
                trade.status === "CLOSED" && Number(trade.netProfit || 0) < 0
            )
            .reduce(
              (sum: number, trade) => sum + Number(trade.netProfit || 0),
              0
            ) / losingTrades
        )
      : 0;

  const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;
  const maxDrawdown =
    allTrades.length > 0
      ? Math.min(...allTrades.map((trade) => Number(trade.netProfit || 0)))
      : 0;

  return {
    totalTrades,
    openTrades,
    closedTrades,
    winningTrades,
    losingTrades,
    totalPnL,
    winRate,
    avgWin,
    avgLoss,
    profitFactor,
    maxDrawdown,
    propfirmPnL,
    brokerPnL,
  };
}

function CalculationsTab({ connection }: CalculationsTabProps) {
  if (!connection) return null;

  const propfirmTrades = connection.propfirmAccount?.trades || [];
  const brokerTrades = connection.brokerAccount?.trades || [];
  const stats = calculateTradeStats(propfirmTrades, brokerTrades);

  return (
    <div className="space-y-6 relative">
      <div>
        {/* Trading Calculator */}
        <Card>
          <CardContent className="p-6">
            <TradingCalculator />
          </CardContent>
        </Card>

        {/* Performance Metrics - Solo si hay operaciones */}
        {stats.totalTrades > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div
                    className={`text-2xl font-bold mb-1 ${stats.totalPnL >= 0 ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {stats.totalPnL >= 0 ? "+" : ""}${stats.totalPnL.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">P&L Total</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {stats.closedTrades > 0 ? stats.winRate.toFixed(1) : "0"}%
                  </div>
                  <div className="text-sm text-muted-foreground">Win Rate</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {stats.totalTrades}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Operaciones
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {stats.profitFactor.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Profit Factor
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Account Summary - Solo si hay operaciones */}
        {stats.totalTrades > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                  Propfirm
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Operaciones
                    </span>
                    <span className="text-sm font-medium">
                      {propfirmTrades.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">P&L</span>
                    <span
                      className={`text-sm font-medium ${stats.propfirmPnL >= 0 ? "text-emerald-600" : "text-red-600"}`}
                    >
                      {stats.propfirmPnL >= 0 ? "+" : ""}$
                      {stats.propfirmPnL.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                  Broker
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Operaciones
                    </span>
                    <span className="text-sm font-medium">
                      {brokerTrades.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">P&L</span>
                    <span
                      className={`text-sm font-medium ${stats.brokerPnL >= 0 ? "text-emerald-600" : "text-red-600"}`}
                    >
                      {stats.brokerPnL >= 0 ? "+" : ""}$
                      {stats.brokerPnL.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* No Data State */}
        {stats.totalTrades === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Sin Operaciones
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Registra operaciones para ver análisis
              </p>
              <Button
                onClick={() => {
                  const event = new CustomEvent("switchTab", {
                    detail: "trades",
                  });
                  window.dispatchEvent(event);
                }}
                className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white border-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Operación
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function ConnectionDetailPage() {
  const params = useParams();
  const connectionId = params.id as string;
  const [activeTab, setActiveTab] = useState("trades");
  const [isCreateTradeModalOpen, setIsCreateTradeModalOpen] = useState(false);

  // Pagination state
  const pagination = usePagination({ defaultLimit: 25 });

  // Real tRPC queries (only if user has paid subscription)
  const {
    data: connection,
    isLoading,
    error,
    refetch,
  } = trpc.accountLink.getById.useQuery({ id: connectionId });

  // Calculate performance stats with defensive checks - moved before conditional returns
  const propfirmTrades = connection?.propfirmAccount?.trades || [];
  const brokerTrades = connection?.brokerAccount?.trades || [];

  // Helper function to get sort value from individual trade (no longer needed)
  // const getTradeSortValue = (trade: Trade, sortBy: string): any => {
  //   if (!trade) return "";
  //
  //   switch (sortBy) {
  //     case "symbol":
  //       return trade.symbol?.symbol || "";
  //     case "size":
  //       return Number(trade.lotSize) || 0;
  //     case "entryPrice":
  //       return Number(trade.entryPrice) || 0;
  //     case "exitPrice":
  //       return Number(trade.exitPrice) || 0;
  //     case "pnl":
  //       return Number(trade.netProfit) || 0;
  //     case "status":
  //       return trade.status || "";
  //     case "openTime":
  //       return trade.openTime ? new Date(trade.openTime).getTime() : 0;
  //     default:
  //       return "";
  //   }
  // };

  // Create all trades with metadata and prepare for sorting
  const allTrades: (Trade & {
    _isPropfirm?: boolean;
    _isBroker?: boolean;
    _groupIndex?: number;
    // Sortable fields
    symbolSort?: string;
    sizeSort?: number;
    entryPriceSort?: number;
    exitPriceSort?: number;
    pnlSort?: number;
    statusSort?: string;
    openTimeSort?: number;
  })[] = useMemo(() => {
    const trades: (Trade & {
      _isPropfirm?: boolean;
      _isBroker?: boolean;
      _groupIndex?: number;
      symbolSort?: string;
      sizeSort?: number;
      entryPriceSort?: number;
      exitPriceSort?: number;
      pnlSort?: number;
      statusSort?: string;
      openTimeSort?: number;
    })[] = [];

    // Add propfirm trades
    propfirmTrades.forEach((trade: Trade) => {
      trades.push({
        ...trade,
        _isPropfirm: true,
        // Add sortable fields for ScrollableTable
        symbolSort: trade.symbol?.symbol || "",
        sizeSort: Number(trade.lotSize) || 0,
        entryPriceSort: Number(trade.entryPrice) || 0,
        exitPriceSort: Number(trade.exitPrice) || 0,
        pnlSort: Number(trade.netProfit) || 0,
        statusSort: trade.status || "",
        openTimeSort: trade.openTime ? new Date(trade.openTime).getTime() : 0,
      });
    });

    // Add broker trades
    brokerTrades.forEach((trade: Trade) => {
      trades.push({
        ...trade,
        _isBroker: true,
        // Add sortable fields for ScrollableTable
        symbolSort: trade.symbol?.symbol || "",
        sizeSort: Number(trade.lotSize) || 0,
        entryPriceSort: Number(trade.entryPrice) || 0,
        exitPriceSort: Number(trade.exitPrice) || 0,
        pnlSort: Number(trade.netProfit) || 0,
        statusSort: trade.status || "",
        openTimeSort: trade.openTime ? new Date(trade.openTime).getTime() : 0,
      });
    });

    return trades;
  }, [propfirmTrades, brokerTrades]);

  // Use all trades directly (no filtering)
  const filteredTrades = allTrades;

  // Group filtered trades by openTime to create pairs (for visual grouping)
  const groupedTrades = useMemo(() => {
    const tradeMap = new Map<
      number,
      { propfirm: Trade | null; broker: Trade | null; openTime: string | null }
    >();

    filteredTrades.forEach((trade) => {
      const key = trade.openTime
        ? new Date(trade.openTime).getTime()
        : Date.now();
      if (!tradeMap.has(key)) {
        tradeMap.set(key, {
          propfirm: null,
          broker: null,
          openTime: trade.openTime ? String(trade.openTime) : null,
        });
      }
      const group = tradeMap.get(key);
      if (!group) return;

      if (trade._isPropfirm) {
        group.propfirm = trade;
      } else if (trade._isBroker) {
        group.broker = trade;
      }
    });

    return Array.from(tradeMap.values());
  }, [filteredTrades]);

  // Flatten grouped trades for table display with group index
  const displayTrades: Trade[] = groupedTrades.flatMap((group, groupIndex) => {
    const trades: Trade[] = [];
    if (group.propfirm) {
      trades.push({
        ...group.propfirm,
        _groupIndex: groupIndex,
        _isPropfirm: true,
      });
    }
    if (group.broker) {
      trades.push({
        ...group.broker,
        _groupIndex: groupIndex,
        _isBroker: true,
      });
    }
    return trades;
  });

  const tabs = [
    { id: "trades", label: "Operaciones", icon: TrendingUp },
    { id: "calculations", label: "Cálculos", icon: Activity },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !connection) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Conexión no encontrada
          </h2>
          <p className="text-gray-600 mb-4">
            La conexión que buscas no existe o no tienes acceso a ella.
          </p>
          <Link href="/trader/connections">
            <Button>Volver a Conexiones</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation - Más sutil */}
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
                  href="/trader/connections"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Resumen de Cuentas
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-muted-foreground" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground font-medium">
                Cuenta{" "}
                {connection.propfirmAccount.accountName ||
                  connection.propfirmAccount.propfirm?.displayName}
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
              <div className="h-5 w-5 rounded bg-gradient-to-r from-primary to-orange-500 flex items-center justify-center">
                <Cable className="h-3 w-3 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {connection.propfirmAccount.propfirm?.displayName ||
                    connection.propfirmAccount.accountName}{" "}
                  →{" "}
                  {connection.brokerAccount.broker?.displayName ||
                    connection.brokerAccount.accountName}
                </h1>
              </div>
            </div>
            <Button
              onClick={() => setIsCreateTradeModalOpen(true)}
              size="sm"
              className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white border-0"
            >
              <Plus className="h-4 w-4 mr-0 lg:mr-1.5" />
              <span className="hidden lg:block">Nueva Operación</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Shadcn Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-fit grid-cols-2">
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

        <TabsContent value="calculations" className="mt-0">
          {connection && <CalculationsTab connection={connection} />}
        </TabsContent>

        <TabsContent value="trades" className="mt-0">
          <ScrollableTable
            data={displayTrades}
            rowClassName={(record) => {
              const groupIndex = record._groupIndex ?? 0;
              const isPropfirm = record._isPropfirm ?? false;
              const isBroker = record._isBroker ?? false;

              // Colores sutiles intercalados por grupo
              const baseColor =
                groupIndex % 2 === 0 ? "bg-slate-50/30" : "bg-slate-100/20";

              // Diferenciación sutil entre propfirm y broker (sin borde izquierdo)
              if (isPropfirm) {
                return `${baseColor}`;
              }
              if (isBroker) {
                return `${baseColor}`;
              }

              return baseColor;
            }}
            columns={[
              {
                key: "accountType",
                title: "Cuenta",
                width: "80px",
                render: (_, record) => {
                  const isPropfirm = record._isPropfirm ?? false;
                  return (
                    <div className="flex items-center space-x-1.5">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          isPropfirm ? "bg-primary" : "bg-primary/70"
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          isPropfirm ? "text-primary" : "text-primary/80"
                        }`}
                        style={{ fontSize: "12px" }}
                      >
                        {isPropfirm ? "Prop" : "Broker"}
                      </span>
                    </div>
                  );
                },
              },
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
          />
        </TabsContent>
      </Tabs>

      {/* Create Trade Modal */}
      {isCreateTradeModalOpen && connection && (
        <CreateTradeModal
          connection={connection}
          isOpen={isCreateTradeModalOpen}
          onClose={() => setIsCreateTradeModalOpen(false)}
          onSuccess={() => {
            // Refetch connection data to update trades
            refetch();
            setIsCreateTradeModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
