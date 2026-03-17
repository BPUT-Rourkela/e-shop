# 🛍️ EcomStore — Full-Stack AI-Powered E-Commerce Platform

A full-stack e-commerce web application built with **React** (frontend), **Node.js/Express** (backend), **MongoDB Atlas** (database), and a **Python FastAPI ML service** for personalized product recommendations and sentiment analysis.

---

## 📁 Project Structure

```
e-shop/
├── backend/        # Node.js + Express REST API
├── frontend/       # React.js Single Page Application
└── ml/             # Python FastAPI — ML Recommendation & Sentiment Service
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
| axios | latest | Proxy requests to ML service |
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
ML_API_URL=http://127.0.0.1:8000
```

> ⚠️ If your MongoDB password contains special characters (e.g. `@`), URL-encode them (e.g. `@` → `%40`).

```bash
# Production
node server.js

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
| GET | `/products/recommended` | Admin-curated recommended products | Public |
| POST | `/products/add` | Add product | Admin |
| PUT | `/products/:id` | Update product | Admin |
| DELETE | `/products/:id` | Delete product | Admin |
| PATCH | `/products/:id/trending` | Toggle trending status | Admin |
| PATCH | `/products/:id/recommended` | Toggle recommended status | Admin |

#### 📦 Orders (`/orders`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/orders` | Create new order | Customer |
| GET | `/orders/myorders` | Get own orders (with product details) | Customer |

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
| PATCH | `/reviews/:id/sentiment` | Override sentiment label | Admin |

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

#### 🤖 ML (`/ml`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/ml/recommend` | Get personalized product recommendations | Public |
| POST | `/ml/analyze-sentiment` | Analyze sentiment of review text | Public |

**Request body for `/ml/recommend`:**
```json
{
  "product_texts": ["product name category description", "..."]
}
```

---

### Database Models

**User** — `name`, `email`, `password`, `role` (customer/admin), `phone`, `dob`, `gender`, `profilePicture`, `addresses[]`, `wishlist[]`, `paymentMethods[]`

**Product** — `name`, `description`, `price`, `category`, `image`, `isTrending`, `isRecommended`, `purchaseCount`

**Order** — `user`, `products[]` (product + quantity), `totalAmount`, `status` (Pending/Processing/Shipped/Delivered/Cancelled), `paymentMethod`

**Review** — `product`, `user`, `userName`, `rating`, `comment`, `sentiment` (Positive/Negative/Neutral/Pending)

---

## 🤖 ML Service (Python FastAPI)

A standalone Python microservice that powers product recommendations and review sentiment analysis.

### Tech Stack
| Package | Purpose |
|---------|---------|
| FastAPI | Web framework |
| scikit-learn | TF-IDF vectorizer + cosine similarity |
| pandas / numpy | Data processing |
| joblib | Model serialization |
| uvicorn | ASGI server |

### Setup

```bash
cd ml
pip install -r requirements.txt
```

Train the models (only needed once, or when you want to retrain):
```bash
python train_recommendation.py   # Trains TF-IDF on Amazon product data
python train_sentiment.py        # Trains sentiment classifier
```

Run the ML service:
```bash
python app.py
```

ML service runs on **http://127.0.0.1:8000**

### How It Works

**Recommendation Engine:**
1. Trained on Amazon product catalogue using **TF-IDF** on product descriptions
2. At runtime, accepts `product_texts` (names + categories + descriptions of recently purchased products)
3. Uses **cosine similarity** to find the most semantically similar products
4. Returns up to 12 ranked recommendations

**Sentiment Analysis:**
- Trained binary classifier (Positive / Negative / Neutral)
- Automatically applied to new product reviews on submission

---

## 🖥️ Frontend

### Tech Stack
- **React 18** — UI library
- **React Router DOM** — Client-side routing
- **Axios** — HTTP client
- **Recharts** — Data visualization charts
- **Lucide React** — Icon library
- **Tailwind CSS** — Utility-first styling
- **Plus Jakarta Sans** — Premium typography (Google Fonts)

### Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on **http://localhost:3001**

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

**For guests (not logged in):**
- **🔥 Trending Now** — admin-marked trending products
- **Best Sellers: Electronics** — top purchased electronics
- **Best Selling: Kitchen** — top kitchen products
- **Top Home Items** — top home category products
- **Best Selling: Computer Accessories** — top computer accessories

**For logged-in users with purchase history:**
- **🧠 Recommended For You** — AI-powered section (dark galaxy gradient UI) shown at the top, personalized based on the user's purchase history using the ML model
- All 4 category sections shown below it

**Search:**
- Search bar in Navbar filters products by name, description, or category via URL query (`?search=`)
- AI-powered "Smart Match" recommendations shown below search results

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
6. **Recommendations** — Toggle `isTrending` / `isRecommended` per product
7. **Reviews & Sentiment** — Auto-classified reviews + admin override
8. **Analytics** — Revenue bar chart, category pie chart, top 5 products

#### 🔔 Dynamic Navbar
- Logged out → shows **Login**
- Logged in as customer → shows **Profile** + **Logout**
- Logged in as admin → shows **Admin** + **Logout**

---

## 🔑 Authentication Flow

1. User registers with `role: "customer"` (default)
2. To grant admin access: change `role` to `"admin"` directly in MongoDB Atlas
3. On login, JWT is issued containing `{ id, name, role }`
4. Token stored in `localStorage`, auto-attached to all API requests via Axios interceptor
5. Backend `verifyToken` + `isAdmin` middleware protects all sensitive routes

---

## 🚀 Running the Full App

```bash
# Terminal 1 — Backend
cd backend && node server.js

# Terminal 2 — ML Service
cd ml && python app.py

# Terminal 3 — Frontend
cd frontend && npm start
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3001 |
| Backend API | http://localhost:5000 |
| ML Service | http://127.0.0.1:8000 |
