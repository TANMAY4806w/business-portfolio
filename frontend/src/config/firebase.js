import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDEENMAH0zGjnPmpbERLbffS3TjV7mijDA",
  authDomain: "business-portfolio-49ecd.firebaseapp.com",
  projectId: "business-portfolio-49ecd",
  storageBucket: "business-portfolio-49ecd.firebasestorage.app",
  messagingSenderId: "741493192621",
  appId: "1:741493192621:web:c16522752d7951a6f71324",
  measurementId: "G-6DB2FBE5EM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
