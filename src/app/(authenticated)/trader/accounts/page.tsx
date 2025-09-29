"use client";

import { CreateTradingAccountDialog } from "@/components/trader/CreateTradingAccountDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type {
  TableAction,
  TableColumn,
} from "@/components/ui/scrollable-table";
import { ScrollableTable } from "@/components/ui/scrollable-table";
import { usePagination } from "@/hooks/usePagination";
import { trpc } from "@/utils/trpc";
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  Plus,
  Settings,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useState } from "react";

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
  accountTypeRef: {
    typeName: string;
    displayName: string;
  } | null;
  currentPhase: {
    phaseName: string;
    displayName: string;
  } | null;
  trades: Array<{
    netProfit: string | number;
    status: string;
  }>;
  _count: {
    trades: number;
  };
};

const statusConfig = {
  active: {
    label: "Activa",
    color: "bg-emerald-100 text-emerald-700",
    icon: CheckCircle,
    dotColor: "bg-emerald-500",
  },
  warning: {
    label: "Advertencia",
    color: "bg-orange-100 text-orange-700",
    icon: AlertCircle,
    dotColor: "bg-orange-500",
  },
  inactive: {
    label: "Inactiva",
    color: "bg-gray-100 text-gray-700",
    icon: Clock,
    dotColor: "bg-gray-500",
  },
};

const typeConfig = {
  PROPFIRM: {
    label: "Propfirm",
    color: "bg-blue-100 text-blue-700",
    gradient: "from-blue-500 to-blue-600",
  },
  BROKER: {
    label: "Broker",
    color: "bg-red-100 text-red-700",
    gradient: "from-red-500 to-red-600",
  },
};

