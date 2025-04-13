"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

interface Stock {
  ticker: string;
  name: string;
  change: number;
}

interface StockData extends Stock {
  price: string;
  isUp: boolean;
}

// Import the SP500 stocks
import stocks from "../data/sp500.json";

const StockBottomBar: React.FC = () => {
  const router = useRouter();
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [isHoveringBar, setIsHoveringBar] = useState<boolean>(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<Animation | null>(null);

  const selectedStocks: Stock[] = stocks.slice(0, 20);
  const allStocks: Stock[] = [...selectedStocks, ...selectedStocks];

  useEffect(() => {
    const fetchStockData = async (): Promise<void> => {
      try {
        const results: StockData[] = selectedStocks.map((stock: Stock) => {
          return {
            ...stock,
            price: "100.00",
            isUp: stock.change >= 0,
          };
        });

        setStockData(results);
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };

    fetchStockData();

    const intervalId = setInterval(fetchStockData, 60000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || stockData.length === 0) return;

    if (animationRef.current) {
      animationRef.current.cancel();
    }

    const animation = container.animate(
      [
        { transform: "translateX(0)" },
        { transform: `translateX(-${selectedStocks.length * 110}px)` },
      ],
      {
        duration: 40000,
        iterations: Infinity,
        easing: "linear",
      }
    );

    animationRef.current = animation;

    return () => {
      animation.cancel();
    };
  }, [stockData, selectedStocks.length]);

  useEffect(() => {
    if (!animationRef.current) return;

    if (isHoveringBar) {
      animationRef.current.playbackRate = 0.7;
    } else {
      animationRef.current.playbackRate = 1.0;
    }
  }, [isHoveringBar]);

  const [ mounted, setMounted ] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);

    return () => clearTimeout(timer);
  }
  , []);

  return (
    <div className={`${ mounted ? "opacity-100" : "opacity-0" } duration-1000 transition-all`}>
      <div
        className={`w-full ${
          isHoveringBar ? "bg-black bg-opacity-25" : "bg-black bg-opacity-15"
        } h-8 overflow-hidden fixed bottom-0 left-0 transition-colors duration-300`}
        onMouseEnter={() => setIsHoveringBar(true)}
        onMouseLeave={() => {
          setIsHoveringBar(false);
          setHoveredIndex(null);
        }}
      >
        <div
          ref={containerRef}
          className="flex items-center h-full whitespace-nowrap px-2"
        >
          {stockData.length > 0 ? (
            allStocks.map((stock, index) => {
              const data = stockData[index % stockData.length];
              const isHovered = hoveredIndex === index;
              const shouldFade = hoveredIndex !== null && !isHovered;

              return (
                <div
                  key={`${stock.ticker}-${index}`}
                  className={`inline-flex items-center px-3 mx-1 h-8 transition-opacity duration-300 ${
                    shouldFade ? "opacity-50" : "opacity-100"
                  } cursor-pointer`}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    try {
                      console.log(`Attempting to navigate to stock: ${stock.ticker}`);
                      
                      // Alternative navigation method
                      window.location.href = `/dashboard/stocks?ticker=${stock.ticker}`;
                      
                      // Fallback router push
                      router.push(`/dashboard/stocks?ticker=${stock.ticker}`);
                    } catch (error) {
                      console.error('Navigation failed:', error);
                    }
                  }}
                >
                  <span className="font-medium text-xs text-gray-200 mr-2">
                    {stock.ticker}
                  </span>
                  <span className="text-xs text-gray-400 mr-2">
                    ${data?.price || "N/A"}
                  </span>
                  <span
                    className={`text-xs ${
                      data?.isUp ? "text-green-400" : "text-orange-400"
                    }`}
                  >
                    {data?.isUp ? "+" : ""}
                    {data?.change.toFixed(2)}%
                  </span>
                </div>
              );
            })
          ) : (
            <div className="text-center w-full text-gray-300 text-xs">
              Loading stock data...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockBottomBar;