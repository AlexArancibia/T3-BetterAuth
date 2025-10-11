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
import { CreditCard, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const subscriptionSchema = z.object({
  plan: z.enum(["FREE", "BASIC", "PREMIUM", "ENTERPRISE"]),
  paymentProvider: z.enum(["STRIPE", "PAYPAL", "MERCADOPAGO", "CULQI"]),
  amount: z.number().positive().optional(),
  currency: z.string().default("USD"),
  paymentMethod: z.string().optional(),
  description: z.string().optional(),
});

type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

interface Subscription {
  id: string;
  plan: string;
  paymentProvider: string;
  status: string;
  currentPlanStart?: Date | string;
  currentPlanEnd?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface SubscriptionManagerProps {
  userId: string;
  subscriptions?: Subscription[];
  onRefresh: () => void;
}

export function SubscriptionManager({
  userId,
  subscriptions = [],
  onRefresh,
}: SubscriptionManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // @ts-ignore - Type instantiation depth issue with complex tRPC types
  const createSubscription = trpc.subscription.createWithPayment.useMutation({
    onSuccess: () => {
      toast.success("Suscripción creada exitosamente");
      setIsCreateOpen(false);
      onRefresh();
    },
    onError: (error) => {
      toast.error("Error al crear suscripción", {
        description: error.message,
      });
    },
  });

  const cancelSubscription = trpc.subscription.cancel.useMutation({
    onSuccess: () => {
      toast.success("Suscripción cancelada exitosamente");
      onRefresh();
    },
    onError: (error) => {
      toast.error("Error al cancelar suscripción", {
        description: error.message,
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      plan: "BASIC",
      paymentProvider: "STRIPE",
      currency: "USD",
      amount: 0,
    },
  });

  const onSubmit = (data: SubscriptionFormData) => {
    if (data.plan === "FREE") {
      data.amount = 0;
    }

    createSubscription.mutate({
      userId,
      ...data,
      amount: data.amount || 0,
    });
  };

  const handleCancelSubscription = (subscriptionId: string) => {
    if (confirm("¿Estás seguro de que quieres cancelar esta suscripción?")) {
      cancelSubscription.mutate({
        subscriptionId,
        reason: "Cancelado por administrador",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Subscription Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Gestionar Suscripciones</h3>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Suscripción
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nueva Suscripción</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="plan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un plan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="FREE">Gratis</SelectItem>
                          <SelectItem value="BASIC">Básico</SelectItem>
                          <SelectItem value="PREMIUM">Premium</SelectItem>
                          <SelectItem value="ENTERPRISE">
                            Empresarial
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
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
                            <SelectValue placeholder="Selecciona un proveedor" />
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

                {form.watch("plan") !== "FREE" && (
                  <>
                    <FormField
                      control={form.control}
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
                      control={form.control}
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
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Método de Pago</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Tarjeta de crédito"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <FormField
                  control={form.control}
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
                  <Button type="submit" disabled={createSubscription.isPending}>
                    {createSubscription.isPending
                      ? "Creando..."
                      : "Crear Suscripción"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Subscriptions List */}
      <div className="space-y-4">
        {subscriptions.map((subscription) => (
          <Card key={subscription.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5" />
                  <div>
                    <CardTitle className="text-lg">
                      {subscription.plan}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {subscription.paymentProvider}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      subscription.status === "ACTIVE"
                        ? "default"
                        : subscription.status === "CANCELED"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {subscription.status}
                  </Badge>
                  {subscription.status === "ACTIVE" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancelSubscription(subscription.id)}
                      disabled={cancelSubscription.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-medium">Inicio</p>
                  <p className="text-muted-foreground">
                    {subscription.currentPlanStart
                      ? new Date(
                          subscription.currentPlanStart
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Fin</p>
                  <p className="text-muted-foreground">
                    {subscription.currentPlanEnd
                      ? new Date(
                          subscription.currentPlanEnd
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Creado</p>
                  <p className="text-muted-foreground">
                    {new Date(subscription.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Actualizado</p>
                  <p className="text-muted-foreground">
                    {new Date(subscription.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {subscriptions.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No hay suscripciones
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                Este usuario no tiene suscripciones activas.
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Suscripción
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
