# LevelUp — Documentation MVP & Sprint

##  Project Overview

**LevelUp** is a full-stack marketplace for selling digital games and activation keys.  
The project includes:
- A **back-end API** built with **Flask**, **SQLAlchemy**, **Flask-JWT-Extended**, **Flask-Bcrypt**, **Flask-Mail**, and **Stripe**.
- A **front-end web app** built with **React**, **Vite**, **JSX**, **React Router**, and **Axios**.
- A **catalogue interface** with genre filters, search, sorting, and detailed product pages.
- An **admin dashboard** for product management, inventory activation keys, and user administration.

---

## MVP Goal

The goal of this MVP is to:
- Deliver a working storefront where users can browse games, add them to cart, and complete checkout.
- Provide an admin interface to manage products, stock, and users.
- Establish a scalable architecture for future features such as reviews, inventory expansion, and automated email flows.

---

## 0. Plan and Define Sprints

###  Objective
Distribute the work among team members into short iterations with clear objectives and defined responsibilities.

###  Methodology: MoSCoW
| Priority | Description |
|-----------|--------------|
| **Must Have** | Authentication, product catalogue, cart system, Stripe checkout, admin dashboard. |
| **Should Have** | Password reset by email, order history, inventory management, statistics. |
| **Could Have** | Reviews, richer product media, UI animations, Steam metadata integration. |
| **Won’t Have** | Multi-store support or marketplace features outside the single-project scope. |

###  Sprint Structure
- **Duration:** 1 week per sprint.
- **Tools:** GitHub for version control, Discord for team communication and task tracking, Bruno for API testing.
- **Roles:**
  - **Backend Dev:** Flask, SQLAlchemy, JWT, Stripe.
  - **Frontend Dev:** React, Vite, JSX, API integration.
  - **QA:** Manual checks via Bruno and browser testing.
  - **SCM:** Branching, code reviews, and merges.

---

##  1. Execute Development Tasks

###  Backend
- Built with **Flask** and **SQLAlchemy**.
- Authentication and session management rely on **JWT** with access and refresh tokens.
- Passwords are hashed with **Bcrypt** and account recovery is handled through **Flask-Mail**.
- REST API endpoints are grouped under `/api/v1`:
  - `/auth/register`, `/auth/login`, `/auth/logout` — user authentication
  - `/products`, `/products/<id>` — product catalog and details
  - `/genres` — genre listing
  - `/cart`, `/cart/items`, `/cart/checkout` — cart management and payment
  - `/orders` — order history
  - `/admin/products/<id>/activation-keys` — activation key generation (admin only)
  - `/payments/webhook` — Stripe payment confirmation
- Product data supports digital formats, Steam metadata, product images, reviews, and soft deletion.
- The payment flow provisions inventory items after Stripe confirmation.

### Frontend
- Developed using **React**, **Vite**, **JSX**, and **React Router**.
- Main screens exposed by the current routing layer:
  - `/` — Catalogue
  - `/product/:id` — Product details
  - `/cart` — Cart
  - `/login` — Authentication
  - `/admin` — Admin dashboard
- Features:
  - Search, genre filtering, and sorting in the catalogue.
  - Product detail view with quantity selection and add-to-cart flow.
  - JWT-based authenticated requests through the API client.
  - Admin product creation, edition, and deletion.

###  SCM & QA
- **Branch strategy:** `main`, `dev`, `feature/*`
- **Testing:**
  - Bruno for API testing.
  - Front-end validation through the browser and console.
- **Reviews:** Pull requests reviewed before merging.

---

##  2. Monitor Progress and Adjust

### Weekly Stand-ups
At the beginning of each week, the team reviewed completed tasks, identified blockers, and planned the work to be done for the upcoming week.

###  Tools
- **GitHub** for version control and code tracking.
- **Discord** for team communication and task follow-up.
- **Bruno** for API testing.

---

##  3. Conduct Sprint Reviews & Retrospectives

###  End of Sprint
At the beginning of each week, the team reviewed the work completed during the previous week, identified blockers, planned the upcoming tasks, and ensured everything was working as expected.

###  Retrospective
| Topic | Notes |
|--------|-------|
| ✅ What went well | Clear front/back separation, working JWT flow, and solid Stripe integration. |
| What didn’t | CORS setup, token persistence edge cases, and manual fallback data in some UI states. |
|  What to improve | Automated tests, richer admin analytics, image upload workflow, and UX polish. |

---

##  4. Final Integration and QA Testing

###  Full Integration
- Verified communication between front-end and back-end for:
  - `/products`, `/cart`, `/orders`, `/inventory`, `/admin/users`, and `/checkout/<session_id>/status`
- **Stripe Sandbox**:
  - Checkout session creation, webhook handling, and payment confirmation.
- **Admin Dashboard**:
  - Live product list and CRUD operations.
  - Inventory key assignment and activation workflow.
  - User management and statistics.

### Fixes Implemented
- Unified front-end requests through a shared API client.
- Connected the catalogue to live backend data instead of mock-only content.
- Added role-based access control for admin endpoints.

---

## MVP Delivery Summary

| Feature | Status | Description |
|----------|--------|--------------|
| Authentication | ✅ | Register, login, logout, refresh, and password reset. |
| Product Catalogue | ✅ | Searchable, filterable, and sortable game listings. |
| Dynamic Cart | ✅ | User-specific cart managed through authenticated API calls. |
| Checkout / Payment | ✅ | Stripe integration with webhook confirmation. |
| Admin Dashboard | ✅ | Product, user, and inventory management. |
| Inventory / Activation Keys | ✅ | Allocation and activation flow for digital items. |

---

##  Next Steps

1. ⚙️ Finalize the public review system in the frontend.
2. ⚙️ Improve the admin inventory screens.
3. ⚙️ Add richer media and product metadata handling.
4. 🚀 Deploy to production and document the release flow.

---

## Installation & Setup

###  Requirements
- Python 3.10+
- Node.js 18+
- A database for SQLAlchemy (`sqlite:///levelup.db` works by default)
- Stripe account for checkout testing
- SMTP credentials for password reset emails

###  Environment Variables
```env
SQLALCHEMY_DATABASE_URI="sqlite:///levelup.db"
SECRET_KEY="change-me"
JWT_SECRET_KEY="change-me-too"
FRONTEND_URL="http://localhost:5173"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
MAIL_USERNAME="you@example.com"
MAIL_PASSWORD="your-app-password"
```

###  Launch Commands
```bash
# Start both backend and frontend with Docker Compose
cd ../levelup
make dev
```

If you want to run the services manually:
```bash
# 1. Backend
cd ../levelup/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python run.py

# 2. Frontend
cd ../frontend
npm install
npm run dev
```

###  URLs
| **Service** | **URL** | **Description** |
|----------|-----|-------------|
| API Health | http://localhost:5000/health | Checks that the Flask server is running |
| API Base | http://localhost:5000/api/v1 | Entry point for all API routes |
| Frontend | http://localhost:5173 | User interface - game catalogue |
| Admin Dashboard | http://localhost:5173/admin | Admin dashboard - product and key management |

---

## Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [Flask-JWT-Extended Documentation](https://flask-jwt-extended.readthedocs.io/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Stripe Integration Guide](https://stripe.com/docs/payments/accept-a-payment)
- [React Router Documentation](https://reactrouter.com/)
- [Vite Documentation](https://vite.dev/)
- [Bruno API Client](https://www.usebruno.com/)

---

**© 2026 — LevelUp**  
Developed by **Alexandre Mouysset** **Ylan Labare Bekate** **Théo Caulet**  
*"Your digital game marketplace, built for fast access and instant activation."*