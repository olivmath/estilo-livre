import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";

const firebaseConfig = {
  apiKey:            "AIzaSyCfTXw6Q4ccI3d1QOBp2f7h1dlpkDpZ4lw",
  authDomain:        "academia-estilo-livre.firebaseapp.com",
  projectId:         "academia-estilo-livre",
  storageBucket:     "academia-estilo-livre.firebasestorage.app",
  messagingSenderId: "398048202907",
  appId:             "1:398048202907:web:4308769929bfef3b42b63e",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
const fns = getFunctions(app, "us-central1");

export const call = (name) => (data) => httpsCallable(fns, name)(data).then((r) => r.data);
