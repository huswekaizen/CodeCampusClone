const username = document.getElementById('username');
const password = document.getElementById('password');
const loginButton = document.getElementById('login-button');
const errorMessage = document.getElementById('errorMessage');

if(localStorage.getItem('username') !== null && localStorage.getItem('role') === 'student') {

  window.location.href = '/frontend/public/home-student.html';

} else if(localStorage.getItem('username') !== null && localStorage.getItem('role') === 'instructor') {

  window.location.href = '/frontend/public/home-instructor.html';

}

loginButton.addEventListener('click', async () => {


  console.log('Username:', username.value);
  console.log('Password:', password.value);
  
  const res = await fetch('http://localhost:5000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: username.value,
      password: password.value
    })
  });

  const data = await res.json();
  console.log(data);

  if(res.ok) {
    localStorage.setItem('username', data.user.username);
    localStorage.setItem("firstName", data.user.firstName);
    localStorage.setItem("lastName", data.user.lastName);
    localStorage.setItem('role', data.user.role);
    localStorage.setItem('userId', data.user._id);
   if(localStorage.getItem('role') === 'student') {
      window.location.href = '/frontend/public/home-student.html';
    } else if(localStorage.getItem('role') === 'instructor') {
      window.location.href = '/frontend/public/home-instructor.html';
    }
  } else {
    errorMessage.textContent = data.message;
  }
});
