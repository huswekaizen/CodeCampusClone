document.addEventListener("DOMContentLoaded", async () => {
  const courseId = localStorage.getItem("selectedCourseId");

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

    // Display course details
    document.getElementById("course-title").textContent = course.title;
    document.getElementById("course-subTitle").textContent = course.subTitle || "N/A";
    document.getElementById("course-category").textContent = `Category: ${course.category}`;
    document.getElementById("course-description").textContent = course.description || "No description available.";
    document.getElementById("course-example").textContent = course.example || "N/A";

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

    if (course.activities && course.activities.length > 0) {
      course.activities.forEach((activity, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>Activity ${index + 1}: ${activity.title}</strong>
          <p>${activity.description}</p>
          <small>Type: ${activity.type}</small>
        `;
        activitiesList.appendChild(li);
      });
    } else {
      activitiesList.innerHTML = `<p style="color: var(--text-muted)">No activities found for this course.</p>`;
    }

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
