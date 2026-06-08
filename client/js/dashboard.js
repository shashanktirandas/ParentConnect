let allStudents = [];
// Get faculty data from localStorage

const faculty = JSON.parse(localStorage.getItem("faculty"));

// If not logged in, redirect back

if (!faculty) {

    window.location.href = "faculty-login.html";

}

// Display faculty information

document.querySelector("h1").textContent =
`Welcome ${faculty.name}`;

document.querySelector(".subtitle").innerHTML = `
Department : <b>${faculty.department}</b>
<br>
Year : <b>${faculty.year}</b>
<br>
Section : <b>${faculty.section}</b>
`;

document
.getElementById("logoutBtn")
.addEventListener("click", () => {

    localStorage.removeItem("faculty");

    window.location.href = "faculty-login.html";

});

async function loadDashboardStats() {

    try {

        const response = await fetch(

            `http://localhost:3000/api/faculty/dashboard?faculty_id=${faculty.faculty_id}`

        );

        const result = await response.json();

        if (!result.success) {

            return;

        }

        document.getElementById("totalStudents").textContent =
            result.data.totalStudents;

        document.getElementById("presentStudents").textContent =
            result.data.presentStudents;

        document.getElementById("absentStudents").textContent =
            result.data.absentStudents;

        document.getElementById("alertsSent").textContent =
            result.data.alertsSent;

    }

    catch (error) {

        console.log(error);

    }

}

loadDashboardStats();

async function loadDashboard() {

    try {

        const response = await fetch(

            `http://localhost:3000/api/faculty/dashboard?faculty_id=${faculty.faculty_id}`

        );

        const result = await response.json();

        if (!result.success) return;

        document.getElementById("totalStudents").textContent =
            result.data.totalStudents;

        document.getElementById("presentStudents").textContent =
            result.data.presentStudents;

        document.getElementById("absentStudents").textContent =
            result.data.absentStudents;

        document.getElementById("alertsSent").textContent =
            result.data.alertsSent;
        // Student table
        allStudents = result.data.students;
        renderStudents(allStudents);
        //loadNotifications();

const tbody = document.getElementById("studentTableBody");

tbody.innerHTML = "";

result.data.students.forEach(student => {

    const row = document.createElement("tr");

    row.innerHTML = `

        <td>${student.roll_no}</td>

        <td>${student.name}</td>

        <td>

            ${student.status === "Present"

? '<span class="present">✅ Present</span>'

: '<span class="absent">❌ Absent</span>'}

        </td>

        <td>

            ${student.attendance_time || "--"}

        </td>

    `;

    tbody.appendChild(row);

});

    }

    catch (err) {

        console.log(err);

    }

}

loadDashboard();

function renderStudents(students){

    const tbody =
    document.getElementById("studentTableBody");

    tbody.innerHTML = "";

    students.forEach(student => {

        const row =
        document.createElement("tr");

        row.innerHTML = `

        <td>${student.roll_no}</td>

        <td>${student.name}</td>

        <td>

        ${
            student.status === "Present"

            ? '<span class="present">✅ Present</span>'

            : '<span class="absent">❌ Absent</span>'
        }

        </td>

        <td>

        ${student.attendance_time || "--"}

        </td>

        `;

        tbody.appendChild(row);

    });

}

document
.getElementById("searchInput")
.addEventListener("input",(e)=>{

    const keyword =
    e.target.value.toLowerCase();

    const filtered =
    allStudents.filter(student =>

        student.roll_no
        .toLowerCase()
        .includes(keyword)

    );

    renderStudents(filtered);

});
document
.getElementById("allBtn")
.addEventListener("click",()=>{

    renderStudents(allStudents);

});

document
.getElementById("presentBtn")
.addEventListener("click",()=>{

    const presentStudents =
    allStudents.filter(student =>

        student.status === "Present"

    );

    renderStudents(presentStudents);

});

document
.getElementById("absentBtn")
.addEventListener("click",()=>{

    const absentStudents =
    allStudents.filter(student =>

        student.status === "Absent"

    );

    renderStudents(absentStudents);

});

document
.getElementById("exportBtn")
.addEventListener("click", () => {

    let csv = "Roll Number,Name,Status,Time\n";

    allStudents.forEach((student) => {

        csv += `${student.roll_no},${student.name},${student.status},${student.attendance_time || "--"}\n`;

    });

    const blob = new Blob(
        [csv],
        {
            type: "text/csv;charset=utf-8;"
        }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "attendance.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

});

async function loadNotifications() {

    const response = await fetch(
        `http://localhost:3000/api/faculty/notifications?faculty_id=${faculty.faculty_id}`
    );

    const result = await response.json();

    const tbody =
    document.getElementById("notificationTableBody");

    tbody.innerHTML = "";

    result.notifications.forEach(item => {

        tbody.innerHTML += `

        <tr>

            <td>

${new Date(item.sent_at)
.toLocaleString()}

</td>
            <td>${item.email_type}</td>

            <td>${item.roll_no}</td>

            <td>${item.name}</td>

            <td>

${item.status === "Success"

? '<span class="success-badge">Success</span>'

: '<span class="failed-badge">Failed</span>'}

</td>

        </tr>

        `;

    });

}
