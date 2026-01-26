import { useState, useEffect, useCallback, useRef } from 'react';
import { MergedBar, HeatmapResult, Config, DEFAULT_CONFIG } from '@/services/queries/new-liquidation-heatmap/types';
import { fetchMergedData, fetchCurrentPrice } from '@/services/queries/new-liquidation-heatmap/binanceApi';
import { calculateLiquidationHeatmap } from '@/services/queries/new-liquidation-heatmap/liquidationCalculator';

interface UseLiquidationDataReturn {
  bars: MergedBar[];
  result: HeatmapResult;
  currentPrice: number;
  loading: boolean;
  error: string | null;
  config: Config;
  setConfig: (config: Config) => void;
  refresh: () => Promise<void>;
  connected: boolean;
}

export function useLiquidationData(initialConfig: Config = DEFAULT_CONFIG): UseLiquidationDataReturn {
  const [config, setConfig] = useState<Config>(initialConfig);
  const [bars, setBars] = useState<MergedBar[]>([]);
  const [result, setResult] = useState<HeatmapResult>({
    longs: [],
    shorts: [],
    currentPrice: 0,
    priceRange: [0, 0],
  });
  const [currentPrice, setCurrentPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const currentSymbolRef = useRef(config.symbol);

  useEffect(() => {
    currentSymbolRef.current = config.symbol;
  }, [config.symbol]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const symbolAtStart = config.symbol;

    try {
      console.log(`Fetching data for ${config.symbol}...`);

      const { bars: mergedBars, currentPrice: price } = await fetchMergedData(
        config.symbol,
        config.interval,
        config.lookbackHours
      );

      if (currentSymbolRef.current !== symbolAtStart) {
        console.log(`Symbol changed during fetch, ignoring results for ${symbolAtStart}`);
        return;
      }

      console.log(`Received ${mergedBars.length} bars, price: ${price}`);
      setBars(mergedBars);
      setCurrentPrice(price);

      const heatmapResult = calculateLiquidationHeatmap(mergedBars, config, price);
      console.log(
        `Calculated ${heatmapResult.longs.length} long levels, ${heatmapResult.shorts.length} short levels`
      );
      setResult(heatmapResult);
      setConnected(true);
    } catch (err) {
      console.error('Error fetching data:', err);
      if (currentSymbolRef.current === symbolAtStart) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setConnected(false);
      }
    } finally {
      if (currentSymbolRef.current === symbolAtStart) {
        setLoading(false);
      }
    }
  }, [config]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchData();
    }, 30000);

    return () => clearInterval(pollInterval);
  }, [fetchData]);

  useEffect(() => {
    let isActive = true;

    const priceInterval = setInterval(async () => {
      const symbolForThisFetch = currentSymbolRef.current;
      
      try {
        const price = await fetchCurrentPrice(symbolForThisFetch);
        
        if (isActive && currentSymbolRef.current === symbolForThisFetch) {
          setCurrentPrice(price);
          setConnected(true);
        }
      } catch (err) {
        console.error('Error fetching price:', err);
        if (isActive && currentSymbolRef.current === symbolForThisFetch) {
          setConnected(false);
        }
      }
    }, 1000);

    return () => {
      isActive = false;
      clearInterval(priceInterval);
    };
  }, [config.symbol]); 

  return {
    bars,
    result,
    currentPrice,
    loading,
    error,
    config,
    setConfig,
    refresh: fetchData,
    connected,
  };
}