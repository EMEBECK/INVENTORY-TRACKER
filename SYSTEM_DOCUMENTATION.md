# Developer Documentation: Smart Inventory Tracker

## 1. System Overview

The **Smart Inventory Tracker** is a production-quality, responsive web application designed for comprehensive inventory management. It facilities complete lifecycle tracking of stock items, automated low-stock detection, and detailed logging of all stock adjustments, providing real-time visibility into inventory health.

The system is built on a modern, decoupled architecture designed for 99.5% uptime and high scalability, suitable for enterprise-level inventory control.

## 2. Architecture & Technology Stack

The application utilizes a robust, cloud-native technology stack separated into three core tiers:

### 2.1. Frontend (Client-Side)
- **Framework:** React 18+ (Next.js App Router or Vite SPA) using TypeScript.
- **Styling:** Tailwind CSS mapped to a custom design system token set.
- **State Management:**
  - **Server State:** React Query (for API caching and synchronization).
  - **Client UI State:** Zustand (for modals, alerts, and responsive toggles).
- **Hosting:** AWS S3 (Static Hosting) integrated with Amazon CloudFront (CDN) for edge caching and low latency.

### 2.2. Backend (API Layer)
- **Runtime & Framework:** Node.js with Express.js written in TypeScript.
- **Architecture Pattern:** Clean Architecture (Controller -> Service -> Data Access layers) prioritizing separation of concerns.
- **Containerization:** Docker (`node:18-alpine` base image).
- **Hosting & Orchestration:** Amazon ECS (Elastic Container Service) on AWS Fargate (Serverless compute), fronted by an Application Load Balancer (ALB) for traffic distribution and auto-scaling.

### 2.3. Database Layer
- **Engine:** PostgreSQL (Relational Database).
- **Hosting:** Amazon RDS (Multi-AZ Deployment) ensuring high availability and automated failover.
- **Key Tables:**
  - `items`: Stores current state and metadata of inventory.
  - `stock_logs`: Append-only table detailing historical stock alterations for auditability.

## 3. Core Business Logic & Workflows

### 3.1. Inventory Lifecycle
1. **Creation:** Items are created with standard metadata (Name, SKU, Category) and critical baseline metrics (Initial Quantity, Minimum Stock Threshold).
2. **Modification:** Item metadata can be edited at any time, but stock quantities are **strictly protected** and cannot be casually updated.
3. **Tracking:** All inventory instances are continually subject to the Low Stock Detection logic.

### 3.2. Stock Adjustment Protocol
To guarantee data integrity and traceability, stock quantities are managed through a dedicated strict workflow:
1. All changes (Increase, Decrease, Manual Set) must pass through the `POST /api/v1/inventory/{id}/stock` endpoint.
2. The `stock.service.ts` processes the request:
   - Calculates the new total.
   - Enforces business rules (e.g., stock cannot drop below zero).
   - Generates a mandatory `reason` requirement.
3. A single database transaction is initiated to:
   - Update the `quantity` in the `items` table.
   - Insert a corresponding audit record into the `stock_logs` table.

### 3.3. Low Stock Detection Logic
The system asynchronously evaluates item health following every creation or stock adjustment event.
- **Condition Evaluated:** `Current Stock <= Minimum Threshold`
- **Actions:** If true, the system updates the item's computed frontend status to "Low Stock" (if >0) or "Out of Stock" (if =0), surfacing alerts on the Dashboard and Inventory List views.

## 4. Security Implementation

Security is integrated at every layer of the application targeting the OWASP Top 10 web vulnerabilities.

### 4.1. Authentication & Authorization
- **Mechanism:** Stateless JSON Web Tokens (JWT) using RS256 or HS256 algorithms.
- **Password Security:** Argon2 or Bcrypt (Cost >= 12) hashing.
- **Token Delivery (Web clients):** Access and Refresh tokens are delivered exclusively via `HttpOnly`, `Secure`, `SameSite=Strict` cookies to mitigate XSS and CSRF risks.
- **RBAC:** API endpoints enforce Role-Based Access Control (Viewer, Manager, Admin) via dedicated Express middleware evaluating JWT claims.

### 4.2. API Protection
- **TLS/HTTPS:** Enforced globally. ALB/CloudFront handle HTTP to HTTPS downgrading prevention.
- **Input Validation:** Strict payload validation using libraries (e.g., Zod) on the backend before processing.
- **Injection Prevention:** Query builders/ORMs (like Knex or Prisma) manage database interactions using secure Parameterized Queries.
- **Rate Limiting:** Global limiting via `express-rate-limit` to deter automated scraping, with strict constraints applied to sensitive routes like authentication.

## 5. Development Setup & CI/CD Pipeline

### 5.1. Local Environment Setup
Docker Compose is recommended to orchestrate the local environment, ensuring parity with production.
*Requires: Node.js 18+, Docker Desktop.*

1. Clone the repository.
2. Copy `.env.example` to `.env` in both `/frontend` and `/backend` directories.
3. Start the stack: `docker-compose up -d`. This will initialize local instances of the PostgreSQL database, Backend API, and Frontend client.
4. Run database migrations before starting development.

### 5.2. Git Workflow & CI/CD
The project utilizes a trunk-based or simplified Gitflow branching strategy integrated with **GitHub Actions**.

- **Continuous Integration (PR to `develop`/`main`):**
  - Triggers linting (`ESLint`), formatting (`Prettier`), unit/integration tests (`Jest`), and vulnerability auditing (`npm audit`, Trivy). Build checks run to verify UI and API compilation.
- **Continuous Deployment (Merge to `main`):**
  - **Frontend:** Builds optimized static bundle -> Syncs to AWS S3 -> Invalidates CloudFront cache.
  - **Backend:** Builds Docker image -> Pushes to Amazon ECR -> Forces new ECS service deployment via rolling updates (Zero Downtime).
  - **Database:** Executes outstanding migrations against the RDS instance prior to ECS task rollout.

## 6. Project Structure Overview

The repository is organized into distinct monolithic packages or micro-directories:

```text
/
├── /frontend             # React (Next.js/Vite) application
│   ├── /src/components   # Reusable UI primitives and composites (e.g., Buttons, DataTables)
│   ├── /src/services     # API Client layer (Axios/fetch wrappers) connecting to Backend
│   └── /src/store        # Zustand state stores (Global UI state)
│
├── /backend              # Node.js Express API
│   ├── /src/controllers  # Request handling and response formatting
│   ├── /src/services     # Core business logic processing
│   ├── /src/models       # Data shaping and DB schema definitions
│   └── /src/middlewares  # Reusable logic steps (Auth, Validation, Error Handling)
│
└── /infrastructure       # (Optional) IaC scripts for AWS deployment (Terraform/CloudFormation)
```

## 7. Next Steps for Developers
- Review the `UI_DESIGN.md` and `UX_DESIGN.md` for complete visual reference and interaction mapping.
- Consult the `API_USAGE_GUIDE.md` for specific endpoint integration details.
- Ensure all new features align with the strict separation between item metadata modifications and stock adjustments as defined in internal core logic.
