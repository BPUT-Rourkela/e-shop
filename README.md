# 🛍️ EcomStore — Full-Stack E-Commerce Platform

A full-stack e-commerce web application built with **React** (frontend) and **Node.js/Express** (backend), using **MongoDB Atlas** as the database.

---

## 📁 Project Structure

```
e-shop/
├── backend/        # Node.js + Express REST API
└── frontend/       # React.js Single Page Application
```

---

## ⚙️ Backend

### Tech Stack
| Package | Version | Purpose |
|---------|---------|---------|
| express | ^5.2.1 | Web framework |
| mongoose | ^9.3.0 | MongoDB ODM |
| bcryptjs | ^3.0.3 | Password hashing |
| jsonwebtoken | ^9.0.3 | JWT authentication |
| dotenv | ^17.3.1 | Environment variables |
| cors | ^2.8.6 | Cross-origin resource sharing |
| helmet | ^8.1.0 | HTTP security headers |
| morgan | ^1.10.1 | HTTP request logger |
| nodemon | ^3.1.14 | Dev auto-restart |

### Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/e-commerce?appName=Cluster0
JWT_SECRET=your_jwt_secret_key
```

> ⚠️ If your MongoDB password contains special characters (e.g. `@`), URL-encode them (e.g. `@` → `%40`).

```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

Server runs on **http://localhost:5000**

---

### API Endpoints

#### 🔐 Auth (`/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user (`name`, `email`, `password`, `role`) |
| POST | `/auth/login` | Login, returns JWT + user info |

#### 🛒 Products (`/products`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/products` | All products | Public |
| GET | `/products/trending` | Trending products | Public |
| GET | `/products/recommended` | Recommended products | Public |
| POST | `/products/add` | Add product | Admin |
| PUT | `/products/:id` | Update product | Admin |
| DELETE | `/products/:id` | Delete product | Admin |
| PATCH | `/products/:id/trending` | Toggle trending status | Admin |
| PATCH | `/products/:id/recommended` | Toggle recommended status | Admin |

#### 📦 Orders (`/orders`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/orders` | Create new order | Customer |
| GET | `/orders/myorders` | Get own orders | Customer |

#### 👤 User Profile (`/users`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users/profile` | Get profile | Customer |
| PUT | `/users/profile` | Update personal info | Customer |
| POST | `/users/addresses` | Add address | Customer |
| PUT | `/users/addresses/:id` | Update address | Customer |
| DELETE | `/users/addresses/:id` | Delete address | Customer |
| POST | `/users/wishlist/toggle` | Add/remove from wishlist | Customer |
| POST | `/users/payment-methods` | Save payment method | Customer |
| DELETE | `/users/payment-methods/:id` | Delete payment method | Customer |

#### ⭐ Reviews (`/reviews`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/reviews/add` | Submit a review | Customer |
| GET | `/reviews/:productId` | Get reviews for a product | Public |
| PATCH | `/reviews/:id/sentiment` | Override sentiment | Admin |

#### 🛠️ Admin (`/admin`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/stats` | Overview stats (revenue, orders, users, products) |
| GET | `/admin/orders` | All orders with user + product details |
| PATCH | `/admin/orders/:id/status` | Update order status |
| GET | `/admin/customers` | All customers with order count + spend |
| GET | `/admin/customers/:id/orders` | Order history of a specific customer |
| GET | `/admin/transactions` | All transactions |
| GET | `/admin/analytics` | Top products, revenue by month, category distribution |
| GET | `/admin/reviews` | All reviews for sentiment monitoring |

---

### Database Models

**User** — `name`, `email`, `password`, `role` (customer/admin), `phone`, `dob`, `gender`, `profilePicture`, `addresses[]`, `wishlist[]`, `paymentMethods[]`

**Product** — `name`, `description`, `price`, `category`, `image`, `isTrending`, `isRecommended`, `purchaseCount`

**Order** — `user`, `products[]` (product + quantity), `totalAmount`, `status` (Pending/Processing/Shipped/Delivered/Cancelled), `paymentMethod`

**Review** — `product`, `user`, `userName`, `rating`, `comment`, `sentiment` (Positive/Negative/Neutral/Pending)

---

## 🖥️ Frontend

### Tech Stack
- **React 18** — UI library
- **React Router DOM** — Client-side routing
- **Axios** — HTTP client
- **Recharts** — Data visualization charts
- **Lucide React** — Icon library
- **Tailwind CSS** — Utility-first styling

### Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on **http://localhost:3000**

---

### Pages & Routing

| Route | Component | Access |
|-------|-----------|--------|
| `/` | `Home` | Public |
| `/login` | `Login` | Public |
| `/profile` | `Profile` | Customers only |
| `/admin` | `AdminDashboard` | Admins only |
| `/orders` | `Orders` | Authenticated |

> 🔒 Route guards: `AdminRoute` blocks non-admins from `/admin`. `CustomerRoute` blocks admins from `/profile` (redirects to `/admin`).

---

### Key Features

#### 🏠 Home Page
- **Trending Now** section — products marked as trending by admin (🔥 badge)
- **Recommended For You** section — admin-curated recommendations (⭐ badge)
- **Featured Products** — full product catalogue
- **Search bar** in Navbar — filters by name, description, or category via URL query param (`?search=`)

#### 👤 Customer Profile (`/profile`)
Tabbed sidebar UI with:
- **Personal Information** — name, phone, date of birth, gender, profile picture
- **Addresses** — add, edit, delete, set default (Home / Office / Other)
- **My Orders** — order history with status
- **Wishlist** — saved products
- **Payment Methods** — saved cards, UPI, NetBanking

#### 🛠️ Admin Dashboard (`/admin`)
8-tab management portal:
1. **Overview** — KPI cards (revenue, orders, customers, products) + 30-day sales chart
2. **Orders** — Expandable order table + inline status update dropdown
3. **Customers** — Customer list, click to view full purchase history
4. **Transactions** — Revenue log per order with payment method
5. **Products** — Full CRUD (add, edit, delete) + purchase count display
6. **Recommendations** — Toggle `isTrending` / `isRecommended` per product (controls homepage sections)
7. **Reviews & Sentiment** — Auto-classified reviews (Positive ≥4★, Negative ≤2★) + admin override
8. **Analytics** — Revenue bar chart, category pie chart, top 5 products

#### 🔔 Dynamic Navbar
- Logged out → shows **Login**
- Logged in as customer → shows **Profile** + **Logout**
- Logged in as admin → shows **Admin** + **Logout** (no Profile link)

---

## 🔑 Authentication Flow

1. User registers with `role: "customer"` (default)
2. To grant admin access: change `role` to `"admin"` directly in MongoDB Atlas
3. On login, JWT is issued containing `{ id, name, role }`
4. Token stored in `localStorage`, auto-attached to all API requests via Axios interceptor
5. Backend `verifyToken` + `isAdmin` middleware protects all sensitive routes

---

## 📊 Recommendation System (ML Hook)

The `isTrending` and `isRecommended` fields on the Product model are currently controlled manually via the Admin Dashboard → **Recommendations** tab.

When the ML recommendation model is ready, integrate it by calling:
```
PATCH /products/:id/trending
PATCH /products/:id/recommended
```
from your model output — the frontend will pick it up automatically.

---

## 🚀 Running the Full App

```bash
# Terminal 1 — Backend
cd backend && node server.js

# Terminal 2 — Frontend  
cd frontend && npm start
```

Visit **http://localhost:3000** to use the app.
