# Maison Luxe — Premium Full-Stack Luxury Fashion eCommerce

A complete, production-ready luxury fashion eCommerce platform inspired by Versace.com, built with React + Vite (frontend) and Node.js + Express + MongoDB (backend).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| State | Zustand (auth, cart, wishlist, UI) |
| Data Fetching | TanStack Query (React Query v5) |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (access + refresh tokens), bcryptjs |
| Email | Nodemailer (Gmail SMTP or any SMTP) |
| Charts | Recharts |
| Forms | React Hook Form |
| Routing | React Router v6 |

---

## Project Structure

```
maison-luxe/
├── backend/
│   ├── controllers/
│   │   ├── authController.js       # Register, login, logout, verify, reset
│   │   ├── userController.js       # Profile, avatar, addresses, wishlist
│   │   ├── productController.js    # CRUD, search, collections
│   │   ├── orderController.js      # Create, cancel, return, admin updates
│   │   └── miscController.js       # Cart, reviews, newsletter, admin
│   ├── middleware/
│   │   └── auth.js                 # JWT protect, authorize, optionalAuth
│   ├── models/
│   │   ├── User.js                 # Full user model with addresses, wishlist
│   │   ├── Product.js              # Product with variants, sizes, colors
│   │   └── index.js                # Category, Order, Cart, Review, Coupon, Newsletter, ActivityLog
│   ├── routes/                     # 11 route files
│   ├── utils/
│   │   └── email.js                # 12 beautiful HTML email templates
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/             # Navbar, Footer, MobileMenu, AdminLayout
    │   │   ├── cart/               # CartDrawer
    │   │   ├── common/             # SearchModal, LoadingScreen
    │   │   ├── product/            # ProductCard
    │   │   └── auth/               # AccountLayout sidebar
    │   ├── pages/
    │   │   ├── Home.jsx            # Hero slider, categories, featured, brand story
    │   │   ├── shop/               # Shop, ProductDetail, Cart, Checkout, OrderSuccess, Wishlist, SearchResults
    │   │   ├── auth/               # SignIn, Register, ForgotPassword, ResetPassword, VerifyEmail
    │   │   ├── account/            # Dashboard, Orders, OrderDetail, Profile, Addresses, Security, Wishlist
    │   │   ├── admin/              # Dashboard, Products, ProductForm, Orders, Users, Reviews, Coupons, Categories, Analytics, ActivityLogs
    │   │   └── brand/              # WorldOfMaison, Lookbook, About, Sustainability, Contact, NotFound
    │   ├── store/
    │   │   ├── authStore.js        # Zustand auth with localStorage persist
    │   │   └── cartStore.js        # Cart, UI, Wishlist stores
    │   └── services/
    │       └── api.js              # Axios + all API endpoint functions
    ├── vite.config.js
    ├── tailwind.config.js
    └── index.html
```

---

## Quick Start

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Backend Environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/maison-luxe
JWT_SECRET=your_super_secret_key_here
REFRESH_TOKEN_SECRET=your_refresh_secret_here

# Gmail SMTP (create an App Password in Google Account settings)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16_char_app_password
EMAIL_FROM=Maison Luxe <noreply@maisonluxe.com>

CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Seed the Database (optional)

Create an admin account by registering then manually updating the role in MongoDB:
```js
db.users.updateOne({ email: "admin@youremail.com" }, { $set: { role: "admin" } })
```

### 4. Run Development

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

---

## All Routes

### Frontend Pages

