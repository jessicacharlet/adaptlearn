import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const requiredConfigKeys = ["apiKey", "authDomain", "projectId", "appId"];

const isRealConfigValue = (value) =>
  typeof value === "string" &&
  value.trim() &&
  !value.includes("your_") &&
  !value.includes("your-");

const hasFirebaseConfig = Boolean(
  requiredConfigKeys.every((key) => isRealConfigValue(firebaseConfig[key]))
);

let app = null;
let firebaseInitError = "";

if (hasFirebaseConfig) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (error) {
    firebaseInitError = error.message;
  }
}

export const firebaseReady = Boolean(app);
export const firebaseConfigError = firebaseInitError || (
  hasFirebaseConfig
    ? ""
    : "Create frontend/.env from frontend/.env.example, add your real Firebase web app values, then restart npm run dev."
);
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
