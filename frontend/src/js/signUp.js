
const signUpButton = document.getElementById('createAccount');

signUpButton.addEventListener('click', async () => {
  const username = document.getElementById('username');
  const firstName = document.getElementById('firstName');
  const lastName = document.getElementById('lastName');
  const password = document.getElementById('password');
  const age = document.getElementById('age');
  const role = document.getElementById('role');
  const address = document.getElementById('address');
  const formMessage = document.getElementById('formMessage');

  const res = await fetch('http://localhost:5000/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: username.value,
      firstName: firstName.value,
      lastName: lastName.value,
      age: age.value,
      role: role.value,
      address: address.value,
      password: password.value
    })
  });

  const data = await res.json();
  console.log(data);

  if(res.ok){
    formMessage.style.color = 'lightgreen';
    formMessage.style.fontWeight = "bold";
    formMessage.textContent = data.message;
    document.getElementById("signupForm").reset();
    window.location.href = "index.html";

  }
});



