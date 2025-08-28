import { Connection, PublicKey, GetProgramAccountsFilter } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, getAccount } from "@solana/spl-token";
import { PoolInfo, PoolState } from './types';
import { PANCAKESWAP_PROGRAM_ID, POOL_STATE_DISCRIMINATOR, getRpcUrl } from './constants';
import { getTokenSymbol, sleep, getBatchTokenPrices, calculateTVL } from './utils';
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

  async fetchPools(maxPools: number = -1, useCached: boolean = false, forceRefresh: boolean = false): Promise<PoolInfo[]> {
    // Check cache first if useCached flag is set and not forcing refresh
    if (useCached && !forceRefresh) {
      const cachedPools = this.storage.loadPools();
      if (cachedPools && cachedPools.length > 0) {
        console.log(`📂 Using cached pools (${cachedPools.length} pools)`);
        if (maxPools > 0) {
          return cachedPools.slice(0, maxPools);
        }
        return cachedPools;
      } else {
        console.log("⚠️  No cached pools found, fetching from chain instead...");
      }
    }
    
    if (forceRefresh) {
      console.log("🔄 Force refresh: ignoring cache and fetching from chain...");
    }
    
    console.log("🔍 Fetching PancakeSwap pools from chain...");
    
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
      
      // Save to cache (only when fetching from chain)
      this.storage.savePools(validPools);
      
      return validPools;
      
    } catch (error) {
      console.error("❌ Error fetching pools:", error);
      return [];
    }
  }

  async fetchPoolsWithoutSaving(maxPools: number = -1): Promise<PoolInfo[]> {
    console.log("🔍 Fetching PancakeSwap pools from chain (without saving to cache)...");
    
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
      
      // Don't save to cache - this is the key difference
      
      return validPools;
      
    } catch (error) {
      console.error("❌ Error fetching pools:", error);
      return [];
    }
  }

  async fetchInactivePools(maxPools: number = -1, useCached: boolean = false, forceRefresh: boolean = false): Promise<PoolInfo[]> {
    console.log("🔍 Fetching inactive pools...");
    
    const allPools = await this.fetchPools(maxPools, useCached, forceRefresh);
    const inactivePools = allPools.filter(pool => pool.balance0 === 0 || pool.balance1 === 0);
    
    console.log(`🎯 Found ${inactivePools.length} inactive pools`);
    this.storage.savePools(inactivePools, 'pancakeswap_inactive_pools.json');
    
    return inactivePools;
  }

  async fetchNoVolumePools(maxPools: number = -1, useCached: boolean = false, forceRefresh: boolean = false): Promise<PoolInfo[]> {
    console.log("🔍 Fetching no-volume pools...");
    
    const allPools = await this.fetchPools(maxPools, useCached, forceRefresh);
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
        }
        
        await sleep(1000); // Rate limiting
      } catch (error) {
        console.warn(`Failed to check volume for pool ${pool.address}:`, error);
      }
    }
    
    console.log(`🎯 Found ${noVolumePools.length} no-volume pools`);
    this.storage.savePools(noVolumePools, 'pancakeswap_no_volume_pools.json');
    return noVolumePools;
  }

  async fetchNewPools(maxPools: number = -1, useCached: boolean = false, forceRefresh: boolean = false): Promise<PoolInfo[]> {
    console.log("🔍 Fetching new pools...");
    
    // Load the previous cache to compare against
    const previousPools = this.storage.loadPools('pancakeswap_pools.json');
    if (!previousPools || previousPools.length === 0) {
      console.log("⚠️  No previous pools cache found. All pools will be considered new.");
      const allPools = await this.fetchPools(maxPools, useCached, forceRefresh);
      this.storage.savePools(allPools, 'pancakeswap_new_pools.json');
      return allPools;
    }
    
    console.log(`📂 Found ${previousPools.length} pools in previous cache`);
    
    // Create a set of previous pool addresses for fast lookup
    const previousPoolAddresses = new Set(previousPools.map(pool => pool.address));
    
    // Fetch current pools from chain without saving to main cache
    const currentPools = await this.fetchPoolsWithoutSaving(maxPools);
    
    // Find pools that weren't in the previous cache
    const newPools: PoolInfo[] = [];
    for (const pool of currentPools) {
      if (!previousPoolAddresses.has(pool.address)) {
        newPools.push(pool);
        
        // If we have a limit and reached it, stop processing
        if (maxPools !== -1 && newPools.length >= maxPools) {
          break;
        }
      }
    }
    
    console.log(`🎯 Found ${newPools.length} new pools out of ${currentPools.length} current pools`);
    this.storage.savePools(newPools, 'pancakeswap_new_pools.json');
    
    return newPools;
  }

  async fetchPoolsByTVL(
    over?: number, 
    under?: number, 
    customPath?: string,
    maxPools: number = -1, 
    useCached: boolean = false,
    forceRefresh: boolean = false
  ): Promise<PoolInfo[]> {
    console.log("🔍 Fetching pools by TVL...");
    
    let allPools: PoolInfo[];
    
    if (useCached && !forceRefresh) {
      // Load from cache - either custom path or default
      const cacheFile = customPath || 'pancakeswap_pools.json';
      const cachedPools = this.storage.loadPools(cacheFile);
      if (cachedPools && cachedPools.length > 0) {
        console.log(`📂 Using cached pools from: ${cacheFile}`);
        allPools = cachedPools;
      } else {
        console.log(`⚠️  No cached pools found at ${cacheFile}, fetching from chain...`);
        allPools = await this.fetchPools(maxPools, false, forceRefresh);
      }
    } else {
      // Fetch fresh from chain
      if (forceRefresh) {
        console.log("🔄 Force refresh: ignoring cache and fetching from chain...");
      }
      allPools = await this.fetchPools(maxPools, false, forceRefresh);
    }
    
    // Get all unique token mints
    const allMints = new Set<string>();
    allPools.forEach(pool => {
      allMints.add(pool.tokenMint0);
      allMints.add(pool.tokenMint1);
    });
    
    console.log(`💰 Fetching prices for ${allMints.size} unique tokens...`);
    const prices = await getBatchTokenPrices(Array.from(allMints));
    
    // Calculate TVL for each pool
    const poolsWithTVL: (PoolInfo & { tvl: number })[] = [];
    
    for (const pool of allPools) {
      const tvl = await calculateTVL(pool, prices);
      poolsWithTVL.push({ ...pool, tvl });
    }
    
    // Filter by TVL thresholds
    let filteredPools = poolsWithTVL;
    
    if (over !== undefined) {
      filteredPools = filteredPools.filter(pool => pool.tvl >= over);
      console.log(`📊 Filtered to ${filteredPools.length} pools with TVL >= $${over}`);
    }
    
    if (under !== undefined) {
      filteredPools = filteredPools.filter(pool => pool.tvl <= under);
      console.log(`📊 Filtered to ${filteredPools.length} pools with TVL <= $${under}`);
    }
    
    // Sort by TVL (highest first)
    filteredPools.sort((a, b) => b.tvl - a.tvl);
    
    console.log(`🎯 Found ${filteredPools.length} pools matching TVL criteria`);
    
    // Save to file
    const filename = customPath || 'pancakeswap_tvl_pools.json';
    this.storage.savePools(filteredPools, filename);
    
    return filteredPools;
  }

  async getPoolSwapAccounts(poolAddress: string): Promise<{
    address: string;
    tokenMint0: string;
    tokenMint1: string;
    tokenSymbol0: string;
    tokenSymbol1: string;
    tokenVault0: string;
    tokenVault1: string;
    balance0: number;
    balance1: number;
    tickSpacing: number;
    currentTick: number;
    sqrtPriceX64: string;
    liquidity: string;
    isV3: boolean;
    ammConfig: string;
    observationState: string;
    tickArrayLower?: string;
    tickArrayUpper?: string;
    tickArrayBitmap?: string;
  } | null> {
    try {
      // Use the existing fetchPoolData method to get all the pool info
      const poolInfo = await this.fetchPoolData(poolAddress);
      
      if (!poolInfo) {
        console.error("❌ Pool not found or invalid");
        return null;
      }

      // Get the raw pool account data to extract AMM config and observation state
      const poolPubkey = new PublicKey(poolAddress);
      const poolAccount = await this.connection.getAccountInfo(poolPubkey);
      
      if (!poolAccount) {
        console.error("❌ Pool account not found");
        return null;
      }

      // Decode pool state to get AMM config
      const poolState = this.decodePoolState(poolAccount.data);
      
      // Decode observation state separately
      const observationState = this.decodeObservationState(poolAccount.data);
      
      // Calculate tick array addresses
      const tickArrays = this.calculateTickArrayAddresses(poolAddress, poolInfo.currentTick, poolInfo.tickSpacing);
      
      const result: any = {
        ...poolInfo,
        ammConfig: poolState.ammConfig,
        observationState: observationState
      };
      
      if (tickArrays.tickArrayLower) result.tickArrayLower = tickArrays.tickArrayLower;
      if (tickArrays.tickArrayUpper) result.tickArrayUpper = tickArrays.tickArrayUpper;
      if (tickArrays.tickArrayBitmap) result.tickArrayBitmap = tickArrays.tickArrayBitmap;
      
      return result;
    } catch (error) {
      console.error("❌ Error getting pool swap accounts:", error);
      return null;
    }
  }

  private decodeObservationState(data: Buffer): string {
    // Based on PancakeSwap IDL PoolState structure
    // observation_key is at position 8 in the structure (after vaults)
    
    // Calculate offset: discriminator(8) + bump(1) + amm_config(32) + owner(32) + 
    // token_mint_0(32) + token_mint_1(32) + token_vault_0(32) + token_vault_1(32) = 201
    const offset = 8 + 1 + 32 + 32 + 32 + 32 + 32 + 32;
    
    if (offset + 32 <= data.length) {
      const observationState = new PublicKey(data.slice(offset, offset + 32));
      return observationState.toString();
    }
    
    return "OBSERVATION_STATE_NOT_FOUND";
  }

  private calculateTickArrayAddresses(poolAddress: string, currentTick: number, tickSpacing: number): {
    tickArrayLower?: string;
    tickArrayUpper?: string;
    tickArrayBitmap?: string;
  } {
    try {
      const poolPubkey = new PublicKey(poolAddress);
      
      // Based on smart_send_tx.ts implementation
      const tickArraySpacing = tickSpacing * 60; // Use 60, not 64
      const currentTickArrayIndex = Math.floor(currentTick / tickArraySpacing);
      const tickArrayStartIndex = currentTickArrayIndex * tickArraySpacing;
      
      const [tickArrayLower] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("tick_array"),
          poolPubkey.toBuffer(),
          Buffer.from(tickArrayStartIndex.toString())
        ],
        new PublicKey("HpNfyc2Saw7RKkQd8nEL4khUcuPhQ7WwY1B2qjx8jxFq")
      );
      
      // Calculate upper tick array (next index)
      const upperTickArrayStartIndex = (currentTickArrayIndex + 1) * tickArraySpacing;
      
      const [tickArrayUpper] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("tick_array"),
          poolPubkey.toBuffer(),
          Buffer.from(upperTickArrayStartIndex.toString())
        ],
        new PublicKey("HpNfyc2Saw7RKkQd8nEL4khUcuPhQ7WwY1B2qjx8jxFq")
      );
      
      const [tickArrayBitmap] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("tick_array_bitmap"),
          poolPubkey.toBuffer()
        ],
        new PublicKey("HpNfyc2Saw7RKkQd8nEL4khUcuPhQ7WwY1B2qjx8jxFq")
      );
      
      return {
        tickArrayLower: tickArrayLower.toString(),
        tickArrayUpper: tickArrayUpper.toString(),
        tickArrayBitmap: tickArrayBitmap.toString()
      };
      
    } catch (error) {
      console.error("Error calculating tick array addresses:", error);
      return {};
    }
  }


}
