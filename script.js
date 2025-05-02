function checkPassword() {
    const password = document.getElementById("passwordInput").value;
    const message = document.getElementById("statusMessage");

    if (password === "HellfireFLN2025") {
        message.innerText = "Zugang erlaubt! (Hier beginnt deine Webapp)";
        message.style.color = "green";
    } else {
        message.innerText = "Falsches Passwort!";
        message.style.color = "red";
    }
}