| Path | Page |
|---|---|
| `/` | Home (hero, collections, lookbook, newsletter) |
| `/shop` | Shop with filters + sorting |
| `/shop/:gender/:category` | Category shop |
| `/products/:id` | Product detail with gallery |
| `/search?q=` | Search results |
| `/cart` | Shopping cart |
| `/checkout` | 3-step checkout |
| `/order-success/:id` | Order confirmation |
| `/wishlist` | Public wishlist |
| `/sign-in` | Sign in |
| `/register` | Register |
| `/forgot-password` | Forgot password |
| `/reset-password/:token` | Reset password |
| `/verify-email/:token` | Email verification |
| `/account` | Account dashboard |
| `/account/orders` | Order history |
| `/account/orders/:id` | Order detail + cancel/return |
| `/account/profile` | Edit profile + avatar |
| `/account/addresses` | Manage addresses |
| `/account/security` | Change password + activity log |
| `/account/wishlist` | Saved items |
| `/world-of-maison` | Brand universe |
| `/lookbook` | Lookbook |
| `/about` | About us |
| `/sustainability` | Sustainability |
| `/contact` | Contact form |
| `/admin` | Admin dashboard (charts) |
| `/admin/products` | Product management |
| `/admin/products/new` | Create product |
| `/admin/products/:id/edit` | Edit product |
| `/admin/orders` | Order management + status update |
| `/admin/users` | User management + ban |
| `/admin/reviews` | Review moderation |
| `/admin/coupons` | Coupon management |
| `/admin/categories` | Category management |
| `/admin/analytics` | Analytics charts |
| `/admin/activity-logs` | System activity logs |

### Backend API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register + welcome email |
| POST | `/api/auth/login` | Login + sign-in notification email |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/auth/verify-email/:token` | Verify email |
| POST | `/api/auth/forgot-password` | Send reset email |
| POST | `/api/auth/reset-password/:token` | Reset password |
| PUT | `/api/auth/change-password` | Change password (auth) |
| PUT | `/api/users/profile` | Update profile |
| PUT | `/api/users/avatar` | Update avatar |
| GET/POST/PUT/DELETE | `/api/users/addresses` | Address CRUD |
| GET/POST | `/api/users/wishlist/:id` | Wishlist toggle |
| GET | `/api/products` | Products with filters |
| GET | `/api/products/collections` | Featured/new/sale/bestsellers |
| GET | `/api/products/search` | Product search |
| GET | `/api/products/:id` | Single product |
| POST/PUT/DELETE | `/api/products` | Admin CRUD |
| GET/POST/PUT/DELETE | `/api/categories` | Category CRUD |
| GET/POST/PUT/DELETE | `/api/cart` | Cart management |
| POST | `/api/cart/coupon` | Apply coupon |
| POST | `/api/orders` | Create order + confirmation email |
| GET | `/api/orders` | User's orders |
| PUT | `/api/orders/:id/cancel` | Cancel + email |
| PUT | `/api/orders/:id/return` | Return request + email |
| POST | `/api/newsletter/subscribe` | Subscribe + welcome email |
| GET | `/api/admin/dashboard` | Dashboard stats |
| GET | `/api/admin/users` | All users |
| PUT | `/api/admin/users/:id/ban` | Ban/unban user + email |
| GET | `/api/admin/orders` | All orders |
| PUT | `/api/admin/orders/:id/status` | Update status + email |
| GET/PUT | `/api/admin/reviews` | Review moderation |
| GET/POST/PUT | `/api/admin/coupons` | Coupon management |
| GET | `/api/admin/activity-logs` | Activity audit log |
| GET | `/api/analytics/overview` | Sales analytics |

---

## Email Notifications Sent

| Trigger | Template |
|---|---|
| Registration | Welcome + verify email button |
| Email verified | Verification confirmed |
| Every sign-in | Login notification with IP + device |
| Forgot password | Reset link (expires 1hr) |
| Password changed | Security alert |
| Profile/name updated | Change notification |
| Avatar changed | Profile photo updated |
| Order placed | Full order summary |
| Order shipped | Tracking info |
| Order delivered | Delivery confirmation + review prompt |
| Order cancelled | Cancellation with reason |
| Return requested | Return confirmation |
| Newsletter subscribe | Welcome to newsletter |
| Account banned | Suspension notice |

---

## Production Deployment

```bash
# Backend — set NODE_ENV=production, use MongoDB Atlas
# Frontend — build static files
cd frontend && npm run build
# Serve dist/ via nginx or Vercel/Netlify
```

---

## Adding Real Images

Product images use Unsplash URLs by default. For production:
1. Set up Cloudinary account
2. Add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` to `.env`
3. Update avatar upload in `AccountProfile.jsx` to use Cloudinary SDK

---

Built with ❤️ — Maison Luxe 2025
