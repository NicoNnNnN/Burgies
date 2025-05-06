import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, getDocs, deleteDoc, doc, updateDoc, addDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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

const eventForm = document.getElementById("eventForm");
const eventList = document.getElementById("eventList");

let editId = null;

async function loadEvents() {
  eventList.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "events"));
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${data.title}</strong> – ${data.date} um ${data.time}
      <input type="number" id="actual-${docSnap.id}" placeholder="Tatsächlicher Gewinn" />
      <button onclick="enterActualWin('${docSnap.id}')">Speichern & Auswerten</button>
      <button onclick="editEvent('${docSnap.id}', '${data.title}', '${data.date}', '${data.time}')">Bearbeiten</button>
      <button onclick="deleteEvent('${docSnap.id}')">Löschen</button>
    `;
    eventList.appendChild(li);
  });
}

eventForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value;
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;

  if (editId) {
    await updateDoc(doc(db, "events", editId), { title, date, time });
    editId = null;
  } else {
    await addDoc(collection(db, "events"), {
      title,
      date,
      time,
      createdAt: Date.now()
    });
  }

  eventForm.reset();
  loadEvents();
});

window.deleteEvent = async (id) => {
  await deleteDoc(doc(db, "events", id));
  loadEvents();
};

window.editEvent = (id, title, date, time) => {
  document.getElementById("title").value = title;
  document.getElementById("date").value = date;
  document.getElementById("time").value = time;
  editId = id;
};

window.enterActualWin = async (eventId) => {
  const input = document.getElementById(`actual-${eventId}`);
  const actualWin = parseFloat(input.value);
  if (isNaN(actualWin)) return alert("Bitte gib einen gültigen Gewinn ein.");
  await setDoc(doc(db, "events", eventId), { actual: actualWin }, { merge: true });
  await calculateBurgies(eventId, actualWin);
  alert("Gewinn gespeichert und Burgies berechnet!");
};

async function calculateBurgies(eventId, actual) {
  const tipsSnap = await getDocs(collection(db, "events", eventId, "tips"));
  let closest = null;
  let minDiff = Infinity;
  const pointsMap = new Map();

  tipsSnap.forEach((tipDoc) => {
    const data = tipDoc.data();
    const diff = Math.abs(data.value - actual);
    let points = 0;
    if (diff <= 0) points = 50;
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

    pointsMap.set(tipDoc.id, points);

    if (diff < minDiff) {
      minDiff = diff;
      closest = tipDoc.id;
    }
  });

  // Bonuspunkte für den besten Tipper
  if (closest && pointsMap.has(closest)) {
    pointsMap.set(closest, pointsMap.get(closest) + 5);
  }

  // Punkte speichern
  for (const [username, points] of pointsMap.entries()) {
    const ref = doc(db, "burgies", username);
    await setDoc(ref, { [eventId]: points }, { merge: true });
  }
}

loadEvents();
