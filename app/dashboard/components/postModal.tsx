import React from 'react';

interface PostModalProps {
    isOpen: boolean;
    onClose: () => void;
    post?: {
        id: number;
        username: string;
        handle: string;
        verified: boolean;
        content: string;
        timestamp: string;
        positiveTickers?: string[];
        negativeTickers?: string[];
        report: string;
        stocks: {
            ticker: string;
            primaryRating?: string;
            strongBuyPercent?: number;
            buyPercent?: number;
            holdPercent?: number;
            sellPercent?: number;
            strongSellPercent?: number;
            rationale?: string;
        }[];
    };
}

export default function PostModal({ 
    isOpen, 
    onClose, 
    post 
}: PostModalProps) {
    if (!isOpen) return null;

    const handleTickerClick = (ticker: string) => {
        window.open(`https://finance.yahoo.com/quote/${ticker}`, '_blank');
    };

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 overflow-hidden"
            onClick={onClose}
        >
            <div 
                className="bg-neutral-900 rounded-xl shadow-2xl w-full max-w-4xl mx-4 relative transform transition-all duration-300 ease-in-out scale-100 opacity-100 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-neutral-400 hover:text-white z-60"
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-6 w-6" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M6 18L18 6M6 6l12 12" 
                        />
                    </svg>
                </button>
                
                {post && (
                    <div className="p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <span className="font-bold text-white text-lg">{post.username}</span>
                            {post.verified && (
                                <svg 
                                    viewBox="0 0 22 22" 
                                    className="w-5 h-5 text-blue-500" 
                                    fill="currentColor"
                                >
                                    <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.436-.466-.98-.804-1.58-.985-.593-.181-1.228-.214-1.839-.096-1.002-1.024-2.427-1.622-3.928-1.622s-2.926.598-3.928 1.622c-.611-.118-1.246-.085-1.839.096-.6-.181-1.144-.519-1.58-.985-.445.469-.75 1.053-.882 1.687-.131.634-.083 1.29.14 1.897.586.274-1.084.706-1.438 1.246-.355.54-.552 1.17-.57 1.817.018.647.215 1.276.57 1.817.354.54.852.972 1.438 1.245-.223.606-.27 1.263-.14 1.896.131.634.437 1.218.882 1.688.436.466.98.804 1.58.985.593.181 1.228.214 1.839.096 1.002 1.024 2.427 1.622 3.928 1.622s2.926-.598 3.928-1.622c.611.118 1.246.085 1.839-.096.6-.181 1.144-.519 1.58-.985.445-.47.75-1.054.882-1.688.13-.633.083-1.29-.14-1.896.586-.273 1.084-.705 1.438-1.245.355-.54.552-1.17.57-1.817z" />
                                </svg>
                            )}
                            <span className="text-neutral-500">{post.handle}</span>
                        </div>
                        
                        <p className="text-white text-lg mb-4">{post.content}</p>
                        
                        {(post.positiveTickers?.length || post.negativeTickers?.length) && (
                            <div className="mb-4">
                                <h3 className="text-white text-md font-semibold mb-2">Affected Stocks</h3>
                                <div className="flex flex-wrap space-x-2 space-y-2">
                                    {post.positiveTickers?.map((ticker) => (
                                        <button 
                                            key={ticker} 
                                            onClick={() => handleTickerClick(ticker)}
                                            className="bg-green-800/50 text-green-300 px-3 py-1 rounded-full text-sm hover:bg-green-800/70 transition-colors"
                                        >
                                            {ticker} ↗
                                        </button>
                                    ))}
                                    {post.negativeTickers?.map((ticker) => (
                                        <button 
                                            key={ticker} 
                                            onClick={() => handleTickerClick(ticker)}
                                            className="bg-red-800/50 text-red-300 px-3 py-1 rounded-full text-sm hover:bg-red-800/70 transition-colors"
                                        >
                                            {ticker} ↗
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-6 p-4 bg-neutral-800 rounded-lg space-y-4">
                            <h3 className="text-white text-lg font-semibold">Detailed Report</h3>
                            
                            <p className="text-neutral-300 whitespace-pre-wrap">
                                {post.report || 'No detailed report available.'}
                            </p>

                            {post.stocks && post.stocks.map((stock, index) => (
                                <div key={index} className="mt-6 p-4 bg-neutral-800 rounded-xl border border-neutral-700 shadow-md">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <span className="text-white text-xl font-bold block">{stock.ticker}</span>
                                            {stock.primaryRating && (
                                                <span className="text-neutral-400 text-sm font-bold">
                                                    Primary Rating: {stock.primaryRating}
                                                </span>
                                            )}
                                        </div>
                                        <div className="bg-neutral-700 rounded-full px-3 py-1">
                                            <span className="text-neutral-300 text-sm">Market Analysis</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-5 gap-3 mb-4">
                                        {[
                                            { label: 'Strong Buy', value: stock.strongBuyPercent || 0 },
                                            { label: 'Buy', value: stock.buyPercent || 0 },
                                            { label: 'Hold', value: stock.holdPercent || 0 },
                                            { label: 'Sell', value: stock.sellPercent || 0 },
                                            { label: 'Strong Sell', value: stock.strongSellPercent || 0 }
                                        ].map((item, idx) => {
                                            const maxValue = Math.max(
                                                stock.strongBuyPercent || 0,
                                                stock.buyPercent || 0,
                                                stock.holdPercent || 0,
                                                stock.sellPercent || 0,
                                                stock.strongSellPercent || 0
                                            );
                                            
                                            return (
                                                <div 
                                                    key={item.label} 
                                                    className={`
                                                        p-3 rounded-lg text-center transition-all duration-300 ease-in-out
                                                        ${item.value === maxValue 
                                                            ? 'bg-green-700 text-white ring-2 ring-green-500 scale-105' 
                                                            : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'}
                                                    `}
                                                >
                                                    <div className="text-xs font-medium opacity-75 mb-1">{item.label}</div>
                                                    <div className="text-base font-semibold">{item.value}%</div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {stock.rationale && (
                                        <div className="bg-neutral-700 rounded-lg p-3">
                                            <h4 className="text-neutral-300 text-sm font-medium mb-2">AI Insights</h4>
                                            <p className="text-neutral-200 text-sm leading-relaxed whitespace-pre-wrap">
                                                {stock.rationale}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}