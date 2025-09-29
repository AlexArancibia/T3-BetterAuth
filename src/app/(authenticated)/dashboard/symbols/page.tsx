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
import { Edit, Plus, Trash2, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const symbolSchema = z.object({
  symbol: z.string().min(1, "Símbolo es requerido"),
  displayName: z
    .string()
    .min(2, "Nombre de visualización debe tener al menos 2 caracteres"),
  category: z.enum(["FOREX", "CRYPTO", "STOCKS", "COMMODITIES", "INDICES"]),
  baseCurrency: z.string().min(1, "Moneda base es requerida"),
  quoteCurrency: z.string().min(1, "Moneda de cotización es requerida"),
  pipDecimalPosition: z.number().min(0).optional(),
});

type SymbolFormData = z.infer<typeof symbolSchema>;

interface Symbol {
  id: string;
  symbol: string;
  displayName: string;
  category: "FOREX" | "CRYPTO" | "STOCKS" | "COMMODITIES" | "INDICES";
  baseCurrency: string;
  quoteCurrency: string;
  pipDecimalPosition: number;
  createdAt: string;
  updatedAt: string;
}

export default function SymbolsPage() {
  const [editingSymbol, setEditingSymbol] = useState<Partial<Symbol> | null>(
    null
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const pagination = usePagination({ defaultLimit: 10 });
  const queryParams = pagination.getQueryParams();

  const {
    data: response,
    refetch,
    error,
    isLoading,
  } = trpc.symbol.getAll.useQuery(queryParams);

  const createSymbol = trpc.symbol.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsCreateModalOpen(false);
      form.reset();
    },
  });

  const updateSymbol = trpc.symbol.update.useMutation({
    onSuccess: () => {
      refetch();
      setEditingSymbol(null);
      form.reset();
    },
  });

  const deleteSymbol = trpc.symbol.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const form = useForm<SymbolFormData>({
    resolver: zodResolver(symbolSchema),
    defaultValues: {
      symbol: "",
      displayName: "",
      category: "FOREX",
      baseCurrency: "",
      quoteCurrency: "",
      pipDecimalPosition: 4,
    },
  });

  const symbols = response?.data || [];
  const paginationInfo = response?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };

  const handleEdit = (symbol: Symbol) => {
    setEditingSymbol(symbol);
    form.reset({
      symbol: symbol.symbol || "",
      displayName: symbol.displayName || "",
      category: symbol.category || "FOREX",
      baseCurrency: symbol.baseCurrency || "",
      quoteCurrency: symbol.quoteCurrency || "",
      pipDecimalPosition: symbol.pipDecimalPosition ?? 4,
    });
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true);
    setEditingSymbol(null);
    form.reset();
  };

  const onSubmit = (data: SymbolFormData) => {
    if (editingSymbol?.id) {
      updateSymbol.mutate({
        id: editingSymbol.id,
        ...data,
        pipDecimalPosition: data.pipDecimalPosition ?? 4,
      });
    } else {
      createSymbol.mutate({
        ...data,
        pipDecimalPosition: data.pipDecimalPosition ?? 4,
      });
    }
  };

  const handleDelete = (symbol: Symbol) => {
    if (confirm("¿Estás seguro de que quieres eliminar este símbolo?")) {
      deleteSymbol.mutate({ id: symbol.id });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "FOREX":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "CRYPTO":
        return "bg-orange-50 text-orange-600 border-orange-200";
      case "STOCKS":
        return "bg-green-50 text-green-600 border-green-200";
      case "COMMODITIES":
        return "bg-yellow-50 text-yellow-600 border-yellow-200";
      case "INDICES":
        return "bg-purple-50 text-purple-600 border-purple-200";
      default:
        return "bg-muted text-foreground";
    }
  };

  // Definir columnas de la tabla
  const columns: TableColumn<Symbol>[] = [
    {
      key: "symbol",
      title: "Símbolo",
      render: (_, record) => (
        <div>
          <div className="text-sm font-medium text-foreground">
            {record.symbol}
          </div>
          <div className="text-sm text-muted-foreground">
            {record.displayName}
          </div>
        </div>
      ),
    },
    {
      key: "category",
      title: "Categoría",
      render: (value) => (
        <Badge
          variant="outline"
          className={`text-xs font-medium ${getCategoryColor(value as string)}`}
        >
          {value as string}
        </Badge>
      ),
    },
    {
      key: "pipDecimalPosition",
      title: "Decimales Pip",
      render: (value) => (
        <span className="text-sm text-foreground">{value as number}</span>
      ),
    },
    {
      key: "createdAt",
      title: "Creado",
      render: (_, record) => (
        <div className="text-xs text-muted-foreground">
          {new Date(record.createdAt).toLocaleDateString("es-ES")}
        </div>
      ),
    },
  ];

  // Definir acciones de la tabla
  const actions: TableAction<Symbol>[] = [
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
          <h1 className="text-2xl font-semibold text-foreground">
            Gestión de Símbolos
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 mr-8">
            Administra los símbolos de trading disponibles en el sistema
          </p>
        </div>
        <Button
          size="sm"
          className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white border-0"
          onClick={handleCreate}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          <span>Nuevo Símbolo</span>
        </Button>
      </div>

      {/* Tabla con ScrollableTable */}
      <ScrollableTable<Symbol>
        data={symbols}
        columns={columns}
        loading={isLoading}
        error={error?.message || null}
        pagination={paginationInfo}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setLimit}
        actions={actions}
        emptyMessage="No se encontraron símbolos"
        emptyIcon={<TrendingUp className="h-12 w-12 text-muted-foreground" />}
      />

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateModalOpen || !!editingSymbol}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateModalOpen(false);
            setEditingSymbol(null);
            form.reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl border-border">
          <DialogHeader>
            <DialogTitle>
              {editingSymbol ? "Editar Símbolo" : "Crear Nuevo Símbolo"}
            </DialogTitle>
            <DialogDescription>
              {editingSymbol
                ? "Modifica la información del símbolo seleccionado."
                : "Completa la información para crear un nuevo símbolo en el sistema."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="symbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Símbolo *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="EURUSD" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de Visualización *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Euro vs US Dollar" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="FOREX">FOREX</SelectItem>
                        <SelectItem value="CRYPTO">CRYPTO</SelectItem>
                        <SelectItem value="STOCKS">STOCKS</SelectItem>
                        <SelectItem value="COMMODITIES">COMMODITIES</SelectItem>
                        <SelectItem value="INDICES">INDICES</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="baseCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moneda Base *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="EUR" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quoteCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moneda de Cotización *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="USD" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="pipDecimalPosition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Posición Decimal del Pip</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        onChange={(e) =>
                          field.onChange(
                            Number.parseInt(e.target.value, 10) || 4
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingSymbol(null);
                    form.reset();
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createSymbol.isPending || updateSymbol.isPending}
                >
                  {createSymbol.isPending || updateSymbol.isPending
                    ? editingSymbol
                      ? "Actualizando..."
                      : "Creando..."
                    : editingSymbol
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
