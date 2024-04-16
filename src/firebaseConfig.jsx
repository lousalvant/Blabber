// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {

    apiKey: "AIzaSyByMqcHMOS8BKjHJR1o2Noc-7kIvDCrPbI",
    authDomain: "blabber-c0d64.firebaseapp.com",
    databaseURL: "https://blabber-c0d64-default-rtdb.firebaseio.com",
    projectId: "blabber-c0d64",
    storageBucket: "blabber-c0d64.appspot.com",
    messagingSenderId: "1017420914410",
    appId: "1:1017420914410:web:9a1462d0f5b874663a4193",
    measurementId: "G-0KVFQ9D5JB",
    databaseURL: "https://blabber-c0d64-default-rtdb.firebaseio.com/",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebaseApp);
// Initialize Realtime Database and get a reference to the service
const database = getDatabase(firebaseApp);
const storage = getStorage(firebaseApp);
const db = getFirestore(firebaseApp);

export default firebaseApp;
export { db, storage, database };