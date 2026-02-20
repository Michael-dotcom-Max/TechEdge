// TechEdge — Enhanced script v2
// Auth, products, cart, payments, profile + ultra UX

const cartKeyGlobal   = "cartItems_v1";
const usersKey        = "users_v3";
const currentUserKey  = "currentUserEmail";
const productsCacheKey = "productsCache_v1";
const defaultShipping = 5.0;

// ─── Helpers ────────────────────────────────────────────────
function getJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
}
function setJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

function showToast(message, type = "info") {
  // Remove existing toasts
  document.querySelectorAll(".toast").forEach(t => t.remove());
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add("show"));
  });
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 3200);
}

// ─── Users / Session ─────────────────────────────────────────
function getUsers()               { return getJSON(usersKey, []); }
function saveUsers(users)          { setJSON(usersKey, users); }
function getCurrentUserEmail()     { return localStorage.getItem(currentUserKey) || null; }
function setCurrentUserEmail(email) {
  if (email) localStorage.setItem(currentUserKey, email);
  else localStorage.removeItem(currentUserKey);
  updateAuthUI();
}
function getCurrentUser() {
  const email = getCurrentUserEmail();
  if (!email) return null;
  return getUsers().find(u => u.email === email) || null;
}

function updateAuthUI() {
  const nav = document.querySelector(".site-nav ul");
  if (!nav) return;
  const current = getCurrentUser();
  nav.querySelectorAll(".login-link,.signup-link,.user-node,.profile-link").forEach(n => n.closest("li")?.remove());

  if (current) {
    const liProfile = document.createElement("li");
    liProfile.innerHTML = `<a class="profile-link" href="profile.html" style="color:var(--cyan-hi)">⬡ Profile</a>`;
    nav.appendChild(liProfile);

    const liLogout = document.createElement("li");
    liLogout.className = "user-node";
    liLogout.innerHTML = `<a href="#" id="logout-link" class="btn ghost" style="font-size:13px;padding:7px 14px">Logout</a>`;
    nav.appendChild(liLogout);

    const logout = document.querySelector("#logout-link");
    if (logout) {
      logout.addEventListener("click", e => {
        e.preventDefault();
        setCurrentUserEmail(null);
        showToast("Logged out successfully");
        setTimeout(() => window.location.href = "index.html", 500);
      });
    }
  } else {
    const liLogin = document.createElement("li");
    liLogin.innerHTML = `<a class="login-link" href="login.html">Login</a>`;
    nav.appendChild(liLogin);

    const liSignup = document.createElement("li");
    liSignup.innerHTML = `<a class="signup-link" href="signup.html">Sign Up</a>`;
    nav.appendChild(liSignup);
  }
}

// ─── Cart ────────────────────────────────────────────────────
function getCart() {
  const user = getCurrentUser();
  if (user) { user.cart = user.cart || []; return user.cart; }
  return getJSON(cartKeyGlobal, []);
}
function saveCart(cart) {
  const users = getUsers();
  const currentEmail = getCurrentUserEmail();
  if (currentEmail) {
    const idx = users.findIndex(u => u.email === currentEmail);
    if (idx >= 0) { users[idx].cart = cart; saveUsers(users); }
    else { users.push({ email: currentEmail, password: "", cart }); saveUsers(users); }
  } else {
    setJSON(cartKeyGlobal, cart);
  }
  updateCartCount();
}
function updateCartCount() {
  const countEl = document.querySelector("#cart-count");
  if (!countEl) return;
  const total = (getCart() || []).reduce((s, i) => s + (i.quantity || 0), 0);
  countEl.textContent = total;
  // Animate pop
  countEl.closest("a")?.classList.remove("cart-pop");
  requestAnimationFrame(() => countEl.closest("a")?.classList.add("cart-pop"));
  setTimeout(() => countEl.closest("a")?.classList.remove("cart-pop"), 600);
}

// ─── Products ────────────────────────────────────────────────
async function fetchProducts() {
  try {
    const res = await fetch("https://fakestoreapi.com/products?limit=16");
    if (!res.ok) throw new Error("Network error");
    const products = await res.json();
    setJSON(productsCacheKey, products);
    return products;
  } catch {
    const cached = getJSON(productsCacheKey, null);
    if (cached) return cached;
    return [{ id:101, title:"Demo Gadget", price:29.99, description:"Demo product", image:"" }];
  }
}

