// Account page functionality

// Check if user is logged in
function checkAuth() {
  const session =
    JSON.parse(localStorage.getItem("techedge_session")) ||
    JSON.parse(sessionStorage.getItem("techedge_session"));

  if (!session || !session.loggedIn) {
    // Not logged in, redirect to login page
    window.location.href = "login.html";
    return null;
  }

  return session;
}

// Get user data
function getUserData(email) {
  const users = JSON.parse(localStorage.getItem("techedge_users")) || [];
  return users.find((u) => u.email === email);
}

// Initialize account page
function initAccountPage() {
  const session = checkAuth();
  if (!session) return;

  const user = getUserData(session.email);
  if (!user) {
    // User data not found, logout
    logout();
    return;
  }

  // Update profile info
  document.getElementById("userName").textContent = user.fullname;
  document.getElementById("userEmail").textContent = user.email;

  // Set initials
  const initials = user.fullname
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
  document.getElementById("userInitials").textContent = initials;

  // Set member since date
  const memberDate = new Date(user.createdAt);
  const monthYear = memberDate.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
  document.getElementById("memberSince").textContent = monthYear;

  // Update cart count
  const cart = JSON.parse(localStorage.getItem("techedge_cart")) || [];
  const userCart = cart.filter((item) => item.userEmail === user.email);
  document.getElementById("cartCount").textContent = userCart.length;
  document.getElementById("cartItemsCount").textContent = userCart.length;

  // Populate settings form
  document.getElementById("settingsName").value = user.fullname;
  document.getElementById("settingsEmail").value = user.email;
}

// Tab switching
const menuItems = document.querySelectorAll(".menu-item");
const tabs = document.querySelectorAll(".account-tab");

menuItems.forEach((item) => {
  item.addEventListener("click", () => {
    if (item.classList.contains("danger")) return; // Skip logout button

    const tabName = item.dataset.tab;

    // Remove active class from all items and tabs
    menuItems.forEach((mi) => mi.classList.remove("active"));
    tabs.forEach((tab) => tab.classList.remove("active"));

    // Add active class to clicked item and corresponding tab
    item.classList.add("active");
    document.getElementById(`${tabName}Tab`).classList.add("active");
  });
});

// Quick action buttons that switch tabs
const quickActionBtns = document.querySelectorAll(".action-card[data-tab]");
quickActionBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const tabName = btn.dataset.tab;

    // Remove active class from all items and tabs
    menuItems.forEach((mi) => mi.classList.remove("active"));
    tabs.forEach((tab) => tab.classList.remove("active"));

    // Add active class to correct menu item and tab
    const menuItem = document.querySelector(
      `.menu-item[data-tab="${tabName}"]`,
    );
    if (menuItem) menuItem.classList.add("active");
    document.getElementById(`${tabName}Tab`).classList.add("active");
  });
});

// Settings form submission
const settingsForm = document.getElementById("settingsForm");
settingsForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const session = checkAuth();
  if (!session) return;

  const newName = document.getElementById("settingsName").value.trim();
  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmNewPassword =
    document.getElementById("confirmNewPassword").value;

  const users = JSON.parse(localStorage.getItem("techedge_users")) || [];
  const userIndex = users.findIndex((u) => u.email === session.email);

  if (userIndex === -1) {
    showAccountMessage("User not found", "error");
    return;
  }

  let updated = false;

  // Update name if changed
  if (newName !== users[userIndex].fullname) {
    users[userIndex].fullname = newName;
    session.fullname = newName;
    updated = true;
  }

  // Update password if provided
  if (currentPassword || newPassword || confirmNewPassword) {
    if (!currentPassword) {
      showAccountMessage("Please enter your current password", "error");
      return;
    }

    if (currentPassword !== users[userIndex].password) {
      showAccountMessage("Current password is incorrect", "error");
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      showAccountMessage("New password must be at least 8 characters", "error");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showAccountMessage("New passwords do not match", "error");
      return;
    }

    users[userIndex].password = newPassword;
    updated = true;
  }

  if (updated) {
    // Save changes
    localStorage.setItem("techedge_users", JSON.stringify(users));
    localStorage.setItem("techedge_session", JSON.stringify(session));

    showAccountMessage("Account updated successfully!", "success");

    // Clear password fields
    document.getElementById("currentPassword").value = "";
    document.getElementById("newPassword").value = "";
    document.getElementById("confirmNewPassword").value = "";

    // Update display
    document.getElementById("userName").textContent = newName;
  } else {
    showAccountMessage("No changes to save", "info");
  }
});

// Delete account
const deleteAccountBtn = document.getElementById("deleteAccountBtn");
deleteAccountBtn.addEventListener("click", () => {
  const confirmed = confirm(
    "Are you sure you want to delete your account? This action cannot be undone.",
  );

  if (!confirmed) return;

  const doubleConfirm = confirm(
    "This will permanently delete all your data. Are you absolutely sure?",
  );

  if (!doubleConfirm) return;

  const session = checkAuth();
  if (!session) return;

  // Remove user from users array
  const users = JSON.parse(localStorage.getItem("techedge_users")) || [];
  const updatedUsers = users.filter((u) => u.email !== session.email);
  localStorage.setItem("techedge_users", JSON.stringify(updatedUsers));

  // Remove user's cart items
  const cart = JSON.parse(localStorage.getItem("techedge_cart")) || [];
  const updatedCart = cart.filter((item) => item.userEmail !== session.email);
  localStorage.setItem("techedge_cart", JSON.stringify(updatedCart));

  // Logout
  logout();
});

// Logout function
function logout() {
  localStorage.removeItem("techedge_session");
  sessionStorage.removeItem("techedge_session");
  window.location.href = "index.html";
}

// Logout buttons
const logoutBtnSidebar = document.getElementById("logoutBtnSidebar");
logoutBtnSidebar.addEventListener("click", logout);

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}

// Message display function
function showAccountMessage(message, type = "info") {
  // Remove any existing message
  const existingMessage = document.querySelector(".account-message");
  if (existingMessage) {
    existingMessage.remove();
  }

  // Create message element
  const messageEl = document.createElement("div");
  messageEl.className = `account-message account-message-${type}`;
  messageEl.textContent = message;

  // Insert message at top of main content
  const mainContent = document.querySelector(".account-main");
  mainContent.insertBefore(messageEl, mainContent.firstChild);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (messageEl.parentNode) {
      messageEl.remove();
    }
  }, 5000);
}

// Mobile Navigation Toggle
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");

if (navToggle) {
  navToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active");

    // Animate hamburger
    const hamburger = navToggle.querySelector(".hamburger");
    if (navMenu.classList.contains("active")) {
      hamburger.style.transform = "rotate(45deg)";
    } else {
      hamburger.style.transform = "rotate(0)";
    }
  });
}

// Initialize page on load
document.addEventListener("DOMContentLoaded", initAccountPage);

console.log("Account page loaded");
