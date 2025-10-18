// Centralized script for auth, products, per-user cart, payments, profile and UI

const cartKeyGlobal = "cartItems_v1";       // legacy / fallback
const usersKey = "users_v3";                // persisted users with carts and orders
const currentUserKey = "currentUserEmail";  // stores signed-in email
const productsCacheKey = "productsCache_v1";
const defaultShipping = 5.0;

// ---------- Helpers ----------
function getJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}
function setJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type === "error" ? "error" : "info"}`;
  toast.innerText = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ---------- Users / Session ----------
function getUsers() {
  return getJSON(usersKey, []);
}
function saveUsers(users) {
  setJSON(usersKey, users);
}
function getCurrentUserEmail() {
  return localStorage.getItem(currentUserKey) || null;
}
function setCurrentUserEmail(email) {
  if (email) localStorage.setItem(currentUserKey, email);
  else localStorage.removeItem(currentUserKey);
  updateAuthUI();
}
function getCurrentUser() {
  const email = getCurrentUserEmail();
  if (!email) return null;
  const users = getUsers();
  return users.find(u => u.email === email) || null;
}
function updateAuthUI() {
  const nav = document.querySelector(".site-nav ul");
  if (!nav) return;
  const current = getCurrentUser();
  // cleanup
  nav.querySelectorAll('.login-link, .signup-link, .user-node, .profile-link').forEach(n => n.remove());

  if (current) {
    const liProfile = document.createElement('li');
    liProfile.className = 'profile-link';
    liProfile.innerHTML = `<a href="profile.html">Profile</a>`;
    nav.appendChild(liProfile);

    const li = document.createElement("li");
    li.className = "user-node";
    li.innerHTML = `<span style="padding:.4rem .6rem;border-radius:8px;background:rgba(0,0,0,0.03)">${escapeHtml(current.email)}</span> <a href="#" id="logout-link" class="link small" style="margin-left:.5rem">Logout</a>`;
    nav.appendChild(li);
    const logout = document.querySelector("#logout-link");
    if (logout) {
      logout.addEventListener("click", (e) => {
        e.preventDefault();
        setCurrentUserEmail(null);
        showToast("Logged out");
        setTimeout(() => window.location.href = "index.html", 400);
      });
    }
  } else {
    const liLogin = document.createElement("li");
    liLogin.innerHTML = `<a class="login-link" href="login.html">Login</a>`;
    liLogin.className = "login-link";
    nav.appendChild(liLogin);
    const liSignup = document.createElement("li");
    liSignup.innerHTML = `<a class="signup-link" href="signup.html">Sign Up</a>`;
    liSignup.className = "signup-link";
    nav.appendChild(liSignup);
  }
}

// ---------- Cart (per-user) ----------
function getCart() {
  const user = getCurrentUser();
  if (user) {
    user.cart = user.cart || [];
    return user.cart;
  }
  return getJSON(cartKeyGlobal, []);
}
function saveCart(cart) {
  const users = getUsers();
  const currentEmail = getCurrentUserEmail();
  if (currentEmail) {
    const userIndex = users.findIndex(u => u.email === currentEmail);
    if (userIndex >= 0) {
      users[userIndex].cart = cart;
      saveUsers(users);
    } else {
      users.push({ email: currentEmail, password: "", cart });
      saveUsers(users);
    }
  } else {
    setJSON(cartKeyGlobal, cart);
  }
  updateCartCount();
}
function updateCartCount() {
  const countEl = document.querySelector("#cart-count");
  const cart = getCart() || [];
  const totalCount = cart.reduce((s, i) => s + (i.quantity || 0), 0);
  if (countEl) countEl.innerText = totalCount;
}

// ---------- Products ----------
async function fetchProducts() {
  try {
    const res = await fetch("https://fakestoreapi.com/products?limit=16");
    if (!res.ok) throw new Error("Network error");
    const products = await res.json();
    setJSON(productsCacheKey, products);
    return products;
  } catch (err) {
    const cached = getJSON(productsCacheKey, null);
    if (cached) return cached;
    return [{ id: 101, title: "Demo Gadget", price: 29.99, description: "Demo product", image: "" }];
  }
}
function renderProducts(products) {
  const grid = document.querySelector("#products-grid");
  if (!grid) return;
  grid.innerHTML = "";
  const current = getCurrentUser();
  products.forEach(p => {
    const card = document.createElement("article");
    card.className = "card";
    const disabledAttr = current ? "" : 'disabled aria-disabled="true"';
    const addText = current ? "Add to cart" : "Sign in to add";
    card.innerHTML = `
      <div class="card-media"><img src="${p.image || 'https://via.placeholder.com/400x300?text=No+Image'}" alt="${escapeHtml(p.title)}" /></div>
      <div class="card-body">
        <h3>${escapeHtml(p.title)}</h3>
        <p class="price">$${(p.price || 0).toFixed(2)}</p>
        <p class="muted small" style="margin:0.25rem 0 0.5rem">${escapeHtml((p.description || '').slice(0, 80))}${(p.description && p.description.length>80)?'...':''}</p>
        <div class="card-actions">
          <button class="btn add-to-cart" data-id="${p.id}" data-title="${escapeAttr(p.title)}" data-price="${p.price}" data-image="${escapeAttr(p.image || '')}" ${disabledAttr}>${addText}</button>
          <button class="btn ghost view-details" data-id="${p.id}">Details</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ---------- Escape helpers ----------
