
const role = localStorage.getItem('role');
const username = localStorage.getItem('username');
const userId = localStorage.getItem("userId") || "";


if (!username) {
  window.location.href = '/frontend/public/index.html';
} else if (role === 'instructor' && window.location.pathname.includes('home-student.html')) {
  window.location.href = '/frontend/public/home-instructor.html';
} else if (role === 'student' && window.location.pathname.includes('home-instructor.html')) {
  window.location.href = '/frontend/public/home-student.html';
}

document.addEventListener('DOMContentLoaded', async () => {
  const userId = localStorage.getItem("userId");


  await loadPublishedCourses(userId);
  await loadTotalStudents(userId);
  await loadStudentsDebug(userId); // TEMP, for verification
  await fetchStudentData(`http://localhost:5000/api/users/${userId}/details`);
  await initUI();
  await sideBarUI();
});


// header scroll handler: toggles .scrolled on the .topbar
async function initUI() {
  const topbar = document.querySelector('.topbar');
  if (!topbar) return;

  const SCROLL_THRESHOLD = 16; // px before header becomes solid
  const LIFT_THRESHOLD = 120; // px for small lift effect

  function onScroll() {
    const y = window.scrollY || window.pageYOffset;
    if (y > SCROLL_THRESHOLD) {
      topbar.classList.add('scrolled');
    } else {
      topbar.classList.remove('scrolled');
    }

    if (y > LIFT_THRESHOLD) {
      topbar.classList.add('lift');
    } else {
      topbar.classList.remove('lift');
    }
  }

  // run once on load in case page is already scrolled
  onScroll();

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
}

const logoutButton = document.getElementById('logout');

logoutButton.addEventListener('click', () => {
  // Option 1: clear all stored data if everything in localStorage is user-related
  localStorage.clear();

  // Option 2 (safer): wrap removals in a helper
  // ['username', 'firstName', 'lastName', 'role'].forEach(key => localStorage.removeItem(key));

  // Use relative redirect (no hardcoded localhost)
  window.location.href = '/frontend/public/index.html';
});


async function sideBarUI(){
  const collapseBtn = document.getElementById('collapseBtn');
  const sidebar = document.getElementById('sidebar');

  if (collapseBtn && sidebar) {
    collapseBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      collapseBtn.textContent = sidebar.classList.contains('collapsed') ? '⮞' : '⮜';
      // simple visual change: shrink sidebar
      sidebar.style.width = sidebar.classList.contains('collapsed') ? '72px' : '220px';
    });
  }

  // simple search focus behaviour
  const search = document.getElementById('search');
  if (search) {
    search.addEventListener('focus', () => search.style.boxShadow = '0 8px 30px rgba(58,141,255,0.06)');
    search.addEventListener('blur', () => search.style.boxShadow = 'none');
  }
}

async function fetchStudentData(url) {

    try {
        const res = await fetch(url);
        const student = await res.json();

        
        const fullNameTop = document.getElementById("fullNameTop");
        const roleTop = document.getElementById("roleTop");
        const fullNameProfile = document.getElementById("fullNameProfile");
        const instructorName = document.getElementById("instructorName");
        const studentName = document.getElementById("studentName");
        const roleProfile = document.getElementById("roleProfile");

        const firstName = student?.firstName || "";
        const lastName = student?.lastName || "";
        const username = student?.username || "";
        const role = student?.role || "";
        const id = student?._id || "";
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


async function loadPublishedCourses(userId) {
  const publishedCourseList = document.getElementById("publishedCourseList");
  const publishedCourseCountProfile = document.getElementById("publishedCourseCountProfile");
  try {
    const res = await fetch(`http://localhost:5000/api/instructors/${userId}/published-courses`);
    const data = await res.json();
    console.log(data); // check what comes back
    publishedCourseList.textContent = data.count || 0;
    publishedCourseCountProfile.textContent = data.count || 0;
  } catch (err) {
    console.error("Failed to load published courses:", err);
    publishedCourseList.textContent = "0";
  }
}

async function loadTotalStudents(userId) {
  try {
    const res = await fetch(
      `http://localhost:5000/api/instructors/${userId}/totalStudents`
    );
    const data = await res.json();

    console.log("TOTAL STUDENTS COUNT:", data.totalStudents);
    document.getElementById("enrolledStudentsCount").textContent =
      data.totalStudents || 0;
  } catch (err) {
    console.error("Failed to load total students:", err);
  }
}
async function loadStudentsDebug(userId) {
  try {
    const res = await fetch(
      `http://localhost:5000/api/instructors/${userId}/totalStudentsNames`
    );
    const students = await res.json();

    console.log("UNIQUE STUDENTS LIST:");
    console.table("students names:", students);

    // sanity check
    console.log("Students counted:", students.length);
  } catch (err) {
    console.error("Failed to load students list:", err);
  }
}


export async function updateEnrolledCourseCount(userid) {
  const enrolledCourseList = document.getElementById("enrolledCoursesCount");
  try {
    const res = await fetch(`http://localhost:5000/api/students/${userId}/enrolled-courses`);
    const data = await res.json();
    console.log(data); // check what comes back
    enrolledCourseList.textContent = data.count || 0;
  } catch (err) {
    console.error("Failed to load enrolled courses:", err);
    enrolledCourseList.textContent = "0";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await updateEnrolledCourseCount();
});