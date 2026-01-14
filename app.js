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
