document.addEventListener("DOMContentLoaded", () => {

  loadLeaderboard(`http://localhost:5000/api/students/globalLeaderboard`);
  
});


export async function loadLeaderboard(url, options = {}) {
  const { compact = false } = options;
  const userId = localStorage.getItem("userId");

  try {
    const res = await fetch(url);
    const students = await res.json();

    const tbody = document.getElementById("leaderboard-body");
    if (!tbody) return;

    tbody.innerHTML = "";

    const myIndex = students.findIndex(s => s._id === userId);

    students.forEach((s, index) => {
      const tr = document.createElement("tr");

      if (index === myIndex) {
        tr.classList.add("current-user");
      }

      // HOME PAGE (compact)
      if (compact) {
        tr.innerHTML = `
          <td>${index + 1}</td>
          <td>${s.firstName} ${s.lastName}</td>
        `;
      } 
      // FULL LEADERBOARD PAGE
      else {
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
