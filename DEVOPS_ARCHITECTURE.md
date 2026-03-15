# DevOps Architecture & Infrastructure Strategy
## Smart Inventory Tracker

**Document Owner:** DevOps Engineer
**Target Audience:** System Architect, Backend Developer, Frontend Developer, Product Manager

This document outlines the infrastructure, CI/CD, and deployment strategy for the Smart Inventory Tracker Application to ensure 99.5% uptime and highly scalable deployments.

---

## 1. Hosting & Deployment Architecture

We will utilize **AWS** (Amazon Web Services) as our primary cloud provider due to its robust reliability and extensive managed services ecosystem.

### Overview

1. **Frontend (React/Next.js SPA):**
   - **Hosting:** AWS S3 (Static Website Hosting) + Amazon CloudFront (CDN)
   - **Benefit:** Global edge caching ensures ultra-low latency for users, high availability (99.9%), and near-infinite scalability for static assets.

2. **Backend (Node.js/Express API):**
   - **Hosting:** Amazon ECS (Elastic Container Service) on AWS Fargate.
   - **Architecture:** Serverless container execution. No underlying EC2 instances to manage.
   - **Load Balancing:** Application Load Balancer (ALB) acting as the main entry point, distributing traffic across multiple Fargate container instances.
   - **Auto-Scaling:** ECS will auto-scale the number of tasks based on CPU and Memory usage metrics (e.g., scaling out during high traffic periods).

3. **Database (PostgreSQL):**
   - **Hosting:** Amazon RDS for PostgreSQL (Multi-AZ Deployment).
   - **Uptime:** Multi-AZ provides synchronous replication to a standby instance in a different Availability Zone (AZ). If the primary fails, RDS automatically fails over, ensuring 99.5% uptime.
   - **Backups:** Automated daily backups with point-in-time recovery (PITR) up to 35 days.

---

## 2. Containerization Strategy

Docker will be used across the entire stack to guarantee parity between local development, staging, and production environments.

### Backend (`Dockerfile`)
- Use a lightweight, secure base image: `node:18-alpine`.
- Implements a multi-stage build to separate build dependencies (like TypeScript compilation) from the final production runtime to keep image size small.
- Run as a non-root user for enhanced security.
- Standardized port exposure (e.g., `EXPOSE 8080`).

### Frontend (`Dockerfile` - For Testing/CI purposes)
- While the frontend static files are deployed to S3, a multi-stage Dockerfile using `node:18-alpine` for the build step and `nginx:alpine` to serve local preview environments will be maintained to validate production builds before syncing to S3.

---

## 3. Environment Configuration

Three distinct environments will be maintained to ensure safe and predictable releases. Environment variables will be managed securely via **AWS Systems Manager Parameter Store** or **AWS Secrets Manager**.

| Environment | Purpose | Branch Trigger | Database |
| :--- | :--- | :--- | :--- |
| **Development** | Developer sandbox and integration testing. | `develop` | Shared Dev DB |
| **Staging** | Production-like environment for QA and UAT. | `staging` / `release/*` | Isolated Staging RDS (Single-AZ) |
| **Production** | Live end-user environment. | `main` | Production RDS (Multi-AZ) |

*The Backend application will dynamically load configuration via injecting `.env` variables at runtime onto the ECS Fargate tasks.*

---

## 4. CI/CD Pipeline Setup

We will leverage **GitHub Actions** for our continuous integration and deployment pipelines to keep the developer workflow centralized.

### Continuous Integration (CI) - Triggered on `Pull Requests`
1. **Linting & Formatting:** Runs `ESLint` and `Prettier` on code changes.
2. **Unit & Integration Tests:** Executes Jest test suites on frontend components and backend services.
3. **Build Check:** Ensures the TypeScript backend and React frontend can successfully compile without errors.
4. **Security Scan:** Runs `npm audit` and vulnerability scanning on Docker images using Trivy.

### Continuous Deployment (CD) - Triggered on merge to `main` (Production)
1. **Frontend Deployment:**
   - Run `npm run build` to generate the optimized static bundle.
   - Sync the build output `dist/` directory to the Production S3 Bucket (`aws s3 sync`).
   - Invalidate the CloudFront cache to instantly serve the latest version.
2. **Backend Deployment:**
   - Build the production Docker image.
   - Authenticate and push the image to **Amazon ECR** (Elastic Container Registry).
   - Update the AWS ECS Task Definition with the new image URI.
   - Force a new deployment on the ECS Service to gracefully drain old containers and spin up the new ones via a rolling update (Zero Downtime Deployment).
3. **Database Migrations:**
   - A distinct GitHub Action step runs Prisma/Knex migration scripts against the production database *before* the new ECS tasks go live.

---

## 5. Monitoring, Logging, & Alerting

To guarantee the required **99.5% uptime**, comprehensive observability is essential.

1. **Centralized Logging:**
   - All backend containers will stream `stdout`/`stderr` logs directly to **Amazon CloudWatch Logs**.
   - API endpoints will use a logging library (like Winston or Pino) formatted in JSON for structured log searching.
2. **Application Performance Monitoring (APM):**
   - **Datadog** or **AWS X-Ray** will track API latency, error rates (5xx HTTP codes), and database query performance.
3. **Alerting System:**
   - Configure AWS CloudWatch Alarms directly to **PagerDuty** or a dedicated **Slack** channel.
   - **Critical Alerts:** ECS Task failure, RDS CPU > 90%, API Error Rate > 2%, or ALB Health Check failures.
   - **Uptime Monitoring:** External synthetics monitoring (e.g., UptimeRobot or Datadog Synthetics) to ping the dashboard `/health` endpoint globally every 1 minute.
