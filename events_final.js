import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Firebase-Init
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

// Benutzername holen
const username = localStorage.getItem("username") || "Gast";
const container = document.getElementById("eventContainer");

// Tipp erlaubt prüfen
function isTipAllowed(dateStr, timeStr) {
  const eventTime = new Date(dateStr + "T" + timeStr);
  const now = new Date();
  const diff = eventTime - now;
  return diff > 48 * 60 * 60 * 1000;
}

// Countdown berechnen
function countdownText(dateStr, timeStr) {
  const eventTime = new Date(dateStr + "T" + timeStr);
  const now = new Date();
  const diffMs = eventTime - now;
  const hours = Math.floor(diffMs / 1000 / 60 / 60);
  const minutes = Math.floor((diffMs / 1000 / 60) % 60);
  return diffMs > 0 ? `${hours}h ${minutes}min` : "Event gestartet";
}

// Events laden
async function loadEvents() {
  container.innerHTML = "";
  const snapshot = await getDocs(collection(db, "events"));
  const now = new Date();

  snapshot.forEach(async (docSnap) => {
    const data = docSnap.data();
    const { title, date, time } = data;
    if (!title || !date || !time) return;

    const eventDateTime = new Date(date + "T" + time);
    if (eventDateTime < now) return; // Nur zukünftige Events

    const tipRef = doc(db, "events", docSnap.id, "tips", username);
    const tipSnap = await getDoc(tipRef);
    const alreadyTipped = tipSnap.exists();

    const card = document.createElement("div");
    card.className = "event-card";
    card.innerHTML = `
      <h3>${title}</h3>
      <p>Datum: ${date} – Uhrzeit: ${time}</p>
      <p class="countdown"><strong>Countdown:</strong> ${countdownText(date, time)}</p>
      ${alreadyTipped
        ? `<p style="color:green;"><strong>Du hast bereits getippt.</strong></p>`
        : isTipAllowed(date, time)
          ? `<div class="tip-section">
              <input type="number" id="tip-${docSnap.id}" placeholder="Dein Tipp (€)" />
              <button onclick="submitTip('${docSnap.id}')">Tipp abgeben</button>
            </div>`
          : `<p style="color:gray;">Tippabgabe geschlossen</p>`
      }
      <div class="tipped-users" id="tipList-${docSnap.id}">Wird geladen...</div>
    `;
    container.appendChild(card);
    loadTippers(docSnap.id);
  });
}

// Tipp absenden
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

// Wer hat schon getippt?
async function loadTippers(eventId) {
  const tipListEl = document.getElementById("tipList-" + eventId);
  const tipDocs = await getDocs(collection(db, "events", eventId, "tips"));
  const names = [];
  tipDocs.forEach(doc => names.push(doc.id));
  tipListEl.innerHTML = `<strong>Schon getippt:</strong> ${names.length > 0 ? names.join(', ') : 'Niemand'}`;
}

// Starte
loadEvents();
