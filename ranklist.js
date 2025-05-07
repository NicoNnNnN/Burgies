async function loadRanking(type) {
  const tbody = document.getElementById("rankingTable").querySelector("tbody");
  tbody.innerHTML = "";

  try {
    const snapshot = await getDocs(collection(db, "burgies"));
    const ranking = [];

    const now = new Date();
    let key = "";

    if (type === "daily") {
      key = now.toISOString().split("T")[0]; // z. B. "2025-05-07"
    } else if (type === "weekly") {
      const temp = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
      const dayNum = temp.getUTCDay() || 7;
      temp.setUTCDate(temp.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
      const weekNum = Math.ceil((((temp - yearStart) / 86400000) + 1) / 7);
      key = `KW${weekNum.toString().padStart(2, "0")}-${now.getFullYear()}`;
    } else if (type === "monthly") {
      key = now.toISOString().slice(0, 7); // z. B. "2025-05"
    }

    for (const docSnap of snapshot.docs) {
      const username = docSnap.id;
      if (!username) continue;

      if (type === "total") {
        const totalRef = doc(db, `burgies/${username}/total/sum`);
        const totalSnap = await getDoc(totalRef);
        if (totalSnap.exists()) {
          const data = totalSnap.data();
          if (data && typeof data.points === "number" && data.points > 0) {
            ranking.push({ username, points: data.points });
          }
        }
      } else {
        const colRef = collection(db, `burgies/${username}/${type}`);
        const subSnap = await getDocs(colRef);
        subSnap.forEach(doc => {
          const data = doc.data();
          const docId = doc.id.trim();
          console.log(`Vergleich: ${username} → ${type}/${docId} vs. Key: ${key}`);
          if (docId === key && data && typeof data.points === "number" && data.points > 0) {
            ranking.push({ username, points: data.points });
          }
        });
      }
    }

    ranking.sort((a, b) => b.points - a.points);

    if (ranking.length === 0) {
      const row = document.createElement("tr");
      row.innerHTML = '<td colspan="3">Keine Ranglistendaten vorhanden.</td>';
      tbody.appendChild(row);
      return;
    }

    ranking.forEach((entry, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${entry.username}</td>
        <td>${entry.points}</td>
      `;
      tbody.appendChild(row);
    });

  } catch (error) {
    console.error("Fehler beim Laden der Rangliste:", error);
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="3">Fehler beim Laden der Rangliste.</td>';
    tbody.appendChild(row);
  }
}
