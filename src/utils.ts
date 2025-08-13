import { KNOWN_TOKEN_SYMBOLS } from './constants';

export function getTokenSymbol(mintAddress: string): string {
  return KNOWN_TOKEN_SYMBOLS[mintAddress] || mintAddress.slice(0, 8) + "..." + mintAddress.slice(-6);
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function formatNumber(num: number, decimals: number = 2): string {
  return num.toLocaleString('en-US', { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  });
}

export function formatUSD(amount: number): string {
  return `$${formatNumber(amount)}`;
}
