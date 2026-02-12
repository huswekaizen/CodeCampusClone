const courseId = localStorage.getItem("selectedCourseId");
const tbody = document.getElementById("leaderboard-body");
const emptyState = document.getElementById("leaderboard-empty");

async function loadLeaderboard() {
  const userId = localStorage.getItem("userId");
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

    const myIndex = data.findIndex(
      s => s.userId.toString() === userId
    );

    data.forEach((student, index) => {
      const tr = document.createElement("tr");

      if (index === myIndex) {
        tr.classList.add("current-user"); // highlight yourself
      }
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${student.name}</td>
        <td>${student.points}</td>
        <td>${student.completedCount} ${student.completedCount === 1 ? "activity" : "activities"}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    alert(err.message);
  }
}

window.addEventListener("DOMContentLoaded", loadLeaderboard);
