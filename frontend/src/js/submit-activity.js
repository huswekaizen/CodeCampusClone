submitBtn.addEventListener("click", async () => {
  const activityId = localStorage.getItem("selectedActivityId");
  const userId = localStorage.getItem("userId");

  try {
    // 1️⃣ Fetch the activity first to know its points
    const activityRes = await fetch(`http://localhost:5000/api/activities/${activityId}`);
    const activityData = await activityRes.json();
    const activityPoints = activityData.points;

    // 2️⃣ Submit
    const res = await fetch(
      `http://localhost:5000/api/activities/${activityId}/submission`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    alert(`✅ Submitted. You earned ${activityPoints} points for this activity.`);
    submitBtn.disabled = true;
    window.location.href = "courses-view-student-leaderboard.html";

  } catch (err) {
    alert("❌ " + err.message);
  }
});
