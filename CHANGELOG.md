# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of Solana PancakeSwap Pool Fetcher CLI
- Pool discovery and analysis functionality
- Inactive pool detection
- No-volume pool identification
- TVL calculation with Jupiter Price API
- Configurable RPC endpoint support
- Batch processing with rate limiting
- JSON export functionality
- Token-2022 program support
- Professional CLI interface with help system
- Short alias `spswap` for convenience

### Features
- **Pool Discovery**: Fetch all PancakeSwap pools on Solana
- **Pool Analysis**: Identify inactive and no-volume pools
- **Efficient Processing**: Batch processing with built-in rate limiting
- **Data Export**: Save results to JSON files for further analysis
- **RPC Configuration**: Use any Solana RPC endpoint
- **Token Recognition**: Automatic symbol mapping for known tokens
- **Volume Tracking**: Check trading activity in the last 30 days

### Technical
- Modular TypeScript architecture
- Professional error handling
- Comprehensive logging
- Memory-efficient processing
- Cross-platform compatibility

## [0.0.1] - 2024-01-XX

### Added
- Initial release
- Core CLI functionality
- Pool fetching and analysis
- RPC configuration support
- JSON output generation

### Commands
- `solana-pancake-swap [max_pools]` - Fetch all pools
- `solana-pancake-swap inactive [max_pools]` - Fetch inactive pools
- `solana-pancake-swap no-volume [max_pools]` - Fetch no-volume pools
- `solana-pancake-swap --help` - Show help information
- `spswap` - Short alias for all commands

### Output Files
- `pancakeswap_pools.json` - All valid pools
- `pancakeswap_inactive_pools.json` - Inactive pools
- `pancakeswap_no_volume_pools.json` - No-volume pools
