/* =====================
   AUTH
===================== */
function login() {
  const email = document.getElementById("email")?.value;
  if (!email) {
    alert("Enter email");
    return;
  }
  localStorage.setItem("user", email);
  window.location.href = "dashboard.html";
}

function logout() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

// Protect dashboard
if (window.location.pathname.includes("dashboard")) {
  if (!localStorage.getItem("user")) {
    window.location.href = "login.html";
  }
}

/* =====================
   UPLOAD MODAL
===================== */
function openUpload() {
  document.getElementById("uploadModal").style.display = "flex";
}

function closeUpload() {
  document.getElementById("uploadModal").style.display = "none";
}

const videoInput = document.getElementById("videoInput");
const preview = document.getElementById("preview");

if (videoInput && preview) {
  videoInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      preview.src = URL.createObjectURL(file);
      preview.style.display = "block";
    }
  });
}

function submitVideo() {
  alert("Video submitted for review (demo)");
  closeUpload();
}

/* =====================
   REVIEW QUEUE
===================== */
const demoVideos = [
  {
    title: "Indie Short Film",
    src: "https://www.w3schools.com/html/mov_bbb.mp4"
  }
];

function openQueue() {
  document.getElementById("queueModal").style.display = "flex";
  document.getElementById("queueVideo").src = demoVideos[0].src;
}

function closeQueue() {
  document.getElementById("queueModal").style.display = "none";
}

function submitReview() {
  const text = document.getElementById("reviewText").value;
  const rating = document.getElementById("rating").value;

  if (text.split(" ").length < 50) {
    alert("Review must be at least 50 words.");
    return;
  }

  if (!rating) {
    alert("Please select a rating.");
    return;
  }

  alert("Review submitted! +$0.50 earned (demo)");

  document.getElementById("reviewText").value = "";
  document.getElementById("rating").value = "";
  closeQueue();
}
