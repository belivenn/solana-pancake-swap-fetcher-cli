import { KNOWN_TOKEN_SYMBOLS, JUPITER_PRICE_API_V3 } from './constants';

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

// Jupiter Price API functions
export async function getTokenPrice(mint: string): Promise<number> {
  try {
    const response = await fetch(`${JUPITER_PRICE_API_V3}?ids=${mint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json() as any;
    return data[mint]?.usdPrice || 0;
  } catch (error) {
    console.warn(`Failed to get price for ${mint}:`, error);
    return 0;
  }
}

export async function getBatchTokenPrices(mints: string[]): Promise<Record<string, number>> {
  try {
    const uniqueMints = [...new Set(mints)];
    const ids = uniqueMints.join(',');
    
    console.log(`🔍 Debug: Fetching prices for tokens: ${ids}`);
    
    const response = await fetch(`${JUPITER_PRICE_API_V3}?ids=${ids}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json() as any;
    
    console.log(`🔍 Debug: Jupiter API response:`, JSON.stringify(data, null, 2));
    
    // Extract usdPrice from each token's data
    const prices: Record<string, number> = {};
    for (const [mint, tokenData] of Object.entries(data)) {
      if (tokenData && typeof tokenData === 'object' && 'usdPrice' in tokenData) {
        prices[mint] = (tokenData as any).usdPrice;
      }
    }
    
    console.log(`🔍 Debug: Extracted prices:`, prices);
    
    return prices;
  } catch (error) {
    console.warn('Failed to get batch prices:', error);
    return {};
  }
}

export async function calculateTVL(pool: any, prices: Record<string, number>): Promise<number> {
  const price0 = prices[pool.tokenMint0] || 0;
  const price1 = prices[pool.tokenMint1] || 0;
  
  const tvl0 = pool.balance0 * price0;
  const tvl1 = pool.balance1 * price1;
  
  console.log(`🔍 Debug: Pool ${pool.address}`);
  console.log(`  Token0: ${pool.tokenSymbol0} (${pool.tokenMint0}) - Balance: ${pool.balance0}, Price: $${price0}, TVL: $${tvl0}`);
  console.log(`  Token1: ${pool.tokenSymbol1} (${pool.tokenMint1}) - Balance: ${pool.balance1}, Price: $${price1}, TVL: $${tvl1}`);
  console.log(`  Total TVL: $${tvl0 + tvl1}`);
  
  return tvl0 + tvl1;
}
