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

    // Step 2 (Activities) is optional, so skip validation if on step 2
    if (currentStep.id === "step-2-panel") {
      goToStep(nextStep);
      return;
    }

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
        const title = act.querySelector(".activity-title")?.value.trim();
        const difficulty = act.querySelector(".activity-difficulty")?.value || "(No difficulty)";
        const desc = act.querySelector(".activity-description")?.value || "(No description)";
        const points = act.querySelector(".activity-points")?.value || 1;
        const sampleRaw = act.querySelector(".activity-sample-tests")?.value || "";
        const validationRaw = act.querySelector(".activity-validation-tests")?.value || "";

        if (!title) {
          alert(`Proceed without Activity? Because Activity #${i + 1} is missing a title`);
          return; // Skip entirely if no title and no other fields touched
        }
        // Parse both sample and validation tests
        let sampleTests = [], validationTests = [];

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
          <strong>${i + 1}. ${title || "(Untitled)"}</strong> (${difficulty}) - Points: ${points}
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
    e.preventDefault();

    try {
      // ===== Course Data =====
      const courseData = {
        title: document.getElementById("title").value.trim(),
        subTitle: document.getElementById("subTitle").value.trim(),
        category: document.getElementById("category").value.trim(),
        description: document.getElementById("description").value.trim(),
        example: document.getElementById("example").value.trim(),
        instructorId: userId
      };

      const file = fileInput?.files[0];
      let res;

      // ===== Activities Data =====
      const allActivities = document.querySelectorAll("#activitiesList .activity");
      const activitiesData = [];

      allActivities.forEach((act, i) => {
        const title = act.querySelector(".activity-title")?.value.trim();

        // If no title, treat as non-existent activity
        if (!title) return;

        const difficulty = act.querySelector(".activity-difficulty")?.value;
        const description = act.querySelector(".activity-description")?.value.trim();
        const points = Number(act.querySelector(".activity-points")?.value);
        const sampleRaw = act.querySelector(".activity-sample-tests")?.value.trim();
        const validationRaw = act.querySelector(".activity-validation-tests")?.value.trim();

        if (!difficulty || !description || !points) {
          throw new Error(`Activity #${i + 1} is incomplete. Fill all fields.`);
        }

        let sampleTests = [], validationTests = [];
        try {
          sampleTests = sampleRaw ? JSON.parse(sampleRaw) : [];
          validationTests = validationRaw ? JSON.parse(validationRaw) : [];
        } catch {
          throw new Error(`Activity #${i + 1} has invalid JSON`);
        }

        activitiesData.push({
          title,
          difficulty,
          description,
          points,
          sampleTests,
          validationTests
        });
      });


      // ===== Send Request =====
      if (file) {
        const formData = new FormData();

        formData.append("course", JSON.stringify(courseData));

        if (activitiesData.length) {
          formData.append("activities", JSON.stringify(activitiesData));
        }

        formData.append("thumbnail", file);

        res = await fetch("http://localhost:5000/api/courses/with-activities", {
          method: "POST",
          body: formData
        });
      } else {
        // JSON payload
        const payload = { course: courseData };
        if (activitiesData.length) payload.activities = activitiesData;

        res = await fetch("http://localhost:5000/api/courses/with-activities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }

      const createdCourse = await res.json();
      localStorage.setItem("courseCreatedSuccess", "true");
      window.location.href = "./courses-instructor.html";

    } catch (err) {
      alert("Error creating course: " + err.message);
      console.error(err);
    }
  });


});
