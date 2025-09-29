"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type {
  TableAction,
  TableColumn,
} from "@/components/ui/scrollable-table";
import { ScrollableTable } from "@/components/ui/scrollable-table";
import { trpc } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Building,
  Edit,
  Plus,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const phaseSchema = z.object({
  phaseName: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
  displayName: z
    .string()
    .min(2, "Nombre de visualización debe tener al menos 2 caracteres"),
  displayOrder: z.number().min(0, "Orden debe ser mayor o igual a 0"),
  isEvaluation: z.boolean(),
});

const accountTypeSchema = z.object({
  typeName: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
  displayName: z
    .string()
    .min(2, "Nombre de visualización debe tener al menos 2 caracteres"),
  initialBalance: z
    .number()
    .min(0, "Balance inicial debe ser mayor o igual a 0"),
});

const rulesConfigSchema = z.object({
  accountTypeId: z.string().min(1, "Tipo de cuenta es requerido"),
  phaseId: z.string().min(1, "Fase es requerida"),
  maxDrawdown: z
    .number()
    .min(0)
    .max(100, "Max drawdown debe estar entre 0 y 100"),
  dailyDrawdown: z
    .number()
    .min(0)
    .max(100, "Daily drawdown debe estar entre 0 y 100"),
  profitTarget: z
    .number()
    .min(0)
    .max(100, "Profit target debe estar entre 0 y 100")
    .optional(),
});

type PhaseFormData = z.infer<typeof phaseSchema>;
type AccountTypeFormData = z.infer<typeof accountTypeSchema>;
type RulesConfigFormData = z.infer<typeof rulesConfigSchema>;

