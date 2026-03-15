# Frontend Architecture - Smart Inventory Tracker

This document outlines the frontend engineering strategy, component architecture, state management, and page implementations for the Smart Inventory Tracker application.

## 1. Technology Stack
- **Framework**: React 18+ (Next.js App Router or Vite SPA)
- **Language**: TypeScript (for strong typing of UI components and API responses)
- **Styling**: Tailwind CSS (mapped to UI design tokens: Primary `#3B82F6`, Background `#F8FAFC`, etc.)
- **State Management**: Zustand (Global UI State) + React Query (Server State)
- **Data Fetching**: Axios or native `fetch` via React Query

---

## 2. Component Architecture

We will follow a component-driven architecture keeping components pure, reusable, and testable.

### 2.1 UI Primitives (Atoms)
* `Button`: Primary, Secondary/Ghost, Danger variants.
* `Input`: Text input, Number input with +/- steppers.
* `StatusPill`: Reusable badge for status (Healthy, Low Stock, Out of Stock).
* `CategoryDropdown`: Specialized dropdown for selecting existing categories or adding a new one via inline text input.
* `Card`: Surface container with `md` (8px) border-radius and `md` shadow.
* `Typography`: Standardized headers (`H1`, `H2`) and Body text enforcing Inter font.

### 2.2 Composites (Molecules)
* `MetricCard`: Utilizes `Card` and `Typography` to display dashboard dashboard metrics.
* `DataTable`: Generic data grid rendering items with customizable columns.
* `FormField`: Combines `Input`, `Label` and Validation error boundaries.
* `AlertBanner`: Renders dynamic warning notifications (e.g., Low Stock).

### 2.3 Layouts (Organisms)
* `MainLayout`: Contains the Top Navigation and the main content wrapper (max-width `1280px`).
* `ModalWrapper`: Generic overlay with `#0F172A` at 50% opacity backdrop and centered layout.

---

## 3. State Management Design

The application's state is divided into Global UI State and Server/API State.

### 3.1 Server State (React Query)
React Query will manage caching, synchronization, and deduplication of API requests.
* **`useInventory`**: Fetches `GET /api/v1/inventory`. Caches the list. Automatically invalidated upon stock updates or mutations.
* **`useDashboardMetrics`**: Derived state based on cached inventory to calculate totals and warning counts.

### 3.2 Global UI State (Zustand)
Zustand handles synchronous UI interactions decoupled from the data layer.
* **`useAlertStore`**: Manages global toast notifications.
* **`useModalStore`**: Tracks modal visibility (e.g. `isUpdateStockOpen`) and context (`activeItemId`).
* **`useUIStore`**: Manages responsive sidebar toggles.

### 3.3 Component Local State
React `useState` handles highly localized ephemeral state:
* Form input values before submission.
* Local search/filter text.

---

## 4. Page Implementations

### 4.1 Dashboard Page (`/dashboard`)
* **Role**: High-level overview and urgent action hub.
* **Components**: 
  * `DataTable` section for overview metrics.
  * Prominent `AlertBanner` for low-stock thresholds.
  * A mini `DataTable` ranking top urgently needed items.
* **Logic**: Fetches inventory and calculates computed metrics for immediate visual feedback.

### 4.2 Inventory List Page (`/inventory`)
* **Role**: Complete, filterable master catalog.
* **Components**: 
  * `DataTable` containing: Name, SKU, Category, Stock, Threshold, `StatusPill`, Actions.
  * Client-side search bar and category dropdown filters (utilizing `CategoryDropdown` for selection).
* **Logic**: Search input drives a debounced filter function applied over the cached `useInventory` array. Handles 'Update' modal triggers.

### 4.3 Add / Edit Inventory Page (`/inventory/add` or `/inventory/:id`)
* **Role**: Dedicated views for entity creation or large modifications.
* **Components**: 
  * Multi-section forms utilizing `FormField` inputs.
  * Uses `CategoryDropdown` for the category field.
* **Logic**: 
  * Enforces API schema validation rules (`quantity >= 0`). 
  * `CategoryDropdown` logic: If the user selects "Add New", a child `Input` is rendered; the final submission uses the string value from this new input.
  * Posts robust data payloads back to `/inventory` or limits fields for `/inventory/:id`.

### 4.4 Update Stock Modal
* **Role**: Rapid context-aware action.
* **Components**: Toggle (Increase/Decrease), Number Input, Reason `TextArea`.
* **Logic**: Focuses solely on adjusting quantity. Dispatches `POST /inventory/{id}/stock`. Instantly invalidates server cache on success.

---

## 5. API Integrations (Service Layer)

An API Client layer will be constructed (`services/api.ts`) abstracting the network calls.

### Key Endpoints
1. **`fetchInventory(query?)`** 
   - Internal: `GET /api/v1/inventory`
   - Returns full catalog Array.
2. **`createInventoryItem(payload)`**
   - Internal: `POST /api/v1/inventory`
   - Payload: Name, SKU, Category, Quantity, Threshold.
3. **`updateItemMetadata(id, payload)`**
   - Internal: `PUT /api/v1/inventory/{id}`
   - Specifically prevents stock mutation.
4. **`adjustStockQuantity(id, payload)`**
   - Internal: `POST /api/v1/inventory/{id}/stock`
   - Payload: `change_amount`, `update_type`, `reason`.

### Error Handling Protocol
Global interceptors will catch standard HTTP errors mapping them to user-friendly messages via `useAlertStore`:
* **HTTP 400**: Display "Please check form inputs."
* **HTTP 422**: Differentiate logic blocks (e.g. "Cannot pull more stock than exists").
* **HTTP 500**: Generic system failure alert.
