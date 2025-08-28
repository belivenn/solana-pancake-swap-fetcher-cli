import { PancakeFetcher } from './pancake-fetcher';
import { Storage } from './storage';

interface CLIOptions {
  rpc?: string;
  cached?: boolean;
  force?: boolean;
  path?: string;
  over?: number;
  under?: number;
  help?: boolean;
  version?: boolean;
}

export class CLI {
  private fetcher: PancakeFetcher | null = null;
  private storage: Storage;

  constructor() {
    this.storage = new Storage();
  }

  showVersion(): void {
    console.log("🥞 Solana PancakeSwap Pool Fetcher CLI v0.0.3");
    console.log("Built for Solana blockchain analysis");
    console.log("MIT License - https://opensource.org/licenses/MIT");
  }

  showReadme(): void {
    console.log("\n🥞 Solana PancakeSwap Pool Fetcher CLI");
    console.log("=" .repeat(60));
    console.log("\nA command-line tool for fetching and analyzing PancakeSwap pools on Solana blockchain.");
    console.log("\n✨ FEATURES:");
    console.log("  • 🔍 Pool Discovery: Fetch all PancakeSwap pools on Solana");
    console.log("  • 📊 Pool Analysis: Identify inactive pools and no-volume pools");
    console.log("  • ⚡ Efficient Processing: Batch processing with rate limiting");
    console.log("  • 💾 Data Export: Save results to JSON files for further analysis");
    console.log("  • 🔧 Configurable RPC: Use any Solana RPC endpoint");
    console.log("  • 📈 TVL Calculation: Calculate Total Value Locked for pools");
    console.log("  • 🔄 Volume Tracking: Check trading activity in the last 30 days");
    console.log("  • 🎯 Token Recognition: Automatic symbol mapping for known tokens");
    console.log("\n🚀 QUICK START:");
    console.log("  1. Install: npm install -g solana-pancake-swap");
    console.log("  2. Configure: solana-pancake-swap config --rpc <your-rpc-url>");
    console.log("  3. Fetch pools: solana-pancake-swap pools 50");
    console.log("\n📋 COMMANDS OVERVIEW:");
    console.log("  • pools [max_pools]           - Fetch all pools");
    console.log("  • inactive [max_pools]        - Fetch inactive pools (zero balance)");
    console.log("  • no-volume [max_pools]       - Fetch pools with no recent activity");
    console.log("  • new [max_pools]             - Fetch newly created pools");
    console.log("  • tvl [max_pools]             - Fetch pools by TVL thresholds");
    console.log("  • pool <address>              - Get detailed pool information");
    console.log("  • config --rpc <url>          - Configure RPC endpoint");
    console.log("\n💾 OUTPUT FILES:");
    console.log("  • pancakeswap_pools.json      - All valid pools");
    console.log("  • pancakeswap_inactive_pools.json - Inactive pools");
    console.log("  • pancakeswap_no_volume_pools.json - No-volume pools");
    console.log("  • pancakeswap_new_pools.json  - New pools");
    console.log("  • pancakeswap_tvl_pools.json  - TVL filtered pools");
    console.log("\n🔗 RPC CONFIGURATION:");
    console.log("  • RPC URL is required for first-time setup");
    console.log("  • Use 'solana-pancake-swap config --rpc <url>' to save RPC");
    console.log("  • Use --rpc flag to override saved configuration");
    console.log("\n📊 PERFORMANCE CONSIDERATIONS:");
    console.log("  • Batch Processing: Pools are processed in batches to avoid RPC rate limits");
    console.log("  • Rate Limiting: Built-in delays between requests to prevent timeouts");
    console.log("  • Caching: Results are saved to local files for reuse");
    console.log("  • Smart Caching: Use --cached flag to skip chain fetch and use saved data");
    console.log("  • Memory Efficient: Processes pools incrementally to handle large datasets");
    console.log("\n🔍 POOL ANALYSIS FEATURES:");
    console.log("  • Inactive Pools: Pools where one token has zero balance");
    console.log("  • No-Volume Pools: Pools with no trading activity in the last 30 days");
    console.log("  • Current Data: Pool addresses, token information, balances, pool state");
    console.log("\n⚠️  DISCLAIMER:");
    console.log("  This tool is for educational and research purposes. Always verify data");
    console.log("  independently and use at your own risk. The authors are not responsible");
    console.log("  for any financial decisions made based on this tool's output.");
    console.log("\n📝 LICENSE:");
    console.log("  MIT License - https://opensource.org/licenses/MIT");
    console.log("\n💡 For more help, use: solana-pancake-swap --help");
    console.log("");
  }

