import { loadJoinedCourses } from "./joined-courses-student.js";
import { updateEnrolledCourseCount } from "./home.js";

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("joinCourseModal");
  const joinBtn = document.getElementById("primaryAction");
  const closeBtn = document.getElementById("closeModal");
  const submitBtn = document.getElementById("submitJoinCode");
  const joinInput = document.getElementById("joinCodeInput");

  // Page does not support join modal → leave silently
  if (!modal || !joinBtn || !closeBtn || !submitBtn || !joinInput) {
    return;
  }

  // Open modal
  joinBtn.addEventListener("click", () => {
    modal.style.display = "flex";
    joinInput.focus();
  });

  // Close modal
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Submit join code
  submitBtn.addEventListener("click", async () => {
    const code = joinInput.value.trim();
    if (!code) {
      alert("Please enter a course code.");
      return;
    }

    const userId = localStorage.getItem("userId");

    try {
      const res = await fetch("http://localhost:5000/api/courses/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseCode: code,
          studentId: userId
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert("Course joined successfully");

      // Only refresh if the page actually has joined courses
      loadJoinedCourses?.();
      updateEnrolledCourseCount?.();

    } catch (err) {
      console.error(err);
      alert("Error joining course.");
    }

    modal.style.display = "none";
    joinInput.value = "";
  });

  // Close on background click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });
});
