# Authentication Strategy: Smart Inventory Tracker

**Document Owner:** Security Engineer
**Target Audience:** Backend Developer, Frontend Developer, System Architect

This document establishes the authentication and authorization framework for the Smart Inventory Tracker to secure API access and protect inventory data.

## 1. Authentication Architecture

We will implement a stateless **JSON Web Token (JWT)** based authentication system. This integrates well with our scalable, containerized (ECS Fargate) backend architecture.

### 1.1 Credentials and Hashing
- **Hashing:** All user passwords must be hashed using a computationally secure algorithm, strictly **Argon2** (preferred) or **Bcrypt** (cost factor of at least 12).
- **Salt:** A unique, random salt must be generated and stored with each hashed password.

### 1.2 Token Design (JWT)
The JWT will be used for authorization on subsequent API calls after a successful login.
- **Algorithm:** RS256 (asymmetric) or HS256 (symmetric with a high-entropy secret stored in AWS Secrets Manager).
- **Payload:** Must include ONLY non-sensitive claims:
  - `sub`: User ID
  - `role`: User Role (e.g., `admin`, `manager`, `viewer`)
  - `iat`: Issued At timestamp
  - `exp`: Expiration timestamp
- **Expiration:** Access tokens should be short-lived (e.g., 15-30 minutes).

### 1.3 Refresh Token Rotation
To maintain user sessions securely without requiring frequent logins:
- **Refresh Token:** A long-lived, opaque, cryptographically random string (e.g., 64 bytes).
- **Storage:** Stored in the database with a corresponding `user_id`, `expires_at`, and `revoked` boolean.
- **Rotation:** Every time a refresh token is used to obtain a new access token, the old refresh token is invalidated, and a new one is issued. This acts as a mitigation against stolen refresh tokens.

## 2. Token Delivery and Storage (Web Protection)

To protect the Single Page Application (React/Next.js) from token theft:
1. **Access Token Delivery:** The short-lived JWT must be delivered to the client as an **HttpOnly, Secure, SameSite=Strict** cookie.
   - *Why:* Prevents malicious JavaScript (XSS attacks) from accessing the token via `document.cookie`.
2. **Refresh Token Delivery:** Sent as a separate **HttpOnly, Secure, SameSite=Strict** cookie with a longer expiration path (typically tied exclusively to a `/api/v1/auth/refresh` endpoint).
3. **Alternative Delivery (Mobile/Thick Client):** If a mobile app is developed later, tokens may be returned in the JSON response body and stored in secure native storage (e.g., iOS Keychain, Android Keystore).

## 3. Role-Based Access Control (RBAC)

The system requires authorization checks at the API routing/controller layer.

| Role | Permissions |
| :--- | :--- |
| **Viewer** | `GET /inventory` |
| **Manager** | `GET`, `POST /inventory/*/stock`, `PUT /inventory/*` |
| **Admin** | Full access including `POST /inventory` (Creation), `DELETE` (if applicable), User Management |

**Implementation:**
Create an `authorizeRole(roles[])` middleware in Express that parses the verified JWT role claim and compares it against the required route roles. Reject unauthorized calls with HTTP 403 Forbidden.

## 4. Session Management & Security Operations

- **Logout:** Must instantly invalidate the server-side refresh token and instruct the browser to clear the HttpOnly cookies.
- **Account Lockout:** Implement rate limiting on the `/api/v1/auth/login` endpoint (e.g., max 5 failed attempts per 15 minutes per IP or email) to prevent brute-force attacks.
- **Audit Logging:** Log all successful and failed authentication attempts with IP address and User Agent (shipped to CloudWatch) for forensic analysis.
