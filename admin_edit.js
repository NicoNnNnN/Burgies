import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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
  const querySnapshot = await getDocs(collection(db, "events")); // << klein!
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${data.title}</strong> – ${data.date} um ${data.time}
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
    await updateDoc(doc(db, "events", editId), { title, date, time }); // << klein!
    editId = null;
  } else {
    await addDoc(collection(db, "events"), {
      title,
      date,
      time,
      createdAt: Date.now()
    }); // << klein!
  }

  eventForm.reset();
  loadEvents();
});

window.deleteEvent = async (id) => {
  await deleteDoc(doc(db, "events", id)); // << klein!
  loadEvents();
};

window.editEvent = (id, title, date, time) => {
  document.getElementById("title").value = title;
  document.getElementById("date").value = date;
  document.getElementById("time").value = time;
  editId = id;
};

loadEvents();
async function calculateBurgies(eventId, actualValue) {
  const tipsRef = collection(db, "events", eventId, "tips");
  const tipsSnapshot = await getDocs(tipsRef);

  let closest = null;
  let closestDiff = Infinity;

  // Durch alle Tipps iterieren
  tipsSnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const diff = Math.abs(data.value - actualValue);

    // Besten Tipp merken
    if (diff < closestDiff) {
      closest = docSnap.id;
      closestDiff = diff;
    }
  });

  // Erneut durchgehen und Punkte berechnen
  tipsSnapshot.forEach(async (docSnap) => {
    const user = docSnap.id;
    const data = docSnap.data();
    const diff = Math.abs(data.value - actualValue);

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

    // Bonus für besten Tipp
    if (user === closest) {
      points += 5;
    }

    // In Firestore speichern
    await setDoc(doc(db, "burgies", user), {
      total: (await getDoc(doc(db, "burgies", user))).exists() 
        ? (await getDoc(doc(db, "burgies", user))).data().total + points
        await calculateBurgies(id, parseFloat(actualWin));
        : points
    }, { merge: true });
  });
}
