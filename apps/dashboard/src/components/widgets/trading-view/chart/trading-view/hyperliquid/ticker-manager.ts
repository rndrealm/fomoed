import { subscribeToTicker, unsubscribeFromTicker } from "./streaming";
import { WsActiveAssetCtx, WsActiveSpotAssetCtx } from "./types";

type TickerData = WsActiveAssetCtx | WsActiveSpotAssetCtx;

interface PendingPromise {
  resolve: (data: TickerData) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
}

/**
 * Singleton class for managing Hyperliquid ticker data imperatively.
 * Provides synchronous and asynchronous access to ticker data without React hooks.
 *
 * @example
 * ```typescript
 * const manager = HyperliquidTickerManager.getInstance();
 *
 * // Get current cached price
 * const price = manager.getCurrentPrice("BTC");
 *
 * // Wait for price if cache is empty
 * const price = await manager.waitForPrice("BTC");
 *
 * // Get full ticker data
 * const ticker = manager.getTickerData("BTC");
 * ```
 */
export class HyperliquidTickerManager {
  private static instance: HyperliquidTickerManager | null = null;

  private tickerCache: Map<string, TickerData> = new Map();
  private activeSubscriptions: Map<string, (data: TickerData) => void> = new Map();
  private pendingPromises: Map<string, PendingPromise[]> = new Map();

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  /**
   * Get the singleton instance of HyperliquidTickerManager
   */
  public static getInstance(): HyperliquidTickerManager {
    if (!HyperliquidTickerManager.instance) {
      HyperliquidTickerManager.instance = new HyperliquidTickerManager();
    }
    return HyperliquidTickerManager.instance;
  }

  /**
   * Internal handler for ticker updates from WebSocket
   */
  private handleTickerUpdate(coin: string, data: TickerData): void {
    // Update cache
    this.tickerCache.set(coin, data);

    // Resolve any pending promises waiting for this coin
    const pending = this.pendingPromises.get(coin);
    if (pending && pending.length > 0) {
      pending.forEach(({ resolve, timeout }) => {
        clearTimeout(timeout);
        resolve(data);
      });
      this.pendingPromises.delete(coin);
    }
  }

  /**
   * Ensure we're subscribed to a coin's ticker data
   */
  private ensureSubscription(coin: string): void {
    if (this.activeSubscriptions.has(coin)) {
      return; // Already subscribed
    }

    const callback = (data: TickerData) => {
      this.handleTickerUpdate(coin, data);
    };

    this.activeSubscriptions.set(coin, callback);
    subscribeToTicker(coin, callback);
  }

  

  /**
   * Get the current cached price for a coin
   * Returns null if no cached data is available
   *
   * @param coin - The coin symbol (e.g., "BTC", "ETH")
   * @returns The mark price or null if not available
   */
  public getCurrentPrice(coin: string): number | null {
    const ticker = this.tickerCache.get(coin);
    return ticker?.ctx?.midPx ?? null;
  }

  /**
   * Get the full cached ticker data for a coin
   * Returns null if no cached data is available
   *
   * @param coin - The coin symbol (e.g., "BTC", "ETH")
   * @returns The full ticker data or null if not available
   */
  public getTickerData(coin: string): TickerData | null {
    return this.tickerCache.get(coin) ?? null;
  }

