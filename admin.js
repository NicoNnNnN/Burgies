const adminPassword = "admin2025";

window.checkAdminPassword = function () {
  const input = document.getElementById("adminPw").value;
  const msg = document.getElementById("loginMsg");
  if (input === adminPassword) {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("adminContent").style.display = "block";
    msg.textContent = "";
    // Optional: Lade Inhalte hier, z.B. Events und Userdaten
  } else {
    msg.textContent = "Falsches Passwort!";
  }
};