
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore, doc, setDoc
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

// Neues Event hinzufügen
window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("eventForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    if (!title || !date || !time) {
      return alert("Bitte alle Felder ausfüllen.");
    }

    const ref = doc(db, "events", date, title);
    await setDoc(ref, {
      title,
      date,
      time,
      createdAt: Date.now()
    });

    alert("Event gespeichert!");
    form.reset();
  });
});
