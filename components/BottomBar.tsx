"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

// Define types for stock data
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

  // Select first 20 stocks from the SP500 data
  const selectedStocks: Stock[] = stocks.slice(0, 20);

  // For the carousel effect, we duplicate the stocks
  const allStocks: Stock[] = [...selectedStocks, ...selectedStocks];

  useEffect(() => {
    const fetchStockData = async (): Promise<void> => {
      try {
        // Now using the change value directly from JSON
        const results: StockData[] = selectedStocks.map((stock: Stock) => {
          return {
            ...stock,
            price: "100.00", // Placeholder price since we're not using Polygon API anymore
            isUp: stock.change >= 0,
          };
        });

        setStockData(results);
      } catch (error) {
        console.error("Error processing stock data:", error);
      }
    };

    fetchStockData();
  }, []);

  // Set up animation
  useEffect(() => {
    const container = containerRef.current;
    if (!container || stockData.length === 0) return;

    // Cancel previous animation if it exists
    if (animationRef.current) {
      animationRef.current.cancel();
    }

    // Initial position setup
    const animation = container.animate(
      [
        { transform: "translateX(0)" },
        { transform: `translateX(-${selectedStocks.length * 110}px)` },
      ],
      {
        duration: 40000, // 40 seconds for one complete scroll
        iterations: Infinity,
        easing: "linear",
      }
    );

    animationRef.current = animation;

    return () => {
      animation.cancel();
    };
  }, [stockData, selectedStocks.length]);

  // Handle hover effect on the bar
  useEffect(() => {
    if (!animationRef.current) return;

    if (isHoveringBar) {
      // Slow down the animation when hovering
      animationRef.current.playbackRate = 0.7;
    } else {
      // Normal speed when not hovering
      animationRef.current.playbackRate = 1.0;
    }
  }, [isHoveringBar]);

  return (
    <div
      className={`w-full ${
        isHoveringBar ? "bg-black bg-opacity-25" : "bg-black bg-opacity-15"
      } h-8 overflow-hidden fixed bottom-0 left-0 transition-colors duration-300`}
      onMouseEnter={() => setIsHoveringBar(true)}
      onMouseLeave={() => {
        setIsHoveringBar(false);
        setHoveredIndex(null); // Clear hover when leaving the bar
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
                onClick={() =>
                  router.push(`/dashboard/stocks?ticker=${stock.ticker}`)
                }
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
  );
};

export default StockBottomBar;
