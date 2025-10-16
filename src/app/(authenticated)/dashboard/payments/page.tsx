"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollableTable } from "@/components/ui/scrollable-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/utils/trpc";
import type {
  PaymentProvider,
  PaymentStatus,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@prisma/client";
import {
  Activity,
  BarChart3,
  Calendar,
  CreditCard,
  DollarSign,
  Download,
  Filter,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";

// Types for the data returned from tRPC queries (serialized)
type PaymentWithRelations = {
  id: string;
  userId: string;
  subscriptionId: string;
  paymentProvider: PaymentProvider;
  providerPaymentId: string | null;
  amount: string; // Serialized as string from Decimal
  currency: string;
  status: PaymentStatus;
  paymentMethod: string | null;
  description: string | null;
  metadata: unknown;
  paidAt: string | null; // Serialized as ISO string
  failedAt: string | null; // Serialized as ISO string
  refundedAt: string | null; // Serialized as ISO string
  refundAmount: string | null; // Serialized as string from Decimal
  refundReason: string | null;
  createdAt: string; // Serialized as ISO string
  updatedAt: string; // Serialized as ISO string
  user: {
    id: string;
    name: string;
    email: string;
  };
  subscription: {
    id: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
  };
};

type SubscriptionWithRelations = {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  paymentProvider: PaymentProvider;
  providerCustomerId: string | null;
  providerSubscriptionId: string | null;
  currentPlanStart: string | null; // Serialized as ISO string
  currentPlanEnd: string | null; // Serialized as ISO string
  createdAt: string; // Serialized as ISO string
  updatedAt: string; // Serialized as ISO string
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export default function PaymentsDashboardPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [providerFilter, setProviderFilter] = useState<string>("");

  const limit = 20;

  // Get all payments with pagination and filters
  const { data: paymentsData, isLoading: paymentsLoading } =
    trpc.payment.getAll.useQuery({
      page,
      limit,
      search: search || undefined,
      status: statusFilter as
        | "PENDING"
        | "PROCESSING"
        | "COMPLETED"
        | "FAILED"
        | "CANCELLED"
        | "REFUNDED"
        | "PARTIALLY_REFUNDED"
        | undefined,
      paymentProvider: providerFilter as
        | "STRIPE"
        | "PAYPAL"
        | "MERCADOPAGO"
        | "CULQI"
        | undefined,
    });

  // Get all subscriptions with pagination
  const { data: subscriptionsData, isLoading: subscriptionsLoading } =
    trpc.subscription.getAll.useQuery({
      page,
      limit,
      search: search || undefined,
    });

  // Get payment statistics
  const { data: paymentStats, isLoading: paymentStatsLoading } =
    trpc.payment.getGlobalStats.useQuery({
      userId: undefined, // undefined to get global stats
    });

  // Get subscription statistics
  const { data: subscriptionStats, isLoading: subscriptionStatsLoading } =
    trpc.subscription.getStats.useQuery({
      userId: undefined, // undefined to get global stats
    });

  const isLoading =
    paymentsLoading ||
    subscriptionsLoading ||
    paymentStatsLoading ||
    subscriptionStatsLoading;

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

  const payments = paymentsData?.payments || [];
  const subscriptions = subscriptionsData?.subscriptions || [];

  const getStatusColor = (
    status: string
  ): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case "COMPLETED":
      case "ACTIVE":
        return "default";
      case "FAILED":
      case "CANCELED":
        return "destructive";
      case "PENDING":
      case "TRIALING":
        return "secondary";
      case "PROCESSING":
        return "outline";
      case "REFUNDED":
      case "PARTIALLY_REFUNDED":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case "STRIPE":
        return "bg-purple-100 text-purple-800";
      case "PAYPAL":
        return "bg-blue-100 text-blue-800";
      case "MERCADOPAGO":
        return "bg-green-100 text-green-800";
      case "CULQI":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Gestión de Pagos y Suscripciones
          </h1>
          <p className="text-muted-foreground">
            Administra y monitorea todos los pagos y suscripciones del sistema
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="payments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="payments">Pagos</TabsTrigger>
          <TabsTrigger value="subscriptions">Suscripciones</TabsTrigger>
        </TabsList>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          {/* Payment Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Pagos
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {paymentStats?.totalPayments || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {paymentStats?.completedPayments || 0} exitosos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Ingresos Totales
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${Number(paymentStats?.completedAmount || 0).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  ${Number(paymentStats?.totalAmount || 0).toFixed(2)} en total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tasa de Éxito
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {paymentStats?.successRate?.toFixed(1) || 0}%
                </div>
                <p className="text-xs text-muted-foreground">Pagos exitosos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Último Pago
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {paymentStats?.lastPayment
                    ? new Date(
                        paymentStats.lastPayment.createdAt
                      ).toLocaleDateString()
                    : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {paymentStats?.lastPayment?.subscription?.plan || "Sin datos"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payment Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                Filtros de Pagos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por usuario o ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado del pago" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los estados</SelectItem>
                    <SelectItem value="PENDING">Pendiente</SelectItem>
                    <SelectItem value="PROCESSING">Procesando</SelectItem>
                    <SelectItem value="COMPLETED">Completado</SelectItem>
                    <SelectItem value="FAILED">Fallido</SelectItem>
                    <SelectItem value="CANCELLED">Cancelado</SelectItem>
                    <SelectItem value="REFUNDED">Reembolsado</SelectItem>
                    <SelectItem value="PARTIALLY_REFUNDED">
                      Parcialmente Reembolsado
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={providerFilter}
                  onValueChange={setProviderFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los proveedores</SelectItem>
                    <SelectItem value="STRIPE">Stripe</SelectItem>
                    <SelectItem value="PAYPAL">PayPal</SelectItem>
                    <SelectItem value="MERCADOPAGO">MercadoPago</SelectItem>
                    <SelectItem value="CULQI">Culqi</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("");
                    setProviderFilter("");
                  }}
                >
                  Limpiar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payments Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Pagos</CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length > 0 ? (
                <ScrollableTable<PaymentWithRelations>
                  data={payments}
                  columns={[
                    {
                      key: "user",
                      title: "Usuario",
                      render: (_, payment: PaymentWithRelations) => (
                        <div>
                          <div className="font-medium">{payment.user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {payment.user.email}
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: "amount",
                      title: "Monto",
                      render: (_, payment: PaymentWithRelations) => (
                        <div>
                          <div className="font-medium">
                            ${Number(payment.amount).toFixed(2)}{" "}
                            {payment.currency}
                          </div>
                          {payment.refundAmount && (
                            <div className="text-sm text-red-600">
                              Reembolsado: $
                              {Number(payment.refundAmount).toFixed(2)}
                            </div>
                          )}
                        </div>
                      ),
                    },
                    {
                      key: "plan",
                      title: "Plan",
                      render: (_, payment: PaymentWithRelations) => (
                        <Badge variant="outline">
                          {payment.subscription.plan}
                        </Badge>
                      ),
                    },
                    {
                      key: "status",
                      title: "Estado",
                      render: (_, payment: PaymentWithRelations) => (
                        <Badge variant={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      ),
                    },
                    {
                      key: "provider",
                      title: "Proveedor",
                      render: (_, payment: PaymentWithRelations) => (
                        <Badge
                          className={getProviderColor(payment.paymentProvider)}
                        >
                          {payment.paymentProvider}
                        </Badge>
                      ),
                    },
                    {
                      key: "date",
                      title: "Fecha",
                      render: (_, payment: PaymentWithRelations) => (
                        <div>
                          <div className="text-sm">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </div>
                          {payment.paidAt && (
                            <div className="text-xs text-muted-foreground">
                              Pagado:{" "}
                              {new Date(payment.paidAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ),
                    },
                  ]}
                  actions={[
                    {
                      label: "Ver Detalles",
                      onClick: (payment: PaymentWithRelations) => {
                        // TODO: Implement payment details modal
                        console.log("View payment details:", payment.id);
                      },
                      variant: "default",
                    },
                  ]}
                  showPagination={false}
                />
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay pagos</h3>
                  <p className="text-muted-foreground">
                    No se encontraron pagos con los filtros aplicados.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Pagination */}
          {paymentsData && paymentsData.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {(page - 1) * limit + 1} a{" "}
                {Math.min(page * limit, paymentsData.total)} de{" "}
                {paymentsData.total} pagos
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <span className="text-sm">
                  Página {page} de {paymentsData.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === paymentsData.totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          {/* Subscription Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Suscripciones
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {subscriptionStats?.totalSubscriptions || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {subscriptionStats?.activeSubscriptions || 0} activas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Ingresos por Suscripciones
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${Number(subscriptionStats?.totalRevenue || 0).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ingresos totales
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tasa de Retención
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {subscriptionStats?.retentionRate?.toFixed(1) || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Usuarios activos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Canceladas
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {subscriptionStats?.canceledSubscriptions || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Suscripciones canceladas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Subscriptions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Suscripciones</CardTitle>
            </CardHeader>
            <CardContent>
              {subscriptions.length > 0 ? (
                <ScrollableTable<SubscriptionWithRelations>
                  data={subscriptions}
                  columns={[
                    {
                      key: "user",
                      title: "Usuario",
                      render: (_, subscription: SubscriptionWithRelations) => (
                        <div>
                          <div className="font-medium">
                            {subscription.user.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {subscription.user.email}
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: "plan",
                      title: "Plan",
                      render: (_, subscription: SubscriptionWithRelations) => (
                        <Badge variant="outline">{subscription.plan}</Badge>
                      ),
                    },
                    {
                      key: "status",
                      title: "Estado",
                      render: (_, subscription: SubscriptionWithRelations) => (
                        <Badge variant={getStatusColor(subscription.status)}>
                          {subscription.status}
                        </Badge>
                      ),
                    },
                    {
                      key: "provider",
                      title: "Proveedor",
                      render: (_, subscription: SubscriptionWithRelations) => (
                        <Badge
                          className={getProviderColor(
                            subscription.paymentProvider
                          )}
                        >
                          {subscription.paymentProvider}
                        </Badge>
                      ),
                    },
                    {
                      key: "start",
                      title: "Inicio",
                      render: (_, subscription: SubscriptionWithRelations) => (
                        <div className="text-sm">
                          {subscription.currentPlanStart
                            ? new Date(
                                subscription.currentPlanStart
                              ).toLocaleDateString()
                            : "N/A"}
                        </div>
                      ),
                    },
                    {
                      key: "end",
                      title: "Fin",
                      render: (_, subscription: SubscriptionWithRelations) => (
                        <div className="text-sm">
                          {subscription.currentPlanEnd
                            ? new Date(
                                subscription.currentPlanEnd
                              ).toLocaleDateString()
                            : "N/A"}
                        </div>
                      ),
                    },
                  ]}
                  actions={[
                    {
                      label: "Ver Detalles",
                      onClick: (subscription: SubscriptionWithRelations) => {
                        // TODO: Implement subscription details modal
                        console.log(
                          "View subscription details:",
                          subscription.id
                        );
                      },
                      variant: "default",
                    },
                  ]}
                  showPagination={false}
                />
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No hay suscripciones
                  </h3>
                  <p className="text-muted-foreground">
                    No se encontraron suscripciones.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subscription Pagination */}
          {subscriptionsData && subscriptionsData.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {(page - 1) * limit + 1} a{" "}
                {Math.min(page * limit, subscriptionsData.total)} de{" "}
                {subscriptionsData.total} suscripciones
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <span className="text-sm">
                  Página {page} de {subscriptionsData.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === subscriptionsData.totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
