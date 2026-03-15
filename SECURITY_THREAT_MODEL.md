# Security Threat Model: Smart Inventory Tracker

**Document Owner:** Security Engineer
**Target Audience:** System Architect, DevOps Engineer, Backend & Frontend Developers

This document outlines the potential threats to the Smart Inventory Tracker system, attack vectors, and the required mitigation strategies based on the architecture and backend implementation.

## 1. Identified Assets
1. **Inventory Data:** The core PostgreSQL database containing `items` and `stock_logs`.
2. **Backend API:** The Node.js/Express ECS Fargate containers that manage business logic.
3. **Frontend Application:** The React/Next.js application served via AWS S3 + CloudFront.
4. **Cloud Infrastructure:** AWS resources, IAM roles, and secrets in Systems Manager/Secrets Manager.
5. **User Identities / Tokens:** Authentication tokens and user credentials.

## 2. Threat Analysis & Mitigation (STRIDE Model)

### 2.1. Spoofing (Identity Spoofing)
- **Threat:** Attackers forging authentication tokens or stealing credentials to gain unauthorized access to the system and manipulate inventory levels.
- **Mitigation:**
  - Implement robust JWT validation.
  - Enforce strong password policies and bcrypt/argon2 hashing.
  - Use HttpOnly, Secure session cookies for web clients to prevent token theft via XSS.

### 2.2. Tampering (Data Manipulation)
- **Threat:** Unauthorized modification of inventory data in transit or at rest. Attackers manipulating the `change_amount` or `update_type` in stock updates.
- **Mitigation:**
  - Enforce TLS (HTTPS) on all API endpoints and CloudFront distributions.
  - Implement strict input validation on all API requests using a validation library (e.g., Zod or Joi).
  - Use parameterized queries or a secure ORM (Prisma/Knex) to prevent SQL Injection in PostgreSQL.

### 2.3. Repudiation (Disputed Actions)
- **Threat:** Malicious insiders or compromised accounts modifying stock levels without traceability, leading to unaccounted inventory loss.
- **Mitigation:**
  - Ensure every stock modification (addition or deduction) creates an immutable record in the `stock_logs` table.
  - Log all authentication events and privileged API calls via application logs to CloudWatch.
  - Ensure the `user_id` or `actor` responsible for the change is recorded in the `stock_logs` (Note: The schema should be updated to include an `actor_id` field for full non-repudiation).

### 2.4. Information Disclosure (Data Leakage)
- **Threat:** Exposure of sensitive business data, database credentials, or system architecture through verbose errors, directory traversal, or misconfigured cloud resources.
- **Mitigation:**
  - Centralized error handling must strip stack traces and internal db errors from production API responses (HTTP 500 should return generic messages).
  - Secure `.env` variables using AWS Secrets Manager. Prevent hardcoding secrets in code.
  - Ensure the S3 bucket is explicitly private and only accessible via CloudFront Origin Access Control (OAC).

### 2.5. Denial of Service (System Exhaustion)
- **Threat:** Volumetric attacks or application-layer DoS (e.g., intensive search queries or large pagination offsets) consuming unscalable resources, leading to app downtime.
- **Mitigation:**
  - Implement API Rate Limiting on the Application Load Balancer (ALB) or within the Node.js app using Redis/Memory limiters.
  - Place CloudFront and AWS WAF in front of the application to block broad DDoS attempts.
  - Restrict maximum pagination limits (`LIMIT` and `OFFSET`) on database queries.

### 2.6. Elevation of Privilege
- **Threat:** Attackers gaining administrative access to the AWS environment or application administrative functionality.
- **Mitigation:**
  - Strictly enforce Role-Based Access Control (RBAC) in the API layer.
  - Apply the Principle of Least Privilege (PoLP) to AWS IAM Roles used by ECS tasks and GitHub Actions. ECS tasks only need permissions to write to specific CloudWatch streams and access specific RDS/Secrets.
