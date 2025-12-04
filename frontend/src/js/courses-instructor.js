
window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("courseCreatedSuccess") === "true") {
    alert("Course created successfully!");
    localStorage.removeItem("courseCreatedSuccess");
  }
});


document.addEventListener("DOMContentLoaded", async () => {
  const userId = localStorage.getItem("userId");
  const container = document.getElementById("coursesContainer");
  const emptyList = document.getElementById("emptyCourse");
  const template = document.getElementById("cardTemplate");

  try {
    const res = await fetch(`http://localhost:5000/api/instructors/${userId}/published-courses`);
    const data = await res.json();
    const courses = data.courses || [];

    container.innerHTML = "";
    emptyList.textContent = "";

    if (courses.length === 0) {
      emptyList.innerHTML = "<p>No courses found. Go create one!</p>";
      return;
    }

    courses.forEach(course => {
      const clone = template.content.cloneNode(true);
      const courseCard = clone.querySelector(".course-card");
      const viewBtn = clone.querySelector(".view");

      // populate data
      clone.querySelector(".title").textContent = course.title;
      clone.querySelector(".subTitle").textContent = course.subTitle || "No subtitle";
      clone.querySelector(".category").textContent = `Category: ${course.category}`;
      clone.querySelector(".description").textContent = course.description || "No description provided.";
      clone.querySelector(".example").textContent = course.example || "No example provided";
      clone.querySelector(".thumbnail").src = course.thumbnail
        ? `http://localhost:5000${course.thumbnail}`
        : "../src/assets/default-course-thumbnail.jpg";

      // attach listener before appending
      viewBtn.addEventListener("click", () => {
        localStorage.setItem("selectedCourseId", course._id);
        window.location.href = "./courses-view.html";
      });

      container.appendChild(clone);
    });

  } catch (err) {
    console.error("Failed to fetch courses:", err);
    emptyList.innerHTML = "<p>Failed to load courses.</p>";
  }
});
