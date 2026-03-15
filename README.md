# Smart Inventory Tracker (MVP)

This repository contains the complete MVP for the Smart Inventory Tracker Application, powered by an in-memory SQLite database, Node.js/Express Backend, and React.js/Vite Frontend.

## Infrastructure Highlights
- **Backend:** Node.js, Express, `sqlite` & `sqlite3`
- **Frontend:** React 18, Vite, Tailwind CSS, Zustand state management, React Router

## Quick Start Guide

### 1. Start the Backend API
The backend automatically initializes the SQLite database file (`inventory.sqlite`) on first boot with the necessary schema and tables.

```bash
cd backend
npm install
npm run dev
```
The API will run on `http://localhost:3001`.

### 2. Start the Frontend React App
Open a new terminal window:

```bash
cd frontend
npm install
npm run dev
```
The Web App will run on `http://localhost:5173`. Open this URL in your browser.

## Features implemented
- Add new inventory items.
- Live Dashboard metrics tracking low stock and out-of-stock items.
- Full catalog table with sort/search filtering on SKUs and Names.
- Stock Update Modal that dynamically subtracts/adds to total quantity based on reason (`purchase`, `sale`, `adjustment`).
