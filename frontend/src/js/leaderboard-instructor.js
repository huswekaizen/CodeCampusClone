document.addEventListener("DOMContentLoaded", () => {
  const instructorId = localStorage.getItem("userId");
  if (!instructorId) return;

  loadLeaderboard(`http://localhost:5000/api/instructors/${instructorId}/leaderboard`);
});


export async function loadLeaderboard(url, options = {}) {
  const { compact = false } = options;

  try {
    const res = await fetch(url);
    const students = await res.json();

    const tbody = document.getElementById("leaderboard-body");
    const emptyState = document.getElementById("leaderboard-empty");

    tbody.innerHTML = "";

    if (!students.length) {
      emptyState.classList.remove("hidden");
      return;
    }

    students.forEach((s, index) => {
      const tr = document.createElement("tr");
      if(compact) {
        tr.innerHTML = `
          <td>${index + 1}</td>
          <td>${s.firstName} ${s.lastName}</td>
        `;
      } else {
        tr.innerHTML = `
          <td>${index + 1}</td>
          <td>${s.firstName} ${s.lastName}</td>
          <td>${s.totalPoints}</td>
          <td>${s.completedActivities}</td>
          <td>${s.coursesJoined}</td>
        `;
      }
      
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Failed to load leaderboard", err);
  }
}
