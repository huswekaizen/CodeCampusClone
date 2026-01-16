
document.addEventListener("DOMContentLoaded", async () => {
    const coursesContainer = document.getElementById("publicCoursesContainer");
    const studentId = localStorage.getItem("userId"); // optional but useful
    const template = document.getElementById("publicCourseCardTemplate");
    const card = template.content.cloneNode(true);
    document.getElementById("publicCoursesContainer").appendChild(card);

  
  if (!coursesContainer) {
    console.error("Missing #publicCoursesContainer in HTML");
    return;
  }

  try {
    // Fetch public courses (excluding enrolled ones if studentId exists)
    const res = await fetch(
      `http://localhost:5000/api/courses/public${studentId ? `?studentId=${studentId}` : ""}`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch public courses");
    }

    const courses = await res.json();

    if (!courses.length) {
      coursesContainer.innerHTML = "<p>No public courses available.</p>";
      return;
    }

    coursesContainer.innerHTML = "";

    courses.forEach(course => {
        const template = document.getElementById("publicCourseCardTemplate");
        const card = template.content.cloneNode(true);

        card.querySelector(".title").textContent = course.title;
        card.querySelector(".instructorName").textContent = `${course.instructor.firstName} ${course.instructor.lastName}`;
        card.querySelector(".category").textContent = course.category;
        card.querySelector(".description").textContent = course.subTitle || "";

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

        // View button (optional)
        const viewBtn = card.querySelector(".view-course");
        viewBtn.addEventListener("click", () => {
            // Navigate or open course detail
            window.location.href = `/courses/${course.courseCode}`;
        });

        coursesContainer.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    coursesContainer.innerHTML = "<p>Something broke. Blame reality.</p>";
  }
});
