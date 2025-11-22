
document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem('userId');

  // ===== Step Navigation =====
  function goToStep(stepNum) {
    document.querySelectorAll(".step-panel").forEach(p => p.classList.add("hidden"));
    document.querySelector(`#step-${stepNum}-panel`)?.classList.remove("hidden");

    document.querySelectorAll(".step-item").forEach(s => s.setAttribute("aria-current", "false"));
    document.querySelector(`.step-item[data-step="${stepNum}"]`)?.setAttribute("aria-current", "step");
  }

  // Step buttons
  document.querySelectorAll("[data-go-step]").forEach(btn => {
    btn.addEventListener("click", () => goToStep(btn.getAttribute("data-go-step")));
  });

  const nextToActivities = document.getElementById("nextToActivities");
  const nextToAssessment = document.getElementById("nextToAssessment");
  if (nextToActivities) {
      nextToActivities.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        
        const currentStep = document.querySelector(".step-panel:not(.hidden)");
        const inputs = currentStep.querySelectorAll("input, textarea, select");
        const areAllFilled = Array.from(inputs).every(input => input.value.trim() !== "");


        if (!areAllFilled) {
          alert("Fill in all fields before creating the course, genius.");
          return; // stop the rest of your function
        }
        if (areAllFilled) {
          goToStep(2);
        } 
    });
  }
  if (nextToAssessment) {
    nextToAssessment.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
  
      const currentStep = document.querySelector(".step-panel:not(.hidden)");
      const inputs = currentStep.querySelectorAll("input, textarea, select");
      const areAllFilled = Array.from(inputs).every(input => input.value.trim() !== "");
  
      if (!areAllFilled) {
        alert("Fill in all fields before creating the course, genius.");
        return; // stop the rest of your function
      }
      if (areAllFilled) {
        goToStep(3);
      }
    });
  }

  // ===== Thumbnail Preview =====
const fileInput = document.getElementById("thumbnail");
const imgPreview = document.getElementById("thumbnailPreviewImg");
const clearBtn = document.getElementById("thumbnailClear");

if (fileInput && imgPreview) {
  fileInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (file) {
      imgPreview.src = URL.createObjectURL(file);
      imgPreview.style.display = "block";
    }
  });
}

