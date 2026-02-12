document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('save-btn');
    const userId = localStorage.getItem('userId');

    saveBtn.addEventListener('click', () => {
        changePassword(`http://localhost:5000/api/users/${userId}/security`);

    });
});

async function changePassword(url) {
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmNewPasswordInput = document.getElementById('confirmNewPassword');

    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmNewPassword = confirmNewPasswordInput.value;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
        alert("All fields are required");
        return;
    }

    try {
        const res = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword })
        });

        const data = await res.json();

        if (res.ok) {
            alert(data.message);

            currentPasswordInput.value = "";
            newPasswordInput.value = "";
            confirmNewPasswordInput.value = "";
        } else {
            alert(data.message);
        }

    } catch (error) {
        console.error('Error changing password:', error);
        alert('An error occurred while changing the password.');
    }
}
