"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { trpc } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Edit, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const propfirmSchema = z.object({
  name: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
  displayName: z
    .string()
    .min(2, "Nombre de visualización debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  website: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || /^https?:\/\/.+/.test(val),
      "Debe ser una URL válida (ej: https://google.com)"
    ),
  logoUrl: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || /^https?:\/\/.+/.test(val),
      "Debe ser una URL válida (ej: https://ejemplo.com/logo.png)"
    ),
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

export default function PropfirmCRUD() {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPropfirm, setEditingPropfirm] = useState<Propfirm | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: propfirmsResponse, refetch: refetchPropfirms } =
    trpc.propfirm.getAll.useQuery();

  const propfirms = propfirmsResponse?.data || [];

  const createPropfirm = trpc.propfirm.create.useMutation({
    onSuccess: () => {
      refetchPropfirms();
      setIsCreateDialogOpen(false);
      form.reset();
    },
  });

  const updatePropfirm = trpc.propfirm.update.useMutation({
    onSuccess: () => {
      refetchPropfirms();
      setEditingPropfirm(null);
      setIsEditDialogOpen(false);
      form.reset();
    },
  });

  const deletePropfirm = trpc.propfirm.delete.useMutation({
    onSuccess: () => {
      refetchPropfirms();
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
    },
  });

  const filteredPropfirms = propfirms.filter(
    (propfirm) =>
      propfirm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      propfirm.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      propfirm.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (propfirm: Propfirm) => {
    setEditingPropfirm(propfirm);
    form.reset({
      name: propfirm.name,
      displayName: propfirm.displayName,
      description: propfirm.description || "",
      website: propfirm.website || "",
      logoUrl: propfirm.logoUrl || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingPropfirm(null);
    setIsCreateDialogOpen(true);
    form.reset();
  };

  const handleCancel = () => {
    setEditingPropfirm(null);
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    form.reset();
  };

  const onSubmit = (data: PropfirmFormData) => {
    if (editingPropfirm) {
      updatePropfirm.mutate({
        id: editingPropfirm.id,
        ...data,
      });
    } else {
      createPropfirm.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta propfirm?")) {
      deletePropfirm.mutate({ id });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Building2 className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Gestión de Propfirms
          </h2>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Propfirm
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Buscar propfirms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sitio Web
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de Creación
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPropfirms.map((propfirm) => (
                <tr key={propfirm.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {propfirm.logoUrl && (
                        <img
                          src={propfirm.logoUrl}
                          alt={propfirm.displayName}
                          className="h-8 w-8 rounded-full mr-3 object-cover"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {propfirm.displayName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {propfirm.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {propfirm.description || "Sin descripción"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {propfirm.website ? (
                      <a
                        href={propfirm.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {propfirm.website}
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">
                        No disponible
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        propfirm.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {propfirm.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(propfirm.createdAt).toLocaleDateString("es-ES")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(propfirm)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(propfirm.id)}
                        className="text-red-600 hover:text-red-800"
                        disabled={deletePropfirm.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva Propfirm</DialogTitle>
            <DialogDescription>
              Crea una nueva propfirm en el sistema.
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
                      <FormLabel>Nombre (ID)</FormLabel>
                      <FormControl>
                        <Input placeholder="nombre-unico" {...field} />
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
                      <FormLabel>Nombre de Visualización</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre de la Propfirm" {...field} />
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
                      <Input
                        placeholder="Descripción de la propfirm..."
                        {...field}
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
                        <Input placeholder="https://google.com" {...field} />
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
                          placeholder="https://ejemplo.com/logo.png"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={createPropfirm.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={createPropfirm.isPending}
                >
                  {createPropfirm.isPending ? "Creando..." : "Crear"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Propfirm</DialogTitle>
            <DialogDescription>
              Modifica los datos de la propfirm seleccionada.
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
                      <FormLabel>Nombre (ID)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="nombre-unico"
                          {...field}
                          disabled={true}
                        />
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
                      <FormLabel>Nombre de Visualización</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre de la Propfirm" {...field} />
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
                      <Input
                        placeholder="Descripción de la propfirm..."
                        {...field}
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
                        <Input placeholder="https://google.com" {...field} />
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
                          placeholder="https://ejemplo.com/logo.png"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updatePropfirm.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={updatePropfirm.isPending}
                >
                  {updatePropfirm.isPending ? "Actualizando..." : "Actualizar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
