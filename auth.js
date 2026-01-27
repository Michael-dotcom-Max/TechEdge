// Authentication functionality for login and signup pages

// User database simulation (in real app, this would be a backend API)
const users = JSON.parse(localStorage.getItem("techedge_users")) || [];

// Login Form Handler
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const remember = document.getElementById("remember").checked;

    // Validate user credentials
    const user = users.find(
      (u) => u.email === email && u.password === password,
    );

    if (user) {
      // Login successful
      const sessionData = {
        email: user.email,
        fullname: user.fullname,
        loggedIn: true,
        timestamp: new Date().toISOString(),
      };

      // Store session
      if (remember) {
        localStorage.setItem("techedge_session", JSON.stringify(sessionData));
      } else {
        sessionStorage.setItem("techedge_session", JSON.stringify(sessionData));
      }

      // Show success message
      showMessage("Login successful! Redirecting...", "success");

      // Redirect to home page after 1.5 seconds
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    } else {
      // Login failed
      showMessage("Invalid email or password. Please try again.", "error");
    }
  });
}

// Signup Form Handler
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const fullname = document.getElementById("fullname").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const terms = document.getElementById("terms").checked;

    // Validation
    if (!terms) {
      showMessage("Please accept the Terms & Conditions", "error");
      return;
    }

    if (password !== confirmPassword) {
      showMessage("Passwords do not match", "error");
      return;
    }

    if (password.length < 8) {
      showMessage("Password must be at least 8 characters long", "error");
      return;
    }

    // Check if user already exists
    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      showMessage("An account with this email already exists", "error");
      return;
    }

    // Create new user
    const newUser = {
      id: Date.now(),
      fullname,
      email,
      password, // In real app, this should be hashed
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem("techedge_users", JSON.stringify(users));

    // Auto-login after signup
    const sessionData = {
      email: newUser.email,
      fullname: newUser.fullname,
      loggedIn: true,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem("techedge_session", JSON.stringify(sessionData));

    // Show success message
    showMessage("Account created successfully! Redirecting...", "success");

    // Redirect to home page after 1.5 seconds
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
  });
}

// Social Login Handlers
const socialButtons = document.querySelectorAll(".btn-social");
socialButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const provider = button.textContent.includes("Google")
      ? "Google"
      : "GitHub";
    showMessage(`${provider} login is not available in demo mode`, "info");
  });
});

// Forgot Password Handler
const forgotLink = document.querySelector(".forgot-link");
if (forgotLink) {
  forgotLink.addEventListener("click", (e) => {
    e.preventDefault();
    showMessage(
      "Password reset functionality is not available in demo mode",
      "info",
    );
  });
}

// Message Display Function
function showMessage(message, type = "info") {
  // Remove any existing message
  const existingMessage = document.querySelector(".auth-message");
  if (existingMessage) {
    existingMessage.remove();
  }

  // Create message element
  const messageEl = document.createElement("div");
  messageEl.className = `auth-message auth-message-${type}`;
  messageEl.textContent = message;

  // Insert message before form
  const form = document.querySelector(".auth-form");
  form.parentNode.insertBefore(messageEl, form);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (messageEl.parentNode) {
      messageEl.remove();
    }
  }, 5000);
}

// Password visibility toggle (optional enhancement)
document.querySelectorAll('input[type="password"]').forEach((input) => {
  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.className = "password-toggle";
  toggleBtn.innerHTML = "👁️";
  toggleBtn.style.display = "none"; // Hidden by default, can be styled to show

  toggleBtn.addEventListener("click", () => {
    if (input.type === "password") {
      input.type = "text";
      toggleBtn.innerHTML = "👁️‍🗨️";
    } else {
      input.type = "password";
      toggleBtn.innerHTML = "👁️";
    }
  });
});

console.log("TechEdge authentication system loaded");
