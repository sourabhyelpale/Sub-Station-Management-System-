import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDtfDDyP_1DePgblBIdjVZ6ZHvS-f85Svg",
  authDomain: "sub-station-management-system.firebaseapp.com",
  projectId: "sub-station-management-system",
  storageBucket: "sub-station-management-system.firebasestorage.app",
  messagingSenderId: "172517814367",
  appId: "1:172517814367:web:ca64b318cec10c0862abea",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
