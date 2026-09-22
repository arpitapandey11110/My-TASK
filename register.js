const form = document.getElementById("registerForm");

form.addEventListener("submit", async function (event) {

    event.preventDefault();

    console.log("FORM SUBMITTED");

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword =
        document.getElementById("confirmPassword").value;

    console.log("Username:", username);
    console.log("Email:", email);

    if (password !== confirmPassword) {
        document.getElementById("message").textContent =
            "Passwords do not match";
        return;
    }

    try {

        const response = await fetch("/api/register", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        });

        console.log("HTTP STATUS:", response.status);

        const data = await response.json();

        console.log("SERVER RESPONSE:", data);

        document.getElementById("message").textContent =
            data.message;

    } catch (error) {

        console.error("FETCH ERROR:", error);

        document.getElementById("message").textContent =
            "Request failed";
    }
});
