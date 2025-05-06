import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";

// Firebase-Konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyCW0-D2-mC43_HIimc_hfB1GoDqIILqg00",
  authDomain: "burgies-34fca.firebaseapp.com",
  projectId: "burgies-34fca",
  storageBucket: "burgies-34fca.appspot.com",
  messagingSenderId: "1089225214218",
  appId: "1:1089225214218:web:c2b33c7fb58b0defb112f3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Zeitraum-Auswahl
const select = document.createElement("select");
select.innerHTML = `
  <option value="daily">Täglich</option>
  <option value="weekly">Wöchentlich</option>
  <option value="monthly">Monatlich</option>
  <option value="total">Gesamt</option>
`;
document.body.insertBefore(select, document.getElementById("rankingTable"));

// Tabelle aktualisieren bei Auswahl
select.addEventListener("change", () => {
  loadRanking(select.value);
});

loadRanking("daily");

async function loadRanking(type) {
  const tbody = document.getElementById("rankingTable").querySelector("tbody");
  tbody.innerHTML = "";

  const snapshot = await getDocs(collection(db, "burgies"));
  const ranking = [];

  for (const docSnap of snapshot.docs) {
    const username = docSnap.id;

    if (type === "total") {
      const ref = collection(db, `burgies/${username}/total`);
      const totalSnap = await getDocs(ref);
      let points = 0;
      totalSnap.forEach(d => {
        points += d.data().points || 0;
      });
      ranking.push({ username, points });
    } else {
      const now = new Date();
      let key = "";

      if (type === "daily") {
        key = now.toISOString().split("T")[0];
      } else if (type === "weekly") {
        const temp = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        const dayNum = temp.getUTCDay() || 7;
        temp.setUTCDate(temp.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
        const weekNum = Math.ceil((((temp - yearStart) / 86400000) + 1) / 7);
        key = `KW${weekNum.toString().padStart(2, "0")}-${now.getFullYear()}`;
      } else if (type === "monthly") {
        key = now.toISOString().slice(0, 7);
      }

      const sub = await getDocs(collection(db, `burgies/${username}/${type}`));
      sub.forEach(d => {
        if (d.id === key && d.data().points > 0) {
          ranking.push({ username, points: d.data().points });
        }
      });
    }
  }

  ranking.sort((a, b) => b.points - a.points);

  ranking.forEach((entry, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${i + 1}</td>
      <td>${entry.username}</td>
      <td>${entry.points}</td>
    `;
    tbody.appendChild(row);
  });
}
