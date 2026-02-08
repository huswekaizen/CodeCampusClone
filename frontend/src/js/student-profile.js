
document.addEventListener("DOMContentLoaded", async () => {
    const userId = localStorage.getItem("userId");
    
    fetchCourseCount(`http://localhost:5000/api/students/${userId}/enrolled-courses`);
    fetchStudentRank(`http://localhost:5000/api/students/globalLeaderboard`, userId);
    fetchStudentData(`http://localhost:5000/api/users/${userId}/details`);
    
});

async function fetchStudentData(url) {

    try {
        const res = await fetch(url);
        const student = await res.json();

        const username = document.getElementById("username");
        const firstName = document.getElementById("firstName");
        const lastName = document.getElementById("lastName");
        const fullName = document.getElementById("fullName");
        const role = document.getElementById("role");
        const joinedDate = document.getElementById("joinedDate");

        const joinedDateObj = new Date(student.createdAt);
        joinedDate.textContent = `${joinedDateObj.toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                    })}`;

        username.textContent = student?.username || "N/A"; 
        firstName.textContent = student?.firstName || "N/A";
        lastName.textContent = student?.lastName || "N/A";
        fullName.textContent = `${student?.firstName || ""} ${student?.lastName || ""}`.trim() || "N/A";
        role.textContent = student?.role || "N/A";


    } catch (err) {
        console.error("Failed to load student data", err);
    }
}

async function fetchCourseCount(url) {

    try {
        const res = await fetch(url);
        const students = await res.json();

        const courseCount = document.getElementById("courseCount");

        courseCount.textContent = students.count || "N/A";
    } catch (err) {
        console.error("Failed to load leaderboard", err);
    }
}

async function fetchStudentRank(url, userId) {
    try {
        const res = await fetch(url);
        const students = await res.json();
        const myIndex = students.findIndex(s => s._id === userId);
        const rank = document.getElementById("rank");
        rank.textContent = myIndex >= 0 ? myIndex + 1 : "N/A";
    } catch (err) {
        console.error("Failed to load leaderboard", err);
    }
}