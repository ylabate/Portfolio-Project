# LevelUp

A full-stack marketplace for buying and selling digital game keys. Browse a catalogue of games, manage a shopping cart, and complete purchases through Stripe. Includes an admin panel for product, inventory, and user management.

## Stack

- **Backend:** Flask, SQLAlchemy, Flask-JWT-Extended, Flask-Bcrypt, Flask-Mail, Stripe
- **Frontend:** React 19, Vite 8, React Router 7, Axios
- **Infrastructure:** Docker Compose

## Quick Start

```bash
cd levelup
make dev
```

Then open:
- Frontend: http://localhost:5173
- API: http://localhost:5000/api/v1

## Manual Setup

### Backend

```bash
cd levelup/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python run.py
```

### Frontend

```bash
cd levelup/frontend
npm install
npm run dev
```

## Environment Variables

Create a `.env` file in `levelup/backend/`:

```
SQLALCHEMY_DATABASE_URI="sqlite:///levelup.db"
SECRET_KEY="change-me"
JWT_SECRET_KEY="change-me-too"
FRONTEND_URL="http://localhost:5173"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
MAIL_USERNAME="you@example.com"
MAIL_PASSWORD="your-app-password"
```

## Make Commands

| Command | Description |
|---------|-------------|
| `make dev` | Start backend and frontend in development mode |
| `make showcase` | Start with showcase mode (pre-seeded data) |
| `make kill` | Stop containers and remove volumes |

## Frontend Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # Run oxlint
npm run preview  # Preview production build
```

## API Routes

- `POST /api/v1/auth/register` — register
- `POST /api/v1/auth/login` — login
- `POST /api/v1/auth/logout` — logout
- `POST /api/v1/auth/refresh` — refresh token
- `GET /api/v1/products` — list products
- `GET /api/v1/products/<id>` — product details
- `GET /api/v1/genres` — list genres
- `POST /api/v1/cart/items` — add to cart
- `POST /api/v1/cart/checkout` — create Stripe checkout session
- `GET /api/v1/orders` — order history
- `POST /api/v1/admin/products/<id>/activation-keys` — generate keys (admin)

## License

Built for the Holberton Portfolio Project.
