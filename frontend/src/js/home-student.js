import { loadLeaderboard } from "./leaderboard-student.js";

document.addEventListener("DOMContentLoaded", () => {
    const userId = localStorage.getItem("userId");
    
    studentHomeLoad(`http://localhost:5000/api/students/globalLeaderboard`, userId);
    loadLeaderboard(`http://localhost:5000/api/students/globalLeaderboard`, { compact: true });
    fetchCourseCount(`http://localhost:5000/api/students/${userId}/enrolled-courses`);

});

async function studentHomeLoad(url, userId) {

    try {
        const res = await fetch(url);
        const students = await res.json();

        const activitiesCount = document.getElementById("activitiesCount");
        const overallPointsCount = document.getElementById("overallPointsCount");
        const rankCount = document.getElementById("rankCount");

        const me = students.find(s => s._id === userId);

        console.log("ACTIVITIES COUNT:", me.completedActivities)

        activitiesCount.textContent = me?.completedActivities || 0;
        overallPointsCount.textContent = me?.totalPoints || 0;
        const myIndex = students.findIndex(s => s._id === userId);
        rankCount.textContent = myIndex >= 0 ? myIndex + 1 : "N/A";

    } catch (err) {
        console.error("Failed to load leaderboard", err);
    }
}

async function fetchCourseCount(url) {

    try {
        const res = await fetch(url);
        const students = await res.json();

        const courseCount = document.getElementById("enrolledCoursesCount");

        courseCount.textContent = students.count || "N/A";
    } catch (err) {
        console.error("Failed to load enrolled courses count", err);
    }
}