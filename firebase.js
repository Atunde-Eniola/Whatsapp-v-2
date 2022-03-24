import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

const firebaseConfig = {
	apiKey: "AIzaSyBxx5Li73oxIxdI6mqBqDsyNoS5KUTcegY",
	authDomain: "whatsapp-2-7b68f.firebaseapp.com",
	projectId: "whatsapp-2-7b68f",
	storageBucket: "whatsapp-2-7b68f.appspot.com",
	messagingSenderId: "476721203384",
	appId: "1:476721203384:web:e4156a9de1547f3a3f0c4d",
};

// Use this to initialize the firebase App
const firebaseApp = firebase.initializeApp(firebaseConfig);

// Use these for db & auth
const db = firebaseApp.firestore();
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

export { auth, db, provider };
