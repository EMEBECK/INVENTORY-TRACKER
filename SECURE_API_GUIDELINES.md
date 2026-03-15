# Secure API Guidelines: Smart Inventory Tracker

**Document Owner:** Security Engineer
**Target Audience:** Backend Developer, DevOps Engineer

This document outlines the security coding standards and configurations required for the Node.js/Express API to ensure data protection and resilience against web vulnerabilities.

## 1. Transport Layer Security
- **Enforce HTTPS:** All API communication must happen over TLS 1.2 or TLS 1.3. 
- **HTTP Downgrade Prevention:** The backend (or ALB) must redirect any HTTP traffic to HTTPS.
- **HSTS:** Implement HTTP Strict Transport Security (HSTS) via headers to instruct browsers to strictly communicate over HTTPS.

## 2. Input Validation & Sanitization
Never trust client input. The API specification dictates strict payload validation.
- **Validation Library:** Use a robust schema validation library such as **Zod**, **Joi**, or **class-validator** in the `validationMiddleware`.
- **Type Coercion:** Reject requests with unexpected data types (e.g., passing a string when a number is expected for `quantity`).
- **Sanitization:** Strip dangerous HTML/script tags from text fields (`name`, `reason`) to prevent Stored XSS if the data is reflected back in the UI. Ensure `reason` in `stock_logs` is properly sanitized.
- **Pagination Safety:** Limit the max `limit` parameter for `GET /inventory` to prevent database exhaustion (e.g., max 100).

## 3. Injection Prevention
- **SQL Injection:** Avoid raw SQL string concatenation unconditionally. Since the tech stack specifies PostgreSQL, utilize a query builder (Knex) or ORM (Prisma/TypeORM) which automatically utilize **Parameterized Queries**.
- **NoSQL Injection (if MongoDB is chosen):** Sanitize query objects to prevent operator injection (e.g., blocking `{"$ne": null}` in authentication lookups).

## 4. Security Headers (Helmet.js)
The Express app must utilize the `helmet` middleware to set essential security headers:
- `Content-Security-Policy`: (Though mostly for frontend HTML, useful if the backend serves any static error pages).
- `X-Frame-Options: DENY`: Prevents Clickjacking.
- `X-Content-Type-Options: nosniff`: Prevents MIME-sniffing.
- `Referrer-Policy: no-referrer`: Controls referrer information passed to other sites.
- **Remove `X-Powered-By`**: To hide framework details from attackers.

## 5. Rate Limiting and DoS Protection
- **Global API Limiting:** Implement `express-rate-limit` globally (e.g., 1000 requests per sliding 15-minute window per IP) to deter volumetric scraping or low-level DoS.
- **Strict Endpoint Limiting:** Stricter limits on specialized endpoints:
  - Auth routes (`/login`, `/refresh`): 5-10 requests per minute.
  - Creation/Stock Update routes: Slower limits to prevent automated massive data creation.

## 6. Cross-Origin Resource Sharing (CORS)
- **Strict Origin Definition:** Do not use `Access-Control-Allow-Origin: *`. Configure the CORS middleware to strictly allow requests ONLY from the expected Frontend production and staging origins (e.g., `https://app.example.com`).
- **Credentials:** Set `credentials: true` if using HttpOnly cookies for authentication.

## 7. Error Handling & Information Disclosure
- **Predictable Responses:** Use consistent JSON error formats.
- **Data Leakage:** Custom `errorMiddleware` MUST intercept all errors. Under no circumstances should raw database errors or Node.js stack traces be sent to the client (even in 4xx / 5xx responses). Replace them with generic identifiers (e.g., "Internal Database Error. Check logs with Correlation ID: 1234").

## 8. Dependency Security
- **Auditing:** Integrate `npm audit` or tools like **Snyk** / **Dependabot** into the GitHub Actions CI pipeline to catch known vulnerabilities in third-party packages.
- **Fixed Versions:** Pin dependency versions to avoid malicious downstream package updates breaking the build or introducing backdoors unexpectedly.
