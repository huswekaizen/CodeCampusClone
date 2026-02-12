const userId = localStorage.getItem("userId");
const courseId = localStorage.getItem("selectedCourseId");

async function getCompletedActivities() {
  const res = await fetch(
    `http://localhost:5000/api/users/${userId}/progress/${courseId}`
  );

  if (!res.ok) throw new Error("Failed to fetch progress");

  const data = await res.json();
  return data.completedActivities || [];
}

function renderActivity(activity, completedActivities) {
  const isCompleted = completedActivities.includes(activity._id);

  return `
    <li class="activity-card ${isCompleted ? "completed" : ""}">
      <div class="activity-difficulty">${activity.difficulty}</div>

      <div class="activity-content">
        <div class="activity-title">${activity.title}</div>
      </div>

      <div class="activity-actions">
        <button 
          class="start-btn"
          data-id="${activity._id}"
        >
          ${isCompleted ? "Completed" : "Start Activity"}
        </button>
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
    const [activitiesRes, completedActivities] = await Promise.all([
      fetch(`http://localhost:5000/api/activities/course/${courseId}`),
      getCompletedActivities()
    ]);

    if (!activitiesRes.ok) throw new Error("Failed to fetch activities");

    const activities = await activitiesRes.json();
    const activitiesList = document.getElementById("activitiesList");

    activitiesList.innerHTML = "";

    activities.forEach(activity => {
      activitiesList.innerHTML += renderActivity(activity, completedActivities);
    });

  } catch (err) {
    console.error(err);
    alert("Failed to load activities.");
  }
}

// Only one event listener needed
window.addEventListener("DOMContentLoaded", loadActivities);

document.addEventListener("click", e => {
  if (e.target.classList.contains("start-btn")) {
    const activityId = e.target.dataset.id;

    localStorage.setItem("selectedActivityId", activityId);

    window.location.href = "student-activity.html";
  }
});

