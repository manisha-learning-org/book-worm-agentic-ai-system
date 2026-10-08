# Book Worm – Spring Boot Backend API

A RESTful backend for the **Book Worm** e-bookstore platform, built with:

- **Java 17** + **Spring Boot 3.2**
- **Spring Data JPA** + **Hibernate**
- **PostgreSQL** (production) / **H2** (quick local dev)
- **Spring Security** for CORS + BCrypt password hashing
- **Lombok** for boilerplate reduction

---

## 📁 Project Structure

```
backend/
├── pom.xml
└── src/main/
    ├── java/com/bookworm/
    │   ├── BookwormApplication.java       ← entry point
    │   ├── config/
    │   │   └── SecurityConfig.java        ← CORS + Security
    │   ├── controller/                    ← REST controllers
    │   │   ├── AuthController.java
    │   │   ├── BookController.java
    │   │   ├── CouponController.java
    │   │   ├── OrderController.java
    │   │   ├── UserController.java
    │   │   └── WishlistController.java
    │   ├── dto/                           ← Request / Response DTOs
    │   ├── entity/                        ← JPA entities
    │   ├── exception/                     ← Custom exceptions + global handler
    │   ├── repository/                    ← Spring Data JPA repositories
    │   ├── seeder/
    │   │   └── DataSeeder.java            ← Sample data on startup
    │   ├── service/                       ← Business logic
    │   └── util/
    │       └── SessionHelper.java         ← HTTP session auth helper
    └── resources/
        ├── application.properties         ← active profile selector
        ├── application-postgres.properties ← PostgreSQL config
        └── application-h2.properties      ← H2 in-memory config
```

---

## ⚙️ Prerequisites

| Tool | Version |
|------|---------|
| JDK  | 17+     |
| Maven | 3.8+  |
| PostgreSQL | 14+ (for postgres profile) |

---

## 🗄️ PostgreSQL Setup

1. Install PostgreSQL Community Edition:
   - Windows/macOS: https://www.postgresql.org/download/
   - Ubuntu: `sudo apt install postgresql`

2. Create the database:
   ```sql
   psql -U postgres
   CREATE DATABASE bookworm;
   \q
   ```

3. Update credentials in `application-postgres.properties` if yours differ:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/bookworm
   spring.datasource.username=postgres
   spring.datasource.password=postgres
   ```

---

## 🚀 Running the Application

### Option A – PostgreSQL (default)

```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

### Option B – H2 (no PostgreSQL required)

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=h2
```

The H2 browser console is available at: http://localhost:8080/h2-console
(JDBC URL: `jdbc:h2:mem:bookworm`, user: `sa`, no password)

The server starts on **http://localhost:8080**

Sample data (books, demo user, coupons) is seeded automatically on first startup.

**Demo user credentials:**
- Email: `priya.sharma@example.com`
- Password: `demo123`

---

## 🔌 API Endpoints

All responses follow this envelope:
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login (sets JSESSIONID cookie) |
| POST | `/api/auth/logout` | Logout |

### Books
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/books` | List books (`?q=&category=&format=&lang=&price=&sort=`) |
| GET | `/api/books/{id}` | Book detail |
| GET | `/api/books/{id}/related` | Related books |
| GET | `/api/books/recommended` | Recommended books |
| GET | `/api/books/bestsellers` | Bestsellers |
| GET | `/api/books/new-launches` | New launches |
| GET | `/api/books/{id}/reviews` | Reviews for a book |
| POST | `/api/books/{id}/reviews` 🔒 | Submit a review |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` 🔒 | Get profile |
| PUT | `/api/users/me` 🔒 | Update profile |
| GET | `/api/users/me/addresses` 🔒 | List addresses |
| POST | `/api/users/me/addresses` 🔒 | Add address |
| DELETE | `/api/users/me/addresses/{id}` 🔒 | Remove address |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` 🔒 | Place order |
| GET | `/api/orders` 🔒 | My orders |
| GET | `/api/orders/{id}` 🔒 | Order detail |
| PATCH | `/api/orders/{id}/cancel` 🔒 | Cancel order |

### Coupons
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/coupons/validate` | Validate coupon |

### Wishlist
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wishlist` 🔒 | My wishlist |
| POST | `/api/wishlist` 🔒 | Add to wishlist |
| DELETE | `/api/wishlist/{bookId}` 🔒 | Remove from wishlist |

🔒 = requires login (JSESSIONID cookie)

---

## 🧪 Testing with Insomnia / Postman

1. Import base URL: `http://localhost:8080`
2. Login first: `POST /api/auth/login` → the cookie is set automatically
3. All subsequent requests in the same session will be authenticated

**Sample login request:**
```json
POST /api/auth/login
{
  "email": "priya.sharma@example.com",
  "password": "demo123"
}
```

**Sample place order request:**
```json
POST /api/orders
{
  "items": [
    { "bookId": "<id>", "quantity": 1, "selectedFormat": "Paperback", "priceAtAdd": 499 }
  ],
  "address": {
    "fullName": "Priya Sharma",
    "phone": "9876543210",
    "line1": "42 Elm Street",
    "city": "Bengaluru",
    "state": "Karnataka",
    "pincode": "560095"
  },
  "paymentMethod": "Credit Card"
}
```

---

## 🔧 Git Workflow (as per the slides)

```bash
git checkout -b feature/spring-boot-api
git add .
git commit -m "Implement Spring Boot REST API for Book Worm e-commerce"
git push origin feature/spring-boot-api
# Then create a Pull Request on GitHub
```
