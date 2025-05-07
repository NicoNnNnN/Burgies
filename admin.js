import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, doc, deleteDoc,
  updateDoc, addDoc, setDoc, getDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Firebase-Konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyCW0-D2-mC43_HIimc_hfB1GoDqIILqg00",
  authDomain: "burgies-34fca.firebaseapp.com",
  projectId: "burgies-34fca",
  storageBucket: "burgies-34fca.appspot.com",
  messagingSenderId: "1089225214218",
  appId: "1:1089225214218:web:c2b33c7fb58b0defb112f3"
};

// Initialisieren
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Form-Elemente
const eventForm = document.getElementById("eventForm");
const eventList = document.getElementById("eventList");

let editId = null;

// Events laden
async function loadEvents() {
  eventList.innerHTML = "";
  const snapshot = await getDocs(collection(db, "events"));
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${data.title}</strong> – ${data.date} um ${data.time}
      <input type="number" id="actual-${docSnap.id}" placeholder="Tatsächlicher Gewinn" />
      <button onclick="enterActualWin('${docSnap.id}')">Auswerten</button>
      <button onclick="editEvent('${docSnap.id}', '${data.title}', '${data.date}', '${data.time}')">Bearbeiten</button>
      <button onclick="deleteEvent('${docSnap.id}')">Löschen</button>
    `;
    eventList.appendChild(li);
  });
}

// Formular abschicken
eventForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;

  if (!title || !date || !time) {
    alert("Bitte fülle alle Felder aus.");
    return;
  }

  try {
    if (editId) {
      await updateDoc(doc(db, "events", editId), { title, date, time });
      console.log("✏️ Event aktualisiert:", editId);
      editId = null;
    } else {
      await addDoc(collection(db, "events"), {
        title,
        date,
        time,
        createdAt: Date.now()
      });
      console.log("✅ Neuer Event gespeichert:", title);
    }

    eventForm.reset();
    loadEvents();
  } catch (err) {
    console.error("❌ Fehler beim Speichern:", err);
    alert("Fehler beim Speichern. Siehe Konsole.");
  }
});

// Event löschen
window.deleteEvent = async (id) => {
  await deleteDoc(doc(db, "events", id));
  loadEvents();
};

// Event bearbeiten
window.editEvent = (id, title, date, time) => {
  document.getElementById("title").value = title;
  document.getElementById("date").value = date;
  document.getElementById("time").value = time;
  editId = id;
};

// Tatsächlichen Gewinn eintragen
window.enterActualWin = async (eventId) => {
  const input = document.getElementById(`actual-${eventId}`);
  const actual = parseFloat(input.value);
  if (isNaN(actual)) return alert("Bitte gültigen Gewinn eingeben.");

  await setDoc(doc(db, "events", eventId), { actual }, { merge: true });
  await calculateBurgies(eventId, actual);
  alert("Gewinn gespeichert und Burgies berechnet!");
};

// Burgie-Punkte berechnen
async function calculateBurgies(eventId, actual) {
  const tipsSnap = await getDocs(collection(db, "events", eventId, "tips"));
  let closestUser = null;
  let minDiff = Infinity;
  const userPoints = [];

  tipsSnap.forEach(tipDoc => {
    const { value } = tipDoc.data();
    const diff = Math.abs(value - actual);
    let points = 0;

    if (diff === 0) points = 50;
    else if (diff <= 50) points = 45;
    else if (diff <= 100) points = 40;
    else if (diff <= 150) points = 35;
    else if (diff <= 200) points = 30;
    else if (diff <= 250) points = 25;
    else if (diff <= 300) points = 20;
    else if (diff <= 350) points = 15;
    else if (diff <= 400) points = 10;
    else if (diff <= 450) points = 8;
    else if (diff <= 500) points = 6;
    else if (diff <= 550) points = 5;
    else if (diff <= 600) points = 4;
    else if (diff <= 650) points = 3;
    else if (diff <= 700) points = 2;
    else if (diff <= 750) points = 1;

    userPoints.push({ user: tipDoc.id, diff, points });

    if (diff < minDiff) {
      minDiff = diff;
      closestUser = tipDoc.id;
    }
  });

  userPoints.forEach(u => {
    if (u.user === closestUser) u.points += 5;
  });

  for (const u of userPoints) {
    const ref = doc(db, "burgies", u.user);
    const prev = await getDoc(ref);
    const oldTotal = prev.exists() && prev.data().total ? prev.data().total : 0;

    await setDoc(ref, {
      [eventId]: u.points,
      total: oldTotal + u.points
    }, { merge: true });
  }
}

// Start
loadEvents();
