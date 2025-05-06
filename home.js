import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCW0-D2-mC43_HIimc_hfB1GoDqIILqg00",
  authDomain: "burgies-34fca.firebaseapp.com",
  projectId: "burgies-34fca",
  storageBucket: "burgies-34fca.appspot.com",
  messagingSenderId: "1089225214218",
  appId: "1:1089225214218:web:c2b33c7fb58b0defb112f3",
  measurementId: "G-3RJ1577EKL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Benutzername abfragen und anzeigen
let username = localStorage.getItem("username");
if (!username) {
  username = prompt("Benutzernamen eingeben:");
  localStorage.setItem("username", username);
}
document.getElementById("welcomeText").innerText = `Willkommen, ${username}!`;

// Burgies anzeigen (Demo)
const userDoc = doc(db, "users", username);
getDoc(userDoc).then(docSnap => {
  if (docSnap.exists()) {
    const data = docSnap.data();
    document.getElementById("burgies").innerText = data.burgies || 0;
  } else {
    document.getElementById("burgies").innerText = "0";
  }
});