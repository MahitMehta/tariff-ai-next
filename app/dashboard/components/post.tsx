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
                            className="w-5 h-5 text-blue-500" 
                            fill="currentColor"
                        >
                            <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.436-.466-.98-.804-1.58-.985-.593-.181-1.228-.214-1.839-.096-1.002-1.024-2.427-1.622-3.928-1.622s-2.926.598-3.928 1.622c-.611-.118-1.246-.085-1.839.096-.6.181-1.144.519-1.58.985-.445.469-.75 1.053-.882 1.687-.13.633-.083 1.29.14 1.897-.586.274-1.084.706-1.438 1.246-.355.54-.552 1.17-.57 1.817.018.647.215 1.276.57 1.817.354.54.852.972 1.438 1.245-.223.606-.27 1.263-.14 1.896.131.634.437 1.218.882 1.688.436.466.98.804 1.58.985.593.181 1.228.214 1.839.096 1.002 1.024 2.427 1.622 3.928 1.622s2.926-.598 3.928-1.622c.611.118 1.246.085 1.839-.096.6-.181 1.144-.519 1.58-.985.445-.47.75-1.054.882-1.688.13-.633.083-1.29-.14-1.896.586-.273 1.084-.705 1.438-1.245.355-.54.552-1.17.57-1.817zm-5.946-8.006c.463.386.803.887 1 1.447.196.56.245 1.162.145 1.748-.1.586-.356 1.131-.743 1.594-.387.463-.887.803-1.447 1-.56.196-1.162.245-1.748.145-.586-.1-1.131-.356-1.594-.743-.463-.387-.803-.887-1-1.447-.196-.56-.245-1.162-.145-1.748.1-.586.356-1.131.743-1.594.387-.463.887-.803 1.447-1 .56-.196 1.162-.245 1.748-.145.586.1 1.131.356 1.594.743zM11 19c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z" />
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