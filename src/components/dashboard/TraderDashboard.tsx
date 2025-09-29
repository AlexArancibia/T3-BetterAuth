"use client";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  DollarSign,
  FileText,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface TraderDashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
  } | null;
}

export default function TraderDashboard({ user }: TraderDashboardProps) {
  const router = useRouter();

  const traderStats = {
    totalTrades: 45,
    winningTrades: 32,
    losingTrades: 13,
    winRate: 71.1,
    totalProfit: 12500,
    dailyPnL: 450,
    openPositions: 8,
    maxDrawdown: 5.2,
  };

  const recentTrades = [
    {
      id: 1,
      symbol: "EUR/USD",
      type: "BUY",
      lotSize: 0.5,
      entryPrice: 1.085,
      currentPrice: 1.0875,
      pnl: 125.0,
      status: "open",
      time: "Hace 2 horas",
    },
    {
      id: 2,
      symbol: "GBP/USD",
      type: "SELL",
      lotSize: 0.3,
      entryPrice: 1.265,
      currentPrice: 1.262,
      pnl: 90.0,
      status: "open",
      time: "Hace 4 horas",
    },
    {
      id: 3,
      symbol: "USD/JPY",
      type: "BUY",
      lotSize: 0.2,
      entryPrice: 149.5,
      currentPrice: 149.8,
      pnl: 60.0,
      status: "closed",
      time: "Hace 6 horas",
    },
    {
      id: 4,
      symbol: "AUD/USD",
      type: "SELL",
      lotSize: 0.4,
      entryPrice: 0.652,
      currentPrice: 0.65,
      pnl: 80.0,
      status: "closed",
      time: "Ayer",
    },
  ];

  const tradingActions = [
    {
      title: "Nuevo Trade",
      description: "Abrir nueva posición",
      icon: <Target className="h-6 w-6" />,
      color: "bg-green-500",
      href: "/trading/new-trade",
    },
    {
      title: "Mis Cuentas",
      description: "Gestionar cuentas de trading",
      icon: <FileText className="h-6 w-6" />,
      color: "bg-blue-500",
      href: "/trading/accounts",
    },
    {
      title: "Análisis",
      description: "Herramientas de análisis",
      icon: <BarChart3 className="h-6 w-6" />,
      color: "bg-purple-500",
      href: "/trading/analysis",
    },
    {
      title: "Historial",
      description: "Ver trades anteriores",
      icon: <Activity className="h-6 w-6" />,
      color: "bg-orange-500",
      href: "/trading/history",
    },
  ];

  const performanceMetrics = [
    {
      label: "Tasa de Ganancia",
      value: `${traderStats.winRate}%`,
      change: "+2.1%",
      trend: "up",
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      label: "Drawdown Máximo",
      value: `${traderStats.maxDrawdown}%`,
      change: "-0.3%",
      trend: "down",
      icon: <TrendingDown className="h-4 w-4" />,
    },
    {
      label: "P&L Diario",
      value: `$${traderStats.dailyPnL}`,
      change: "+$120",
      trend: "up",
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      label: "Posiciones Abiertas",
      value: traderStats.openPositions,
      change: "+2",
      trend: "up",
      icon: <Target className="h-4 w-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Trader Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Dashboard de Trading</h1>
                <p className="text-green-100 mt-1">
                  Bienvenido, {user?.name || "Trader"}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-8 w-8 text-green-200" />
                <span className="text-sm font-medium">Trader</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Trading Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">P&L Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${traderStats.totalProfit.toLocaleString()}
                </p>
                <p className="text-xs text-green-600">
                  +${traderStats.dailyPnL} hoy
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Trades Totales
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {traderStats.totalTrades}
                </p>
                <p className="text-xs text-blue-600">
                  {traderStats.openPositions} abiertos
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Tasa de Ganancia
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {traderStats.winRate}%
                </p>
                <p className="text-xs text-green-600">
                  {traderStats.winningTrades} ganadores
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Drawdown</p>
                <p className="text-2xl font-bold text-gray-900">
                  {traderStats.maxDrawdown}%
                </p>
                <p className="text-xs text-orange-600">Máximo histórico</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {performanceMetrics.map((metric) => (
            <div
              key={metric.label}
              className="bg-white rounded-lg shadow-sm p-4 border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {metric.label}
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {metric.value}
                  </p>
                </div>
                <div
                  className={`flex items-center text-sm ${
                    metric.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {metric.icon}
                  <span className="ml-1">{metric.change}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trading Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Acciones de Trading
              </h3>
              <div className="space-y-3">
                {tradingActions.map((action) => (
                  <button
                    key={action.href}
                    type="button"
                    onClick={() => router.push(action.href)}
                    className="w-full flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className={`p-2 ${action.color} rounded-lg text-white mr-3`}
                    >
                      {action.icon}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">
                        {action.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        {action.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Trades */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Trades Recientes
              </h3>
              <div className="space-y-4">
                {recentTrades.map((trade) => (
                  <div
                    key={trade.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          trade.type === "BUY"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {trade.type}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {trade.symbol}
                        </p>
                        <p className="text-sm text-gray-600">
                          {trade.lotSize} lotes @ {trade.entryPrice}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-medium ${
                          trade.pnl >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        ${trade.pnl.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">{trade.time}</p>
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        trade.status === "open"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {trade.status === "open" ? "Abierto" : "Cerrado"}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Ver todos los trades
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Trading Status */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Estado de Trading
                  </h3>
                  <p className="text-sm text-gray-600">
                    Cuenta activa y lista para trading
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Última actividad</p>
                <p className="text-sm font-medium text-gray-900">
                  Hace 2 horas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
