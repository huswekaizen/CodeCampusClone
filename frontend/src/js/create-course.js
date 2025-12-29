document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem('userId');

  // ===== Step Navigation =====
  function goToStep(stepNum) {
    document.querySelectorAll(".step-panel").forEach(p => p.classList.add("hidden"));
    document.querySelector(`#step-${stepNum}-panel`)?.classList.remove("hidden");

    document.querySelectorAll(".step-item").forEach(s => s.setAttribute("aria-current", "false"));
    document.querySelector(`.step-item[data-step="${stepNum}"]`)?.setAttribute("aria-current", "step");
  }

  document.querySelectorAll("[data-go-step]").forEach(btn => {
    btn.addEventListener("click", () => goToStep(btn.getAttribute("data-go-step")));
  });

  // ===== Step Validation =====
  function validateStepAndGo(nextStep) {
    const currentStep = document.querySelector(".step-panel:not(.hidden)");
    const inputs = currentStep.querySelectorAll("input, textarea, select");
    const areAllFilled = Array.from(inputs).every(input => input.value.trim() !== "");

    if (!areAllFilled) {
      alert("Fill in all fields before creating the course, genius.");
      return;
    }
    goToStep(nextStep);
  }

  document.getElementById("nextToActivities")?.addEventListener("click", () => validateStepAndGo(2));
  document.getElementById("nextToAssessment")?.addEventListener("click", () => validateStepAndGo(3));

  // ===== Thumbnail Preview =====
  const fileInput = document.getElementById("thumbnail");
  const imgPreview = document.getElementById("thumbnailPreviewImg");
  const thumbnailPreview = document.getElementById("previewThumbnailValue");
  const thumbnailClear = document.getElementById("thumbnailClear");

  fileInput?.addEventListener("change", e => {
    const file = e.target.files[0];
    if (file) {
      imgPreview.src = URL.createObjectURL(file);
      imgPreview.style.display = "block";
    }
  });

  thumbnailClear?.addEventListener("click", () => {
    if (fileInput) fileInput.value = "";
    if (imgPreview) {
      imgPreview.src = "";
      imgPreview.style.display = "none";
    }
    if (thumbnailPreview) thumbnailPreview.innerHTML = "";
  });

  // ===== Activities Management =====
  const addActivityBtn = document.getElementById("addActivityBtn");
  const activitiesList = document.getElementById("activitiesList");
  const activityTemplate = document.getElementById("activityTemplate");

  function registerActivity(activityElement) {
    const removeBtn = activityElement.querySelector(".btn-remove");
    if (removeBtn) {
      removeBtn.addEventListener("click", () => activityElement.remove());
    }
  }

  // Register default activity
  const defaultActivity = document.querySelector("#activitiesList .activity");
  if (defaultActivity) registerActivity(defaultActivity);

  // Add new activities
  addActivityBtn?.addEventListener("click", () => {
    const clone = activityTemplate.content.cloneNode(true);
    const newActivity = clone.querySelector(".activity");
    if (!newActivity) return;
    registerActivity(newActivity);
    activitiesList.appendChild(newActivity);
  });

  // ===== Preview Step =====
  const previewBtn = document.getElementById("nextToAssessment");
  previewBtn?.addEventListener("click", () => {
    document.getElementById("previewTitleValue").textContent = document.getElementById("title").value;
    document.getElementById("previewSubtitleValue").textContent = document.getElementById("subTitle").value;
    document.getElementById("previewCategoryValue").textContent = document.getElementById("category").value;
    document.getElementById("previewDescriptionValue").textContent = document.getElementById("description").value;
    document.getElementById("previewExampleValue").textContent = document.getElementById("example").value;

    const thumbFile = fileInput?.files[0];
    thumbnailPreview.innerHTML = thumbFile
      ? `<img src="${URL.createObjectURL(thumbFile)}" alt="Thumbnail Preview">`
      : `<em>No thumbnail selected</em>`;

    const allActivities = document.querySelectorAll("#activitiesList .activity");
    const previewList = document.getElementById("previewActivitiesList");
    previewList.innerHTML = "";

    allActivities.forEach((act, i) => {
      const title = act.querySelector(".activity-title")?.value || "(Untitled)";
      const difficulty = act.querySelector(".activity-difficulty")?.value || "(No difficulty)";
      const desc = act.querySelector(".activity-description")?.value || "(No description)";
      const tests = act.querySelector(".activity-tests")?.value || "[]";

      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${i + 1}. ${title}</strong> (${difficulty})
        <p>${desc}</p>
        <pre class="view-tests">${JSON.stringify(
          JSON.parse(tests) || [],
          null,
          2
        )}</pre>
      `;
      previewList.appendChild(li);
    });
  });

  // ===== Create Course & Activities =====
  const form = document.getElementById("courseWizard");

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // THIS is the missing spine
    try {
      // Course form data
      const formData = new FormData();
      formData.append("title", document.getElementById("title").value);
      formData.append("subTitle", document.getElementById("subTitle").value);
      formData.append("category", document.getElementById("category").value);
      formData.append("description", document.getElementById("description").value);
      formData.append("example", document.getElementById("example").value);
      formData.append("instructorId", userId);

      if (fileInput?.files[0]) formData.append("thumbnail", fileInput.files[0]);

      // Create course
      const courseRes = await fetch("http://localhost:5000/api/courses", { method: "POST", body: formData });
      if (!courseRes.ok) {
        const errText = await courseRes.text();
        throw new Error(errText);
      }

      const course = await courseRes.json();

      // Create activities
      const allActivities = document.querySelectorAll("#activitiesList .activity");
      for (const act of allActivities) {
        const testsRaw = act.querySelector(".activity-tests")?.value || "[]";
        let testCases;
        try {
          testCases = JSON.parse(testsRaw);
        } catch {
          alert("Invalid test cases JSON. Fix it.");
          return;
        }

        const activityData = {
          title: act.querySelector(".activity-title")?.value || "Untitled",
          difficulty: act.querySelector(".activity-difficulty")?.value,
          description: act.querySelector(".activity-description")?.value || "",
          testCases,
          courseId: course._id
        };

        const activityRes = await fetch("http://localhost:5000/api/activities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(activityData)
        });
        if (!activityRes.ok) {
          const errText = await activityRes.text();
          throw new Error(errText);
        }

      }

      localStorage.setItem("courseCreatedSuccess", "true");
      window.location.href = "./courses-instructor.html";

    } catch (err) {
      alert("Something went wrong: " + err.message);
      console.error(err);
    }
  });
});
