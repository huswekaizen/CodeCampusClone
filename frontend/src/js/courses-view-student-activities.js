const courseId = localStorage.getItem("selectedCourseId");

function renderActivity(activity) {
  return `
    <li class="activity-card">
      <div class="activity-type">${activity.type}</div>

      <div class="activity-content">
        <div class="activity-title">${activity.title}</div>
        ${ activity.output ? `<div class="activity-output">Output: ${activity.output}</div>` : "" }
      </div>

      <div class="activity-actions">
        <button class="start-btn" data-id="${activity._id}">Start Activity</button>
      </div>
    </li>
  `;
}



function clearRenderActivities(activities) {
  const activitiesList = document.getElementById("activitiesList");
  activitiesList.innerHTML = ""; // Clear existing activities

  activities.forEach((activity) => {
    activitiesList.innerHTML += renderActivity(activity);
  });
}

async function loadActivities() {
  try {
    if (!courseId) {
      console.error("No course ID found.");
      return;
    }

    const res = await fetch(`http://localhost:5000/api/activities/${courseId}`);
    if (!res.ok) throw new Error("Failed to fetch activities");

    const activities = await res.json();
    clearRenderActivities(activities);
  } catch (err) {
    console.error(err);
    alert("Failed to load activities.");
  }
}

// Only one event listener needed
window.addEventListener("DOMContentLoaded", loadActivities);

document.addEventListener("click", e => {
  if (e.target.classList.contains("start-btn")) {
    alert("not implemented yet");
  }
});
