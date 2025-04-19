import type { PostData } from "@/app/dashboard/page";
import { useCallback, useEffect, useState } from "react";

export interface IPostProps {
  post: PostData;
  onClick: (post: PostData) => void;
}

export default function Post({
  post,
  onClick
}: IPostProps) {
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    if (isClicked) {
      const timer = setTimeout(() => {
        setIsClicked(false);
      }, 1);
      return () => clearTimeout(timer);
    }
  }, [isClicked]);

  const formatTimestamp = (rawString: string) => {
    const isoString = `${rawString.replace(" ", "T")}:00Z`;

    const now = new Date();
    const postDate = new Date(isoString);
    const diffMs = now.getTime() - postDate.getTime(); // fixed: now - postDate
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
  
    if (diffDays > 0) return `${diffDays}d`;
    if (diffHours > 0) return `${diffHours}h`;
    if (diffMinutes > 0) return `${diffMinutes}m`;
    return `${diffSeconds}s`;
  };

  const handleClick = useCallback(() => {
    setIsClicked(true);
    onClick(post);
  } , [post, onClick]);

  return (
    <div
      className={`w-full overflow-hidden p-4 ${post.content ? "opacity-100" : "opacity-0"} border-b-[1px] hover:bg-neutral-900/50 border-neutral-800 border-solid transition-all duration-500 cursor-pointer 
                ${isClicked ? "bg-neutral-700" : "hover:bg-[#111111]"}`}
      onClick={handleClick}
    >
      <div className="flex-1">
        <div className="flex items-center space-x-1 mb-1">
          <span className="font-bold text-white">{post.username}</span>
          {post.verified && (
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
          <span className="text-neutral-500 text-lg ml-1">{post.handle}</span>
          <span className="text-neutral-500 text-lg ml-auto">
            · {formatTimestamp(post.timestamp)}
          </span>
        </div>

        <p className="text-white mb-2 text-lg">{post.content}</p>

        {(post.positiveTickers.length > 0 || post.negativeTickers.length > 0) && (
          <div className="flex space-x-2 mb-2">
            {post.positiveTickers.map((ticker) => (
              <span
                key={ticker}
                className="bg-[#111111] border-[1px] border-[#222222] text-gray-300 hover:text-white px-2 py-1 rounded-full text-sm"
              >
                {ticker}
              </span>
            ))}
            {post.negativeTickers.map((ticker) => (
              <span
                key={ticker}
                className="bg-red-800/50 text-red-300 hover:bg-red-900 hover:text-white px-2 py-1 rounded-full text-sm"
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
