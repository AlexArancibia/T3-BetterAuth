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
import type { AccountLink } from "@/types/connection";
import { trpc } from "@/utils/trpc";
import { TrendingUp } from "lucide-react";
import { useState } from "react";

interface CreateTradeModalProps {
  connection: AccountLink;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateTradeModal({
  connection,
  isOpen,
  onClose,
  onSuccess,
}: CreateTradeModalProps) {
  const [activeTab, setActiveTab] = useState<"manual" | "import" | "copy">(
    "manual"
  );
  // Helper function to format date for datetime-local input
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState({
    symbol: "",
    // Propfirm operation
    propfirmDirection: "buy" as "buy" | "sell",
    propfirmLotSize: "0.1",
    propfirmOpenPrice: "",
    propfirmClosePrice: "",
    propfirmNetProfit: "",
    // Broker operation
    brokerDirection: "sell" as "buy" | "sell", // Opposite by default
    brokerLotSize: "0.1",
    brokerOpenPrice: "",
    brokerClosePrice: "",
    brokerNetProfit: "",
    // Shared fields
    status: "OPEN" as "OPEN" | "CLOSED",
    openTime: formatDateForInput(new Date()), // Properly formatted datetime-local
    closeTime: "",
  });

  const { data: symbols } = trpc.symbol.getAll.useQuery({});
  const createTradePair = trpc.trade.createPair.useMutation({
    onSuccess: () => {
      onSuccess();
      // Reset form
      setFormData({
        symbol: "",
        propfirmDirection: "buy",
        propfirmLotSize: "0.1",
        propfirmOpenPrice: "",
        propfirmClosePrice: "",
        propfirmNetProfit: "",
        brokerDirection: "sell",
        brokerLotSize: "0.1",
        brokerOpenPrice: "",
        brokerClosePrice: "",
        brokerNetProfit: "",
        status: "OPEN",
        openTime: formatDateForInput(new Date()),
        closeTime: "",
      });
    },
    onError: (error) => {
      console.error("Error creating trade pair:", error.message);
      alert(`Error al crear la operación: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.symbol ||
      !formData.propfirmOpenPrice ||
      !formData.propfirmLotSize ||
      !formData.brokerOpenPrice ||
      !formData.brokerLotSize
    ) {
      alert(
        "Por favor completa todos los campos requeridos para ambas operaciones"
      );
      return;
    }

    // Validate and convert openTime
    if (!formData.openTime) {
      alert("Por favor selecciona una fecha de apertura");
      return;
    }

    const openTimeDate = new Date(formData.openTime);
    if (Number.isNaN(openTimeDate.getTime())) {
      alert("La fecha de apertura no es válida");
      return;
    }

    // Validate and convert closeTime if provided
    let closeTimeDate: Date | undefined;
    if (formData.closeTime) {
      closeTimeDate = new Date(formData.closeTime);
      if (Number.isNaN(closeTimeDate.getTime())) {
        alert("La fecha de cierre no es válida");
        return;
      }
    }

    const tradeData = {
      symbolId: formData.symbol,
      // Propfirm trade data
      propfirmDirection: formData.propfirmDirection,
      propfirmLotSize: Number.parseFloat(formData.propfirmLotSize),
      propfirmOpenPrice: Number.parseFloat(formData.propfirmOpenPrice),
      propfirmClosePrice: formData.propfirmClosePrice
        ? Number.parseFloat(formData.propfirmClosePrice)
        : undefined,
      propfirmNetProfit: formData.propfirmNetProfit
        ? Number.parseFloat(formData.propfirmNetProfit)
        : 0,
      // Broker trade data
      brokerDirection: formData.brokerDirection,
      brokerLotSize: Number.parseFloat(formData.brokerLotSize),
      brokerOpenPrice: Number.parseFloat(formData.brokerOpenPrice),
      brokerClosePrice: formData.brokerClosePrice
        ? Number.parseFloat(formData.brokerClosePrice)
        : undefined,
      brokerNetProfit: formData.brokerNetProfit
        ? Number.parseFloat(formData.brokerNetProfit)
        : 0,
      // Shared fields
      status: formData.status,
      openTime: openTimeDate.toISOString(),
      closeTime: closeTimeDate ? closeTimeDate.toISOString() : undefined,
      propfirmAccountId: connection.propfirmAccountId,
      brokerAccountId: connection.brokerAccountId,
    };

    // Debug logging
    console.log("Form data openTime:", formData.openTime);
    console.log("Converted openTimeDate:", openTimeDate);
    console.log("ISO string openTime:", openTimeDate.toISOString());
    console.log("Full tradeData:", tradeData);

    createTradePair.mutate(tradeData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[95vw] !w-[800px] max-h-[85vh] overflow-hidden p-0 bg-transparent border-0 ">
        {/* Gradient background */}
        <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden border border-slate-700/50">
          {/* Subtle pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />

          {/* Content */}
          <div className="relative p-6 text-white">
            <DialogHeader className="mb-4">
              <DialogTitle className="flex items-center text-xl font-semibold">
                <TrendingUp className="h-5 w-5 text-emerald-400 mr-2" />
                Nueva Operación
              </DialogTitle>
            </DialogHeader>

            {/* Tabs Navigation */}
            <div className="flex space-x-1 mb-6 bg-slate-800/30 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setActiveTab("manual")}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "manual"
                    ? "bg-slate-700 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                }`}
              >
                Manual
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("import")}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "import"
                    ? "bg-slate-700 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                }`}
              >
                Importar
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("copy")}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "copy"
                    ? "bg-slate-700 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                }`}
              >
                Copiar
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "manual" && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="max-h-[65vh] overflow-y-auto space-y-4">
                  {/* Basic Information */}
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-emerald-400">
                        Información Básica
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <Label
                            htmlFor="symbol"
                            className="text-slate-200 text-sm"
                          >
                            Símbolo *
                          </Label>
                          <Select
                            value={formData.symbol}
                            onValueChange={(value: string) =>
                              setFormData((prev) => ({
                                ...prev,
                                symbol: value,
                              }))
                            }
                          >
                            <SelectTrigger className="!bg-slate-700/50 border-slate-600 text-white h-9">
                              <SelectValue placeholder="Selecciona símbolo" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-700 border-slate-600">
                              {symbols?.data?.map((symbol) => (
                                <SelectItem
                                  key={symbol.id}
                                  value={symbol.id}
                                  className="text-white hover:bg-slate-600"
                                >
                                  {symbol.symbol}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <Label
                            htmlFor="status"
                            className="text-slate-200 text-sm"
                          >
                            Estado
                          </Label>
                          <Select
                            value={formData.status}
                            onValueChange={(value: string) =>
                              setFormData((prev) => ({
                                ...prev,
                                status: value as "OPEN" | "CLOSED",
                              }))
                            }
                          >
                            <SelectTrigger className="!bg-slate-700/50 border-slate-600 text-white h-9">
                              <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-700 border-slate-600">
                              <SelectItem
                                value="OPEN"
                                className="text-white hover:bg-slate-600"
                              >
                                Abierta
                              </SelectItem>
                              <SelectItem
                                value="CLOSED"
                                className="text-white hover:bg-slate-600"
                              >
                                Cerrada
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <Label
                            htmlFor="openTime"
                            className="text-slate-200 text-sm"
                          >
                            Fecha Apertura *
                          </Label>
                          <Input
                            id="openTime"
                            type="datetime-local"
                            value={formData.openTime}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                openTime: e.target.value,
                              }))
                            }
                            className="!bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 h-9 text-sm"
                            required
                          />
                        </div>

                        {formData.status === "CLOSED" && (
                          <div className="space-y-1">
                            <Label
                              htmlFor="closeTime"
                              className="text-slate-200 text-sm"
                            >
                              Fecha Cierre
                            </Label>
                            <Input
                              id="closeTime"
                              type="datetime-local"
                              value={formData.closeTime}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  closeTime: e.target.value,
                                }))
                              }
                              className="!bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 h-9 text-sm"
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Trading Operations - Excel-like Layout */}
                  <div className="space-y-4">
                    {/* Propfirm Operation */}
                    <div className="overflow-x-auto">
                      <Card className="min-w-[500px] bg-slate-800/50 border-slate-700">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base text-purple-400 flex items-center">
                            <div className="h-2 w-2 rounded-full bg-purple-400 mr-2" />
                            Operación Propfirm
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-5 gap-4">
                            <div className="space-y-1">
                              <Label
                                htmlFor="propfirmDirection"
                                className="text-slate-200 text-xs"
                              >
                                Dirección *
                              </Label>
                              <Select
                                value={formData.propfirmDirection}
                                onValueChange={(value: string) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    propfirmDirection: value as "buy" | "sell",
                                    brokerDirection:
                                      value === "buy" ? "sell" : "buy",
                                  }))
                                }
                              >
                                <SelectTrigger className="!bg-slate-700/50 border-slate-600 text-white h-8 text-xs">
                                  <SelectValue placeholder="Dirección" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-700 border-slate-600">
                                  <SelectItem
                                    value="buy"
                                    className="text-white hover:bg-slate-600 text-xs"
                                  >
                                    Compra
                                  </SelectItem>
                                  <SelectItem
                                    value="sell"
                                    className="text-white hover:bg-slate-600 text-xs"
                                  >
                                    Venta
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-1">
                              <Label
                                htmlFor="propfirmLotSize"
                                className="text-slate-200 text-xs"
                              >
                                Lotes *
                              </Label>
                              <Input
                                id="propfirmLotSize"
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={formData.propfirmLotSize}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    propfirmLotSize: e.target.value,
                                  }))
                                }
                                className="!bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 h-8 text-xs"
                                placeholder="0.1"
                                required
                              />
                            </div>

                            <div className="space-y-1">
                              <Label
                                htmlFor="propfirmOpenPrice"
                                className="text-slate-200 text-xs"
                              >
                                Apertura *
                              </Label>
                              <Input
                                id="propfirmOpenPrice"
                                type="number"
                                step="0.00001"
                                min="0"
                                value={formData.propfirmOpenPrice}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    propfirmOpenPrice: e.target.value,
                                  }))
                                }
                                className="!bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 h-8 text-xs"
                                placeholder="1.23456"
                                required
                              />
                            </div>

                            <div className="space-y-1">
                              <Label
                                htmlFor="propfirmClosePrice"
                                className="text-slate-200 text-xs"
                              >
                                Cierre
                              </Label>
                              <Input
                                id="propfirmClosePrice"
                                type="number"
                                step="0.00001"
                                min="0"
                                value={formData.propfirmClosePrice}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    propfirmClosePrice: e.target.value,
                                  }))
                                }
                                className="!bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 h-8 text-xs"
                                placeholder="1.23456"
                              />
                            </div>

                            <div className="space-y-1">
                              <Label
                                htmlFor="propfirmNetProfit"
                                className="text-slate-200 text-xs"
                              >
                                P&L Neto
                              </Label>
                              <Input
                                id="propfirmNetProfit"
                                type="number"
                                step="0.01"
                                value={formData.propfirmNetProfit}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    propfirmNetProfit: e.target.value,
                                  }))
                                }
                                className="!bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 h-8 text-xs"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Broker Operation */}
                    <div className="overflow-x-auto">
                      <Card className="min-w-[500px] bg-slate-800/50 border-slate-700">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base text-blue-400 flex items-center">
                            <div className="h-2 w-2 rounded-full bg-blue-400 mr-2" />
                            Operación Broker
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-5 gap-4">
                            <div className="space-y-1">
                              <Label
                                htmlFor="brokerDirection"
                                className="text-slate-200 text-xs"
                              >
                                Dirección *
                              </Label>
                              <Select
                                value={formData.brokerDirection}
                                onValueChange={(value: string) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    brokerDirection: value as "buy" | "sell",
                                    propfirmDirection:
                                      value === "buy" ? "sell" : "buy",
                                  }))
                                }
                              >
                                <SelectTrigger className="!bg-slate-700/50 border-slate-600 text-white h-8 text-xs">
                                  <SelectValue placeholder="Dirección" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-700 border-slate-600">
                                  <SelectItem
                                    value="buy"
                                    className="text-white hover:bg-slate-600 text-xs"
                                  >
                                    Compra
                                  </SelectItem>
                                  <SelectItem
                                    value="sell"
                                    className="text-white hover:bg-slate-600 text-xs"
                                  >
                                    Venta
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-1">
                              <Label
                                htmlFor="brokerLotSize"
                                className="text-slate-200 text-xs"
                              >
                                Lotes *
                              </Label>
                              <Input
                                id="brokerLotSize"
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={formData.brokerLotSize}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    brokerLotSize: e.target.value,
                                  }))
                                }
                                className="!bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 h-8 text-xs"
                                placeholder="0.1"
                                required
                              />
                            </div>

                            <div className="space-y-1">
                              <Label
                                htmlFor="brokerOpenPrice"
                                className="text-slate-200 text-xs"
                              >
                                Apertura *
                              </Label>
                              <Input
                                id="brokerOpenPrice"
                                type="number"
                                step="0.00001"
                                min="0"
                                value={formData.brokerOpenPrice}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    brokerOpenPrice: e.target.value,
                                  }))
                                }
                                className="!bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 h-8 text-xs"
                                placeholder="1.23456"
                                required
                              />
                            </div>

                            <div className="space-y-1">
                              <Label
                                htmlFor="brokerClosePrice"
                                className="text-slate-200 text-xs"
                              >
                                Cierre
                              </Label>
                              <Input
                                id="brokerClosePrice"
                                type="number"
                                step="0.00001"
                                min="0"
                                value={formData.brokerClosePrice}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    brokerClosePrice: e.target.value,
                                  }))
                                }
                                className="!bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 h-8 text-xs"
                                placeholder="1.23456"
                              />
                            </div>

                            <div className="space-y-1">
                              <Label
                                htmlFor="brokerNetProfit"
                                className="text-slate-200 text-xs"
                              >
                                P&L Neto
                              </Label>
                              <Input
                                id="brokerNetProfit"
                                type="number"
                                step="0.01"
                                value={formData.brokerNetProfit}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    brokerNetProfit: e.target.value,
                                  }))
                                }
                                className="!bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 h-8 text-xs"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Account Information */}
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-emerald-400 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Cuentas Vinculadas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center space-x-2 p-3 bg-slate-800/50 rounded-lg border border-purple-400/20">
                          <div className="h-3 w-3 rounded-full bg-purple-400" />
                          <div>
                            <p className="text-xs font-medium text-slate-200">
                              Propfirm
                            </p>
                            <p className="text-xs text-slate-400">
                              {connection.propfirmAccount.accountName}
                            </p>
                            <p className="text-xs text-purple-300">
                              {formData.propfirmDirection === "buy"
                                ? "COMPRA"
                                : "VENTA"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 p-3 bg-slate-800/50 rounded-lg border border-blue-400/20">
                          <div className="h-3 w-3 rounded-full bg-blue-400" />
                          <div>
                            <p className="text-xs font-medium text-slate-200">
                              Broker
                            </p>
                            <p className="text-xs text-slate-400">
                              {connection.brokerAccount.accountName}
                            </p>
                            <p className="text-xs text-blue-300">
                              {formData.brokerDirection === "buy"
                                ? "COMPRA"
                                : "VENTA"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Action Buttons for Manual Tab */}
                <div className="flex justify-end space-x-2 pt-4 border-t border-slate-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700/50 px-4 py-2 h-9 text-sm"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createTradePair.isPending}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 h-9 text-sm"
                  >
                    {createTradePair.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                        Registrando...
                      </>
                    ) : (
                      "Registrar"
                    )}
                  </Button>
                </div>
              </form>
            )}

            {/* Import Tab */}
            {activeTab === "import" && (
              <>
                <div className="max-h-[65vh] overflow-y-auto overflow-x-auto">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-blue-400">
                        Importar Operaciones
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center py-8">
                        <div className="text-slate-400 text-sm">
                          Función de importación en desarrollo
                        </div>
                        <p className="text-slate-500 text-xs mt-2">
                          Próximamente podrás importar operaciones desde
                          archivos CSV o Excel
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Action Buttons for Import Tab */}
                <div className="flex justify-end space-x-2 pt-4 border-t border-slate-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700/50 px-4 py-2 h-9 text-sm"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    disabled
                    className="bg-slate-600 text-slate-400 px-4 py-2 h-9 text-sm cursor-not-allowed"
                  >
                    Próximamente
                  </Button>
                </div>
              </>
            )}

            {/* Copy Tab */}
            {activeTab === "copy" && (
              <>
                <div className="max-h-[65vh] overflow-y-auto overflow-x-auto">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-purple-400">
                        Copiar Operaciones
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center py-8">
                        <div className="text-slate-400 text-sm">
                          Función de copia en desarrollo
                        </div>
                        <p className="text-slate-500 text-xs mt-2">
                          Próximamente podrás copiar operaciones desde otras
                          cuentas o conexiones
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Action Buttons for Copy Tab */}
                <div className="flex justify-end space-x-2 pt-4 border-t border-slate-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700/50 px-4 py-2 h-9 text-sm"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    disabled
                    className="bg-slate-600 text-slate-400 px-4 py-2 h-9 text-sm cursor-not-allowed"
                  >
                    Próximamente
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
