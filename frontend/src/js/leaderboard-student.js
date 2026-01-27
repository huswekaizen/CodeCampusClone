document.addEventListener("DOMContentLoaded", () => {

  loadLeaderboard(`http://localhost:5000/api/students/globalLeaderboard`);
  
});


async function loadLeaderboard(url) {
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
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${s.firstName} ${s.lastName}</td>
        <td>${s.totalPoints}</td>
        <td>${s.completedActivities}</td>
        <td>${s.coursesJoined}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Failed to load leaderboard", err);
  }
}
