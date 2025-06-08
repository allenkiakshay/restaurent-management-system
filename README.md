# 🍽️ Restaurant Commerce – Next.js Full‑Stack App

A production‑ready food‑ordering platform where **users** browse country‑filtered restaurants & menus, **managers** oversee daily operations, and **admins** handle payments and system settings.

---

## 🚀 Features

| Module / Capability                                    | User | Manager | Admin |
|--------------------------------------------------------|:----:|:-------:|:-----:|
| View restaurants (auto‑filtered by visitor’s country)  | ✅   | ✅      | ✅    |
| View menus & item details                              | ✅   | ✅      | ✅    |
| Add items to cart & place orders                       | ✅   | ✅      | ✅    |
| Update / fulfil order status                           |      | ✅      | ✅    |
| Checkout & charge customer card               |      | ✅      | ✅    |
| Cancel orders                                 |      | ✅      | ✅    |
| Update accepted payment methods                        |      |         | ✅    |
| Role‑based authentication (nextauth)                      | ✅   | ✅      | ✅    |

---

## 🛠️ Tech Stack

| Layer         | Technology                                                    |
|---------------|-------------------------------------------------------------- |
| Framework     | **Next.js 14** (App Router) + React 18                       |
| Styling       | Tailwind CSS + shadcn/ui                                      |
| Data‑fetching | axios + Next.js Route Handlers                       |
| Auth          | **NextAuth** (JWT sessions)                                      |
| Database      | **PostgreSQL** on **AWS RDS** (Prisma ORM)                    |
| CI / CD       | GitHub Actions → Vercel preview & production                  |
| Hosting       | **Vercel** (custom domain: `https://food.yourbrand.com`)      |

---

## ⚙️ Local Setup

1. **Clone & install**

   ```bash
   git clone https://github.com/allenkiakshay/restaurent-management-system
   cd restaurent-management-system
   npm install           # or npm / yarn

2. **Configure env vars**

   ```bash
   cp .env.example .env
   # .env (sample)
   DATABASE_URL = "DATABASE_URL_PLACEHOLDER"
   NEXTAUTH_URL= http://localhost:3000
   NEXTAUTH_SECRET= NEXTAUTH_SECRET_PLACEHOLDER
   JWT_SECRET= JWT_SECRET_PLACEHOLDER
   
3. **Run migrations & seed demo data**

   ```bash
   npx prisma migrate dev
   
5. **Start dev server**

   ```bash
   npm run dev


## 🌍 Country-based Visibility

**Purpose:** Show restaurants relevant to the visitor’s country only.

### • How it works:

1. Queries for `/restaurants` & `/menu` include `where: { country: userCountry }`.
2. If lookup fails, default country is configurable (`DEFAULT_COUNTRY=IN`).




## 🌐 Deployment

### Workflow

1. **Push to** `main` ➝ GitHub Actions triggers lint, test, and build.
2. **Vercel** automatically deploys preview ➝ production on success.
3. **Custom Domain**
   - Add domain in Vercel dashboard (`https://sloozeassignment.akshayallenki.in.net/`).
   - Point DNS `A` / `CNAME` records to Vercel endpoints.
4. **Environment Variables** are managed per-environment in Vercel settings.

---

### Production Diagram

```scss
Visitor
|
├──▶ Vercel Edge (Next.js Middleware: Geo-IP)
|   |
|   ├──▶ Serverless Function (Route Handler)
|   |     ├──▶ Prisma ORM
|   |     └──▶ Stripe API
|   |
|   └──▶ Static Assets (ISR)
|
└──▶ Browser
```

---

## 👥 Dummy Accounts

| **Role**  | **Email**                      | **Password** | **Country** | **Phone**         |
|-----------|--------------------------------|--------------|-------------|-------------------|
| User      | `testuser@gamil.com`             | `12345678`   | `IN`        | 1234567890   |
| Manager   | `testmanager@gmail.com`   | `12345678`    | `IN`        | 0987654321   |
| Admin     | `testadmin@gmail.com`   | `12345678`  | `IN`        | 9999999999   |
| User 1    | `testuser1@gmail.com`          | `12345678`  | `US`        | 5432167890

