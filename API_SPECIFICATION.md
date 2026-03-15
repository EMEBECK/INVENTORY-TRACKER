# API Specification & Endpoint Documentation

This document outlines the REST API for the Smart Inventory Tracker, which handles inventory and stock management.

## Base URL
`/api/v1`

---

## 1. Create Inventory Item
**Endpoint:** `POST /inventory`  
**Description:** Adds a new item to the inventory system.

### Request Body (application/json)
```json
{
  "name": "Widget A",
  "sku": "WID-001",
  "category": "Electronics",
  "quantity": 100,
  "threshold": 20,
  "price": 19.99,
  "supplier": "Acme Corp"
}
```

### Validation Rules
- `name`: Required, String
- `quantity`: Required, Number (>= 0)
- `threshold`: Required, Number (>= 0)

### Success Response
- **Code:** 201 Created
- **Content:**
```json
{
  "success": true,
  "data": {
    "id": "item_12345",
    "name": "Widget A",
    "sku": "WID-001",
    "category": "Electronics",
    "quantity": 100,
    "threshold": 20,
    "price": 19.99,
    "supplier": "Acme Corp",
    "is_low_stock": false,
    "created_at": "2026-03-14T12:00:00Z",
    "updated_at": "2026-03-14T12:00:00Z"
  }
}
```

---

## 2. Get All Inventory Items
**Endpoint:** `GET /inventory`  
**Description:** Retrieves a list of all inventory items.

### Query Parameters (Optional)
- `status`: Filter by status (`low_stock`, `out_of_stock`, `healthy`)
- `search`: Search by name or SKU

### Success Response
- **Code:** 200 OK
- **Content:**
```json
{
  "success": true,
  "data": [
    {
      "id": "item_12345",
      "name": "Widget A",
      "quantity": 100,
      "threshold": 20,
      "is_low_stock": false,
      "...": "..."
    }
  ]
}
```

---

## 3. Get Unique Categories
**Endpoint:** `GET /inventory/categories`  
**Description:** Retrieves a unique list of all categories currently assigned to items in the inventory.

### Success Response
- **Code:** 200 OK
- **Content:**
```json
{
  "success": true,
  "data": ["Electronics", "Furniture", "Accessories"]
}
```

---

## 4. Update Inventory Item
**Endpoint:** `PUT /inventory/{id}`  
**Description:** Edits item details. Note: Stock quantity cannot be directly updated here to ensure accurate stock logging. Use the `/stock` endpoint instead.

### Request Body
```json
{
  "name": "Widget A Pro",
  "category": "Premium Electronics",
  "threshold": 25,
  "price": 24.99,
  "supplier": "Acme Corp"
}
```

### Success Response
- **Code:** 200 OK
- **Content:** Updated item object.

---

## 4. Update Stock
**Endpoint:** `POST /inventory/{id}/stock`  
**Description:** Updates the stock quantity of a specific item and creates a stock log entry.

### Request Body
```json
{
  "change_amount": -5,
  "update_type": "sale", 
  "reason": "Fulfilled order #998"
}
```
*Note: `update_type` can be `purchase`, `sale`, or `adjustment`. `change_amount` can be positive or negative.*

### Validation Rules
- Total stock after change must not result in an impossible state (e.g., negative stock).

### Success Response
- **Code:** 200 OK
- **Content:**
```json
{
  "success": true,
  "data": {
    "item": {
      "id": "item_12345",
      "quantity": 95,
      "is_low_stock": false,
      "...": "..."
    },
    "log": {
      "id": "log_001",
      "item_id": "item_12345",
      "change_amount": -5,
      "update_type": "sale",
      "reason": "Fulfilled order #998",
      "timestamp": "2026-03-14T12:15:00Z"
    }
  }
}
```

---

## Standard Error Responses
- **400 Bad Request:** Missing fields or validation error.
- **404 Not Found:** Item with given ID does not exist.
- **422 Unprocessable Entity:** Business rule violation (e.g., deducting more stock than available).
- **500 Internal Server Error:** Unexpected server-side issue.
