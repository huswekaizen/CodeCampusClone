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

  // ✅ Open edit mode ONLY when Edit button is clicked
  if (e.target.classList.contains("edit-activity")) {
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
    const activityId = li.dataset.activityId;

    const activity = loadedCourse.activities.find(
      a => a._id === activityId
    );

    if (!activity) {
      alert("Activity not found.");
      return;
    }

    if (!confirm(`Are you sure you want to delete activity "${activity.title}"?`)) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/activities/${activityId}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("Failed to delete activity");

      li.remove();
      loadedCourse.activities = loadedCourse.activities.filter(
        a => a._id !== activityId
      );

      alert(`Activity "${activity.title}" deleted successfully`);
    } catch (err) {
      console.error(err);
      alert("Failed to delete activity.");
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
    li.classList.add("activity-item");
    li.dataset.activityId = activity._id;

    li.innerHTML = `
      <!-- VIEW MODE -->
      <div class="view-mode">
        <div class="activity-header">
          <strong class="view-title">
            Activity ${index + 1}: ${activity.title}
          </strong>
          <div class="activity-actions">
            <button class="edit-activity">Edit</button>
            <button class="delete-activity">✖</button>
          </div>
        </div>

        <p class="view-desc">${activity.description || ""}</p>

        <div class="view-function">
          Function: ${activity.functionName || "N/A"}
        </div>

        <pre class="view-tests">${JSON.stringify(
          activity.testCases || [],
          null,
          2
        )}</pre>

        <small class="view-difficulty">${activity.difficulty}</small>
      </div>

      <!-- EDIT MODE -->
      <div class="edit-mode" style="display:none">
        <input class="edit-title" value="${activity.title}" />

        <textarea class="edit-desc">${activity.description || ""}</textarea>

        <input class="edit-function" value="${activity.functionName || ""}" />

        <textarea class="edit-tests">${JSON.stringify(
          activity.testCases || [],
          null,
          2
        )}</textarea>

        <select class="edit-difficulty">
          <option value="Easy" ${activity.difficulty === "Easy" ? "selected" : ""}>Easy</option>
          <option value="Medium" ${activity.difficulty === "Medium" ? "selected" : ""}>Medium</option>
          <option value="Hard" ${activity.difficulty === "Hard" ? "selected" : ""}>Hard</option>
        </select>

        <div class="edit-actions">
          <button class="save-activity">Save</button>
          <button class="cancel-edit">Cancel</button>
        </div>
      </div>
    `;

    activitiesList.appendChild(li);
  });
}


async function saveActivity(li) {
  const id = li.dataset.activityId;

  const title = li.querySelector(".edit-title").value.trim();
  const description = li.querySelector(".edit-desc").value.trim();
  const functionName = li.querySelector(".edit-function").value.trim();
  const difficulty = li.querySelector(".edit-difficulty").value;
  const testsRaw = li.querySelector(".edit-tests").value;

  let testCases;
  try {
    testCases = JSON.parse(testsRaw);
  } catch {
    alert("Test cases must be valid JSON.");
    return;
  }

  try {
    const res = await fetch(`http://localhost:5000/api/activities/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        functionName,
        difficulty,
        testCases
      })
    });

    if (!res.ok) throw new Error("Failed to update activity");

    // Update local cache
    const idx = loadedCourse.activities.findIndex(a => a._id === id);
    if (idx > -1) {
      loadedCourse.activities[idx] = {
        ...loadedCourse.activities[idx],
        title,
        description,
        functionName,
        difficulty,
        testCases
      };
    }

    // Update view
    li.querySelector(".view-title").textContent = `Activity ${idx + 1}: ${title}`;
    li.querySelector(".view-desc").textContent = description;
    li.querySelector(".view-function").textContent = `Function: ${functionName}`;
    li.querySelector(".view-tests").textContent = JSON.stringify(testCases, null, 2);
    li.querySelector(".view-difficulty").textContent = difficulty;

    li.querySelector(".edit-mode").style.display = "none";
    li.querySelector(".view-mode").style.display = "block";

  } catch (err) {
    console.error(err);
    alert("Failed to update activity.");
  }
}

document.addEventListener("click", async (e) => {
  if (!e.target.classList.contains("create-activity")) return;

  const li = e.target.closest(".activity-form");
  if (!li) return;

  const title = li.querySelector(".activity-title-input").value.trim();
  const description = li.querySelector(".activity-desc-input").value.trim();
  const functionName = li.querySelector(".activity-function-input").value.trim();
  const testsRaw = li.querySelector(".activity-tests-input").value.trim();
  const difficulty = li.querySelector(".activity-difficulty-input").value;

  let testCases;
  try {
    testCases = JSON.parse(testsRaw || "[]");
  } catch {
    alert("Test cases must be valid JSON.");
    return;
  }


  if (!title || !description) {
    alert("Fill all required fields.");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        functionName,
        testCases,
        difficulty,
        courseId
      })
    });

    if (!res.ok) throw new Error("Failed to create activity");

    li.remove();
    await loadCourseData();

  } catch (err) {
    console.error(err);
    alert("Failed to create activity.");
  }
});


document.getElementById("editBtn")?.addEventListener("click", () => {
  window.location.href = "./edit-course.html";
});

document.getElementById("backBtn")?.addEventListener("click", () => {
  window.location.href = "./courses-instructor.html";
});
