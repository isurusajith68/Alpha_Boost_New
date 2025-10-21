import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCL6kjy15dSRWFnP-mh9RwbDluWl_FGSis",
  authDomain: "alpha-9fe8c.firebaseapp.com",
  projectId: "alpha-9fe8c",
  storageBucket: "alpha-9fe8c.firebasestorage.app",
  messagingSenderId: "297236794675",
  appId: "1:297236794675:web:4e4f771b8e45a86e4d8246",
};
const app = initializeApp(firebaseConfig);

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  console.warn("AsyncStorage persistence failed, using default auth:", error);
  auth = getAuth(app);
}

const db = getFirestore(app);

export { auth, db };
export default app;