  showGlobalHelp(): void {
    console.log("\n🥞 Solana PancakeSwap Pool Fetcher CLI");
    console.log("=" .repeat(50));
    console.log("\n📋 USAGE:");
    console.log("  solana-pancake-swap <SUBCOMMAND> [OPTIONS]");
    console.log("\n📋 SUBCOMMANDS:");
    console.log("  pools [max_pools]              # Fetch all pools");
    console.log("  inactive [max_pools]           # Fetch inactive pools");
    console.log("  no-volume [max_pools]          # Fetch no-volume pools");
    console.log("  new [max_pools]                # Fetch new pools (not in previous cache)");
    console.log("  tvl [max_pools]                # Fetch pools by TVL");
    console.log("  pool <address>                 # Get pool information");
    console.log("  config --rpc <url>             # Configure RPC endpoint");
    console.log("  readme                         # Show detailed documentation");
    console.log("\n📋 OPTIONS:");
    console.log("  --rpc <url>                    # RPC endpoint (overrides config)");
    console.log("  --cached                       # Use cached data (skip chain fetch)");
    console.log("  --force                        # Force refresh (ignore cache)");
    console.log("  --path <file>                  # Custom output file path");
    console.log("  --over <amount>                # TVL over threshold (for tvl command)");
    console.log("  --under <amount>               # TVL under threshold (for tvl command)");
    console.log("  -h, --help                     # Show help information");
    console.log("  -v, --version                  # Show version information");
    console.log("\n📊 EXAMPLES:");
    console.log("  solana-pancake-swap pools 50                           # Fetch 50 pools");
    console.log("  solana-pancake-swap inactive --cached                  # Use cached inactive pools");
    console.log("  solana-pancake-swap new 100 --force                    # Force fetch 100 new pools");
    console.log("  solana-pancake-swap tvl --over 1000 --under 10000      # TVL between $1K-$10K");
    console.log("  solana-pancake-swap pool <address>                     # Get pool information");
    console.log("  solana-pancake-swap config --rpc <url>                 # Configure RPC endpoint");
    console.log("  solana-pancake-swap readme                             # Show detailed documentation");
    console.log("\n💾 OUTPUT FILES:");
    console.log("  • pancakeswap_pools.json                   # All valid pools");
    console.log("  • pancakeswap_inactive_pools.json          # Inactive pools");
    console.log("  • pancakeswap_no_volume_pools.json         # No-volume pools");
    console.log("  • pancakeswap_new_pools.json               # New pools");
    console.log("  • pancakeswap_tvl_pools.json               # TVL filtered pools");
    console.log("\n🔗 RPC CONFIGURATION:");
    console.log("  • RPC URL is required for first-time setup");
    console.log("  • Use 'solana-pancake-swap config --rpc <url>' to save RPC");
    console.log("  • Use --rpc flag to override saved configuration");
    console.log("");
  }

