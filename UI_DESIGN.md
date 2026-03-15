# UI Design Specifications - Smart Inventory Tracker

This document provides the high-fidelity UI design conventions, component library specifications, and design system tokens for the Smart Inventory Tracker application. It serves as the primary reference for the Frontend Developer.

## 1. Design Principles
* **Simplicity & Speed:** Clean, uncluttered UI optimized for fast data entry and overview.
* **Clarity:** Unambiguous status indicators using color psychology.
* **Modern Aesthetic:** A premium feel using subtle shadows, rounded corners (glassmorphism touches where appropriate), and a crisp typographic hierarchy.

---

## 2. Design Tokens

### 2.1. Color Palette

* **Brand / Primary Colors:**
  * `Primary 500`: `#3B82F6` (Blue) - Primary buttons, active tabs, links.
  * `Primary 600`: `#2563EB` (Darker Blue) - Hover states for primary actions.
  * `Primary 50`: `#EFF6FF` (Light Blue) - Subtle backgrounds for active items.

* **Neutral / Background Colors (Sleek Light/Dark Mode friendly base):**
  * `Background Base`: `#F8FAFC` (Off-white/light gray) - Main app background.
  * `Surface`: `#FFFFFF` (White) - Card backgrounds, modals, dropdowns.
  * `Border`: `#E2E8F0` (Gray 200) - Dividers, input borders.
  * `Text Primary`: `#0F172A` (Slate 900) - Main headings, high emphasis text.
  * `Text Secondary`: `#64748B` (Slate 500) - Body text, helper text, table column headers.

* **Status Indicators (Critical for Inventory):**
  * **Healthy (Green):**
    * Text/Icon: `#15803D` (Green 700)
    * Background (Pill): `#DCFCE7` (Green 100)
  * **Low Stock (Yellow):**
    * Text/Icon: `#B45309` (Amber 700)
    * Background (Pill): `#FEF3C7` (Amber 100)
  * **Out of Stock (Red):**
    * Text/Icon: `#B91C1C` (Red 700)
    * Background (Pill): `#FEE2E2` (Red 100)

### 2.2. Typography

* **Font Family:** `Inter`, sans-serif (Clean, highly legible for data-heavy apps).
* **Scale:**
  * `H1` (Page Title): `24px`, Semi-Bold (600), Line Height `32px`.
  * `H2` (Card Title): `18px`, Medium (500), Line Height `28px`.
  * `Body` (Main Text, Table Data): `14px`, Regular (400), Line Height `20px`.
  * `Small` (Helper Text, Badges): `12px`, Medium (500), Line Height `16px`.

### 2.3. Spacing & Layout

* **Base Unit:** 4px
* **Spacing Scale:**
  * `xs`: 4px
  * `sm`: 8px
  * `md`: 16px (Default padding for internal card elements)
  * `lg`: 24px (Default padding for cards/sections)
  * `xl`: 32px
* **Border Radius:**
  * `sm`: 4px (Inputs, small buttons)
  * `md`: 8px (Cards, Modals)
  * `full`: 9999px (Pills, Avatar circles)
* **Shadows:**
  * `sm`: `0 1px 2px 0 rgba(0, 0, 0, 0.05)` (Cards resting state)
  * `md`: `0 4px 6px -1px rgba(0, 0, 0, 0.1)` (Dropdowns, Modals)

---

## 3. Component Specifications

### 3.1. Dashboard Cards (Summary Metrics)
* **Container:** Surface `#FFFFFF`, Radius `md` (8px), Shadow `sm`.
* **Padding:** `lg` (24px) all around.
* **Layout:** Top-to-bottom flow.
  * Label (e.g., "Total Items"): Text Secondary, Small (`12px`), Uppercase.
  * Value (e.g., "1,245"): Text Primary, `H1` scale or larger (`32px` Semi-Bold).
  * Context/Trend (e.g., "+12 this week"): Text Secondary (or Status Green), Small (`12px`).

