// Inicializar Firebase
const firebaseConfig = {
    apiKey: "AIzaSyALEuh5ED5nwD6QMmd3kqWEhuz0q4MCvSM",
    authDomain: "agenda-shalom.firebaseapp.com",
    databaseURL: "https://agenda-shalom-default-rtdb.firebaseio.com",
    projectId: "agenda-shalom",
    storageBucket: "agenda-shalom.appspot.com",
    messagingSenderId: "85210285177",
    appId: "1:85210285177:web:50fe39610142ca4ade00a8",
    measurementId: "G-FNBYHCVTYW"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

document.addEventListener("DOMContentLoaded", () => {
    const appointmentForm = document.getElementById("appointmentForm");
    const dateInput = document.getElementById("date");
    const timeSelect = document.getElementById("time");
    const adminPasswordInput = document.getElementById("adminPassword");
    const adminLoginBtn = document.getElementById("adminLoginBtn");
    const appointmentsSection = document.getElementById("appointmentsSection");
    const appointmentsList = document.getElementById("appointmentsList");
    const notification = document.getElementById("notification");

    const ADMIN_PASSWORD = "Am05.02*";

    // Fechas restringidas (Miércoles y Domingos)
    function isRestrictedDate(date) {
        const day = new Date(date).getDay();
        return day === 3 || day === 0; // 3 = Miércoles, 0 = Domingo
    }

    // Actualizar opciones de horarios
    function updateTimeOptions() {
        timeSelect.innerHTML = "";
        const times = ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30"];

        db.ref("appointments").once("value", (snapshot) => {
            const appointmentsData = snapshot.val() || {};
            times.forEach(time => {
                const isTaken = Object.values(appointmentsData).some(a => a.date === dateInput.value && a.time === time);
                if (!isTaken) {
                    const option = document.createElement("option");
                    option.value = time;
                    option.textContent = time;
                    timeSelect.appendChild(option);
                }
            });
        });
    }

    dateInput.addEventListener("change", () => {
        if (isRestrictedDate(dateInput.value)) {
            alert("No se pueden agendar citas los miércoles ni domingos.");
            dateInput.value = "";
        } else {
            updateTimeOptions();
        }
    });

    appointmentForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value;
        const phone = document.getElementById("phone").value;
        const service = document.getElementById("service").value;
        const date = dateInput.value;
        const time = timeSelect.value;

        if (!date || !time) return alert("Selecciona una fecha y hora válidas.");

        const appointment = { name, phone, service, date, time };

        db.ref("appointments").push(appointment, (error) => {
            if (error) {
                alert("Error al guardar la cita. Inténtalo de nuevo.");
            } else {
                showNotification();
                updateTimeOptions();
            }
        });
    });

    function showNotification() {
        notification.classList.remove("hidden");
        setTimeout(() => {
            notification.classList.add("hidden");
        }, 3000);
    }

    adminLoginBtn.addEventListener("click", () => {
        if (adminPasswordInput.value === ADMIN_PASSWORD) {
            appointmentsSection.classList.remove("hidden");
            renderAppointments();
        } else {
            alert("Contraseña incorrecta.");
        }
    });

    function renderAppointments() {
        appointmentsList.innerHTML = "";

        db.ref("appointments").once("value", (snapshot) => {
            const appointmentsData = snapshot.val();
            if (appointmentsData) {
                Object.values(appointmentsData).forEach(({ name, phone, service, date, time }) => {
                    const li = document.createElement("li");
                    li.textContent = `${date} - ${time} | ${service} | ${name} (${phone})`;
                    appointmentsList.appendChild(li);
                });
            }
        });
    }

    // Actualizar la lista de turnos en tiempo real
    db.ref("appointments").on("value", () => {
        renderAppointments();
    });
});
