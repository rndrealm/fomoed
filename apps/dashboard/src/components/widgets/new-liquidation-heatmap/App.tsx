import { useState, useEffect, useRef } from "react";
import { LiquidationHeatmap } from "./LiquidationHeatmap";
import { SearchableDropdown } from "./SearchableDropdown";
import { useLiquidationData } from "@/lib/hooks/useLiquidationData";
import { DEFAULT_CONFIG, Config } from "@/services/queries/new-liquidation-heatmap/types";
import { Menu, X } from "lucide-react";
import { fetchAvailableSymbols, SymbolInfo } from "@/services/queries/new-liquidation-heatmap/symbolService";

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const [dimensions, setDimensions] = useState({
    width: 1200,
    height: 600,
  });

  const [isMobile, setIsMobile] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [allSymbols, setAllSymbols] = useState<SymbolInfo[]>([]);
  const [loadingSymbols, setLoadingSymbols] = useState(true);

  const [config, setConfigState] = useState<Config>(DEFAULT_CONFIG);
  const { bars, result, currentPrice, loading, error, refresh, setConfig, connected } = useLiquidationData(config);

  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const availableHeight = rect.height;

      let usedHeight = 0;
      if (headerRef.current) usedHeight += headerRef.current.offsetHeight;
      if (controlsRef.current && (!isMobile || showControls)) usedHeight += controlsRef.current.offsetHeight;
      if (statsRef.current && !isMobile) usedHeight += statsRef.current.offsetHeight;
      if (error) usedHeight += 40;

      const safetyMargin = 10;

      const chartHeight = Math.max(
        Math.min(availableHeight - usedHeight - safetyMargin, availableHeight),
        200,
      );

      setDimensions({
        width: rect.width,
        height: chartHeight,
      });
    };

    const timer = setTimeout(updateDimensions, 100);

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateDimensions);
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
    };
  }, [showControls, error, isMobile]);

  useEffect(() => {
    async function loadSymbols() {
      setLoadingSymbols(true);
      try {
        const symbols = await fetchAvailableSymbols();
        setAllSymbols(symbols);
      } catch (error) {
        console.error("Failed to load symbols:", error);
      } finally {
        setLoadingSymbols(false);
      }
    }
    loadSymbols();
  }, []);

  const handleSymbolChange = (symbol: string) => {
    const newConfig = { ...config, symbol };
    setConfigState(newConfig);
    setConfig(newConfig);
  };

  const handleIntervalChange = (interval: string) => {
    const newConfig = { ...config, interval };
    setConfigState(newConfig);
    setConfig(newConfig);
  };

  const handleLookbackChange = (hours: number) => {
    const newConfig = { ...config, lookbackHours: hours };
    setConfigState(newConfig);
    setConfig(newConfig);
  };

  return (
    <div
      ref={containerRef}
      style={{
        background: "#000000",
        width: "100%",
        height: "100%",
        minHeight: 0, 
        overflow: "hidden", 
        color: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: isMobile ? "10px 15px" : "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #2a2a2a",
          background: "#0a0a0a",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: isMobile ? "1 1 100%" : "auto" }}>
          <h1
            style={{
              margin: 0,
              fontSize: isMobile ? "16px" : "18px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {isMobile ? "Fomoed's Heatmap" : "Fomoed's Liquidation Heatmap"}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "10px",
                fontWeight: "normal",
                padding: "3px 8px",
                borderRadius: "10px",
                background: connected ? "rgba(74, 222, 128, 0.15)" : "rgba(239, 68, 68, 0.15)",
                color: connected ? "#4ade80" : "#ef4444",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: connected ? "#4ade80" : "#ef4444",
                  animation: connected ? "pulse 2s infinite" : "none",
                }}
              />
              {connected ? "LIVE" : "OFF"}
            </span>
          </h1>

          {isMobile && (
            <button
              onClick={() => setShowControls(!showControls)}
              style={{
                marginLeft: "auto",
                background: "#1a1a1a",
                border: "1px solid #404040",
                borderRadius: "4px",
                padding: "6px",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              {showControls ? <X size={18} /> : <Menu size={18} />}
            </button>
          )}
        </div>

        {currentPrice > 0 && !isMobile && (
          <div style={{ fontSize: "14px", marginLeft: "auto" }}>
            <span style={{ color: "#737373" }}>Current: </span>
            <span style={{ color: "#ffffff", fontWeight: "bold" }}>
              ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      {(!isMobile || showControls) && (
        <div
          ref={controlsRef}
          style={{
            padding: isMobile ? "10px 15px" : "12px 20px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: isMobile ? "10px" : "20px",
            borderBottom: "1px solid #2a2a2a",
            background: "#0a0a0a",
            flexShrink: 0,
            minHeight: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flex: isMobile ? "1 1 calc(50% - 5px)" : "auto",
            }}
          >
            <label style={{ fontSize: isMobile ? "11px" : "12px", color: "#737373", whiteSpace: "nowrap" }}>
              Symbol:
            </label>
            <SearchableDropdown
              symbols={allSymbols}
              value={config.symbol}
              onChange={handleSymbolChange}
              loading={loadingSymbols}
              isMobile={isMobile}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flex: isMobile ? "1 1 calc(50% - 5px)" : "auto",
            }}
          >
            <label style={{ fontSize: isMobile ? "11px" : "12px", color: "#737373", whiteSpace: "nowrap" }}>
              Interval:
            </label>
            <select
              value={config.interval}
              onChange={(e) => handleIntervalChange(e.target.value)}
              style={{
                background: "#1a1a1a",
                color: "#fff",
                border: "1px solid #404040",
                borderRadius: "4px",
                padding: isMobile ? "5px 8px" : "6px 10px",
                fontSize: isMobile ? "12px" : "13px",
                flex: 1,
                minWidth: 0,
              }}
            >
              <option value="1m">1m</option>
              <option value="5m">5m</option>
              <option value="15m">15m</option>
              <option value="1h">1h</option>
              <option value="4h">4h</option>
            </select>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flex: isMobile ? "1 1 calc(50% - 5px)" : "auto",
            }}
          >
            <label style={{ fontSize: isMobile ? "11px" : "12px", color: "#737373", whiteSpace: "nowrap" }}>
              Lookback:
            </label>
            <select
              value={config.lookbackHours}
              onChange={(e) => handleLookbackChange(parseInt(e.target.value))}
              style={{
                background: "#1a1a1a",
                color: "#fff",
                border: "1px solid #404040",
                borderRadius: "4px",
                padding: isMobile ? "5px 8px" : "6px 10px",
                fontSize: isMobile ? "12px" : "13px",
                flex: 1,
                minWidth: 0,
              }}
            >
              <option value="24">24h</option>
              <option value="48">48h</option>
              <option value="72">72h</option>
              <option value="168">7d</option>
            </select>
          </div>

          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label style={{ fontSize: "12px", color: "#737373" }}>Leverages:</label>
              <span style={{ fontSize: "13px", color: "#d4d4d4" }}>{config.leverages.join("x, ")}x</span>
            </div>
          )}

          <button
            onClick={refresh}
            disabled={loading}
            style={{
              background: loading ? "#262626" : "#404040",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              padding: isMobile ? "6px 12px" : "6px 16px",
              fontSize: isMobile ? "12px" : "13px",
              cursor: loading ? "wait" : "pointer",
              flex: isMobile ? "1 1 calc(50% - 5px)" : "auto",
              touchAction: "manipulation",
            }}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>

          {isMobile && currentPrice > 0 && (
            <div style={{ fontSize: "13px", flex: "1 1 100%", textAlign: "center" }}>
              <span style={{ color: "#737373" }}>Current: </span>
              <span style={{ color: "#ffffff", fontWeight: "bold" }}>
                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Error display */}
      {error && (
        <div
          style={{
            padding: isMobile ? "8px 15px" : "10px 20px",
            background: "#1a0a0a",
            color: "#ef4444",
            fontSize: isMobile ? "12px" : "13px",
          }}
        >
          Error: {error}
        </div>
      )}

      {/* Stats bar  */}
      {!isMobile && (
        <div
        className="no-scrollbar"
          ref={statsRef}
          style={{
            padding: "8px 20px",
            display: "flex",
            gap: "30px",
            fontSize: "12px",
            color: "#737373",
            background: "#0a0a0a",
            overflowX: "auto",
            flexShrink: 0,
            minHeight: 0,
          }}
        >
          <span style={{ whiteSpace: "nowrap" }}>
            Long Levels: <span style={{ color: "#d4d4d4" }}>{result.longs.length}</span>
          </span>
          <span style={{ whiteSpace: "nowrap" }}>
            Short Levels: <span style={{ color: "#a3a3a3" }}>{result.shorts.length}</span>
          </span>
          <span style={{ whiteSpace: "nowrap" }}>
            Total Long Contracts:{" "}
            <span style={{ color: "#d4d4d4" }}>
              {result.longs
                .reduce((a, l) => a + l.contracts, 0)
                .toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </span>
          <span style={{ whiteSpace: "nowrap" }}>
            Total Short Contracts:{" "}
            <span style={{ color: "#a3a3a3" }}>
              {result.shorts
                .reduce((a, l) => a + l.contracts, 0)
                .toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </span>
          <span style={{ whiteSpace: "nowrap" }}>
            Data Points: <span style={{ color: "#fff" }}>{bars.length}</span>
          </span>
        </div>
      )}

      {/* Chart */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* CLAMP LAYER */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            display: "flex",
          }}
        >
          {/* CHART HOST  */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
            }}
          >
            <LiquidationHeatmap
              bars={bars}
              result={result}
              currentPrice={currentPrice}
              width={dimensions.width}
              height={dimensions.height}
              isMobile={isMobile}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
