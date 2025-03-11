// Firebase配置文件
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Firebase配置信息
const firebaseConfig = {
  apiKey: "AIzaSyDQvIgTk8dC0I5Zr03UNGOAjE1uDH4SQqA",
  authDomain: "login-bf9b0.firebaseapp.com",
  projectId: "login-bf9b0",
  storageBucket: "login-bf9b0.firebasestorage.app",
  messagingSenderId: "951428435914",
  appId: "1:951428435914:web:3e4c931b86f84a523d0933",
  measurementId: "G-NP8F9XD658"
};

// 初始化Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth };