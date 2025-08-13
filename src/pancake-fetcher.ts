import { Connection, PublicKey, GetProgramAccountsFilter } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, getAccount } from "@solana/spl-token";
import { PoolInfo, PoolState } from './types';
import { PANCAKESWAP_PROGRAM_ID, POOL_STATE_DISCRIMINATOR, getRpcUrl } from './constants';
import { getTokenSymbol, sleep } from './utils';
import { Storage } from './storage';

export class PancakeFetcher {
  private connection: Connection;
  private storage: Storage;

  constructor(rpcUrl?: string) {
    const url = rpcUrl || getRpcUrl();
    this.connection = new Connection(url, "confirmed");
    this.storage = new Storage();
    console.log(`🔗 Using RPC: ${url}`);
  }

  private decodePoolState(data: Buffer): PoolState {
    let offset = 8; // Skip discriminator
    
    // Skip bump (1 byte)
    offset += 1;
    
    // Read amm_config (32 bytes)
    const ammConfig = new PublicKey(data.slice(offset, offset + 32));
    offset += 32;
    
    // Skip owner (32 bytes)
    offset += 32;
    
    // Read token_mint_0 (32 bytes)
    const tokenMint0 = new PublicKey(data.slice(offset, offset + 32));
    offset += 32;
    
    // Read token_mint_1 (32 bytes)
    const tokenMint1 = new PublicKey(data.slice(offset, offset + 32));
    offset += 32;
    
    // Read token_vault_0 (32 bytes)
    const tokenVault0 = new PublicKey(data.slice(offset, offset + 32));
    offset += 32;
    
    // Read token_vault_1 (32 bytes)
    const tokenVault1 = new PublicKey(data.slice(offset, offset + 32));
    offset += 32;
    
    // Read tick_spacing (2 bytes)
    const tickSpacing = data.readUInt16LE(offset);
    offset += 2;
    
    // Read tick_current (4 bytes)
    const tickCurrent = data.readInt32LE(offset);
    offset += 4;
    
    return {
      ammConfig: ammConfig.toString(),
      tokenMint0: tokenMint0.toString(),
      tokenMint1: tokenMint1.toString(),
      tokenVault0: tokenVault0.toString(),
      tokenVault1: tokenVault1.toString(),
      tickSpacing,
      tickCurrent,
      sqrtPriceX64: "0",
      liquidity: "0"
    };
  }

  private async getTokenBalance(vaultAddress: string, decimals: number): Promise<number> {
    try {
      // First, check which program owns this account
      const accountInfo = await this.connection.getAccountInfo(new PublicKey(vaultAddress));
      if (!accountInfo) {
        return 0;
      }

      // Determine which program to use based on account owner
      const programId = accountInfo.owner;
      
      if (programId.equals(TOKEN_PROGRAM_ID)) {
        // Standard Token program account
        const vaultAccount = await getAccount(this.connection, new PublicKey(vaultAddress));
        return Number(vaultAccount.amount) / Math.pow(10, decimals);
      } else if (programId.equals(TOKEN_2022_PROGRAM_ID)) {
        // Token-2022 program account
        const vaultAccount = await getAccount(this.connection, new PublicKey(vaultAddress), undefined, TOKEN_2022_PROGRAM_ID);
        return Number(vaultAccount.amount) / Math.pow(10, decimals);
      } else {
        // Unknown program owner
        return 0;
      }
    } catch (error) {
      // Silently fail for any errors
      return 0;
    }
  }

