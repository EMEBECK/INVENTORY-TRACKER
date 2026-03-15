# Backend Folder Structure

This document outlines the proposed folder architecture for the backend repository of the Smart Inventory Tracker Application. It follows a clean architecture model and separation of concerns.

## Proposed Stack
- **Runtime:** Node.js
- **Framework:** Express.js (or NestJS)
- **Database:** PostgreSQL or MongoDB (depending on final DB Engineer decision)
- **Language:** TypeScript

## Directory Layout

```
/backend
├── /src
│   ├── /config             # Configuration files (DB connection, environment variables)
│   │   └── database.ts
│   │
│   ├── /controllers        # Route handlers, extracting payload and calling services
│   │   ├── inventory.controller.ts
│   │   └── stock.controller.ts
│   │
│   ├── /models             # Database schemas / entity definitions
│   │   ├── inventory.model.ts
│   │   └── stockLog.model.ts
│   │
│   ├── /routes             # API routing logic mapping URLs to controllers
│   │   ├── inventory.routes.ts
│   │   └── index.ts
│   │
│   ├── /services           # Core business logic and database interactions
│   │   ├── inventory.service.ts
│   │   └── stock.service.ts
│   │
│   ├── /middlewares        # Custom Express middlewares
│   │   ├── errorMiddleware.ts      # Global error handler
│   │   └── validationMiddleware.ts # Request payload validator
│   │
│   ├── /utils              # Helper functions, constants, formatting
│   │   ├── asyncWrapper.ts
│   │   └── logger.ts
│   │
│   ├── /types              # TypeScript interfaces and type definitions
│   │   └── index.d.ts
│   │
│   └── server.ts           # Application entry point
│
├── .env.example            # Example environment variables
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── README.md               # Backend setup instructions
```

## Key Architectural Decisions

1. **Controller-Service Layering:** Controllers are strictly for handling HTTP requests and responses. All business logic, stock calculations, and DB queries are isolated in the `Services` layer. 
2. **Centralized Error Handling:** The `errorMiddleware` will catch all unhandled exceptions and format them into a consistent JSON response structure to keep the API contract predictable.
3. **Data Logging:** Any manipulation of stock quantities goes through the `stock.service.ts`, which enforces the creation of a `StockLog` entry in a database transaction.
