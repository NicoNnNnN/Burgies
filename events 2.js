
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { app } from './firebaseConfig.js';

const db = getFirestore(app);
const eventsContainer = document.getElementById("eventsContainer");
const filterSelect = document.getElementById("filter");

function formatTime(timeStr) {
  const [hours, minutes] = timeStr.split(":");
  return `${hours}:${minutes}`;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date)) return "Ungültiges Datum";
  return date.toLocaleDateString("de-DE", { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

async function fetchEvents() {
  const q = query(collection(db, "events"), orderBy("date", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

function renderEvents(events, filter) {
  const now = new Date();
  eventsContainer.innerHTML = "";

  events.forEach(event => {
    const { title, date, time } = event;

    if (!title || !date || !time) return;

    const eventDate = new Date(date + "T" + time);
    const isPast = eventDate < now;

    if ((filter === "upcoming" && isPast) || (filter === "past" && !isPast)) return;

    const card = document.createElement("div");
    card.className = "event-card";

    card.innerHTML = `
      <h2>${title}</h2>
      <p><strong>Datum:</strong> ${formatDate(date)} um ${formatTime(time)}</p>
      <p><strong>Tippabgabe bis:</strong> ${new Date(eventDate.getTime() - 48 * 3600000).toLocaleString("de-DE")}</p>
      <p class="closed">Tippabgabe ${isPast ? "geschlossen" : "möglich"}</p>
      <p><strong>Schon getippt:</strong> Noch niemand</p>
    `;

    eventsContainer.appendChild(card);
  });
}

filterSelect.addEventListener("change", async () => {
  const events = await fetchEvents();
  renderEvents(events, filterSelect.value);
});

window.addEventListener("DOMContentLoaded", async () => {
  const events = await fetchEvents();
  renderEvents(events, filterSelect.value);
});
