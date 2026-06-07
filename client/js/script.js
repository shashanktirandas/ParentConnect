const attendanceForm = document.querySelector("#attendanceForm");
const statusMessage = document.querySelector("#statusMessage");
const attendanceButton = attendanceForm?.querySelector("button[type='submit']");
const ATTENDANCE_API_URL = "http://localhost:3000/api/attendance/mark";
const facultyLoginForm = document.querySelector("#facultyLoginForm");
const facultyLoginStatus = document.querySelector("#facultyLoginStatus");
const facultyLoginButton = facultyLoginForm?.querySelector("button[type='submit']");
const FACULTY_LOGIN_API_URL = "http://localhost:3000/api/faculty/login";

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

function setFacultyLoginStatus(message, type = "neutral") {
  if (!facultyLoginStatus) return;

  facultyLoginStatus.textContent = message;
  facultyLoginStatus.classList.remove("success", "error");

  if (type !== "neutral") {
    facultyLoginStatus.classList.add(type);
  }
}

function setFacultyLoginLoadingState(isLoading) {
  if (!facultyLoginButton) return;

  facultyLoginButton.disabled = isLoading;
  facultyLoginButton.textContent = isLoading ? "Logging in..." : "Faculty Login";
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

async function submitFacultyLogin(facultyId, password) {
  const response = await fetch(FACULTY_LOGIN_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      faculty_id: facultyId,
      password,
    }),
  });

  return response.json();
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

if (facultyLoginForm) {
  facultyLoginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const facultyId = facultyLoginForm.facultyId.value.trim();
    const password = facultyLoginForm.facultyPassword.value.trim();

    if (!facultyId || !password) {
      setFacultyLoginStatus("Faculty ID and Password are required.", "error");
      return;
    }

    setFacultyLoginLoadingState(true);
    setFacultyLoginStatus("Checking faculty credentials...");

    try {
      // Send credentials to the existing faculty login API without reloading the page.
      const data = await submitFacultyLogin(facultyId, password);

      if (data.success) {
        localStorage.setItem("faculty", JSON.stringify(data.faculty));
        console.log("Faculty Login Successful");
        setFacultyLoginStatus("Login Successful", "success");

        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1000);
        return;
      }

      setFacultyLoginStatus(data.message, "error");
    } catch (error) {
      setFacultyLoginStatus("Unable to connect to server.", "error");
    } finally {
      setFacultyLoginLoadingState(false);
    }
  });
}
