"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    collection, 
    getDocs, 
    query, 
    orderBy, 
    where,
    doc,
    getDoc,
    documentId
  } from 'firebase/firestore';
  import { 
    onAuthStateChanged, 
    User as FirebaseUser 
  } from 'firebase/auth';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Post from '../components/post';
import PostModal from '../components/postModal';
import { useRouter } from 'next/navigation';
import { app, auth, db } from '@/lib/firebase.client';

type TimeRange = 'week' | 'month' | 'year' | 'all';

type StockDataPoint = {
  date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
};

type Post = {
  id: number;
  username: string;
  handle: string;
  verified: boolean;
  content: string;
  timestamp: string;
  positiveTickers: string[];
  negativeTickers: string[];
  report: string;
  stocks: {
    primaryRating: string;
    strongBuyPercent: number;
    buyPercent: number;
    holdPercent: number;
    sellPercent: number;
    strongSellPercent: number;
    rationale: string;
  }[];
};

type StockInfo = {
  ticker: string;
  posts: Post[];
};

const DayStockInfo = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-black/80 p-4 rounded-lg border border-neutral-700 text-sm">
        <p className="font-bold text-white mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-blue-300">Close: ${data.close.toFixed(2)}</p>
          <p className="text-green-300">Open: ${data.open?.toFixed(2) || 'N/A'}</p>
          <p className="text-red-300">High: ${data.high?.toFixed(2) || 'N/A'}</p>
          <p className="text-yellow-300">Low: ${data.low?.toFixed(2) || 'N/A'}</p>
          <p className="text-purple-300">Volume: {data.volume?.toLocaleString() || 'N/A'}</p>
        </div>
      </div>
    );
  }
  return null;
};

