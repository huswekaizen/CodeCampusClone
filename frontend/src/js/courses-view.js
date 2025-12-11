const deleteBtn = document.getElementById("deleteBtn");
const submitDeleteBtn = document.getElementById("submitDeleteBtn");
const closeModal = document.getElementById("closeModal");
const deleteModal = document.getElementById("deleteCourseModal");
const deleteCourseInput = document.getElementById("deleteCourseInput");
const addActivityBtn = document.getElementById("addActivityBtn");
const activitiesList = document.getElementById("activities-list");
const activityFormTemplate = document.getElementById("activityFormTemplate");
const courseTitleSpan = document.getElementById("courseTitleSpan");

const courseId = localStorage.getItem("selectedCourseId");
let loadedCourse = null;

// Load course on page load
document.addEventListener("DOMContentLoaded", async () => {
  if (!courseId) {
    alert("No course selected.");
    window.location.href = "./courses-instructor.html";
    return;
  }

  await loadCourseData();
});

// Delegate clicks for edit/save/cancel/delete
document.addEventListener("click", async (e) => {
  const li = e.target.closest("li");
  if (!li) return;

  // Open edit mode
  if (["view-title","view-desc","view-type","view-output-example"].some(cls => e.target.classList.contains(cls))) {
    li.querySelector(".view-mode").style.display = "none";
    li.querySelector(".edit-mode").style.display = "block";
    return;
  }

  // Save activity
  if (e.target.classList.contains("save-activity")) {
    saveActivity(li);
    return;
  }

  // Cancel edit
  if (e.target.classList.contains("cancel-edit")) {
    li.querySelector(".edit-mode").style.display = "none";
    li.querySelector(".view-mode").style.display = "block";
    return;
  }

  // Delete activity
  if (e.target.classList.contains("delete-activity")) {
    const index = e.target.dataset.index;
    const activity = loadedCourse.activities[index];

    if (!confirm(`Are you sure you want to delete activity "${activity.title}"?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/activities/${activity._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete activity");

      li.remove();
      loadedCourse.activities.splice(index, 1);
      alert(`Activity "${activity.title}" deleted successfully`);
    } catch (err) {
      console.error(err);
      alert("Failed to delete activity. Check console for errors.");
    }
  }
});

// Add new activity template
addActivityBtn.addEventListener("click", () => {
  const clone = activityFormTemplate.content.cloneNode(true);
  const li = clone.querySelector(".activity-form");

  li.querySelector(".remove-activity").addEventListener("click", () => li.remove());

  activitiesList.appendChild(li);
});

// Show and close course delete modal
deleteBtn.addEventListener("click", () => deleteModal.style.display = "flex");
closeModal.addEventListener("click", () => deleteModal.style.display = "none");

// Submit course deletion
submitDeleteBtn.addEventListener("click", async () => {
  if (deleteCourseInput.value !== loadedCourse.title) {
    alert("Course title does not match. Type the exact course title to confirm deletion.");
    return;
  }

  try {
    const res = await fetch(`http://localhost:5000/api/courses/${courseId}/delete`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete course (${res.status})`);

    alert("Course deleted successfully.");
    localStorage.removeItem("selectedCourseId");
    window.location.href = "./courses-instructor.html";
  } catch (err) {
    console.error(err);
    alert("Failed to delete course. Check console for errors.");
  }
});

// Helper functions
async function loadCourseData() {
  try {
    const res = await fetch(`http://localhost:5000/api/courses/${courseId}/details`);
    if (!res.ok) throw new Error("Failed to fetch course details");
    const course = await res.json();
    loadedCourse = course;

    // Display course info
    document.getElementById("course-title").textContent = course.title;
    document.getElementById("course-subTitle").textContent = course.subTitle || "N/A";
    document.getElementById("course-category").textContent = `Category: ${course.category}`;
    document.getElementById("course-description").textContent = course.description || "No description available.";
    document.getElementById("course-example").textContent = course.example || "N/A";
    document.getElementById("course-code").textContent = course.courseCode || "N/A";

    courseTitleSpan.style.color = "red";
    courseTitleSpan.textContent = course.title || "Course Title Unavailable";

    const thumbnail = document.getElementById("course-thumbnail");
    thumbnail.src = course.thumbnail ? `http://localhost:5000${course.thumbnail}` : "../src/assets/default-course-thumbnail.jpg";
    thumbnail.style.display = "block";

    // Display activities
    renderActivities(course.activities);
  } catch (err) {
    console.error(err);
    alert("Failed to load course details.");
  }
}

function renderActivities(activities) {
  activitiesList.innerHTML = "";

  activities.forEach((activity, index) => {
    const li = document.createElement("li");
    li.dataset.activityId = activity._id;
    li.dataset.index = index;

    li.innerHTML = `
      <div class="view-mode">
        <div class="activity-header">
          <strong class="view-title">Activity ${index+1}: ${activity.title}</strong>
          <button class="delete-activity" data-index="${index}">✖</button>
        </div>
        <p class="view-desc">${activity.description}</p>
        <h5 class="view-output-example">${activity.outputExample || ""}</h5>
        <small class="view-difficulty">${activity.difficulty}</small>
      </div>
      <div class="edit-mode" style="display:none">
        <input type="text" class="edit-title" value="${activity.title}">
        <textarea class="edit-desc">${activity.description}</textarea>
        <textarea class="edit-output-example">${activity.outputExample || ""}</textarea>
        <select class="edit-difficulty">
          <option value="Easy" ${activity.difficulty==="Easy"?"selected":""}>Easy</option>
          <option value="Medium" ${activity.difficulty==="Medium"?"selected":""}>Medium</option>
          <option value="Hard" ${activity.difficulty==="Hard"?"selected":""}>Hard</option>
        </select>
        <button class="save-btn save-activity">Save</button>
        <button class="save-btn cancel-edit">Cancel</button>
      </div>
    `;

    activitiesList.appendChild(li);
  });
}

async function saveActivity(li) {
  const id = li.dataset.activityId; // already there
  const newTitle = li.querySelector(".edit-title").value.trim();
  const newDesc = li.querySelector(".edit-desc").value.trim();
  const newDifficulty = li.querySelector(".edit-difficulty").value;
  const newOutputExample = li.querySelector(".edit-output-example").value;

  try {
    const res = await fetch(`http://localhost:5000/api/activities/${id}`, {
      method: "PUT",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({title:newTitle, description:newDesc, difficulty:newDifficulty, outputExample:newOutputExample})
    });
    if (!res.ok) throw new Error("Failed to update activity");

    // Update local state by _id instead of index
    const activityIndex = loadedCourse.activities.findIndex(a => a._id === id);
    if (activityIndex > -1) {
      loadedCourse.activities[activityIndex] = { ...loadedCourse.activities[activityIndex], title:newTitle, description:newDesc, difficulty:newDifficulty, outputExample:newOutputExample };
    }

    // Update DOM
    li.querySelector(".view-title").textContent = `Activity ${activityIndex+1}: ${newTitle}`;
    li.querySelector(".view-desc").textContent = newDesc;
    li.querySelector(".view-difficulty").textContent = newDifficulty;
    li.querySelector(".view-output-example").textContent = newOutputExample;
    li.querySelector(".edit-mode").style.display = "none";
    li.querySelector(".view-mode").style.display = "block";

  } catch (err) {
    console.error(err);
    alert("Failed to update activity. Check console for errors.");
  }
}


document.addEventListener("click", async (e) => {
  if (!e.target.classList.contains("save-activity")) return;

  const li = e.target.closest(".activity-form");
  if (!li) return;

  const title = li.querySelector(".activity-title-input").value;
  const description = li.querySelector(".activity-desc-input").value;
  const outputExample = li.querySelector(".edit-output-example").value;
  const difficulty = li.querySelector(".activity-difficulty-input").value;

  try {
    const res = await fetch("http://localhost:5000/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        outputExample,
        difficulty,
        courseId
      })
    });

    if (!res.ok) throw new Error("Failed to save");

    alert("Saved successfully");
    li.remove(); // remove the template after save

    await loadCourseData(); // refresh and show newly added activity

  } catch (err) {
    console.error(err);
    alert("Failed to save activities. Check console for errors.");
  }
});

document.getElementById("editBtn")?.addEventListener("click", () => {
  window.location.href = "./edit-course.html";
});

document.getElementById("backBtn")?.addEventListener("click", () => {
  window.location.href = "./courses-instructor.html";
});
