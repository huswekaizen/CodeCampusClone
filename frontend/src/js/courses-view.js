const deleteBtn = document.getElementById("deleteBtn");
const submitDeleteBtn = document.getElementById("submitDeleteBtn");
const courseId = localStorage.getItem("selectedCourseId");
const closeModal = document.getElementById("closeModal");
const deleteModal = document.getElementById("deleteCourseModal");
const deleteCourseInput = document.getElementById("deleteCourseInput");

const courseTitleSpan = document.getElementById("courseTitleSpan");

let loadedCourse = null;

document.addEventListener("DOMContentLoaded", async () => {

  if (!courseId) {
    alert("No course selected.");
    window.location.href = "./courses-instructor.html";
    return;
  }

  try {
    const res = await fetch(`http://localhost:5000/api/courses/${courseId}/details`);
    if (!res.ok) throw new Error("Failed to fetch course details.");

    const course = await res.json();
    console.log("Fetched course with activities:", course);
    loadedCourse = course;

    // Display course details
    document.getElementById("course-title").textContent = course.title;
    document.getElementById("course-subTitle").textContent = course.subTitle || "N/A";
    document.getElementById("course-category").textContent = `Category: ${course.category}`;
    document.getElementById("course-description").textContent = course.description || "No description available.";
    document.getElementById("course-example").textContent = course.example || "N/A";

    courseTitleSpan.style.color = "red";
    courseTitleSpan.textContent = course.title || "Course Title Unavailable";

    const thumbnail = document.getElementById("course-thumbnail");
    if (course.thumbnail) {
      thumbnail.src = `http://localhost:5000${course.thumbnail}`;
    } else {
      thumbnail.src = "../src/assets/default-course-thumbnail.jpg";
    }
    thumbnail.style.display = "block";


    // Handle activities

    const activitiesList = document.getElementById("activities-list");
    activitiesList.innerHTML = "";
    course.activities.forEach((activity, index) => {
      const li = document.createElement("li");
      li.dataset.activityId = activity._id;
      li.dataset.index = index;
      li.innerHTML = `
        <!-- View Mode -->
        <div class="view-mode">
          <div class="activity-header">
            <strong class="view-title">Activity ${index + 1}: ${activity.title}</strong>
            <button class="delete-activity" data-index="${index}">✖</button>
          </div>
          <p class="view-desc">${activity.description}</p>
          <small class="view-type">${activity.type}</small>
        </div>

        <!-- Edit Mode -->
        <div class="edit-mode" style="display:none">
          <input type="text" class="edit-title" value="${activity.title}">
          <textarea class="edit-desc">${activity.description}</textarea>

          <select class="edit-type">
            <option value="quiz" ${activity.type === "quiz" ? "selected" : ""}>Quiz</option>
            <option value="assignment" ${activity.type === "assignment" ? "selected" : ""}>Assignment</option>
            <option value="exercise" ${activity.type === "exercise" ? "selected" : ""}>Exercise</option>
          </select>

          <button class="save-btn save-activity">Save</button>
          <button class="save-btn cancel-edit">Cancel</button>
        </div>
      `;

      activitiesList.appendChild(li);
    });


    // Buttons
    const backBtn = document.getElementById("backBtn");
    const editBtn = document.getElementById("editBtn");

    if (backBtn) {
      backBtn.addEventListener("click", () => {
        window.location.href = "./courses-instructor.html";
      });
    }

    if (editBtn) {
      editBtn.addEventListener("click", () => {
        window.location.href = "./edit-course.html";
      });
    }
  } catch (err) {
    console.error("Error loading course:", err);
    alert("Failed to load course details. Check console for errors.");
  }
});

document.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (!li) return;

  // Edit logic
  if (e.target.classList.contains("view-title") ||
      e.target.classList.contains("view-desc") ||
      e.target.classList.contains("view-type")) {
    li.querySelector(".view-mode").style.display = "none";
    li.querySelector(".edit-mode").style.display = "block";
  }

  // Save logic
  if (e.target.classList.contains("save-activity")) {
    saveActivity(li);
  }

  // Cancel logic
  if (e.target.classList.contains("cancel-edit")) {
    li.querySelector(".edit-mode").style.display = "none";
    li.querySelector(".view-mode").style.display = "block";
  }

  // DELETE activity logic
  if (e.target.classList.contains("delete-activity")) {
    const index = e.target.dataset.index;
    const activity = loadedCourse.activities[index];

    const confirmed = confirm(`Are you sure you want to delete activity "${activity.title}"?`);
    if (!confirmed) return;

    deleteActivity(activity._id);
  }
});


