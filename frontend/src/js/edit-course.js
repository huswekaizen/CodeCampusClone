const titleInput = document.getElementById("courseTitle");
const categoryInput = document.getElementById("courseCategory");
const subtitleInput = document.getElementById("courseSubtitle");
const descriptionInput = document.getElementById("courseDescription");
const thumbnailInput = document.getElementById("courseThumbnail");
const thumbnailPreview = document.getElementById("thumbnailPreview");
const exampleInput = document.getElementById("courseExample");

const courseTitleSpan = document.getElementById("courseTitleSpan");

const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");

const courseId = localStorage.getItem("selectedCourseId");

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch(`http://localhost:5000/api/courses/${courseId}/details`);

    if (!res.ok) {
      throw new Error(`Failed to fetch course data (${res.status})`);
    }

    const course = await res.json();
    courseTitleSpan.textContent = course.title;

  }catch (err) {
    console.error("Error fetching course data:", err);
    return;
  }
});

// Thumbnail preview
thumbnailInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (file) {
    thumbnailPreview.src = URL.createObjectURL(file);
    thumbnailPreview.style.display = "block";
  }
});

// Cancel -> back to course view
cancelBtn.addEventListener("click", () => {
  window.location.href = "courses-view.html";
});

// Save -> pretend API call
saveBtn.addEventListener("click", async () => {

  const formData = new FormData();
  formData.append("title", titleInput.value);
  formData.append("subTitle", subtitleInput.value);
  formData.append("category", categoryInput.value);
  formData.append("description", descriptionInput.value);
  formData.append("example", exampleInput.value);

  // Only append if a new file is selected
  const fileInput = document.getElementById("courseThumbnail");
  if (fileInput.files[0]) {
    formData.append("thumbnail", fileInput.files[0]);
  }

  try {
    const res = await fetch(`http://localhost:5000/api/courses/${courseId}/edit`, {
      method: "PUT",
      body: formData,
    });

    const data = await res.json();
    console.log("Course updated:", data); 

    if (!res.ok) throw new Error(`Failed to update course (${res.status})`);
    
    alert("Course updated successfully!");

  } catch (err) {
    console.error("Error updating course:", err);
  }

});
