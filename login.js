const form = document.getElementById("loginForm");

form.addEventListener("submit", async function (event) {

    event.preventDefault();

    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value;

    const message =
        document.getElementById("message");

    try {

        const response = await fetch("/api/login", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();

        console.log("Login response:", data);

        if (!response.ok) {
            message.textContent = data.message;
            return;
        }

        // Save user
        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );

        // Save token
        localStorage.setItem(
            "token",
            data.token
        );

        console.log("LOGIN SUCCESSFUL");
        console.log("Role:", data.user.role);

        // Redirect based on role
        if (data.user.role === "admin") {

            window.location.href = "admin.html";

        } else {

            window.location.href = "user.html";
        }

    } catch (error) {

        console.error("LOGIN ERROR:", error);

        message.textContent =
            "Cannot connect to server";
    }
});