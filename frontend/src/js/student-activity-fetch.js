const activityId = localStorage.getItem("selectedActivityId");
const activityTitle = document.getElementById("activity-title");
const activityDescription = document.getElementById("activity-description");
const activityDifficulty = document.getElementById("activity-difficulty");
const activityOutputExample = document.getElementById("activity-output-example");

document.addEventListener("DOMContentLoaded", async () => {
// get the activity id from the course-view-student-activities.js localStorage first

   try {
        const res = await fetch (`http://localhost:5000/api/activity/${localStorage.getItem("selectedActivityId")}`);
        const activities = await res.json();

        activityTitle.textContent = activities.title || "N/A";
        activityDifficulty.textContent = activities.difficulty || "N/A";

   } catch (err) {
     console.error(err);    
   }
});