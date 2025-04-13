"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type TimeRange = 'week' | 'month' | 'year' | 'all';

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

interface StockTableProps {
  ticker: string;
}

export default function StockTable({ 
  ticker
}: StockTableProps) {
  const [stockData, setStockData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [companyName, setCompanyName] = useState('');
  
  const completeStockDataRef = useRef<any[]>([]);

  const selectTimeRangeData = useCallback((range: TimeRange) => {
    if (!completeStockDataRef.current.length) return;

    let selectedData: any[] = [];
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

  const fetchStockData = async (symbol: string) => {
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

  useEffect(() => {
    fetchStockData(ticker);
  }, [ticker]);

  const calculatePercentChange = () => {
    if (stockData.length < 2) return null;
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

  if (loading) return <div className="text-neutral-400 text-center">Loading stock data...</div>;
  if (error) return <div className="bg-red-900/30 text-red-300 p-4 rounded-xl">{error}</div>;
  if (!stockData.length) return null;

  return (
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
            ${Number.parseFloat(calculatePercentChange() || "0.0") >= 0 
              ? 'text-green-500' 
              : 'text-red-500'
            }
          `}>
            {calculatePercentChange()}% 
            {Number.parseFloat(calculatePercentChange() || "0.0") >= 0 ? '▲' : '▼'}
          </p>
        </div>
      </div>

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
  );
}