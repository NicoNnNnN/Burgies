
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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

let username = localStorage.getItem("username");

const greetingEl = document.getElementById("greeting");
const burgieEl = document.getElementById("burgies");

async function initUser() {
  if (!username) {
    async function showBurgies() {
  const userRef = doc(db, "burgies", username);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const data = userSnap.data();
    let total = 0;
    Object.keys(data).forEach(key => {
      if (key !== "total") total += data[key];
    });
    burgieEl.innerText = `${total} 🍔`;
  } else {
    burgieEl.innerText = "0 🍔";
  }
}
    } else {
      username = "Gast";
    }
  }

  greetingEl.innerText = `Willkommen zurück, ${username}!`;
  await showBurgies();
}

async function showBurgies() {
  const userRef = doc(db, "burgies", username);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const burgies = userSnap.data().burgies || 0;
    burgieEl.innerText = `${burgies} 🍔`;
  } else {
    burgieEl.innerText = "0 🍔";
  }
}

initUser();
