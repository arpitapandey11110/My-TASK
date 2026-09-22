async function loadEvents() {

    try {

        const response = await fetch("/api/events");

        console.log("STATUS:", response.status);

        const events = await response.json();

        console.log("EVENTS RECEIVED:", events);

        const table =
            document.getElementById("eventsTable");

        table.innerHTML = "";

        if (events.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="4">
                        No events found
                    </td>
                </tr>
            `;

            return;
        }

        events.forEach(event => {

            const row =
                document.createElement("tr");

            row.innerHTML = `
                <td>${event.name}</td>
                <td>${event.date}</td>
                <td>${event.location}</td>
                <td>
                    <button
                        onclick="viewUsers(${event.id})">
                        View Users
                    </button>
                </td>
            `;

            table.appendChild(row);
        });

    } catch (error) {

        console.error(
            "LOAD EVENTS ERROR:",
            error
        );

        alert("Unable to load events");
    }
}


function viewUsers(eventId) {

    console.log(
        "Selected event:",
        eventId
    );

    alert(
        "Selected event ID: " + eventId
    );
}


function logout() {

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    window.location.href = "login.html";
}


loadEvents();