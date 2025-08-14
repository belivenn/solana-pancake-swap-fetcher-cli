import { PancakeFetcher } from './pancake-fetcher';
import { Storage } from './storage';

export class CLI {
  private fetcher: PancakeFetcher | null = null;
  private storage: Storage;

  constructor() {
    this.storage = new Storage();
  }

  showHelp(): void {
    console.log("\n🥞 PancakeSwap Pool Fetcher CLI");
    console.log("=" .repeat(50));
    console.log("\n📋 Commands:");
    console.log("  solana-pancake-swap [max_pools]             # Fetch all pools (max_pools optional)");
    console.log("  solana-pancake-swap inactive [max_pools]    # Fetch inactive pools (max_pools optional)");
    console.log("  solana-pancake-swap no-volume [max_pools]   # Fetch no-volume pools (max_pools optional)");
    console.log("  solana-pancake-swap --help                  # Show this help");
    console.log("  spswap [max_pools]                          # Short alias");
    console.log("\n📊 Example:");
    console.log("  solana-pancake-swap 50 --rpc https://your-rpc.com     # Fetch 50 pools");
    console.log("  solana-pancake-swap --cached                # Use cached pools (skip chain fetch)");
    console.log("\n🔗 RPC Configuration:");
    console.log("  • RPC URL is required for all commands");
    console.log("  • Use --rpc or -r flag to specify your endpoint");
    console.log("  • RPC URL is saved after first use for convenience");
    console.log("  • Run 'solana-pancake-swap --rpc URL' to just save RPC");
    console.log("\n💾 Output Files:");
    console.log("  • pancakeswap_pools.json                   # All valid pools");
    console.log("  • pancakeswap_inactive_pools.json          # Inactive pools");
    console.log("  • pancakeswap_no_volume_pools.json         # No-volume pools");
    console.log("\n⚡ Cache:");
    console.log("  • By default, fetches fresh data from chain");
    console.log("  • Use --cached to use previously saved pools");
    console.log("");
  }

  async run(args: string[]): Promise<void> {
    // Check for help command first
    if (args.includes('--help') || args.includes('-h') || args.includes('help')) {
      this.showHelp();
      return;
    }
    
    // Check for unknown flags
    const unknownFlags = args.filter(arg => arg.startsWith('--') && !['--rpc', '--help', '--cached'].includes(arg));
    if (unknownFlags.length > 0) {
      console.error(`❌ Error: Unknown flag(s): ${unknownFlags.join(', ')}`);
      console.error("💡 Use --help to see available options");
      return;
    }
    
    // Parse RPC URL and cached flag from arguments
    let rpcUrl: string | undefined;
    let useCached: boolean = false;
    let filteredArgs: string[] = [];
    
    // Look for --rpc or -r at the end
    for (let i = args.length - 1; i >= 0; i--) {
      if (args[i] === '--rpc' || args[i] === '-r') {
        if (i + 1 < args.length) {
          rpcUrl = args[i + 1];
          // Remove both the flag and the URL from args
          args.splice(i, 2);
          break;
        } else {
          console.error("❌ Error: --rpc/-r requires a URL");
          return;
        }
      }
    }
    
    // Check for --cached flag
    const cachedIndex = args.indexOf('--cached');
    if (cachedIndex !== -1) {
      useCached = true;
      args.splice(cachedIndex, 1); // Remove the flag
    }
    
    // All remaining args are command args
    filteredArgs = args;
    const command = filteredArgs[0];
    
    // Handle spswap alias
    if (command === 'spswap') {
      filteredArgs[0] = 'solana-pancake-swap'; // Replace with full command name
    }
    
    // Try to load saved RPC URL if not provided
    if (!rpcUrl) {
      const config = this.storage.loadConfig();
      if (config?.rpcUrl) {
        rpcUrl = config.rpcUrl;
        console.log(`🔗 Using saved RPC: ${rpcUrl}`);
      } else {
        console.error("❌ Error: RPC URL is required. Use --rpc or -r flag to specify your RPC endpoint.");
        console.error("Example: solana-pancake-swap 50 --rpc https://your-rpc.com");
        return;
      }
    } else {
      // Save the RPC URL for future use
      this.storage.saveConfig({ rpcUrl });
    }
    
    // If no command is provided and RPC was just saved, exit gracefully
    if (!command && rpcUrl) {
      console.log(`✅ RPC URL saved successfully: ${rpcUrl}`);
      console.log(`💡 You can now run commands without the --rpc flag`);
      return;
    }
    
    // Create fetcher with RPC URL
    this.fetcher = new PancakeFetcher(rpcUrl);

    if (command === 'inactive') {
      const maxPools = filteredArgs[1] ? parseInt(filteredArgs[1]) : -1;
      console.log(`\n🚀 Fetching inactive pools${maxPools > 0 ? ` (max: ${maxPools})` : ''}...`);
      const pools = await this.fetcher!.fetchInactivePools(maxPools, useCached);
      console.log(`✨ Found ${pools.length} inactive pools`);
      return;
    }

    if (command === 'no-volume') {
      const maxPools = filteredArgs[1] ? parseInt(filteredArgs[1]) : -1;
      console.log(`\n🚀 Fetching no-volume pools${maxPools > 0 ? ` (max: ${maxPools})` : ''}...`);
      const pools = await this.fetcher!.fetchNoVolumePools(maxPools, useCached);
      console.log(`✨ Found ${pools.length} no-volume pools`);
      return;
    }

    // Check if command is a valid number (for max pools) or empty
    if (command && isNaN(parseInt(command))) {
      console.error(`❌ Error: Unknown command: ${command}`);
      console.error("💡 Available commands: inactive, no-volume");
      console.error("💡 Or provide a number for max pools (e.g., 50)");
      console.error("💡 Use --help to see all options");
      return;
    }

    // Default: fetch all pools
    const maxPools = command ? parseInt(command) : -1;
    console.log(`\n🚀 Fetching pools${maxPools > 0 ? ` (max: ${maxPools})` : ''}...`);
    const pools = await this.fetcher!.fetchPools(maxPools, useCached);
    if (!useCached) {
      this.storage.savePools(pools);
    }
    console.log(`✨ Found ${pools.length} valid pools`);
  }
}
