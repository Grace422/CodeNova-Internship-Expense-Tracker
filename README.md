# Expense Tracker — API Contract & Database Model

## 1. Overview

The Expense Tracker is a web application for recording and managing income and expenses. It provides a dashboard for reviewing financial activity, adding transactions, viewing transaction history, and deleting transactions.

This document describes the application's API contract, request and response formats, validation rules, database structure, and environment configuration.

### Technology Stack

- **Frontend:** Next.js, React, Tailwind CSS
- **Backend:** Next.js App Router API routes
- **Database:** MongoDB Atlas
---

## 2. API Contract

### Base URL

Local development:

```text
http://localhost:3000/api
```

Production:

```text
https://code-nova-internship-expense-tracke.vercel.app/
```

All endpoints return JSON responses. Requests that submit transaction data must use the appropriate JSON content type.

### API Endpoint Summary

| Method | Endpoint | Description |
|---|---|---|
| GET | `/transactions` | Retrieve all transactions |
| POST | `/transactions` | Create a new transaction |
| DELETE | `/transactions/:id` | Delete a transaction by its MongoDB ID |

---

## 3. Get All Transactions

**Endpoint:** `GET /api/transactions`

Retrieves all transactions from the MongoDB `ExpenseCollection` collection, sorted by transaction date in descending order.

### Successful Response

**Status:** `200 OK`

```json
[
  {
    "_id": "6ade088cb05d787fecc64009",
    "type": "expense",
    "amount": 250,
    "category": "Food",
    "description": "MongoDB save test",
    "date": "2026-10-25T00:00:00.000Z",
    "createdAt": "2026-10-25T13:47:56.524Z",
    "updatedAt": "2026-10-25T13:47:56.524Z"
  }
]
```

The response contains an array of transaction documents. MongoDB ObjectIds and dates are serialized as strings in JSON.

### Error Response

**Status:** `500 Internal Server Error`

```json
{
  "error": "Failed to fetch transactions"
}
```

---

## 4. Create a Transaction

**Endpoint:** `POST /api/transactions`

Creates a new income or expense record in MongoDB.

### Request Headers

```http
Content-Type: application/json
```

### Request Body

```json
{
  "type": "expense",
  "amount": 250,
  "category": "Food",
  "description": "Lunch",
  "date": "2026-10-25"
}
```

### Request Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `type` | String | Yes | Transaction type: `income` or `expense` |
| `amount` | Number | Yes | Positive monetary amount with at most two decimal places |
| `category` | String | Yes | Category valid for the selected transaction type |
| `description` | String | No | Optional description, up to 160 characters |
| `date` | String | No | Valid date value; defaults to the current date and time when omitted |

### Allowed Categories

**Income**
- `Salary`
- `Business`
- `Investment`
- `Other Income`

**Expense**
- `Food`
- `Transport`
- `Shopping`
- `Bills`
- `Health`
- `Education`
- `Entertainment`
- `Other Expense`

### Successful Response

**Status:** `201 Created`

The response contains the newly created transaction, including its generated MongoDB `_id` and timestamps.

```json
{
  "type": "expense",
  "amount": 250,
  "category": "Food",
  "description": "Lunch",
  "date": "2026-10-25T00:00:00.000Z",
  "createdAt": "2026-10-25T13:47:56.524Z",
  "updatedAt": "2026-10-25T13:47:56.524Z",
  "_id": "6ade088cb05d787fecc64009"
}
```

### Validation Errors

**Status:** `400 Bad Request`

Examples include an invalid transaction type, a non-positive amount, an amount with more than two decimal places, an invalid category, an invalid date, or a description exceeding 160 characters.

Example response:

```json
{
  "error": "Invalid category for the selected transaction type"
}
```

### Server Error

**Status:** `500 Internal Server Error`

```json
{
  "error": "Failed to create transaction"
}
```

---

## 5. Delete a Transaction

**Endpoint:** `DELETE /api/transactions/:id`

Deletes a transaction identified by its MongoDB ObjectId.

### Example Request

```http
DELETE /api/transactions/6ade088cb05d787fecc64009
```

Replace the example ID with the `_id` of the transaction to delete.