  /**
   * Wait for the next price update for a coin
   * If cached data exists, returns immediately
   * Otherwise, subscribes and waits for the first update
   *
   * @param coin - The coin symbol (e.g., "BTC", "ETH")
   * @param timeoutMs - Maximum time to wait in milliseconds (default: 5000)
   * @returns Promise that resolves to the mark price
   * @throws Error if timeout is reached before receiving data
   */
  public async waitForPrice(coin: string, timeoutMs: number = 5000): Promise<number> {
    // If we have cached data, return immediately
    const cached = this.getCurrentPrice(coin);
    if (cached !== null) {
      return cached;
    }

    // Ensure we're subscribed
    this.ensureSubscription(coin);

    // Create promise that resolves on next update
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Timeout waiting for ${coin} price after ${timeoutMs}ms`));

        // Clean up
        const pending = this.pendingPromises.get(coin);
        if (pending) {
          const index = pending.findIndex((p) => p.timeout === timeout);
          if (index !== -1) {
            pending.splice(index, 1);
          }
          if (pending.length === 0) {
            this.pendingPromises.delete(coin);
          }
        }
      }, timeoutMs);

      if (!this.pendingPromises.has(coin)) {
        this.pendingPromises.set(coin, []);
      }

      this.pendingPromises.get(coin)!.push({
        resolve: (data: TickerData) => resolve(data.ctx.markPx),
        reject,
        timeout,
      });
    });
  }

  /**
   * Wait for the next ticker data update for a coin
   * If cached data exists, returns immediately
   * Otherwise, subscribes and waits for the first update
   *
   * @param coin - The coin symbol (e.g., "BTC", "ETH")
   * @param timeoutMs - Maximum time to wait in milliseconds (default: 5000)
   * @returns Promise that resolves to the full ticker data
   * @throws Error if timeout is reached before receiving data
   */
  public async waitForTickerData(coin: string, timeoutMs: number = 5000): Promise<TickerData> {
    // If we have cached data, return immediately
    const cached = this.getTickerData(coin);
    if (cached !== null) {
      return cached;
    }

    // Ensure we're subscribed
    this.ensureSubscription(coin);

    // Create promise that resolves on next update
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Timeout waiting for ${coin} ticker data after ${timeoutMs}ms`));

        // Clean up
        const pending = this.pendingPromises.get(coin);
        if (pending) {
          const index = pending.findIndex((p) => p.timeout === timeout);
          if (index !== -1) {
            pending.splice(index, 1);
          }
          if (pending.length === 0) {
            this.pendingPromises.delete(coin);
          }
        }
      }, timeoutMs);

      if (!this.pendingPromises.has(coin)) {
        this.pendingPromises.set(coin, []);
      }

      this.pendingPromises.get(coin)!.push({
        resolve,
        reject,
        timeout,
      });
    });
  }

  /**
   * Subscribe to a coin's ticker data
   * Starts receiving updates and caching data for the coin
   *
   * @param coin - The coin symbol (e.g., "BTC", "ETH")
   */
  public subscribe(coin: string): void {
    this.ensureSubscription(coin);
  }

  /**
   * Unsubscribe from a coin's ticker data
   * Stops receiving updates and clears cached data for the coin
   *
   * @param coin - The coin symbol (e.g., "BTC", "ETH")
   */
  public unsubscribe(coin: string): void {
    const callback = this.activeSubscriptions.get(coin);
    if (callback) {
      unsubscribeFromTicker(coin, callback);
      this.activeSubscriptions.delete(coin);
      this.tickerCache.delete(coin);
    }
  }

  /**
   * Check if currently subscribed to a coin's ticker data
   *
   * @param coin - The coin symbol (e.g., "BTC", "ETH")
   * @returns true if subscribed, false otherwise
   */
  public isSubscribed(coin: string): boolean {
    return this.activeSubscriptions.has(coin);
  }

  /**
   * Get all coins that are currently subscribed
   *
   * @returns Array of coin symbols
   */
  public getSubscribedCoins(): string[] {
    return Array.from(this.activeSubscriptions.keys());
  }

  /**
   * Clear all subscriptions and cached data
   * Useful for cleanup or testing
   */
  public clearAll(): void {
    // Unsubscribe from all coins
    for (const coin of this.activeSubscriptions.keys()) {
      this.unsubscribe(coin);
    }

    // Clear any pending promises
    this.pendingPromises.forEach((pending) => {
      pending.forEach(({ reject, timeout }) => {
        clearTimeout(timeout);
        reject(new Error("Manager cleared"));
      });
    });
    this.pendingPromises.clear();
  }
}

// Export a convenience instance getter
export const getTickerManager = () => HyperliquidTickerManager.getInstance();
