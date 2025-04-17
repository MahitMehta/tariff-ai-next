import { useEffect, useState } from "react";
import Post, { type IPostProps } from "./Post";
import { collection, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase.client";
import type { PostData } from "@/app/dashboard/page";

interface ILoadPostProps extends Omit<IPostProps, "post"> {
    postId: string;
}

const LoadPost : React.FC<ILoadPostProps> = ({ postId, ...props }) => {
    const [post, setPost] = useState<PostData>({ 
        id: postId,
        username: "",
        handle: "",
        content: "",
        timestamp: "",
        positiveTickers: [],
        negativeTickers: [],
        verified: true,
        report: "",
        stocks: []
    });
    
    useEffect(() => {
        if (!postId) return;

        const eventRef = collection(db, "events");
        getDoc(doc(eventRef, postId)).then(docSnap => {
        if (!docSnap.exists()) return;

        const event = docSnap.data();

        const accountsRef = collection(db, 'accounts');
        
        getDoc(doc(accountsRef, event.trigger_account_id)).then(accountSnap => {
            if (!accountSnap.exists()) return;

            const account = accountSnap.data();

            setPost({
            id: postId,
            verified: true,
            username: account.username || '',
            handle: account.handle || '',
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
            })
        });
        })
        .catch(error => {
        console.error("Error fetching post:", error);
        });
    }, [
    postId,
    ]);

    return <Post { ...props } post={post} />
}

export default LoadPost;