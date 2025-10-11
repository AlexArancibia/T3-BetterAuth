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

  // Extract propfirm and broker IDs from connection
  const propfirmId = connection.propfirmAccount?.propfirmId;
  const brokerId = connection.brokerAccount?.brokerId;

  // Debug: Log connection data
  console.log("TradingCalculator - Connection data:", {
    propfirmId,
    accountTypeId: connection.propfirmAccount?.accountTypeId,
    currentPhaseId: connection.propfirmAccount?.currentPhaseId,
    propfirmAccount: connection.propfirmAccount,
  });

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

  // Debug: Log rules config data
  console.log("TradingCalculator - Rules config:", {
    rulesConfig,
    rulesLoading,
    rulesError,
  });

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
  ].reduce((acc: SymbolData[], config: any) => {
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
        (config: any) => config.symbolId === selectedSymbolId
      )
    : [];

  const brokerConfigs = selectedSymbolId
    ? allBrokerConfigs.filter(
        (config: any) => config.symbolId === selectedSymbolId
      )
    : [];

  // Get real trades from connection
  const propfirmTrades = connection.propfirmAccount?.trades || [];
  const brokerTrades = connection.brokerAccount?.trades || [];

  // Calculate total P&L for FTMO
  const totalPropfirmPnL = propfirmTrades.reduce(
    (sum: number, trade: Trade) => sum + Number(trade.netProfit || 0),
    0
  );

  // Calculate % Restante: (CAPITAL FTMO / Valor de la cuenta) + Draw Down Máximo
  const accountValue = Number(connection.propfirmAccount?.currentBalance || 0);
  const maxDrawdown = rulesConfig ? Number(rulesConfig.maxDrawdown) : 0;
  const remainingPercentage =
    accountValue > 0
      ? (totalPropfirmPnL / accountValue) * 100 + maxDrawdown
      : 0;

  // Calculate % objetivo: Objetivo - (CAPITAL FTMO / Valor del tipo de cuenta)
  const profitTarget = rulesConfig ? Number(rulesConfig.profitTarget) : 0;
  const targetPercentage =
    profitTarget - (totalPropfirmPnL / accountValue) * 100;

  // Get symbol configuration for calculations (use first available config)
  const selectedSymbolConfig = selectedSymbolId
    ? [...propfirmConfigs, ...brokerConfigs].find(
        (config) => config.symbolId === selectedSymbolId
      )
    : null;

  // Calculate commission values
  const commissionPerLot = selectedSymbolConfig
    ? Number(selectedSymbolConfig.commissionPerLot || 0)
    : 0;
  const lotInFunding = selectedSymbolConfig
    ? Number(selectedSymbolConfig.pipValuePerLot || 0)
    : 0;
  const spread = selectedSymbolConfig
    ? Number(selectedSymbolConfig.spreadTypical || 0)
    : 0;
  const totalCommission = commissionPerLot + lotInFunding + spread;

  // Calculate RECUPERADO and OBJETIVO using the formulas from the image
  const capital = Number(connection.propfirmAccount?.currentBalance || 0);
  const pips = Number(pipsStop || 0);
  const operationPercentage = Number(operationRisk || 0);
  const lotSize = 1; // Assuming standard lot size, could be made configurable

  // RECUPERADO Formula: (((CAPITAL + (PIPS × 100))) × (% DE OPERACIÓN × 100)) - (ROUNDUP((COMISIÓN TOTAL × 100), 0) × LOTE_SIZE)
  const recuperado =
    (capital + pips * 100) * (operationPercentage / 100) -
    Math.ceil(totalCommission * 100) * lotSize;

  // OBJETIVO Formula: (((CAPITAL + (PIPS × 100))) × (% DE OPERACIÓN × 100)) + (ROUNDUP((COMISIÓN TOTAL × 100), 0) × LOTE_SIZE)
  const objetivo =
    (capital + pips * 100) * (operationPercentage / 100) +
    Math.ceil(totalCommission * 100) * lotSize;

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

      {/* Symbol Configurations - Compact */}
      {selectedSymbolId && (propfirmId || brokerId) && (
        <div className="space-y-3">
          {/* Propfirm Configurations */}
          {propfirmConfigs.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center space-x-2 text-sm">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <span>Configuraciones Propfirm</span>
                  <Badge variant="outline" className="text-xs">
                    {propfirmConfigs.length} símbolos
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {propfirmConfigs.map((config: any) => (
                    <div
                      key={`propfirm-${config.id}`}
                      className="border border-blue-200 rounded-md p-3 bg-blue-50/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-800">
                          {config.symbol.symbol}
                        </h4>
                        <Badge
                          variant={config.isAvailable ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {config.isAvailable ? "Disponible" : "No disponible"}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        {config.symbol.displayName}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-3 w-3 text-green-600" />
                          <span className="text-gray-600">Pip Value:</span>
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
                              <span className="text-gray-600">Comisión:</span>
                            </div>
                            <span className="font-medium text-gray-800">
                              ${Number(config.commissionPerLot).toFixed(4)}
                            </span>
                          </>
                        )}

                        {config.spreadTypical && (
                          <>
                            <div className="flex items-center space-x-1">
                              <span className="text-gray-600">Spread:</span>
                            </div>
                            <span className="font-medium text-gray-800">
                              {Number(config.spreadTypical).toFixed(2)} pips
                            </span>
                          </>
                        )}
                      </div>

                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="text-xs text-gray-500">
                          <div>
                            {config.symbol.baseCurrency}/
                            {config.symbol.quoteCurrency}
                          </div>
                          <div>Decimal: {config.symbol.pipDecimalPosition}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Broker Configurations */}
          {brokerConfigs.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center space-x-2 text-sm">
                  <Globe className="h-4 w-4 text-green-600" />
                  <span>Configuraciones Broker</span>
                  <Badge variant="outline" className="text-xs">
                    {brokerConfigs.length} símbolos
                  </Badge>
                </CardTitle>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>Empresa:</span>
                  <Badge variant="outline">
                    {connection.brokerAccount?.broker?.displayName}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {brokerConfigs.map((config: any) => (
                    <div
                      key={`broker-${config.id}`}
                      className="border border-green-200 rounded-md p-3 bg-green-50/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-800">
                          {config.symbol.symbol}
                        </h4>
                        <Badge
                          variant={config.isAvailable ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {config.isAvailable ? "Disponible" : "No disponible"}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        {config.symbol.displayName}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-3 w-3 text-green-600" />
                          <span className="text-gray-600">Pip Value:</span>
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
                              <span className="text-gray-600">Comisión:</span>
                            </div>
                            <span className="font-medium text-gray-800">
                              ${Number(config.commissionPerLot).toFixed(4)}
                            </span>
                          </>
                        )}

                        {config.spreadTypical && (
                          <>
                            <div className="flex items-center space-x-1">
                              <span className="text-gray-600">Spread:</span>
                            </div>
                            <span className="font-medium text-gray-800">
                              {Number(config.spreadTypical).toFixed(2)} pips
                            </span>
                          </>
                        )}
                      </div>

                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="text-xs text-gray-500">
                          <div>
                            {config.symbol.baseCurrency}/
                            {config.symbol.quoteCurrency}
                          </div>
                          <div>Decimal: {config.symbol.pipDecimalPosition}</div>
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
                  <td className="border border-gray-300 px-2 py-1.5 text-xs text-gray-800 text-center">
                    $
                    {Number(
                      connection.brokerAccount?.currentBalance || 0
                    ).toLocaleString()}
                  </td>
                  <td className="border border-gray-300 px-2 py-1.5 text-xs text-gray-800 text-center">
                    USD 0.00
                  </td>
                  <td className="border border-gray-300 px-2 py-1.5 text-xs text-gray-800 text-center">
                    {operationRisk ? `${Number(operationRisk)}%` : "0.00%"}
                  </td>
                  <td className="border border-gray-300 px-2 py-1.5 text-xs text-gray-800 text-center">
                    ${totalPropfirmPnL.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-2 py-1.5 text-xs text-gray-800 text-center">
                    {remainingPercentage.toFixed(2)}%
                  </td>
                  <td className="border border-gray-300 px-2 py-1.5 text-xs text-gray-800 text-center">
                    {targetPercentage.toFixed(2)}%
                  </td>
                  <td className="border border-gray-300 px-2 py-1.5 text-xs text-gray-800 text-center">
                    {pipsStop || "0"}
                  </td>
                  <td className="border border-gray-300 px-2 py-1.5 text-xs text-gray-800 text-center">
                    ${commissionPerLot.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-2 py-1.5 text-xs text-gray-800 text-center">
                    ${lotInFunding.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-2 py-1.5 text-xs text-gray-800 text-center">
                    ${spread.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-2 py-1.5 text-xs text-gray-800 text-center">
                    ${totalCommission.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-2 py-1.5 text-xs text-gray-800 text-center">
                    ${recuperado.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-2 py-1.5 text-xs text-gray-800 text-center">
                    ${objetivo.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
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
