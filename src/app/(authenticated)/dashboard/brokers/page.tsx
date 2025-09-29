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
import { Textarea } from "@/components/ui/textarea";
import { usePagination } from "@/hooks/usePagination";
import { trpc } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const brokerSchema = z.object({
  name: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
  displayName: z
    .string()
    .min(2, "Nombre de visualización debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  logoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  isActive: z.boolean(),
});

type BrokerFormData = z.infer<typeof brokerSchema>;

interface Broker {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  website: string | null;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function BrokersPage() {
  const [editingBroker, setEditingBroker] = useState<Partial<Broker> | null>(
    null
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const pagination = usePagination({ defaultLimit: 10 });
  const queryParams = pagination.getQueryParams();

  const {
    data: response,
    refetch,
    isLoading,
  } = trpc.broker.getAll.useQuery(queryParams);

  const brokers: Broker[] = (response?.data as Broker[]) || [];

  const createBroker = trpc.broker.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsCreateModalOpen(false);
      form.reset();
    },
  });

  const updateBroker = trpc.broker.update.useMutation({
    onSuccess: () => {
      refetch();
      setEditingBroker(null);
      form.reset();
    },
  });

  const deleteBroker = trpc.broker.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const form = useForm<BrokerFormData>({
    resolver: zodResolver(brokerSchema),
    defaultValues: {
      name: "",
      displayName: "",
      description: "",
      website: "",
      logoUrl: "",
      isActive: true,
    },
  });

  const handleEdit = (broker: Partial<Broker>) => {
    setEditingBroker(broker);
    form.reset({
      name: broker.name || "",
      displayName: broker.displayName || "",
      description: broker.description || "",
      website: broker.website || "",
      logoUrl: broker.logoUrl || "",
    });
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true);
    setEditingBroker(null);
    form.reset();
  };

  const onSubmit = (data: BrokerFormData) => {
    if (editingBroker?.id) {
      updateBroker.mutate({
        id: editingBroker.id,
        ...data,
      });
    } else {
      createBroker.mutate(data);
    }
  };

  const handleDelete = (broker: Broker) => {
    if (confirm("¿Estás seguro de que quieres eliminar este broker?")) {
      deleteBroker.mutate({ id: broker.id });
    }
  };

  // Definir columnas de la tabla
  const columns: TableColumn<Broker>[] = [
    {
      key: "displayName",
      title: "Broker",
      render: (_, record) => (
        <div className="flex items-center">
          {record.logoUrl ? (
            <img
              src={record.logoUrl}
              alt={record.displayName}
              className="h-10 w-10 rounded-full object-cover mr-3"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
          )}
          <div>
            <div className="text-sm font-medium text-foreground">
              {record.displayName}
            </div>
            <div className="text-sm text-muted-foreground">{record.name}</div>
          </div>
        </div>
      ),
    },
    {
      key: "website",
      title: "Sitio Web",
      render: (value) =>
        value ? (
          <a
            href={value as string}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {value as string}
          </a>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: "status",
      title: "Estado",
      render: (_, record) => (
        <Badge
          variant="outline"
          className={`text-xs font-medium ${
            record.isActive
              ? "bg-green-100 text-green-600 border-green-200 hover:bg-green-200"
              : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
          }`}
        >
          {record.isActive ? "Activo" : "Inactivo"}
        </Badge>
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
  const actions: TableAction<Broker>[] = [
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
            Gestión de Brokers
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 mr-8">
            Administra los brokers del sistema y configura sus reglas
          </p>
        </div>
        <Button
          size="sm"
          className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white border-0"
          onClick={handleCreate}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          <span>Nuevo Broker</span>
        </Button>
      </div>

      {/* Tabla con ScrollableTable */}
      <ScrollableTable<Broker>
        data={brokers}
        columns={columns}
        actions={actions}
        emptyMessage="No se encontraron brokers"
        emptyIcon={<Building2 className="h-12 w-12 text-muted-foreground" />}
        loading={isLoading}
      />

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateModalOpen || !!editingBroker}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateModalOpen(false);
            setEditingBroker(null);
            form.reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl border-border">
          <DialogHeader>
            <DialogTitle>
              {editingBroker ? "Editar Broker" : "Crear Nuevo Broker"}
            </DialogTitle>
            <DialogDescription>
              {editingBroker
                ? "Modifica la información del broker seleccionado."
                : "Completa la información para crear un nuevo broker en el sistema."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Broker *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="broker_name" />
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
                        <Input {...field} placeholder="Nombre del Broker" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Descripción del broker..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sitio Web</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="url"
                          placeholder="https://ejemplo.com"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL del Logo</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="url"
                          placeholder="https://ejemplo.com/logo.png"
                        />
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
                    setEditingBroker(null);
                    form.reset();
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createBroker.isPending || updateBroker.isPending}
                >
                  {createBroker.isPending || updateBroker.isPending
                    ? editingBroker
                      ? "Actualizando..."
                      : "Creando..."
                    : editingBroker
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
