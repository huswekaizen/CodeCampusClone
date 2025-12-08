const currentPage = document.body.dataset.page;
document.querySelectorAll(".nav-item").forEach(item => {
  if (item.dataset.page === currentPage) {
    item.classList.add("active");
  }
});

document.getElementById("back-btn").addEventListener("click", () => {
  window.location.href = "./joined-courses-student.html";
});