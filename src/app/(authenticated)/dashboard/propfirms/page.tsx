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
import { Building, Edit, Eye, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const propfirmSchema = z.object({
  name: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
  displayName: z
    .string()
    .min(2, "Nombre de visualización debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  logoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  isActive: z.boolean(),
});

type PropfirmFormData = z.infer<typeof propfirmSchema>;

interface Propfirm {
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

export default function PropfirmsPage() {
  const [editingPropfirm, setEditingPropfirm] =
    useState<Partial<Propfirm> | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const router = useRouter();

  const pagination = usePagination({ defaultLimit: 10 });
  const queryParams = pagination.getQueryParams();

  const {
    data: response,
    refetch,
    isLoading,
  } = trpc.propfirm.getAll.useQuery(queryParams);

  const createPropfirm = trpc.propfirm.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsCreateModalOpen(false);
      form.reset();
    },
  });

  const updatePropfirm = trpc.propfirm.update.useMutation({
    onSuccess: () => {
      refetch();
      setEditingPropfirm(null);
      form.reset();
    },
  });

  const deletePropfirm = trpc.propfirm.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const form = useForm<PropfirmFormData>({
    resolver: zodResolver(propfirmSchema),
    defaultValues: {
      name: "",
      displayName: "",
      description: "",
      website: "",
      logoUrl: "",
      isActive: true,
    },
  });

  const propfirms = response?.data || [];

  const handleEdit = (propfirm: Propfirm) => {
    setEditingPropfirm(propfirm);
    form.reset({
      name: propfirm.name || "",
      displayName: propfirm.displayName || "",
      description: propfirm.description || "",
      website: propfirm.website || "",
      logoUrl: propfirm.logoUrl || "",
    });
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true);
    setEditingPropfirm(null);
    form.reset();
  };

  const onSubmit = (data: PropfirmFormData) => {
    if (editingPropfirm?.id) {
      updatePropfirm.mutate({
        id: editingPropfirm.id,
        ...data,
      });
    } else {
      createPropfirm.mutate(data);
    }
  };

  const handleDelete = (propfirm: Propfirm) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta propfirm?")) {
      deletePropfirm.mutate({ id: propfirm.id });
    }
  };

  const handleViewDetails = (propfirm: Propfirm) => {
    router.push(`/dashboard/propfirms/${propfirm.id}`);
  };

  // Definir columnas de la tabla
  const columns: TableColumn<Propfirm>[] = [
    {
      key: "displayName",
      title: "Propfirm",
      render: (_, record) => (
        <div className="flex items-center">
          {record.logoUrl ? (
            <Image
              src={record.logoUrl}
              alt={record.displayName}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover mr-3"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
              <Building className="h-5 w-5 text-purple-600" />
            </div>
          )}
          <div>
            <button
              type="button"
              onClick={() => handleViewDetails(record)}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
            >
              {record.displayName}
            </button>
            <div className="text-sm text-muted-foreground">{record.name}</div>
          </div>
        </div>
      ),
    },
    {
      key: "website",
      title: "Sitio Web",
      render: (_, record) =>
        record.website ? (
          <a
            href={record.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {record.website}
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
  const actions: TableAction<Propfirm>[] = [
    {
      label: "Ver Detalles",
      icon: <Eye className="h-4 w-4" />,
      onClick: handleViewDetails,
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
          <h1 className="text-2xl font-semibold text-foreground">
            Gestión de Propfirms
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 mr-8">
            Administra las propfirms del sistema y configura sus reglas
          </p>
        </div>
        <Button
          size="sm"
          className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white border-0"
          onClick={handleCreate}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          <span>Nueva Propfirm</span>
        </Button>
      </div>

      {/* Tabla con ScrollableTable */}
      <ScrollableTable<Propfirm>
        data={propfirms}
        columns={columns}
        actions={actions}
        emptyMessage="No se encontraron propfirms"
        emptyIcon={<Building className="h-12 w-12 text-muted-foreground" />}
        loading={isLoading}
      />

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateModalOpen || !!editingPropfirm}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateModalOpen(false);
            setEditingPropfirm(null);
            form.reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl border-border">
          <DialogHeader>
            <DialogTitle>
              {editingPropfirm ? "Editar Propfirm" : "Crear Nueva Propfirm"}
            </DialogTitle>
            <DialogDescription>
              {editingPropfirm
                ? "Modifica la información de la propfirm seleccionada."
                : "Completa la información para crear una nueva propfirm en el sistema."}
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
                      <FormLabel>Nombre de la Propfirm *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="propfirm_name" />
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
                        <Input {...field} placeholder="Nombre de la Propfirm" />
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
                        placeholder="Descripción de la propfirm..."
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
                    setEditingPropfirm(null);
                    form.reset();
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createPropfirm.isPending || updatePropfirm.isPending
                  }
                >
                  {createPropfirm.isPending || updatePropfirm.isPending
                    ? editingPropfirm
                      ? "Actualizando..."
                      : "Creando..."
                    : editingPropfirm
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
