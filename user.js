const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

if (!user || !token) {
    window.location.href = "login.html";
}


// Load events
async function loadEvents() {

    try {

        const response = await fetch("/api/events", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const events = await response.json();

        if (!response.ok) {
            alert(events.message);
            return;
        }

        const table = document.getElementById("eventsTable");

        table.innerHTML = "";

        events.forEach(event => {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${event.name}</td>
                <td>${event.date}</td>
                <td>${event.location}</td>
                <td>${event.details || ""}</td>
                <td>
                    <button onclick="bookEvent(${event.id})">
                        Book Now
                    </button>
                </td>
            `;

            table.appendChild(row);
        });

    } catch (error) {

        console.error("LOAD EVENTS ERROR:", error);

        alert("Unable to load events");
    }
}


// Book event
async function bookEvent(eventId) {

    console.log("BOOK EVENT ID:", eventId);

    try {

        const response = await fetch(
            `/api/events/${eventId}/book`,
            {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        const data = await response.json();

        console.log("BOOKING RESPONSE:", data);

        if (!response.ok) {
            alert(data.message);
            return;
        }

        alert("Event booked successfully!");

    } catch (error) {

        console.error("BOOKING ERROR:", error);

        alert("Unable to book event");
    }
}


// Logout
function logout() {

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    window.location.href = "login.html";
}


loadEvents();