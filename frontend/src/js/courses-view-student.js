const currentPage = document.body.dataset.page;
document.querySelectorAll(".nav-item").forEach(item => {
  if (item.dataset.page === currentPage) {
    item.classList.add("active");
  }
});

document.getElementById("back-btn").addEventListener("click", () => {
  if(localStorage.getItem("courseViewMode") === "public") {
    window.location.href = "./public-courses.html";
    return;
  } else {
    window.location.href = "./joined-courses-student.html";
  }

});