export default function AccountsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const pagination = usePagination({ defaultLimit: 10 });
  const queryParams = pagination.getQueryParams();

  // Real tRPC queries
  const {
    data: response,
    refetch,
    isLoading,
  } = trpc.tradingAccount.getAll.useQuery(queryParams);

  const deleteAccount = trpc.tradingAccount.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.error("Error deleting account:", error.message);
    },
  });

  const accounts = response?.data || [];
  const paginationInfo = response?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };

  // Calculate summary stats with defensive checks
  const totalBalance = accounts.reduce(
    (sum: number, acc: TradingAccount) => sum + Number(acc.currentBalance || 0),
    0
  );
  const totalEquity = accounts.reduce(
    (sum: number, acc: TradingAccount) => sum + Number(acc.equity || 0),
    0
  );
  const totalPnL = accounts.reduce((sum: number, acc: TradingAccount) => {
    const trades = acc.trades || [];
    const accountPnL = trades.reduce(
      (tradeSum: number, trade: { netProfit?: string | number }) =>
        tradeSum + Number(trade?.netProfit || 0),
      0
    );
    return sum + accountPnL;
  }, 0);

  const handleEdit = (account: TradingAccount) => {
    // Navigate to account details page
    window.open(`/trader/accounts/${account.id}`, "_self");
  };

  const handleDelete = (account: TradingAccount) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta cuenta?")) {
      deleteAccount.mutate({ id: account.id });
    }
  };

  // Define table columns
  const columns: TableColumn<TradingAccount>[] = [
    {
      key: "account",
      title: "Cuenta",
      render: (_, record) => {
        const typeInfo = typeConfig[record.accountType];
        return (
          <div className="flex items-center space-x-2">
            <div
              className={`h-8 w-8 bg-gradient-to-br ${typeInfo.gradient} rounded-lg flex items-center justify-center`}
            >
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">
                {record.accountName}
              </div>
              <Badge
                variant="outline"
                className={`text-xs font-medium ${
                  record.accountType === "PROPFIRM"
                    ? "bg-blue-100 text-blue-600 border-blue-200 hover:bg-blue-200"
                    : "bg-red-100 text-red-600 border-red-200 hover:bg-red-200"
                }`}
              >
                {typeInfo.label}
              </Badge>
            </div>
          </div>
        );
      },
    },
    {
      key: "provider",
      title: "Proveedor",
      render: (_, record) => (
        <div>
          <div className="text-sm font-medium text-foreground">
            {record.propfirm?.displayName ||
              record.broker?.displayName ||
              "Desconocido"}
          </div>
          {record.accountTypeRef && (
            <div className="text-xs text-muted-foreground">
              {record.accountTypeRef.displayName}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "balance",
      title: "Balance y Equity",
      render: (_, record) => (
        <div>
          <div className="text-sm font-medium text-foreground">
            ${Number(record.currentBalance).toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">
            Eq: ${Number(record.equity).toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">
            Inicial: ${Number(record.initialBalance).toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      key: "trades",
      title: "Actividad",
      render: (_, record) => {
        const totalTrades = record._count?.trades || 0;
        const trades = record.trades || [];
        const openTrades = trades.filter((t) => t?.status === "OPEN").length;
        const accountPnL = trades.reduce(
          (sum, trade) => sum + Number(trade?.netProfit || 0),
          0
        );

        return (
          <div>
            <div className="text-sm font-medium text-foreground">
              {totalTrades} operaciones
            </div>
            <div className="text-xs text-muted-foreground">
              {openTrades} abiertas
            </div>
            <div
              className={`text-xs font-medium ${accountPnL >= 0 ? "text-emerald-600" : "text-red-600"}`}
            >
              {accountPnL >= 0 ? "+" : ""}${accountPnL.toLocaleString()} P&L
            </div>
          </div>
        );
      },
    },
    {
      key: "performance",
      title: "Rendimiento",
      render: (_, record) => {
        const initialBalance = Number(record.initialBalance);
        const currentBalance = Number(record.currentBalance);
        const returnPct =
          ((currentBalance - initialBalance) / initialBalance) * 100;

        return (
          <div>
            <div
              className={`text-sm font-medium ${returnPct >= 0 ? "text-emerald-600" : "text-red-600"}`}
            >
              {returnPct >= 0 ? "+" : ""}
              {returnPct.toFixed(2)}%
            </div>
            <div className="text-xs text-muted-foreground">Retorno inicial</div>
            {record.currentPhase && (
              <div className="text-xs text-muted-foreground">
                {record.currentPhase.displayName}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      title: "Estado",
      render: (_, record) => {
        const statusInfo =
          statusConfig[record.status as keyof typeof statusConfig] ||
          statusConfig.active;

        return (
          <Badge
            variant="outline"
            className={`text-xs font-medium ${
              record.status === "active"
                ? "bg-green-100 text-green-600 border-green-200 hover:bg-green-200"
                : record.status === "warning"
                  ? "bg-yellow-100 text-yellow-600 border-yellow-200 hover:bg-yellow-200"
                  : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
            }`}
          >
            {statusInfo.label}
          </Badge>
        );
      },
    },
  ];

  // Define table actions
  const actions: TableAction<TradingAccount>[] = [
    {
      label: "Ver Detalles",
      icon: <Eye className="h-4 w-4" />,
      onClick: (account) =>
        window.open(`/trader/accounts/${account.id}`, "_self"),
      variant: "default",
    },
    {
      label: "Configurar",
      icon: <Settings className="h-4 w-4" />,
      onClick: handleEdit,
      variant: "default",
    },
    {
      label: "Eliminar",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDelete,
      variant: "destructive",
      separator: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Cuentas de Trading
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 mr-8">
            Gestiona todas tus cuentas propfirm y broker para trading
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white border-0"
        >
          <Plus className="h-4 w-4 mr-0 lg:mr-2" />
          <span className="hidden lg:block">Agregar Cuenta</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  Equity Total
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  ${totalEquity.toLocaleString()}
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
      </div>

      {/* Table with ScrollableTable */}
      <ScrollableTable<TradingAccount>
        data={accounts}
        columns={columns}
        actions={actions}
        pagination={paginationInfo}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setLimit}
        loading={isLoading}
        emptyMessage="No se encontraron cuentas de trading"
        emptyIcon={<Wallet className="h-12 w-12 text-gray-400" />}
      />

      {/* Create Account Dialog */}
      <CreateTradingAccountDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
}
