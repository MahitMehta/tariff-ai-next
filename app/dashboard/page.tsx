'use client';

import { app, auth, db } from '@/lib/firebase.client';
import { ArrowLeftEndOnRectangleIcon, CogIcon } from '@heroicons/react/24/outline';
import {
  type User as FirebaseUser,
  onAuthStateChanged
} from 'firebase/auth';
import {
  collection,
  type DocumentData,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  type QueryDocumentSnapshot,
  startAfter,
} from 'firebase/firestore';
import { getMessaging, onMessage } from 'firebase/messaging';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import Chatbot from '@/components/dashboard/Chatbot';
import LoadPost from '@/components/dashboard/LoadPost';
import PostModal from '@/components/dashboard/PostModal';
import BrandButton from '@/components/BrandButton';

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
  
  const eventsContainerRef = useRef<HTMLDivElement>(null);

  const isDraggingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const messaging = getMessaging(app);

    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      
      skip.current = 0;
      lastDoc.current = null;

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

  const skip = useRef(0);
  const lastDoc = useRef<QueryDocumentSnapshot<DocumentData, DocumentData> | null>(null);
  const totalEventCountRef = useRef(0);
  const [ hasMorePosts, setHasMorePosts ] = useState(true);

  const fetchPosts = useCallback(async (docLimit = 10) => {
    if (!currentUser) {
      return;
    }

    try {
      const eventsRef = collection(db, "users", currentUser.uid, "events");
   
      const q = lastDoc.current === null ? query(
        eventsRef,
        orderBy("timestamp", 'desc'),
        limit(docLimit)) : query(
        eventsRef,
        orderBy("timestamp", 'desc'),
        startAfter(lastDoc.current),
        limit(docLimit)
      );

      const querySnapshot = await getDocs(q);

      const fetchedEventIds = querySnapshot.docs.map(doc => doc.id);
      setPostIds(prev => [...prev, ...fetchedEventIds]);

      skip.current +=fetchedEventIds.length;
      lastDoc.current = querySnapshot.docs[querySnapshot.docs.length - 1];

      const totalEventCount = await getCountFromServer(eventsRef);
      totalEventCountRef.current = (totalEventCount.data().count);

      if (skip.current >= totalEventCountRef.current) {
        setHasMorePosts(false);
      }

    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  }
  , [currentUser]);

  const fetchInitialPosts = useCallback(async () => {
    if (!currentUser) {
      return;
    }

    if (postIds.length !== 0) {
      return;
    }

    await fetchPosts();
  }, [currentUser, postIds, fetchPosts]);

  useEffect(() => {
    fetchInitialPosts();
  }, [fetchInitialPosts]);

  const handlePostClick = (post: PostData) => {
    setSelectedPost(post);
  };

  const handleCloseModal = (consultAI: boolean) => {
    if (consultAI) {
      if (eventsContainerRef.current) {
        eventsContainerRef.current.style.transitionDuration = "0.4s";
      };
  
      setLeftPanelWidth(30);
      setTimeout(() => {
        if (eventsContainerRef.current) {
          eventsContainerRef.current.style.transitionDuration = "0s";
        }
      }, 500);
    }

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
      
      const constrainedWidth = Math.max(30, Math.min(65, newWidth));
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

  const [ loadingMorePosts, setLoadingMorePosts ] = useState(false);
  const fetchMorePosts = useCallback(async () => {
      if (!currentUser) {
        return;
      }
      
      setLoadingMorePosts(true);

      setTimeout(async () => {
        await fetchPosts(5);
        setLoadingMorePosts(false);
      }, 500); // artificial delay
  }, [ currentUser, fetchPosts ]);

  const onScroll = useCallback(async (e) => {
    const el = e.currentTarget

    if (el.scrollHeight - el.scrollTop === el.clientHeight) {
      if (loadingMorePosts || !hasMorePosts) {
        return;
      }

      await fetchMorePosts();
    }
  }, [ loadingMorePosts, fetchMorePosts, hasMorePosts ]);

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
        ref={eventsContainerRef}
        onScroll={onScroll}
        className="bg-black transition-all overflow-auto no-scrollbar"
        style={{ 
          width: `${leftPanelWidth}%`,
          transitionDuration: "0s",
        }}
      >
        <div className="mx-auto">
          <div className="sticky flex gap-3 justify-between items-center top-0 bg-black/35 backdrop-blur-md border-b border-neutral-800 p-4">
            <h1 className="text-xl font-bold text-white">P<span style={{ transform: "translate(-9px,7px)"}} className="text-green-500 inline-block">s</span></h1>
            <h1 className="text-xl font-bold text-white">Activity</h1>
            <CogIcon 
              className="cursor-pointer"
              width={24}
              height={24}
              onClick={() => router.push("/settings")}
            />
{/*          
            <ArrowLeftEndOnRectangleIcon
              className="cursor-pointer"
              width={24}
              height={24}
              onClick={handleLogOut}
            /> */}
          </div>

          <div className="pb-10 flex flex-col items-center">
            {postIds.map((postId) => (
               <LoadPost 
                  key={postId}
                  onClick={(post) => handlePostClick(post)}
                  postId={postId} 
                />
            ))}
            { 
            loadingMorePosts &&
                <div className="pt-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
            }
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