  showSubcommandHelp(subcommand: string): void {
    switch (subcommand) {
      case 'pools':
        console.log("\n📋 POOLS SUBCOMMAND");
        console.log("=" .repeat(30));
        console.log("Fetch all PancakeSwap pools from the blockchain");
        console.log("\nUSAGE:");
        console.log("  solana-pancake-swap pools [max_pools] [OPTIONS]");
        console.log("\nARGUMENTS:");
        console.log("  max_pools    Maximum number of pools to fetch (optional)");
        console.log("\nOPTIONS:");
        console.log("  --cached     Use cached pools (skip chain fetch)");
        console.log("  --force      Force refresh (ignore cache)");
        console.log("  --rpc <url>  RPC endpoint (overrides config)");
        console.log("\nEXAMPLES:");
        console.log("  solana-pancake-swap pools              # Fetch all pools");
        console.log("  solana-pancake-swap pools 50           # Fetch 50 pools");
        console.log("  solana-pancake-swap pools --cached     # Use cached data");
        break;
      
      case 'inactive':
        console.log("\n📋 INACTIVE SUBCOMMAND");
        console.log("=" .repeat(30));
        console.log("Fetch pools with zero balance on one side (inactive pools)");
        console.log("\nUSAGE:");
        console.log("  solana-pancake-swap inactive [max_pools] [OPTIONS]");
        console.log("\nARGUMENTS:");
        console.log("  max_pools    Maximum number of pools to fetch (optional)");
        console.log("\nOPTIONS:");
        console.log("  --cached     Use cached pools (skip chain fetch)");
        console.log("  --force      Force refresh (ignore cache)");
        console.log("  --rpc <url>  RPC endpoint (overrides config)");
        console.log("\nEXAMPLES:");
        console.log("  solana-pancake-swap inactive           # Fetch all inactive pools");
        console.log("  solana-pancake-swap inactive 20        # Fetch 20 inactive pools");
        break;
      
      case 'no-volume':
        console.log("\n📋 NO-VOLUME SUBCOMMAND");
        console.log("=" .repeat(30));
        console.log("Fetch pools with no trading activity in the last 30 days");
        console.log("\nUSAGE:");
        console.log("  solana-pancake-swap no-volume [max_pools] [OPTIONS]");
        console.log("\nARGUMENTS:");
        console.log("  max_pools    Maximum number of pools to fetch (optional)");
        console.log("\nOPTIONS:");
        console.log("  --cached     Use cached pools (skip chain fetch)");
        console.log("  --force      Force refresh (ignore cache)");
        console.log("  --rpc <url>  RPC endpoint (overrides config)");
        console.log("\nEXAMPLES:");
        console.log("  solana-pancake-swap no-volume          # Fetch all no-volume pools");
        console.log("  solana-pancake-swap no-volume 30       # Fetch 30 no-volume pools");
        break;
      
      case 'new':
        console.log("\n📋 NEW SUBCOMMAND");
        console.log("=" .repeat(30));
        console.log("Fetch pools that weren't in the previous cache (new pools)");
        console.log("\nUSAGE:");
        console.log("  solana-pancake-swap new [max_pools] [OPTIONS]");
        console.log("\nARGUMENTS:");
        console.log("  max_pools    Maximum number of pools to fetch (optional)");
        console.log("\nOPTIONS:");
        console.log("  --cached     Use cached pools (skip chain fetch)");
        console.log("  --force      Force refresh (ignore cache)");
        console.log("  --rpc <url>  RPC endpoint (overrides config)");
        console.log("\nEXAMPLES:");
        console.log("  solana-pancake-swap new                # Fetch all new pools");
        console.log("  solana-pancake-swap new 50             # Fetch 50 new pools");
        break;
      
      case 'tvl':
        console.log("\n📋 TVL SUBCOMMAND");
        console.log("=" .repeat(30));
        console.log("Fetch pools filtered by Total Value Locked (TVL)");
        console.log("\nUSAGE:");
        console.log("  solana-pancake-swap tvl [max_pools] [OPTIONS]");
        console.log("\nARGUMENTS:");
        console.log("  max_pools    Maximum number of pools to fetch (optional)");
        console.log("\nOPTIONS:");
        console.log("  --over <amount>   TVL over threshold (USD)");
        console.log("  --under <amount>  TVL under threshold (USD)");
        console.log("  --path <file>     Custom output file path");
        console.log("  --cached          Use cached pools (skip chain fetch)");
        console.log("  --force           Force refresh (ignore cache)");
        console.log("  --rpc <url>       RPC endpoint (overrides config)");
        console.log("\nEXAMPLES:");
        console.log("  solana-pancake-swap tvl --over 1000              # TVL over $1000");
        console.log("  solana-pancake-swap tvl --under 500              # TVL under $500");
        console.log("  solana-pancake-swap tvl --over 1000 --under 10000 # TVL between $1K-$10K");
        console.log("  solana-pancake-swap tvl --path ./my_pools.json   # Custom output file");
        break;
      
      case 'pool':
        console.log("\n📋 POOL SUBCOMMAND");
        console.log("=" .repeat(30));
        console.log("Get detailed information about a specific pool");
        console.log("\nUSAGE:");
        console.log("  solana-pancake-swap pool <address> [OPTIONS]");
        console.log("\nARGUMENTS:");
        console.log("  address      Pool address to analyze");
        console.log("\nOPTIONS:");
        console.log("  --rpc <url>  RPC endpoint (overrides config)");
        console.log("\nEXAMPLES:");
        console.log("  solana-pancake-swap pool <address>");
        break;
      
      case 'config':
        console.log("\n📋 CONFIG SUBCOMMAND");
        console.log("=" .repeat(30));
        console.log("Configure RPC endpoint and other settings");
        console.log("\nUSAGE:");
        console.log("  solana-pancake-swap config --rpc <url>");
        console.log("\nOPTIONS:");
        console.log("  --rpc <url>  RPC endpoint to save for future use");
        console.log("\nEXAMPLES:");
        console.log("  solana-pancake-swap config --rpc <url>");
        break;
      
      case 'readme':
        this.showReadme();
        break;
      
      default:
        console.log(`❌ Unknown subcommand: ${subcommand}`);
        console.log("💡 Use 'solana-pancake-swap --help' for available subcommands");
    }
  }

