document.addEventListener("DOMContentLoaded", async () => {
  const coursesContainer = document.getElementById("publicCoursesContainer");
  const studentId = localStorage.getItem("userId");

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
      console.log("courseCode: ", course.courseCode)
      
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
        enrollCourse(studentId, course.courseCode);
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

async function enrollCourse(studentId, courseCode) {
  try {
    const res = await fetch(
      `http://localhost:5000/api/courses/join`, // ✅ correct route
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          studentId, 
          courseCode: courseCode // important, backend checks courseCode
        })
      }
    );


    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to enroll");
      return;
    }

    alert("Enrolled successfully.");
    localStorage.setItem("courseViewMode", "private");
    window.location.reload();
  } catch (err) {
    console.error(err);
    alert("Error enrolling.");
  }
}