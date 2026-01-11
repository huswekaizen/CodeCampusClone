const courseId = localStorage.getItem("selectedCourseId");
const tbody = document.getElementById("leaderboard-body");
const emptyState = document.getElementById("leaderboard-empty");

async function loadLeaderboard() {
  try {
    const res = await fetch(
      `http://localhost:5000/api/courses/${courseId}/leaderboard`
    );

    if (!res.ok) throw new Error("Failed to fetch leaderboard");

    const data = await res.json();

    if (data.length === 0) {
      emptyState.classList.remove("hidden");
      return;
    }

    tbody.innerHTML = "";

    data.forEach((student, index) => {
      tbody.innerHTML += `
        <tr>
          <td>${index + 1}</td>
          <td>${student.name}</td>
          <td>${student.points}</td>
          <td>${student.completedCount} ${student.completedCount === 1 ? "activity" : "activities"}</td>
        </tr>
      `;
    });

  } catch (err) {
    alert(err.message);
  }
}

window.addEventListener("DOMContentLoaded", loadLeaderboard);
