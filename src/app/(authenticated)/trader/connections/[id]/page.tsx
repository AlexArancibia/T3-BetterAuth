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
import type { CalculationsTabProps, Trade } from "@/types/connection";
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

function CalculationsTab({ connection }: CalculationsTabProps) {
  if (!connection) return null;

  return (
    <div className="space-y-6 relative">
      <div>
        {/* Trading Calculator */}
        <Card>
          <CardContent className="p-6">
            <TradingCalculator connection={connection} />
          </CardContent>
        </Card>
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
                key: "stopLoss",
                title: "SL",
                width: "100px",
                render: (_, record) => (
                  <div className="text-sm text-red-600">
                    {record.stopLoss ? Number(record.stopLoss).toFixed(5) : "-"}
                  </div>
                ),
              },
              {
                key: "takeProfit",
                title: "TP",
                width: "100px",
                render: (_, record) => (
                  <div className="text-sm text-emerald-600">
                    {record.takeProfit
                      ? Number(record.takeProfit).toFixed(5)
                      : "-"}
                  </div>
                ),
              },
              {
                key: "commission",
                title: "Comisión",
                width: "100px",
                render: (_, record) => (
                  <div className="text-sm text-gray-600">
                    {record.commission
                      ? `$${Number(record.commission).toFixed(2)}`
                      : "-"}
                  </div>
                ),
              },
              {
                key: "swap",
                title: "Swap",
                width: "90px",
                render: (_, record) => (
                  <div
                    className={`text-sm ${
                      Number(record.swap || 0) >= 0
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {record.swap ? `$${Number(record.swap).toFixed(2)}` : "-"}
                  </div>
                ),
              },
              {
                key: "pnlSort",
                title: "P&L Neto",
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
                key: "status",
                title: "Estado",
                width: "90px",
                render: (_, record) => {
                  const statusColors = {
                    OPEN: "bg-blue-100 text-blue-800",
                    CLOSED: "bg-green-100 text-green-800",
                    CANCELLED: "bg-red-100 text-red-800",
                    PARTIALLY_CLOSED: "bg-yellow-100 text-yellow-800",
                  };
                  return (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        statusColors[
                          record.status as keyof typeof statusColors
                        ] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {record.status}
                    </span>
                  );
                },
              },
              {
                key: "openTimeSort",
                title: "Fecha Apertura",
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
              {
                key: "closeTime",
                title: "Fecha Cierre",
                width: "140px",
                render: (_, record) => (
                  <div className="text-sm" style={{ fontSize: "12px" }}>
                    {record.closeTime
                      ? new Date(record.closeTime).toLocaleString("es-ES", {
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
