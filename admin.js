const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

// Check admin login
if (!user || !token || user.role !== "admin") {
    window.location.href = "login.html";
}


const form = document.getElementById("eventForm");

form.addEventListener("submit", async function (event) {

    event.preventDefault();

    const name =
        document.getElementById("eventName").value.trim();

    const date =
        document.getElementById("eventDate").value;

    const location =
        document.getElementById("eventLocation").value.trim();

    const details =
        document.getElementById("eventDetails").value.trim();


    try {

        const response = await fetch("/api/events", {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },

            body: JSON.stringify({
                name: name,
                date: date,
                location: location,
                details: details
            })
        });


        const data = await response.json();

        console.log("CREATE EVENT RESPONSE:", data);


        if (!response.ok) {

            alert(data.message);
            return;
        }


        alert("Event created successfully!");

        form.reset();

        // Go to event management page
        window.location.href = "admin-events.html";


    } catch (error) {

        console.error("Create event error:", error);

        alert("Unable to connect to server");
    }
});