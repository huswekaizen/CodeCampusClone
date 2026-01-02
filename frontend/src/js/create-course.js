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

    // Parse both sample and validation tests
    let sampleTests = [], validationTests = [];

    const sampleRaw = act.querySelector(".activity-sample-tests")?.value || "";
    const validationRaw = act.querySelector(".activity-validation-tests")?.value || ""; 

    // Convert newlines into array objects
    if (sampleRaw.trim()) {
      sampleTests = sampleRaw.split("\n").map(line => {
        try { return JSON.parse(line); } catch { return line.trim(); }
      }).filter(Boolean);
    }

    if (validationRaw.trim()) {
      validationTests = validationRaw.split("\n").map(line => {
        try { return JSON.parse(line); } catch { return line.trim(); }
      }).filter(Boolean);
    }

    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${i + 1}. ${title}</strong> (${difficulty}) - Points: ${act.querySelector(".activity-points")?.value || 1}
      <p>${desc}</p>
      <pre class="view-tests">
  Sample Tests: ${JSON.stringify(sampleTests, null, 2)}
  Validation Tests: ${JSON.stringify(validationTests, null, 2)}
      </pre>
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

      // ===== Create activities =====
      const allActivities = document.querySelectorAll("#activitiesList .activity");

      // Step 1: Prepare all activity data first
      const activitiesData = [];
      for (const [i, act] of allActivities.entries()) {
        const title = act.querySelector(".activity-title")?.value.trim() || "Untitled";
        const difficulty = act.querySelector(".activity-difficulty")?.value;
        const description = act.querySelector(".activity-description")?.value.trim() || "";
        const points = parseInt(act.querySelector(".activity-points")?.value);

        if (!points || points < 1 || points > 100) {
          alert(`Activity #${i + 1} points must be between 1 and 100.`);
          act.querySelector(".activity-points")?.focus();
          return;
        }

        if (!["Easy", "Medium", "Hard"].includes(difficulty)) {
          alert(`Activity #${i + 1} must have a valid difficulty.`);
          act.querySelector(".activity-difficulty")?.focus();
          return;
        }

        // Parse test JSON
        let sampleTests = [], validationTests = [];
        try {
          sampleTests = JSON.parse(act.querySelector(".activity-sample-tests")?.value || "[]");
          validationTests = JSON.parse(act.querySelector(".activity-validation-tests")?.value || "[]");
        } catch {
          alert(`Activity #${i + 1} has invalid JSON in tests.`);
          return;
        }

        activitiesData.push({
          title,
          difficulty,
          description,
          points,
          sampleTests,
          validationTests,
          course: course._id
        });
      }

      // Step 2: Send all activities in parallel
      const activityRequests = activitiesData.map(data =>
        fetch("http://localhost:5000/api/activities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        })
      );

      const results = await Promise.all(activityRequests);
      for (const [i, res] of results.entries()) {
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Activity #${i + 1} creation failed: ${errText}`);
        }
      }

      alert("Course created successfully!");

      localStorage.setItem("courseCreatedSuccess", "true");
      window.location.href = "./courses-instructor.html";

    } catch (err) {
      alert("Something went wrong: " + err.message);
      console.error(err);
    }
  });
});
