const submitBtn = document.getElementById("submitBtn");

submitBtn.addEventListener("click", async () => {
  const activityId = localStorage.getItem("selectedActivityId");
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(
      `http://localhost:5000/api/activities/${activityId}/submit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    alert(`✅ Submitted. Total points: ${data.totalPoints}`);
    submitBtn.disabled = true;

  } catch (err) {
    alert("❌ " + err.message);
  }
});