### 3.2. Inventory Data Table
* **Container:** Surface `#FFFFFF`, Radius `md` (8px), Border `#E2E8F0`, Shadow `sm`.
* **Header Row (`<thead>`):** Background `#F8FAFC`, Bottom Border `#E2E8F0`. Text Secondary, Small (`12px`), Uppercase, Medium weight.
* **Data Rows (`<tbody>`):** Hover styling is Background `Primary 50`. Bottom Border `#F1F5F9`. Padding `md` (16px) vertical, `lg` (24px) horizontal per cell.
* **Status Pill (in Table):**
  * Border Radius `full`. Padding `xs` (4px) vertical, `sm` (8px) horizontal.
  * Uses the corresponding Status Indicator color tokens (Background/Text pairing).

### 3.3. Forms & Inputs
* **Input Fields:**
  * Background: `#FFFFFF`. Border: 1px solid `#E2E8F0`. Radius: `md` (6-8px).
  * Padding: `sm` (8px) vertical, `md` (12px) horizontal.
  * Focus State: Border changes to `Primary 500`. Add an outer outline/ring (e.g., 2px solid `#BFDBFE`).
* **Labels:** Text Variable, Small (`14px`), Medium weight. Margin bottom `sm` (8px).
* **Buttons:**
  * **Primary:** Background `Primary 500`, Text `#FFFFFF`, Radius `md`, Padding `sm` (8px) vertical, `md` (16px) horizontal. Minimal hover transition (darken slightly).
  * **Ghost / Secondary:** Background Transparent, Text `Text Secondary`, Border 1px solid `Border`. Hover changes background to `#F1F5F9`.

### 3.4. Alert & Notification Banners
* **Layout:** Full width or floating toast. Radius `md`. Padding `md` (16px).
* **Warning Alert (Low Stock):**
  * Background: `#FFFBEB` (Amber 50). Border: 1px solid `#FDE68A` (Amber 200).
  * Icon + Text: Contextual layout. Icon in `#B45309` (Amber 700).

---

## 4. Page Layouts

### 4.1. Dashboard Layout
* **Max Width:** App is centered up to `1280px` max width to prevent tables from spanning infinitely on ultrawide monitors.
* **Top Navigation:** Sticky header with App branding (left) and user profile/settings (right). Height: `64px`.
* **Grid:**
  * Top section: 3-column CSS Grid (`1fr 1fr 1fr`) for Metrics Cards. Gap: `lg` (24px).
  * Middle section: 2-column Grid (e.g., `2fr 1fr`). Left takes up more space for "Low Stock Priority Table", Right for "Recent Activity Feed". Gap: `lg` (24px).

### 4.2. Inventory List Layout
* **Header Area:** Flexbox (Row). "Inventory Management" `H1` on left. Search bar and "Add Item" primary button aligned to right.
* **Table Area:** Takes up remaining vertical space below the header. The table wrapper should have `overflow-x: auto` for horizontal scrolling on narrow viewports.

### 4.3. Modals (e.g., Update Stock)
* **Backdrop:** `#0F172A` at 50% opacity.
* **Container:** Center-aligned vertically and horizontally. Max width `400px`. Surface `#FFFFFF`, Radius `md` (8px), Shadow `md`.
* **Padding:** `lg` (24px).

---

## 5. Responsive Design Rules

### Breakpoints
* **Mobile (`< 640px`):**
  * Dashboard grid collapses to 1 column (`1fr`).
  * Table rows may need to stack as cards, or table wrapper handles horizontal swipe scrolling completely.
  * Padding is reduced to `md` (16px) globally.
* **Tablet (`640px` - `1024px`):**
  * Dashboard cards remain 3 columns if succinct, otherwise 2 columns wrapping the third.
* **Desktop (`> 1024px`):**
  * Default behavior described in layouts.

---

## 6. High-Fidelity Mockups

### Dashboard View
![Dashboard Mockup](C:\Users\HP\.gemini\antigravity\brain\fadb19f6-f6c6-4620-bf00-06f00e73f4f4\dashboard_mockup_1773580236032.png)

### Inventory List View
![Inventory List Mockup](C:\Users\HP\.gemini\antigravity\brain\fadb19f6-f6c6-4620-bf00-06f00e73f4f4\inventory_list_mockup_1773580292799.png)
