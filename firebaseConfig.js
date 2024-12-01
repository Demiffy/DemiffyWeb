// Import the required functions
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // Import Realtime Database
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC2dL0omog11u9TtXP5HKidiBiUVIkiyXA",
  authDomain: "demiffycom.firebaseapp.com",
  databaseURL: "https://demiffycom-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "demiffycom",
  storageBucket: "demiffycom.firebasestorage.app",
  messagingSenderId: "423608998435",
  appId: "1:423608998435:web:1ee3cc6b9408777fbdaf96",
  measurementId: "G-9DVS3F5QST"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // Analytics (optional)
const db = getDatabase(app); // Initialize Realtime Database

export { db };
