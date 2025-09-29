"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
  ScrollableTable,
  type TableAction,
  type TableColumn,
} from "@/components/ui/scrollable-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePagination } from "@/hooks/usePagination";
import { trpc } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Plus, Settings, ToggleLeft, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const symbolConfigSchema = z.object({
  propfirmId: z.string().optional(),
  brokerId: z.string().optional(),
  symbolId: z.string().min(1, "Símbolo es requerido"),
  commissionPerLot: z.number().min(0).optional(),
  pipValuePerLot: z.number().min(0),
  pipTicks: z.number().min(1),
  spreadTypical: z.number().min(0).optional(),
  spreadRecommended: z.number().min(0).optional(),
  isAvailable: z.boolean(),
});

type SymbolConfigFormData = z.infer<typeof symbolConfigSchema>;

// Raw data from API
interface SymbolConfigRaw {
  id: string;
  propfirmId: string | null;
  brokerId: string | null;
  symbolId: string;
  commissionPerLot: string | null;
  pipValuePerLot: string;
  pipTicks: number;
  spreadTypical: string | null;
  spreadRecommended: string | null;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  propfirm: {
    name: string;
    displayName: string;
  } | null;
  broker: {
    name: string;
    displayName: string;
  } | null;
  symbol: {
    symbol: string;
    displayName: string;
    category: string;
  };
}

// Processed data for display
interface SymbolConfig {
  id: string;
  propfirmId: string | null;
  brokerId: string | null;
  symbolId: string;
  commissionPerLot: number | null;
  pipValuePerLot: number;
  pipTicks: number;
  spreadTypical: number | null;
  spreadRecommended: number | null;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  propfirm: {
    name: string;
    displayName: string;
  } | null;
  broker: {
    name: string;
    displayName: string;
  } | null;
  symbol: {
    symbol: string;
    displayName: string;
    category: string;
  };
}

