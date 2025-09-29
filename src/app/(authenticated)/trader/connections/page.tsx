"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ScrollableTable,
  type TableAction,
  type TableColumn,
} from "@/components/ui/scrollable-table";
import { usePagination } from "@/hooks/usePagination";
import { trpc } from "@/utils/trpc";
import {
  AlertCircle,
  Cable,
  CheckCircle,
  Edit,
  Eye,
  PauseCircle,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Type for the connection data with included relations
type Connection = {
  id: string;
  userId: string;
  propfirmAccountId: string;
  brokerAccountId: string;
  autoCopyEnabled: boolean;
  maxRiskPerTrade: string | number;
  isActive: boolean;
  lastCopyAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  propfirmAccount: {
    id: string;
    accountName: string;
    accountNumber: string | null;
    currentBalance: number | string;
    equity: number | string;
    propfirm: {
      name: string;
      displayName: string;
    } | null;
    broker: {
      name: string;
      displayName: string;
    } | null;
  };
  brokerAccount: {
    id: string;
    accountName: string;
    accountNumber: string | null;
    currentBalance: number | string;
    equity: number | string;
    propfirm: {
      name: string;
      displayName: string;
    } | null;
    broker: {
      name: string;
      displayName: string;
    } | null;
  };
};

const statusConfig = {
  active: {
    label: "Activa",
    color: "bg-green-100 border border-green-500 text-green-600",
    icon: CheckCircle,
    dotColor: "bg-green-500",
  },
  inactive: {
    label: "Inactiva",
    color: "bg-yellow-100 border border-yellow-500 text-yellow-600",
    icon: PauseCircle,
    dotColor: "bg-yellow-500",
  },
  error: {
    label: "Error",
    color: "bg-red-100 border border-red-500 text-red-600",
    icon: AlertCircle,
    dotColor: "bg-red-500",
  },
};

export default function ConnectionsPage() {
  const [_searchTerm, _setSearchTerm] = useState("");
  const [_statusFilter, _setStatusFilter] = useState("all");

  const pagination = usePagination({ defaultLimit: 10 });
  const {
    sortBy: _sortBy,
    sortOrder: _sortOrder,
    setSortBy: _setSortBy,
    setSortOrder: _setSortOrder,
  } = pagination;
  const queryParams = pagination.getQueryParams();

  // Real tRPC queries
  const {
    data: response,
    refetch,
    error: _error,
    isLoading,
  } = trpc.accountLink.getAll.useQuery(queryParams);

  const deleteConnection = trpc.accountLink.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.error("Error deleting connection:", error.message);
    },
  });

  const connections = response?.data || [];
  const paginationInfo = response?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };

  const handleEdit = (_connection: Connection) => {
    // Navigate to edit page or open edit modal
    alert("Funcionalidad de edición de conexión no implementada aún");
  };

  const handleDelete = (connection: Connection) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta conexión?")) {
      deleteConnection.mutate({ id: connection.id });
    }
  };

  // Define table columns
  const columns: TableColumn<Connection>[] = [
    {
      key: "connection",
      title: "Conexión",
      render: (_, record) => (
        <Link href={`/trader/connections/${record.id}`} className="block">
          <div className="flex items-center space-x-2 hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors cursor-pointer">
            <div className="h-8 w-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <Cable className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                {record.propfirmAccount.propfirm?.displayName ||
                  record.propfirmAccount.accountName}
                →
                {record.brokerAccount.broker?.displayName ||
                  record.brokerAccount.accountName}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(record.createdAt).toLocaleString("es-ES", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        </Link>
      ),
    },
    {
      key: "propfirmAccount",
      title: "Cuenta propfirm",
      render: (_, record) => (
        <div>
          <div className="text-sm font-medium text-foreground">
            {record.propfirmAccount.accountName}
          </div>
          <div className="text-xs text-muted-foreground">
            Bal: $
            {Number(record.propfirmAccount.currentBalance).toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">
            Eq: ${Number(record.propfirmAccount.equity).toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      key: "brokerAccount",
      title: "Cuenta broker",
      render: (_, record) => (
        <div>
          <div className="text-sm font-medium text-foreground">
            {record.brokerAccount.accountName}
          </div>
          <div className="text-xs text-muted-foreground">
            Bal: ${Number(record.brokerAccount.currentBalance).toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">
            Eq: ${Number(record.brokerAccount.equity).toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      title: "Estado",
      render: (_, record) => {
        const status = record.isActive ? "active" : "inactive";
        const statusInfo = statusConfig[status];

        return (
          <Badge
            variant="outline"
            className={`text-xs font-medium ${
              record.isActive
                ? "bg-green-100 text-green-600 border-green-200 hover:bg-green-200"
                : "bg-orange-100 text-orange-600 border-orange-200 hover:bg-orange-200"
            }`}
          >
            {statusInfo.label}
          </Badge>
        );
      },
    },
    {
      key: "lastActivity",
      title: "Última actividad",
      render: (_, record) => (
        <div className="text-xs text-muted-foreground">
          {record.lastCopyAt
            ? new Date(record.lastCopyAt).toLocaleString("es-ES", {
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
  ];

  // Define table actions
  const actions: TableAction<Connection>[] = [
    {
      label: "Ver Detalles",
      icon: <Eye className="h-4 w-4" />,
      onClick: (connection) =>
        window.open(`/trader/connections/${connection.id}`, "_self"),
      variant: "default",
    },
    {
      label: "Editar",
      icon: <Edit className="h-4 w-4" />,
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
          <h1 className="text-2xl font-semibold text-foreground">Conexiones</h1>
          <p className="text-sm text-muted-foreground mt-0.5 mr-8">
            Gestiona conexiones entre cuentas propfirm y broker
          </p>
        </div>
        <Link href="/trader/connections/create">
          <Button
            size="sm"
            className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white border-0"
          >
            <Plus className="h-4 w-4 mr-0 md:mr-1.5 " />
            <span className="hidden md:block">Nueva Conexión</span>
          </Button>
        </Link>
      </div>

      {/* Table with ScrollableTable */}
      <ScrollableTable<Connection>
        data={connections}
        columns={columns}
        actions={actions}
        pagination={paginationInfo}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setLimit}
        loading={isLoading}
        emptyMessage="No se encontraron conexiones"
        emptyIcon={<Cable className="h-12 w-12 text-muted-foreground" />}
      />
    </div>
  );
}
