document.getElementById("submitBtn").addEventListener("click", async () => {
  const activityId = localStorage.getItem("selectedActivityId");
  try {
    const res = await fetch(
      `http://localhost:5000/api/activities/${activityId}/submit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
});