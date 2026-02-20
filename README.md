# 🛒 TechEdge — Your Online Tech Shop

> **This guide is written for everyone — you do NOT need to know anything about code to understand it.**

---

## 🤔 What Is TechEdge?

TechEdge is a **fake online shop** that looks and works just like a real one. Think of it like Amazon or Best Buy, but for demo purposes only — no real money changes hands and no real products get shipped.

It is a complete shopping website you can open right in your browser.

---

## 🚀 How Do I Open It?

No installation needed. Just:

1. Make sure all 8 files are in the **same folder** on your computer
2. Find the file called **`index.html`**
3. **Double-click it**

It opens in your web browser (Chrome, Firefox, Edge, or Safari all work). That's it!

---

## 🗺️ Page by Page — What Everything Does

---

### 🏠 Homepage (`index.html`)

The first page you see when you open the site.

![Homepage](<img width="1280" height="800" alt="homepage" src="https://github.com/user-attachments/assets/73852be7-aa0f-4eb2-8d59-aa4bc9fe736b" />
<img width="1280" height="800" alt="homepage" src="https://github.com/user-attachments/assets/73852be7-aa0f-4eb2-8d59-aa4bc9fe736b" />
)

**What's on this page:**
- A big bold headline at the top — *"Premium tech. Smarter living."*
- A **"Now shipping worldwide"** badge
- Two buttons — **Browse Products** (scrolls you down to the shop) and **View Cart**
- Further down: a full grid of products, an About section, and a Contact form

---

### 🔑 Login Page (`login.html`)

Where you sign in if you already have an account.

![Login Page](<img width="1280" height="800" alt="login" src="https://github.com/user-attachments/assets/2db34c0f-aa13-4343-b692-cec8ac004e6e" />
<img width="1280" height="800" alt="login" src="https://github.com/user-attachments/assets/2db34c0f-aa13-4343-b692-cec8ac004e6e" />
)

**How to use it:**
- Type your **email** and **password**
- Click the blue **Login** button
- You'll be taken back to the homepage, now logged in

**Want to try it right now without signing up?** Use the demo credentials shown at the bottom of the login card:
- Email: `demo@demo.com`
- Password: `password`

There's also a **Show/Hide** button next to the password field so you can check what you've typed, and a **"← Back to home"** link if you change your mind.

---

### 📝 Sign Up Page (`signup.html`)

For brand new users creating an account.

![Sign Up Page](<img width="1280" height="800" alt="signup" src="https://github.com/user-attachments/assets/2b2d2d33-55cc-4032-b5c1-7fb6215eab45" />
<img width="1280" height="800" alt="signup" src="https://github.com/user-attachments/assets/2b2d2d33-55cc-4032-b5c1-7fb6215eab45" />
)

**How to use it:**
- Enter **any email** — it doesn't have to be real (e.g. `test@test.com` works fine)
- Create a **password** of at least 6 characters
- Click **Create account**
- You're instantly logged in and taken to the homepage

> Your details are saved only in your own browser. Nobody else can see them, and they disappear if you clear your browser data.

---

### 🛒 Cart Page (`cart.html`)

Shows everything you've added to your basket.

![Cart Page](<img width="1280" height="800" alt="cart" src="https://github.com/user-attachments/assets/18cdcfaf-e72d-4ffa-87e5-7742636b39d6" />
<img width="1280" height="800" alt="cart" src="https://github.com/user-attachments/assets/18cdcfaf-e72d-4ffa-87e5-7742636b39d6" />
)

**What you can do here:**
- See each product's **name, image, and price**
- **Change the quantity** (how many of each item) using the number box
- **Remove items** using the Remove button
- See your **subtotal, shipping, and total** at the bottom
- Shipping becomes **Free** once your order is over $150
- Click **"Proceed to Pay"** to go to checkout

If you haven't added anything yet, it will say your cart is empty with a link back to the products.

---