export default function SymbolConfigsPage() {
  const [editingConfig, setEditingConfig] =
    useState<Partial<SymbolConfig> | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const pagination = usePagination({ defaultLimit: 10 });
  const queryParams = pagination.getQueryParams();

  const {
    data: response,
    refetch,
    error,
    isLoading,
  } = trpc.symbolConfig.getAll.useQuery(queryParams);

  const { data: symbolsResponse } = trpc.symbol.getAll.useQuery({
    page: 1,
    limit: 100,
  });
  const { data: propfirmsResponse } = trpc.propfirm.getAll.useQuery({
    page: 1,
    limit: 100,
  });
  const { data: brokersResponse } = trpc.broker.getAll.useQuery({
    page: 1,
    limit: 100,
  });

  const createConfig = trpc.symbolConfig.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsCreateModalOpen(false);
      form.reset();
    },
  });

  const updateConfig = trpc.symbolConfig.update.useMutation({
    onSuccess: () => {
      refetch();
      setEditingConfig(null);
      form.reset();
    },
  });

  const deleteConfig = trpc.symbolConfig.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const toggleAvailable = trpc.symbolConfig.toggleAvailable.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const form = useForm<SymbolConfigFormData>({
    resolver: zodResolver(symbolConfigSchema),
    defaultValues: {
      propfirmId: "",
      brokerId: "",
      symbolId: "",
      commissionPerLot: 0,
      pipValuePerLot: 10,
      pipTicks: 1,
      spreadTypical: 1,
      spreadRecommended: 1,
      isAvailable: true,
    },
  });

  const configs = (response?.data || []).map(
    (config: SymbolConfigRaw): SymbolConfig => ({
      ...config,
      commissionPerLot: config.commissionPerLot
        ? Number.parseFloat(config.commissionPerLot)
        : null,
      pipValuePerLot: Number.parseFloat(config.pipValuePerLot),
      pipTicks: config.pipTicks,
      spreadTypical: config.spreadTypical
        ? Number.parseFloat(config.spreadTypical)
        : null,
      spreadRecommended: config.spreadRecommended
        ? Number.parseFloat(config.spreadRecommended)
        : null,
    })
  );
  const symbols = symbolsResponse?.data || [];
  const propfirms = propfirmsResponse?.data || [];
  const brokers = brokersResponse?.data || [];

  const paginationInfo = response?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };

  const handleEdit = (config: SymbolConfig) => {
    setEditingConfig(config);
    form.reset({
      propfirmId: config.propfirmId || "none",
      brokerId: config.brokerId || "none",
      symbolId: config.symbolId || "",
      commissionPerLot: config.commissionPerLot || 0,
      pipValuePerLot: config.pipValuePerLot || 10,
      pipTicks: config.pipTicks || 1,
      spreadTypical: config.spreadTypical || 1,
      spreadRecommended: config.spreadRecommended || 1,
      isAvailable: config.isAvailable,
    });
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true);
    setEditingConfig(null);
    form.reset();
  };

  const onSubmit = (data: SymbolConfigFormData) => {
    // Convert "none" values to undefined for optional fields
    const processedData = {
      ...data,
      propfirmId: data.propfirmId === "none" ? undefined : data.propfirmId,
      brokerId: data.brokerId === "none" ? undefined : data.brokerId,
    };

    if (editingConfig?.id) {
      updateConfig.mutate({
        id: editingConfig.id,
        ...processedData,
      });
    } else {
      createConfig.mutate(processedData);
    }
  };

  const handleDelete = (config: SymbolConfig) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta configuración?")) {
      deleteConfig.mutate({ id: config.id });
    }
  };

  const handleToggleAvailable = (config: SymbolConfig) => {
    toggleAvailable.mutate({ id: config.id });
  };

  // Definir columnas de la tabla
  const columns: TableColumn<SymbolConfig>[] = [
    {
      key: "symbol",
      title: "Símbolo",
      render: (_, record) => (
        <div>
          <div className="text-sm font-medium text-foreground">
            {record.symbol.symbol}
          </div>
          <div className="text-sm text-muted-foreground">
            {record.symbol.displayName}
          </div>
        </div>
      ),
    },
    {
      key: "propfirm",
      title: "Propfirm",
      render: (_, record) =>
        record.propfirm ? (
          <span className="text-sm text-foreground">
            {record.propfirm.displayName}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: "broker",
      title: "Broker",
      render: (_, record) =>
        record.broker ? (
          <span className="text-sm text-foreground">
            {record.broker.displayName}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: "pipValuePerLot",
      title: "Valor Pip/Lote",
      render: (value) => (
        <span className="text-sm text-foreground">${value as number}</span>
      ),
    },
    {
      key: "isAvailable",
      title: "Disponible",
      render: (_, record) => (
        <Badge
          variant="outline"
          className={`text-xs font-medium ${
            record.isAvailable
              ? "bg-green-50 text-green-600 border-green-200"
              : "bg-red-50 text-red-600 border-red-200"
          }`}
        >
          {record.isAvailable ? "Sí" : "No"}
        </Badge>
      ),
    },
  ];

  // Definir acciones de la tabla
  const actions: TableAction<SymbolConfig>[] = [
    {
      label: "Editar",
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEdit,
      variant: "default",
    },
    {
      label: "Alternar Disponibilidad",
      icon: <ToggleLeft className="h-4 w-4" />,
      onClick: handleToggleAvailable,
      variant: "default",
      separator: true,
    },
    {
      label: "Eliminar",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDelete,
      variant: "destructive",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Configuraciones de Símbolos
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 mr-8">
            Configura parámetros específicos para cada símbolo de trading
          </p>
        </div>
        <Button
          size="sm"
          className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white border-0"
          onClick={handleCreate}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          <span>Nueva Configuración</span>
        </Button>
      </div>

      {/* Tabla con ScrollableTable */}
      <ScrollableTable<SymbolConfig>
        data={configs}
        columns={columns}
        loading={isLoading}
        error={error?.message || null}
        pagination={paginationInfo}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setLimit}
        actions={actions}
        emptyMessage="No se encontraron configuraciones"
        emptyIcon={<Settings className="h-12 w-12 text-muted-foreground" />}
      />

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateModalOpen || !!editingConfig}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateModalOpen(false);
            setEditingConfig(null);
            form.reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-4xl border-border">
          <DialogHeader>
            <DialogTitle>
              {editingConfig
                ? "Editar Configuración"
                : "Crear Nueva Configuración"}
            </DialogTitle>
            <DialogDescription>
              {editingConfig
                ? "Modifica la configuración del símbolo seleccionado."
                : "Completa la información para crear una nueva configuración de símbolo."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="symbolId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Símbolo *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar símbolo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {symbols.map((symbol) => (
                            <SelectItem key={symbol.id} value={symbol.id}>
                              {symbol.symbol} - {symbol.displayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="propfirmId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Propfirm</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar propfirm" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Sin propfirm</SelectItem>
                          {propfirms.map((propfirm) => (
                            <SelectItem key={propfirm.id} value={propfirm.id}>
                              {propfirm.displayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="brokerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Broker</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar broker" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Sin broker</SelectItem>
                          {brokers.map((broker) => (
                            <SelectItem key={broker.id} value={broker.id}>
                              {broker.displayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pipValuePerLot"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Pip por Lote *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          min="0"
                          onChange={(e) =>
                            field.onChange(Number.parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="commissionPerLot"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comisión por Lote</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          min="0"
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
                  name="spreadTypical"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spread Típico</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.1"
                          min="0"
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
                  name="spreadRecommended"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spread Recomendado</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.1"
                          min="0"
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="pipTicks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pip Ticks *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="1"
                          onChange={(e) =>
                            field.onChange(Number.parseInt(e.target.value, 10))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isAvailable"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disponible</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-foreground">
                            Configuración disponible
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingConfig(null);
                    form.reset();
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createConfig.isPending || updateConfig.isPending}
                >
                  {createConfig.isPending || updateConfig.isPending
                    ? editingConfig
                      ? "Actualizando..."
                      : "Creando..."
                    : editingConfig
                      ? "Actualizar"
                      : "Crear"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
