"use client";

import { useRouter } from "next/navigation";
import BrandButton from "@/components/BrandButton";
import { useCallback, useEffect, useState } from "react";
import InputField from "@/components/InputField";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, type User } from "firebase/auth";
import { auth, usersCollection } from "@/lib/firebase.client";
import { addDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { DocumentData } from "firebase-admin/firestore";

const SignUpForm = () => {
    const [ mounted, setMounted ] = useState(false);

    useEffect(() => {
        // Set mounted to true after a small delay to trigger fade-in animation
        const timer = setTimeout(() => {
            setMounted(true);
        }, 100);
        
        return () => clearTimeout(timer);
    }, []);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const router = useRouter();

    const createUserDocument = useCallback(async (user: User) => {
        const userDoc = await getDoc(doc(usersCollection, user.uid));
        
        if (userDoc.exists()) {
            const docData = userDoc.data() as IUserModel;
            if (!docData?.accounts || docData.accounts.length === 0) {
                console.log("User exists but has no accounts");
                router.push("/configure");
                return;
            }
            
            console.log("User already exists");
            router.push("/dashboard");
        } else {
            console.log("Creating new user document");
            
            await setDoc(doc(usersCollection, user.uid), {
                accounts: [],
                events: [],
            }).then(() => {
                router.push("/configure");
            }).catch((error) => {
                console.error("Error creating user document: ", error);
            });            
        }
    }, [ router ]);

    const handleEmailPasswordSignUpClick = useCallback(async () => {
        if (!email || !password) {
            return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;    

        await createUserDocument(user);
    }, [ email, password, createUserDocument ]);

    const handleGoogleSignUpClick = useCallback(async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
          
            await createUserDocument(user);
        } catch (error) {
          console.error("Error signing in:", error);
        }
      }, [ createUserDocument ]);

    return (
        <div 
            className={`w-screen max-w-[600px] p-6 flex flex-col items-start transition-opacity duration-1000 ease-in-out ${
                mounted ? 'opacity-100' : 'opacity-0'
            }`}
        >
            <div className="flex flex-col w-full">
                <div className="px-4">
                    <h1 className="text-3xl font-bold text-gray-200">
                        Create an Account...
                    </h1>
                </div>
                <div className="flex flex-col gap-0">
                    <InputField 
                        value={email}
                        onChange={(e) => setEmail(e)}
                        title="Email"
                        placeholder="Enter your email"
                    />
                    <InputField 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e)}
                        title="Password"
                        placeholder="Enter your password"
                    />
                </div>
                <BrandButton
                    onClick={handleEmailPasswordSignUpClick}
                    text="Create Account"
                    disabled={!email || !password}
                />
                <div className="flex items-center justify-center w-full">
                    <p className="text-xs">- OR -</p>  
                </div>
                <GoogleSignInButton onClick={handleGoogleSignUpClick}/>
                <p className="text-xs text-[#444444] text-center mt-4">
                    By creating an account, you agree to our <span className="text-white">Terms of Service</span> and <span className="text-white">Privacy Policy</span>.
                </p>
            </div>
        </div>
    )
}

export default SignUpForm