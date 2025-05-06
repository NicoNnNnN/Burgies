export function checkPassword() {
  const pw = document.getElementById("password").value;
  if (pw === "HellfireFLN2025") {
    window.location.href = "home.html";
  } else {
    alert("Falsches Passwort!");
  }
}
window.checkPassword = checkPassword;