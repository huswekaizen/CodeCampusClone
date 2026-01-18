document.addEventListener("DOMContentLoaded", async () => {
  const coursesContainer = document.getElementById("publicCoursesContainer");
  const studentId = localStorage.getItem("userId");
  const courseId = localStorage.getItem("selectedCourseId");

  if (!coursesContainer) {
    console.error("Missing #publicCoursesContainer in HTML");
    return;
  }

  try {
    const res = await fetch(
      `http://localhost:5000/api/courses/public${studentId ? `?studentId=${studentId}` : ""}`
    );

    if (!res.ok) throw new Error("Failed to fetch public courses");

    const courses = await res.json();

    if (!courses.length) {
      coursesContainer.innerHTML = "<p>No public courses available.</p>";
      return;
    }

    coursesContainer.innerHTML = ""; // Clear container before appending

    courses.forEach(course => {
      const template = document.getElementById("publicCourseCardTemplate");
      const card = template.content.cloneNode(true);

      // Fill card data
      card.querySelector(".title").textContent = course.title;
      card.querySelector(".instructorName").textContent =
        `${course.instructor.firstName} ${course.instructor.lastName}`;
      card.querySelector(".category").textContent = course.category;
      card.querySelector(".description").textContent = course.subTitle || "";

      const thumbnailImg = card.querySelector(".thumbnail");
      thumbnailImg.src = course.thumbnail
        ? `http://localhost:5000${course.thumbnail}`
        : "../src/assets/default-course-thumbnail.jpg";

      thumbnailImg.alt = `${course.title} Thumbnail`;

      // Enroll button
      const enrollBtn = card.querySelector(".enroll-course");
      enrollBtn.addEventListener("click", async () => {
        const studentId = localStorage.getItem("userId");
        if (!studentId) return alert("Login first.");

        try {
          const joinRes = await fetch("http://localhost:5000/api/courses/join", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ courseCode: course.courseCode, studentId })
          });

          const data = await joinRes.json();
          if (!joinRes.ok) throw new Error(data.message || "Join failed");

          alert("Joined course successfully");
          enrollBtn.closest(".course-card").remove();
        } catch (err) {
          alert(err.message);
        }
      });

      // View button
      const viewBtn = card.querySelector(".view-course");
      viewBtn.addEventListener("click", () => {
        localStorage.setItem("courseViewMode", "public");
        localStorage.setItem("selectedCourseId", course._id);

        window.location.href = "courses-view-student-overview.html";
      });


      coursesContainer.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    coursesContainer.innerHTML = "<p>Something broke. Blame reality.</p>";
  }
});
