import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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

loadEvents();
