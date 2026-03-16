# 📦 Smart Inventory Tracker (MVP)

> A modern, efficient, and beautifully designed inventory management solution for small to medium businesses.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-v18-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg)](https://tailwindcss.com/)

---

## ✨ Features at a Glance

*   **📊 Dynamic Dashboard**: Real-time metrics for Total Catalog, Out of Stock items, Low Stock alerts, and Healthy Stock levels.
*   **📋 Comprehensive Inventory Catalog**: A searchable and filterable table displaying SKUs, Categories, and real-time stock levels.
*   **➕ Seamless Item Creation**: Simple form to add new products with SKU tracking and custom low-stock thresholds.
*   **🔄 Advanced Stock Updates**: Specialized modal for recording Sales, Purchases, and Manual Adjustments with automatic math and projected stock preview.
*   **🚨 Low Stock Alerts**: Automatic status indicators (`Healthy`, `Low Stock`, `Out of Stock`) to prevent supply chain disruptions.
*   **⚡ High Performance**: Built with Vite for lightning-fast development and a smooth UX powered by Zustand state management.

---

## 🚀 Quick Start Guide

Setting up the Smart Inventory Tracker is straightforward. Follow these steps to get your local environment running.

### 1. Prerequisites
- **Node.js**: v18 or later
- **npm**: v8 or later

### 2. Start the Backend API
The backend uses a local SQLite database that initializes automatically on first run.

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Start the development server
npm run dev
```
The API will be available at `http://localhost:3001`.

### 3. Start the Frontend Application
In a separate terminal window:

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## 🛠️ Technical Stack

- **Frontend**: 
  - [React 18](https://reactjs.org/) & [TypeScript](https://www.typescriptlang.org/)
  - [Vite](https://vitejs.dev/) (Build tool)
  - [Tailwind CSS](https://tailwindcss.com/) (Styling)
  - [Zustand](https://github.com/pmndrs/zustand) (State Management)
  - [Lucide React](https://lucide.dev/) (Icons)
- **Backend**:
  - [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
  - [SQLite](https://www.sqlite.org/) (Database)
- **Shared**:
  - [REST API](https://restfulapi.net/) for communication

---

## 💡 Effective Usage Guide

To get the most out of the Smart Inventory Tracker, follow these best practices:

### 1. Define Realistic Thresholds
When adding a new item, set the **Min Threshold** to the safety stock level you need. The app will automatically flag items as "Low Stock" when they hit this number.

### 2. Accurate Transaction Types
Use the **Update Stock** feature accurately:
- **Sale (-)**: Reduces stock (e.g., customer purchase).
- **Purchase (+)**: Increases stock (e.g., restock from supplier).
- **Manual Adjustment (+/-)**: Use this for corrections (e.g., breakage or found items). *A reason is required for all manual adjustments.*

### 3. Use the Dashboard for Daily Operations
Check the **Urgent Actions Needed** section on the Dashboard every morning. It highlights exactly which items need restocking before they run out.

---

## 📁 Repository Structure

```text
├── backend/            # Express API server
│   ├── controllers/    # Business logic
│   ├── routes/         # API endpoints
│   └── seed.js         # Initial data setup
├── frontend/           # Vite + React client
│   ├── src/
│   │   ├── pages/      # View components
│   │   └── store.ts    # Global state (Zustand)
└── README.md           # This file!
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` (if applicable) for more information.
