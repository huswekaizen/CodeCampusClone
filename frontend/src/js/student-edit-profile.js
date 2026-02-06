
document.addEventListener("DOMContentLoaded", () => {
    const userId = localStorage.getItem("userId");

    loadStudentData(`http://localhost:5000/api/users/${userId}/details`);

    document.getElementById("save-btn").addEventListener("click", () => {
        editStudentProfile(`http://localhost:5000/api/users/${userId}/edit`);
    });
});


async function editStudentProfile(url) {
    const payload = {
        firstName: document.getElementById("firstName").value.trim(),
        lastName: document.getElementById("lastName").value.trim(),
        username: document.getElementById("username").value.trim(),
        address: document.getElementById("address").value.trim(),
        currentPassword: document.getElementById("currentPassword").value,
        newPassword: document.getElementById("newPassword").value
    };

    const confirmPassword = document.getElementById("confirmNewPassword").value;
    if (payload.newPassword && payload.newPassword !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (!res.ok) {
        alert(result.message);
        return;
    }

    alert("Profile updated successfully");
}


async function loadStudentData(url) {
    try {
        const res = await fetch(url);
        const student = await res.json();

        document.getElementById("firstName").value = student.firstName ?? "";
        document.getElementById("lastName").value = student.lastName ?? "";
        document.getElementById("username").value = student.username ?? "";
        document.getElementById("address").value = student.address ?? "";
    } catch (err) {
        console.error("Failed to load student data", err);
    }
}