export default function StocksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ticker, setTicker] = useState(searchParams.get('ticker') || 'TSLA');
  const [stockData, setStockData] = useState<StockDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [companyName, setCompanyName] = useState('');
  
  const completeStockDataRef = useRef<StockDataPoint[]>([]);

  const [initialDataFetched, setInitialDataFetched] = useState(false);

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const [stockPosts, setStockPosts] = useState<Post[]>([]);

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
  };

  const handleCloseModal = () => {
    setSelectedPost(null);
  };

  const selectTimeRangeData = useCallback((range: TimeRange) => {
    if (!completeStockDataRef.current.length) return;

    let selectedData: StockDataPoint[] = [];
    switch (range) {
      case 'week':
        selectedData = completeStockDataRef.current.slice(-7);
        break;
      case 'month':
        selectedData = completeStockDataRef.current.slice(-30);
        break;
      case 'year':
        selectedData = completeStockDataRef.current.slice(-365);
        break;
      case 'all':
        selectedData = completeStockDataRef.current;
        break;
    }

    setStockData(selectedData);
    setTimeRange(range);
  }, []);

  useEffect(() => {
    const tickerParam = searchParams.get('ticker');
    if (tickerParam && !initialDataFetched) {
      setTicker(tickerParam);
      fetchStockData(tickerParam);
    }
  }, [searchParams, initialDataFetched]);

  const fetchStockPosts = useCallback(async () => {
    if (!ticker) return;

    try {
      const eventsRef = collection(db, 'events');
      const q = query(
        eventsRef, 
        where('stock_tickers', 'array-contains', ticker),
        orderBy('timestamp', 'desc')
      );
      
      const eventSnapshot = await getDocs(q);
      const fetchedEvents = eventSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      const accountIds = [...new Set(fetchedEvents.map(event => event.trigger_account_id))];
      
      const accountPromises = accountIds.map(async (accountId) => {
        try {
          const docRef = doc(db, 'accounts', accountId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const accountData = docSnap.data();
            return {
              id: docSnap.id,
              username: accountData.username,
              handle: accountData.name
            };
          }
          return null;
        } catch (error) {
          console.error(`Error fetching account ${accountId}:`, error);
          return null;
        }
      });

      const accountResults = await Promise.all(accountPromises);
      
      const accountsMap: Record<string, any> = accountResults.reduce((acc, account) => {
        if (account) {
          acc[account.id] = {
            username: account.username,
            handle: account.handle
          };
        }
        return acc;
      }, {});

      const reformattedPosts: Post[] = fetchedEvents.map((event, index) => {
        const account = accountsMap[event.trigger_account_id];

        return {
          id: index,
          username: account.username,
          handle: account.handle,
          verified: true,
          content: event.summary || '',
          timestamp: event.timestamp,
          positiveTickers: event.stock_tickers || [],
          negativeTickers: [],
          report: event.detailed_report || '',
          stocks: (event.stock_tickers || []).map(tickerItem => ({
            ticker: tickerItem,
            primaryRating: event.recommendation?.[tickerItem]?.sentiment || 'Neutral',
            strongBuyPercent: event.recommendation?.[tickerItem]?.rec?.strongBuy || 0,
            buyPercent: event.recommendation?.[tickerItem]?.rec?.buy || 0,
            holdPercent: event.recommendation?.[tickerItem]?.rec?.hold || 0,
            sellPercent: event.recommendation?.[tickerItem]?.rec?.sell || 0,
            strongSellPercent: event.recommendation?.[tickerItem]?.rec?.strongSell || 0,
            rationale: event.recommendation?.[tickerItem]?.reasoning || 'No specific rationale available'
          }))
        };
      });

      return reformattedPosts;
    } catch (error) {
      console.error('Error fetching stock-specific posts:', error);
      return [];
    }
  }, [ticker]);

  useEffect(() => {
    const loadStockPosts = async () => {
      const posts = await fetchStockPosts();
      setStockPosts(posts || []);
    };

    if (ticker) {
      loadStockPosts();
    }
  }, [ticker, fetchStockPosts]);

  const fetchStockData = async (symbol: string) => {
    if (initialDataFetched) return;

    setLoading(true);
    setError('');

    try {
      const detailsResponse = await axios.get(`https://api.polygon.io/v3/reference/tickers/${symbol}`, {
        params: {
          apiKey: process.env.NEXT_PUBLIC_POLYGON_API_KEY
        }
      });

      setCompanyName(detailsResponse.data.results.name);

      const now = new Date();
      const toDate = now.toISOString().split('T')[0];
      const fiveYearsAgo = new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000);
      const fromDate = fiveYearsAgo.toISOString().split('T')[0];

      const response = await axios.get(`https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${fromDate}/${toDate}`, {
        params: {
          apiKey: process.env.NEXT_PUBLIC_POLYGON_API_KEY
        }
      });

      console.log("CALLED");

      if (!response.data.results || response.data.results.length === 0) {
        throw new Error('No stock data available.');
      }

      const formattedData = response.data.results.map((item: any) => ({
        date: new Date(item.t).toISOString().split('T')[0],
        close: item.c,
        open: item.o,
        high: item.h,
        low: item.l,
        volume: item.v
      })).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

      completeStockDataRef.current = formattedData;
      selectTimeRangeData('month');
      setInitialDataFetched(true);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to fetch stock data. Please try again.';
      
      setError(errorMessage);
      console.error('Stock Data Fetch Error:', err);
      selectTimeRangeData('month');
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentChange = (stockData: StockDataPoint[]): string => {
    if (stockData.length < 2) return '0.00';
    const latestData = stockData[stockData.length - 1];
    const previousData = stockData[stockData.length - 2];
    const percentChange = ((latestData.close - previousData.close) / previousData.close) * 100;
    return percentChange.toFixed(2);
  };

  const timeRangeButtons: { label: string, value: TimeRange }[] = [
    { label: '1W', value: 'week' },
    { label: '1M', value: 'month' },
    { label: '1Y', value: 'year' },
    { label: 'All', value: 'all' }
  ];

  const getRecommendationContent = () => {
    const emptyRecommendation = {
      primaryRating: 'No Data',
      strongBuyPercent: 0,
      buyPercent: 0,
      holdPercent: 0,
      sellPercent: 0,
      strongSellPercent: 0,
      rationale: 'No AI insights available for this stock.'
    };

    // Find the most recent post for the current ticker
    const relevantPosts = stockPosts.filter(post => 
      post.positiveTickers.includes(ticker) || 
      post.stocks.some(stock => stock.ticker === ticker)
    );

    // Sort posts by timestamp in descending order and get the most recent
    const latestPost = relevantPosts.length > 0 
      ? relevantPosts.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0]
      : null;

    // Get the stock recommendation from the latest post
    const stockRecommendation = latestPost?.stocks?.find(stock => stock.ticker === ticker) || emptyRecommendation;
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <span className="text-neutral-300 text-sm font-bold">
            Primary Rating: {stockRecommendation.primaryRating}
          </span>
        </div>

        <div className="space-y-2">
          {[
            { label: 'Strong Buy', value: stockRecommendation.strongBuyPercent },
            { label: 'Buy', value: stockRecommendation.buyPercent },
            { label: 'Hold', value: stockRecommendation.holdPercent },
            { label: 'Sell', value: stockRecommendation.sellPercent },
            { label: 'Strong Sell', value: stockRecommendation.strongSellPercent }
          ].map((item, idx) => {
            const maxValue = Math.max(
              stockRecommendation.strongBuyPercent,
              stockRecommendation.buyPercent,
              stockRecommendation.holdPercent,
              stockRecommendation.sellPercent,
              stockRecommendation.strongSellPercent
            );
            
            const getColorClass = () => {
              if (item.value === 0) 
                return 'bg-neutral-900/30 text-neutral-300 border border-neutral-800 hover:bg-neutral-800/40';
              
              if (item.label.includes('Buy') && item.value === maxValue) 
                return 'bg-emerald-900/40 text-emerald-100 ring-2 ring-emerald-800 scale-105';
              if (item.label.includes('Sell') && item.value === maxValue) 
                return 'bg-red-900/40 text-red-100 ring-2 ring-red-800 scale-105';
              if (item.label === 'Hold' && item.value === maxValue) 
                return 'bg-yellow-900/40 text-yellow-100 ring-2 ring-yellow-800 scale-105';
              return 'bg-neutral-900/30 text-neutral-300 border border-neutral-800 hover:bg-neutral-800/40';
            };

            return (
              <div 
                key={item.label} 
                className={`
                  w-full p-2 rounded-lg flex justify-between items-center transition-all duration-300 ease-in-out
                  ${getColorClass()}
                `}
              >
                <span className="text-xs font-semibold">{item.label}</span>
                <span className="text-sm font-bold">{item.value}%</span>
              </div>
            );
          })}
        </div>

        <div className="p-2">
          <h3 className="text-md font-semibold text-neutral-300 mb-1">AI Insight</h3>
          <p className="text-neutral-300 text-sm mt-4">
            {stockRecommendation.rationale}
          </p>
        </div>
      </div>
    );
  };

  const handleGoBack = () => {
    router.push('/dashboard');
  };

  return (
    <div className="bg-black h-screen text-white p-6 relative">
      <button 
        onClick={handleGoBack}
        className="fixed top-6 left-6 bg-emerald-900/40 hover:bg-emerald-900 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center space-x-2 z-50"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
            clipRule="evenodd" 
          />
        </svg>
        <span>Back</span>
      </button>

      <div className="max-w-6xl mx-auto">
        {loading && (
          <div className="text-neutral-400 text-center">Loading stock data...</div>
        )}

        {error && (
          <div className="bg-red-900/30 text-red-300 p-4 rounded-xl">
            {error}
          </div>
        )}
        
        {ticker && stockData.length > 0 && (
          <div className="flex gap-8">
            <div className="w-3/4 space-y-6">
              <div className="bg-neutral-900 rounded-xl p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{companyName || ticker}</h2>
                    <p className="text-neutral-400">{ticker} • NASDAQ</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-semibold">
                      ${stockData[stockData.length - 1].close.toFixed(2)}
                    </p>
                    <p className={`
                      font-medium text-lg
                      ${parseFloat(calculatePercentChange(stockData)) >= 0 
                        ? 'text-green-500' 
                        : 'text-red-500'
                      }
                    `}>
                      {parseFloat(calculatePercentChange(stockData))}% 
                      {parseFloat(calculatePercentChange(stockData)) >= 0 ? '▲' : '▼'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-900 rounded-xl p-8 space-y-4">
                <div className="flex justify-center space-x-2 mb-4">
                  {timeRangeButtons.map(({ label, value }) => (
                    <button
                      key={value}
                      onClick={() => selectTimeRangeData(value)}
                      className={`
                        px-4 py-2 rounded-lg transition-colors
                        ${timeRange === value 
                          ? 'bg-green-900 text-green-300' 
                          : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                        }
                      `}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stockData}>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="rgba(255,255,255,0.1)" 
                    />
                    <XAxis 
                      dataKey="date" 
                      stroke="rgba(255,255,255,0.3)" 
                      tick={{fontSize: 10}}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.3)" 
                      tick={{fontSize: 10}} 
                    />
                    <Tooltip 
                      content={<DayStockInfo />}
                      cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="close" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="w-1/3 bg-neutral-900 rounded-xl p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Recommendation</h2>
                <span className="text-neutral-400 text-sm">Latest</span>
              </div>
              {getRecommendationContent()}
            </div>
          </div>
        )}

        <div className="bg-black text-gray-300 w-full">
            <div className="max-w-4xl mx-auto">
                <div className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-neutral-800 p-4 mt-8">
                <h1 className="text-xl font-bold text-white">Activity</h1>
                </div>

                <div className="divide-y divide-neutral-800">
                {stockPosts && stockPosts.length ? (
                    stockPosts.map((post) => (
                    <div 
                    key={post.id} 
                    className="p-4 hover:bg-neutral-900/50 transition-colors duration-200 cursor-pointer"
                    onClick={() => handlePostClick(post)}
                    >    
                        <Post {...post} />
                    </div>
                ))) : (
                    <div className="text-center text-neutral-500 p-8">
                        No posts available for this stock
                    </div>
                )}
                </div>

                <PostModal 
                    isOpen={!!selectedPost}
                    onClose={handleCloseModal}
                    post={selectedPost ? {
                        ...selectedPost,
                        stocks: selectedPost.stocks.map(stock => ({
                            ticker: 'N/A',
                            primaryRating: stock.primaryRating || '',
                            strongBuyPercent: stock.strongBuyPercent || 0,
                            buyPercent: stock.buyPercent || 0,
                            holdPercent: stock.holdPercent || 0,
                            sellPercent: stock.sellPercent || 0,
                            strongSellPercent: stock.strongSellPercent || 0,
                            rationale: stock.rationale || ''
                        }))
                    } : {
                        id: 0,
                        username: '',
                        handle: '',
                        verified: false,
                        content: '',
                        timestamp: '',
                        positiveTickers: [],
                        negativeTickers: [],
                        report: '',
                        stocks: []
                    }}
                />
            </div>
        </div>
      </div>
    </div>
  );
}