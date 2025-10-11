"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/utils/trpc";
import { Building2, Check, DollarSign, Wallet } from "lucide-react";
import { useState } from "react";

interface CreateTradingAccountForm {
  accountName: string;
  accountType: "PROPFIRM" | "BROKER";
  accountNumber: string;
  server: string;
  propfirmId: string;
  brokerId: string;
  accountTypeId: string;
  initialBalance: number;
  currentPhaseId: string;
  status: string;
}

interface CreateTradingAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (account: {
    id: string;
    accountName: string;
    accountType: string;
    initialBalance: string;
  }) => void;
  preselectedType?: "PROPFIRM" | "BROKER";
}

export function CreateTradingAccountDialog({
  isOpen,
  onClose,
  onSuccess,
  preselectedType,
}: CreateTradingAccountDialogProps) {
  const [formData, setFormData] = useState<CreateTradingAccountForm>({
    accountName: "",
    accountType: preselectedType || "PROPFIRM",
    accountNumber: "",
    server: "",
    propfirmId: "",
    brokerId: "",
    accountTypeId: "",
    initialBalance: 100000,
    currentPhaseId: "",
    status: "active",
  });

  // Real tRPC queries
  const { data: propfirms } = trpc.propfirm.getAll.useQuery({});
  const { data: brokers } = trpc.broker.getAll.useQuery({});

  // Queries específicas para la propfirm seleccionada
  const { data: selectedPropfirm } = trpc.propfirm.getById.useQuery(
    { id: formData.propfirmId },
    { enabled: !!formData.propfirmId }
  );

  const createAccount = trpc.tradingAccount.create.useMutation({
    onSuccess: (data) => {
      onSuccess?.(data);
      handleClose();
    },
    onError: (error) => {
      console.error("Error creating account:", error.message);
      alert(`Error al crear la cuenta: ${error.message}`);
    },
  });

  const handleClose = () => {
    setFormData({
      accountName: "",
      accountType: preselectedType || "PROPFIRM",
      accountNumber: "",
      server: "",
      propfirmId: "",
      brokerId: "",
      accountTypeId: "",
      initialBalance: 100000,
      currentPhaseId: "",
      status: "active",
    });
    onClose();
  };

  const handleSubmit = () => {
    // Validaciones
    if (!formData.accountName.trim()) {
      alert("El nombre de la cuenta es requerido");
      return;
    }

    if (formData.initialBalance <= 0) {
      alert("El balance inicial debe ser mayor a 0");
      return;
    }

    if (formData.accountType === "PROPFIRM" && !formData.propfirmId) {
      alert("Selecciona una propfirm");
      return;
    }

    if (formData.accountType === "BROKER" && !formData.brokerId) {
      alert("Selecciona un broker");
      return;
    }

    // Preparar datos para envío
    const submitData = {
      accountName: formData.accountName,
      accountType: formData.accountType,
      accountNumber: formData.accountNumber || undefined,
      server: formData.server || undefined,
      propfirmId:
        formData.accountType === "PROPFIRM" ? formData.propfirmId : undefined,
      brokerId:
        formData.accountType === "BROKER" ? formData.brokerId : undefined,
      accountTypeId: formData.accountTypeId || undefined,
      initialBalance: formData.initialBalance,
      currentBalance: formData.initialBalance, // Usar initialBalance como currentBalance
      equity: formData.initialBalance, // Usar initialBalance como equity
      currentPhaseId: formData.currentPhaseId || undefined,
      status: formData.status,
    };

    createAccount.mutate(submitData);
  };

  const availablePropfirms = propfirms?.data || [];
  const availableBrokers = brokers?.data || [];
  const availableAccountTypes = selectedPropfirm?.accountTypes || [];
  const availablePhases = selectedPropfirm?.phases || [];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="!max-w-[95vw] !w-[600px] max-h-[85vh] overflow-hidden p-0 bg-transparent border-0">
        {/* Gradient background */}
        <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden border border-slate-700/50">
          {/* Subtle pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />

          {/* Content */}
          <div className="relative p-6 text-white">
            <DialogHeader className="mb-6">
              <DialogTitle className="flex items-center text-xl font-semibold">
                {formData.accountType === "PROPFIRM" ? (
                  <Building2 className="h-5 w-5 text-blue-400 mr-2" />
                ) : (
                  <Wallet className="h-5 w-5 text-emerald-400 mr-2" />
                )}
                Nueva Cuenta{" "}
                {formData.accountType === "PROPFIRM" ? "Propfirm" : "Broker"}
              </DialogTitle>
            </DialogHeader>

            {/* Type Selection */}
            <div className="flex space-x-1 mb-6 bg-slate-800/30 rounded-lg p-1">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    accountType: "PROPFIRM",
                    propfirmId: "",
                    brokerId: "",
                  }))
                }
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  formData.accountType === "PROPFIRM"
                    ? "bg-slate-700 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                }`}
              >
                <div className="flex items-center justify-center">
                  <Building2 className="h-4 w-4 mr-2" />
                  Propfirm
                </div>
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    accountType: "BROKER",
                    propfirmId: "",
                    brokerId: "",
                  }))
                }
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  formData.accountType === "BROKER"
                    ? "bg-slate-700 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                }`}
              >
                <div className="flex items-center justify-center">
                  <Wallet className="h-4 w-4 mr-2" />
                  Broker
                </div>
              </button>
            </div>

            {/* Form Content */}
            <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2">
              {/* Basic Information */}
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-200">
                    Información Básica
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="accountName" className="text-slate-300">
                      Nombre de la Cuenta
                    </Label>
                    <Input
                      id="accountName"
                      value={formData.accountName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          accountName: e.target.value,
                        }))
                      }
                      placeholder="Ej: Mi Cuenta Propfirm"
                      className="!bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 h-9 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="accountNumber" className="text-slate-300">
                        Número de Cuenta
                      </Label>
                      <Input
                        id="accountNumber"
                        value={formData.accountNumber}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            accountNumber: e.target.value,
                          }))
                        }
                        placeholder="Opcional"
                        className="!bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 h-9 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="server" className="text-slate-300">
                        Servidor
                      </Label>
                      <Input
                        id="server"
                        value={formData.server}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            server: e.target.value,
                          }))
                        }
                        placeholder="Opcional"
                        className="!bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 h-9 text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Provider Selection */}
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-200">
                    {formData.accountType === "PROPFIRM"
                      ? "Propfirm"
                      : "Broker"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-slate-300">
                      Selecciona{" "}
                      {formData.accountType === "PROPFIRM"
                        ? "Propfirm"
                        : "Broker"}
                    </Label>
                    <Select
                      value={
                        formData.accountType === "PROPFIRM"
                          ? formData.propfirmId
                          : formData.brokerId
                      }
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          propfirmId:
                            formData.accountType === "PROPFIRM" ? value : "",
                          brokerId:
                            formData.accountType === "BROKER" ? value : "",
                          accountTypeId: "", // Reset account type when propfirm changes
                          currentPhaseId: "", // Reset phase when propfirm changes
                        }))
                      }
                    >
                      <SelectTrigger className="!bg-slate-700/50 border-slate-600 text-white h-9">
                        <SelectValue
                          placeholder={`Selecciona ${formData.accountType === "PROPFIRM" ? "propfirm" : "broker"}`}
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {(formData.accountType === "PROPFIRM"
                          ? availablePropfirms
                          : availableBrokers
                        ).map((item) => (
                          <SelectItem
                            key={item.id}
                            value={item.id}
                            className="text-white hover:bg-slate-600"
                          >
                            {item.displayName || item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Account Type Selection (only for Propfirm) */}
                  {formData.accountType === "PROPFIRM" &&
                    availableAccountTypes.length > 0 && (
                      <div>
                        <Label className="text-slate-300">Tipo de Cuenta</Label>
                        <Select
                          value={formData.accountTypeId}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              accountTypeId: value,
                            }))
                          }
                        >
                          <SelectTrigger className="!bg-slate-700/50 border-slate-600 text-white h-9">
                            <SelectValue placeholder="Selecciona tipo de cuenta" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            {availableAccountTypes.map((type) => (
                              <SelectItem
                                key={type.id}
                                value={type.id}
                                className="text-white hover:bg-slate-600"
                              >
                                {type.displayName || type.typeName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                  {/* Phase Selection (only for Propfirm) */}
                  {formData.accountType === "PROPFIRM" &&
                    availablePhases.length > 0 && (
                      <div>
                        <Label className="text-slate-300">Fase Actual</Label>
                        <Select
                          value={formData.currentPhaseId}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              currentPhaseId: value,
                            }))
                          }
                        >
                          <SelectTrigger className="!bg-slate-700/50 border-slate-600 text-white h-9">
                            <SelectValue placeholder="Selecciona fase" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            {availablePhases.map((phase) => (
                              <SelectItem
                                key={phase.id}
                                value={phase.id}
                                className="text-white hover:bg-slate-600"
                              >
                                {phase.displayName || phase.phaseName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                </CardContent>
              </Card>

              {/* Financial Information */}
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-200 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Información Financiera
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="initialBalance" className="text-slate-300">
                      Balance Inicial
                    </Label>
                    <Input
                      id="initialBalance"
                      type="number"
                      value={formData.initialBalance}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          initialBalance:
                            Number.parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="!bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 h-9 text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-700/50">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createAccount.isPending}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
              >
                {createAccount.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Crear Cuenta
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
