const courseTitle = document.getElementById("course-title");
const courseSubTitle = document.getElementById("course-subTitle");
const courseCategory = document.getElementById("course-category");
const courseDescription = document.getElementById("course-description");
const courseInstructor = document.getElementById("course-instructor");

let courseId = localStorage.getItem("selectedCourseId");
let loadedCourse = null;

const mode = localStorage.getItem("courseViewMode") === "private"
  ? "private"
  : "public";

document.addEventListener("DOMContentLoaded", async () => {
  if (!courseId) {
    alert("No course selected.");
    window.location.href = "./joined-courses-student.html";
    return;
  }

  const actionBtn = document.getElementById("leave-btn");

  if (mode === "public") {
    // turn Leave into Enroll
    actionBtn.textContent = "Enroll";
    actionBtn.classList.remove("leave");
    actionBtn.classList.add("primary");

    actionBtn.onclick = async () => {
      try {
        const studentId = localStorage.getItem("userId");

        const res = await fetch(
          `http://localhost:5000/api/courses/${courseId}/enroll`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studentId })
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
    };

    // also kill tabs that make no sense
    document.querySelector('[data-page="activities"]')?.remove();
    document.querySelector('[data-page="leaderboard"]')?.remove();
  }

  if (mode === "private") {
    // keep Leave behavior
    actionBtn.addEventListener("click", leaveCourse);
  }

  await loadCourseData();
});


async function loadCourseData() {
  try {
    const res = await fetch(`http://localhost:5000/api/courses/${courseId}/details`);
    if (!res.ok) throw new Error("Failed to fetch course details");
    
    const course = await res.json();
    loadedCourse = course;

    courseTitle.textContent = course.title || "N/A";
    courseSubTitle.textContent = course.subTitle || "N/A";
    courseCategory.textContent = course.category || "N/A";
    courseDescription.textContent = course.description || "No description available.";
    courseInstructor.textContent = course.instructor
      ? `${course.instructor.firstName} ${course.instructor.lastName}`
      : "Instructor N/A";


    // Remove or guard this
    // if (typeof renderActivities === "function") {
    //   renderActivities(course.activities || []);
    // }

  } catch (err) {
    console.error(err);
    alert("Failed to load course details.");
  }
}

async function leaveCourse() {
  const confirmLeave = confirm(
    "Are you sure you want to leave this course?\nYou will lose access to its content."
  );

  if (!confirmLeave) return;

  try {
    const studentId = localStorage.getItem("userId");

    const res = await fetch(
      `http://localhost:5000/api/courses/${courseId}/leave-course`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId })
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to leave course");
      return;
    }

    alert("Successfully left the course.");
    window.location.href = "./joined-courses-student.html";
  } catch (err) {
    console.error(err);
    alert("Error leaving course.");
  }
}


document.addEventListener("DOMContentLoaded", async () => {
  if (!courseId) {
    alert("No course selected.");
    window.location.href = "./joined-courses-student.html";
    return;
  }

  await loadCourseData();
});



// Navigation active state
