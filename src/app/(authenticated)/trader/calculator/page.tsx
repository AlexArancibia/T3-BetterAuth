"use client";

import { TradingCalculator } from "@/components/trader/TradingCalculator";

export default function CalculatorPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Calculadora de Trading
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5 mr-8">
          Herramientas avanzadas para cálculo de capital, lotaje y gestión de
          riesgo
        </p>
      </div>

      {/* Calculator Component */}
      <TradingCalculator />
    </div>
  );
}
