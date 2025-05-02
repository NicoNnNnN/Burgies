function checkPassword() {
    const password = document.getElementById("passwordInput").value;

    if (password === "HellfireFLN2025") {
        // Weiterleitung auf neue Seite
        window.location.href = "home.html";
    } else {
        const message = document.getElementById("statusMessage");
        message.innerText = "Falsches Passwort!";
        message.style.color = "red";
    }
}