function escapeHtml(s) {
  if (!s) return "";
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeAttr(s) {
  if (!s) return "";
  return String(s).replace(/"/g, "&quot;");
}

// ---------- Modal ----------
function openProductModal(product) {
  const modal = document.querySelector("#product-modal");
  const content = document.querySelector("#modal-content");
  if (!modal || !content) return;
  content.innerHTML = `
    <img src="${product.image || 'https://via.placeholder.com/320x240'}" alt="${escapeHtml(product.title)}" />
    <h3 id="modal-title">${escapeHtml(product.title)}</h3>
    <p class="price">$${(product.price||0).toFixed(2)}</p>
    <p>${escapeHtml(product.description || "")}</p>
    <div style="margin-top:.5rem">
      <button class="btn add-to-cart" data-id="${product.id}" data-title="${escapeAttr(product.title)}" data-price="${product.price}" data-image="${escapeAttr(product.image || '')}">Add to cart</button>
      <button class="btn ghost" id="modal-close-cta">Close</button>
    </div>
  `;
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  const closeBtn = modal.querySelector(".modal-close");
  if (closeBtn) closeBtn.focus();
}

// ---------- Cart page rendering ----------
function renderCartPage() {
  const cartItemsEl = document.querySelector("#cart-items");
  const cartEmptyEl = document.querySelector("#cart-empty");
  const summaryEl = document.querySelector("#cart-summary");
  const subtotalEl = document.querySelector("#cart-subtotal");
  const shippingEl = document.querySelector("#cart-shipping");
  const totalEl = document.querySelector("#cart-total");

  if (!cartItemsEl) return;

  const cart = getCart();
  cartItemsEl.innerHTML = "";

  if (!getCurrentUser()) {
    if (cartEmptyEl) cartEmptyEl.innerHTML = `Please <a href="login.html">login</a> or <a href="signup.html">sign up</a> to view your cart.`;
    if (summaryEl) summaryEl.style.display = "none";
    return;
  }

  if (cart.length === 0) {
    if (cartEmptyEl) cartEmptyEl.innerText = "Your cart is empty.";
    if (summaryEl) summaryEl.style.display = "none";
    return;
  } else {
    if (cartEmptyEl) cartEmptyEl.innerText = "";
    if (summaryEl) summaryEl.style.display = "block";
  }

  let subtotal = 0;
  cart.forEach(item => {
    subtotal += (item.price || 0) * (item.quantity || 1);
    const row = document.createElement("div");
    row.className = "cart-row";
    row.innerHTML = `
      <img src="${item.image || 'https://via.placeholder.com/160x120'}" alt="${escapeHtml(item.name)}" />
      <div style="flex:1">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong>${escapeHtml(item.name)}</strong>
          <button class="remove btn ghost" data-id="${item.id}">Remove</button>
        </div>
        <div style="margin-top:.5rem;display:flex;gap:.5rem;align-items:center">
          <label>Qty
            <input type="number" min="1" class="qty-input" data-id="${item.id}" value="${item.quantity}" />
          </label>
          <div style="margin-left:auto"><strong>$${((item.price||0)*item.quantity).toFixed(2)}</strong></div>
        </div>
      </div>
    `;
    cartItemsEl.appendChild(row);
  });

  const shipping = subtotal > 150 ? 0 : defaultShipping;
  const total = subtotal + shipping;

  if (subtotalEl) subtotalEl.innerText = `$${subtotal.toFixed(2)}`;
  if (shippingEl) shippingEl.innerText = `$${shipping.toFixed(2)}`;
  if (totalEl) totalEl.innerText = `$${total.toFixed(2)}`;

  // Qty change
  cartItemsEl.querySelectorAll(".qty-input").forEach(input => {
    input.addEventListener("change", e => {
      const id = e.target.getAttribute("data-id");
      let qty = parseInt(e.target.value) || 1;
      if (qty < 1) qty = 1;
      const cart = getCart();
      const item = cart.find(it => String(it.id) === String(id));
      if (item) {
        item.quantity = qty;
        saveCart(cart);
        renderCartPage();
        showToast(`${item.name} quantity updated`);
      }
    });
  });
  // Remove
  cartItemsEl.querySelectorAll(".remove").forEach(btn => {
    btn.addEventListener("click", e => {
      const id = btn.getAttribute("data-id");
      const before = getCart();
      const item = before.find(it => String(it.id) === String(id));
      const newCart = before.filter(it => String(it.id) !== String(id));
      saveCart(newCart);
      showToast(`${item ? item.name : "Item"} removed`, "info");
      renderCartPage();
    });
  });
}

// ---------- Add to cart helper ----------
function addItemToCartByProduct(product, qty = 1) {
  if (!product) return;
  const cart = getCart();
  const existing = cart.find(it => String(it.id) === String(product.id));
  if (existing) {
    existing.quantity = (existing.quantity || 0) + qty;
  } else {
    cart.push({
      id: product.id,
      name: product.title || product.name || "Product",
      price: product.price || 0,
      image: product.image || '',
      quantity: qty
    });
  }
  saveCart(cart);
  showToast(`${product.title || product.name} added to cart 🛒`);
}

// ---------- Orders ----------
function createOrder(method, meta = {}) {
  const user = getCurrentUser();
  if (!user) return null;
  const cart = getCart();
  if (!cart || cart.length === 0) return null;
  const subtotal = cart.reduce((s,i) => s + (i.price||0)*(i.quantity||1), 0);
  const shipping = subtotal > 150 ? 0 : defaultShipping;
  const total = subtotal + shipping;
  const order = {
    id: 'ORD-' + Date.now(),
    items: JSON.parse(JSON.stringify(cart)),
    subtotal, shipping, total,
    method, meta, status: 'pending', createdAt: Date.now()
  };
  user.orders = user.orders || [];
  user.orders.push(order);
  // persist users
  const users = getUsers();
  const idx = users.findIndex(u => u.email === user.email);
  if (idx >= 0) { users[idx] = user; saveUsers(users); }
  return order;
}
function markOrderPaid(orderId, note) {
  const user = getCurrentUser();
  if (!user) return;
  user.orders = user.orders || [];
  const ord = user.orders.find(o => o.id === orderId);
  if (ord) {
    ord.status = 'paid';
    ord.paidAt = Date.now();
    ord.note = note || '';
    const users = getUsers();
    const idx = users.findIndex(u => u.email === user.email);
    if (idx >= 0) { users[idx] = user; saveUsers(users); }
    // clear cart
    user.cart = [];
    users[idx] = user; saveUsers(users);
    updateCartCount();
    return ord;
  }
  return null;
}

// ---------- Pending add handling ----------
function savePendingAdd(obj) { sessionStorage.setItem("pendingAdd", JSON.stringify(obj)); }
function getPendingAdd() { try { return JSON.parse(sessionStorage.getItem("pendingAdd")); } catch { return null; } }
function clearPendingAdd() { sessionStorage.removeItem("pendingAdd"); }

// ---------- DOM ready ----------
document.addEventListener("DOMContentLoaded", async () => {
  const yearEl = document.querySelector("#year"); if (yearEl) yearEl.textContent = new Date().getFullYear();
  updateAuthUI(); updateCartCount();

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  window.addEventListener("scroll", () => {
    const nav = document.querySelector("nav"); if (!nav) return;
    if (window.scrollY > 50) nav.classList.add("scrolled"); else nav.classList.remove("scrolled");
  });

  const productsGrid = document.querySelector("#products-grid");
  if (productsGrid) {
    const products = await fetchProducts();
    renderProducts(products);
  }

  document.body.addEventListener("click", (e) => {
    if (e.target.matches(".add-to-cart")) {
      const btn = e.target; const id = btn.getAttribute("data-id"); const title = btn.getAttribute("data-title") || btn.getAttribute("data-name") || "Product"; const price = parseFloat(btn.getAttribute("data-price")) || 0; const image = btn.getAttribute("data-image") || '';
      const currentUser = getCurrentUser();
      if (!currentUser) {
        savePendingAdd({ id, title, price, image });
        showToast("Please sign up or login to add items to your cart", "info");
        setTimeout(() => window.location.href = "login.html", 700);
        return;
      }
      const products = getJSON(productsCacheKey, []);
      const prod = (products || []).find(p => String(p.id) === String(id));
      if (prod) addItemToCartByProduct(prod, 1); else addItemToCartByProduct({ id, title, price, image }, 1);
      btn.innerText = "Added"; setTimeout(() => btn.innerText = "Add to cart", 900);
    }

    if (e.target.matches(".view-details") || e.target.closest(".view-details")) {
      const el = e.target.matches(".view-details") ? e.target : e.target.closest(".view-details");
      const id = el.getAttribute("data-id"); const products = getJSON(productsCacheKey, []); const product = (products || []).find(p => String(p.id) === String(id));
      if (product) openProductModal(product);
    }

    if (e.target.matches(".modal-close") || e.target.matches("#modal-close-cta")) {
      const modal = document.querySelector("#product-modal"); if (modal) { modal.classList.remove("show"); modal.setAttribute("aria-hidden", "true"); }
    }
  });

  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { const modal = document.querySelector("#product-modal"); if (modal && modal.classList.contains("show")) { modal.classList.remove("show"); modal.setAttribute("aria-hidden", "true"); } } });

  if (document.querySelector(".cart-page")) { renderCartPage(); const proceedBtn = document.querySelector("#proceed-pay"); if (proceedBtn) { proceedBtn.addEventListener("click", () => { const cart = getCart(); if (!getCurrentUser()) { showToast("Please login to proceed to payment", "error"); setTimeout(() => window.location.href = "login.html", 600); return; } if (!cart || cart.length === 0) { showToast("Your cart is empty", "error"); return; } window.location.href = "pay.html"; }); } }

  if (document.querySelector(".pay-page")) {
    // Bank form
    const bankForm = document.querySelector('#bank-form');
    if (bankForm) bankForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.querySelector('#bank-name').value.trim();
      const ref = document.querySelector('#bank-ref').value.trim();
      if (!name || !ref) { showToast('Enter bank name and reference', 'error'); return; }
      const order = createOrder('bank', { bankName: name, reference: ref });
      if (order) {
        // here we simulate manual confirmation; we'll auto-confirm after delay
        showToast('Bank transfer submitted — awaiting confirmation', 'info');
        document.querySelector('#pay-status').innerText = 'Bank transfer recorded. Waiting for confirmation...';
        setTimeout(() => {
          markOrderPaid(order.id, 'Bank transfer auto-confirmed');
          document.querySelector('#pay-status').innerText = 'Bank transfer confirmed — order paid.';
          showToast('Order confirmed and paid ✅');
          setTimeout(() => window.location.href = 'profile.html', 1200);
        }, 1600);
      }
    });

    // Crypto form
    const cryptoForm = document.querySelector('#crypto-form');
    if (cryptoForm) cryptoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const network = document.querySelector('#crypto-network').value.trim();
      const hash = document.querySelector('#crypto-hash').value.trim();
      if (!network || !hash) { showToast('Enter network and tx hash', 'error'); return; }
      const order = createOrder('crypto', { network, txHash: hash });
      if (order) {
        showToast('Crypto tx recorded — confirming on-chain...', 'info');
        document.querySelector('#pay-status').innerText = 'Waiting for on-chain confirmations...';
        setTimeout(() => {
          markOrderPaid(order.id, `Tx ${hash} on ${network}`);
          document.querySelector('#pay-status').innerText = 'Transaction confirmed — order paid.';
          showToast('Crypto payment confirmed ✅');
          setTimeout(() => window.location.href = 'profile.html', 1200);
        }, 1800);
      }
    });

    // PayPal form
    const paypalForm = document.querySelector('#paypal-form');
    if (paypalForm) paypalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.querySelector('#paypal-email').value.trim();
      if (!email) { showToast('Provide PayPal email', 'error'); return; }
      const order = createOrder('paypal', { paypalEmail: email });
      if (order) {
        showToast('Simulating PayPal flow...', 'info');
        document.querySelector('#pay-status').innerText = 'Redirecting to PayPal...';
        setTimeout(() => {
          markOrderPaid(order.id, `PayPal ${email}`);
          document.querySelector('#pay-status').innerText = 'Payment completed via PayPal — order paid.';
          showToast('PayPal payment successful ✅');
          setTimeout(() => window.location.href = 'profile.html', 1000);
        }, 1200);
      }
    });
  }

  // Login handling
  const loginForm = document.querySelector('#login-form');
  if (loginForm) {
    const emailInput = loginForm.querySelector('#email');
    const passwordInput = loginForm.querySelector('#password');
    const status = document.querySelector('#login-status');
    const pwdToggle = document.querySelector('#pwd-toggle');
    if (pwdToggle && passwordInput) {
      pwdToggle.addEventListener('click', () => { if (passwordInput.type === 'password') { passwordInput.type = 'text'; pwdToggle.innerText = 'Hide'; } else { passwordInput.type = 'password'; pwdToggle.innerText = 'Show'; } });
    }
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) { if (status) status.innerText = 'Enter a valid email!'; showToast('Enter a valid email!', 'error'); return; }
      if (password.length < 6) { if (status) status.innerText = 'Password must be at least 6 characters.'; showToast('Password must be at least 6 characters.', 'error'); return; }
      const users = getUsers();
      const found = users.find(u => u.email === email && u.password === password);
      if (!found && !(email === 'demo@demo.com' && password === 'password')) { if (status) status.innerText = 'Invalid credentials.'; showToast('Invalid credentials.', 'error'); return; }
      setCurrentUserEmail(email);
      if (status) status.innerText = 'Login successful 🔐'; showToast('Login successful 🔐');
      const pending = getPendingAdd();
      if (pending) {
        const products = getJSON(productsCacheKey, []);
        const prod = (products || []).find(p => String(p.id) === String(pending.id));
        if (prod) addItemToCartByProduct(prod, 1); else addItemToCartByProduct({ id: pending.id, title: pending.title, price: pending.price, image: pending.image }, 1);
        clearPendingAdd();
        setTimeout(() => window.location.href = 'cart.html', 900);
        return;
      }
      setTimeout(() => window.location.href = 'index.html', 900);
    });
  }

  // Signup handling
  const signupForm = document.querySelector('#signup-form');
  if (signupForm) {
    const emailInput = signupForm.querySelector('#s-email');
    const passwordInput = signupForm.querySelector('#s-password');
    const status = document.querySelector('#signup-status');
    const sPwdToggle = document.querySelector('#s-pwd-toggle');
    if (sPwdToggle && passwordInput) { sPwdToggle.addEventListener('click', () => { if (passwordInput.type === 'password') { passwordInput.type = 'text'; sPwdToggle.innerText = 'Hide'; } else { passwordInput.type = 'password'; sPwdToggle.innerText = 'Show'; } }); }
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) { if (status) status.innerText = 'Enter a valid email!'; showToast('Enter a valid email!', 'error'); return; }
      if (password.length < 6) { if (status) status.innerText = 'Password must be at least 6 characters.'; showToast('Password must be at least 6 characters.', 'error'); return; }
      const users = getUsers();
      if (users.find(u => u.email === email)) { if (status) status.innerText = 'Email already registered.'; showToast('Email already registered.', 'error'); return; }
      const newUser = { email, password, createdAt: Date.now(), cart: [], orders: [] };
      users.push(newUser); saveUsers(users);
      setCurrentUserEmail(email);
      if (status) status.innerText = 'Account created. Redirecting...'; showToast('Account created 🎉');
      const pending = getPendingAdd();
      if (pending) {
        const products = getJSON(productsCacheKey, []);
        const prod = (products || []).find(p => String(p.id) === String(pending.id));
        if (prod) addItemToCartByProduct(prod, 1); else addItemToCartByProduct({ id: pending.id, title: pending.title, price: pending.price, image: pending.image }, 1);
        clearPendingAdd();
        setTimeout(() => window.location.href = 'cart.html', 900);
        return;
      }
      setTimeout(() => window.location.href = 'index.html', 900);
    });
  }

  // Profile page
  if (document.querySelector('.profile-page')) {
    const user = getCurrentUser();
    if (!user) { showToast('Please login to view profile', 'error'); setTimeout(()=>window.location.href='login.html',600); return; }
    const emailEl = document.querySelector('#profile-email');
    const joinedEl = document.querySelector('#profile-joined');
    const ordersList = document.querySelector('#orders-list');
    if (emailEl) emailEl.innerText = user.email;
    if (joinedEl) joinedEl.innerText = 'Member since ' + new Date(user.createdAt).toLocaleDateString();
    // render orders
    function renderOrders() {
      ordersList.innerHTML = '';
      (user.orders || []).slice().reverse().forEach(o => {
        const div = document.createElement('div');
        div.className = 'order-item';
        div.innerHTML = `<strong>${o.id}</strong> • ${o.status.toUpperCase()} • $${o.total.toFixed(2)} <div class="muted small">${new Date(o.createdAt).toLocaleString()} • ${o.method}</div>`;
        ordersList.appendChild(div);
      });
      if ((user.orders||[]).length===0) ordersList.innerHTML = '<p class="muted">No orders yet.</p>';
    }
    renderOrders();

    // password update
    const passForm = document.querySelector('#profile-password-form');
    if (passForm) {
      passForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newPass = document.querySelector('#profile-new-password').value.trim();
        if (newPass.length < 6) { document.querySelector('#profile-pass-status').innerText = 'Password must be at least 6 characters.'; showToast('Password must be at least 6 characters.', 'error'); return; }
        const users = getUsers();
        const idx = users.findIndex(u => u.email === user.email);
        if (idx >= 0) { users[idx].password = newPass; saveUsers(users); showToast('Password updated'); document.querySelector('#profile-pass-status').innerText = 'Password updated.'; }
      });
    }

    const logoutBtn = document.querySelector('#logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => { setCurrentUserEmail(null); showToast('Logged out'); setTimeout(()=>window.location.href='index.html',500); });
  }

  // Contact
  const contactForm = document.querySelector('#contact-form'); if (contactForm) { const status = document.querySelector('#contact-status'); contactForm.addEventListener('submit',(e)=>{ e.preventDefault(); if (status) status.innerText = "Message sent — we'll get back to you!"; showToast("Message sent — we'll get back to you!", "info"); contactForm.reset(); }); }

  if (document.querySelector('#products-grid')) { const products = getJSON(productsCacheKey,[]); renderProducts(products); }
  if (document.querySelector('.cart-page')) { window.addEventListener('storage', renderCartPage); }
  window.addEventListener('storage', ()=>{ updateAuthUI(); updateCartCount(); });
});

// End of script.js