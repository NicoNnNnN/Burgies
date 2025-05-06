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

const select = document.getElementById("rankType");
select.addEventListener("change", () => {
  loadRanking(select.value);
});

loadRanking("daily");

async function loadRanking(type) {
  const tbody = document.getElementById("rankingTable").querySelector("tbody");
  tbody.innerHTML = "";

  try {
    const snapshot = await getDocs(collection(db, "burgies"));
    const ranking = [];

    const now = new Date();
    let key = "";

    if (type === "daily") {
      key = new Date().toLocaleDateString("sv-SE");
    } else if (type === "weekly") {
      const temp = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
      const dayNum = temp.getUTCDay() || 7;
      temp.setUTCDate(temp.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
      const weekNum = Math.ceil((((temp - yearStart) / 86400000) + 1) / 7);
      key = `KW${weekNum.toString().padStart(2, "0")}-${now.getFullYear()}`;
    } else if (type === "monthly") {
      key = new Date().toLocaleDateString("sv-SE").slice(0, 7);
    }

    for (const docSnap of snapshot.docs) {
      const username = docSnap.id;

      if (!username) continue;

      if (type === "total") {
        const totalCol = collection(db, `burgies/${username}/total`);
        const totalSnap = await getDocs(totalCol);
        let totalPoints = 0;
        totalSnap.forEach(doc => {
          const data = doc.data();
          if (data && typeof data.points === "number") {
            totalPoints += data.points;
          }
        });
        if (totalPoints > 0) {
          ranking.push({ username, points: totalPoints });
        }
      } else {
        const colRef = collection(db, `burgies/${username}/${type}`);
        const subSnap = await getDocs(colRef);
        subSnap.forEach(doc => {
          const data = doc.data();
          if (doc.id === key && data && typeof data.points === "number" && data.points > 0) {
            ranking.push({ username, points: data.points });
          }
        });
      }
    }

    ranking.sort((a, b) => b.points - a.points);

    if (ranking.length === 0) {
      const row = document.createElement("tr");
      row.innerHTML = '<td colspan="3">Keine Ranglistendaten vorhanden.</td>';
      tbody.appendChild(row);
      return;
    }

    ranking.forEach((entry, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${entry.username}</td>
        <td>${entry.points}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error("Fehler beim Laden der Rangliste:", error);
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="3">Fehler beim Laden der Rangliste.</td>';
    tbody.appendChild(row);
  }
}
