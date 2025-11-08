import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration from your screenshot
// FIX: Revert to the specific, hardcoded API key from the user's Firebase project.
// The environment-provided API key is not valid for Firebase Authentication services.
const firebaseConfig = {
  apiKey: "AIzaSyDgNTLbTG4R4sr5EKW9w0pEneHYm5idWMc",
  authDomain: "tuyensinhsdh-hcmue.firebaseapp.com",
  projectId: "tuyensinhsdh-hcmue",
  storageBucket: "tuyensinhsdh-hcmue.firebasestorage.app",
  messagingSenderId: "761457490283",
  appId: "1:761457490283:web:6d2b0cc813a073d86f342e",
  measurementId: "G-50YDHSNJTV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);