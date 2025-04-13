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
import Chatbot from './components/chatbot';
import Post from './components/post';
import PostModal from './components/postModal';
import { app, auth, db } from '@/lib/firebase.client';
import Link from 'next/link';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/solid';
import { ArrowLeftEndOnRectangleIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { getMessaging, onMessage } from 'firebase/messaging';

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
      className={`bg-black ${mounted ? "opacity-100" : "opacity-0" } duration-1000 text-gray-300 transition-all w-full h-screen flex relative`}
    >
      <div 
        className="bg-black transition-none duration-0 overflow-auto" 
        style={{ width: `${leftPanelWidth}%` }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="sticky flex justify-between top-0 bg-black/80 backdrop-blur-md z-10 border-b border-neutral-800 p-4 ml-4">
            <h1 className="text-xl font-bold text-white">Activity</h1>
            <ArrowLeftEndOnRectangleIcon className="cursor-pointer" width={24} height={24}
              onClick={handleLogOut} 
            />
          </div>

        <div className="divide-y divide-neutral-800">
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

      <div 
        className="bg-neutral-900/50 cursor-col-resize hover:bg-emerald-900/50 transition-colors"
        style={{ width: '5px' }}
        onMouseDown={handleMouseDown}
      />

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