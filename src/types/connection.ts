/**
 * Types for connection-related components and data
 */

export interface TradingAccount {
  id: string;
  accountName: string;
  accountType: string;
  propfirm?: {
    displayName: string;
  } | null;
  broker?: {
    displayName: string;
  } | null;
  currentBalance?: number | string;
  accountCost?: number | string | null;
  trades?: Trade[];
}

export interface Trade {
  id: string;
  symbol: {
    symbol: string;
    id: string;
    displayName: string;
  };
  netProfit: string | number;
  status?: string;
  direction?: string;
  lotSize?: string | number;
  openPrice?: string | number | null | undefined;
  closePrice?: string | number | null | undefined;
  entryPrice?: string | number | null | undefined;
  exitPrice?: string | number | null | undefined;
  stopLoss?: string | number | null | undefined;
  takeProfit?: string | number | null | undefined;
  commission?: string | number | null | undefined;
  swap?: string | number | null | undefined;
  openTime?: Date | string | null | undefined;
  closeTime?: Date | string | null | undefined;
  createdAt?: Date | string | null | undefined;
  updatedAt?: Date | string | null | undefined;
  // Additional properties for grouped trades
  _groupIndex?: number;
  _isPropfirm?: boolean;
  _isBroker?: boolean;
}

export interface AccountLink {
  id: string;
  propfirmAccountId: string;
  brokerAccountId: string;
  autoCopyEnabled: boolean;
  maxRiskPerTrade: number | string;
  isActive: boolean;
  propfirmAccount: TradingAccount;
  brokerAccount: TradingAccount;
}

export interface CalculationsTabProps {
  connection: AccountLink;
}

export interface TradeGroup {
  propfirm: Trade | null;
  broker: Trade | null;
  openTime: Date | string | null;
}

export interface TradeStats {
  totalTrades: number;
  openTrades: number;
  closedTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalPnL: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  maxDrawdown: number;
  propfirmPnL: number;
  brokerPnL: number;
}

// Extended types for trading calculator
export interface PropfirmAccount extends TradingAccount {
  propfirmId?: string;
  accountTypeId?: string;
  currentPhaseId?: string;
  initialBalance?: number | string;
}

export interface BrokerAccount extends TradingAccount {
  brokerId?: string;
}

export interface ExtendedAccountLink
  extends Omit<AccountLink, "propfirmAccount" | "brokerAccount"> {
  propfirmAccount: PropfirmAccount;
  brokerAccount: BrokerAccount;
}

export interface SymbolConfig {
  id: string;
  symbolId: string;
  symbol: {
    symbol: string;
    displayName: string;
    category: string;
    baseCurrency: string;
    quoteCurrency: string;
    pipDecimalPosition: number;
  };
  pipValuePerLot: string | number;
  pipTicks: number;
  commissionPerLot?: string | number | null;
  spreadTypical?: string | number | null;
  isAvailable: boolean;
}

export interface SymbolData {
  symbolId: string;
  symbol: string;
  displayName: string;
  propfirmConfig?: SymbolConfig;
  brokerConfig?: SymbolConfig;
}
