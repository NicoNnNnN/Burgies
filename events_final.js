
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc
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

const username = localStorage.getItem("username") || "Gast";
const eventsContainer = document.getElementById("eventContainer");
const filterDropdown = document.getElementById("filter");

filterDropdown.addEventListener("change", loadEvents);

function isUpcoming(dateStr, timeStr) {
  const eventDate = new Date(dateStr + "T" + timeStr);
  return new Date() < eventDate;
}

function isTipAllowed(dateStr, timeStr) {
  const eventTime = new Date(dateStr + "T" + timeStr);
  const now = new Date();
  const diffMs = eventTime - now;
  return diffMs > 48 * 60 * 60 * 1000;
}

async function loadEvents() {
  eventsContainer.innerHTML = "";
  const snapshot = await getDocs(collection(db, "events"));
  const filter = filterDropdown.value;

  snapshot.forEach(async (docSnap) => {
    const data = docSnap.data();
    const { title, date, time } = data;

    if (!title || !date || !time) return;

    const upcoming = isUpcoming(date, time);
    if ((filter === "upcoming" && !upcoming) || (filter === "past" && upcoming)) return;

    const tipRef = doc(db, "events", docSnap.id, "tips", username);
    const tipSnap = await getDoc(tipRef);
    const alreadyTipped = tipSnap.exists();

    const card = document.createElement("div");
    card.className = "event-card";

    card.innerHTML = `
      <h3>${title}</h3>
      <p>Datum: ${date} – Uhrzeit: ${time}</p>
      <p><strong>Tippabgabe bis:</strong> ${new Date(new Date(date + 'T' + time).getTime() - 1000 * 60 * 60 * 48).toLocaleString()}</p>
      ${alreadyTipped
        ? `<p style="color:green;"><strong>Du hast bereits getippt.</strong></p>`
        : isTipAllowed(date, time)
          ? `<input type="number" placeholder="Dein Tipp (€)" id="tip-${docSnap.id}" />
             <button onclick="submitTip('${docSnap.id}')">Tipp abgeben</button>`
          : `<p style="color:gray;">Tippabgabe geschlossen</p>`
      }
      <div id="tipList-${docSnap.id}"></div>
    `;

    eventsContainer.appendChild(card);
    loadTippers(docSnap.id);
  });
}

window.submitTip = async function (eventId) {
  const input = document.getElementById("tip-" + eventId);
  const value = parseFloat(input.value);
  if (isNaN(value)) return alert("Bitte gib einen gültigen Tipp ein.");

  const tipRef = doc(db, "events", eventId, "tips", username);
  await setDoc(tipRef, {
    value,
    timestamp: new Date().toISOString()
  });

  alert("Tipp gespeichert!");
  loadEvents();
};

async function loadTippers(eventId) {
  const tipListEl = document.getElementById("tipList-" + eventId);
  const tipDocs = await getDocs(collection(db, "events", eventId, "tips"));
  const names = [];
  tipDocs.forEach(doc => names.push(doc.id));
  tipListEl.innerHTML = `<p><strong>Schon getippt:</strong> ${names.length > 0 ? names.join(', ') : 'Noch niemand'}</p>`;
}

loadEvents();
