import * as fs from 'fs';
import * as path from 'path';
import { PoolInfo } from './types';

export class Storage {
  private baseDir: string;
  private configFile: string;

  constructor(baseDir: string = process.cwd()) {
    this.baseDir = baseDir;
    this.configFile = path.join(process.cwd(), '.solana-pancake-swap-config.json');
  }

  private getFilePath(filename: string): string {
    // If filename contains a path separator, treat it as a full path
    if (filename.includes(path.sep) || filename.startsWith('/')) {
      return filename;
    }
    return path.join(this.baseDir, filename);
  }

  savePools(pools: PoolInfo[], filename: string = 'pancakeswap_pools.json'): void {
    try {
      const filePath = this.getFilePath(filename);
      
      // Ensure the directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      }
      
      const data = {
        timestamp: new Date().toISOString(),
        totalPools: pools.length,
        pools
      };
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`💾 Saved ${pools.length} pools to ${filePath}`);
    } catch (error) {
      console.error("❌ Error saving pools:", error);
    }
  }

  loadPools(filename: string = 'pancakeswap_pools.json'): PoolInfo[] | null {
    try {
      const filePath = this.getFilePath(filename);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        console.log(`📂 Loaded ${data.totalPools} pools from ${filePath} (saved: ${data.timestamp})`);
        return data.pools;
      } else {
        console.log(`📂 File not found: ${filePath}`);
      }
    } catch (error) {
      console.error("❌ Error loading pools:", error);
    }
    return null;
  }



  appendPool(pool: PoolInfo, filename: string): void {
    try {
      const filePath = this.getFilePath(filename);
      let existingPools: PoolInfo[] = [];
      
      if (fs.existsSync(filePath)) {
        try {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          existingPools = data.pools || [];
        } catch (error) {
          console.warn("Could not read existing pools file, starting fresh");
        }
      }
      
      const poolExists = existingPools.some(p => p.address === pool.address);
      if (!poolExists) {
        existingPools.push(pool);
        const poolData = {
          timestamp: new Date().toISOString(),
          totalPools: existingPools.length,
          pools: existingPools
        };
        fs.writeFileSync(filePath, JSON.stringify(poolData, null, 2));
      }
    } catch (error) {
      console.warn("Failed to append pool:", error);
    }
  }

  // Configuration methods
  saveConfig(config: { rpcUrl: string }): void {
    try {
      fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2));
      console.log(`💾 Saved RPC configuration to ${this.configFile}`);
    } catch (error) {
      console.error(`❌ Error saving config: ${error}`);
    }
  }

  loadConfig(): { rpcUrl?: string } | null {
    try {
      if (fs.existsSync(this.configFile)) {
        const data = fs.readFileSync(this.configFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error(`❌ Error loading config: ${error}`);
    }
    return null;
  }
}
