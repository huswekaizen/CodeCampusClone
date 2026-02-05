

document.addEventListener("DOMContentLoaded", () => {
    const userId = localStorage.getItem("userId");
    
    studentProfileLoad(`http://localhost:5000/api/students/${userId}/enrolled-courses`);
});

async function studentProfileLoad(url) {


    try {
        const res = await fetch(url);
        const students = await res.json();

        const courseCount = document.getElementById("courseCount");
        const rank = document.getElementById("rank");

        courseCount.textContent = students.count || "N/A";
    } catch (err) {
        console.error("Failed to load leaderboard", err);
    }
}