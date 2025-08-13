import { PublicKey } from "@solana/web3.js";

export const PANCAKESWAP_PROGRAM_ID = new PublicKey("HpNfyc2Saw7RKkQd8nEL4khUcuPhQ7WwY1B2qjx8jxFq");
export const POOL_STATE_DISCRIMINATOR = [247, 237, 227, 245, 215, 195, 222, 70];


// Get RPC URL from environment variable (required)
export function getRpcUrl(): string {
  const rpcUrl = process.env['SOLANA_RPC_URL'];
  if (!rpcUrl) {
    throw new Error("RPC URL is required. Use --rpc or -r flag to specify your RPC endpoint.");
  }
  return rpcUrl;
}

export const KNOWN_TOKEN_SYMBOLS: { [key: string]: string } = {
  "So11111111111111111111111111111111111111112": "SOL",
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": "USDC",
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": "USDT",
  "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263": "BONK",
  "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj": "stSOL",
  "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So": "mSOL",
  "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs": "ETH",
  "A9mUU4qviSctJVPJdBJWkb28k915yHhL3KJc3mBkzC9K": "BTC",
  "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr": "POPCAT",
  "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3": "PYTH",
  "CKaKtYvz6dKPyMvYq9Rh3UBrnNqYqYq1N6K1xV4qfCL": "JUP",
  "RLBxxFkseAZ4RgJH3Sqn8jXxhmGoMz9hWwzJpzKqK8": "RLB",
  "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU": "SAMO",
  "AFbX8oGjGpmVFywbVouvhQSRmiW2aR1mohfahi4Y2AdB": "GST",
  "7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxRzf5": "GMT",
  "DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ": "DUST"
};
