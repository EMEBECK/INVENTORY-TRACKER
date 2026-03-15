# Business Logic Implementation

This document details the core business rules, validation constraints, and calculation logic required for the backend of the Smart Inventory Tracker.

## 1. Validation Rules

All incoming data must be sanitized and validated before processing to ensure data integrity.

### Inventory Creation (POST `/inventory`)
- **Name:** Required string, max length 255.
- **SKU:** Optional string, but must be unique if provided.
- **Quantity:** Required integer. Cannot be negative (`>= 0`).
- **Threshold:** Required integer. Cannot be negative (`>= 0`).
- **Price:** Optional numeric value (`>= 0.00`).

### Inventory Editing (PUT `/inventory/{id}`)
- Similar length/format constraints as creation.
- Cannot update `quantity` via this method to prevent unlogged stock changes.

### Stock Update (POST `/inventory/{id}/stock`)
- **Change Amount:** Required integer. Can be negative (deduction) or positive (addition). Not 0.
- **Update Type:** Required string. Must be one of `['purchase', 'sale', 'adjustment']`.
- **Reason:** Required string if `update_type` is `adjustment`. Otherwise optional.

---

## 2. Stock Calculation Logic

The stock calculation must be an atomic operation (preferably using database transactions) to prevent race conditions during concurrent updates.

### Formula
```
New Quantity = Current Quantity + Change Amount
```
*Note: If `Change Amount` is negative, the addition naturally functions as a subtraction.*

### Constraint Check
Before applying the update, the backend must verify:
```javascript
if (Current Quantity + Change Amount < 0) {
    throw UnprocessableEntityError("Stock cannot drop below zero.");
}
```

---

## 3. Stock Log Recording

Every time a stock calculation occurs successfully, the system MUST record the event in the `StockLog` table. This ensures full traceability.

```javascript
// Pseudo-code implementation
async function updateStock(itemId, changeAmount, updateType, reason) {
    db.transaction(async (trx) => {
        // 1. Fetch item with row-lock
        const item = await trx.getItem(itemId);
        
        // 2. Calculate new stock
        const newStock = item.quantity + changeAmount;
        if (newStock < 0) throw Error("Invalid stock reduction");
        
        // 3. Update inventory item
        await trx.updateItemQuantity(itemId, newStock);
        
        // 4. Create Stock Log
        await trx.createStockLog({
            item_id: itemId,
            change_amount: changeAmount,
            update_type: updateType,
            reason: reason,
            timestamp: new Date()
        });
    });
}
```

---

## 4. Low Stock Detection

The backend runs a low-stock check automatically upon item retrieval and after any stock update.

### Logic
```javascript
is_low_stock = (current_quantity <= threshold)
```

### Application in API
- Read operations (GET `/inventory`) will compute this dynamically or return a database-persisted boolean to the frontend.
- When an update operation triggers `is_low_stock` to become `true`, the backend could theoretically emit a WebSocket event or queue an email notification, though for the MVP, just returning this state correctly in the REST payload enables the frontend to display dashboard alerts.
