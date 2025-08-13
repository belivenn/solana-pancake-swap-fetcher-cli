#!/usr/bin/env node

import { CLI } from './src/cli';

async function main() {
  const cli = new CLI();
  const args = process.argv.slice(2);
  
  try {
    await cli.run(args);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
