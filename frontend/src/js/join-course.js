const modal = document.getElementById('joinCourseModal');
const joinBtn = document.getElementById('primaryAction');
const closeBtn = document.getElementById('closeModal');
const submitBtn = document.getElementById('submitJoinCode');
const joinInput = document.getElementById('joinCodeInput');

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
submitBtn.addEventListener('click', () => {
    const code = joinInput.value.trim();
    if (!code) {
        alert("Please enter a course code.");
        return;
    }
    // TODO: Add your API call here
    console.log("Joining course with code:", code);

    modal.style.display = 'none';
    joinInput.value = "";
});

// Close on background click
modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
});