  parseOptions(args: string[]): { options: CLIOptions; subcommand: string | null; subcommandArgs: string[] } {
    const options: CLIOptions = {};
    let subcommand: string | null = null;
    let subcommandArgs: string[] = [];
    let i = 0;

    while (i < args.length) {
      const arg = args[i];
      if (!arg) {
        i++;
        continue;
      }
      
      // Handle flags and options
      if (arg.startsWith('--')) {
        switch (arg) {
          case '--help':
          case '-h':
            options.help = true;
            break;
          case '--version':
          case '-v':
            options.version = true;
            break;
          case '--cached':
            options.cached = true;
            break;
          case '--force':
            options.force = true;
            break;
          case '--rpc':
            if (i + 1 < args.length && args[i + 1]) {
              options.rpc = args[i + 1]!;
              i++; // Skip next argument
            } else {
              throw new Error("--rpc requires a URL");
            }
            break;
          case '--path':
            if (i + 1 < args.length && args[i + 1]) {
              options.path = args[i + 1]!;
              i++; // Skip next argument
            } else {
              throw new Error("--path requires a file path");
            }
            break;
          case '--over':
            if (i + 1 < args.length && args[i + 1]) {
              const value = parseFloat(args[i + 1]!);
              if (isNaN(value)) {
                throw new Error("--over requires a valid number");
              }
              options.over = value;
              i++; // Skip next argument
            } else {
              throw new Error("--over requires a number");
            }
            break;
          case '--under':
            if (i + 1 < args.length && args[i + 1]) {
              const value = parseFloat(args[i + 1]!);
              if (isNaN(value)) {
                throw new Error("--under requires a valid number");
              }
              options.under = value;
              i++; // Skip next argument
            } else {
              throw new Error("--under requires a number");
            }
            break;
          default:
            throw new Error(`Unknown option: ${arg}`);
        }
      } else if (arg.startsWith('-') && arg.length === 2) {
        // Handle short flags
        switch (arg) {
          case '-h':
            options.help = true;
            break;
          case '-v':
            options.version = true;
            break;
          default:
            throw new Error(`Unknown flag: ${arg}`);
        }
      } else {
        // This is a subcommand or subcommand argument
        if (!subcommand) {
          subcommand = arg;
        } else {
          subcommandArgs.push(arg);
        }
      }
      
      i++;
    }

    return { options, subcommand, subcommandArgs };
  }

