const modal = document.getElementById('joinCourseModal');
const joinBtn = document.getElementById('primaryAction');
const closeBtn = document.getElementById('closeModal');
const submitBtn = document.getElementById('submitJoinCode');
const joinInput = document.getElementById('joinCodeInput');

import { loadJoinedCourses } from "./joined-courses-student.js";

// Open modal
joinBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
    joinInput.focus();
});

// Close modal
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Submit join code
submitBtn.addEventListener('click', async () => {
    const code = joinInput.value.trim();
    if (!code) {
        alert("Please enter a course code.");
        return;
    }

    const userId = localStorage.getItem("userId"); // or whatever your auth stores
    console.log("JOIN COURSE ROUTE HIT");


    try {
        const res = await fetch("http://localhost:5000/api/courses/join", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                courseCode: code,
                studentId: userId
            })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message);
            return;
        }

        console.log("Joined:", data);
        alert("Course joined successfully");
        loadJoinedCourses(); // refresh the list


    } catch (e) {
        console.error(e);
        alert("Error joining course.");
    }

    modal.style.display = 'none';
    joinInput.value = "";
});


// Close on background click
modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
});