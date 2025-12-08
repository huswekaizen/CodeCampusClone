const courseTitle = document.getElementById("course-title");
const courseSubTitle = document.getElementById("course-subTitle");
const courseCategory = document.getElementById("course-category");
const courseDescription = document.getElementById("course-description");
const courseInstructor = document.getElementById("course-instructor");

let courseId = localStorage.getItem("selectedCourseId");
let loadedCourse = null;

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

document.addEventListener("DOMContentLoaded", async () => {
  if (!courseId) {
    alert("No course selected.");
    window.location.href = "./joined-courses-student.html";
    return;
  }

  await loadCourseData();
});



// Navigation active state
