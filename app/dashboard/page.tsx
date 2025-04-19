'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
import Chatbot from './components/Chatbot';
import Post from './components/Post';
import PostModal from './components/PostModal';
import { app, auth, db } from '@/lib/firebase.client';
import Link from 'next/link';
import { ArrowLeftOnRectangleIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { ArrowLeftEndOnRectangleIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { getMessaging, onMessage } from 'firebase/messaging';
import { motion, AnimatePresence } from 'framer-motion';

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

interface PostData {
  id: number;
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
  const [posts, setPosts] = useState<PostData[]>([]);
  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  
  const isDraggingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const messaging = getMessaging(app);

    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      
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
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        console.error('No user document found');
        return;
      }

      const userTickers = userDocSnap.data().tickers || [];

      if (userTickers.length === 0) {
        console.log('No tickers found for user');
        setPosts([]);
        return;
      }

      const postsRef = collection(db, "users", currentUser.uid, "events");
     
      const q = query(
        postsRef,
        orderBy("timestamp", 'desc')
      ); 
      const querySnapshot = await getDocs(q);
      const fetchedEventIds = querySnapshot.docs.map(doc => doc.id);

      if (fetchedEventIds.length === 0) {
        console.log('No events found for user');
        setPosts([]);
        return;
      }

      const eventRef = collection(db, "events");
      const eventQ = query(
        eventRef,
        where(documentId(), "in", fetchedEventIds)
      );

      const eventSnapshot = await getDocs(eventQ);
      const fetchedEvents = eventSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      const accountIds = [...new Set(fetchedEvents.map(event => event.trigger_account_id))];
      const accountsRef = collection(db, 'accounts');
      
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

      const reformattedPosts: PostData[] = fetchedEvents.map((event, index) => {
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
          stocks: (event.stock_tickers || []).map(ticker => {
            const tickerData = event.recommendation?.[ticker] || {};
            return {
              ticker: ticker,
              primaryRating: tickerData?.sentiment || 'Neutral',
              strongBuyPercent: tickerData?.rec?.strongBuy || 0,
              buyPercent: tickerData?.rec?.buy || 0,
              holdPercent: tickerData?.rec?.hold || 0,
              sellPercent: tickerData?.rec?.sell || 0,
              strongSellPercent: tickerData?.rec?.strongSell || 0,
              rationale: tickerData?.reasoning || 'No specific rationale available'
            };
          })
        };
      });

      setPosts(reformattedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
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
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    // Only run on client-side
    if (typeof window !== 'undefined') {
      setMounted(true);
      setWindowWidth(window.innerWidth);

      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };

      window.addEventListener('resize', handleResize);
      
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const getPanelWidth = () => {
    // Only calculate width on client-side
    if (typeof window !== 'undefined') {
      return isChatOpen ? '0%' : (window.innerWidth >= 768 ? `${leftPanelWidth}%` : '100%');
    }
    return '100%';
  };

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
      className={`bg-black ${mounted ? "opacity-100" : "opacity-0" } duration-1000 text-gray-300 transition-all w-full h-screen flex relative`}
    >
      {/* Activity Feed Panel */}
      <div 
        className={`bg-black transition-none duration-0 overflow-auto ${isChatOpen ? 'hidden md:block' : 'block'}`}
        style={{ 
          width: mounted ? getPanelWidth() : '100%'
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="sticky flex justify-between top-0 bg-black/80 backdrop-blur-md z-10 border-b border-neutral-800 p-4">
            <h1 className="text-xl font-bold text-white">Activity</h1>
            <div className="flex items-center space-x-4">
              <ArrowLeftEndOnRectangleIcon 
                className="cursor-pointer" 
                width={24} 
                height={24}
                onClick={handleLogOut} 
              />
              <button 
                className="md:hidden text-white bg-neutral-800 rounded-full px-4 py-2"
                onClick={() => setIsChatOpen(true)}
              >
                Chat
              </button>
            </div>
          </div>

          <div>
            {posts.map((post) => (
              <div 
                key={post.id}  
                className="p-4 hover:bg-neutral-900/50 transition-colors duration-200 cursor-pointer"
                onClick={() => handlePostClick(post)}
              >    
                <Post {...post} />
              </div>
            ))}
          </div>

          <PostModal 
            isOpen={!!selectedPost}
            onClose={handleCloseModal}
            post={selectedPost || {
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

      {/* Resizable Divider - Only visible on desktop */}
      <div 
        className="hidden md:block bg-neutral-900/50 cursor-col-resize hover:bg-emerald-900/50 transition-colors"
        style={{ width: '5px' }}
        onMouseDown={handleMouseDown}
      />

      {/* Desktop Chat Panel */}
      <div 
        className="hidden md:block bg-neutral-950 transition-none duration-0 overflow-hidden" 
        style={{ width: `${100 - leftPanelWidth}%` }}
      >
        <div className="text-neutral-400 h-full">
          <Chatbot />
        </div>
      </div>

      {/* Mobile Chat Overlay */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black md:hidden w-screen h-screen"
          >
            <div className="sticky top-0 left-0 right-0 flex justify-between items-center bg-black/80 backdrop-blur-md z-10 border-b border-neutral-800 p-4">
              <h1 className="text-xl font-bold text-white">Chat</h1>
              <button 
                className="text-white bg-neutral-800 rounded-full w-10 h-10 flex items-center justify-center"
                onClick={() => setIsChatOpen(false)}
                aria-label="Close chat"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-grow w-full h-[calc(100%-64px)] overflow-hidden">
              <Chatbot />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}