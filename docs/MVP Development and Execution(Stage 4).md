# LevelUp — MVP & Sprints Documentation

## Project Presentation

**LevelUp** is a complete web marketplace dedicated to digital game sales and activation keys.The initiative comprises:

- A **server API** developed with **Flask**, **SQLAlchemy**, **Flask-JWT-Extended**, **Flask-Bcrypt**, **Flask-Mail**, and **Stripe**.
- A **client web application** developed with **React**, **Vite**, **JSX**, **React Router**, and **Axios**.
- A **browsable catalogue** equipped with genre filters, a search engine, sorting options, and dedicated product pages.
- An **administration panel** allowing product handling, inventory key management, and user oversight.

---

## MVP Objective

This MVP aims to:

- Offer a functional storefront where visitors can browse titles, populate a cart, and finalize their purchase.
- Supply administrators with an interface to supervise products, stock levels, and user accounts.
- Lay down a scalable foundation for upcoming capabilities like reviews, extended inventory, and automated messaging.

---

## 0. Planning and Sprint Definition

### Target

Organize team contributions into short cycles, each with explicit goals and assigned responsibilities.

### Methodology: MoSCoW

| Priority              | Description                                                                           |
| --------------------- | ------------------------------------------------------------------------------------- |
| **Must Have**   | Authentication system, game catalogue, cart feature, Stripe billing, admin panel.     |
| **Should Have** | Email-based password recovery, purchase history, inventory handling, analytics.       |
| **Could Have**  | Ratings system, advanced media support, interface animations, Steam data importation. |
| **Won’t Have** | Multi-vendor support or marketplace functionalities beyond the project scope.         |

### Sprint Framework

- **Timeframe:** ~1-2 week per cycle.
- **Tools:** GitHub (versioning), Discord (communication and task tracking), Bruno (API verification).
- **Roles:**
  - **Backend Engineer:** Flask, SQLAlchemy, JWT, Stripe.
  - **Frontend Engineer:** React, Vite, JSX, API consumption.
  - **QA Lead:** Manual verification via Bruno and browser checks.
  - **SCM Officer:** Branch management, code audits, and merge operations.

---

## 1. Development Task Execution

### Backend

- Implemented using **Flask** and **SQLAlchemy**.
- Authentication and session tracking leverage **JWT** with access and refresh tokens.
- Passwords are encrypted via **Bcrypt** and account recovery is managed through **Flask-Mail**.
- REST API endpoints are organized under `/api/v1`:
  - `/auth/register`, `/auth/login`, `/auth/logout` — user authentication
  - `/products`, `/products/<id>` — game catalogue and details
  - `/genres` — genre classification
  - `/cart`, `/cart/items`, `/cart/checkout` — cart handling and payment
  - `/orders` — order history
  - `/admin/products/<id>/activation-keys` — activation key issuance (restricted to admins)
  - `/payments/webhook` — Stripe transaction confirmation
- Product records support digital formats, Steam metadata, imagery, reviews, and soft deletion.
- The payment flow assigns inventory items only after Stripe confirmation.

### Frontend

- Developed with **React**, **Vite**, **JSX**, and **React Router**.
- Routes currently exposed:
  - `/` — Catalogue
  - `/product/:id` — Product details
  - `/cart` — Cart
  - `/login` — Authentication
  - `/admin` — Administration panel
- Functionalities:
  - Search, genre filtering, and sorting within the catalogue.
  - Product detail screen with quantity picker and cart addition workflow.
  - Authenticated API calls secured by JWT.
  - Admin capabilities for creating, modifying, and removing products.

### SCM & QA

- **Branch model:** `main`, `dev`, `feature/*`
- **Testing:**
  - Bruno for API validation.
  - Front-end validation executed via browser and console inspection.
- **Reviews:** Pull requests inspected before merging.

---

## 2. Progress Tracking and Adaptation

### Weekly Syncs

Each Monday, the group assessed finished work, flagged obstacles, and scheduled the following week's tasks.

### Tools

- **GitHub** for versioning and progress monitoring.
- **Discord** for team coordination and task follow-up.
- **Bruno** for API validation.

---

## 3. Sprint Reviews and Retrospectives

### Cycle Close-out

At the beginning of each new sprint, the group re-examined the work produced during the prior cycle, spotted any blockers, mapped out the next batch of tasks, and confirmed that the integration remained stable.

### Retrospective

| Topic        | Notes                                                                                                                                                                                                            |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Positives    | Clean separation between API and frontend. JWT authentication and Stripe sandbox worked reliably once configured. Admin CRUD loop reached a usable state quickly.                                                |
| Blockers     | CORS policy needed repeated adjustments. Token persistence showed issues during session refreshes after inactivity. Some UI components still relied on local fallback data instead of live API calls.            |
| Improvements | Add automated tests for backend routes and key frontend flows. Include basic sales and inventory metrics in the admin panel. Complete product image upload and storage. Improve UX with clearer error messages. |

---

## 4. Final Integration and QA Validation

### Full Integration

- Communication between client and server was verified for:
  - `/products`
  - `/cart`
  - `/orders`
  - `/inventory`
  - `/admin/users`
  - `/checkout/<session_id>/status`
- **Stripe Sandbox**:
  - Checkout session generation, webhook processing, and payment confirmation.
- **Admin Panel**:
  - Inventory key assignment and activation procedure.
  - Add and update product
  - User management and statistics viewing.

### Implemented Fixes

- Standardized client requests through a shared API connector.
- Linked the catalogue to live backend data rather than mock-only sources.
- Introduced role-based restrictions for admin endpoints.

---

## MVP Delivery Report

| Feature                     | Status | Description                                                        |
| --------------------------- | ------ | ------------------------------------------------------------------ |
| Auth                        | ✅     | Registration, login, logout, token refresh, and password recovery. |
| Product Catalogue           | ✅     | Searchable, filterable, and sortable game listings.                |
| Shopping Cart               | ✅     | User-specific cart managed via authenticated API calls.            |
| Checkout / Payment          | ✅     | Stripe integration with webhook confirmation.                      |
| Admin Dashboard             | ✅     | Product, user, and inventory administration.                       |
| Inventory / Activation Keys | ✅     | Issuance and activation flow for digital goods.                    |

---

## Road Ahead

1. ⚙️ Complete the public review module in the frontend.
2. ⚙️ Enhance the admin inventory interfaces.
3. ⚙️ Incorporate richer media and product metadata processing.
4. 🚀 Deploy to production and document the release procedure.

---

## Installation and Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- A database compatible with SQLAlchemy (`sqlite:///levelup.db` is the default)
- Stripe account for payment testing
- SMTP credentials for password recovery emails

### Environment Variables

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

### Launch Commands

```bash
# Start both backend and frontend using Docker Compose
cd ../levelup
make dev
```

For manual execution:

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

### URLs

| **Service** | **URL**                | **Description**                    |
| ----------------- | ---------------------------- | ---------------------------------------- |
| API Health        | http://localhost:5000/health | Verifies Flask server status             |
| API Base          | http://localhost:5000/api/v1 | Entry point for all API routes           |
| Frontend          | http://localhost:5173        | User interface - game catalogue          |
| Admin Dashboard   | http://localhost:5173/admin  | Admin panel - product and key management |

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
*"Your digital game marketplace, built for fast access and instant activation.""
