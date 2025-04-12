import React from 'react';

interface PostProps {
    username: string;
    handle: string;
    verified: boolean;
    content: string;
    timestamp: string;
    negativeTickers?: string[];
    positiveTickers?: string[];
}

export default function Post({ 
    username, 
    handle, 
    verified, 
    content, 
    timestamp,
    negativeTickers = [],
    positiveTickers = []
}: PostProps) {
    return (
        <div className="p-4 transition-colors duration-200 cursor-pointer">
            <div className="flex-1">
                <div className="flex items-center space-x-1 mb-1">
                    <span className="font-bold text-white">{username}</span>
                    {verified && (
                        <svg 
                            viewBox="0 0 22 22" 
                            className="w-5 h-5" 
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <image 
                                href="https://img.icons8.com/color/48/verified-badge.png" 
                                x="0" 
                                y="0" 
                                height="22" 
                                width="22"
                            />
                        </svg>
                    )}
                    <span className="text-neutral-500 text-lg ml-1">{handle}</span>
                    <span className="text-neutral-500 text-lg ml-auto">· {timestamp}</span>
                </div>
                
                <p className="text-white mb-2 text-lg">{content}</p>
                
                {(positiveTickers.length > 0 || negativeTickers.length > 0) && (
                    <div className="flex space-x-2 mb-2">
                        {positiveTickers.map((ticker) => (
                            <span 
                                key={ticker} 
                                className="bg-green-800/50 text-green-300 px-2 py-1 rounded-full text-sm"
                            >
                                {ticker}
                            </span>
                        ))}
                        {negativeTickers.map((ticker) => (
                            <span 
                                key={ticker} 
                                className="bg-red-800/50 text-red-300 px-2 py-1 rounded-full text-sm"
                            >
                                {ticker}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}