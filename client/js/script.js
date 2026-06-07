const attendanceForm = document.querySelector("#attendanceForm");
const statusMessage = document.querySelector("#statusMessage");

function setStatus(message, type = "neutral") {
  if (!statusMessage) return;

  statusMessage.textContent = message;
  statusMessage.classList.remove("success", "error");

  if (type !== "neutral") {
    statusMessage.classList.add(type);
  }
}

if (attendanceForm) {
  attendanceForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const rollNumber = attendanceForm.rollNumber.value.trim();
    const password = attendanceForm.password.value.trim();

    if (!rollNumber || !password) {
      setStatus("Please enter roll number and password to simulate verification.", "error");
      return;
    }

    setStatus("Attendance marked successfully. Parent notification will be added in a future phase.", "success");
    attendanceForm.reset();
  });
}
