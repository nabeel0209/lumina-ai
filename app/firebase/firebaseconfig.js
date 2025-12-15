import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyC0UyQjycAVC4_UjWtFmWlLN4Uw66mNLoc",
  authDomain: "ai-chatbot-a8559.firebaseapp.com",
  projectId: "ai-chatbot-a8559",
  storageBucket: "ai-chatbot-a8559.firebasestorage.app",
  messagingSenderId: "469548108186",
  appId: "1:469548108186:web:2b003b2cca7e8efc725223",
  measurementId: "G-D50W5STWQD",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app)

export {app, db, auth}