interface PropfirmPhase {
  id: string;
  propfirmId: string;
  phaseName: string;
  displayName: string;
  displayOrder: number;
  isEvaluation: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PropfirmAccountType {
  id: string;
  propfirmId: string;
  typeName: string;
  displayName: string;
  initialBalance: string; // Viene como string desde Prisma Decimal
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PropfirmRulesConfiguration {
  id: string;
  propfirmId: string;
  accountTypeId: string;
  phaseId: string;
  maxDrawdown: string; // Viene como string desde Prisma Decimal
  dailyDrawdown: string; // Viene como string desde Prisma Decimal
  profitTarget: string | null; // Viene como string desde Prisma Decimal
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  accountType: {
    id: string;
    typeName: string;
    displayName: string;
  };
  phase: {
    id: string;
    phaseName: string;
    displayName: string;
  };
}

// Propfirm interface will be inferred from tRPC

export default function PropfirmDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propfirmId = params.id as string;

  const [editingPhase, setEditingPhase] =
    useState<Partial<PropfirmPhase> | null>(null);
  const [isCreatePhaseModalOpen, setIsCreatePhaseModalOpen] = useState(false);
  const [editingAccountType, setEditingAccountType] =
    useState<Partial<PropfirmAccountType> | null>(null);
  const [isCreateAccountTypeModalOpen, setIsCreateAccountTypeModalOpen] =
    useState(false);
  const [editingRulesConfig, setEditingRulesConfig] =
    useState<Partial<PropfirmRulesConfiguration> | null>(null);
  const [isCreateRulesConfigModalOpen, setIsCreateRulesConfigModalOpen] =
    useState(false);

  const [activeTab, setActiveTab] = useState<
    "phases" | "account-types" | "rules"
  >("phases");

  // Obtener datos de la propfirm
  const {
    data: propfirm,
    error: propfirmError,
    isLoading: propfirmLoading,
  } = trpc.propfirm.getById.useQuery({ id: propfirmId });

  // Obtener fases de la propfirm
  const {
    data: phases = [],
    refetch: refetchPhases,
    isLoading: phasesLoading,
    error: phasesError,
  } = trpc.propfirmPhase.getByPropfirmId.useQuery({ propfirmId });

  // Obtener rules configurations de la propfirm
  const {
    data: rulesConfigs = [],
    refetch: refetchRulesConfigs,
    isLoading: rulesConfigsLoading,
    error: rulesConfigsError,
  } = trpc.propfirmRulesConfig.getByPropfirmId.useQuery({ propfirmId });

  const createPhase = trpc.propfirmPhase.create.useMutation({
    onSuccess: () => {
      refetchPhases();
      setIsCreatePhaseModalOpen(false);
      form.reset();
    },
  });

  const updatePhase = trpc.propfirmPhase.update.useMutation({
    onSuccess: () => {
      refetchPhases();
      setEditingPhase(null);
      form.reset();
    },
  });

  const deletePhase = trpc.propfirmPhase.delete.useMutation({
    onSuccess: () => {
      refetchPhases();
    },
  });

  // Account Type mutations
  const {
    data: accountTypes = [],
    refetch: refetchAccountTypes,
    isLoading: accountTypesLoading,
    error: accountTypesError,
  } = trpc.propfirmAccountType.getByPropfirmId.useQuery({ propfirmId });

  const typedAccountTypes: PropfirmAccountType[] =
    accountTypes as PropfirmAccountType[];

  const createAccountType = trpc.propfirmAccountType.create.useMutation({
    onSuccess: () => {
      refetchAccountTypes();
      setIsCreateAccountTypeModalOpen(false);
      accountTypeForm.reset();
    },
  });

  const updateAccountType = trpc.propfirmAccountType.update.useMutation({
    onSuccess: () => {
      refetchAccountTypes();
      setEditingAccountType(null);
      accountTypeForm.reset();
    },
  });

  const deleteAccountType = trpc.propfirmAccountType.delete.useMutation({
    onSuccess: () => {
      refetchAccountTypes();
    },
  });

  // Rules Config mutations
  const createRulesConfig = trpc.propfirmRulesConfig.create.useMutation({
    onSuccess: () => {
      refetchRulesConfigs();
      setIsCreateRulesConfigModalOpen(false);
      rulesConfigForm.reset();
    },
  });

  const updateRulesConfig = trpc.propfirmRulesConfig.update.useMutation({
    onSuccess: () => {
      refetchRulesConfigs();
      setEditingRulesConfig(null);
      rulesConfigForm.reset();
    },
  });

  const deleteRulesConfig = trpc.propfirmRulesConfig.delete.useMutation({
    onSuccess: () => {
      refetchRulesConfigs();
    },
  });

  const form = useForm<PhaseFormData>({
    resolver: zodResolver(phaseSchema),
    defaultValues: {
      phaseName: "",
      displayName: "",
      displayOrder: 0,
      isEvaluation: true,
    },
  });

  const accountTypeForm = useForm<AccountTypeFormData>({
    resolver: zodResolver(accountTypeSchema),
    defaultValues: {
      typeName: "",
      displayName: "",
      initialBalance: 0,
    },
  });

  const rulesConfigForm = useForm<RulesConfigFormData>({
    resolver: zodResolver(rulesConfigSchema),
    defaultValues: {
      accountTypeId: "",
      phaseId: "",
      maxDrawdown: 0,
      dailyDrawdown: 0,
      profitTarget: undefined,
    },
  });

  const handleEditPhase = (phase: PropfirmPhase) => {
    setEditingPhase(phase);
    form.reset({
      phaseName: phase.phaseName,
      displayName: phase.displayName,
      displayOrder: phase.displayOrder,
      isEvaluation: phase.isEvaluation,
    });
  };

  const handleCreatePhase = () => {
    setIsCreatePhaseModalOpen(true);
    setEditingPhase(null);
    form.reset();
  };

  const handleDeletePhase = (phase: PropfirmPhase) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta fase?")) {
      deletePhase.mutate({ id: phase.id });
    }
  };

  const onSubmitPhase = (data: PhaseFormData) => {
    if (editingPhase?.id) {
      updatePhase.mutate({
        id: editingPhase.id,
        ...data,
      });
    } else {
      createPhase.mutate({
        propfirmId,
        ...data,
      });
    }
  };

  // Account Type handlers
  const handleEditAccountType = (accountType: PropfirmAccountType) => {
    setEditingAccountType(accountType);
    accountTypeForm.reset({
      typeName: accountType.typeName,
      displayName: accountType.displayName,
      initialBalance: Number.parseFloat(accountType.initialBalance),
    });
  };

  const handleCreateAccountType = () => {
    setIsCreateAccountTypeModalOpen(true);
    setEditingAccountType(null);
    accountTypeForm.reset();
  };

  const handleDeleteAccountType = (accountType: PropfirmAccountType) => {
    if (confirm("¿Estás seguro de que quieres eliminar este tipo de cuenta?")) {
      deleteAccountType.mutate({ id: accountType.id });
    }
  };

  const onSubmitAccountType = (data: AccountTypeFormData) => {
    if (editingAccountType?.id) {
      updateAccountType.mutate({
        id: editingAccountType.id,
        ...data,
      });
    } else {
      createAccountType.mutate({
        propfirmId,
        ...data,
      });
    }
  };

  // Rules Config handlers
  const handleEditRulesConfig = (rulesConfig: PropfirmRulesConfiguration) => {
    setEditingRulesConfig(rulesConfig);
    rulesConfigForm.reset({
      accountTypeId: rulesConfig.accountTypeId,
      phaseId: rulesConfig.phaseId,
      maxDrawdown: Number.parseFloat(rulesConfig.maxDrawdown),
      dailyDrawdown: Number.parseFloat(rulesConfig.dailyDrawdown),
      profitTarget: rulesConfig.profitTarget
        ? Number.parseFloat(rulesConfig.profitTarget)
        : undefined,
    });
  };

  const handleCreateRulesConfig = () => {
    setIsCreateRulesConfigModalOpen(true);
    setEditingRulesConfig(null);
    rulesConfigForm.reset();
  };

  const handleDeleteRulesConfig = (rulesConfig: PropfirmRulesConfiguration) => {
    if (
      confirm(
        "¿Estás seguro de que quieres eliminar esta configuración de reglas?"
      )
    ) {
      deleteRulesConfig.mutate({ id: rulesConfig.id });
    }
  };

  const onSubmitRulesConfig = (data: RulesConfigFormData) => {
    if (editingRulesConfig?.id) {
      updateRulesConfig.mutate({
        id: editingRulesConfig.id,
        ...data,
      });
    } else {
      createRulesConfig.mutate({
        propfirmId,
        ...data,
      });
    }
  };

  // Definir columnas de la tabla de fases
  const columns: TableColumn<PropfirmPhase>[] = [
    {
      key: "displayName",
      title: "Fase",
      render: (_, record) => (
        <div>
          <div className="text-sm font-medium text-foreground">
            {record.displayName}
          </div>
          <div className="text-sm text-muted-foreground">
            {record.phaseName}
          </div>
        </div>
      ),
    },
    {
      key: "displayOrder",
      title: "Orden",
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value as string}
        </span>
      ),
      className: "text-center",
    },
    {
      key: "isEvaluation",
      title: "Tipo",
      render: (value) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            value
              ? "bg-orange-100 text-orange-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {value ? "Evaluación" : "Funded"}
        </span>
      ),
    },
    {
      key: "isActive",
      title: "Estado",
      render: (value) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {value ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      key: "createdAt",
      title: "Creado",
      render: (value) => new Date(value as string).toLocaleDateString(),
      className: "text-sm text-muted-foreground",
    },
  ];

  // Definir acciones de la tabla de fases
  const actions: TableAction<PropfirmPhase>[] = [
    {
      label: "Editar",
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEditPhase,
      variant: "default",
    },
    {
      label: "Eliminar",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDeletePhase,
      variant: "destructive",
      separator: true,
    },
  ];

  // Definir columnas de la tabla de account types
  const accountTypeColumns: TableColumn<PropfirmAccountType>[] = [
    {
      key: "displayName",
      title: "Tipo de Cuenta",
      render: (_, record) => (
        <div>
          <div className="text-sm font-medium text-foreground">
            {record.displayName}
          </div>
          <div className="text-sm text-muted-foreground">{record.typeName}</div>
        </div>
      ),
    },
    {
      key: "initialBalance",
      title: "Balance Inicial",
      render: (value) => (
        <span className="text-sm font-medium text-foreground">
          ${Number.parseFloat(value as string).toLocaleString()}
        </span>
      ),
    },
    {
      key: "isActive",
      title: "Estado",
      render: (value) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {value ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      key: "createdAt",
      title: "Creado",
      render: (value) => new Date(value as string).toLocaleDateString(),
      className: "text-sm text-muted-foreground",
    },
  ];

  // Definir acciones de la tabla de account types
  const accountTypeActions: TableAction<PropfirmAccountType>[] = [
    {
      label: "Editar",
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEditAccountType,
      variant: "default",
    },
    {
      label: "Eliminar",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDeleteAccountType,
      variant: "destructive",
      separator: true,
    },
  ];

  // Definir columnas de la tabla de rules config
  const rulesConfigColumns: TableColumn<PropfirmRulesConfiguration>[] = [
    {
      key: "accountType",
      title: "Tipo de Cuenta",
      render: (_, record) => (
        <div>
          <div className="text-sm font-medium text-foreground">
            {record.accountType.displayName}
          </div>
          <div className="text-sm text-muted-foreground">
            {record.accountType.typeName}
          </div>
        </div>
      ),
    },
    {
      key: "phase",
      title: "Fase",
      render: (_, record) => (
        <div>
          <div className="text-sm font-medium text-foreground">
            {record.phase.displayName}
          </div>
          <div className="text-sm text-muted-foreground">
            {record.phase.phaseName}
          </div>
        </div>
      ),
    },
    {
      key: "maxDrawdown",
      title: "Max Drawdown",
      render: (value) => (
        <span className="text-sm font-medium text-red-600">
          {Number.parseFloat(value as string).toFixed(2)}%
        </span>
      ),
    },
    {
      key: "dailyDrawdown",
      title: "Daily Drawdown",
      render: (value) => (
        <span className="text-sm font-medium text-orange-600">
          {Number.parseFloat(value as string).toFixed(2)}%
        </span>
      ),
    },
    {
      key: "profitTarget",
      title: "Profit Target",
      render: (value) => (
        <span className="text-sm font-medium text-green-600">
          {value ? `${Number.parseFloat(value as string).toFixed(2)}%` : "N/A"}
        </span>
      ),
    },
    {
      key: "isActive",
      title: "Estado",
      render: (value) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {value ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      key: "createdAt",
      title: "Creado",
      render: (value) => new Date(value as string).toLocaleDateString(),
      className: "text-sm text-muted-foreground",
    },
  ];

  // Definir acciones de la tabla de rules config
  const rulesConfigActions: TableAction<PropfirmRulesConfiguration>[] = [
    {
      label: "Editar",
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEditRulesConfig,
      variant: "default",
    },
    {
      label: "Eliminar",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDeleteRulesConfig,
      variant: "destructive",
      separator: true,
    },
  ];

  if (propfirmLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
          <p className="text-muted-foreground">Cargando propfirm...</p>
        </div>
      </div>
    );
  }

  if (propfirmError || !propfirm) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Error al cargar la propfirm:{" "}
              {propfirmError?.message || "Propfirm no encontrada"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/propfirms")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver</span>
          </Button>
          <div className="flex items-center space-x-3">
            {propfirm.logoUrl ? (
              <Image
                src={propfirm.logoUrl}
                alt={propfirm.displayName}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Building className="h-6 w-6 text-purple-600" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {propfirm.displayName}
              </h1>
              <p className="text-muted-foreground">{propfirm.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Propfirm Info */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Información
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Descripción
            </div>
            <p className="text-sm text-foreground">
              {propfirm.description || "Sin descripción"}
            </p>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Sitio Web
            </div>
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
              <p className="text-sm text-muted-foreground">No especificado</p>
            )}
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Estado
            </div>
            <p
              className={`text-sm font-medium ${propfirm.isActive ? "text-green-600" : "text-red-600"}`}
            >
              {propfirm.isActive ? "Activo" : "Inactivo"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            type="button"
            onClick={() => setActiveTab("phases")}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "phases"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            Fases ({phases.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("account-types")}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "account-types"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            Tipos de Cuenta ({typedAccountTypes.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("rules")}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "rules"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            Reglas ({rulesConfigs.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {/* Phases Tab */}
        {activeTab === "phases" && (
          <>
            <h2 className="text-xl font-semibold text-foreground">
              Fases de la Propfirm
            </h2>

            {/* Phases Table */}
            <ScrollableTable<PropfirmPhase>
              data={phases}
              columns={columns}
              loading={phasesLoading}
              error={phasesError?.message || null}
              pagination={{
                page: 1,
                limit: 10,
                total: phases.length,
                totalPages: Math.ceil(phases.length / 10) || 1,
                hasNext: false,
                hasPrev: false,
              }}
              onPageChange={() => {
                /* No pagination needed */
              }}
              onPageSizeChange={() => {
                /* No pagination needed */
              }}
              actions={actions}
              headerActions={
                <Button
                  onClick={handleCreatePhase}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nueva Fase</span>
                </Button>
              }
              emptyMessage="No se han configurado fases para esta propfirm"
              emptyIcon={
                <Settings className="h-12 w-12 text-muted-foreground" />
              }
            />
          </>
        )}

        {/* Account Types Tab */}
        {activeTab === "account-types" && (
          <>
            <h2 className="text-xl font-semibold text-foreground">
              Tipos de Cuenta
            </h2>

            {/* Account Types Table */}
            <ScrollableTable<PropfirmAccountType>
              data={typedAccountTypes}
              columns={accountTypeColumns}
              loading={accountTypesLoading}
              error={accountTypesError?.message || null}
              pagination={{
                page: 1,
                limit: 10,
                total: typedAccountTypes.length,
                totalPages: Math.ceil(typedAccountTypes.length / 10) || 1,
                hasNext: false,
                hasPrev: false,
              }}
              onPageChange={() => {
                /* No pagination needed */
              }}
              onPageSizeChange={() => {
                /* No pagination needed */
              }}
              actions={accountTypeActions}
              headerActions={
                <Button
                  onClick={handleCreateAccountType}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nuevo Tipo</span>
                </Button>
              }
              emptyMessage="No se han configurado tipos de cuenta para esta propfirm"
              emptyIcon={
                <Building className="h-12 w-12 text-muted-foreground" />
              }
            />
          </>
        )}

        {/* Rules Tab */}
        {activeTab === "rules" && (
          <>
            <h2 className="text-xl font-semibold text-foreground">
              Reglas de Configuración
            </h2>

            {/* Rules Table */}
            <ScrollableTable<PropfirmRulesConfiguration>
              data={rulesConfigs}
              columns={rulesConfigColumns}
              loading={rulesConfigsLoading}
              error={rulesConfigsError?.message || null}
              pagination={{
                page: 1,
                limit: 10,
                total: rulesConfigs.length,
                totalPages: Math.ceil(rulesConfigs.length / 10) || 1,
                hasNext: false,
                hasPrev: false,
              }}
              onPageChange={() => {
                /* No pagination needed */
              }}
              onPageSizeChange={() => {
                /* No pagination needed */
              }}
              actions={rulesConfigActions}
              headerActions={
                <Button
                  onClick={handleCreateRulesConfig}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nueva Regla</span>
                </Button>
              }
              emptyMessage="No se han configurado reglas para esta propfirm"
              emptyIcon={
                <Settings className="h-12 w-12 text-muted-foreground" />
              }
            />
          </>
        )}
      </div>

      {/* Create/Edit Account Type Modal */}
      {(isCreateAccountTypeModalOpen || editingAccountType) && (
        <dialog
          open
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[9999]"
          onClick={() => {
            setIsCreateAccountTypeModalOpen(false);
            setEditingAccountType(null);
            accountTypeForm.reset();
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsCreateAccountTypeModalOpen(false);
              setEditingAccountType(null);
              accountTypeForm.reset();
            }
          }}
        >
          <div
            role="document"
            className="bg-card rounded-lg shadow-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setIsCreateAccountTypeModalOpen(false);
                setEditingAccountType(null);
                accountTypeForm.reset();
              }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4 pr-8">
              {editingAccountType
                ? "Editar Tipo de Cuenta"
                : "Nuevo Tipo de Cuenta"}
            </h3>
            <Form {...accountTypeForm}>
              <form
                onSubmit={accountTypeForm.handleSubmit(onSubmitAccountType)}
                className="space-y-4"
              >
                <FormField
                  control={accountTypeForm.control}
                  name="typeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Tipo</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="starter_account" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={accountTypeForm.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de Visualización</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Cuenta Starter" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={accountTypeForm.control}
                  name="initialBalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Balance Inicial ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={field.value.toString()}
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
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateAccountTypeModalOpen(false);
                      setEditingAccountType(null);
                      accountTypeForm.reset();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      createAccountType.isPending || updateAccountType.isPending
                    }
                  >
                    {editingAccountType ? "Actualizar" : "Crear"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </dialog>
      )}

      {/* Create/Edit Phase Modal */}
      {(isCreatePhaseModalOpen || editingPhase) && (
        <dialog
          open
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[9999]"
          onClick={() => {
            setIsCreatePhaseModalOpen(false);
            setEditingPhase(null);
            form.reset();
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsCreatePhaseModalOpen(false);
              setEditingPhase(null);
              form.reset();
            }
          }}
        >
          <div
            role="document"
            className="bg-card rounded-lg shadow-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setIsCreatePhaseModalOpen(false);
                setEditingPhase(null);
                form.reset();
              }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4 pr-8">
              {editingPhase ? "Editar Fase" : "Nueva Fase"}
            </h3>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmitPhase)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="phaseName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Fase</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="phase_1" />
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
                        <Input {...field} placeholder="Fase 1" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="displayOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Orden de Visualización</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          value={field.value.toString()}
                          onChange={(e) =>
                            field.onChange(Number.parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isEvaluation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Fase de Evaluación
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Marca si esta fase es de evaluación o funded
                        </div>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreatePhaseModalOpen(false);
                      setEditingPhase(null);
                      form.reset();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createPhase.isPending || updatePhase.isPending}
                  >
                    {editingPhase ? "Actualizar" : "Crear"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </dialog>
      )}

      {/* Create/Edit Rules Config Modal */}
      {(isCreateRulesConfigModalOpen || editingRulesConfig) && (
        <dialog
          open
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[9999]"
          onClick={() => {
            setIsCreateRulesConfigModalOpen(false);
            setEditingRulesConfig(null);
            rulesConfigForm.reset();
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsCreateRulesConfigModalOpen(false);
              setEditingRulesConfig(null);
              rulesConfigForm.reset();
            }
          }}
        >
          <div
            role="document"
            className="bg-card rounded-lg shadow-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setIsCreateRulesConfigModalOpen(false);
                setEditingRulesConfig(null);
                rulesConfigForm.reset();
              }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4 pr-8">
              {editingRulesConfig ? "Editar Regla" : "Nueva Regla"}
            </h3>
            <Form {...rulesConfigForm}>
              <form
                onSubmit={rulesConfigForm.handleSubmit(onSubmitRulesConfig)}
                className="space-y-4"
              >
                <FormField
                  control={rulesConfigForm.control}
                  name="accountTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Cuenta</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Seleccionar tipo de cuenta</option>
                          {typedAccountTypes.map(
                            (accountType: PropfirmAccountType) => (
                              <option
                                key={accountType.id}
                                value={accountType.id}
                              >
                                {accountType.displayName}
                              </option>
                            )
                          )}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={rulesConfigForm.control}
                  name="phaseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fase</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Seleccionar fase</option>
                          {phases.map(
                            (phase: { id: string; displayName: string }) => (
                              <option key={phase.id} value={phase.id}>
                                {phase.displayName}
                              </option>
                            )
                          )}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={rulesConfigForm.control}
                  name="maxDrawdown"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Drawdown (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={field.value.toString()}
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
                  control={rulesConfigForm.control}
                  name="dailyDrawdown"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Drawdown (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={field.value.toString()}
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
                  control={rulesConfigForm.control}
                  name="profitTarget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profit Target (%) - Opcional</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={field.value?.toString() || ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? Number.parseFloat(e.target.value)
                                : undefined
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
                      setIsCreateRulesConfigModalOpen(false);
                      setEditingRulesConfig(null);
                      rulesConfigForm.reset();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      createRulesConfig.isPending || updateRulesConfig.isPending
                    }
                  >
                    {editingRulesConfig ? "Actualizar" : "Crear"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </dialog>
      )}
    </div>
  );
}
