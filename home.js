// home.js – Verknüpfung mit Firebase und Anzeige von Benutzerdaten
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "DEIN_API_KEY",
  authDomain: "DEIN_AUTH_DOMAIN",
  projectId: "DEIN_PROJECT_ID",
  storageBucket: "DEIN_STORAGE_BUCKET",
  messagingSenderId: "DEIN_MSG_SENDER_ID",
  appId: "DEINE_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Nutzername aus localStorage holen
const username = localStorage.getItem("username") || "Gast";

// Begrüßung anzeigen
document.getElementById("greeting").innerText = `Willkommen zurück, ${username}!`;

// Burgie-Anzeige aktualisieren
async function showBurgies() {
  const userRef = doc(db, "users", username);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const burgies = userSnap.data().burgies || 0;
    document.getElementById("burgies").innerText = `${burgies} 🍔`;
  } else {
    document.getElementById("burgies").innerText = "0 🍔";
  }
}

showBurgies();
