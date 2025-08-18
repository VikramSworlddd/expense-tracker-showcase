# Expense Tracker

A production-quality expense tracking application built as a portfolio project.

## Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **Auth**: JWT in httpOnly cookies
- **Validation**: Zod

## Features

- 📊 **Dashboard** - Monthly summary with spending charts and category breakdown
- 💰 **Expenses** - Full CRUD with filtering, search, and pagination
- 🏷️ **Categories** - Manage expense categories
- 🔐 **Authentication** - Secure login with bcrypt + JWT

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd expense-tracker

# Install dependencies
npm install
```

### Environment Setup

Create the following environment files:

#### `apps/api/.env`

```env
PORT=4003
JWT_SECRET=your_super_secret_jwt_key_change_in_production
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123!
DB_PATH=./data/dev.db
```

#### `apps/web/.env`

```env
VITE_API_BASE=/api
```

### Database Setup

```bash
# Create tables and indexes
npm run db:migrate

# Seed admin user, categories, and sample expenses
npm run db:seed
```

### Running the Application

```bash
# Start both frontend and backend in development mode
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **API**: http://localhost:4003

### Default Login

After seeding, use these credentials:

- **Email**: `admin@example.com`
- **Password**: `ChangeMe123!`

(Or whatever you set in `ADMIN_EMAIL` and `ADMIN_PASSWORD`)

## Project Structure

```
expense-tracker/
├── apps/
│   ├── api/                 # Express API
│   │   ├── src/
│   │   │   ├── db/          # Database setup, migrations, seeds
│   │   │   ├── middleware/  # Auth, error handling, headers
│   │   │   ├── routes/      # API routes
│   │   │   └── validation/  # Zod schemas
│   │   └── package.json
│   │
│   └── web/                 # React frontend
│       ├── src/
│       │   ├── components/  # Reusable components
│       │   ├── context/     # Auth context
│       │   ├── lib/         # API client, utilities
│       │   └── pages/       # Page components
│       └── package.json
│
├── package.json             # Root workspace config
└── README.md
```

## API Endpoints

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category (reassigns expenses to Uncategorized)

### Expenses
- `GET /api/expenses` - List expenses (with filters: month, categoryId, q, page)
- `GET /api/expenses/:id` - Get single expense
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Metrics
- `GET /api/metrics/month?month=YYYY-MM` - Get monthly dashboard data

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend |
| `npm run build` | Build for production |
| `npm run db:migrate` | Create database tables |
| `npm run db:seed` | Seed initial data |

## Data Model

### Users
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | UUID primary key |
| email | TEXT | Unique email |
| password_hash | TEXT | Bcrypt hash |
| created_at | TEXT | ISO timestamp |

### Categories
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | UUID primary key |
| name | TEXT | Unique, lowercase |
| created_at | TEXT | ISO timestamp |

### Expenses
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | UUID primary key |
| amount_cents | INTEGER | Amount in cents |
| date | TEXT | YYYY-MM-DD |
| merchant | TEXT | Optional |
| description | TEXT | Optional |
| payment_method | TEXT | CARD, CASH, or OTHER |
| category_id | TEXT | FK to categories |
| created_at | TEXT | ISO timestamp |
| updated_at | TEXT | ISO timestamp |

## License

MIT

