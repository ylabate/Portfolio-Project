# 🎲 Level Up — Stage 4: Release, Validation & Engineering Retrospective

This documentation presents the final delivery, validation processes, and engineering retrospective for the **Level Up** MVP (game key e-commerce platform). It transitions the project from design and implementation (Stage 1-3) to testing, deployment, and operational maintenance.

---

## 🛠️ Technical Stack Overview

The **Level Up** MVP platform is built using a decoupled client-server architecture:
*   **Frontend**: Developed using **React**, **Vite**, **TailwindCSS**, and **React Router** for a responsive, single-page application experience.
*   **Backend**: Powered by a **Python Flask** REST API structured in layers (API Routes, Service Layer, Repository Pattern).
*   **Database**: Managed through **SQLite** and **SQLAlchemy ORM** for persistent local transactions.
*   **Integrations**: Secured transactions via the **Stripe API** (Checkout Sessions and Webhooks) and email dispatches handled through **Flask-Mail**.

---

## 🤝 Project Management & Version Control

To monitor progression and align team workflows:
*   **Version Control & SCM**: We used **GitHub** exclusively for codebase hosting and branching. The flow enforced separate `feature/*` branches, pull-request validations, and clean integration into `dev` and `main` branches.
*   **Task & Project Tracking**: Rather than complex external management platforms, we simplified task allocation and daily discussions using **Discord** as our hub. Tasks were distributed, updated, and closed directly through team syncs on specialized Discord channels.

---

## 🚀 1. Feature Delivery & Release Registry

The table below reflects the actual status of the application features at the end of the MVP phase compared to the requirements laid out in the initial stages.

| Module | Feature | Status | Engineering Detail |
|:---|:---|:---:|:---|
| **Authentication & Profile** | JWT Authentication & Register | ✅ | Persistence via HTTP/LocalStorage, secure password hashing using bcrypt. |
| | Password Reset Flow | ✅ | Verification token generated, email sent, password reset validated. |
| | Account Deletion | ✅ | Implemented cascade deletion for user-specific inventory items and carts. |
| **Catalog & Navigation** | Product Catalog & Categorization | ✅ | DB-driven (SQLite/SQLAlchemy), sortable and filterable by genre, price range, and search. |
| | Steam API Proxy | ✅ | Bypasses CORS on the frontend by proxying Steam App ID details via the Flask backend. |
| **Transactions & Cart** | Shopping Cart | ✅ | Synced dynamically via the `CartRepository`. Real-time stock status validation. |
| | Stripe Payment Flow | ✅ | Successful redirect to Stripe Checkout, webhook event (`checkout.session.completed`) handling. |
| **Inventory & Fulfillment** | Key Delivery | ✅ | Webhook provisions activation codes on database, transitioning status to `in_inventory`. |
| | Inventory Actions | ✅ | Interactive reveal mechanism changing keys state from `in_inventory` to `activated` or `opened`. |
| **Administration** | CRUD Management | ✅ | Admin dashboard allows creating/editing products, updating prices, and tracking user lists. |
| | Key Injection | ✅ | Endpoint allows administrators to generate batch activation codes to restock game products. |
| **Bonus / Roadmap** | Lootbox / Gambling | ⚙️ | Schema prepared (`state: "opened"`, type: `"crate"`), UI logic designed but backend probability logic deferred. |

---

## 🔌 API Endpoint Registry

Below is a simplified list of the primary REST endpoints serving the application:
*   **Authentication**
    *   `POST /api/v1/auth/register` : User registration
    *   `POST /api/v1/auth/login` : Login & JWT issuance
    *   `POST /api/v1/auth/forgot-password` / `reset-password` : Recovery flow
*   **Products & Catalog**
    *   `GET /api/v1/products` : Browse catalog with query parameters (search, filter, sort)
    *   `GET /api/v1/products/<id>` : Product detail details
    *   `POST /api/v1/products` : CRUD creation *(Admin only)*
*   **Cart & Checkout**
    *   `GET /api/v1/cart` : Get active user cart
    *   `POST /api/v1/cart/items` : Add product to cart
    *   `POST /api/v1/cart/checkout` : Instantiate Stripe payment session
    *   `GET /api/v1/checkout/<session_id>/status` : Webhook state checking polling route
*   **Inventory & Orders**
    *   `GET /api/v1/inventory` : Retrieve user purchase history & keys
    *   `GET /api/v1/inventory/<id>/activate` : Reveal activation key code
    *   `POST /api/v1/payments/webhook` : Stripe webhook receiver endpoint

---

## ⚙️ 2. Integration Log & Technical Troubleshooting

During the final integration phase (connecting the React frontend with the Flask Python backend), several key engineering roadblocks were identified and resolved:

