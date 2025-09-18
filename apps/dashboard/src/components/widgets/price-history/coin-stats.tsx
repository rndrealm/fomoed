import { Close } from '@/components/icons/icons';
import { useSupabaseAuth } from '@/components/providers';
import { Skeleton } from '@/components/ui/skeleton';
import { formatMarketCapNumber, modalSlide } from '@/lib/utils';
import { BinanceKlineFormatted } from '@/services/queries/charts/types';
import { useReadSantimentMarketCap, useReadSantimentVolume } from '@/services/queries/santiment';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import React, { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'

interface IProps {
  setShowTokenStats: Dispatch<SetStateAction<boolean>>
  performanceMetrics: {
    isPositive: boolean;
    change: number;
    changePercent: number;
    currentPrice: any;
    startPrice: any;
    high: number;
    low: number;
  };
  oneYearMetrics: {
    high: number;
    low: number;
  };
  selectedPeriod: string;
  filteredData: BinanceKlineFormatted[];
  token: string;
  containerWidth?: number; // Add container width prop
}

const tokenMapping: Record<string, string> = {
  btc: "bitcoin",
  eth: "ethereum",
};

export default function PriceChartCoinStats(props: IProps) {
  const { setShowTokenStats, performanceMetrics, oneYearMetrics, selectedPeriod, filteredData, token, containerWidth = 500 } = props;

  const router = useRouter();
  const { session } = useSupabaseAuth();

  // Determine container size based on width prop
  const containerSize = useMemo(() => {
    if (containerWidth < 600) return 'small';
    if (containerWidth < 800) return 'medium'; 
    return 'large';
  }, [containerWidth]);

  // Responsive styling based on container size
  const getResponsiveClasses = () => {
    switch (containerSize) {
      case 'small':
        return {
          modal: 'px-2 py-2',
          title: 'text-sm pl-2',
          content: 'gap-2',
          grid: 'text-xs gap-1 px-2',
          gridItem: 'space-y-1.5 pr-1',
          spacing: 'pb-2',
          button: 'h-[22px] text-xs',
          newsButton: 'text-xs ml-2'
        };
      case 'medium':
        return {
          modal: 'px-4 py-3',
          title: 'text-base pl-3',
          content: 'gap-3',
          grid: 'text-sm gap-2 px-3',
          gridItem: 'space-y-2.5 pr-2',
          spacing: 'pb-2',
          button: 'h-[24px] text-sm',
          newsButton: 'text-sm ml-3'
        };
      default:
        return {
          modal: 'px-5 py-4',
          title: 'text-base pl-4',
          content: 'gap-4',
          grid: 'text-sm gap-2.5 px-4',
          gridItem: 'space-y-3 pr-1 md:pr-2.5',
          spacing: 'pb-4',
          button: 'h-[26px] text-sm',
          newsButton: 'text-sm ml-4'
        };
    }
  };

  const classes = getResponsiveClasses();

  const formatPrice = (price?: number) => {
    if(price === undefined) return
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatLargeNumber = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(value);;
  };

  const getSantimentTimeframe = useCallback(() => {
    const getFrom = (days: number) => `utc_now-${days - 1}d`;
  
    let from: string;
    let interval: "5m" | "1h" | "8h" | "1d" |  "";
  
    switch (selectedPeriod) {
      case "1D":
        from = getFrom(2);
        interval = "5m";
        break;
      case "1W":
        from = getFrom(7);
        interval = "1d";
        break;
      case "1M":
        from = getFrom(30);
        interval = "1d";
        break;
      case "3M":
        from = getFrom(90);
        interval = "1d";
        break;
      case "6M":
        from = getFrom(180);
        interval = "1d";
        break;
      case "YTD": {
        const now = new Date();
        const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1)); 
        
        from = startOfYear.toISOString();
        interval = "1d";
        break;
      }
      case "1Y":
        from = getFrom(365);
        interval = "1d";
        break;
      case "ALL": {
        const totalPoints = filteredData.length;
        const daysBack = totalPoints * 7;
        from = getFrom(daysBack);
        interval = "1d";
        break;
      }
      default:
        from = getFrom(30);
        interval = "1d";
    }
  
      return { from, to: "utc_now", interval };
    }, [filteredData.length, selectedPeriod]);
  
    const { from, to, interval } = getSantimentTimeframe();
  
    const { data: santimentVolumeRaw } = useReadSantimentVolume({
      token: tokenMapping[token.toLowerCase()],
      from,
      to,
      interval,
      auth_token: session?.access_token,
    });
  
    const santimentVolume = useMemo(() => {
      if (!santimentVolumeRaw) return [];
      if (selectedPeriod === "1D") {
        return santimentVolumeRaw.length > 0
          ? [santimentVolumeRaw[santimentVolumeRaw.length - 1]]
          : [];
      }
      return santimentVolumeRaw;
    }, [santimentVolumeRaw, selectedPeriod]);
  
    const volumeMetrics = useMemo(() => {
      if (!santimentVolume || santimentVolume.length === 0)
        return { totalVolume: 0, avgVolume: 0 };
  
      const totalVolume = santimentVolume.reduce((sum, d) => sum + d.value, 0);
  
      return {
        totalVolume,
        avgVolume: totalVolume / santimentVolume.length,
      };
    }, [santimentVolume]);
  
      const {data: santimentMarketcap } = useReadSantimentMarketCap({
      token: tokenMapping[token.toLowerCase()],
      interval: "5m",
      auth_token: session?.access_token,
    })
  
  return (
    <div className="absolute top-0 right-[10px] bottom-0 -left-2 z-99 flex items-end">
      <motion.div
        className={`scrollbar max-h-full w-full md:w-9/10 overflow-auto rounded-[22px] bg-[#141414] ${classes.modal}`}
        variants={modalSlide}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        <div className={`flex flex-col ${classes.content}`}>
          <div className={`flex flex-col ${classes.content}`}>
            <div className={`flex justify-between items-center ${classes.spacing}`}>
              <h3 className={`${classes.title} leading-[1.35] font-semibold text-white`}>View Coin Stats</h3>
              <div className="flex justify-end">
                <button
                  type="button"
                  className={`flex ${classes.button} items-center justify-center gap-1 rounded-[40px]`}
                  onClick={() => {
                    setShowTokenStats(false);
                  }}
                >
                  <div className="">
                    <Close fill="#878787" />
                  </div>
                </button>
              </div>
            </div>
            {/* Statistics Grid */}
            <div className={`grid grid-cols-3 ${classes.grid} border-b border-[#242424]`}>
              <div className={`${classes.gridItem} border-r border-[#242424]`}>
                <div className="flex justify-between">
                  <span className="text-gray-400">Open</span>
                  {!performanceMetrics.startPrice ? (
                      <Skeleton className={`mb-1 ${containerSize === 'small' ? 'w-10 h-3' : containerSize === 'medium' ? 'w-14 h-4' : 'w-16 h-4'}`} />
                    ) : (
                      <span className="text-white">{formatPrice(performanceMetrics.startPrice)}</span>
                    )
                  }
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">High</span>
                  {!performanceMetrics.high ? (
                      <Skeleton className={`mb-1 ${containerSize === 'small' ? 'w-10 h-3' : containerSize === 'medium' ? 'w-14 h-4' : 'w-16 h-4'}`} />
                    ) : (
                      <span className="text-white">{formatPrice(performanceMetrics.high)}</span>
                    )
                  }
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Low</span>
                  {!performanceMetrics.low ? (
                      <Skeleton className={`mb-1 ${containerSize === 'small' ? 'w-10 h-3' : containerSize === 'medium' ? 'w-14 h-4' : 'w-16 h-4'}`} />
                    ) : (
                      <span className="text-white">{formatPrice(performanceMetrics.low)}</span>
                    )
                  }
                </div>
              </div>
              
              <div className={`${classes.gridItem} border-r border-[#242424]`}>
                <div className="flex justify-between">
                  <span className="text-gray-400">Vol</span>
                  {!volumeMetrics.totalVolume ? (
                      <Skeleton className={`mb-1 ${containerSize === 'small' ? 'w-10 h-3' : containerSize === 'medium' ? 'w-14 h-4' : 'w-16 h-4'}`} />
                    ) : (
                      <span className="text-white">{formatLargeNumber(volumeMetrics.totalVolume)}</span>
                    )
                  }
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Vol</span>
                  {!volumeMetrics.avgVolume ? (
                      <Skeleton className={`mb-1 ${containerSize === 'small' ? 'w-10 h-3' : containerSize === 'medium' ? 'w-14 h-4' : 'w-16 h-4'}`} />
                    ) : (
                      <span className="text-white">{formatLargeNumber(volumeMetrics.avgVolume)}</span>
                    )
                  }
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Mkt Cap</span>
                  {!santimentMarketcap ? (
                      <Skeleton className={`mb-1 ${containerSize === 'small' ? 'w-10 h-3' : containerSize === 'medium' ? 'w-14 h-4' : 'w-16 h-4'}`} />
                    ) : (
                      <span className="text-white">{formatMarketCapNumber(santimentMarketcap || "")}</span>
                    )
                  }
                </div>
              </div>
              
              <div className={`${classes.gridItem}`}>
                <div className="flex justify-between">
                  <span className="text-gray-400">52W H</span>
                  {!oneYearMetrics.high ? (
                      <Skeleton className={`mb-1 ${containerSize === 'small' ? 'w-10 h-3' : containerSize === 'medium' ? 'w-14 h-4' : 'w-16 h-4'}`} />
                    ) : (
                      <span className="text-white">{formatPrice(oneYearMetrics.high)}</span>
                    )
                  }
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">52W L</span>
                  {!oneYearMetrics.low ? (
                      <Skeleton className={`mb-1 ${containerSize === 'small' ? 'w-10 h-3' : containerSize === 'medium' ? 'w-14 h-4' : 'w-16 h-4'}`} />
                    ) : (
                      <span className="text-white">{formatPrice(oneYearMetrics.low)}</span>
                    )
                  }
                </div>
              </div>
            </div>
            <div className={`${containerSize === 'small' ? 'py-1' : containerSize === 'medium' ? 'py-2' : 'py-3'}`}>
              <button
                className={`text-[#167AFD] ${classes.newsButton}`}
                onClick={() => {
                  router.push("/news")
                }}
              >
                In the News &gt;
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
