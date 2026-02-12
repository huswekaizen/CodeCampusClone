const userId = localStorage.getItem("userId");

document.addEventListener("DOMContentLoaded", () => {
    fetchStudentData();
});

async function fetchStudentData() {

    try {
        const res = await fetch(`http://localhost:5000/api/users/${userId}/details`);
        const data = await res.json();

        
        const fullNameTop = document.getElementById("fullNameTop");
        const roleTop = document.getElementById("roleTop");
        const fullNameProfile = document.getElementById("fullNameProfile");
        const instructorName = document.getElementById("instructorName");
        const studentName = document.getElementById("studentName");
        const roleProfile = document.getElementById("roleProfile");

        const firstName = data?.firstName || "";
        const lastName = data?.lastName || "";
        const username = data?.username || "";
        const role = data?.role || "";
        const id = data?._id || "";
        const fullName = `${firstName} ${lastName}`.trim();

        console.log("firstName:", firstName);
        console.log("lastName:", lastName);
        console.log("role:", role);
        console.log("username:", username);
        console.log("fullName:", fullName);
        console.log("id:", id);


        [fullNameTop, fullNameProfile, instructorName, studentName]
          .filter(Boolean)
          .forEach(el => el.textContent = fullName);

        [roleTop, roleProfile]
          .filter(Boolean)
          .forEach(el => el.textContent = role);

    } catch (err) {
        console.error("Failed to load student data", err);
    }
}