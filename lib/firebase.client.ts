import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getMessaging, getToken } from "firebase/messaging";

// Sever Component setup if needed
// https://medium.com/@jogarcia/set-up-firebase-on-nextjs-21d54be828dc

import { getFirestore, collection } from "firebase/firestore";

const clientCredentials = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId : process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(clientCredentials);

const db = getFirestore(app);
const auth = getAuth(app);

const accountsCollection = collection(db, "accounts");
const usersCollection = collection(db, "users");

export {
  app,
  db,
  auth,
  usersCollection,
  accountsCollection
};