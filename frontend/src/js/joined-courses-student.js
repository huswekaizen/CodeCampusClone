export async function loadJoinedCourses() {
  const userId = localStorage.getItem("userId");
  const container = document.getElementById("joinedCoursesContainer");
  const emptyList = document.getElementById("emptyJoinedCourses");
  const template = document.getElementById("joinedCourseCardTemplate");

  try {
    const res = await fetch(`http://localhost:5000/api/students/${userId}/enrolled-courses`);
    const data = await res.json();
    const courses = data.courses || [];

    container.innerHTML = "";
    emptyList.textContent = "";

    if (courses.length === 0) {
      emptyList.innerHTML = "<p>No joined courses found.</p>";
      return;
    }

    courses.forEach(course => {
      const clone = template.content.cloneNode(true);

      // existing classes in your template:
      // .title
      // .instructorName
      // .category
      // .description
      // .progress
      // .thumbnail

      clone.querySelector(".title").textContent = course.title || "Untitled Course";
      clone.querySelector(".instructorName").textContent =
        course.instructor
          ? `${course.instructor.firstName} ${course.instructor.lastName}`
          : "Unknown Instructor";

      clone.querySelector(".category").textContent = course.category || "No category";
      clone.querySelector(".description").textContent = course.description || "No description provided.";
      
      clone.querySelector(".progress").textContent =
        course.progress ? `Progress: ${course.progress}%` : "Progress: 0%";

      clone.querySelector(".thumbnail").src = course.thumbnail
        ? `http://localhost:5000${course.thumbnail}`
        : "../src/assets/default-course-thumbnail.jpg";

      // buttons
      const viewBtn = clone.querySelector(".view");
      viewBtn.addEventListener("click", () => {
        localStorage.setItem("courseViewMode", "private");
        localStorage.setItem("selectedCourseId", course._id);
        window.location.href = "./courses-view-student-overview.html";
      });

      container.appendChild(clone);
    });
  } catch (err) {
    console.error(err);
    alert("Failed to fetch joined courses.");
  }
}

