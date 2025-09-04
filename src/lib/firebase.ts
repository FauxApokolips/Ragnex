import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FB_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FB_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FB_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FB_DATABASE_URL,
};

// ✅ Debug log to confirm env values are loaded
if (typeof window !== "undefined") {
  console.log("Firebase config loaded:", firebaseConfig);
  for (const [k, v] of Object.entries(firebaseConfig)) {
    if (!v) console.error(`❌ Missing env var: ${k}`);
  }
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const rtdb = getDatabase(app);