  async run(args: string[]): Promise<void> {
    try {
      const { options, subcommand, subcommandArgs } = this.parseOptions(args);

      // Handle global flags
      if (options.version) {
        this.showVersion();
        return;
      }

      if (options.help) {
        if (subcommand) {
          this.showSubcommandHelp(subcommand);
        } else {
          this.showGlobalHelp();
        }
        return;
      }

      // Handle spswap alias
      if (subcommand === 'spswap') {
        // Convert spswap to pools subcommand
        const newArgs = ['pools', ...subcommandArgs];
        const { options: newOptions, subcommand: newSubcommand, subcommandArgs: newSubcommandArgs } = this.parseOptions(newArgs);
        return this.runSubcommand(newSubcommand || 'pools', newSubcommandArgs, newOptions);
      }

      // If no subcommand provided, default to pools
      const finalSubcommand = subcommand || 'pools';
      
      await this.runSubcommand(finalSubcommand, subcommandArgs, options);
      
    } catch (error) {
      console.error(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      if (error instanceof Error && error.message.includes('Unknown option')) {
        console.log("💡 Use 'solana-pancake-swap --help' for available options");
      }
      process.exit(1);
    }
  }

  private async runSubcommand(subcommand: string, args: string[], options: CLIOptions): Promise<void> {
    // Handle RPC configuration
    let rpcUrl = options.rpc;
    if (!rpcUrl) {
      const config = this.storage.loadConfig();
      if (config?.rpcUrl) {
        rpcUrl = config.rpcUrl;
        console.log(`🔗 Using saved RPC: ${rpcUrl}`);
      } else {
        console.error("❌ Error: RPC URL is required. Use 'solana-pancake-swap config --rpc <url>' to configure.");
        return;
      }
    } else {
      // Save the RPC URL for future use
      this.storage.saveConfig({ rpcUrl });
    }

    // Create fetcher
    this.fetcher = new PancakeFetcher(rpcUrl);

    // Handle config subcommand first
    if (subcommand === 'config') {
      if (options.rpc) {
        this.storage.saveConfig({ rpcUrl: options.rpc });
        console.log(`✅ RPC URL saved successfully: ${options.rpc}`);
        console.log(`💡 You can now run commands without the --rpc flag`);
        return;
      } else {
        console.error("❌ Error: config subcommand requires --rpc <url>");
        this.showSubcommandHelp('config');
        return;
      }
    }

    // Handle other subcommands
    switch (subcommand) {
      case 'pools':
        await this.handlePools(args, options);
        break;
      case 'inactive':
        await this.handleInactive(args, options);
        break;
      case 'no-volume':
        await this.handleNoVolume(args, options);
        break;
      case 'new':
        await this.handleNew(args, options);
        break;
      case 'tvl':
        await this.handleTVL(args, options);
        break;
      case 'pool':
        await this.handlePool(args, options);
        break;
      case 'readme':
        this.showReadme();
        return;
      default:
        console.error(`❌ Unknown subcommand: ${subcommand}`);
        this.showGlobalHelp();
    }
  }

  private async handlePools(args: string[], options: CLIOptions): Promise<void> {
    const maxPools = args[0] ? parseInt(args[0]) : -1;
    console.log(`\n🚀 Fetching pools${maxPools > 0 ? ` (max: ${maxPools})` : ''}...`);
    const pools = await this.fetcher!.fetchPools(maxPools, options.cached || false, options.force || false);
    console.log(`✨ Found ${pools.length} pools`);
  }

  private async handleInactive(args: string[], options: CLIOptions): Promise<void> {
    const maxPools = args[0] ? parseInt(args[0]) : -1;
    console.log(`\n🚀 Fetching inactive pools${maxPools > 0 ? ` (max: ${maxPools})` : ''}...`);
    const pools = await this.fetcher!.fetchInactivePools(maxPools, options.cached || false, options.force || false);
    console.log(`✨ Found ${pools.length} inactive pools`);
  }

  private async handleNoVolume(args: string[], options: CLIOptions): Promise<void> {
    const maxPools = args[0] ? parseInt(args[0]) : -1;
    console.log(`\n🚀 Fetching no-volume pools${maxPools > 0 ? ` (max: ${maxPools})` : ''}...`);
    const pools = await this.fetcher!.fetchNoVolumePools(maxPools, options.cached || false, options.force || false);
    console.log(`✨ Found ${pools.length} no-volume pools`);
  }

  private async handleNew(args: string[], options: CLIOptions): Promise<void> {
    const maxPools = args[0] ? parseInt(args[0]) : -1;
    console.log(`\n🚀 Fetching new pools${maxPools > 0 ? ` (max: ${maxPools})` : ''}...`);
    const pools = await this.fetcher!.fetchNewPools(maxPools, options.cached || false, options.force || false);
    console.log(`✨ Found ${pools.length} new pools`);
  }

  private async handleTVL(args: string[], options: CLIOptions): Promise<void> {
    const maxPools = args[0] ? parseInt(args[0]) : -1;
    
    if (options.over === undefined && options.under === undefined) {
      console.error("❌ Error: TVL command requires --over or --under option");
      this.showSubcommandHelp('tvl');
      return;
    }

    console.log(`\n🚀 Fetching pools by TVL${maxPools > 0 ? ` (max: ${maxPools})` : ''}...`);
    if (options.over !== undefined) console.log(`📊 TVL over: $${options.over}`);
    if (options.under !== undefined) console.log(`📊 TVL under: $${options.under}`);
    if (options.path) console.log(`📁 Custom path: ${options.path}`);

    const pools = await this.fetcher!.fetchPoolsByTVL(
      options.over, 
      options.under, 
      options.path, 
      maxPools, 
      options.cached || false, 
      options.force || false
    );
    console.log(`✨ Found ${pools.length} pools matching TVL criteria`);
  }

  private async handlePool(args: string[], _options: CLIOptions): Promise<void> {
    if (!args[0]) {
      console.error("❌ Error: pool subcommand requires a pool address");
      this.showSubcommandHelp('pool');
      return;
    }

    const poolAddress = args[0];
    console.log(`\n🔍 Getting pool information for: ${poolAddress}`);
    const poolInfo = await this.fetcher!.getPoolSwapAccounts(poolAddress);
    
    if (poolInfo) {
      console.log("\n🏗️  Pool Information:");
      console.log("-".repeat(50));
      console.log(`Pool Address: ${poolInfo.address}`);
      console.log(`Token 0: ${poolInfo.tokenSymbol0} (${poolInfo.tokenMint0})`);
      console.log(`Token 1: ${poolInfo.tokenSymbol1} (${poolInfo.tokenMint1})`);
      console.log(`Vault 0: ${poolInfo.tokenVault0}`);
      console.log(`Vault 1: ${poolInfo.tokenVault1}`);
      console.log(`Balance 0: ${poolInfo.balance0}`);
      console.log(`Balance 1: ${poolInfo.balance1}`);
      console.log(`Tick Spacing: ${poolInfo.tickSpacing}`);
      console.log(`Current Tick: ${poolInfo.currentTick}`);
      console.log(`Liquidity: ${poolInfo.liquidity}`);
      console.log(`Is V3: ${poolInfo.isV3}`);
      
      console.log("\n🔧 Swap Accounts:");
      console.log("-".repeat(50));
      console.log(`AMM Config: ${poolInfo.ammConfig}`);
      console.log(`Observation State: ${poolInfo.observationState}`);
      
      if (poolInfo.tickArrayLower) {
        console.log(`Tick Array Lower: ${poolInfo.tickArrayLower}`);
      }
      if (poolInfo.tickArrayUpper) {
        console.log(`Tick Array Upper: ${poolInfo.tickArrayUpper}`);
      }
      
      console.log("\n🔧 Swap Instruction Keys:");
      console.log("-".repeat(50));
      console.log(`{ pubkey: new PublicKey("${poolInfo.ammConfig}"), isSigner: false, isWritable: false }, // amm_config`);
      console.log(`{ pubkey: new PublicKey("${poolInfo.address}"), isSigner: false, isWritable: true }, // pool_state`);
      console.log(`{ pubkey: new PublicKey("${poolInfo.tokenVault0}"), isSigner: false, isWritable: true }, // input_vault`);
      console.log(`{ pubkey: new PublicKey("${poolInfo.tokenVault1}"), isSigner: false, isWritable: true }, // output_vault`);
      console.log(`{ pubkey: new PublicKey("${poolInfo.observationState}"), isSigner: false, isWritable: true }, // observation_state`);
      
      if (poolInfo.tickArrayLower) {
        console.log(`{ pubkey: new PublicKey("${poolInfo.tickArrayLower}"), isSigner: false, isWritable: true }, // tick_array_lower`);
      }
      if (poolInfo.tickArrayUpper) {
        console.log(`{ pubkey: new PublicKey("${poolInfo.tickArrayUpper}"), isSigner: false, isWritable: true }, // tick_array_upper`);
      }
    } else {
      console.error("❌ Pool not found or invalid");
    }
  }
}
