import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, doc, deleteDoc,
  updateDoc, addDoc, setDoc, getDoc, increment
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
      <strong>${data.title}</strong> â ${data.date} um ${data.time}
      <input type="number" id="actual-${docSnap.id}" placeholder="TatsÃ¤chlicher Gewinn" />
      <button onclick="enterActualWin('${docSnap.id}')">Auswerten</button>
      <button onclick="editEvent('${docSnap.id}', '${data.title}', '${data.date}', '${data.time}')">Bearbeiten</button>
      <button onclick="deleteEvent('${docSnap.id}')">LÃ¶schen</button>
    `;
    eventList.appendChild(li);
  });
}

eventForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;

  if (!title || !date || !time) {
    alert("Bitte fÃ¼lle alle Felder aus.");
    return;
  }

  try {
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
  } catch (err) {
    console.error("Fehler beim Speichern:", err);
    alert("Fehler beim Speichern. Siehe Konsole.");
  }
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
  const actual = parseFloat(input.value);
  if (isNaN(actual)) return alert("Bitte gÃ¼ltigen Gewinn eingeben.");

  await setDoc(doc(db, "events", eventId), { actual }, { merge: true });
  await calculateBurgies(eventId, actual);
  alert("Gewinn gespeichert und Burgies berechnet!");
};

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
    await updateBurgies(u.user, u.points);
  }
}

async function updateBurgies(username, punkte) {
  const now = new Date();

  const dailyKey = now.toISOString().split("T")[0];
  const week = getWeek(now);
  const weeklyKey = `KW${week}-${now.getFullYear()}`;
  const monthlyKey = now.toISOString().slice(0, 7);

  const basePath = `burgies/${username}`;

  await updateOrCreate(`${basePath}/total/sum`, "points", punkte);
  await updateOrCreate(`${basePath}/daily/${dailyKey}`, "points", punkte);
  await updateOrCreate(`${basePath}/weekly/${weeklyKey}`, "points", punkte);
  await updateOrCreate(`${basePath}/monthly/${monthlyKey}`, "points", punkte);
}

async function updateOrCreate(pathString, field, amount) {
  const ref = doc(db, ...pathString.split("/"));
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, {
      [field]: increment(amount)
    });
  } else {
    await setDoc(ref, {
      [field]: amount
    });
  }
}

function getWeek(date) {
  const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = temp.getUTCDay() || 7;
  temp.setUTCDate(temp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((temp - yearStart) / 86400000) + 1) / 7);
  return weekNum.toString().padStart(2, "0");
}

loadEvents();
