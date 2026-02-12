import { loadLeaderboard } from "./leaderboard-instructor.js";

document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("userId");

  loadPublishedCourses(userId);
  loadTotalStudents(userId);
  loadStudentsDebug(userId); // TEMP, for verification
  loadLeaderboard(`http://localhost:5000/api/instructors/${userId}/leaderboard`, { compact: true });
});

async function loadPublishedCourses(userId) {
  const publishedCourseList = document.getElementById("publishedCourseList");
  const publishedCourseCountProfile = document.getElementById("publishedCourseCountProfile");
  try {
    const res = await fetch(`http://localhost:5000/api/instructors/${userId}/published-courses`);
    const data = await res.json();
    console.log(data); // check what comes back
    publishedCourseList.textContent = data.count || 0;
    publishedCourseCountProfile.textContent = data.count || 0;
  } catch (err) {
    console.error("Failed to load published courses:", err);
    publishedCourseList.textContent = "0";
  }
}

async function loadTotalStudents(userId) {
  try {
    const res = await fetch(
      `http://localhost:5000/api/instructors/${userId}/totalStudents`
    );
    const data = await res.json();

    console.log("TOTAL STUDENTS COUNT:", data.totalStudents);
    document.getElementById("enrolledStudentsCount").textContent =
      data.totalStudents || 0;
  } catch (err) {
    console.error("Failed to load total students:", err);
  }
}
async function loadStudentsDebug(userId) {
  try {
    const res = await fetch(
      `http://localhost:5000/api/instructors/${userId}/totalStudentsNames`
    );
    const students = await res.json();

    console.log("UNIQUE STUDENTS LIST:");
    console.table("students names:", students);

    // sanity check
    console.log("Students counted:", students.length);
  } catch (err) {
    console.error("Failed to load students list:", err);
  }
}