async function saveActivity(li) {
  const id = li.dataset.activityId;

  const newTitle = li.querySelector(".edit-title").value.trim();
  const newDesc = li.querySelector(".edit-desc").value.trim();
  const newType = li.querySelector(".edit-type").value;

  const res = await fetch(`http://localhost:5000/api/activities/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: newTitle,
      description: newDesc,
      type: newType
    })
  });

  if (!res.ok) {
    alert("Failed to update activity.");
    return;
  }

  const index = li.dataset.index;
  li.querySelector(".view-title").textContent = `Activity ${parseInt(index)+1}: ${newTitle}`;

  li.querySelector(".view-desc").textContent = newDesc;
  li.querySelector(".view-type").textContent = newType;

  li.querySelector(".edit-mode").style.display = "none";
  li.querySelector(".view-mode").style.display = "block";
}

async function loadCourseData() {
  if (!loadedCourse) return;

  try {
    const res = await fetch(`http://localhost:5000/api/courses/${loadedCourse._id}/details`);
    if (!res.ok) throw new Error("Failed to fetch course details.");
    const course = await res.json();
    loadedCourse = course;

    const activitiesList = document.getElementById("activities-list");
    activitiesList.innerHTML = "";

    course.activities.forEach((activity, index) => {
      const li = document.createElement("li");
      li.dataset.activityId = activity._id;
      li.dataset.index = index;
      li.innerHTML = `
        <div class="view-mode">
          <div class="activity-header">
            <strong class="view-title">Activity ${index + 1}: ${activity.title}</strong>
            <button class="delete-activity" data-index="${index}">✖</button>
          </div>
          <p class="view-desc">${activity.description}</p>
          <small class="view-type">${activity.type}</small>
        </div>
        <div class="edit-mode" style="display:none">
          <input type="text" class="edit-title" value="${activity.title}">
          <textarea class="edit-desc">${activity.description}</textarea>
          <select class="edit-type">
            <option value="quiz" ${activity.type === "quiz" ? "selected" : ""}>Quiz</option>
            <option value="assignment" ${activity.type === "assignment" ? "selected" : ""}>Assignment</option>
            <option value="exercise" ${activity.type === "exercise" ? "selected" : ""}>Exercise</option>
          </select>
          <button class="save-btn save-activity">Save</button>
          <button class="save-btn cancel-edit">Cancel</button>
        </div>
      `;
      activitiesList.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }
}


async function deleteActivity(activityId) {
  try {
    const res = await fetch(`http://localhost:5000/api/activities/${activityId}`, {
      method: "DELETE"
    });


    if (!res.ok) throw new Error("Failed to delete");

    // re-fetch course or manually remove from DOM
    loadCourseData();
  } catch (err) {
    console.error(err);
  }
}


document.querySelectorAll(".delete-activity").forEach(btn => {
  btn.addEventListener("click", (e) => {
    const index = e.target.dataset.index;
    const activity = loadedCourse.activities[index];

    const confirmed = confirm(`Are you sure you want to delete activity "${activity.title}"?`);
    if (!confirmed) return; // User clicked "Cancel"

    deleteActivity(activity._id);
  });
});

// Add Activity Template UI

const addActivityBtn = document.getElementById("addActivityBtn");
const activitiesList = document.getElementById("activities-list");
const activityFormTemplate = document.getElementById("activityFormTemplate");

addActivityBtn.addEventListener("click", () => {
  const clone = activityFormTemplate.content.cloneNode(true);
  const li = clone.querySelector(".activity-form");

  // remove button inside the form
  li.querySelector(".remove-activity").addEventListener("click", () => {
    li.remove();
  });

  activitiesList.appendChild(li);
});




// Show modal
deleteBtn.addEventListener("click", () => {
  deleteModal.style.display = "flex"; 
});

// Close modal
closeModal.addEventListener("click", () => {
  deleteModal.style.display = "none";
});


submitDeleteBtn.addEventListener("click", async () => {

  if (deleteCourseInput.value !== loadedCourse.title) {
    alert("Course title does not match. Please type the exact course title to confirm deletion.");
    return;
  }

  try {
    const res = await fetch(`http://localhost:5000/api/courses/${courseId}/delete`, {
      method: "DELETE"
    });

     if (!res.ok) {
      throw new Error(`Failed to fetch course data (${res.status})`);
    }

    alert("Course deleted successfully.");
    localStorage.removeItem("selectedCourseId");
    window.location.href = "./courses-instructor.html";
    return;
  
  } catch (err) {
    console.error("Error deleting course:", err);
    alert("Failed to delete course. Check console for errors.");
  }
});