"use client";

import { accountsCollection, app, auth, usersCollection } from "@/lib/firebase.client";
import { doc, getDocs, setDoc } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";

import { UserIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import AutocompleteDropdownMulti from "../../components/AutocompleteDropdown";
import BrandButton from "../../components/BrandButton";
import Checkbox from "../../components/Checkbox";
import DropdownSelect from "../../components/Dropdown";

// stocks
import { getMessaging, getToken } from "firebase/messaging";
import stocks from "../../data/nasdaq.json";

const mappedStocks = stocks
    .filter(stock => stock.Symbol) // Filter out stocks with null Symbol
    .map((stock) => ({
        id: stock.Symbol!, // Use non-null assertion as we've filtered out nulls
        value: `${stock.Symbol} - ${stock.Name}`,
    }));

interface IAccount {
    id: string;
    name: string;
}

const eventCategories = [
    { id: "1", value: "Tariffs" },
    { id: "2", value: "Interest Rates" },
];

const netWorthBuckets = [
    { id: "1", value: "1k-10k" },
    { id: "2", value: "10k-100k" },
    { id: "3", value: "100k-1M" },
    { id: "4", value: "1M+" },
]

const notificationBuckets = [
    { id: "1", value: "Unlimited" },
    { id: "2", value: "0-5" },
    { id: "3", value: "0-10" },
    { id: "4", value: "0-25" },
]


const CurateForm = () => {
    const [ accounts, setAccounts ] = useState<IAccount[]>([]);
    const [ mounted, setMounted ] = useState(false);

    const getAccounts = useCallback(async () => {
        const docs = await getDocs(accountsCollection);

        const formattedDocs = docs.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name,
        })) as IAccount[];

        return formattedDocs;
    }, []);

    const [ loading, setLoading ] = useState(false);

    const [ selectedAccounts, setSelectedAccounts ] = useState<string[]>([]);
    const [ selectedEvents, setSelectedEvents ] = useState<string[]>([]);
    const [ selectedTickers, setSelectedTickers ] = useState<string[]>([]);
    const [ notificationToken, setNotificationToken ] = useState<string | null>(null);

    const router = useRouter();

    const handleContinue = useCallback(async () => {
        const user = auth.currentUser;

        if (!user) {
            console.error("User not logged in");
            router.replace("/login");
        }

        setLoading(true);
        
        await setDoc(doc(usersCollection, user?.uid), {
            accounts: selectedAccounts,
            events: selectedEvents,
            tickers: selectedTickers,
            notificationToken: notificationToken,
        } as IUserModel).then(() => {
            router.replace("/dashboard");
        }).catch((error) => {
            console.error("Error updating user document: ", error);
        });  

    }, [ router, selectedAccounts, selectedEvents, selectedTickers, notificationToken ]);

    useEffect(() => {
        getAccounts().then((data) => {
            setAccounts(data);
        }
        ).catch((error) => {
            console.error("Error fetching accounts: ", error);
        });
        
        // Set mounted to true after a small delay to trigger fade-in animation
        const timer = setTimeout(() => {
            setMounted(true);
        }, 100);
        
        return () => clearTimeout(timer);
    }, [getAccounts]);

    const [ desktopNotifications, setDesktopNotifications ] = useState(false);

    const setDesktopNotificationsHandle = useCallback(async (value: boolean) => {
        setDesktopNotifications(value);
        
        if (value) {
            const messaging = getMessaging(app);
            const token = await getToken(messaging, {vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY }).catch((error) => {
                console.error("Error getting token: ", error);
                return null;
            });
        
            if (token) {
                console.log("Token: ", token);
                setNotificationToken(token);
                return;
            } 

            Notification.requestPermission().then((permission) => {
                if (permission === 'granted') {
                    console.log('Notification permission granted.');
                    console.log(permission);
                    getToken(messaging, {vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY })
                        .then((token) => {
                            console.log("Token after Granted Permission: ", token);
                            setNotificationToken(token);
                        })
                        .catch((error) => {
                            console.error("Error getting token: ", error);
                            setDesktopNotifications(false);
                            return null;
                        });
                } else if (permission === 'denied') {
                    console.log('Notification permission denied.');
                    setDesktopNotifications(false);
                }
            });
        }
    }, []);

    return (
        <div 
            className={`w-screen max-w-[600px] p-6 flex flex-col items-start transition-opacity duration-1000 ease-in-out ${
                mounted ? 'opacity-100' : 'opacity-0'
            }`}
        >
            <h1 className="text-3xl font-bold mb-3 pl-4">Configure Financial Events...</h1>
            <DropdownSelect 
                id="value-buckets"
                options={netWorthBuckets}
                onSelect={(value) => console.log(value)}
                title="Estimated Net Worth"
                placeholder="e.g. 1k-10k..."
            />
        {/* <InputField 
            onChange={(value) => {
                setName(value);
            }}
            className="w-full"
            title="Search for Financial Events"
            value={name}
        /> */}
        <AutocompleteDropdownMulti 
            id="events"
            options={eventCategories}
            className="mt-3"
            onSelect={(events) => {
                setSelectedEvents(events.map((event) => event.value));
                console.log("Selected events: ", events);
            }}
            title="Event Categories"
            placeholder="e.g. tariffs, interest rates..."
        />
        <AutocompleteDropdownMulti 
            id="search-reliable-accounts"
            options={accounts.map((account) => ({ id: account.id, value: account.name }))}
            onSelect={(accounts) => {
                setSelectedAccounts(accounts.map((account) => account.id));
                console.log("Selected accounts: ", accounts);
            }}
            title="Search Reliable Accounts"
            className="mt-3"
            icon={<UserIcon className="w-5 h-5 inline-block mr-2" />}
            placeholder="e.g. @realDonaldTrump, @elonmusk..."
        />
        <AutocompleteDropdownMulti 
            id="search-stock-portfolio"
            options={mappedStocks}
            onSelect={(tickers) => {
                setSelectedTickers(tickers.map((ticker) => ticker.id));
                console.log("Selected tickers: ", tickers);
            }}
            title="Stock Portfolio"
            className="mt-3"
            placeholder="e.g. NVDA, AMD..."
        />
        <DropdownSelect 
            id="notification-buckets"
            options={notificationBuckets}
            onSelect={(value) => console.log(value)}
            title="Notification Limit"
            className="mt-3"
            placeholder="e.g. Unlimited..."
        />
        <div className="pl-5 mt-4 flex flex-col gap-2">
            <Checkbox
                id="batch-emails"
                label={<div>Batch Emails</div>}
                className="mt-3"
                onChange={(value) => console.log(value)}
            />
            <Checkbox
                id="desktop-ntifications"
                checked={desktopNotifications}
                label={<div>Receive Real-time <b>Desktop Notifications</b></div>}
                className="mt-3"
                onChange={setDesktopNotificationsHandle}
            />
        </div>
        <div className="flex flex-col gap-3 w-full">
            <BrandButton 
                onClick={handleContinue}
                loading={loading}
                text="Continue to your Portal" />
        </div>
    </div>
    )
}  

export default CurateForm;