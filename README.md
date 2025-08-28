# 🥞 Solana PancakeSwap Pool Fetcher CLI

A command-line tool for fetching and analyzing PancakeSwap pools on Solana blockchain.

[![npm version](https://badge.fury.io/js/solana-pancake-swap.svg)](https://badge.fury.io/js/solana-pancake-swap)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1.6-blue.svg)](https://www.typescriptlang.org/)

## ✨ Features

- **🔍 Pool Discovery**: Fetch all PancakeSwap pools on Solana
- **📊 Pool Analysis**: Identify inactive pools and no-volume pools
- **⚡ Efficient Processing**: Batch processing with rate limiting
- **💾 Data Export**: Save results to JSON files for further analysis
- **🔧 Configurable RPC**: Use any Solana RPC endpoint
- **📈 TVL Calculation**: Calculate Total Value Locked for pools
- **🔄 Volume Tracking**: Check trading activity in the last 30 days
- **🎯 Token Recognition**: Automatic symbol mapping for known tokens
- **🆕 New Pool Detection**: Identify newly created pools
- **📋 Detailed Pool Info**: Fetch complete pool data including tick arrays and observation states
- **🎛️ Advanced Filtering**: Filter pools by TVL thresholds and other criteria

## ✅ Accomplished Features

- **🎯 Individual Pool Analysis**: `solana-pancake-swap pool <address>` - Fetch detailed information for a specific pool
- **📊 TVL Filtering**: Filter pools by Total Value Locked using `--over` and `--under` flags
- **🆕 New Pool Detection**: `solana-pancake-swap new` - Compare current pools with cached data to find new ones
- **📋 Comprehensive Help System**: Context-aware help with `--help` and subcommand-specific documentation
- **🔧 Configuration Management**: Save and load RPC endpoints and other settings
- **📖 Documentation**: `solana-pancake-swap readme` - Display detailed documentation
- **⚡ Force Refresh**: `--force` flag to overwrite cached data
- **🎛️ Advanced CLI**: Subcommand-based interface similar to Solana CLI tools

## 🚀 Quick Start

### Installation

```bash
npm install -g solana-pancake-swap
```

### Basic Usage

```bash
# Configure RPC endpoint (required for first-time setup)
solana-pancake-swap config --rpc https://your-rpc.com

# Fetch all pools
solana-pancake-swap pools

# Fetch first 50 pools
solana-pancake-swap pools 50

# Fetch inactive pools
solana-pancake-swap inactive

# Fetch no-volume pools
solana-pancake-swap no-volume

# Use cached data (faster, no RPC calls)
solana-pancake-swap pools --cached
```

### Short Alias

You can also use the short alias `spswap`:

```bash
spswap pools 100
spswap inactive --cached
```

## 📋 Commands

| Command | Description |
|---------|-------------|
| `solana-pancake-swap pools [max_pools]` | Fetch all pools (max_pools optional) |
| `solana-pancake-swap inactive [max_pools]` | Fetch inactive pools (max_pools optional) |
| `solana-pancake-swap no-volume [max_pools]` | Fetch no-volume pools (max_pools optional) |
| `solana-pancake-swap new [max_pools]` | Fetch new pools (not in previous cache) |
| `solana-pancake-swap tvl [max_pools]` | Fetch pools by TVL thresholds |
| `solana-pancake-swap pool <address>` | Get detailed pool information |
| `solana-pancake-swap config --rpc <url>` | Configure RPC endpoint |
| `solana-pancake-swap readme` | Show detailed documentation |
| `solana-pancake-swap --help` | Show help information |
| `solana-pancake-swap --version` | Show version information |

## 🔗 RPC Configuration

**RPC URL is required for first-time setup.** Use the `config` subcommand to save your RPC endpoint for future use.

### Example Usage

```bash
# Configure RPC endpoint
solana-pancake-swap config --rpc https://your-rpc.com

# Fetch 50 pools
solana-pancake-swap pools 50

# Fetch inactive pools
solana-pancake-swap inactive

# Fetch 100 no-volume pools
solana-pancake-swap no-volume 100

# Use cached data for faster access
solana-pancake-swap pools --cached

# Override saved RPC for a single command
solana-pancake-swap pools --rpc https://different-rpc.com
```

### Recommended RPC Providers

- **Helius**: `https://rpc.helius.xyz/?api-key=YOUR_API_KEY`
- **QuickNode**: `https://your-endpoint.solana-mainnet.quiknode.pro/YOUR_API_KEY/`
- **Alchemy**: `https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY`
- **Public**: `https://api.mainnet-beta.solana.com` (limited rate)

## 💾 Output Files

The CLI generates the following JSON files in the current directory:

| File | Description |
|------|-------------|
| `pancakeswap_pools.json` | All valid PancakeSwap pools |
| `pancakeswap_inactive_pools.json` | Pools with zero balance on one side |
| `pancakeswap_no_volume_pools.json` | Pools with no trading activity in 30 days |
| `pancakeswap_new_pools.json` | New pools (not in previous cache) |
| `pancakeswap_tvl_pools.json` | TVL filtered pools |

### Sample Output Structure

```json
{
  "address": "pool_address_here",
  "tokenMint0": "token0_mint_address",
  "tokenMint1": "token1_mint_address",
  "tokenSymbol0": "SOL",
  "tokenSymbol1": "USDC",
  "balance0": 1000.5,
  "balance1": 50000.0,
  "tvl": 25000.0,
  "hasVolume": true,
  "lastTradeTime": 1234567890
}
```

## 🏗️ Architecture

The CLI is built with a modular architecture:

```
src/
├── types.ts          # TypeScript interfaces
├── constants.ts      # Configuration constants
├── utils.ts          # Utility functions
├── storage.ts        # File I/O operations
├── pancake-fetcher.ts # Core business logic
└── cli.ts           # Command-line interface
```

### Key Components

- **PancakeFetcher**: Core class for fetching and processing pool data
- **Storage**: Handles saving/loading data to/from JSON files
- **CLI**: Parses command-line arguments and orchestrates operations

## 🔧 Development

### Prerequisites

- Node.js >= 18.0.0
- TypeScript 5.1.6+
- A Solana RPC endpoint

### Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd solana-pancake-swap

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build the project
npm run build
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Run the CLI |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run dev` | Run in development mode with ts-node |
| `npm test` | Run tests (placeholder) |

## 📊 Performance Considerations

- **Batch Processing**: Pools are processed in batches to avoid RPC rate limits
- **Rate Limiting**: Built-in delays between requests to prevent timeouts
- **Caching**: Results are saved to local files for reuse
- **Smart Caching**: Use `--cached` flag to skip chain fetch and use saved data
- **Memory Efficient**: Processes pools incrementally to handle large datasets

## 🔍 Pool Analysis Features

### Inactive Pools
Pools where one token has zero balance, indicating no liquidity.

### No-Volume Pools
Pools with no trading activity in the last 30 days, identified by checking recent transaction signatures.

### New Pools
Pools that weren't present in the previous cache, useful for discovering newly created pools.

### TVL Filtering
Filter pools by Total Value Locked (USD) using `--over` and `--under` thresholds.

### Current Data
- **Pool Addresses**: Complete pool identification
- **Token Information**: Mint addresses, symbols, and vault addresses
- **Token Balances**: Raw token amounts (not USD values)
- **Pool State**: Tick spacing, current tick, and liquidity data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Add proper error handling
- Include JSDoc comments for public methods
- Test with multiple RPC endpoints
- Ensure backward compatibility

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This tool is for educational and research purposes. Always verify data independently and use at your own risk. The authors are not responsible for any financial decisions made based on this tool's output.

## 🐛 Issues & Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/belivenn/solana-pancake-swap/issues) page
2. Create a new issue with detailed information
3. Include your RPC endpoint (without API keys) and command used

## 📈 Roadmap

- [ ] Add support for other DEX protocols
- [ ] Implement real-time monitoring
- [ ] Add CSV export functionality
- [ ] Create web dashboard
- [ ] Add historical data analysis
- [ ] Implement pool health scoring
- [ ] Add price impact calculation
- [ ] Implement multi-chain support
- [ ] Add trading volume analytics
- [ ] Create pool comparison tools


