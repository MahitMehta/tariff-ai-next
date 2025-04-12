"use client";

import { accountsCollection, auth, usersCollection } from "@/lib/firebase.client";
import { doc, getDocs, setDoc } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";

import AutocompleteDropdownMulti from "../../components/AutocompleteDropdown";
import { UserIcon } from "@heroicons/react/24/outline";
import BrandButton from "../../components/BrandButton";
import InputField from "../../components/InputField";
import { redirect, useRouter } from "next/navigation";
import Checkbox from "../../components/Checkbox";
import DropdownSelect from "../../components/Dropdown";

// stocks
import stocks from "../../data/sp500.json";

const mappedStocks = stocks.map((stock) => ({
    id: stock.ticker,
    value: `${stock.ticker} - ${stock.name}`,
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
        } as IUserModel).then(() => {
            router.replace("/dashboard");
        }).catch((error) => {
            console.error("Error updating user document: ", error);
        });  

    }, [ router, selectedAccounts, selectedEvents, selectedTickers ]);

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

    const [ name, setName ] = useState("");
    
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
                icon={<></>}
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
                setSelectedEvents(events.map((event) => event.id));
                console.log("Selected events: ", events);
            }}
            title="Event Categories"
            icon={<></>}
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
            icon={<></>}
            placeholder="e.g. NVDA, AMD..."
        />
        <DropdownSelect 
            id="notification-buckets"
            options={notificationBuckets}
            onSelect={(value) => console.log(value)}
            title="Notification Limit"
            className="mt-3"
            icon={<></>}
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
                label={<div>Receive Real-time <b>Desktop Notifications</b></div>}
                className="mt-3"
                onChange={(value) => console.log(value)}
            />
            <Checkbox
                id="terms-and-conditions"
                label="I agree to the Terms and Conditions"
                className="mt-3"
                onChange={(value) => console.log(value)}
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