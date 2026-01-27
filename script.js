// Check if user is logged in
function isLoggedIn() {
  const session =
    JSON.parse(localStorage.getItem("techedge_session")) ||
    JSON.parse(sessionStorage.getItem("techedge_session"));
  return session && session.loggedIn;
}

// Get current user session
function getCurrentUser() {
  return (
    JSON.parse(localStorage.getItem("techedge_session")) ||
    JSON.parse(sessionStorage.getItem("techedge_session"))
  );
}

// Update cart count
function updateCartCount() {
  const cartCountElement = document.querySelector(".cart-count");
  if (!cartCountElement) return;

  if (isLoggedIn()) {
    const user = getCurrentUser();
    const cart = JSON.parse(localStorage.getItem("techedge_cart")) || [];
    const userCart = cart.filter((item) => item.userEmail === user.email);
    cartCountElement.textContent = userCart.length;
  } else {
    cartCountElement.textContent = "0";
  }
}

// Update navigation based on login status
function updateNavigation() {
  const logoutBtn = document.getElementById("logoutBtn");
  const loginLink = document.querySelector('a[href="login.html"]');
  const signupLink = document.querySelector('a[href="signup.html"]');

  if (isLoggedIn()) {
    // User is logged in
    if (logoutBtn) logoutBtn.style.display = "inline-flex";
    if (loginLink) loginLink.style.display = "none";
    if (signupLink) {
      signupLink.textContent = "Account";
      signupLink.href = "account.html";
    }
  } else {
    // User is not logged in
    if (logoutBtn) logoutBtn.style.display = "none";
    if (loginLink) loginLink.style.display = "inline";
    if (signupLink) {
      signupLink.textContent = "Sign Up";
      signupLink.href = "signup.html";
    }
  }
}

// Logout function
function logout() {
  localStorage.removeItem("techedge_session");
  sessionStorage.removeItem("techedge_session");
  updateCartCount();
  updateNavigation();
  window.location.href = "index.html";
}

// Mobile Navigation Toggle
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
const nav = document.getElementById("nav");
const navLinks = document.querySelectorAll(".nav-link");

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

// Close mobile menu when clicking a link
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (navMenu) {
      navMenu.classList.remove("active");
      const hamburger = navToggle
        ? navToggle.querySelector(".hamburger")
        : null;
      if (hamburger) {
        hamburger.style.transform = "rotate(0)";
      }
    }
  });
});

// Navigation scroll effect
let lastScroll = 0;

window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset;

  if (nav) {
    if (currentScroll > 100) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }
  }

  lastScroll = currentScroll;
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    if (href !== "#" && href !== "") {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const offsetTop = target.offsetTop - 80;
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });
      }
    }
  });
});

// Add to Cart functionality (requires login)
const addToCartButtons = document.querySelectorAll(".btn-add-cart");

addToCartButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    e.stopPropagation();

    // Check if user is logged in
    if (!isLoggedIn()) {
      // Show login prompt
      const loginConfirm = confirm(
        "You must be logged in to add items to cart. Would you like to login now?",
      );
      if (loginConfirm) {
        window.location.href = "login.html";
      }
      return;
    }

    // Get user session
    const user = getCurrentUser();

    // Get product info
    const productCard = button.closest(".product-card");
    const productName = productCard.querySelector(".product-name").textContent;
    const productPrice = productCard
      .querySelector(".product-price")
      .textContent.replace("$", "")
      .split(" ")[0];
    const productImage = productCard.querySelector(".product-image img").src;

    // Create cart item
    const cartItem = {
      id: Date.now(),
      userEmail: user.email,
      productName: productName,
      price: parseFloat(productPrice),
      image: productImage,
      quantity: 1,
      addedAt: new Date().toISOString(),
    };

    // Get existing cart
    const cart = JSON.parse(localStorage.getItem("techedge_cart")) || [];

    // Check if item already in cart
    const existingItem = cart.find(
      (item) =>
        item.userEmail === user.email && item.productName === productName,
    );

    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push(cartItem);
    }

    // Save cart
    localStorage.setItem("techedge_cart", JSON.stringify(cart));

    // Update cart count
    updateCartCount();

    // Visual feedback
    button.textContent = "Added!";
    button.style.background = "var(--color-primary)";
    button.style.color = "var(--color-secondary)";

    // Cart icon animation
    const cartCountElement = document.querySelector(".cart-count");
    if (cartCountElement) {
      cartCountElement.style.transform = "scale(1.3)";
      setTimeout(() => {
        cartCountElement.style.transform = "scale(1)";
      }, 200);
    }

    // Reset button after 2 seconds
    setTimeout(() => {
      button.textContent = "Add to Cart";
      button.style.background = "";
      button.style.color = "";
    }, 2000);
  });
});

// Product card interactions
const productCards = document.querySelectorAll(".product-card");

productCards.forEach((card) => {
  card.addEventListener("click", (e) => {
    // Don't trigger if clicking the add to cart button
    if (!e.target.classList.contains("btn-add-cart")) {
      const productName = card.querySelector(".product-name").textContent;
      console.log(`Clicked on: ${productName}`);
      // Here you could navigate to a product detail page or show a modal
    }
  });
});

// Contact form submission
const contactForm = document.querySelector(".contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      message: document.getElementById("message").value,
    };

    // Show success message
    const submitButton = contactForm.querySelector(".btn-primary");
    const originalText = submitButton.innerHTML;

    submitButton.innerHTML = "Sent! ✓";
    submitButton.style.background = "var(--color-primary)";

    // Reset form
    contactForm.reset();

    // Reset button after 3 seconds
    setTimeout(() => {
      submitButton.innerHTML = originalText;
      submitButton.style.background = "";
    }, 3000);

    console.log("Form submitted:", formData);
  });
}

// Intersection Observer for scroll animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -100px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

// Observe elements for scroll animations
const animateOnScroll = document.querySelectorAll(
  ".product-card, .feature, .info-card",
);
animateOnScroll.forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(30px)";
  el.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
  observer.observe(el);
});

// Parallax effect for hero background
window.addEventListener("scroll", () => {
  const scrolled = window.pageYOffset;
  const heroBackground = document.querySelector(".hero-background");

  if (heroBackground && scrolled < window.innerHeight) {
    heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
  }
});

// Product hover 3D tilt effect (desktop only)
if (window.innerWidth > 768) {
  productCards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

// Logout button handler
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  updateNavigation();
  updateCartCount();
});

console.log("TechEdge website loaded successfully!");
