"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, CreditCard, DollarSign, Edit, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const paymentSchema = z.object({
  subscriptionId: z.string().min(1, "Selecciona una suscripción"),
  paymentProvider: z.enum(["STRIPE", "PAYPAL", "MERCADOPAGO", "CULQI"]),
  amount: z.number().positive("El monto debe ser mayor a 0"),
  currency: z.string().default("USD"),
  paymentMethod: z.string().optional(),
  description: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

const updatePaymentStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "PROCESSING",
    "COMPLETED",
    "FAILED",
    "CANCELLED",
    "REFUNDED",
    "PARTIALLY_REFUNDED",
  ]),
  refundAmount: z.number().optional(),
  refundReason: z.string().optional(),
});

type UpdatePaymentStatusData = z.infer<typeof updatePaymentStatusSchema>;

interface Subscription {
  id: string;
  plan: string;
  status?: string;
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  paymentProvider: string;
  currency: string;
  createdAt: Date | string;
  paidAt?: Date | string | null;
  subscriptionId?: string | null;
  subscription?: Subscription | null;
  description?: string | null;
  paymentMethod?: string | null;
  refundedAt?: Date | string | null;
  refundAmount?: number | null;
  refundReason?: string | null;
}

interface PaymentManagerProps {
  userId: string;
  subscriptions?: Subscription[];
  payments?: Payment[];
  onRefresh: () => void;
}

export function PaymentManager({
  userId,
  subscriptions = [],
  payments = [],
  onRefresh,
}: PaymentManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const createPayment = trpc.payment.create.useMutation({
    onSuccess: () => {
      toast.success("Pago creado exitosamente");
      setIsCreateOpen(false);
      onRefresh();
    },
    onError: (error) => {
      toast.error("Error al crear pago", {
        description: error.message,
      });
    },
  });

  const updatePaymentStatus = trpc.payment.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Estado del pago actualizado exitosamente");
      setIsUpdateOpen(false);
      setSelectedPayment(null);
      onRefresh();
    },
    onError: (error) => {
      toast.error("Error al actualizar pago", {
        description: error.message,
      });
    },
  });

  const paymentForm = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentProvider: "STRIPE",
      currency: "USD",
      amount: 0,
    },
  });

  const statusForm = useForm<UpdatePaymentStatusData>({
    resolver: zodResolver(updatePaymentStatusSchema),
    defaultValues: {
      status: "PENDING",
    },
  });

  const onSubmitPayment = (data: PaymentFormData) => {
    createPayment.mutate({
      userId,
      ...data,
    });
  };

  const onSubmitStatusUpdate = (data: UpdatePaymentStatusData) => {
    if (!selectedPayment) return;

    const updateData: {
      id: string;
      status:
        | "PENDING"
        | "PROCESSING"
        | "COMPLETED"
        | "FAILED"
        | "CANCELLED"
        | "REFUNDED"
        | "PARTIALLY_REFUNDED";
      paidAt?: Date;
      failedAt?: Date;
      refundedAt?: Date;
      refundAmount?: number;
      refundReason?: string;
    } = {
      id: selectedPayment.id,
      status: data.status,
    };

    if (data.status === "COMPLETED") {
      updateData.paidAt = new Date();
    } else if (data.status === "FAILED") {
      updateData.failedAt = new Date();
    } else if (
      data.status === "REFUNDED" ||
      data.status === "PARTIALLY_REFUNDED"
    ) {
      updateData.refundedAt = new Date();
      updateData.refundAmount = data.refundAmount || selectedPayment.amount;
      updateData.refundReason = data.refundReason;
    }

    updatePaymentStatus.mutate(updateData);
  };

  const handleUpdateStatus = (payment: Payment) => {
    setSelectedPayment(payment);
    statusForm.reset({
      status: payment.status as
        | "PENDING"
        | "PROCESSING"
        | "COMPLETED"
        | "FAILED"
        | "CANCELLED"
        | "REFUNDED"
        | "PARTIALLY_REFUNDED",
      refundAmount: Number(payment.amount),
    });
    setIsUpdateOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "default";
      case "FAILED":
        return "destructive";
      case "PENDING":
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

  return (
    <div className="space-y-6">
      {/* Create Payment Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Gestionar Pagos</h3>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Pago
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Pago</DialogTitle>
            </DialogHeader>
            <Form {...paymentForm}>
              <form
                onSubmit={paymentForm.handleSubmit(onSubmitPayment)}
                className="space-y-4"
              >
                <FormField
                  control={paymentForm.control}
                  name="subscriptionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Suscripción</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una suscripción" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subscriptions.map((subscription) => (
                            <SelectItem
                              key={subscription.id}
                              value={subscription.id}
                            >
                              {subscription.plan} - {subscription.status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={paymentForm.control}
                  name="paymentProvider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proveedor de Pago</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="STRIPE">Stripe</SelectItem>
                          <SelectItem value="PAYPAL">PayPal</SelectItem>
                          <SelectItem value="MERCADOPAGO">
                            MercadoPago
                          </SelectItem>
                          <SelectItem value="CULQI">Culqi</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={paymentForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              Number.parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={paymentForm.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moneda</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="PEN">PEN</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={paymentForm.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Método de Pago</FormLabel>
                      <FormControl>
                        <Input placeholder="Tarjeta de crédito" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={paymentForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descripción del pago..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createPayment.isPending}>
                    {createPayment.isPending ? "Creando..." : "Crear Pago"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Payments List */}
      <div className="space-y-4">
        {payments.map((payment) => (
          <Card key={payment.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5" />
                  <div>
                    <CardTitle className="text-lg">
                      ${Number(payment.amount).toFixed(2)} {payment.currency}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {payment.paymentProvider}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getStatusColor(payment.status)}>
                    {payment.status}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateStatus(payment)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payment.description && (
                  <p className="text-sm text-muted-foreground">
                    {payment.description}
                  </p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Plan</p>
                    <p className="text-muted-foreground">
                      {payment.subscription?.plan || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Método</p>
                    <p className="text-muted-foreground">
                      {payment.paymentMethod || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Creado</p>
                    <p className="text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Pagado</p>
                    <p className="text-muted-foreground">
                      {payment.paidAt
                        ? new Date(payment.paidAt).toLocaleDateString()
                        : "Pendiente"}
                    </p>
                  </div>
                </div>

                {payment.refundedAt && (
                  <div className="mt-3 p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CreditCard className="h-4 w-4" />
                      <span className="font-medium text-sm">Reembolso</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Monto: ${Number(payment.refundAmount || 0).toFixed(2)}
                      {payment.refundReason && ` - ${payment.refundReason}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Fecha: {new Date(payment.refundedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {payments.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay pagos</h3>
              <p className="text-muted-foreground text-center mb-4">
                Este usuario no tiene pagos registrados.
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Pago
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Update Payment Status Dialog */}
      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Actualizar Estado del Pago</DialogTitle>
          </DialogHeader>
          <Form {...statusForm}>
            <form
              onSubmit={statusForm.handleSubmit(onSubmitStatusUpdate)}
              className="space-y-4"
            >
              <FormField
                control={statusForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(statusForm.watch("status") === "REFUNDED" ||
                statusForm.watch("status") === "PARTIALLY_REFUNDED") && (
                <>
                  <FormField
                    control={statusForm.control}
                    name="refundAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monto del Reembolso</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                Number.parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={statusForm.control}
                    name="refundReason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Razón del Reembolso</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Razón del reembolso..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUpdateOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={updatePaymentStatus.isPending}>
                  {updatePaymentStatus.isPending
                    ? "Actualizando..."
                    : "Actualizar Estado"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
