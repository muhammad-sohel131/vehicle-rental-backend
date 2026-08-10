# Vehicle Rental Management Backend

A REST API for a vehicle rental company. Staff log in and manage the vehicle fleet; customer bookings are recorded as rentals, with overlap prevention and monthly revenue reporting.

## Tech Stack

- Node.js + TypeScript (OOP structure: controllers → services → models)
- Express
- Knex (query builder) + PostgreSQL
- JWT authentication, bcrypt password hashing
- Joi validation
- Multer (local photo storage)
- ESLint + Prettier

## Prerequisites

- Node.js (v18+)
- PostgreSQL (v14+)

## Setup

1. **Clone the repository**

```bash
   git clone <repo-url>
   cd vehicle-rental-backend
```

2. **Install dependencies**

```bash
   npm install
```

3. **Create the database**

```sql
   CREATE DATABASE vehicle_rental;
```

4. **Configure environment variables**

   Copy `.env.example` to `.env` and fill in your local values:

```bash
   cp .env.example .env
```

   | Variable          | Description                          |
   | ----------------- | ------------------------------------ |
   | `PORT`            | Port the server runs on              |
   | `DB_HOST`         | PostgreSQL host                      |
   | `DB_PORT`         | PostgreSQL port                      |
   | `DB_USER`         | PostgreSQL username                  |
   | `DB_PASSWORD`     | PostgreSQL password                  |
   | `DB_NAME`         | Database name (`vehicle_rental`)     |
   | `JWT_SECRET`      | Secret key used to sign JWT tokens   |
   | `JWT_EXPIRES_IN`  | Token expiry (e.g. `1d`)             |
   | `UPLOAD_PATH`     | Local folder for uploaded photos     |

5. **Run migrations**

```bash
   npm run migrate
```

6. **Seed the database**

```bash
   npm run seed
```

   This creates one staff user and sample vehicles/rentals, including a rental
   spanning a month boundary (Jul 29 – Aug 3) to exercise the reports endpoint.

   **Seeded login credentials:**
   - Email: `admin@vehiclerental.com`
   - Password: `password123`

7. **Start the dev server**

```bash
   npm run dev
```

   Server runs on `http://localhost:3000` by default.

## Scripts

| Command                    | Description                          |
| --------------------------- | ------------------------------------ |
| `npm run dev`               | Start dev server with hot reload     |
| `npm run build`              | Compile TypeScript to `dist/`        |
| `npm start`                  | Run the compiled build               |
| `npm run migrate`            | Run database migrations              |
| `npm run migrate:rollback`   | Rollback the last migration batch    |
| `npm run seed`               | Run database seeds                   |
| `npm run lint`               | Run ESLint                           |
| `npm run format`             | Format code with Prettier            |

## API Endpoints

### Auth

- `POST /auth/login` — `{ email, password }` → `{ token, staff }`

All routes below require `Authorization: Bearer <token>`.

### Vehicles

- `GET /vehicles` — query: `page`, `limit`, `category`, `search`
- `GET /vehicles/:id`
- `POST /vehicles` — multipart form-data: `name`, `plate_number`, `category`, `daily_rate`, `photo` (optional file)
- `PUT /vehicles/:id` — same fields, all optional; `photo` replaces the existing one
- `DELETE /vehicles/:id` — soft delete

### Rentals

- `GET /rentals` — query: `page`, `limit`, `vehicle_id`, `status`, `from_date`, `to_date`
- `GET /rentals/:id`
- `POST /rentals` — `{ vehicle_id, customer_name, customer_phone, start_date, end_date }`
  - Returns `409` if the vehicle has an overlapping active rental
  - `total_amount` is calculated server-side
- `PUT /rentals/:id` — date changes re-trigger the overlap check
- `DELETE /rentals/:id`

### Reports

- `GET /reports/rentals?month=YYYY-MM&vehicle_id=` (optional)
  - Per vehicle: `id`, `name`, `total_bookings`, `days_rented`, `revenue`
  - Only counts the portion of a rental that falls within the requested month
  - Includes `top_vehicle` — the vehicle with the highest revenue that month

## Design Notes

- **Overlap prevention** uses PostgreSQL's `OVERLAPS` operator via raw SQL
  (`src/models/rental.model.ts`), wrapped in a transaction with a
  `pg_advisory_xact_lock` on the `vehicle_id`, so two concurrent booking
  requests for the same vehicle can't both succeed (see bonus requirements).
- **Monthly report** uses raw SQL with `GREATEST`/`LEAST` to clamp each
  rental's date range to the requested month before computing days and
  revenue (`src/models/report.model.ts`).
- **Soft delete** on vehicles uses a nullable `deleted_at` column; all vehicle
  queries filter it out by default.
- Uploaded photos are stored locally under `UPLOAD_PATH` (default `uploads/`).