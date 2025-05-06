
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot
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
const eventsContainer = document.getElementById("eventsContainer");
const filterDropdown = document.getElementById("filter");

filterDropdown.addEventListener("change", loadEvents);

function isUpcoming(eventDateTime) {
  return new Date(eventDateTime) > new Date();
}

function isTipAllowed(eventDateTime) {
  const eventTime = new Date(eventDateTime);
  const now = new Date();
  const diffInMs = eventTime - now;
  return diffInMs > 1000 * 60 * 60 * 48;
}

function formatDateTime(dateStr, timeStr) {
  return new Date(dateStr + "T" + timeStr);
}

async function loadEvents() {
  eventsContainer.innerHTML = "";
  const snapshot = await getDocs(collection(db, "events"));
  const filter = filterDropdown.value;

  snapshot.forEach(async (docSnap) => {
    const data = docSnap.data();
    const eventDateTime = formatDateTime(data.date, data.time);
    const upcoming = isUpcoming(eventDateTime);

    if ((filter === "upcoming" && !upcoming) || (filter === "past" && upcoming)) {
      return;
    }

    const tipRef = doc(db, "events", docSnap.id, "tips", username);
    const tipSnap = await getDoc(tipRef);
    const alreadyTipped = tipSnap.exists();

    const card = document.createElement("div");
    card.className = "event-card";

    card.innerHTML = `
      <h3>${data.title}</h3>
      <p>Datum: ${data.date} um ${data.time}</p>
      <p><strong>Tippabgabe bis: </strong> ${new Date(eventDateTime.getTime() - 1000 * 60 * 60 * 48).toLocaleString()}</p>
      ${alreadyTipped
        ? `<p style="color:green;"><strong>Du hast bereits getippt.</strong></p>`
        : isTipAllowed(eventDateTime)
          ? `
          <input type="number" placeholder="Dein Tipp in €" id="tip-${docSnap.id}" />
          <button onclick="submitTip('${docSnap.id}')">Tipp abgeben</button>
          `
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
  if (isNaN(value)) return alert("Bitte gültigen Tipp eingeben!");

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
  const tipsSnap = await getDocs(collection(db, "events", eventId, "tips"));
  let tippers = [];
  tipsSnap.forEach(tip => {
    tippers.push(tip.id);
  });

  tipListEl.innerHTML = `<p style="margin-top:1rem;"><strong>Schon getippt:</strong> ${tippers.length > 0 ? tippers.join(', ') : 'Noch niemand'}</p>`;
}

loadEvents();
