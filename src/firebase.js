import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDgmUjXFgu1vOJ6qj7ccp_X9jVS-m_FXIw",
  authDomain: "blockchaincrowdfunding.firebaseapp.com",
  projectId: "blockchaincrowdfunding",
  storageBucket: "blockchaincrowdfunding.firebasestorage.app",
  messagingSenderId: "729934203194",
  appId: "1:729934203194:web:938dec017198b50a292803",
  measurementId: "G-5LFFTQZNCH"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);