### 💳 Checkout Page (`pay.html`)

Where you "pay" for your order. Three payment options are shown — all simulated, completely safe.

![Payment Page](<img width="1280" height="800" alt="payment" src="https://github.com/user-attachments/assets/dad51d8b-968e-4f22-8385-0ea6d630bf50" />
<img width="1280" height="800" alt="payment" src="https://github.com/user-attachments/assets/dad51d8b-968e-4f22-8385-0ea6d630bf50" />
)

**The three options:**

**🏦 Bank Transfer** — Fill in your name and a reference number (make something up, like `TXN-001`). After you click Submit, the order confirms automatically after a couple of seconds.

**⛓ Crypto** — Enter a network name (the box already says "ETH") and any transaction hash (you can type anything). The site simulates blockchain confirmation.

**💙 PayPal** — Enter any email address. The site simulates a PayPal redirect and completes automatically.

After "paying", you get redirected to your Profile page where your order shows up.

---

### 👤 Profile Page (`profile.html`)

Your personal account page.

![Profile Page]<img width="1280" height="800" alt="profile" src="https://github.com/user-attachments/assets/62e5ef88-2e8d-4ccf-955d-5ff8e86effc1" />
<img width="1280" height="800" alt="profile" src="https://github.com/user-attachments/assets/62e5ef88-2e8d-4ccf-955d-5ff8e86effc1" />
()

**What you can see and do here:**
- Your **email address** and the date you joined
- A form to **change your password**
- A full **order history** — every order you've placed, with its status (pending or paid), date, payment method, and total cost
- A **Logout** button at the bottom

---

## 🧭 The Full Shopping Journey

Here's the step-by-step path from start to a confirmed order:

```
1. Open index.html (the homepage)
         ↓
2. Scroll down and browse the products
         ↓
3. Click "Add to cart" on something you like
         ↓  ← If not logged in, you'll be sent to Login first
4. Log in (or Sign Up if new)
         ↓
5. The item is automatically added to your cart
         ↓
6. Click "Cart" in the top navigation bar
         ↓
7. Review items, adjust quantities if needed
         ↓
8. Click "Proceed to Pay"
         ↓
9. Choose a payment method and fill in the details
         ↓
10. Click Submit — order confirms in a few seconds
         ↓
11. You're taken to Profile — your order is listed there
```

---

## 📄 What Are All These Files?

| File | What It Does |
|---|---|
| `index.html` | The homepage |
| `login.html` | The login page |
| `signup.html` | The sign up page |
| `cart.html` | The shopping cart |
| `pay.html` | The checkout/payment page |
| `profile.html` | Your account and order history |
| `styles.css` | Controls all the colours, fonts, and layout |
| `script.js` | Makes everything interactive — buttons, cart, logins |

All 8 files **must stay in the same folder** for the site to work. Moving one file out will break links between pages.

---

## ❓ Common Questions

**Do I need the internet to open it?**
The pages themselves work offline. But product images and listings load from the internet on your first visit. After that, they're saved locally.

**Is any real money involved?**
No. Everything is 100% simulated. No bank accounts, wallets, or PayPal accounts are connected to anything real.

**Will anyone see my login details?**
No. Everything is stored only in your own browser — like a private notepad. Nothing gets sent anywhere.

**How do I reset everything and start fresh?**
In your browser go to **Settings → Privacy → Clear Browsing Data** and clear cached/local storage. This wipes all TechEdge data.

**Products aren't loading — what's wrong?**
You need an internet connection for products to load for the first time. They come from a free public demo service called [fakestoreapi.com](https://fakestoreapi.com).

---

## ⚠️ Quick Reminders

- This is a **demo only** — no real shopping or payments happen
- All data stays in **your browser only** and is never sent anywhere
- Works best on a **desktop or laptop** browser
- Keep all 8 files in the **same folder**

---

*TechEdge — drop all 8 files in one folder and double-click `index.html` to get started.*