if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    fileInput.value = "";
    imgPreview.src = "";
    imgPreview.style.display = "none";
  });
}


  // ===== Thumbnail Clear =====
  const thumbnail = document.getElementById("thumbnail");
  const thumbnailPreview = document.getElementById("previewThumbnailValue");
  const thumbnailClear = document.getElementById("thumbnailClear");
  if (thumbnailClear && thumbnail && thumbnailPreview) {
    thumbnailClear.addEventListener("click", () => {
      thumbnail.value = "";
      thumbnailPreview.innerHTML = "";
    });
  }

  // ===== Activities Management =====
  const addActivityBtn = document.getElementById("addActivityBtn");
  const activitiesList = document.getElementById("activitiesList");
  const activityTemplate = document.getElementById("activityTemplate");
  const activitiesData = [];

  function registerActivity(activityElement) {
    const index = activitiesData.length;
    const titleField = activityElement.querySelector(".activity-title");
    const typeSelect = activityElement.querySelector("select[name='activityType']");
    const descField = activityElement.querySelector(".activity-description");
    const outputField = activityElement.querySelector(".activity-output");
    const removeBtn = activityElement.querySelector(".btn-remove");

    // Push initial empty entry
    activitiesData.push({
      title: titleField.value || "",
      type: typeSelect.value || "",
      description: descField.value || "",
      output: outputField.value || ""
    });

    // Live updates
    titleField.addEventListener("input", () => (activitiesData[index].title = titleField.value));
    typeSelect.addEventListener("change", () => (activitiesData[index].type = typeSelect.value));
    descField.addEventListener("input", () => (activitiesData[index].description = descField.value));
    outputField.addEventListener("input", () => (activitiesData[index].output = outputField.value));

    // Optional remove
    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        activityElement.remove();
        activitiesData.splice(index, 1);
      });
    }
  }

  // Register default activity
  const defaultActivity = document.querySelector("#activitiesList .activity");
  if (defaultActivity) registerActivity(defaultActivity);

  // Add new activities
  if (addActivityBtn && activitiesList && activityTemplate) {
    addActivityBtn.addEventListener("click", () => {
      const clone = activityTemplate.content.cloneNode(true);
      const newActivity = clone.querySelector(".activity");
      if (!newActivity) return;

      registerActivity(newActivity);
      activitiesList.appendChild(newActivity);
    });
  }

  // ===== Preview Step =====
  const previewBtn = document.getElementById("nextToAssessment");
  if (previewBtn) {
    previewBtn.addEventListener("click", () => {
      document.getElementById("previewTitleValue").textContent = document.getElementById("title").value;
      document.getElementById("previewSubtitleValue").textContent = document.getElementById("subTitle").value;
      document.getElementById("previewCategoryValue").textContent = document.getElementById("category").value;
      document.getElementById("previewDescriptionValue").textContent = document.getElementById("description").value;
      document.getElementById("previewExampleValue").textContent = document.getElementById("example").value;

      const thumbFile = thumbnail.files[0];
      thumbnailPreview.innerHTML = thumbFile
        ? `<img src="${URL.createObjectURL(thumbFile)}" alt="Thumbnail Preview">`
        : `<em>No thumbnail selected</em>`;

      // Update all activities from DOM (to make sure everything's current)
      const allActivities = document.querySelectorAll("#activitiesList .activity");
      const previewList = document.getElementById("previewActivitiesList");
      previewList.innerHTML = "";

      allActivities.forEach((act, i) => {
        const title = act.querySelector(".activity-title")?.value || "(Untitled)";
        const type = act.querySelector("select[name='activityType']")?.value || "(No type)";
        const desc = act.querySelector(".activity-description")?.value || "(No description)";
        const output = act.querySelector(".activity-output")?.value || "";

        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${i + 1}. ${title}</strong> <em>(${type})</em>
          <p>${desc}</p>
          <small>${output}</small>
        `;
        previewList.appendChild(li);
      });
    });
  }

  document.getElementById("createCourseBtn")?.addEventListener("click", async () => {
    try {
      // Build form data for multipart/form-data (so file uploads work)
      const formData = new FormData();
      formData.append("title", document.getElementById("title").value);
      formData.append("subTitle", document.getElementById("subTitle").value);
      formData.append("category", document.getElementById("category").value);
      formData.append("description", document.getElementById("description").value);
      formData.append("example", document.getElementById("example").value);
      formData.append("instructorId", userId);

      // append thumbnail file if present
      const fileInput = document.getElementById("thumbnail");
      if (fileInput && fileInput.files && fileInput.files[0]) {
        formData.append("thumbnail", fileInput.files[0]);
      }

      // Create course (server should be set to accept upload.single('thumbnail'))
      const courseRes = await fetch("http://localhost:5000/api/courses", {
        method: "POST",
        body: formData // DO NOT set Content-Type header — browser sets boundary automatically
      });

      if (!courseRes.ok) {
        const text = await courseRes.text().catch(() => null);
        throw new Error(`Failed to create course (${courseRes.status}) ${text || ""}`);
      }
      const course = await courseRes.json();
      console.log("Course created:", course);

      // Now create activities (same as before)
      const allActivities = document.querySelectorAll("#activitiesList .activity");
      for (const act of allActivities) {
        const activityData = {
          title: act.querySelector(".activity-title")?.value || "Untitled",
          type: act.querySelector("select[name='activityType']")?.value || "exercise",
          description: act.querySelector(".activity-description")?.value || "",
          outputExample: act.querySelector(".activity-output")?.value || "",
          courseId: course._id
        };

        const activityRes = await fetch("http://localhost:5000/api/activities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(activityData)
        });

        if (!activityRes.ok) {
          const text = await activityRes.text().catch(() => null);
          throw new Error(`Failed to create an activity (${activityRes.status}) ${text || ""}`);
        }
        const savedActivity = await activityRes.json();
        console.log("Activity created:", savedActivity);
      }

      alert("Course and all activities created successfully!");
      //window.location.href = "courses-view.html";

    } catch (err) {
      console.error("Error creating course or activities:", err);
      alert(`Something went wrong while creating the course. Check console. Error: ${err.message || err}`);
    }
  });
});