### 1. Stripe Asynchronous Webhook & State Synchronization
*   **The Issue**: Standard client redirect URLs from Stripe Checkout do not guarantee that backend operations (provisioning the keys) are completed. Users landed on the `SuccessPage` before the webhook processed the checkout, resulting in an empty inventory page.
*   **The Resolution**: We implemented a polling endpoint (`GET /api/v1/checkout/<session_id>/status`) on the backend. The frontend shows a loading spinner on the `SuccessPage` and polls this status until `fulfillment.items_provisioned` returns `true`.

### 2. CORS and Cookie-based Token Session Sharing
*   **The Issue**: During local Docker integration, frontend requests to Flask API were blocked due to cross-origin policies, and headers were stripped.
*   **The Resolution**: Confined CORS origins in Flask and consolidated api clients to always pass the Authorization headers.

### 3. Database Race Conditions on Key Allocation
*   **The Issue**: Simultaneous purchases of the last remaining key for a high-demand game led to double-allocation bugs where two different users bought the same key.
*   **The Resolution**: Enforced transactional blocks using SQLAlchemy with explicit checks on key availability. When the payment status validates, keys are locked using an `is_used` boolean and linked explicitly to the user transaction.

---

## 🧪 3. Quality Assurance (QA) & Test Coverage

To ensure stability, Level Up combines manual API contract validations with automated backend unit tests.

### 1. Automated Test Suite (Pytest)
We wrote unit tests targeting the service layer using pytest:
*   [cart_service_test.py](file:///home/moi/git/Work/Portfolio-Project/levelup/backend/test/pytest/cart_service_test.py)
*   [payment_service_test.py](file:///home/moi/git/Work/Portfolio-Project/levelup/backend/test/pytest/payment_service_test.py)
*   [stripe_service_test.py](file:///home/moi/git/Work/Portfolio-Project/levelup/backend/test/pytest/stripe_service_test.py)
*   [inventory_service_test.py](file:///home/moi/git/Work/Portfolio-Project/levelup/backend/test/pytest/inventory_service_test.py)

#### Run Tests Locally:
1. Navigate to the backend directory, create and activate the virtual environment:
   ```bash
   cd levelup/backend
   python -m venv venv
   source venv/bin/activate
   ```
2. Install application dependencies and test dependencies:
   ```bash
   pip install -r requirements.txt
   pip install -r test/pytest/requirements.txt
   ```
3. Run the test suite:
   ```bash
   pytest
   ```

### 2. Manual Endpoint Testing (Bruno)
We configured Bruno collections (stored in `levelup/backend/test/bruno`) to test all route schemas. These API specifications ensure no changes in data contract payloads break the React client side.

#### How to Use:
1. Open the [Bruno API Client](https://www.usebruno.com/).
2. Select **Open Collection** and choose the `levelup/backend/test/bruno` folder.
3. You can now execute and test routes (Authentication, Products, Cart, Orders, Admin panel, etc.) directly. The requests are pre-configured to point to `http://127.0.0.1:5000/api/v1`.

---

## 🌐 4. Operations & Deployment Runbook

### Prerequisites
*   **Docker & Docker Compose** installed
*   **Stripe API credentials** (Publishable and Secret keys for Test Mode)

### Configuration Variables (`.env`)
A `.env` file must be placed in the `levelup/` directory to inject credentials and configuration variables:

```env
SQLALCHEMY_DATABASE_URI="sqlite:///levelup.db"
SECRET_KEY="change-me"
JWT_SECRET_KEY="change-me-too"
FRONTEND_URL="http://localhost:5173"
STRIPE_SECRET_KEY="sk_test_..."
# STRIPE_WEBHOOK_SECRET="whsec_..."  # -> Only define this in production! (In dev, Stripe CLI handles it automatically)
MAIL_USERNAME="you@example.com"
MAIL_PASSWORD="your-app-password"
```

### Launch Commands
We created a simple wrapper using a [Makefile](file:///home/moi/git/Work/Portfolio-Project/levelup/Makefile) to streamline operations:

*   **Development Mode**:
    ```bash
    make dev
    ```
    This builds and launches the React client and Flask server with hot-reload features enabled.

*   **Showcase / Seeded Mode**:
    ```bash
    make showcase
    ```
    Loads the application seeded with mock catalog data, mock user lists, and pre-allocated keys for demonstration.

*   **Stop and Clean Containers**:
    ```bash
    make kill
    ```
    Tears down running services and deletes persistent development database volumes to reset the app state.

---

## 🔮 5. Roadmap & Technical Debt

1.  **Lootbox Mechanic Implementation**: Fully build the random crate opening logic, connecting it to the database using transactional rollbacks to guarantee that crates open safely without losing keys.
2.  **Automated End-to-End Frontend Testing**: Integrate Playwright or Cypress to automate client checkout flow tests.

---

**© 2026 — Level Up**  
*Artisanal gaming key delivery platform*  
*Developed by Ylan (Backend), Théo (Design/Frontend), Alexandre (Data/Fullstack)*
