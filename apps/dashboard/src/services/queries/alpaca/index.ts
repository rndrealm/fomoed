import { useQuery } from "@tanstack/react-query";
import { StockSymbol } from "@/lib/atoms/tradingViewWidget";
import { AlpacaAPI } from "@/app/api/alpaca/alpaca-api";
import { AlpacaAsset } from "@/app/api/alpaca/types";

export function useSearchStocks(searchQuery: string) {
  return useQuery({
    queryKey: ["search-stocks", searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 1) {
        return { stocks: [] };
      }

      const api = new AlpacaAPI();
      
      try {
        const allAssets = await api.getAllAssets();
        
        const query = searchQuery.toUpperCase();
        
        const matches = allAssets
          .filter((asset: AlpacaAsset) => {
            if (!asset.tradable || asset.class !== "us_equity") return false;
            
            const symbolMatch = asset.symbol.includes(query);
            const nameMatch = asset.name.toUpperCase().includes(query);
            
            return symbolMatch || nameMatch;
          })
          .map((asset: AlpacaAsset) => {
            let score = 0;
            
            if (asset.symbol === query) score += 1000;
            else if (asset.symbol.startsWith(query)) score += 100;
            else if (asset.symbol.includes(query)) score += 50;
            else if (asset.name.toUpperCase().includes(query)) score += 10;
            
            return {
              asset,
              score,
            };
          })
          .sort((a: { asset: AlpacaAsset; score: number }, b: { asset: AlpacaAsset; score: number }) => b.score - a.score) 
          .slice(0, 50) 
          .map(({ asset }: { asset: AlpacaAsset }) => ({
            symbol: asset.symbol,
            name: asset.name,
            displayName: asset.symbol,
            type: "stock" as const,
            exchange: asset.exchange,
            price: "0",
            baseTokenName: asset.symbol,
            quoteTokenName: "USD",
          }));

        return {
          stocks: matches as StockSymbol[],
          total: matches.length,
        };
      } catch (error) {
        console.error("Stock search error:", error);
        return { stocks: [], total: 0 };
      }
    },
    enabled: searchQuery.length >= 1, 
    staleTime: 1000 * 60 * 5, 
  });
}

export function useReadAlpacaStocks() {
  return useQuery({
    queryKey: ["alpaca-featured-stocks"],
    queryFn: async () => {
      const api = new AlpacaAPI();
      
      try {
        const assets = await api.getFilteredStocks({
          tradable: true,
          exchanges: ["NASDAQ", "NYSE", "ARCA"],
        });

        const popularSymbols = [
          "AAPL", "MSFT", "GOOGL", "GOOG", "AMZN", "TSLA", "NVDA", "META", "BRK.B", "BRK.A",
          "JPM", "V", "WMT", "UNH", "JNJ", "PG", "MA", "HD", "XOM", "CVX",
          "BAC", "ABBV", "PFE", "KO", "PEP", "MRK", "COST", "AVGO", "DIS", "CSCO",
          "ADBE", "NFLX", "CRM", "ACN", "TMO", "NKE", "ABT", "DHR", "LIN", "TXN",
          "VZ", "NEE", "PM", "RTX", "UNP", "BMY", "INTC", "AMD", "QCOM", "HON",
          "UPS", "LOW", "T", "AMGN", "SBUX", "BA", "CAT", "GE", "NOW", "IBM",
          "ORCL", "GILD", "AXP", "MS", "GS", "BLK", "C", "BKNG", "ISRG", "SYK",
          "MMM", "TJX", "MDLZ", "AMT", "PYPL", "DE", "CHTR", "MO", "CI", "LMT",
          "SCHW", "ZTS", "EOG", "CB", "SLB", "USB", "PNC", "TFC", "COF", "BDX",
          "CL", "WFC", "MCD", "GM", "F", "UBER", "ABNB", "COIN", "HOOD", "SNAP",
          "SHOP", "SQ", "ROKU", "SPOT", "PLTR", "SNOW", "CRWD", "NET", "DDOG", "ZM",
          // Popular ETFs
          "SPY", "QQQ", "IWM", "DIA", "VOO", "VTI", "VEA", "VWO", "AGG", "BND",
          "EEM", "EFA", "GLD", "SLV", "TLT", "IEF", "LQD", "HYG", "XLE", "XLF",
          "XLK", "XLV", "XLI", "XLP", "XLY", "XLU", "XLRE", "XLB", "XLC", "VNQ",
          // More popular stocks
          "NVAX", "MRNA", "PFE", "BNTX", "JNJ", "AZN", "NVO", "LLY", "TMO", "ISRG",
          "ZTS", "VRTX", "REGN", "AMGN", "GILD", "BIIB", "ILMN", "ALXN", "IQV", "HCA",
          "CNC", "CVS", "CI", "HUM", "UNH", "ANTM", "MOH", "ELV", "CRL", "DGX",
        ];

        const stocks: StockSymbol[] = assets.map((asset: AlpacaAsset) => ({
          symbol: asset.symbol,
          name: asset.name,
          displayName: asset.symbol,
          type: "stock" as const,
          exchange: asset.exchange,
          price: "0",
          baseTokenName: asset.symbol,
          quoteTokenName: "USD",
        }));

        const sortedStocks = stocks.sort((a, b) => {
          const aIsPopular = popularSymbols.includes(a.symbol);
          const bIsPopular = popularSymbols.includes(b.symbol);

          if (aIsPopular && !bIsPopular) return -1;
          if (!aIsPopular && bIsPopular) return 1;

          if (aIsPopular && bIsPopular) {
            return popularSymbols.indexOf(a.symbol) - popularSymbols.indexOf(b.symbol);
          }

          return a.symbol.localeCompare(b.symbol);
        });

        return {
          stocks: sortedStocks,
          total: sortedStocks.length,
        };
      } catch (error) {
        console.error("Failed to fetch stocks:", error);
        
        const fallbackStocks: StockSymbol[] = [
          { symbol: "AAPL", name: "Apple Inc.", displayName: "AAPL", type: "stock", exchange: "NASDAQ", price: "0", baseTokenName: "AAPL", quoteTokenName: "USD" },
          { symbol: "MSFT", name: "Microsoft Corporation", displayName: "MSFT", type: "stock", exchange: "NASDAQ", price: "0", baseTokenName: "MSFT", quoteTokenName: "USD" },
          { symbol: "GOOGL", name: "Alphabet Inc.", displayName: "GOOGL", type: "stock", exchange: "NASDAQ", price: "0", baseTokenName: "GOOGL", quoteTokenName: "USD" },
          { symbol: "AMZN", name: "Amazon.com Inc.", displayName: "AMZN", type: "stock", exchange: "NASDAQ", price: "0", baseTokenName: "AMZN", quoteTokenName: "USD" },
          { symbol: "TSLA", name: "Tesla Inc.", displayName: "TSLA", type: "stock", exchange: "NASDAQ", price: "0", baseTokenName: "TSLA", quoteTokenName: "USD" },
          { symbol: "NVDA", name: "NVIDIA Corporation", displayName: "NVDA", type: "stock", exchange: "NASDAQ", price: "0", baseTokenName: "NVDA", quoteTokenName: "USD" },
          { symbol: "META", name: "Meta Platforms Inc.", displayName: "META", type: "stock", exchange: "NASDAQ", price: "0", baseTokenName: "META", quoteTokenName: "USD" },
        ];

        return {
          stocks: fallbackStocks,
          total: fallbackStocks.length,
        };
      }
    },
    staleTime: 1000 * 60 * 60, 
  });
}