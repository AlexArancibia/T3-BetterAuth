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