---

# 📖 API Documentation
This document provides an overview of all available API endpoints. Each section details endpoints, HTTP methods, request parameters, response schemas, and examples.

---


## 🧾 Base URL
https://sloozeassignment.akshayallenki.in.net/

pass the access token in headers where the access_token is a auto generated token using jwt with session user feilds and required feilds valid for 60sec

```http
access_token: token | null,

```

## Table of Contents

1. [Cart APIs](#cart-apis)
2. [Fetch APIs](#fetch-apis)
3. [Order APIs](#order-apis)

---

## Cart APIs

### POST /cart/add

- **Description:** Add or Delete or Modify count of Items to cart.
- **Request Body:**
  ```json
  {
    "itemId": "string",
    "restaurantId": "string",
    "type": "increment or decrement or delete"
  }
  ```
- **Response Example:**
  ```json
  {
    "data": [
      {
        "message": "Item Removed Successfully.",
        "status": 200
      }
    ]
  }
  ```

### GET /cart/fetch

- **Description:** Fetch Cart Items.

- **Response Example:**
  ```json
  {
    "id": "string",
    "name": "string",
    "image": "string | null",
    "price": "number",
    "quantity": "number",
    "restaurentId": "string",
    "category": "string"
  }
  ```

---

## Fetch APIs

### GET /fetch/menu

- **Description:** Fetch the menu of a restuarent.
  Pass restaurent Id in the token data
- **Response Example:**
  ```json
  [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "price": "number",
      "restaurantName": "string",
      "imageUrl": "string"
    }
  ]
  ```

### GET /fetch/user

- **Description:** Fetch User Profile.

- **Response Example:**

  ```json
  {
    "id": "hgdf",
    "name": "string",
    "email": "string",
    "role": "string",
    "country": "string",
    "phoneNumber": "string"
  }
  ```

### GET /fetch/restaurants

- **Description:** Fetch Restaurants according to user country wise.

- **Response Example:**
  ```json
  {
    "id": "",
    "name": "",
    "address": "",
    "cuisine": "",
    "rating": "",
    "image": "",
    "pricelevel": ""
  }
  ```

---

## Order APIs

### POST /order/cancel

- **Description:** Retrieve orders for a user.
- **Response Example:**
  ```json
  {
    "message": "Order Cancelled Successfully",
    "status": 200
  }
  ```

### POST /order/create

- **Description:** Create a new order.
- **Response Example:**
  ```json
  {
    "message": "Order Created Successfully",
    "status": 200
  }
  ```

### POST /order/fetch

- **Description:** Fetch orders.
- **Response Example:**
  ```json
  {
    "id": "string",
    "name": "string",
    "image": "string | null",
    "price": "number",
    "quantity": "number",
    "restaurentId": "string",
    "category": "string",
    "cartId": "string"
  }
  ```

### POST /order/payment

- **Description:** Make Payment.
- **Response Example:**
  ```json
  {
    "message":"Payment Successful",
    "status":200
  }
  ```

### POST /order/payment/modify

- **Description:** Modify Payment.

- **Response Example:**
  ```json
  {
    "message":"Payment Modified Successful",
    "status":200
  }
  ```

---

## Error Handling

API responses include appropriate HTTP status codes along with a JSON payload for errors.

### Common Error Structure

- **Response Example:**
  ```json
  {
    "error": {
      "code": 400,
      "message": "Bad Request - Invalid parameters."
    }
  }
  ```
- **Error Codes:**
  - 400: Bad Request
  - 401: Unauthorized
  - 403: Worng Feilds
  - 404: Not Found
  - 500: Internal Server Error

---

For further details or additional endpoints, please refer to the full API guide.
