const attendanceForm = document.querySelector("#attendanceForm");
const statusMessage = document.querySelector("#statusMessage");
const attendanceButton = attendanceForm?.querySelector("button[type='submit']");
const ATTENDANCE_API_URL = "http://localhost:3000/api/attendance/mark";

function setStatus(message, type = "neutral") {
  if (!statusMessage) return;

  statusMessage.textContent = message;
  statusMessage.classList.remove("success", "error");

  if (type !== "neutral") {
    statusMessage.classList.add(type);
  }
}

function setLoadingState(isLoading) {
  if (!attendanceButton) return;

  attendanceButton.disabled = isLoading;
  const buttonLabel = isLoading ? "Marking Attendance..." : "Mark Attendance";
  const textNode = Array.from(attendanceButton.childNodes).find(
    (node) => node.nodeType === Node.TEXT_NODE
  );

  if (textNode) {
    textNode.nodeValue = ` ${buttonLabel}`;
  }
}

async function submitAttendance(rollNumber, password) {
  const response = await fetch(ATTENDANCE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      roll_no: rollNumber,
      password,
    }),
  });

  const data = await response.json();

  return {
    ok: response.ok,
    message: data.message,
  };
}

if (attendanceForm) {
  attendanceForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const rollNumber = attendanceForm.rollNumber.value.trim();
    const password = attendanceForm.password.value.trim();

    if (!rollNumber || !password) {
      setStatus("Roll Number and Password are required.", "error");
      return;
    }

    setLoadingState(true);
    setStatus("Processing attendance request...");

    try {
      const result = await submitAttendance(rollNumber, password);

      setStatus(result.message, result.ok ? "success" : "error");
    } catch (error) {
      setStatus("Unable to connect to server.", "error");
    } finally {
      attendanceForm.password.value = "";
      setLoadingState(false);
    }
  });
}
