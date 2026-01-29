document.addEventListener("DOMContentLoaded", () => {

  loadLeaderboard(`http://localhost:5000/api/students/globalLeaderboard`);
  
});


async function loadLeaderboard(url) {
  const userId = localStorage.getItem("userId");

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

    const myIndex = students.findIndex(
      s => s._id === userId
    );

    students.forEach((s, index) => {
      const tr = document.createElement("tr");

      if (index === myIndex) {
        tr.classList.add("current-user"); // highlight yourself
      }

      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${s.firstName} ${s.lastName}</td>
        <td>${s.totalPoints}</td>
        <td>${s.completedActivities}</td>
        <td>${s.coursesJoined}</td>
      `;

      tbody.appendChild(tr);
    });

    console.log("Your rank:", myIndex + 1);

  } catch (err) {
    console.error("Failed to load leaderboard", err);
  }
}