  private async fetchPoolData(poolAddress: string): Promise<PoolInfo | null> {
    try {
      const poolPubkey = new PublicKey(poolAddress);
      const accountInfo = await this.connection.getAccountInfo(poolPubkey);
      
      if (!accountInfo) {
        return null;
      }

      // Check discriminator
      const discriminator = Array.from(accountInfo.data.slice(0, 8));
      if (!discriminator.every((byte, i) => byte === POOL_STATE_DISCRIMINATOR[i])) {
        return null;
      }

      // Decode pool state
      let poolState: PoolState;
      try {
        poolState = this.decodePoolState(accountInfo.data);
      } catch (decodeError) {
        return null;
      }
      
      // Get mint info for decimals
      const [mint0Info, mint1Info] = await Promise.all([
        this.connection.getParsedAccountInfo(new PublicKey(poolState.tokenMint0)),
        this.connection.getParsedAccountInfo(new PublicKey(poolState.tokenMint1)),
      ]);

      const decimals0 = (mint0Info.value?.data as any)?.parsed?.info?.decimals || 6;
      const decimals1 = (mint1Info.value?.data as any)?.parsed?.info?.decimals || 6;

      // Get token balances
      const [balance0, balance1] = await Promise.all([
        this.getTokenBalance(poolState.tokenVault0, decimals0),
        this.getTokenBalance(poolState.tokenVault1, decimals1),
      ]);

      return {
        address: poolAddress,
        tokenMint0: poolState.tokenMint0,
        tokenMint1: poolState.tokenMint1,
        tokenSymbol0: getTokenSymbol(poolState.tokenMint0),
        tokenSymbol1: getTokenSymbol(poolState.tokenMint1),
        tokenVault0: poolState.tokenVault0,
        tokenVault1: poolState.tokenVault1,
        balance0,
        balance1,
        tickSpacing: poolState.tickSpacing,
        currentTick: poolState.tickCurrent,
        sqrtPriceX64: poolState.sqrtPriceX64,
        liquidity: poolState.liquidity,
        isV3: true,
      };
    } catch (error) {
      return null;
    }
  }

  async fetchPools(maxPools: number = -1): Promise<PoolInfo[]> {
    console.log("🔍 Fetching PancakeSwap pools...");
    
    try {
      const filters: GetProgramAccountsFilter[] = [];
      const poolAccounts = await this.connection.getProgramAccounts(PANCAKESWAP_PROGRAM_ID, {
        filters,
        encoding: 'base64',
      });

      console.log(`📊 Found ${poolAccounts.length} total accounts`);
      
      const validPools: PoolInfo[] = [];
      
      for (let i = 0; i < poolAccounts.length; i++) {
        const account = poolAccounts[i];
        if (!account) continue;
        const poolData = await this.fetchPoolData(account.pubkey.toString());
        
        if (poolData) {
          validPools.push(poolData);
          
          // If we have a limit and reached it, stop processing
          if (maxPools !== -1 && validPools.length >= maxPools) {
            break;
          }
        }
        
        if ((i + 1) % 10 === 0) {
          console.log(`✅ Processed ${i + 1}/${poolAccounts.length}, found ${validPools.length} valid pools`);
          await sleep(100); // Rate limiting
        }
      }
      
      console.log(`🎯 Found ${validPools.length} valid pools out of ${poolAccounts.length} accounts`);
      return validPools;
      
    } catch (error) {
      console.error("❌ Error fetching pools:", error);
      return [];
    }
  }

  async fetchInactivePools(maxPools: number = -1): Promise<PoolInfo[]> {
    console.log("🔍 Fetching inactive pools...");
    
    const allPools = await this.fetchPools(maxPools);
    const inactivePools = allPools.filter(pool => pool.balance0 === 0 || pool.balance1 === 0);
    
    console.log(`🎯 Found ${inactivePools.length} inactive pools`);
    this.storage.savePools(inactivePools, 'pancakeswap_inactive_pools.json');
    
    return inactivePools;
  }

  async fetchNoVolumePools(maxPools: number = -1): Promise<PoolInfo[]> {
    console.log("🔍 Fetching no-volume pools...");
    
    const allPools = await this.fetchPools(maxPools);
    const noVolumePools: PoolInfo[] = [];
    
    for (const pool of allPools) {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const signatures = await Promise.race([
          this.connection.getSignaturesForAddress(
            new PublicKey(pool.address),
            { limit: 100 }
          ),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 10000)
          )
        ]) as any;
        
        const recentSignatures = signatures.filter((sig: any) => 
          sig.blockTime && sig.blockTime > thirtyDaysAgo.getTime() / 1000
        );
        
        if (recentSignatures.length === 0) {
          pool.hasVolume = false;
          pool.lastTradeTime = 0;
          noVolumePools.push(pool);
          this.storage.appendPool(pool, 'pancakeswap_no_volume_pools.json');
        }
        
        await sleep(1000); // Rate limiting
      } catch (error) {
        console.warn(`Failed to check volume for pool ${pool.address}:`, error);
      }
    }
    
    console.log(`🎯 Found ${noVolumePools.length} no-volume pools`);
    return noVolumePools;
  }
}
