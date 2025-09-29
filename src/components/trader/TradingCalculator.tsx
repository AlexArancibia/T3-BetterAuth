"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/utils/trpc";
import {
  AlertTriangle,
  Calculator,
  DollarSign,
  Target,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

interface CalculatorResult {
  lotSize: number;
  riskAmount: number;
  potentialProfit: number;
  riskRewardRatio: number;
  positionValue: number;
}

export function TradingCalculator() {
  // Form state
  const [formData, setFormData] = useState({
    accountBalance: 0,
    riskPercentage: 1.0,
    symbol: "",
    entryPrice: 0,
    stopLoss: 0,
    takeProfit: 0,
    riskAmount: 0,
  });

  // Calculation results
  const [results, setResults] = useState<CalculatorResult | null>(null);

  // Get symbols for dropdown
  const { data: symbols } = trpc.symbol.getAll.useQuery({});

  // Calculate risk amount when balance or percentage changes
  useEffect(() => {
    const riskAmount =
      (formData.accountBalance * formData.riskPercentage) / 100;
    setFormData((prev) => ({ ...prev, riskAmount }));
  }, [formData.accountBalance, formData.riskPercentage]);

  const calculatePosition = () => {
    const {
      accountBalance: _accountBalance,
      riskAmount,
      entryPrice,
      stopLoss,
      takeProfit,
    } = formData;

    // Calculate pip difference
    const pipDifference = Math.abs(entryPrice - stopLoss) * 10000; // For 4-decimal pairs
    const profitPips = Math.abs(takeProfit - entryPrice) * 10000;

    // Calculate pip value for 1 lot (assuming USD account)
    const pipValue = 10; // Standard for most major pairs

    // Calculate lot size based on risk
    const lotSize =
      pipDifference > 0 ? riskAmount / (pipDifference * pipValue) : 0;

    // Calculate position value
    const positionValue = lotSize * 100000 * entryPrice; // Standard lot size

    // Calculate potential profit
    const potentialProfit = lotSize * profitPips * pipValue;

    // Calculate risk-reward ratio
    const riskRewardRatio = profitPips > 0 ? profitPips / pipDifference : 0;

    setResults({
      lotSize: Number(lotSize.toFixed(2)),
      riskAmount,
      potentialProfit: Number(potentialProfit.toFixed(2)),
      riskRewardRatio: Number(riskRewardRatio.toFixed(2)),
      positionValue: Number(positionValue.toFixed(2)),
    });
  };

  const resetCalculator = () => {
    setFormData({
      accountBalance: 0,
      riskPercentage: 1.0,
      symbol: "",
      entryPrice: 0,
      stopLoss: 0,
      takeProfit: 0,
      riskAmount: 0,
    });
    setResults(null);
  };

  const isValidCalculation =
    formData.entryPrice > 0 &&
    formData.stopLoss > 0 &&
    formData.takeProfit > 0 &&
    formData.accountBalance > 0 &&
    formData.symbol !== "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Calculator className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Calculadora de Capital y Lotaje
          </h2>
        </div>
        <p className="text-gray-600">
          Calcula el tamaño de posición y gestión de riesgo
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>Parámetros de Trading</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Account Information */}
            <div className="bg-white/60 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Información de Cuenta
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="balance">Capital (USD)</Label>
                  <Input
                    id="balance"
                    type="number"
                    step="0.01"
                    placeholder="10000"
                    value={formData.accountBalance || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        accountBalance: Number(e.target.value) || 0,
                      }))
                    }
                    className="font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="risk">Riesgo (%)</Label>
                  <Input
                    id="risk"
                    type="number"
                    step="0.1"
                    max="5"
                    value={formData.riskPercentage}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        riskPercentage: Number(e.target.value),
                      }))
                    }
                    className="font-mono"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="riskAmount">Cantidad de Riesgo (USD)</Label>
                <Input
                  id="riskAmount"
                  type="number"
                  step="0.01"
                  value={formData.riskAmount.toFixed(2)}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      riskAmount: Number(e.target.value),
                    }))
                  }
                  className="font-mono bg-gray-50"
                />
              </div>
            </div>

            {/* Trading Setup */}
            <div className="bg-white/60 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Configuración de Operación
              </h4>

              <div>
                <Label htmlFor="symbol">Símbolo</Label>
                <select
                  id="symbol"
                  value={formData.symbol}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, symbol: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="EURUSD">EURUSD</option>
                  <option value="GBPUSD">GBPUSD</option>
                  <option value="USDJPY">USDJPY</option>
                  <option value="USDCHF">USDCHF</option>
                  <option value="AUDUSD">AUDUSD</option>
                  {symbols?.data?.map((symbol) => (
                    <option key={symbol.id} value={symbol.symbol}>
                      {symbol.symbol}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="entry">Precio Entrada</Label>
                  <Input
                    id="entry"
                    type="number"
                    step="0.00001"
                    placeholder="1.08500"
                    value={formData.entryPrice || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        entryPrice: Number(e.target.value) || 0,
                      }))
                    }
                    className="font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="sl">Stop Loss</Label>
                  <Input
                    id="sl"
                    type="number"
                    step="0.00001"
                    placeholder="1.08400"
                    value={formData.stopLoss || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        stopLoss: Number(e.target.value) || 0,
                      }))
                    }
                    className="font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="tp">Take Profit</Label>
                  <Input
                    id="tp"
                    type="number"
                    step="0.00001"
                    placeholder="1.08700"
                    value={formData.takeProfit || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        takeProfit: Number(e.target.value) || 0,
                      }))
                    }
                    className="font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                onClick={calculatePosition}
                disabled={!isValidCalculation}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Calcular
              </Button>
              <Button
                onClick={resetCalculator}
                variant="outline"
                className="flex-1"
              >
                Limpiar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-emerald-600" />
              <span>Resultados del Cálculo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results ? (
              <div className="space-y-4">
                {/* Main Results */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/60 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-600">
                      {results.lotSize}
                    </div>
                    <div className="text-sm text-gray-600">Lotes</div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      ${results.riskAmount.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Riesgo</div>
                  </div>
                </div>

                <Separator />

                {/* Detailed Results */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-white/60 rounded-lg p-3">
                    <span className="font-medium">Valor de Posición:</span>
                    <span className="font-mono">
                      ${results.positionValue.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-white/60 rounded-lg p-3">
                    <span className="font-medium">Ganancia Potencial:</span>
                    <span className="font-mono text-emerald-600">
                      +${results.potentialProfit.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-white/60 rounded-lg p-3">
                    <span className="font-medium">Ratio Riesgo/Beneficio:</span>
                    <span
                      className={`font-mono ${
                        results.riskRewardRatio >= 2
                          ? "text-emerald-600"
                          : results.riskRewardRatio >= 1
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      1:{results.riskRewardRatio}
                    </span>
                  </div>
                </div>

                {/* Risk Assessment */}
                <div className="bg-white/60 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium">Evaluación de Riesgo</span>
                  </div>
                  <div className="text-sm space-y-1">
                    {results.riskRewardRatio >= 2 && (
                      <p className="text-emerald-600">
                        ✓ Excelente ratio riesgo/beneficio
                      </p>
                    )}
                    {results.riskRewardRatio >= 1 &&
                      results.riskRewardRatio < 2 && (
                        <p className="text-yellow-600">
                          ⚠ Ratio riesgo/beneficio aceptable
                        </p>
                      )}
                    {results.riskRewardRatio < 1 && (
                      <p className="text-red-600">
                        ⚠ Ratio riesgo/beneficio bajo
                      </p>
                    )}
                    {formData.riskPercentage > 2 && (
                      <p className="text-red-600">
                        ⚠ Riesgo por operación alto
                      </p>
                    )}
                    {formData.riskPercentage <= 2 && (
                      <p className="text-emerald-600">
                        ✓ Riesgo por operación conservador
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Completa los parámetros y presiona "Calcular"</p>
                <p className="text-sm">para ver los resultados</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Formula Explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Fórmulas Utilizadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p>
                <strong>Cantidad de Riesgo:</strong>
              </p>
              <p className="font-mono bg-white p-2 rounded">
                Capital × (% Riesgo / 100)
              </p>

              <p>
                <strong>Tamaño de Lote:</strong>
              </p>
              <p className="font-mono bg-white p-2 rounded">
                Riesgo ÷ (Pips SL × Valor Pip)
              </p>
            </div>
            <div className="space-y-2">
              <p>
                <strong>Ganancia Potencial:</strong>
              </p>
              <p className="font-mono bg-white p-2 rounded">
                Lotes × Pips TP × Valor Pip
              </p>

              <p>
                <strong>Ratio R/B:</strong>
              </p>
              <p className="font-mono bg-white p-2 rounded">
                Pips TP ÷ Pips SL
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
