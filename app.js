function login() {
  const email = document.getElementById("email").value;
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
function openUpload() {
  document.getElementById("uploadModal").style.display = "flex";
}

function closeUpload() {
  document.getElementById("uploadModal").style.display = "none";
}

const videoInput = document.getElementById("videoInput");
const preview = document.getElementById("preview");

if (videoInput) {
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
