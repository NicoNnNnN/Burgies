
function checkPassword() {
    const correctPassword = "HellfireFLN2025";
    const entered = document.getElementById("accessPassword").value;
    const message = document.getElementById("message");

    if (entered === correctPassword) {
        message.style.color = "green";
        message.innerText = "Zugang erlaubt. (Ab hier geht später die App los)";
    } else {
        message.style.color = "red";
        message.innerText = "Falsches Passwort. Versuch es nochmal.";
    }
}
