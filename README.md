# Book Worm – E-Bookstore

A full-stack e-bookstore built with **Next.js 16** (frontend) and **Spring Boot 3.2** (backend API).

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| State Management | Zustand |
| Database (dev) | SQLite via Prisma ORM |
| Backend API | Java 17, Spring Boot 3.2, Spring Data JPA |
| Database (prod) | PostgreSQL 14+ |

---

## 📋 Prerequisites

Make sure the following tools are installed before starting:

| Tool | Version | Required for |
|------|---------|--------------|
| Node.js | 18+ | Frontend |
| npm | 9+ | Frontend |
| Java JDK | 17+ | Backend |
| Maven | 3.8+ | Backend |
| PostgreSQL | 14+ | Backend (postgres profile) |

---

## ⚡ Quick Start

### 1 — Clone the repository

```bash
git clone <repository-url>
cd Book-store-project
```

---

### 2 — Frontend (Next.js)

#### 2.1 Install dependencies

```bash
npm install
```

#### 2.2 Configure environment

Create a `.env.local` file in the project root (if it does not already exist):

```env
DATABASE_URL="file:./dev.db"
```

#### 2.3 Set up the database

Run the following commands in order:

```bash
# Generate the Prisma client
npm run db:generate

# Apply migrations and create the SQLite database
npm run db:migrate

# Seed the database with sample data
npm run db:seed
```

#### 2.4 Start the development server

```bash
npm run dev
```

The frontend is now running at **http://localhost:3000**

---

### 3 — Backend (Spring Boot)

The backend exposes a REST API on **http://localhost:8080**.

#### Option A – H2 in-memory database (no PostgreSQL required)

This is the quickest way to get started locally:

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=h2
```

H2 browser console: http://localhost:8080/h2-console  
(JDBC URL: `jdbc:h2:mem:bookworm` · User: `sa` · Password: _(empty)_)

#### Option B – PostgreSQL (default / production-like)

1. Create the database:

```sql
psql -U postgres
CREATE DATABASE bookworm;
\q
```

2. Verify credentials in `backend/src/main/resources/application-postgres.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/bookworm
spring.datasource.username=postgres
spring.datasource.password=postgres
```

3. Build and run:

```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

Sample data (books, demo user, coupons) is seeded automatically on first startup.

**Demo login credentials:**
- Email: `priya.sharma@example.com`
- Password: `demo123`

---

## 🖥️ Running Both Services Together

Open **two terminal windows** and run each service in parallel:

| Terminal | Command | URL |
|----------|---------|-----|
| 1 – Frontend | `npm run dev` | http://localhost:3000 |
| 2 – Backend | `cd backend && ./mvnw spring-boot:run` | http://localhost:8080 |

---

## 📦 Available Scripts (Frontend)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server (run `build` first) |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Re-generate the Prisma client after schema changes |
| `npm run db:migrate` | Apply new Prisma migrations |
| `npm run db:seed` | Re-seed the database with sample data |
| `npm run db:studio` | Open Prisma Studio (visual database browser) |

---

## 🗂️ Project Structure

```
Book-store-project/
├── src/
│   ├── app/            ← Next.js App Router pages & API routes
│   ├── components/     ← Reusable React components
│   └── lib/            ← Prisma client, session helpers
├── prisma/
│   ├── schema.prisma   ← Database schema
│   ├── seed.ts         ← Seed script
│   └── dev.db          ← SQLite database (auto-created)
├── backend/            ← Spring Boot REST API
│   ├── pom.xml
│   └── src/
├── public/             ← Static assets
└── .env.local          ← Environment variables (not committed)
```

---

## 🔌 Backend API Reference

All responses follow this envelope:

```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

Key endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/books` | List books (supports `?q=&category=&format=&sort=`) |
| GET | `/api/books/{id}` | Book detail |
| GET | `/api/users/me` 🔒 | Get profile |
| POST | `/api/orders` 🔒 | Place order |
| GET | `/api/orders` 🔒 | My orders |
| GET | `/api/wishlist` 🔒 | My wishlist |

🔒 = requires login (JSESSIONID cookie)

See [`backend/README.md`](backend/README.md) for the full API reference.

---

## 🚀 Production Build

### Frontend

```bash
npm run build
npm run start
```

### Backend

```bash
cd backend
./mvnw clean package
java -jar target/bookworm-*.jar
```

---

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Spring Boot Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/)
