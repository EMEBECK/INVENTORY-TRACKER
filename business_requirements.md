# Business Requirements Specification
## Smart Inventory Tracker

**Document Owner:** Business Analyst
**Target Audience:** UX Designer, System Architect, Backend Developer, Frontend Developer, QA Engineer

---

## 1. Functional Requirements Specification

| ID | Feature | Description | Priority |
| :--- | :--- | :--- | :--- |
| **FR1** | **Inventory Creation** | The system must allow users to create new inventory items by providing Item Name, SKU, Category, Quantity, and Minimum Threshold. Price and Supplier are optional. | High |
| **FR2** | **Inventory Editing** | Users must be able to edit existing item details, except for the current stock quantity which must be updated via the stock update workflow. | High |
| **FR3** | **Stock Updates** | Users must be able to increase, decrease, or manually adjust the stock quantity for an existing item. A reason and timestamp must be logged. | High |
| **FR4** | **Automatic Low Stock Detection** | The system must dynamically compare the current stock quantity of an item against its defined minimum threshold and flag it if `Current Stock <= Threshold`. | High |
| **FR5** | **Dashboard Overview** | The dashboard must display real-time summary metrics: total items, items low in stock, and a list of recently updated inventory items. | Medium |
| **FR6** | **Inventory List Page** | The system must display a table of all inventory items, sortable and searchable, with color-coded status indicators (Green: Healthy, Yellow: Low, Red: Out of Stock). | High |
| **FR7** | **Alerts & Notifications** | The system must generate visual alerts on the dashboard and inventory list when an item reaches low stock status. | Medium |

---

## 2. User Stories

### Epic 1: Inventory Management
* **US1.1:** As a user, I want to add new items with their basic details and minimum thresholds so that I can track their stock levels in the system.
* **US1.2:** As a user, I want to edit the details (like name, category, or supplier) of an existing item so that my inventory records remain accurate and up-to-date.
* **US1.3:** As a user, I want to view a comprehensive list of all my inventory items so that I can manage my entire catalog from one place.

### Epic 2: Stock Control
* **US2.1:** As a user, I want to record stock increases (e.g., when new stock arrives) so that my inventory reflects actual stock on hand.
* **US2.2:** As a user, I want to record stock decreases (e.g., when items are sold or damaged) so that my inventory numbers are properly decremented.
* **US2.3:** As a user, I want to manually adjust stock levels and provide a reason (e.g., stocktake correction) so that discrepancies can be audited later.

### Epic 3: Visibility & Alerts
* **US3.1:** As a user, I want to see a top-level dashboard with key metrics (total items, low stock warnings) so that I get an immediate snapshot of my business health upon logging in.
* **US3.2:** As a user, I want the system to automatically alert me when an item's stock falls to or below its minimum threshold so that I know exactly when to reorder.
* **US3.3:** As a user, I want to see color-coded visual indicators for stock health in the inventory table so that I can quickly scan for problematic items.

---

## 3. System Workflows and Business Logic

### Workflow 1: Inventory Creation
**Trigger:** User navigates to the "Add Inventory" interface.
**Inputs:** Item Name (Required), SKU (Required, Unique), Category (Required), Current Quantity (Required, ≥ 0), Minimum Threshold (Required, ≥ 0), Price (Optional), Supplier (Optional).
**Business Logic:**
1. System validates that required fields are present and numeric constraints (≥ 0) are met.
2. System checks if the provided SKU already exists. If yes, reject with an error.
3. System saves the new item to the database.
4. System automatically triggers the "Low Stock Detection Logic" for the new item.
**Output:** Item is visible in the Inventory List.

### Workflow 2: Stock Update
**Trigger:** User selects an item and clicks "Update Stock".
**Inputs:** Update Action (Increase / Decrease / Manual Set), Quantity Change (Required, > 0), Reason (Required), Date/Time (System-generated).
**Business Logic:**
1. Depending on the action:
   * **Increase:** `New Stock = Current Stock + Quantity Change`
   * **Decrease:** `New Stock = Max(0, Current Stock - Quantity Change)`
   * **Manual Set:** `New Stock = Quantity Change` (must be ≥ 0)
2. System updates the item's current stock value.
3. System writes a record to the `Stock Update Log`.
4. System automatically triggers the "Low Stock Detection Logic".
**Output:** Updated stock number reflects immediately on the UI.

### Workflow 3: Low Stock Detection logic
**Condition:** `Current Stock <= Minimum Threshold`
**Execution:**
1. Evaluated asynchronously after every inventory creation or stock update event.
2. If the condition evaluates to `TRUE`, the item's `Status` state is updated to "Low Stock" (if > 0) or "Out of Stock" (if = 0).
3. System surfaces the updated state on the Dashboard widgets and UI indicators.

---

## 4. Acceptance Criteria

### For Inventory Creation (US1.1)
* **AC1:** Given I am on the Add Inventory page, when I submit the form with all valid required fields, then the item is saved and I am redirected to the inventory list.
* **AC2:** Given I am adding an item, when I enter a negative number for Quantity or Threshold, then the system displays a validation error and prevents saving.
* **AC3:** Given I am adding an item, when I submit an SKU that already exists, then the system displays an "SKU already exists" error.

### For Stock Update (US2.1, US2.2, US2.3)
* **AC4:** Given I am updating an item's stock, when I choose "Decrease" and enter a quantity greater than the current stock, then the system adjusts the stock to 0 and logs the reason.
* **AC5:** Given a completed stock update, when I review the backend or logs, then I can see a new entry containing the Item ID, the change amount, the type of update, and the reason.
* **AC6:** Given a stock update is processed, when I navigate back to the Inventory List, then the new quantity is displayed in under 1 second.

### For Low Stock Detection (US3.2)
* **AC7:** Given an item has a threshold of 10 and current stock of 15, when I decrease the stock by 5 (new stock = 10), then the item immediately appears in the "Low stock alerts" dashboard widget.
* **AC8:** Given the inventory list, when an item has 0 stock, then its status badge must be Red and display "Out of Stock".
* **AC9:** Given the inventory list, when an item's stock is > 0 but <= threshold, then its status badge must be Yellow and display "Low Stock".
