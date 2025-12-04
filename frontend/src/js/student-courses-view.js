document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        window.location.href = btn.getAttribute("data-route");
    });
});

const currentPage = document.body.dataset.page; 
document.querySelectorAll(".nav-item").forEach(item => {
  if (item.dataset.page === currentPage) {
    item.classList.add("active");
  }
});
