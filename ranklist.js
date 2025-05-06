import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Firebase-Konfiguration
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

// Tabelle im HTML finden
const tbody = document.querySelector("#rankingTable tbody");

async function loadRankings() {
  const snapshot = await getDocs(collection(db, "users"));
  const users = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    users.push({
      name: doc.id,
      total: data.total || 0
    });
  });

  users.sort((a, b) => b.total - a.total);

  tbody.innerHTML = "";

  users.forEach((user, index) => {
    const row = document.createElement("tr");

    let platzIcon = (index === 0) ? "🥇" : (index === 1) ? "🥈" : (index === 2) ? "🥉" : (index + 1);

    row.innerHTML = `
      <td>${platzIcon}</td>
      <td>${user.name}</td>
      <td>${user.total} 🍔</td>
    `;
    tbody.appendChild(row);
  });
}

loadRankings();
