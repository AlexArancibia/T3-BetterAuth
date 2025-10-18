"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  ExtendedAccountLink,
  SymbolConfig,
  SymbolData,
  Trade,
} from "@/types/connection";
import { trpc } from "@/utils/trpc";
import {
  Building2,
  Calculator,
  DollarSign,
  Globe,
  Settings,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

interface TradingCalculatorProps {
  connection: ExtendedAccountLink;
}

export function TradingCalculator({ connection }: TradingCalculatorProps) {
  const [selectedSymbolId, setSelectedSymbolId] = useState<string>("");
  const [pipsStop, setPipsStop] = useState<string>("");
  const [operationRisk, setOperationRisk] = useState<string>("");
  const [isAutoPercentage, setIsAutoPercentage] = useState<boolean>(true);
  const [manualPercentage, setManualPercentage] = useState<string>("100");

  // Extract propfirm and broker IDs from connection
  const propfirmId = connection.propfirmAccount?.propfirmId;
  const brokerId = connection.brokerAccount?.brokerId;

  // Get propfirm rules configuration
  const {
    data: rulesConfig,
    isLoading: rulesLoading,
    error: rulesError,
  } = trpc.propfirmRulesConfig.getByTradingAccount.useQuery(
    {
      propfirmId: propfirmId || "",
      accountTypeId: connection.propfirmAccount?.accountTypeId || "",
      phaseId: connection.propfirmAccount?.currentPhaseId || "",
    },
    {
      enabled: !!(
        propfirmId &&
        connection.propfirmAccount?.accountTypeId &&
        connection.propfirmAccount?.currentPhaseId
      ),
    }
  );

  // Get symbol configurations for both propfirm and broker (only FOREX)
  const { data: symbolConfigsData, isLoading: configsLoading } =
    trpc.symbolConfig.getByConnection.useQuery(
      {
        propfirmId: propfirmId,
        brokerId: brokerId,
        category: "FOREX", // Solo FOREX
      },
      {
        enabled: !!(propfirmId || brokerId),
      }
    );

  // Get all available symbols for the selector
  const allPropfirmConfigs = symbolConfigsData?.propfirmConfigurations || [];
  const allBrokerConfigs = symbolConfigsData?.brokerConfigurations || [];

  // Combine all symbols and remove duplicates
  const allSymbols: SymbolData[] = [
    ...allPropfirmConfigs,
    ...allBrokerConfigs,
  ].reduce((acc: SymbolData[], config: SymbolConfig) => {
    const existingSymbol = acc.find((s) => s.symbolId === config.symbolId);
    if (!existingSymbol) {
      acc.push({
        symbolId: config.symbolId,
        symbol: config.symbol.symbol,
        displayName: config.symbol.displayName,
        propfirmConfig: allPropfirmConfigs.find(
          (c) => c.symbolId === config.symbolId
        ) as SymbolConfig | undefined,
        brokerConfig: allBrokerConfigs.find(
          (c) => c.symbolId === config.symbolId
        ) as SymbolConfig | undefined,
      });
    }
    return acc;
  }, []);

  // Filter configurations by selected symbol
  const propfirmConfigs = selectedSymbolId
    ? allPropfirmConfigs.filter(
        (config: SymbolConfig) => config.symbolId === selectedSymbolId
      )
    : [];

  const brokerConfigs = selectedSymbolId
    ? allBrokerConfigs.filter(
        (config: SymbolConfig) => config.symbolId === selectedSymbolId
      )
    : [];

  // Get real trades from connection
  const propfirmTrades = connection.propfirmAccount?.trades || [];
  const brokerTrades = connection.brokerAccount?.trades || [];

  // ========================================
  // CÁLCULOS DE RENDIMIENTO Y RIESGO
  // ========================================

  // Calcular CAPITAL FTMO: beneficio + comisión + swap
  // Comisión y swap siempre son negativos por defecto
  const totalPropfirmPnL = propfirmTrades.reduce(
    (sum: number, trade: Trade) => {
      const netProfit = Number(trade.netProfit || 0);
      const commission = Number(trade.commission || 0);
      const swap = Number(trade.swap || 0);

      // Asegurar que comisión y swap sean negativos si no están definidos o son positivos
      const commissionValue =
        commission <= 0 ? commission : -Math.abs(commission);
      const swapValue = swap <= 0 ? swap : -Math.abs(swap);

      return sum + netProfit + commissionValue + swapValue;
    },
    0
  );

  // Calcular CAPITAL BROKER: beneficio + comisión + swap
  // Comisión y swap siempre son negativos por defecto
  const totalBrokerPnL = brokerTrades.reduce((sum: number, trade: Trade) => {
    const netProfit = Number(trade.netProfit || 0);
    const commission = Number(trade.commission || 0);
    const swap = Number(trade.swap || 0);

    // Asegurar que comisión y swap sean negativos si no están definidos o son positivos
    const commissionValue =
      commission <= 0 ? commission : -Math.abs(commission);
    const swapValue = swap <= 0 ? swap : -Math.abs(swap);

    return sum + netProfit + commissionValue + swapValue;
  }, 0);

  // Obtener balance inicial de la cuenta propfirm
  // Este es el capital inicial con el que se comenzó la cuenta
  const initialBalance = Number(
    connection.propfirmAccount?.initialBalance || 0
  );

  // Obtener límite máximo de drawdown permitido por las reglas
  const maxDrawdown = rulesConfig ? Number(rulesConfig.maxDrawdown) : 0;

  // Calcular % Restante de Drawdown
  // Fórmula: Draw Down Máximo - (P&L Actual / Balance Inicial) * 100
  // Indica cuánto porcentaje de pérdida se puede tolerar antes de violar las reglas
  const remainingPercentage =
    initialBalance > 0
      ? maxDrawdown - (totalPropfirmPnL / initialBalance) * 100
      : maxDrawdown;

  // Obtener objetivo de ganancia de la fase actual
  const profitTarget = rulesConfig ? Number(rulesConfig.profitTarget) : 0;

  // Calcular % restante para alcanzar el objetivo
  // Fórmula: Objetivo - (P&L Actual / Balance Inicial) * 100
  // Indica cuánto porcentaje de ganancia falta para completar la fase
  // Similar al % restante pero para ganancias (objetivo) en lugar de pérdidas (drawdown)
  const targetPercentage =
    initialBalance > 0
      ? profitTarget - (totalPropfirmPnL / initialBalance) * 100
      : profitTarget;

  // ========================================
  // CÁLCULOS DE COMISIONES Y COSTOS
  // ========================================

  // Obtener configuración del símbolo seleccionado para cálculos
  // Busca en las configuraciones de propfirm y broker
  const _selectedSymbolConfig = selectedSymbolId
    ? [...propfirmConfigs, ...brokerConfigs].find(
        (config) => config.symbolId === selectedSymbolId
      )
    : null;

  // Obtener valores necesarios para la fórmula
  const operationRiskValue = Number(operationRisk || 0);
  const maxDrawdownValue = rulesConfig ? Number(rulesConfig.maxDrawdown) : 1; // Evitar división por 0
  const pipsStopValue = Number(pipsStop || 1); // Evitar división por 0

  // Temporal: usar cobertura * 1.16 hasta que se calcule capitalDinamico
  const cobertura = Number(connection.propfirmAccount?.accountCost || 0);
  let baseCommission = cobertura * 1.16;

  // Obtener comisión por lote del broker desde las configuraciones del broker
  const brokerConfig = brokerConfigs.length > 0 ? brokerConfigs[0] : null;
  const brokerCommissionPerLot = brokerConfig?.commissionPerLot
    ? Number(brokerConfig.commissionPerLot)
    : 0;

  // Obtener valor pip por lote del broker desde las configuraciones del broker
  const brokerPipValuePerLot = brokerConfig?.pipValuePerLot
    ? Number(brokerConfig.pipValuePerLot)
    : 1; // Evitar división por 0

  // commissionPerLot se calculará después de actualizar baseCommission con el capital dinámico
  // Declaración temporal para evitar errores
  let commissionPerLot = 0;

  // C. Lote en Fondeo - Fórmula: (BALANCE_INICIAL_FONDEO * RIESGO_OPERACION% / PIPS_STOP * COMISION_LOTE_FONDEO / VALOR_PIP_LOTE_FONDEO) * (CAPITAL) / (BALANCE_INICIAL_FONDEO * DRAW_DOWN_MAXIMO)

  // Obtener balance inicial de fondeo (propfirm)
  const initialBalanceFunding = Number(
    connection.propfirmAccount?.initialBalance || 0
  );

  // Obtener comisión por lote de fondeo (propfirm)
  const propfirmConfig = propfirmConfigs.length > 0 ? propfirmConfigs[0] : null;
  const fundingCommissionPerLot = propfirmConfig?.commissionPerLot
    ? Number(propfirmConfig.commissionPerLot)
    : 0;

  // Obtener valor pip por lote en fondeo (propfirm)
  const fundingPipValuePerLot = propfirmConfig?.pipValuePerLot
    ? Number(propfirmConfig.pipValuePerLot)
    : 1; // Evitar división por 0

  // Aplicar fórmula completa para C. Lote en Fondeo
  // Fórmula: (BALANCE_INICIAL * RIESGO% / PIPS_STOP * COMISION_FONDEO / VALOR_PIP_FONDEO) * CAPITAL / (BALANCE_INICIAL * DRAW_DOWN)
  const lotInFunding =
    initialBalanceFunding > 0 &&
    pipsStopValue > 0 &&
    fundingPipValuePerLot > 0 &&
    maxDrawdownValue > 0
      ? // Primera parte: (BALANCE_INICIAL * RIESGO% / PIPS_STOP * COMISION_FONDEO / VALOR_PIP_FONDEO)
        (((((initialBalanceFunding * operationRiskValue) / pipsStopValue) *
          fundingCommissionPerLot) /
          fundingPipValuePerLot) *
          baseCommission) /
        (initialBalanceFunding * maxDrawdownValue)
      : 0;

  // Spread - Fórmula: CAPITAL * (RIESGO DE OPERACIÓN / DRAW DOWN MÁXIMO) / PIPS STOP * SPREAD BROKER

  // Obtener spread del broker desde la configuración del símbolo seleccionado
  const brokerSpread = brokerConfig?.spreadTypical
    ? Number(brokerConfig.spreadTypical)
    : 0;

  // spread se calculará después de actualizar baseCommission con el capital dinámico
  let spread = 0;

  // totalCommission se calculará después de recalcular commissionPerLot y spread
  let totalCommission = 0;

  // ========================================
  // CÁLCULOS DE TRADING (RECUPERADO Y OBJETIVO)
  // ========================================

  // Obtener capital actual de la cuenta propfirm
  const _capital = Number(connection.propfirmAccount?.currentBalance || 0);

  // Pips de stop loss ingresados por el usuario
  const _pips = Number(pipsStop || 0);

  // Porcentaje de riesgo por operación ingresado por el usuario
  const _operationPercentage = Number(operationRisk || 0);

  // Tamaño de lote estándar (asumiendo 1 lote, podría ser configurable)
  const _lotSize = 1;

  // FÓRMULA RECUPERADO: CAPITAL / (DRAW_DOWN_MÁXIMO * 100) * (%RESTANTE * 100) - (REDONDEAR_MAS((%OBJETIVO * 100) / (RIESGO_OPERACIÓN * 100), 0) * COMISIÓN_TOTAL)

  // Obtener % restante (ya calculado anteriormente)
  const porcentajeRestante = remainingPercentage;

  // Obtener % objetivo (ya calculado anteriormente)
  const porcentajeObjetivo = targetPercentage;

  // Calcular el factor de redondeo: (%OBJETIVO * 100) / (RIESGO_OPERACIÓN * 100)
  const factorRedondeo =
    (porcentajeObjetivo * 100) / (operationRiskValue * 100);

  // Redondear hacia arriba con 0 decimales
  const factorRedondeado = Math.ceil(factorRedondeo);

  // recuperado se calculará después de actualizar baseCommission y totalCommission
  let recuperado = 0;

  // calculoTotal se calculará después de recalcular recuperado
  let calculoTotal = 0;

  // ========================================
  // CÁLCULO DE %CAPITAL DINÁMICO
  // ========================================

  // Función auxiliar para calcular el cálculo total con un porcentaje dado
  const calcularConPorcentaje = (porcentaje: number) => {
    const capitalTemp = cobertura * (porcentaje / 100);

    // Recalcular valores dependientes del capital
    const commissionPerLotTemp =
      maxDrawdownValue > 0 && pipsStopValue > 0 && brokerPipValuePerLot > 0
        ? (((capitalTemp * (operationRiskValue / maxDrawdownValue)) /
            pipsStopValue) *
            brokerCommissionPerLot) /
          brokerPipValuePerLot
        : 0;

    const spreadTemp =
      maxDrawdownValue > 0 && pipsStopValue > 0
        ? ((capitalTemp * (operationRiskValue / maxDrawdownValue)) /
            pipsStopValue) *
          brokerSpread
        : 0;

    const totalCommissionTemp =
      commissionPerLotTemp + lotInFunding + spreadTemp;

    const recuperadoTemp =
      (capitalTemp / (maxDrawdownValue * 100)) * (porcentajeRestante * 100) -
      factorRedondeado * totalCommissionTemp;

    return totalBrokerPnL + recuperadoTemp;
  };

  // Debug: Log proceso de cálculo del %capital
  console.log("=== CÁLCULO DE %CAPITAL ===");
  console.log("1. VALORES INICIALES:");
  console.log("   - Cobertura:", cobertura);
  console.log("   - %Capital inicial: 100%");

  // Calcular el porcentaje según el modo seleccionado
  let porcentajeCapital = 100; // Siempre inicia en 100%

  if (isAutoPercentage) {
    console.log(
      "2. MODO AUTOMÁTICO: Iterar para encontrar %capital donde Calculo >= Cobertura"
    );

    if (cobertura > 0) {
      // Algoritmo de búsqueda binaria mejorado para encontrar el %capital correcto
      let porcentajeMinimo = 0.1; // Mínimo 0.1%
      let porcentajeMaximo = 1000; // Máximo 1000%
      let porcentajeActual = 100; // Empezar en 100%
      let calculoConPorcentaje = 0;
      let iteraciones = 0;
      const maxIteraciones = 50; // Límite de seguridad más bajo
      const tolerancia = 0.01; // Tolerancia para la precisión

      console.log("3. INICIANDO BÚSQUEDA BINARIA:");
      console.log("   - Cobertura objetivo:", cobertura);
      console.log("   - Rango inicial: 0.1% - 1000%");

      // Primero verificar si con 100% ya se cumple la condición
      calculoConPorcentaje = calcularConPorcentaje(100);
      if (calculoConPorcentaje >= cobertura) {
        console.log("   - Con 100% ya se cumple la condición");
        porcentajeCapital = 100;
      } else {
        // Usar búsqueda binaria para encontrar el porcentaje correcto
        while (
          iteraciones < maxIteraciones &&
          porcentajeMaximo - porcentajeMinimo > tolerancia
        ) {
          porcentajeActual = (porcentajeMinimo + porcentajeMaximo) / 2;
          calculoConPorcentaje = calcularConPorcentaje(porcentajeActual);

          console.log(
            `   - Iteración ${iteraciones + 1}: %Capital=${porcentajeActual.toFixed(3)}%, Calculo=${calculoConPorcentaje.toFixed(2)}, ¿>= Cobertura? ${calculoConPorcentaje >= cobertura}`
          );

          if (calculoConPorcentaje >= cobertura) {
            // Si cumple la condición, buscar un porcentaje menor
            porcentajeMaximo = porcentajeActual;
          } else {
            // Si no cumple, buscar un porcentaje mayor
            porcentajeMinimo = porcentajeActual;
          }

          iteraciones++;
        }

        // Usar el porcentaje máximo encontrado que cumple la condición
        porcentajeCapital = Math.round(porcentajeMaximo * 100) / 100; // Redondear a 2 decimales

        // Verificar el resultado final
        calculoConPorcentaje = calcularConPorcentaje(porcentajeCapital);

        console.log("4. RESULTADO DE LA BÚSQUEDA BINARIA:");
        console.log("   - Iteraciones realizadas:", iteraciones);
        console.log("   - %Capital final:", `${porcentajeCapital}%`);
        console.log("   - Calculo final:", calculoConPorcentaje.toFixed(2));
        console.log(
          "   - ¿Cumple condición? Calculo >= Cobertura:",
          calculoConPorcentaje >= cobertura
        );

        if (iteraciones >= maxIteraciones) {
          console.log("   - ADVERTENCIA: Se alcanzó el límite de iteraciones");
        }
      }
    } else {
      console.log("   - Resultado: Cobertura es 0, mantener 100%");
      porcentajeCapital = 100;
    }
  } else {
    console.log("2. MODO MANUAL: Usando valor ingresado por usuario");
    porcentajeCapital = Number(manualPercentage) || 100;
    console.log("   - Porcentaje manual:", `${porcentajeCapital}%`);
  }

  console.log("4. RESULTADO FINAL:");
  console.log("   - %Capital final:", `${porcentajeCapital}%`);
  console.log("=== FIN CÁLCULO %CAPITAL ===");

  // Calcular CAPITAL dinámicamente: Cobertura * %Capital
  const capitalDinamico = cobertura * (porcentajeCapital / 100);

  console.log("=== CÁLCULO DE CAPITAL DINÁMICO ===");
  console.log("1. VALORES:");
  console.log("   - Cobertura:", cobertura);
  console.log("   - %Capital:", `${porcentajeCapital}%`);
  console.log("2. FÓRMULA: Cobertura * (%Capital / 100)");
  console.log(
    "3. CÁLCULO:",
    `${cobertura} * (${porcentajeCapital} / 100) = ${capitalDinamico}`
  );
  console.log("4. RESULTADO FINAL (capitalDinamico):", capitalDinamico);
  console.log("=== FIN CÁLCULO CAPITAL DINÁMICO ===");

  // Actualizar baseCommission con el capital dinámico
  baseCommission = capitalDinamico;

  // Ahora recalcular commissionPerLot con el capital real
  // Fórmula: CAPITAL * (RIESGO / DRAW_DOWN) / PIPS_STOP * COMISION_BROKER / VALOR_PIP_BROKER
  commissionPerLot =
    maxDrawdownValue > 0 && pipsStopValue > 0 && brokerPipValuePerLot > 0
      ? (((baseCommission * (operationRiskValue / maxDrawdownValue)) /
          pipsStopValue) *
          brokerCommissionPerLot) /
        brokerPipValuePerLot
      : 0;

  console.log("=== RECÁLCULO DE COMISIÓN POR LOTE CON CAPITAL REAL ===");
  console.log("1. VALORES ACTUALIZADOS:");
  console.log("   - CAPITAL (baseCommission):", baseCommission);
  console.log("   - RIESGO DE OPERACIÓN:", operationRiskValue);
  console.log("   - DRAW DOWN MÁXIMO:", maxDrawdownValue);
  console.log("   - PIPS STOP:", pipsStopValue);
  console.log("   - COMISIÓN POR LOTE BROKER:", brokerCommissionPerLot);
  console.log("   - VALOR PIP POR LOTE EN BROKER:", brokerPipValuePerLot);
  console.log(
    "2. FÓRMULA: CAPITAL * (RIESGO / DRAW_DOWN) / PIPS_STOP * COMISION_BROKER / VALOR_PIP_BROKER"
  );
  console.log(
    "3. CÁLCULO:",
    `${baseCommission} * (${operationRiskValue} / ${maxDrawdownValue}) / ${pipsStopValue} * ${brokerCommissionPerLot} / ${brokerPipValuePerLot}`
  );
  console.log("4. RESULTADO FINAL (commissionPerLot):", commissionPerLot);
  console.log("=== FIN RECÁLCULO COMISIÓN POR LOTE ===");

  // Ahora recalcular spread con el capital real
  // Fórmula: CAPITAL * (RIESGO / DRAW_DOWN) / PIPS_STOP * SPREAD_BROKER
  spread =
    maxDrawdownValue > 0 && pipsStopValue > 0
      ? ((baseCommission * (operationRiskValue / maxDrawdownValue)) /
          pipsStopValue) *
        brokerSpread
      : 0;

  console.log("=== RECÁLCULO DE SPREAD CON CAPITAL REAL ===");
  console.log("1. VALORES ACTUALIZADOS:");
  console.log("   - CAPITAL (baseCommission):", baseCommission);
  console.log("   - RIESGO DE OPERACIÓN:", operationRiskValue);
  console.log("   - DRAW DOWN MÁXIMO:", maxDrawdownValue);
  console.log("   - PIPS STOP:", pipsStopValue);
  console.log("   - SPREAD BROKER:", brokerSpread);
  console.log(
    "2. FÓRMULA: CAPITAL * (RIESGO / DRAW_DOWN) / PIPS_STOP * SPREAD_BROKER"
  );
  console.log(
    "3. CÁLCULO:",
    `${baseCommission} * (${operationRiskValue} / ${maxDrawdownValue}) / ${pipsStopValue} * ${brokerSpread}`
  );
  console.log("4. RESULTADO FINAL (spread):", spread);
  console.log("=== FIN RECÁLCULO SPREAD ===");

  // Ahora recalcular totalCommission con todos los valores actualizados
  // Fórmula: COMISIÓN POR LOTE + C. LOTE EN FONDEO + SPREAD $
  totalCommission = commissionPerLot + lotInFunding + spread;

  console.log("=== RECÁLCULO DE COMISIÓN TOTAL ===");
  console.log("1. VALORES ACTUALIZADOS:");
  console.log("   - COMISIÓN POR LOTE:", commissionPerLot);
  console.log("   - C. LOTE EN FONDEO:", lotInFunding);
  console.log("   - SPREAD $:", spread);
  console.log("2. FÓRMULA: COMISIÓN POR LOTE + C. LOTE EN FONDEO + SPREAD $");
  console.log(
    "3. CÁLCULO:",
    `${commissionPerLot} + ${lotInFunding} + ${spread}`
  );
  console.log("4. RESULTADO FINAL (totalCommission):", totalCommission);
  console.log("=== FIN RECÁLCULO COMISIÓN TOTAL ===");

  // Ahora recalcular recuperado con los valores actualizados
  // Fórmula: CAPITAL / (DRAW_DOWN * 100) * (%RESTANTE * 100) - (REDONDEAR_MAS((%OBJETIVO * 100) / (RIESGO * 100), 0) * COMISIÓN_TOTAL)
  recuperado =
    (baseCommission / (maxDrawdownValue * 100)) * (porcentajeRestante * 100) -
    factorRedondeado * totalCommission;

  console.log("=== RECÁLCULO DE RECUPERADO ===");
  console.log("1. VALORES ACTUALIZADOS:");
  console.log("   - CAPITAL (baseCommission):", baseCommission);
  console.log("   - DRAW DOWN MÁXIMO:", maxDrawdownValue);
  console.log("   - % RESTANTE:", porcentajeRestante);
  console.log("   - % OBJETIVO:", porcentajeObjetivo);
  console.log("   - RIESGO DE OPERACIÓN:", operationRiskValue);
  console.log("   - FACTOR REDONDEADO:", factorRedondeado);
  console.log("   - COMISIÓN TOTAL:", totalCommission);
  console.log(
    "2. FÓRMULA: CAPITAL / (DRAW_DOWN * 100) * (%RESTANTE * 100) - (FACTOR_REDONDEADO * COMISIÓN_TOTAL)"
  );
  console.log(
    "3. CÁLCULO:",
    `${baseCommission} / (${maxDrawdownValue} * 100) * (${porcentajeRestante} * 100) - (${factorRedondeado} * ${totalCommission})`
  );
  console.log("4. RESULTADO FINAL (recuperado):", recuperado);
  console.log("=== FIN RECÁLCULO RECUPERADO ===");

  // Ahora recalcular calculoTotal con el valor actualizado de recuperado
  // Fórmula: totalBrokerPnL + recuperado
  calculoTotal = totalBrokerPnL + recuperado;

  console.log("=== RECÁLCULO DE CALCULO TOTAL ===");
  console.log("1. VALORES ACTUALIZADOS:");
  console.log("   - totalBrokerPnL:", totalBrokerPnL);
  console.log("   - recuperado:", recuperado);
  console.log("2. FÓRMULA: totalBrokerPnL + recuperado");
  console.log("3. CÁLCULO:", `${totalBrokerPnL} + ${recuperado}`);
  console.log("4. RESULTADO FINAL (calculoTotal):", calculoTotal);
  console.log("=== FIN RECÁLCULO CALCULO TOTAL ===");

  // FÓRMULA OBJETIVO: CAPITAL / (DRAW_DOWN_MÁXIMO * 100) * (%OBJETIVO * 100) + (REDONDEAR_MAS((%OBJETIVO * 100) / (RIESGO_OPERACIÓN * 100), 0) * COMISIÓN_TOTAL)

  // Aplicar fórmula completa para OBJETIVO
  const objetivo =
    (baseCommission / (maxDrawdownValue * 100)) * (porcentajeObjetivo * 100) +
    factorRedondeado * totalCommission;

  return (
    <div className="space-y-4">
      {/* Propfirm Rules Configuration - Compact Layout */}
      {rulesConfig && (
        <div className="space-y-2">
          {/* Main Info Grid - 2 rows */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {/* Propfirm Info */}
            <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
              <div className="bg-orange-50/50 px-2 py-1.5 border-b border-gray-100">
                <div className="text-xs font-medium text-gray-700">
                  Empresa de Fondeo
                </div>
              </div>
              <div className="px-2 py-1.5">
                <div className="text-xs text-gray-800 font-medium">
                  {rulesConfig.propfirm.displayName}
                </div>
                <div className="text-xs text-gray-600">
                  $
                  {Number(
                    connection.propfirmAccount?.currentBalance || 0
                  ).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Broker Info */}
            <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
              <div className="bg-orange-50/50 px-2 py-1.5 border-b border-gray-100">
                <div className="text-xs font-medium text-gray-700">BROKER</div>
              </div>
              <div className="px-2 py-1.5">
                <div className="text-xs text-gray-800 font-medium">
                  {connection.brokerAccount?.broker?.displayName || "N/A"}
                </div>
                <div className="text-xs text-gray-600">
                  $
                  {Number(
                    connection.brokerAccount?.currentBalance || 0
                  ).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
              <div className="bg-blue-50/50 px-2 py-1.5 border-b border-gray-100">
                <div className="text-xs font-medium text-gray-700">Cuenta</div>
              </div>
              <div className="px-2 py-1.5">
                <div className="text-xs text-gray-800 font-medium">
                  {connection.propfirmAccount?.accountName || "N/A"}
                </div>
                <div className="text-xs text-gray-600">
                  {rulesConfig.accountType.displayName}
                </div>
              </div>
            </div>

            {/* Phase Info */}
            <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
              <div className="bg-blue-50/50 px-2 py-1.5 border-b border-gray-100">
                <div className="text-xs font-medium text-gray-700">Fase</div>
              </div>
              <div className="px-2 py-1.5">
                <div className="text-xs text-gray-800 font-medium">
                  {rulesConfig.phase.displayName}
                </div>
                <div className="text-xs text-gray-600">
                  {rulesConfig.profitTarget
                    ? `${Number(rulesConfig.profitTarget)}%`
                    : "N/A"}{" "}
                  objetivo
                </div>
              </div>
            </div>
          </div>

          {/* Risk Parameters - Compact row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
              <div className="bg-green-50/50 px-2 py-1.5 border-b border-gray-100">
                <div className="text-xs font-medium text-gray-700">
                  Draw Down Máximo
                </div>
              </div>
              <div className="px-2 py-1.5">
                <div className="text-xs text-gray-800 font-medium">
                  {Number(rulesConfig.maxDrawdown)}%
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
              <div className="bg-green-50/50 px-2 py-1.5 border-b border-gray-100">
                <div className="text-xs font-medium text-gray-700">
                  Draw Down Diario
                </div>
              </div>
              <div className="px-2 py-1.5">
                <div className="text-xs text-gray-800 font-medium">
                  {Number(rulesConfig.dailyDrawdown)}%
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
              <div className="bg-green-50/50 px-2 py-1.5 border-b border-gray-100">
                <div className="text-xs font-medium text-gray-700">
                  Objetivo
                </div>
              </div>
              <div className="px-2 py-1.5">
                <div className="text-xs text-gray-800 font-medium">
                  {rulesConfig.profitTarget
                    ? `${Number(rulesConfig.profitTarget)}%`
                    : "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State for Rules */}
      {rulesLoading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="border border-gray-300 rounded-md p-2">
              <div className="animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-1" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State for Rules */}
      {rulesError && (
        <div className="border border-red-300 rounded-md p-3 bg-red-50">
          <div className="text-red-600 font-medium text-sm">
            Error cargando reglas de configuración
          </div>
          <div className="text-red-500 text-xs mt-1">{rulesError.message}</div>
        </div>
      )}

      {/* Debug Info */}
      {!rulesConfig && !rulesLoading && !rulesError && (
        <div className="border border-yellow-300 rounded-md p-3 bg-yellow-50">
          <div className="text-yellow-600 font-medium text-sm">
            No se encontraron reglas de configuración
          </div>
          <div className="text-yellow-500 text-xs mt-1">
            PropfirmId: {propfirmId || "N/A"}, AccountTypeId:{" "}
            {connection.propfirmAccount?.accountTypeId || "N/A"}, PhaseId:{" "}
            {connection.propfirmAccount?.currentPhaseId || "N/A"}
          </div>
        </div>
      )}

      {/* Symbol Selector - Compact */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-sm">
            <Settings className="h-4 w-4" />
            <span>Configuración de Trading</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Symbol Selector */}
            <div className="space-y-1">
              <label
                htmlFor="symbol-select"
                className="text-xs font-medium text-gray-700"
              >
                Seleccionar Símbolo Forex
              </label>
              <Select
                value={selectedSymbolId}
                onValueChange={setSelectedSymbolId}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Selecciona un símbolo forex" />
                </SelectTrigger>
                <SelectContent>
                  {allSymbols.map((symbol: SymbolData) => (
                    <SelectItem key={symbol.symbolId} value={symbol.symbolId}>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {symbol.symbol}
                        </span>
                        <span className="text-xs text-gray-500">
                          {symbol.displayName}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pips Stop Input */}
            <div className="space-y-1">
              <label
                htmlFor="pips-stop"
                className="text-xs font-medium text-gray-700"
              >
                Pips Stop
              </label>
              <Input
                id="pips-stop"
                type="number"
                value={pipsStop}
                onChange={(e) => setPipsStop(e.target.value)}
                placeholder="0"
                className="h-8 text-xs"
              />
            </div>

            {/* Operation Risk Input */}
            <div className="space-y-1">
              <label
                htmlFor="operation-risk"
                className="text-xs font-medium text-gray-700"
              >
                Riesgo de Operación (%)
              </label>
              <Input
                id="operation-risk"
                type="number"
                step="0.01"
                value={operationRisk}
                onChange={(e) => setOperationRisk(e.target.value)}
                placeholder="0.00"
                className="h-8 text-xs"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {allSymbols.length} símbolos de Forex disponibles
          </p>
        </CardContent>
      </Card>

      {/* Symbol Configurations - Combined */}
      {selectedSymbolId && (propfirmId || brokerId) && (
        <div className="space-y-3">
          {/* Combined Configurations */}
          {(propfirmConfigs.length > 0 || brokerConfigs.length > 0) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center space-x-2 text-sm">
                  <Settings className="h-4 w-4 text-gray-600" />
                  <span>Configuraciones de Símbolos</span>
                  <Badge variant="outline" className="text-xs">
                    {propfirmConfigs.length + brokerConfigs.length}{" "}
                    configuraciones
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Propfirm Configurations */}
                  {propfirmConfigs.map((config: SymbolConfig) => (
                    <div
                      key={`propfirm-${config.id}`}
                      className="border border-blue-200 rounded-md p-3 bg-blue-50/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-800">
                          {config.symbol.symbol}
                        </h4>
                        <div className="flex items-center space-x-1">
                          <Badge
                            variant="outline"
                            className="text-xs bg-blue-100 text-blue-700"
                          >
                            Propfirm
                          </Badge>
                          <Badge
                            variant={
                              config.isAvailable ? "default" : "secondary"
                            }
                            className="text-xs"
                          >
                            {config.isAvailable
                              ? "Disponible"
                              : "No disponible"}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        {config.symbol.displayName}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-3 w-3 text-green-600" />
                          <span className="text-gray-600">
                            Valor pip por lote (Propfirm):
                          </span>
                        </div>
                        <span className="font-medium text-gray-800">
                          ${Number(config.pipValuePerLot).toFixed(4)}
                        </span>

                        <div className="flex items-center space-x-1">
                          <span className="text-gray-600">Pip Ticks:</span>
                        </div>
                        <span className="font-medium text-gray-800">
                          {config.pipTicks}
                        </span>

                        {config.commissionPerLot && (
                          <>
                            <div className="flex items-center space-x-1">
                              <span className="text-gray-600">
                                Comisión/Lote:
                              </span>
                            </div>
                            <span className="font-medium text-gray-800">
                              ${Number(config.commissionPerLot).toFixed(4)}
                            </span>
                          </>
                        )}

                        {config.spreadTypical && (
                          <>
                            <div className="flex items-center space-x-1">
                              <span className="text-gray-600">
                                Spread Típico:
                              </span>
                            </div>
                            <span className="font-medium text-gray-800">
                              {Number(config.spreadTypical).toFixed(2)} pips
                            </span>
                          </>
                        )}

                        {config.spreadTypical && (
                          <>
                            <div className="flex items-center space-x-1">
                              <span className="text-gray-600">
                                Spread Típico:
                              </span>
                            </div>
                            <span className="font-medium text-gray-800">
                              {Number(config.spreadTypical).toFixed(2)} pips
                            </span>
                          </>
                        )}

                        <div className="flex items-center space-x-1">
                          <span className="text-gray-600">Disponible:</span>
                        </div>
                        <span
                          className={`font-medium ${config.isAvailable ? "text-green-600" : "text-red-600"}`}
                        >
                          {config.isAvailable ? "Sí" : "No"}
                        </span>
                      </div>

                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="text-xs text-gray-500">
                          <div className="flex justify-between">
                            <span>Categoría: {config.symbol.category}</span>
                            <span>
                              {config.symbol.baseCurrency}/
                              {config.symbol.quoteCurrency}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>
                              Decimal: {config.symbol.pipDecimalPosition}
                            </span>
                            <span>ID: {config.id.slice(-8)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Broker Configurations */}
                  {brokerConfigs.map((config: SymbolConfig) => (
                    <div
                      key={`broker-${config.id}`}
                      className="border border-green-200 rounded-md p-3 bg-green-50/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-800">
                          {config.symbol.symbol}
                        </h4>
                        <div className="flex items-center space-x-1">
                          <Badge
                            variant="outline"
                            className="text-xs bg-green-100 text-green-700"
                          >
                            Broker
                          </Badge>
                          <Badge
                            variant={
                              config.isAvailable ? "default" : "secondary"
                            }
                            className="text-xs"
                          >
                            {config.isAvailable
                              ? "Disponible"
                              : "No disponible"}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        {config.symbol.displayName}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-3 w-3 text-green-600" />
                          <span className="text-gray-600">
                            Valor pip por lote (Broker):
                          </span>
                        </div>
                        <span className="font-medium text-gray-800">
                          ${Number(config.pipValuePerLot).toFixed(4)}
                        </span>

                        <div className="flex items-center space-x-1">
                          <span className="text-gray-600">Pip Ticks:</span>
                        </div>
                        <span className="font-medium text-gray-800">
                          {config.pipTicks}
                        </span>

                        {config.commissionPerLot && (
                          <>
                            <div className="flex items-center space-x-1">
                              <span className="text-gray-600">
                                Comisión/Lote:
                              </span>
                            </div>
                            <span className="font-medium text-gray-800">
                              ${Number(config.commissionPerLot).toFixed(4)}
                            </span>
                          </>
                        )}

                        {config.spreadTypical && (
                          <>
                            <div className="flex items-center space-x-1">
                              <span className="text-gray-600">
                                Spread Típico:
                              </span>
                            </div>
                            <span className="font-medium text-gray-800">
                              {Number(config.spreadTypical).toFixed(2)} pips
                            </span>
                          </>
                        )}

                        {config.spreadTypical && (
                          <>
                            <div className="flex items-center space-x-1">
                              <span className="text-gray-600">
                                Spread Típico:
                              </span>
                            </div>
                            <span className="font-medium text-gray-800">
                              {Number(config.spreadTypical).toFixed(2)} pips
                            </span>
                          </>
                        )}

                        <div className="flex items-center space-x-1">
                          <span className="text-gray-600">Disponible:</span>
                        </div>
                        <span
                          className={`font-medium ${config.isAvailable ? "text-green-600" : "text-red-600"}`}
                        >
                          {config.isAvailable ? "Sí" : "No"}
                        </span>
                      </div>

                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="text-xs text-gray-500">
                          <div className="flex justify-between">
                            <span>Categoría: {config.symbol.category}</span>
                            <span>
                              {config.symbol.baseCurrency}/
                              {config.symbol.quoteCurrency}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>
                              Decimal: {config.symbol.pipDecimalPosition}
                            </span>
                            <span>ID: {config.id.slice(-8)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {configsLoading && (
            <Card>
              <CardContent className="py-4">
                <div className="text-center text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2" />
                  <p className="text-sm">Cargando configuraciones...</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Trading Calculation Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-sm">
            <Calculator className="h-4 w-4" />
            <span>Cálculos de Trading</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-2 py-1.5 text-xs font-medium text-gray-700 text-center">
                    Cobertura
                  </th>
                  <th className="border border-gray-300 px-2 py-1.5 text-xs font-medium text-gray-700 text-center">
                    CAPITAL
                  </th>
                  <th className="border border-gray-300 px-2 py-1.5 text-xs font-medium text-gray-700 text-center">
                    % DE OPERACIÓN
                  </th>
                  <th className="border border-gray-300 px-2 py-1.5 text-xs font-medium text-gray-700 text-center">
                    CAPITAL FTMO
                  </th>
                  <th className="border border-gray-300 px-2 py-1.5 text-xs font-medium text-gray-700 text-center">
                    % Restante
                  </th>
                  <th className="border border-gray-300 px-2 py-1.5 text-xs font-medium text-gray-700 text-center">
                    % objetivo
                  </th>
                  <th className="border border-gray-300 px-2 py-1.5 text-xs font-medium text-gray-700 text-center">
                    PIPS POR OPERACIÓN
                  </th>
                  <th className="border border-gray-300 px-2 py-1.5 text-xs font-medium text-gray-700 text-center">
                    COMISIÓN POR LOTE
                  </th>
                  <th className="border border-gray-300 px-2 py-1.5 text-xs font-medium text-gray-700 text-center">
                    C. LOTE EN FONDEO
                  </th>
                  <th className="border border-gray-300 px-2 py-1.5 text-xs font-medium text-gray-700 text-center">
                    SPREAD $
                  </th>
                  <th className="border border-gray-300 px-2 py-1.5 text-xs font-medium text-gray-700 text-center">
                    COMISION TOTAL
                  </th>
                  <th className="border border-gray-300 px-2 py-1.5 text-xs font-medium text-gray-700 text-center">
                    RECUPERADO
                  </th>
                  <th className="border border-gray-300 px-2 py-1.5 text-xs font-medium text-gray-700 text-center">
                    OBJETIVO
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-blue-500 px-2 py-1.5 text-xs text-blue-600 text-center bg-blue-50">
                    $
                    {connection.propfirmAccount?.accountCost
                      ? Number(
                          connection.propfirmAccount.accountCost
                        ).toLocaleString()
                      : "N/A"}
                  </td>
                  <td className="border border-purple-500 px-2 py-1.5 text-xs text-purple-600 text-center bg-purple-50">
                    ${capitalDinamico.toFixed(5)}
                  </td>
                  <td className="border border-green-500 px-2 py-1.5 text-xs text-green-600 text-center bg-green-50">
                    {operationRisk ? `${Number(operationRisk)}%` : "0.00%"}
                  </td>
                  <td className="border border-red-500 px-2 py-1.5 text-xs text-red-600 text-center bg-red-50">
                    ${totalPropfirmPnL.toFixed(5)}
                  </td>
                  <td className="border border-yellow-500 px-2 py-1.5 text-xs text-yellow-600 text-center bg-yellow-50">
                    {remainingPercentage.toFixed(5)}%
                  </td>
                  <td className="border border-orange-500 px-2 py-1.5 text-xs text-orange-600 text-center bg-orange-50">
                    {targetPercentage.toFixed(5)}%
                  </td>
                  <td className="border border-teal-500 px-2 py-1.5 text-xs text-teal-600 text-center bg-teal-50">
                    {pipsStop || "0"}
                  </td>
                  <td className="border border-indigo-500 px-2 py-1.5 text-xs text-indigo-600 text-center bg-indigo-50">
                    ${commissionPerLot.toFixed(5)}
                  </td>
                  <td className="border border-pink-500 px-2 py-1.5 text-xs text-pink-600 text-center bg-pink-50">
                    ${lotInFunding.toFixed(5)}
                  </td>
                  <td className="border border-cyan-500 px-2 py-1.5 text-xs text-cyan-600 text-center bg-cyan-50">
                    ${spread.toFixed(5)}
                  </td>
                  <td className="border border-lime-500 px-2 py-1.5 text-xs text-lime-600 text-center bg-lime-50">
                    ${totalCommission.toFixed(5)}
                  </td>
                  <td className="border border-emerald-500 px-2 py-1.5 text-xs text-emerald-600 text-center bg-emerald-50">
                    ${recuperado.toFixed(5)}
                  </td>
                  <td className="border border-rose-500 px-2 py-1.5 text-xs text-rose-600 text-center bg-rose-50">
                    ${objetivo.toFixed(5)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de Cálculo - Tabla pequeña */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Resumen de Cálculo</CardTitle>
            {/* %Capital Switch */}
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-600">%Capital:</span>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="auto-percentage"
                  name="percentage-mode"
                  checked={isAutoPercentage}
                  onChange={() => setIsAutoPercentage(true)}
                  className="h-3 w-3 text-blue-600"
                />
                <label
                  htmlFor="auto-percentage"
                  className="text-xs text-gray-600"
                >
                  Auto
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="manual-percentage"
                  name="percentage-mode"
                  checked={!isAutoPercentage}
                  onChange={() => setIsAutoPercentage(false)}
                  className="h-3 w-3 text-blue-600"
                />
                <label
                  htmlFor="manual-percentage"
                  className="text-xs text-gray-600"
                >
                  Manual
                </label>
              </div>
              {!isAutoPercentage && (
                <Input
                  type="number"
                  step="0.01"
                  value={manualPercentage}
                  onChange={(e) => setManualPercentage(e.target.value)}
                  placeholder="100.00"
                  className="h-6 w-16 text-xs"
                />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="py-3">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-2 py-1.5 text-xs font-medium text-gray-700 text-center">
                    Calculo
                  </th>
                  <th className="border border-gray-300 px-2 py-1.5 text-xs font-medium text-gray-700 text-center">
                    %capital
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-violet-500 px-2 py-1.5 text-xs text-violet-600 text-center bg-violet-50">
                    ${calculoTotal.toFixed(5)}
                  </td>
                  <td className="border border-amber-500 px-2 py-1.5 text-xs text-amber-600 text-center bg-amber-50">
                    {porcentajeCapital}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Explicación de Cálculos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-sm">
            <Calculator className="h-4 w-4" />
            <span>Explicación de Cálculos</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tabla Principal */}
            <div>
              <h3 className="font-semibold text-sm mb-2 text-blue-600">
                📊 Tabla Principal - Cálculos de Trading
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-50 border border-blue-500 rounded" />
                  <span>
                    <strong>Cobertura</strong> -{" "}
                    <code>connection.propfirmAccount.accountCost</code>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-purple-50 border border-purple-500 rounded" />
                  <span>
                    <strong>CAPITAL</strong> - <code>capitalDinamico</code> =
                    Cobertura × %Capital
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-50 border border-green-500 rounded" />
                  <span>
                    <strong>Riesgo</strong> - <code>operationRisk</code> = %
                    Riesgo de Operación
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-50 border border-red-500 rounded" />
                  <span>
                    <strong>CAPITAL FTMO</strong> -{" "}
                    <code>totalPropfirmPnL</code> = beneficio + comisión + swap
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-50 border border-yellow-500 rounded" />
                  <span>
                    <strong>% Restante</strong> -{" "}
                    <code>remainingPercentage</code> = % Drawdown restante
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-orange-50 border border-orange-500 rounded" />
                  <span>
                    <strong>% Objetivo</strong> - <code>targetPercentage</code>{" "}
                    = % Objetivo de ganancia
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-teal-50 border border-teal-500 rounded" />
                  <span>
                    <strong>Pips Stop</strong> - <code>pipsStop</code> = Pips de
                    stop loss
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-indigo-50 border border-indigo-500 rounded" />
                  <span>
                    <strong>COMISIÓN POR LOTE</strong> -{" "}
                    <code>commissionPerLot</code>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-pink-50 border border-pink-500 rounded" />
                  <span>
                    <strong>C. LOTE EN FONDEO</strong> -{" "}
                    <code>lotInFunding</code>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-cyan-50 border border-cyan-500 rounded" />
                  <span>
                    <strong>SPREAD $</strong> - <code>spread</code>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-lime-50 border border-lime-500 rounded" />
                  <span>
                    <strong>COMISIÓN TOTAL</strong> -{" "}
                    <code>totalCommission</code>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-emerald-50 border border-emerald-500 rounded" />
                  <span>
                    <strong>RECUPERADO</strong> - <code>recuperado</code>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-rose-50 border border-rose-500 rounded" />
                  <span>
                    <strong>OBJETIVO</strong> - <code>objetivo</code>
                  </span>
                </div>
              </div>
            </div>

            {/* Tabla de Resumen */}
            <div>
              <h3 className="font-semibold text-sm mb-2 text-purple-600">
                📋 Tabla de Resumen
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-violet-50 border border-violet-500 rounded" />
                  <span>
                    <strong>Calculo</strong> - <code>calculoTotal</code> =
                    totalBrokerPnL + recuperado
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-amber-50 border border-amber-500 rounded" />
                  <span>
                    <strong>%capital</strong> - <code>porcentajeCapital</code> =
                    (Cobertura / Calculo) × 100
                  </span>
                </div>
              </div>

              <h3 className="font-semibold text-sm mb-2 mt-4 text-green-600">
                🔢 Fórmulas Detalladas
              </h3>
              <div className="space-y-2 text-xs bg-gray-50 p-3 rounded">
                <div>
                  <strong>COMISIÓN POR LOTE:</strong>
                  <br />
                  <code>
                    CAPITAL × (RIESGO ÷ DRAW_DOWN) ÷ PIPS_STOP × COMISIÓN_BROKER
                    ÷ VALOR_PIP_BROKER
                  </code>
                </div>
                <div>
                  <strong>C. LOTE EN FONDEO:</strong>
                  <br />
                  <code>
                    (BALANCE_INICIAL × RIESGO% ÷ PIPS_STOP × COMISIÓN_FONDEO ÷
                    VALOR_PIP_FONDEO) × CAPITAL ÷ (BALANCE_INICIAL × DRAW_DOWN)
                  </code>
                </div>
                <div>
                  <strong>SPREAD $:</strong>
                  <br />
                  <code>
                    CAPITAL × (RIESGO ÷ DRAW_DOWN) ÷ PIPS_STOP × SPREAD_BROKER
                  </code>
                </div>
                <div>
                  <strong>COMISIÓN TOTAL:</strong>
                  <br />
                  <code>COMISIÓN_POR_LOTE + C_LOTE_EN_FONDEO + SPREAD</code>
                </div>
                <div>
                  <strong>RECUPERADO:</strong>
                  <br />
                  <code>
                    CAPITAL ÷ (DRAW_DOWN × 100) × (%RESTANTE × 100) -
                    (REDONDEAR_MAS((%OBJETIVO × 100) ÷ (RIESGO × 100), 0) ×
                    COMISIÓN_TOTAL)
                  </code>
                </div>
                <div>
                  <strong>OBJETIVO:</strong>
                  <br />
                  <code>
                    CAPITAL ÷ (DRAW_DOWN × 100) × (%OBJETIVO × 100) +
                    (REDONDEAR_MAS((%OBJETIVO × 100) ÷ (RIESGO × 100), 0) ×
                    COMISIÓN_TOTAL)
                  </code>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-sm mb-2 text-blue-600">
              🔄 Flujo de Cálculos
            </h3>
            <div className="text-xs space-y-1">
              <div>
                1. <span className="bg-blue-100 px-1 rounded">Cobertura</span> →{" "}
                <span className="bg-amber-100 px-1 rounded">%capital</span> →{" "}
                <span className="bg-purple-100 px-1 rounded">CAPITAL</span>
              </div>
              <div>
                2. <span className="bg-purple-100 px-1 rounded">CAPITAL</span> +{" "}
                <span className="bg-green-100 px-1 rounded">Riesgo</span> +{" "}
                <span className="bg-teal-100 px-1 rounded">Pips Stop</span> →{" "}
                <span className="bg-indigo-100 px-1 rounded">
                  COMISIÓN POR LOTE
                </span>
              </div>
              <div>
                3. <span className="bg-indigo-100 px-1 rounded">COMISIÓN</span>{" "}
                + <span className="bg-pink-100 px-1 rounded">C. LOTE</span> +{" "}
                <span className="bg-cyan-100 px-1 rounded">SPREAD</span> →{" "}
                <span className="bg-lime-100 px-1 rounded">COMISIÓN TOTAL</span>
              </div>
              <div>
                4. <span className="bg-purple-100 px-1 rounded">CAPITAL</span> +{" "}
                <span className="bg-yellow-100 px-1 rounded">%Restante</span> +{" "}
                <span className="bg-lime-100 px-1 rounded">COMISIÓN TOTAL</span>{" "}
                →{" "}
                <span className="bg-emerald-100 px-1 rounded">RECUPERADO</span>
              </div>
              <div>
                5. <span className="bg-red-100 px-1 rounded">CAPITAL FTMO</span>{" "}
                +{" "}
                <span className="bg-emerald-100 px-1 rounded">RECUPERADO</span>{" "}
                → <span className="bg-violet-100 px-1 rounded">Calculo</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operations Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-sm">
            <TrendingUp className="h-4 w-4" />
            <span>Operaciones</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-2 py-1.5 text-xs font-medium text-gray-700 text-center">
                    N° de Operación
                  </th>
                  <th className="border border-gray-300 px-2 py-1.5 text-xs font-medium text-gray-700 text-center">
                    P&L FTMO
                  </th>
                  <th className="border border-gray-300 px-2 py-1.5 text-xs font-medium text-gray-700 text-center">
                    P&L BROKER
                  </th>
                  <th className="border border-gray-300 px-2 py-1.5 text-xs font-medium text-gray-700 text-center">
                    CÓDIGO OPERATIVA
                  </th>
                </tr>
              </thead>
              <tbody>
                {propfirmTrades.length > 0 ? (
                  propfirmTrades
                    .slice(0, 10)
                    .map((trade: Trade, index: number) => {
                      // Find corresponding broker trade (if any)
                      const correspondingBrokerTrade = brokerTrades.find(
                        (bt: Trade) =>
                          bt.symbol.id === trade.symbol.id &&
                          Math.abs(
                            new Date(bt.createdAt || 0).getTime() -
                              new Date(trade.createdAt || 0).getTime()
                          ) < 60000 // Within 1 minute
                      );

                      return (
                        <tr key={trade.id}>
                          <td className="border border-gray-300 px-2 py-1.5 text-xs text-gray-800 text-center">
                            {index + 1}
                          </td>
                          <td className="border border-gray-300 px-2 py-1.5 text-xs text-gray-800 text-center">
                            ${Number(trade.netProfit || 0).toFixed(2)}
                          </td>
                          <td className="border border-gray-300 px-2 py-1.5 text-xs text-gray-800 text-center">
                            $
                            {Number(
                              correspondingBrokerTrade?.netProfit || 0
                            ).toFixed(2)}
                          </td>
                          <td className="border border-gray-300 px-2 py-1.5 text-xs text-gray-800 text-center">
                            {correspondingBrokerTrade?.id || "-"}
                          </td>
                        </tr>
                      );
                    })
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="border border-gray-300 px-2 py-4 text-xs text-gray-500 text-center"
                    >
                      No hay operaciones disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
