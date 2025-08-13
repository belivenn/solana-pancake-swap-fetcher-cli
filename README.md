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

## 🚀 Quick Start

### Installation

```bash
npm install -g solana-pancake-swap
```

### Basic Usage

```bash
# Fetch all pools
solana-pancake-swap --rpc https://your-rpc.com

# Fetch first 50 pools
solana-pancake-swap 50 --rpc https://your-rpc.com

# Fetch inactive pools
solana-pancake-swap inactive --rpc https://your-rpc.com

# Fetch no-volume pools
solana-pancake-swap no-volume --rpc https://your-rpc.com
```

### Short Alias

You can also use the short alias `spswap`:

```bash
spswap 100 --rpc https://your-rpc.com
spswap inactive --rpc https://your-rpc.com
```

## 📋 Commands

| Command | Description |
|---------|-------------|
| `solana-pancake-swap [max_pools]` | Fetch all pools (max_pools optional) |
| `solana-pancake-swap inactive [max_pools]` | Fetch inactive pools (max_pools optional) |
| `solana-pancake-swap no-volume [max_pools]` | Fetch no-volume pools (max_pools optional) |
| `solana-pancake-swap --help` | Show help information |

## 🔗 RPC Configuration

**RPC URL is required for all commands.** Use the `--rpc` or `-r` flag to specify your Solana RPC endpoint.

### Example Usage

```bash
# Fetch 50 pools
solana-pancake-swap 50 --rpc https://your-rpc.com

# Fetch inactive pools
solana-pancake-swap inactive --rpc https://your-rpc.com

# Fetch 100 no-volume pools
spswap no-volume 100 --rpc https://your-rpc.com
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
- **Memory Efficient**: Processes pools incrementally to handle large datasets

## 🔍 Pool Analysis Features

### Inactive Pools
Pools where one token has zero balance, indicating no liquidity.

### No-Volume Pools
Pools with no trading activity in the last 30 days, identified by checking recent transaction signatures.

### TVL Calculation
Total Value Locked is calculated using:
- Token balances from pool accounts
- Current USD prices from Jupiter Price API
- Formula: `(balance0 * price0) + (balance1 * price1)`

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

1. Check the [Issues](https://github.com/your-username/solana-pancake-swap/issues) page
2. Create a new issue with detailed information
3. Include your RPC endpoint (without API keys) and command used

## 📈 Roadmap

- [ ] Add support for other DEX protocols
- [ ] Implement real-time monitoring
- [ ] Add CSV export functionality
- [ ] Create web dashboard
- [ ] Add historical data analysis
- [ ] Implement pool health scoring

## 🙏 Acknowledgments

- [PancakeSwap](https://pancakeswap.finance/) for the protocol
- [Solana Labs](https://solana.com/) for the blockchain
- [Jupiter](https://jup.ag/) for price data
- [SPL Token](https://spl.solana.com/token) for token standards