### Successful Response

The API should return a success response when the transaction is deleted. The exact JSON response depends on the implementation of the dynamic route.

### Possible Error Responses

| Status | Meaning |
|---|---|
| `400 Bad Request` | The supplied ID is invalid, if validated by the route |
| `404 Not Found` | No transaction exists with the supplied ID |
| `500 Internal Server Error` | An unexpected server or database error occurred |

---

## 6. Database Model

### Database Configuration

The application connects to MongoDB using the official MongoDB Node.js driver.

Environment variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | MongoDB connection string |
| `DATABASE_NAME` | Name of the database containing transaction records |

These variables should be configured in `.env.local` for local development and in the appropriate environment settings in Vercel for deployment.

**Security:** Never commit database credentials or the `.env.local` file to version control.

### Database and Collection

- **Database:** Determined by `DATABASE_NAME`
- **Collection:** `transactions`
- **Document identifier:** `_id`, generated by MongoDB

Each document represents one income or expense transaction.

### Transaction Document Structure

| Field | MongoDB Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | Yes | Unique identifier generated by MongoDB |
| `type` | String | Yes | `income` or `expense` |
| `amount` | Number | Yes | Positive monetary value |
| `category` | String | Yes | Transaction category |
| `description` | String | No | Description of the transaction |
| `date` | Date | Yes | Date associated with the transaction |
| `createdAt` | Date | No | Creation timestamp |
| `updatedAt` | Date | No | Last update timestamp |

The API sets `createdAt` and `updatedAt` when creating a new transaction. Since the application uses the native MongoDB driver, these timestamps are managed by application code rather than automatically by Mongoose.

### Example MongoDB Document

```json
{
  "_id": {
    "$oid": "6ade088cb05d787fecc64009"
  },
  "type": "expense",
  "amount": 250,
  "category": "Food",
  "description": "Lunch",
  "date": {
    "$date": "2026-10-25T00:00:00.000Z"
  },
  "createdAt": {
    "$date": "2026-10-25T13:47:56.524Z"
  },
  "updatedAt": {
    "$date": "2026-10-25T13:47:56.524Z"
  }
}
```

The example uses MongoDB Extended JSON notation to represent ObjectId and Date values.

### Database Operations

| Operation | MongoDB Driver Method |
|---|---|
| Retrieve transactions | `find({}).sort({ date: -1 }).toArray()` |
| Insert a transaction | `insertOne(transaction)` |
| Delete a transaction | `deleteOne({ _id: objectId })` |

---

## 7. Business Rules

1. Every transaction must be either income or expense.
2. Amounts must be positive numbers with no more than two decimal places.
3. A transaction's category must match its transaction type.
4. Descriptions cannot exceed 160 characters.
5. Transaction dates must be valid.
6. MongoDB generates a unique `_id` for each inserted transaction.
7. Transactions are retrieved with the newest transaction dates first.
8. Deleting a transaction removes its document from the database.

---

## 8. Architecture

The application follows a simple three-layer architecture:

```text
React / Next.js Frontend
          |
          | HTTP requests
          v
Next.js API Routes
          |
          | MongoDB Node.js Driver
          v
MongoDB Atlas
          |
          v
transactions Collection
```

### Frontend

The frontend provides the transaction form, financial overview, transaction table, and theme toggle. It communicates with the backend through the application's API routes.

### API Layer

Next.js API routes validate incoming transaction data, perform database operations, and return JSON responses with appropriate HTTP status codes.

### Database Layer

MongoDB Atlas stores transaction documents. The shared connection helper in `src/lib/mongodb.js` establishes and reuses the MongoDB client connection.

---

## 9. Testing the API

The endpoints can be tested using a browser, Thunder Client, Postman, or another HTTP client.

| Test | Expected Result |
|---|---|
| GET all transactions | `200 OK` with an array |
| POST a valid transaction | `201 Created` |
| POST an invalid amount | `400 Bad Request` |
| POST an invalid category | `400 Bad Request` |
| DELETE an existing transaction | Successful deletion response |
| DELETE a nonexistent transaction | `404 Not Found`, if handled by the route |
---



