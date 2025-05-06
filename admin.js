import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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

const adminPassword = "admin2025";

window.checkAdminPassword = function () {
  const input = document.getElementById("adminPw").value;
  const msg = document.getElementById("loginMsg");
  if (input === adminPassword) {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("adminContent").style.display = "block";
    msg.textContent = "";
    loadEvents();
  } else {
    msg.textContent = "Falsches Passwort!";
  }
};

document.getElementById("saveEvent").addEventListener("click", async () => {
  const title = document.getElementById("eventTitle").value;
  const date = document.getElementById("eventDate").value;
  const time = document.getElementById("eventTime").value;

  if (!title || !date || !time) {
    alert("Bitte alle Felder ausfüllen!");
    return;
  }

  try {
    await addDoc(collection(db, "events"), {
      title,
      date,
      time,
      createdAt: new Date()
    });
    alert("Event gespeichert!");
    document.getElementById("eventTitle").value = "";
    document.getElementById("eventDate").value = "";
    document.getElementById("eventTime").value = "";
    loadEvents();
  } catch (e) {
    alert("Fehler beim Speichern: " + e);
  }
});

async function loadEvents() {
  const snapshot = await getDocs(collection(db, "events"));
  const list = document.getElementById("eventList");
  list.innerHTML = "";
  snapshot.forEach(doc => {
    const data = doc.data();
    const div = document.createElement("div");
    div.style.marginBottom = "1rem";
    div.innerHTML = `<strong>${data.title}</strong><br>${data.date} – ${data.time}`;
    list.appendChild(div);
  });
}