function renderProducts(products) {
  const grid = document.querySelector("#products-grid");
  if (!grid) return;
  grid.innerHTML = "";
  const current = getCurrentUser();

  products.forEach((p, i) => {
    const card = document.createElement("article");
    card.className = "card";
    card.style.animationDelay = `${i * 0.05}s`;
    const disabledAttr = current ? "" : `disabled aria-disabled="true"`;
    const addText = current ? "Add to cart" : "Sign in to add";
    card.innerHTML = `
      <div class="card-media">
        <img
          src="${p.image || 'https://via.placeholder.com/400x300?text=No+Image'}"
          alt="${escapeHtml(p.title)}"
          loading="lazy"
        />
      </div>
      <div class="card-body">
        <h3>${escapeHtml(p.title)}</h3>
        <p class="price">$${(p.price || 0).toFixed(2)}</p>
        <p class="muted small">${escapeHtml((p.description || "").slice(0, 80))}${(p.description || "").length > 80 ? "…" : ""}</p>
        <div class="card-actions">
          <button class="btn add-to-cart"
            data-id="${p.id}"
            data-title="${escapeAttr(p.title)}"
            data-price="${p.price}"
            data-image="${escapeAttr(p.image || '')}"
            ${disabledAttr}
          >${addText}</button>
          <button class="btn ghost view-details" data-id="${p.id}">Details</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ─── Escape helpers ──────────────────────────────────────────
function escapeHtml(s) {
  if (!s) return "";
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}
function escapeAttr(s) {
  if (!s) return "";
  return String(s).replace(/"/g,"&quot;");
}

// ─── Modal ───────────────────────────────────────────────────
function openProductModal(product) {
  const modal   = document.querySelector("#product-modal");
  const content = document.querySelector("#modal-content");
  if (!modal || !content) return;
  content.innerHTML = `
    <img src="${product.image || 'https://via.placeholder.com/320x240'}" alt="${escapeHtml(product.title)}" />
    <h3 id="modal-title">${escapeHtml(product.title)}</h3>
    <p class="price">$${(product.price||0).toFixed(2)}</p>
    <p>${escapeHtml(product.description || "")}</p>
    <div style="display:flex;gap:10px;margin-top:4px">
      <button class="btn add-to-cart"
        data-id="${product.id}"
        data-title="${escapeAttr(product.title)}"
        data-price="${product.price}"
        data-image="${escapeAttr(product.image || '')}"
      >Add to cart</button>
      <button class="btn ghost" id="modal-close-cta">Close</button>
    </div>
  `;
  modal.classList.add("show");
  modal.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
  modal.querySelector(".modal-close")?.focus();
}
function closeModal() {
  const modal = document.querySelector("#product-modal");
  if (modal) { modal.classList.remove("show"); modal.setAttribute("aria-hidden","true"); }
  document.body.style.overflow = "";
}

// ─── Cart page ───────────────────────────────────────────────
function renderCartPage() {
  const cartItemsEl = document.querySelector("#cart-items");
  const cartEmptyEl = document.querySelector("#cart-empty");
  const summaryEl   = document.querySelector("#cart-summary");
  const subtotalEl  = document.querySelector("#cart-subtotal");
  const shippingEl  = document.querySelector("#cart-shipping");
  const totalEl     = document.querySelector("#cart-total");
  if (!cartItemsEl) return;

  const cart = getCart();
  cartItemsEl.innerHTML = "";

  if (!getCurrentUser()) {
    if (cartEmptyEl) cartEmptyEl.innerHTML = `Please <a href="login.html" class="link">login</a> or <a href="signup.html" class="link">sign up</a> to view your cart.`;
    if (summaryEl) summaryEl.style.display = "none";
    return;
  }
  if (cart.length === 0) {
    if (cartEmptyEl) cartEmptyEl.innerHTML = `Your cart is empty. <a href="index.html#products" class="link">Browse products →</a>`;
    if (summaryEl) summaryEl.style.display = "none";
    return;
  }

  if (cartEmptyEl) cartEmptyEl.textContent = "";
  if (summaryEl) summaryEl.style.display = "block";

  let subtotal = 0;
  cart.forEach((item, i) => {
    subtotal += (item.price||0) * (item.quantity||1);
    const row = document.createElement("div");
    row.className = "cart-row";
    row.style.animationDelay = `${i * 0.06}s`;
    row.innerHTML = `
      <img src="${item.image||'https://via.placeholder.com/160x120'}" alt="${escapeHtml(item.name)}" />
      <div style="flex:1;min-width:0">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap">
          <strong>${escapeHtml(item.name)}</strong>
          <button class="btn ghost remove" data-id="${item.id}" style="flex-shrink:0">Remove</button>
        </div>
        <div style="margin-top:10px;display:flex;gap:12px;align-items:center;flex-wrap:wrap">
          <label style="font-size:12px;color:var(--muted);letter-spacing:.06em;text-transform:uppercase">Qty
            <input type="number" min="1" class="qty-input" data-id="${item.id}" value="${item.quantity}" />
          </label>
          <div style="margin-left:auto;font-family:var(--font-mono);font-size:18px;color:var(--cyan-hi);font-weight:600">
            $${((item.price||0)*item.quantity).toFixed(2)}
          </div>
        </div>
      </div>
    `;
    cartItemsEl.appendChild(row);
  });

  const shipping = subtotal > 150 ? 0 : defaultShipping;
  const total    = subtotal + shipping;
  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  if (shippingEl) shippingEl.textContent = subtotal > 150 ? "Free" : `$${shipping.toFixed(2)}`;
  if (totalEl)    totalEl.textContent    = `$${total.toFixed(2)}`;

  cartItemsEl.querySelectorAll(".qty-input").forEach(input => {
    input.addEventListener("change", e => {
      const id = e.target.getAttribute("data-id");
      let qty = parseInt(e.target.value) || 1;
      if (qty < 1) qty = 1;
      const c = getCart();
      const item = c.find(it => String(it.id) === String(id));
      if (item) { item.quantity = qty; saveCart(c); renderCartPage(); showToast(`Quantity updated`); }
    });
  });

  cartItemsEl.querySelectorAll(".remove").forEach(btn => {
    btn.addEventListener("click", () => {
      const id   = btn.getAttribute("data-id");
      const before = getCart();
      const item   = before.find(it => String(it.id) === String(id));
      saveCart(before.filter(it => String(it.id) !== String(id)));
      showToast(`${item ? item.name : "Item"} removed`);
      renderCartPage();
    });
  });
}

// ─── Add to cart ─────────────────────────────────────────────
function addItemToCartByProduct(product, qty = 1) {
  if (!product) return;
  const cart     = getCart();
  const existing = cart.find(it => String(it.id) === String(product.id));
  if (existing) { existing.quantity = (existing.quantity||0) + qty; }
  else { cart.push({ id: product.id, name: product.title||product.name||"Product", price: product.price||0, image: product.image||"", quantity: qty }); }
  saveCart(cart);
  showToast(`${product.title||product.name} added to cart 🛒`);
}

// ─── Orders ──────────────────────────────────────────────────
function createOrder(method, meta = {}) {
  const user = getCurrentUser();
  if (!user) return null;
  const cart = getCart();
  if (!cart || cart.length === 0) return null;
  const subtotal = cart.reduce((s,i) => s + (i.price||0)*(i.quantity||1), 0);
  const shipping = subtotal > 150 ? 0 : defaultShipping;
  const total    = subtotal + shipping;
  const order    = { id: "ORD-"+Date.now(), items: JSON.parse(JSON.stringify(cart)), subtotal, shipping, total, method, meta, status:"pending", createdAt: Date.now() };
  user.orders = user.orders || [];
  user.orders.push(order);
  const users = getUsers(); const idx = users.findIndex(u => u.email === user.email);
  if (idx >= 0) { users[idx] = user; saveUsers(users); }
  return order;
}
function markOrderPaid(orderId, note) {
  const user = getCurrentUser(); if (!user) return;
  user.orders = user.orders || [];
  const ord = user.orders.find(o => o.id === orderId);
  if (ord) {
    ord.status = "paid"; ord.paidAt = Date.now(); ord.note = note||"";
    const users = getUsers(); const idx = users.findIndex(u => u.email === user.email);
    if (idx >= 0) { user.cart = []; users[idx] = user; saveUsers(users); }
    updateCartCount();
    return ord;
  }
}

// ─── Pending add ─────────────────────────────────────────────
function savePendingAdd(obj) { sessionStorage.setItem("pendingAdd", JSON.stringify(obj)); }
function getPendingAdd()     { try { return JSON.parse(sessionStorage.getItem("pendingAdd")); } catch { return null; } }
function clearPendingAdd()   { sessionStorage.removeItem("pendingAdd"); }

// ─── Intersection observer for scroll reveals ────────────────
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".card, .pay-card, .about-grid > *, .contact-form").forEach(el => {
    el.classList.add("reveal-on-scroll");
    observer.observe(el);
  });
}

// ─── Mobile nav ──────────────────────────────────────────────
function initMobileNav() {
  const toggle = document.querySelector("#nav-toggle");
  const nav    = document.querySelector("#site-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", !open);
    nav.classList.toggle("open", !open);
  });
  // Close on outside click
  document.addEventListener("click", e => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded","false");
    }
  });
}

// ─── Sticky header shadow ────────────────────────────────────
function initHeaderScroll() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 40);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
}

// ─── DOM ready ───────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  const yearEl = document.querySelector("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  updateAuthUI();
  updateCartCount();
  initMobileNav();
  initHeaderScroll();

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
      const href = this.getAttribute("href");
      if (href === "#") return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  });

  // ─── Products page ───────────────────────────────────────
  const productsGrid = document.querySelector("#products-grid");
  if (productsGrid) {
    // Clear skeletons and fetch
    const products = await fetchProducts();
    renderProducts(products);
    initScrollReveal();
  }

  // ─── Event delegation ────────────────────────────────────
  document.body.addEventListener("click", e => {

    // Add to cart
    if (e.target.matches(".add-to-cart")) {
      const btn = e.target;
      if (btn.disabled || btn.getAttribute("aria-disabled") === "true") return;
      const id    = btn.dataset.id;
      const title = btn.dataset.title || "Product";
      const price = parseFloat(btn.dataset.price) || 0;
      const image = btn.dataset.image || "";

      if (!getCurrentUser()) {
        savePendingAdd({ id, title, price, image });
        showToast("Please sign in to add items to cart", "info");
        setTimeout(() => window.location.href = "login.html", 800);
        return;
      }

      const products = getJSON(productsCacheKey, []);
      const prod     = products.find(p => String(p.id) === String(id));
      addItemToCartByProduct(prod || { id, title, price, image }, 1);

      // Button feedback
      const orig = btn.textContent;
      btn.textContent = "✓ Added";
      btn.style.background = "linear-gradient(135deg, #00e5a0, #00bfa5)";
      setTimeout(() => {
        btn.textContent = orig;
        btn.style.background = "";
      }, 1400);
    }

    // View details
    if (e.target.matches(".view-details") || e.target.closest(".view-details")) {
      const el  = e.target.matches(".view-details") ? e.target : e.target.closest(".view-details");
      const id  = el.dataset.id;
      const products = getJSON(productsCacheKey, []);
      const product  = products.find(p => String(p.id) === String(id));
      if (product) openProductModal(product);
    }

    // Modal close
    if (e.target.matches(".modal-close") || e.target.matches("#modal-close-cta")) closeModal();
    if (e.target.matches(".modal") && !e.target.matches(".modal-panel")) closeModal();
  });

  // Escape key closes modal
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
  });

  // ─── Cart page ───────────────────────────────────────────
  if (document.querySelector(".cart-page")) {
    renderCartPage();
    const proceedBtn = document.querySelector("#proceed-pay");
    if (proceedBtn) {
      proceedBtn.addEventListener("click", () => {
        if (!getCurrentUser()) { showToast("Please login to proceed", "error"); setTimeout(() => window.location.href = "login.html", 700); return; }
        const cart = getCart();
        if (!cart || cart.length === 0) { showToast("Your cart is empty", "error"); return; }
        window.location.href = "pay.html";
      });
    }
  }

  // ─── Pay page ────────────────────────────────────────────
  if (document.querySelector(".pay-page")) {
    const payStatus = document.querySelector("#pay-status");

    const setPayStatus = (msg) => { if (payStatus) { payStatus.textContent = msg; } };

    const bankForm = document.querySelector("#bank-form");
    if (bankForm) bankForm.addEventListener("submit", e => {
      e.preventDefault();
      const name = document.querySelector("#bank-name").value.trim();
      const ref  = document.querySelector("#bank-ref").value.trim();
      if (!name || !ref) { showToast("Enter bank name and reference", "error"); return; }
      const order = createOrder("bank", { bankName: name, reference: ref });
      if (order) {
        showToast("Transfer submitted — confirming…", "info");
        setPayStatus("⏳ Bank transfer recorded. Awaiting confirmation…");
        setTimeout(() => {
          markOrderPaid(order.id, "Bank transfer auto-confirmed");
          setPayStatus("✅ Bank transfer confirmed — order paid!");
          showToast("Order confirmed and paid ✅");
          setTimeout(() => window.location.href = "profile.html", 1400);
        }, 1800);
      }
    });

    const cryptoForm = document.querySelector("#crypto-form");
    if (cryptoForm) cryptoForm.addEventListener("submit", e => {
      e.preventDefault();
      const network = document.querySelector("#crypto-network").value.trim();
      const hash    = document.querySelector("#crypto-hash").value.trim();
      if (!network || !hash) { showToast("Enter network and tx hash", "error"); return; }
      const order = createOrder("crypto", { network, txHash: hash });
      if (order) {
        showToast("Tx recorded — confirming on-chain…", "info");
        setPayStatus(`⏳ Waiting for on-chain confirmations on ${network}…`);
        setTimeout(() => {
          markOrderPaid(order.id, `Tx ${hash} on ${network}`);
          setPayStatus("✅ Transaction confirmed — order paid!");
          showToast("Crypto payment confirmed ✅");
          setTimeout(() => window.location.href = "profile.html", 1400);
        }, 2000);
      }
    });

    const paypalForm = document.querySelector("#paypal-form");
    if (paypalForm) paypalForm.addEventListener("submit", e => {
      e.preventDefault();
      const email = document.querySelector("#paypal-email").value.trim();
      if (!email) { showToast("Enter your PayPal email", "error"); return; }
      const order = createOrder("paypal", { paypalEmail: email });
      if (order) {
        showToast("Connecting to PayPal…", "info");
        setPayStatus("⏳ Redirecting to PayPal…");
        setTimeout(() => {
          markOrderPaid(order.id, `PayPal: ${email}`);
          setPayStatus("✅ PayPal payment successful — order paid!");
          showToast("PayPal payment successful ✅");
          setTimeout(() => window.location.href = "profile.html", 1200);
        }, 1400);
      }
    });
  }

  // ─── Login ───────────────────────────────────────────────
  const loginForm = document.querySelector("#login-form");
  if (loginForm) {
    const emailInput    = loginForm.querySelector("#email");
    const passwordInput = loginForm.querySelector("#password");
    const status        = document.querySelector("#login-status");
    const pwdToggle     = document.querySelector("#pwd-toggle");

    if (pwdToggle && passwordInput) {
      pwdToggle.addEventListener("click", () => {
        const show = passwordInput.type === "password";
        passwordInput.type = show ? "text" : "password";
        pwdToggle.textContent = show ? "Hide" : "Show";
      });
    }

    loginForm.addEventListener("submit", e => {
      e.preventDefault();
      const email    = emailInput.value.trim();
      const password = passwordInput.value.trim();
      const emailRx  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRx.test(email)) { if (status) status.textContent = "Enter a valid email."; showToast("Enter a valid email", "error"); return; }
      if (password.length < 6) { if (status) status.textContent = "Password must be ≥ 6 characters."; showToast("Password must be ≥ 6 characters", "error"); return; }
      const users = getUsers();
      const found = users.find(u => u.email === email && u.password === password);
      if (!found && !(email === "demo@demo.com" && password === "password")) {
        if (status) status.textContent = "Invalid credentials.";
        showToast("Invalid credentials", "error");
        return;
      }
      setCurrentUserEmail(email);
      if (status) status.textContent = "Login successful ✓";
      showToast("Welcome back! 🔐");
      const pending = getPendingAdd();
      if (pending) {
        const products = getJSON(productsCacheKey, []);
        const prod     = products.find(p => String(p.id) === String(pending.id));
        addItemToCartByProduct(prod || pending, 1);
        clearPendingAdd();
        setTimeout(() => window.location.href = "cart.html", 900);
        return;
      }
      setTimeout(() => window.location.href = "index.html", 900);
    });
  }

  // ─── Signup ──────────────────────────────────────────────
  const signupForm = document.querySelector("#signup-form");
  if (signupForm) {
    const emailInput    = signupForm.querySelector("#s-email");
    const passwordInput = signupForm.querySelector("#s-password");
    const status        = document.querySelector("#signup-status");
    const sPwdToggle    = document.querySelector("#s-pwd-toggle");

    if (sPwdToggle && passwordInput) {
      sPwdToggle.addEventListener("click", () => {
        const show = passwordInput.type === "password";
        passwordInput.type = show ? "text" : "password";
        sPwdToggle.textContent = show ? "Hide" : "Show";
      });
    }

    signupForm.addEventListener("submit", e => {
      e.preventDefault();
      const email    = emailInput.value.trim();
      const password = passwordInput.value.trim();
      const emailRx  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRx.test(email)) { if (status) status.textContent = "Enter a valid email."; showToast("Enter a valid email", "error"); return; }
      if (password.length < 6) { if (status) status.textContent = "Password must be ≥ 6 characters."; showToast("Password must be ≥ 6 characters", "error"); return; }
      const users = getUsers();
      if (users.find(u => u.email === email)) { if (status) status.textContent = "Email already registered."; showToast("Email already registered", "error"); return; }
      const newUser = { email, password, createdAt: Date.now(), cart: [], orders: [] };
      users.push(newUser); saveUsers(users);
      setCurrentUserEmail(email);
      if (status) status.textContent = "Account created! Redirecting…";
      showToast("Account created 🎉");
      const pending = getPendingAdd();
      if (pending) {
        const products = getJSON(productsCacheKey, []);
        const prod     = products.find(p => String(p.id) === String(pending.id));
        addItemToCartByProduct(prod || pending, 1);
        clearPendingAdd();
        setTimeout(() => window.location.href = "cart.html", 900);
        return;
      }
      setTimeout(() => window.location.href = "index.html", 900);
    });
  }

  // ─── Profile ─────────────────────────────────────────────
  if (document.querySelector(".profile-page")) {
    const user = getCurrentUser();
    if (!user) { showToast("Please login to view your profile", "error"); setTimeout(() => window.location.href = "login.html", 700); return; }

    const emailEl  = document.querySelector("#profile-email");
    const joinedEl = document.querySelector("#profile-joined");
    const ordersList = document.querySelector("#orders-list");

    if (emailEl) emailEl.textContent = user.email;
    if (joinedEl) joinedEl.textContent = "Member since " + new Date(user.createdAt).toLocaleDateString(undefined, { year:"numeric", month:"long", day:"numeric" });

    function renderOrders() {
      if (!ordersList) return;
      ordersList.innerHTML = "";
      const orders = (user.orders || []).slice().reverse();
      if (orders.length === 0) {
        ordersList.innerHTML = `<p class="muted" style="padding:16px 0">No orders yet. <a href="index.html#products" class="link">Start shopping →</a></p>`;
        return;
      }
      orders.forEach(o => {
        const div = document.createElement("div");
        div.className = "order-item";
        const statusColor = o.status === "paid" ? "var(--emerald)" : "var(--gold)";
        div.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
            <strong>${o.id}</strong>
            <span style="font-size:12px;font-weight:700;color:${statusColor};letter-spacing:.06em;text-transform:uppercase;background:rgba(0,229,160,0.08);padding:3px 10px;border-radius:99px;border:1px solid ${statusColor}33">${o.status}</span>
          </div>
          <div class="muted small" style="margin-top:4px">
            ${new Date(o.createdAt).toLocaleString()} &bull; ${o.method} &bull; <strong style="color:rgba(200,230,255,0.8)">$${o.total.toFixed(2)}</strong>
          </div>
        `;
        ordersList.appendChild(div);
      });
    }
    renderOrders();

    const passForm = document.querySelector("#profile-password-form");
    if (passForm) {
      passForm.addEventListener("submit", e => {
        e.preventDefault();
        const newPass = document.querySelector("#profile-new-password").value.trim();
        if (newPass.length < 6) { document.querySelector("#profile-pass-status").textContent = "Password must be ≥ 6 characters."; showToast("Password must be ≥ 6 characters", "error"); return; }
        const users = getUsers(); const idx = users.findIndex(u => u.email === user.email);
        if (idx >= 0) { users[idx].password = newPass; saveUsers(users); showToast("Password updated ✓"); document.querySelector("#profile-pass-status").textContent = "Password updated successfully."; }
      });
    }

    const logoutBtn = document.querySelector("#logout-btn");
    if (logoutBtn) logoutBtn.addEventListener("click", () => { setCurrentUserEmail(null); showToast("Logged out"); setTimeout(() => window.location.href = "index.html", 600); });
  }

  // ─── Contact ─────────────────────────────────────────────
  const contactForm = document.querySelector("#contact-form");
  if (contactForm) {
    const status = document.querySelector("#contact-status");
    contactForm.addEventListener("submit", e => {
      e.preventDefault();
      if (status) status.textContent = "Message sent — we'll get back to you soon!";
      showToast("Message sent ✓", "info");
      contactForm.reset();
    });
  }

  // Scroll reveal for non-products pages
  if (!productsGrid) initScrollReveal();

  // Storage sync across tabs
  window.addEventListener("storage", () => { updateAuthUI(); updateCartCount(); });
  if (document.querySelector(".cart-page")) window.addEventListener("storage", renderCartPage);
});
