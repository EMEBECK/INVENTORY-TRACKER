# API Usage Guide: Smart Inventory Tracker

This guide provides practical examples and workflows for developers and integrators consuming the Smart Inventory Tracker REST API.

For the raw technical specifications (Request/Response schemas, validation rules), refer to the internal `API_SPECIFICATION.md`.

## 1. Authentication

The API uses stateless JSON Web Tokens (JWT) for authentication.

### Obtaining a Token

*Note: The login endpoint is managed by the Auth Service (not part of the core inventory CRUD API).*

```bash
curl -X POST https://api.inventorytracker.example.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "manager@example.com", "password": "yourpassword"}'
```

**Response:**
Tokens are returned securely via `Set-Cookie` headers. Your HTTP client must be configured to include credentials (cookies) in subsequent requests.

## 2. Common Workflows

All examples assume a Base URL of `https://api.inventorytracker.example.com/v1`.

### Workflow A: Adding a New Product to Tracking

Before tracking stock, the entity metadata must be created.

**Request:**
```bash
curl -X POST /inventory \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=eyJhbGciOiJIUzI1NiIsIn..." \
  -d '{
    "name": "Wireless Mechanical Keyboard",
    "sku": "KB-MECH-WLESS-01",
    "category": "Peripherals",
    "quantity": 50,
    "threshold": 10,
    "price": 129.99,
    "supplier": "TechGear Corp"
  }'
```

**What happens:**
1. The system creates the item.
2. Initial stock is set to 50.
3. The system evaluates the `quantity` (50) against the `threshold` (10). It is marked as `is_low_stock: false`.

### Workflow B: Fetching the Dashboard Data (Filtering)

To power a "Low Stock Warning" widget, you can filter the inventory list API.

**Request:**
```bash
curl -X GET "/inventory?status=low_stock" \
  -H "Cookie: accessToken=eyJhbGciOiJIUzI... "
```

**Response Extract:**
```json
{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "USB-C Cables (2m)",
      "quantity": 4,
      "threshold": 15,
      "is_low_stock": true
    }
  ]
}
```

### Workflow C: Recording a Sale (Deducting Stock)

**CRITICAL:** Never use `PUT /inventory/{id}` to update the quantity directly. That request will ignore the quantity payload to preserve data integrity. You must use the `/stock` endpoint to generate an audit log.

**Scenario:** 3 keyboards were sold.

**Request:**
```bash
# ID belonging to the Mechanical Keyboard created earlier
curl -X POST /inventory/123e4567-e89b-12d3-a456-426614174000/stock \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=eyJhbG..." \
  -d '{
    "change_amount": -3,
    "update_type": "sale",
    "reason": "Order #88921 Fulfilled via Web Store"
  }'
```

**Response Details:**
The response will return both the updated item state (now Quantity: 47) and the newly generated `log` record detailing who made the change and why.

### Workflow D: Restocking (Adding Stock)

**Scenario:** A new palette of keyboards arrived.

**Request:**
```bash
curl -X POST /inventory/123e4567-e89b-12d3-a456-426614174000/stock \
  -H "Content-Type: application/json" \
  -d '{
    "change_amount": 100,
    "update_type": "purchase",
    "reason": "PO #104 Received into Warehouse A"
  }'
```

### Workflow E: Manual Inventory Audit (Setting Stock)

**Scenario:** During a stocktake, you discover only 145 keyboards exist, not 147 as the system thought. You need to manually correct the number.

**Request:**
```bash
curl -X POST /inventory/123e4567-e89b-12d3-a456-426614174000/stock \
  -H "Content-Type: application/json" \
  -d '{
    "change_amount": 145, 
    "update_type": "adjustment",
    "reason": "Q3 Manual Stocktake Discrepancy Correction"
  }'
```
*Note: When `update_type` is `adjustment`, the system treats `change_amount` as the absolute new value, rather than a differential addition/subtraction.*

## 3. Handling API Errors

The API uses standardized HTTP status codes and a uniform JSON error envelope.

Wait for a 2xx success code. If a 4xx or 5xx is encountered, parse the `error` object.

**Example 422 Unprocessable Entity (Business Logic Failure):**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Cannot deduct 10 items. Current stock is 5.",
    "details": {
      "item_id": "123e4567-e89b-12d3-a456-426614174000",
      "attempted_deduction": 10,
      "available_stock": 5
    }
  }
}
```

**Common Status Codes:**
- `400 Bad Request`: Invalid JSON payload structure or missing required fields.
- `401 Unauthorized`: Missing or invalid JWT cookie.
- `403 Forbidden`: Valid JWT, but the user's Role lacks permission for the endpoint.
- `404 Not Found`: The requested Inventory ID does not exist.
- `422 Unprocessable Entity`: Data is valid, but violates business rules (e.g., negative stock, duplicate SKU).
- `500 Internal Server Error`: Generic fallback. Do not parse the body; alert systems engineering.
