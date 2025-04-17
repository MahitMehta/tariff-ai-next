'use client';

import { app, auth, db } from '@/lib/firebase.client';
import { ArrowLeftEndOnRectangleIcon } from '@heroicons/react/24/outline';
import {
  type User as FirebaseUser,
  onAuthStateChanged
} from 'firebase/auth';
import {
  collection,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore';
import { getMessaging, onMessage } from 'firebase/messaging';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import Chatbot from '@/components/dashboard/Chatbot';
import LoadPost from '@/components/dashboard/LoadPost';
import PostModal from '@/components/dashboard/PostModal';

// Define proper types for your data structures
interface StockData {
  ticker: string;
  primaryRating: string;
  strongBuyPercent: number;
  buyPercent: number;
  holdPercent: number;
  sellPercent: number;
  strongSellPercent: number;
  rationale: string;
}

export interface PostData {
  id: string;
  username: string;
  handle: string;
  verified: boolean;
  content: string;
  timestamp: string;
  positiveTickers: string[];
  negativeTickers: string[];
  report: string;
  stocks: StockData[];
}

export default function DashboardPage() {
  const [postIds, setPostIds] = useState<string[]>([]);
  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  
  const isDraggingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const messaging = getMessaging(app);

    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      
      fetchPosts().then(() => {
        console.log('Posts refetched after receiving message:', payload);
      });

      // Create and display a custom notification for foreground messages
      const notificationTitle = payload.notification?.title || 'Financial Alert';
      const notificationOptions = {
        body: payload.notification?.body || '',
        icon: '/vercel.svg', // Add your icon path
        data: payload.data || {}
      };
      
      // Display notification manually since onMessage only works in foreground
      // and doesn't display notifications automatically
      if (!("Notification" in window)) {
        console.log("This browser does not support notifications");
      } else if (Notification.permission === "granted") {
        const notification = new Notification(notificationTitle, notificationOptions);
        console.log("Attempting to show notification:", notification);
        // Add click handler to notification
        notification.onclick = () => {
          notification.close();
          window.focus();
          // Handle any additional click actions here
          console.log('Notification clicked:', payload);
        };
      }
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  const fetchPosts = useCallback(async () => {
    if (!currentUser) return;

    try {
      const postsRef = collection(db, "users", currentUser.uid, "events");
     
      const q = query(
        postsRef,
        orderBy("timestamp", 'desc')
      ); 
      const querySnapshot = await getDocs(q);
      const fetchedEventIds = querySnapshot.docs.map(doc => doc.id);

      if (fetchedEventIds.length === 0) {
        console.log('No events found for user');
        setPostIds([]);
        return;
      }

      setPostIds(fetchedEventIds);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPostIds([]);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePostClick = (post: PostData) => {
    setSelectedPost(post);
  };

  const handleCloseModal = () => {
    setSelectedPost(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    e.preventDefault();
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      if (!isDraggingRef.current) return;
      
      const container = containerRef.current;
      if (!container) return;

      const containerWidth = container.offsetWidth;
      const mouseX = e.clientX - container.getBoundingClientRect().left;
      const newWidth = (mouseX / containerWidth) * 100;
      
      const constrainedWidth = Math.max(10, Math.min(90, newWidth));
      setLeftPanelWidth(constrainedWidth);
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    isDraggingRef.current = false;
    
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const router = useRouter();

  const handleLogOut = useCallback(() => {
    auth.signOut().then(() => {
      console.log('User signed out');
      router.push("/");
    }).catch((error) => {
      console.error('Error signing out: ', error);
    }); 
  }, [router]);

  return (
    <div
      ref={containerRef}
      className={`bg-black ${
        mounted ? "opacity-100" : "opacity-0"
      } duration-1000 text-gray-300 transition-all w-full h-screen flex relative`}
    >
      <div
        className="bg-black transition-none duration-0 overflow-auto no-scrollbar"
        style={{ width: `${leftPanelWidth}%` }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="sticky flex justify-between top-0 bg-black/80 backdrop-blur-md z-10 border-b border-neutral-800 p-4 ml-4">
            <h1 className="text-xl font-bold text-white">Activity</h1>
            <ArrowLeftEndOnRectangleIcon
              className="cursor-pointer"
              width={24}
              height={24}
              onClick={handleLogOut}
            />
          </div>

          <div className="">
            {postIds.map((postId) => (
               <LoadPost 
                  key={postId}
                  onClick={(post) => handlePostClick(post)}
                  postId={postId} 
                />
            ))}
          </div>

          <PostModal
            isOpen={!!selectedPost}
            onClose={handleCloseModal}
            post={
              selectedPost
            }
          />
        </div>
      </div>

      <div
        className="bg-neutral-900/50 cursor-col-resize hover:bg-emerald-900/50 transition-colors duration-200 flex items-center justify-center"
        style={{ width: "4px" }}
        onMouseDown={handleMouseDown}
      >
        <div className="flex flex-col gap-2">
          <div className="w-1 h-1 rounded-full bg-gray-600" />
          <div className="w-1 h-1 rounded-full bg-gray-600" />
          <div className="w-1 h-1 rounded-full bg-gray-600" />
        </div>
      </div>

      <div
        className="bg-neutral-950 transition-none duration-0 overflow-hidden"
        style={{ width: `${100 - leftPanelWidth}%` }}
      >
        <div className="text-neutral-400 text-center h-fit">
          <Chatbot />
        </div>
      </div>
    </div>
  );
}