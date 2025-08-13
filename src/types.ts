export interface PoolInfo {
  address: string;
  tokenMint0: string;
  tokenMint1: string;
  tokenSymbol0: string;
  tokenSymbol1: string;
  tokenVault0: string;
  tokenVault1: string;
  balance0: number;
  balance1: number;
  price0USD?: number;
  price1USD?: number;
  tvlUSD?: number;
  tickSpacing: number;
  currentTick: number;
  sqrtPriceX64: string;
  liquidity: string;
  isV3: boolean;
  hasVolume?: boolean;
  lastTradeTime?: number;
  volumeError?: string;
}



export interface TokenPrice {
  id: string;
  mintSymbol: string;
  vsToken: string;
  vsTokenSymbol: string;
  price: number;
}

export interface PoolState {
  ammConfig: string;
  tokenMint0: string;
  tokenMint1: string;
  tokenVault0: string;
  tokenVault1: string;
  tickSpacing: number;
  tickCurrent: number;
  sqrtPriceX64: string;
  liquidity: string;
}
