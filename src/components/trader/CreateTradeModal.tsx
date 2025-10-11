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
import { ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Función para verificar si se puede hacer scroll
  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  // Función para hacer scroll hacia la izquierda
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  // Función para hacer scroll hacia la derecha
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  // Effect para verificar scrollability cuando se monta el componente
  useEffect(() => {
    checkScrollability();
    const handleResize = () => checkScrollability();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Función para validar que solo se ingresen números
  const handleNumberInput = (value: string) => {
    // Permite números, punto decimal y números negativos
    const regex = /^-?[0-9]*\.?[0-9]*$/;
    return regex.test(value);
  };

  // Función para manejar cambios en campos numéricos
  const handleNumericChange = (field: string, value: string) => {
    if (handleNumberInput(value)) {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

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
    // External trade IDs (positions)
    propfirmExternalTradeId: "",
    brokerExternalTradeId: "",
    // Propfirm operation
    propfirmDirection: "buy" as "buy" | "sell",
    propfirmLotSize: "0.1",
    propfirmOpenPrice: "",
    propfirmClosePrice: "",
    propfirmStopLoss: "1",
    propfirmTakeProfit: "1",
    propfirmProfitLoss: "",
    propfirmCommission: "",
    propfirmSwap: "",
    propfirmNetProfit: "",
    // Broker operation
    brokerDirection: "sell" as "buy" | "sell", // Opposite by default
    brokerLotSize: "0.1",
    brokerOpenPrice: "",
    brokerClosePrice: "",
    brokerStopLoss: "1",
    brokerTakeProfit: "1",
    brokerProfitLoss: "",
    brokerCommission: "",
    brokerSwap: "",
    brokerNetProfit: "",
    // Shared fields
    status: "OPEN" as "OPEN" | "CLOSED",
    entryMethod: "MANUAL" as "MANUAL" | "API" | "COPY_TRADING",
    openTime: formatDateForInput(new Date()), // Properly formatted datetime-local
    closeTime: "",
    notes: "",
  });

  const { data: symbols } = trpc.symbol.getAll.useQuery({});
  const createTradePair = trpc.trade.createPair.useMutation({
    onSuccess: () => {
      onSuccess();
      // Reset form
      setFormData({
        symbol: "",
        propfirmExternalTradeId: "",
        brokerExternalTradeId: "",
        propfirmDirection: "buy",
        propfirmLotSize: "0.1",
        propfirmOpenPrice: "",
        propfirmClosePrice: "",
        propfirmStopLoss: "1",
        propfirmTakeProfit: "1",
        propfirmProfitLoss: "",
        propfirmCommission: "",
        propfirmSwap: "",
        propfirmNetProfit: "",
        brokerDirection: "sell",
        brokerLotSize: "0.1",
        brokerOpenPrice: "",
        brokerClosePrice: "",
        brokerStopLoss: "1",
        brokerTakeProfit: "1",
        brokerProfitLoss: "",
        brokerCommission: "",
        brokerSwap: "",
        brokerNetProfit: "",
        status: "OPEN",
        entryMethod: "MANUAL",
        openTime: formatDateForInput(new Date()),
        closeTime: "",
        notes: "",
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
      // External trade IDs
      propfirmExternalTradeId: formData.propfirmExternalTradeId || undefined,
      brokerExternalTradeId: formData.brokerExternalTradeId || undefined,
      // Propfirm trade data
      propfirmDirection: formData.propfirmDirection,
      propfirmLotSize: Number.parseFloat(formData.propfirmLotSize),
      propfirmOpenPrice: Number.parseFloat(formData.propfirmOpenPrice),
      propfirmClosePrice: formData.propfirmClosePrice
        ? Number.parseFloat(formData.propfirmClosePrice)
        : undefined,
      propfirmStopLoss: formData.propfirmStopLoss
        ? Number.parseFloat(formData.propfirmStopLoss)
        : undefined,
      propfirmTakeProfit: formData.propfirmTakeProfit
        ? Number.parseFloat(formData.propfirmTakeProfit)
        : undefined,
      propfirmProfitLoss: formData.propfirmProfitLoss
        ? Number.parseFloat(formData.propfirmProfitLoss)
        : 0,
      propfirmCommission: formData.propfirmCommission
        ? Number.parseFloat(formData.propfirmCommission)
        : 0,
      propfirmSwap: formData.propfirmSwap
        ? Number.parseFloat(formData.propfirmSwap)
        : 0,
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
      brokerStopLoss: formData.brokerStopLoss
        ? Number.parseFloat(formData.brokerStopLoss)
        : undefined,
      brokerTakeProfit: formData.brokerTakeProfit
        ? Number.parseFloat(formData.brokerTakeProfit)
        : undefined,
      brokerProfitLoss: formData.brokerProfitLoss
        ? Number.parseFloat(formData.brokerProfitLoss)
        : 0,
      brokerCommission: formData.brokerCommission
        ? Number.parseFloat(formData.brokerCommission)
        : 0,
      brokerSwap: formData.brokerSwap
        ? Number.parseFloat(formData.brokerSwap)
        : 0,
      brokerNetProfit: formData.brokerNetProfit
        ? Number.parseFloat(formData.brokerNetProfit)
        : 0,
      // Shared fields
      status: formData.status,
      entryMethod: formData.entryMethod,
      openTime: openTimeDate.toISOString(),
      closeTime: closeTimeDate ? closeTimeDate.toISOString() : undefined,
      notes: formData.notes || undefined,
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
      <DialogContent className="!max-w-[98vw] !w-[1400px] max-h-[90vh] overflow-hidden p-0 bg-transparent border-0 ">
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
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
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
                            htmlFor="entryMethod"
                            className="text-slate-200 text-sm"
                          >
                            Método de Entrada
                          </Label>
                          <Select
                            value={formData.entryMethod}
                            onValueChange={(value: string) =>
                              setFormData((prev) => ({
                                ...prev,
                                entryMethod: value as
                                  | "MANUAL"
                                  | "API"
                                  | "COPY_TRADING",
                              }))
                            }
                          >
                            <SelectTrigger className="!bg-slate-700/50 border-slate-600 text-white h-9">
                              <SelectValue placeholder="Método" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-700 border-slate-600">
                              <SelectItem
                                value="MANUAL"
                                className="text-white hover:bg-slate-600"
                              >
                                Manual
                              </SelectItem>
                              <SelectItem
                                value="API"
                                className="text-white hover:bg-slate-600"
                              >
                                API
                              </SelectItem>
                              <SelectItem
                                value="COPY_TRADING"
                                className="text-white hover:bg-slate-600"
                              >
                                Copy Trading
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

                  {/* Trading Operations - Horizontal Table Layout */}
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-emerald-400 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Operaciones de Trading
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative pb-8">
                        <div
                          ref={scrollContainerRef}
                          className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800"
                          style={{
                            scrollbarWidth: "thin",
                            scrollbarColor: "#475569 #1e293b",
                          }}
                          onScroll={checkScrollability}
                        >
                          <table className="w-full border-collapse min-w-[1300px]">
                            <thead>
                              <tr className="border-b border-slate-600">
                                <th className="text-center py-3 px-2 text-slate-300 text-sm font-medium w-20">
                                  Cuenta
                                </th>
                                <th className="text-center py-3 px-2 text-slate-300 text-sm font-medium w-24">
                                  Posición
                                </th>
                                <th className="text-center py-3 px-2 text-slate-300 text-sm font-medium w-24">
                                  Dirección *
                                </th>
                                <th className="text-center py-3 px-2 text-slate-300 text-sm font-medium w-20">
                                  Lotes *
                                </th>
                                <th className="text-center py-3 px-2 text-slate-300 text-sm font-medium w-28">
                                  Apertura *
                                </th>
                                <th className="text-center py-3 px-2 text-slate-300 text-sm font-medium w-28">
                                  Cierre
                                </th>
                                <th className="text-center py-3 px-2 text-slate-300 text-sm font-medium w-28">
                                  Stop Loss
                                </th>
                                <th className="text-center py-3 px-2 text-slate-300 text-sm font-medium w-28">
                                  Take Profit
                                </th>
                                <th className="text-center py-3 px-2 text-slate-300 text-sm font-medium w-24">
                                  P&L Bruto
                                </th>
                                <th className="text-center py-3 px-2 text-slate-300 text-sm font-medium w-24">
                                  Comisión
                                </th>
                                <th className="text-center py-3 px-2 text-slate-300 text-sm font-medium w-20">
                                  Swap
                                </th>
                                <th className="text-center py-3 px-2 text-slate-300 text-sm font-medium w-24">
                                  P&L Neto
                                </th>
                              </tr>
                            </thead>
                            <tbody className="text-sm">
                              {/* Propfirm Row */}
                              <tr className="border-b border-slate-700/50">
                                <td className="py-3 px-2 text-center w-20">
                                  <div className="flex items-center justify-center">
                                    <div className="h-2 w-2 rounded-full bg-purple-400 mr-2" />
                                    <span className="text-purple-400 font-medium text-xs">
                                      Propfirm
                                    </span>
                                  </div>
                                </td>
                                <td className="p-0 w-24">
                                  <Input
                                    type="text"
                                    placeholder="159351633"
                                    value={formData.propfirmExternalTradeId}
                                    onChange={(e) =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        propfirmExternalTradeId: e.target.value,
                                      }))
                                    }
                                    className="!bg-transparent !border-0 !shadow-none text-white placeholder:text-slate-400 h-8 text-xs !p-0 !m-0 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none !px-2 w-full text-center font-mono"
                                  />
                                </td>
                                <td className="p-0 w-24">
                                  <Select
                                    value={formData.propfirmDirection}
                                    onValueChange={(value: string) =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        propfirmDirection: value as
                                          | "buy"
                                          | "sell",
                                        brokerDirection:
                                          value === "buy" ? "sell" : "buy",
                                      }))
                                    }
                                  >
                                    <SelectTrigger className="!bg-transparent !border-0 !shadow-none text-white h-8 text-xs !p-0 !m-0 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none !px-2 text-center">
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
                                </td>
                                <td className="p-0 w-20">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={formData.propfirmLotSize}
                                    onChange={(e) =>
                                      handleNumericChange(
                                        "propfirmLotSize",
                                        e.target.value
                                      )
                                    }
                                    className="!bg-transparent !border-0 !shadow-none text-white placeholder:text-slate-400 h-8 text-xs !p-0 !m-0 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none !px-2 w-full text-center"
                                    inputMode="decimal"
                                    pattern="[0-9]*\.?[0-9]*"
                                    placeholder="0.1"
                                    required
                                  />
                                </td>
                                <td className="p-0 w-28">
                                  <Input
                                    type="number"
                                    step="0.00001"
                                    min="0"
                                    value={formData.propfirmOpenPrice}
                                    onChange={(e) =>
                                      handleNumericChange(
                                        "propfirmOpenPrice",
                                        e.target.value
                                      )
                                    }
                                    className="!bg-transparent !border-0 !shadow-none text-white placeholder:text-slate-400 h-8 text-xs !p-0 !m-0 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none !px-2 w-full text-center"
                                    inputMode="decimal"
                                    pattern="[0-9]*\.?[0-9]*"
                                    placeholder="1.23456"
                                    required
                                  />
                                </td>
                                <td className="p-0 w-28">
                                  <Input
                                    type="number"
                                    step="0.00001"
                                    min="0"
                                    value={formData.propfirmClosePrice}
                                    onChange={(e) =>
                                      handleNumericChange(
                                        "propfirmClosePrice",
                                        e.target.value
                                      )
                                    }
                                    className="!bg-transparent !border-0 !shadow-none text-white placeholder:text-slate-400 h-8 text-xs !p-0 !m-0 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none !px-2 w-full text-center"
                                    inputMode="decimal"
                                    pattern="[0-9]*\.?[0-9]*"
                                    placeholder="1.23456"
                                  />
                                </td>
                                <td className="p-0 w-28">
                                  <Input
                                    type="number"
                                    step="0.00001"
                                    min="0"
                                    value={formData.propfirmStopLoss}
                                    onChange={(e) =>
                                      handleNumericChange(
                                        "propfirmStopLoss",
                                        e.target.value
                                      )
                                    }
                                    className="!bg-transparent !border-0 !shadow-none text-white placeholder:text-slate-400 h-8 text-xs !p-0 !m-0 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none !px-2 w-full text-center"
                                    inputMode="decimal"
                                    pattern="[0-9]*\.?[0-9]*"
                                    placeholder="1.23456"
                                  />
                                </td>
                                <td className="p-0 w-28">
                                  <Input
                                    type="number"
                                    step="0.00001"
                                    min="0"
                                    value={formData.propfirmTakeProfit}
                                    onChange={(e) =>
                                      handleNumericChange(
                                        "propfirmTakeProfit",
                                        e.target.value
                                      )
                                    }
                                    className="!bg-transparent !border-0 !shadow-none text-white placeholder:text-slate-400 h-8 text-xs !p-0 !m-0 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none !px-2 w-full text-center"
                                    inputMode="decimal"
                                    pattern="[0-9]*\.?[0-9]*"
                                    placeholder="1.23456"
                                  />
                                </td>
                                <td className="p-0 w-24">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.propfirmProfitLoss}
                                    onChange={(e) =>
                                      handleNumericChange(
                                        "propfirmProfitLoss",
                                        e.target.value
                                      )
                                    }
                                    className="!bg-transparent !border-0 !shadow-none text-white placeholder:text-slate-400 h-8 text-xs !p-0 !m-0 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none !px-2 w-full text-center"
                                    inputMode="decimal"
                                    pattern="[0-9]*\.?[0-9]*"
                                    placeholder="0.00"
                                  />
                                </td>
                                <td className="p-0 w-24">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.propfirmCommission}
                                    onChange={(e) =>
                                      handleNumericChange(
                                        "propfirmCommission",
                                        e.target.value
                                      )
                                    }
                                    className="!bg-transparent !border-0 !shadow-none text-white placeholder:text-slate-400 h-8 text-xs !p-0 !m-0 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none !px-2 w-full text-center"
                                    inputMode="decimal"
                                    pattern="[0-9]*\.?[0-9]*"
                                    placeholder="0.00"
                                  />
                                </td>
                                <td className="p-0 w-20">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.propfirmSwap}
                                    onChange={(e) =>
                                      handleNumericChange(
                                        "propfirmSwap",
                                        e.target.value
                                      )
                                    }
                                    className="!bg-transparent !border-0 !shadow-none text-white placeholder:text-slate-400 h-8 text-xs !p-0 !m-0 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none !px-2 w-full text-center"
                                    inputMode="decimal"
                                    pattern="[0-9]*\.?[0-9]*"
                                    placeholder="0.00"
                                  />
                                </td>
                                <td className="p-0 w-24">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.propfirmNetProfit}
                                    onChange={(e) =>
                                      handleNumericChange(
                                        "propfirmNetProfit",
                                        e.target.value
                                      )
                                    }
                                    className="!bg-transparent !border-0 !shadow-none text-white placeholder:text-slate-400 h-8 text-xs !p-0 !m-0 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none !px-2 w-full text-center"
                                    inputMode="decimal"
                                    pattern="[0-9]*\.?[0-9]*"
                                    placeholder="0.00"
                                  />
                                </td>
                              </tr>

                              {/* Broker Row */}
                              <tr>
                                <td className="py-3 px-2 text-center w-20">
                                  <div className="flex items-center justify-center">
                                    <div className="h-2 w-2 rounded-full bg-blue-400 mr-2" />
                                    <span className="text-blue-400 font-medium text-xs">
                                      Broker
                                    </span>
                                  </div>
                                </td>
                                <td className="p-0 w-24">
                                  <Input
                                    type="text"
                                    placeholder="99120719"
                                    value={formData.brokerExternalTradeId}
                                    onChange={(e) =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        brokerExternalTradeId: e.target.value,
                                      }))
                                    }
                                    className="!bg-transparent !border-0 !shadow-none text-white placeholder:text-slate-400 h-8 text-xs !p-0 !m-0 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none !px-2 w-full text-center font-mono"
                                  />
                                </td>
                                <td className="p-0 w-24">
                                  <Select
                                    value={formData.brokerDirection}
                                    onValueChange={(value: string) =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        brokerDirection: value as
                                          | "buy"
                                          | "sell",
                                        propfirmDirection:
                                          value === "buy" ? "sell" : "buy",
                                      }))
                                    }
                                  >
                                    <SelectTrigger className="!bg-transparent !border-0 !shadow-none text-white h-8 text-xs !p-0 !m-0 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none !px-2 text-center">
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
                                </td>
                                <td className="p-0 w-20">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={formData.brokerLotSize}
                                    onChange={(e) =>
                                      handleNumericChange(
                                        "brokerLotSize",
                                        e.target.value
                                      )
                                    }
                                    className="!bg-transparent !border-0 !shadow-none text-white placeholder:text-slate-400 h-8 text-xs !p-0 !m-0 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none !px-2 w-full text-center"
                                    inputMode="decimal"
                                    pattern="[0-9]*\.?[0-9]*"
                                    placeholder="0.1"
                                    required
                                  />
                                </td>
                                <td className="p-0 w-28">
                                  <Input
                                    type="number"
                                    step="0.00001"
                                    min="0"
                                    value={formData.brokerOpenPrice}
                                    onChange={(e) =>
                                      handleNumericChange(
                                        "brokerOpenPrice",
                                        e.target.value
                                      )
                                    }
                                    className="!bg-transparent !border-0 !shadow-none text-white placeholder:text-slate-400 h-8 text-xs !p-0 !m-0 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none !px-2 w-full text-center"
                                    inputMode="decimal"
                                    pattern="[0-9]*\.?[0-9]*"
                                    placeholder="1.23456"
                                    required
                                  />
                                </td>
                                <td className="p-0 w-28">
                                  <Input
                                    type="number"
                                    step="0.00001"
                                    min="0"
                                    value={formData.brokerClosePrice}
                                    onChange={(e) =>
                                      handleNumericChange(
                                        "brokerClosePrice",
                                        e.target.value
                                      )
                                    }
                                    className="!bg-transparent !border-0 !shadow-none text-white placeholder:text-slate-400 h-8 text-xs !p-0 !m-0 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none !px-2 w-full text-center"
                                    inputMode="decimal"
                                    pattern="[0-9]*\.?[0-9]*"
                                    placeholder="1.23456"
                                  />
                                </td>
                                <td className="p-0 w-28">
                                  <Input
                                    type="number"
                                    step="0.00001"
                                    min="0"
                                    value={formData.brokerStopLoss}
                                    onChange={(e) =>
                                      handleNumericChange(
                                        "brokerStopLoss",
                                        e.target.value
                                      )
                                    }
                                    className="!bg-transparent !border-0 !shadow-none text-white placeholder:text-slate-400 h-8 text-xs !p-0 !m-0 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none !px-2 w-full text-center"
                                    inputMode="decimal"
                                    pattern="[0-9]*\.?[0-9]*"
                                    placeholder="1.23456"
                                  />
                                </td>
                                <td className="p-0 w-28">
                                  <Input
                                    type="number"
                                    step="0.00001"
                                    min="0"
                                    value={formData.brokerTakeProfit}
                                    onChange={(e) =>
                                      handleNumericChange(
                                        "brokerTakeProfit",
                                        e.target.value
                                      )
                                    }
                                    className="!bg-transparent !border-0 !shadow-none text-white placeholder:text-slate-400 h-8 text-xs !p-0 !m-0 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none !px-2 w-full text-center"
                                    inputMode="decimal"
                                    pattern="[0-9]*\.?[0-9]*"
                                    placeholder="1.23456"
                                  />
                                </td>
                                <td className="p-0 w-24">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.brokerProfitLoss}
                                    onChange={(e) =>
                                      handleNumericChange(
                                        "brokerProfitLoss",
                                        e.target.value
                                      )
                                    }
                                    className="!bg-transparent !border-0 !shadow-none text-white placeholder:text-slate-400 h-8 text-xs !p-0 !m-0 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none !px-2 w-full text-center"
                                    inputMode="decimal"
                                    pattern="[0-9]*\.?[0-9]*"
                                    placeholder="0.00"
                                  />
                                </td>
                                <td className="p-0 w-24">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.brokerCommission}
                                    onChange={(e) =>
                                      handleNumericChange(
                                        "brokerCommission",
                                        e.target.value
                                      )
                                    }
                                    className="!bg-transparent !border-0 !shadow-none text-white placeholder:text-slate-400 h-8 text-xs !p-0 !m-0 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none !px-2 w-full text-center"
                                    inputMode="decimal"
                                    pattern="[0-9]*\.?[0-9]*"
                                    placeholder="0.00"
                                  />
                                </td>
                                <td className="p-0 w-20">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.brokerSwap}
                                    onChange={(e) =>
                                      handleNumericChange(
                                        "brokerSwap",
                                        e.target.value
                                      )
                                    }
                                    className="!bg-transparent !border-0 !shadow-none text-white placeholder:text-slate-400 h-8 text-xs !p-0 !m-0 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none !px-2 w-full text-center"
                                    inputMode="decimal"
                                    pattern="[0-9]*\.?[0-9]*"
                                    placeholder="0.00"
                                  />
                                </td>
                                <td className="p-0 w-24">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.brokerNetProfit}
                                    onChange={(e) =>
                                      handleNumericChange(
                                        "brokerNetProfit",
                                        e.target.value
                                      )
                                    }
                                    className="!bg-transparent !border-0 !shadow-none text-white placeholder:text-slate-400 h-8 text-xs !p-0 !m-0 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none !px-2 w-full text-center"
                                    inputMode="decimal"
                                    pattern="[0-9]*\.?[0-9]*"
                                    placeholder="0.00"
                                  />
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Botones de navegación */}
                        {canScrollLeft && (
                          <button
                            type="button"
                            onClick={scrollLeft}
                            className="absolute left-0 top-1/2 transform -translate-y-1/2 w-6 h-16 bg-gradient-to-r from-slate-800/90 to-transparent hover:from-slate-700/90 z-20 flex items-center justify-center group rounded-r-md"
                          >
                            <ChevronLeft className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
                          </button>
                        )}
                        {canScrollRight && (
                          <button
                            type="button"
                            onClick={scrollRight}
                            className="absolute right-0 top-1/2 transform -translate-y-1/2 w-6 h-16 bg-gradient-to-l from-slate-800/90 to-transparent hover:from-slate-700/90 z-20 flex items-center justify-center group rounded-l-md"
                          >
                            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
                          </button>
                        )}

                        {/* Indicador de scroll horizontal */}
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-slate-800/90 px-3 py-1 rounded-full text-xs text-slate-400 border border-slate-600 shadow-lg">
                          ← Desplázate horizontalmente →
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notes Section */}
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-emerald-400 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Notas Adicionales
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Label
                          htmlFor="notes"
                          className="text-slate-200 text-sm"
                        >
                          Notas (Opcional)
                        </Label>
                        <textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              notes: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white placeholder:text-slate-400 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Agrega notas adicionales sobre esta operación..."
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>

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
