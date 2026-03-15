# End User Manual: Smart Inventory Tracker

Welcome to the **Smart Inventory Tracker**. This guide covers the basic features of the application, helping you monitor stock levels, add new products, and track inventory movements to keep your business running smoothly.

---

## 1. Getting to Know the Dashboard

The Dashboard is the first page you see when logging in. It gives you a quick snapshot of your inventory health.

### Top Metrics Cards
At the top of the dashboard, you will find three key numbers:
1. **Total Items:** The total unique products tracked in your system.
2. **Low Stock Alerts:** The number of products that have fallen below their safe threshold. *(If this number is greater than 0, it will be highlighted in Yellow or Red).*
3. **Recently Updated:** A counter showing how many items had stock changes today.

### Urgent Action Required
Below the metrics, a table lists the top priority items needing a restock. If you see items here, click their row to immediately process a stock update.

---

## 2. Managing the Inventory List

Click **"Inventory"** in the main navigation menu to view your complete product catalog.

### Using the Table
- **Search & Filter:** Use the search bar at the top to find an item by its Name or SKU (Stock Keeping Unit). Use the dropdowns to filter by Category or Status (e.g., show only "Low Stock").
- **Status Indicators:** Every row has a clear, color-coded status badge:
  - 🟢 **Healthy (Green):** You have plenty of stock safely above the minimum threshold.
  - 🟡 **Low Stock (Yellow):** The item's stock has hit or fallen below the threshold. You should reorder soon.
  - 🔴 **Out of Stock (Red):** The stock level is exactly 0. 

---

## 3. Adding a New Product

When you receive a brand-new type of product that has never been in the system, you must create a profile for it.

1. Navigate to the **Inventory** page.
2. Click the blue **"Add Item"** button in the top right corner.
3. Fill out the form:
   - **Item Name:** (Required) e.g., "Steel Water Bottle"
   - **SKU:** (Required) A unique tracking code, e.g., "WB-STL-001"
   - **Category:** e.g., "Drinkware"
   - **Current Quantity:** How many you presently have on hand.
   - **Minimum Threshold:** (Required) The number at which you want the system to warn you that stock is running low. E.g., if you set this to `10`, the system will turn the status indicator yellow when quantity hits 10.
4. Click **"Save Item"**.

---

## 4. Updating Stock Levels (In/Out)

**Important:** To keep your inventory records accurate and auditable, you cannot simply edit the 'quantity' number directly. You must log *why* the number is changing.

### How to process a change:
1. On the **Inventory** list page, find the item you want to update.
2. In the "Actions" column on the far right, click the **Update Stock** icon (or button).
3. A panel will appear. Choose the type of update:
   - **Increase:** Use this when new shipments arrive. Enter the *additional* number you received. The system will add it to the current stock.
   - **Decrease:** Use this when an item is sold, damaged, or lost. The system will subtract the number from the current stock.
   - **Manual Set:** Use this only for stocktakes/audits to force the stock to a specific number, correcting past mistakes.
4. **Enter a Reason:** Briefly explain the change (e.g., "Received shipment PO #1234" or "Sold 3 units online").
5. Click **"Confirm Update"**.

The new stock level will save instantly, and a permanent record of who made the change and why will be logged in the system's history.

---

## 5. Editing Product Details

If you made a typo or a supplier changed, you can update the product's basic information. 

1. On the **Inventory** list page, find the item.
2. Click the **Edit** (Pencil) icon in the "Actions" column.
3. You can change the Name, Category, Threshold, Price, or Supplier.
4. *Note: You cannot change the stock quantity from this screen. To change quantity, use the "Update Stock" procedure described above.*
5. Click **"Save Changes"**.

---

## Troubleshooting

- **Why can't I decrease stock below 0?**
  The system prevents negative inventory. If you are experiencing a glitch where you physically sold an item but the system says you have 0, process an "Increase" or "Manual Set" first to reflect reality, or contact your manager.
  
- **I selected 'Decrease' by 5, but the stock went to 0 instead of negative.**
  This is the system protecting itself. If you had 3 items and attempted to decrease by 5, the system will bottom out at 0. Add a note explaining the discrepancy.
