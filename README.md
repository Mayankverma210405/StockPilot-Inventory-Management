# StockPilot Inventory Management

<p align="center">
  <strong>A polished, interactive inventory-management dashboard built with React, TypeScript, and Vite.</strong>
</p>

<p align="center">
  <a href="https://stock-pilot-inventory-management.vercel.app/"><strong>Live Demo</strong></a>
  ·
  <a href="https://github.com/Mayankverma210405/StockPilot-Inventory-Management/issues">Report an Issue</a>
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white">
  <img alt="Deployment" src="https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white">
  <img alt="License" src="https://img.shields.io/badge/License-All%20Rights%20Reserved-lightgrey">
</p>

---

## Overview

**StockPilot** is a portfolio-grade inventory management demo designed to simulate the core workflows of a lightweight enterprise inventory system.

It provides a clean operational interface for managing products, warehouses, stock movements, low-stock conditions, and inventory reports. The application also demonstrates role-based user experiences, browser-persisted demo data, CSV exports, responsive layouts, and business-rule validation.

> This is a frontend portfolio demonstration. Authentication and authorization are simulated in the browser, and each visitor's demo data is stored locally on their device.

## Live Demo

### [Open StockPilot](https://stock-pilot-inventory-management.vercel.app/)

Demo credentials:

| Role | Email | Password | Access |
|---|---|---|---|
| Administrator | `mayank.admin@stockpilot.demo` | `admin123` | Full demo access, including warehouse creation |
| Inventory Manager | `mayank.manager@stockpilot.demo` | `manager123` | Product, movement, warehouse-view, and reporting workflows |

No account creation is required.

---

## Key Features

### Inventory dashboard

- Product, unit, valuation, and low-stock summary cards
- Warehouse inventory distribution
- Recent stock transaction activity
- Low-stock alerts and replenishment visibility
- Responsive operational dashboard

### Product management

- Add and update products
- Unique SKU validation
- Product search and filtering
- Category, supplier, cost, selling price, and reorder-point tracking
- Stock visibility across multiple warehouses
- Automatic opening-stock ledger entries

### Warehouse management

- Multi-warehouse inventory allocation
- Warehouse-level stock and valuation summaries
- Administrator-only warehouse creation
- Duplicate warehouse-code prevention
- Manager and location tracking

### Stock movements

- Record stock-in and stock-out transactions
- Warehouse-level stock updates
- Negative-stock prevention
- Reference numbers, notes, timestamps, and operator attribution
- Searchable transaction ledger
- CSV export

### Reports

- Current stock report
- Inventory valuation report
- Stock movement report
- Low-stock and shortage report
- Warehouse filtering
- CSV downloads

### User experience

- Simulated role-based access
- Protected application routes
- Global product search
- `Ctrl/Cmd + K` search shortcut
- Responsive desktop, tablet, and mobile interface
- Resettable browser-based demo data
- Direct-route support on Vercel

---

## Technology Stack

| Layer | Technology |
|---|---|
| UI | React |
| Language | TypeScript |
| Build tool | Vite |
| Routing | React Router |
| Icons | Lucide React |
| Styling | Custom responsive CSS |
| Demo persistence | `localStorage` |
| Session state | `sessionStorage` |
| Deployment | Vercel |
| Source control | Git and GitHub |

---

## Architecture

```text
Browser
  │
  ├── React Router
  │     ├── Login
  │     ├── Dashboard
  │     ├── Products
  │     ├── Warehouses
  │     ├── Stock Movements
  │     └── Reports
  │
  ├── AppContext
  │     ├── Authentication state
  │     ├── Product operations
  │     ├── Warehouse operations
  │     ├── Stock movement rules
  │     └── Demo reset
  │
  ├── localStorage
  │     └── Products, warehouses, and movements
  │
  └── sessionStorage
        └── Current demo user
```

### Data flow

```text
User action
   ↓
React page or form
   ↓
AppContext validation and business logic
   ↓
React state update
   ↓
Browser storage persistence
   ↓
Updated dashboard, ledger, and reports
```

---

## Business Rules Implemented

- Product SKUs must be unique.
- Warehouse codes must be unique.
- Product prices cannot be lower than unit cost.
- Stock movement quantity must be a positive whole number.
- Stock-out cannot exceed warehouse availability.
- Opening stock automatically creates a traceable inbound transaction.
- Only the administrator role can create warehouses.
- Every transaction records the product, warehouse, quantity, operator, reference, note, and timestamp.
- New warehouses are automatically added to every product's stock map with an initial quantity of zero.

---

## Project Structure

```text
StockPilot-Inventory-Management/
├── src/
│   ├── components/
│   │   ├── AppLayout.tsx
│   │   └── UI.tsx
│   ├── context/
│   │   └── AppContext.tsx
│   ├── data/
│   │   └── seed.ts
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── MovementsPage.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── ReportsPage.tsx
│   │   └── WarehousesPage.tsx
│   ├── App.tsx
│   ├── main.tsx
│   ├── styles.css
│   ├── types.ts
│   └── utils.ts
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── vercel.json
├── eslint.config.js
└── README.md
```

---

## Local Development

### Prerequisites

- Node.js `20.19+`
- npm
- Git

### Installation

```bash
git clone https://github.com/Mayankverma210405/StockPilot-Inventory-Management.git
cd StockPilot-Inventory-Management
npm install
```

### Start the development server

```bash
npm run dev
```

Open the local URL printed by Vite, normally:

```text
http://localhost:5173
```

### Production build

```bash
npm run build
```

The optimized production files will be generated in:

```text
dist/
```

### Preview the production build

```bash
npm run preview
```

### Run linting

```bash
npm run lint
```

---

## Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Starts the Vite development server |
| `npm run build` | Runs TypeScript checks and creates a production build |
| `npm run lint` | Runs ESLint across the project |
| `npm run preview` | Serves the production build locally |

---

## Demo Data and Persistence

StockPilot is intentionally designed as a zero-backend public demo.

- Inventory data is stored in `localStorage`.
- The active demo user is stored in `sessionStorage`.
- Each visitor receives an isolated browser copy of the seeded data.
- One visitor cannot see another visitor's changes.
- Refreshing the page preserves inventory changes.
- Clearing browser storage removes those changes.
- The **Reset demo data** action restores the original seed state.

This architecture keeps the public demo fast, free, and easy to evaluate without requiring a hosted database or backend API.

---

## Deployment

The application is deployed on Vercel and connected to the GitHub repository.

Production URL:

```text
https://stock-pilot-inventory-management.vercel.app/
```

The root-level `vercel.json` file rewrites application routes to `index.html`, allowing React Router paths such as `/products`, `/movements`, and `/reports` to load correctly after a direct visit or browser refresh.

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

New pushes to the production branch can automatically trigger updated Vercel deployments.

---

## Security and Production Scope

StockPilot currently demonstrates frontend architecture and business workflows. It is not intended to be used with real company inventory or confidential data.

The public demo does **not** include:

- Server-side authentication
- Password hashing
- Secure session cookies
- Backend role authorization
- Shared multi-user data
- A transactional database
- Audit-log immutability
- Database backups
- API rate limiting
- Production monitoring

The demo credentials are intentionally visible in the frontend source code.

### Production evolution

A production implementation would replace browser storage with:

- FastAPI, Node.js, or another backend service
- PostgreSQL or another transactional database
- Server-side role-based authorization
- Secure password hashing and session management
- Database transactions and concurrency controls
- Immutable audit records
- Monitoring, logging, backups, and recovery procedures

---

## Current Status

**Status:** Public frontend MVP

The current release is suitable for:

- Portfolio demonstrations
- Recruiter walkthroughs
- UI and frontend architecture reviews
- React and TypeScript code evaluation
- Inventory workflow demonstrations

It should not be presented as a production-ready ERP or warehouse-management system.

---

## Roadmap

Potential future improvements:

- Backend API and PostgreSQL integration
- Real authentication and account administration
- Purchase orders and supplier records
- Warehouse-to-warehouse transfers
- Stock adjustments and approval workflows
- Barcode and QR scanning
- Batch, serial-number, and expiry tracking
- Audit logs
- Automated unit and integration tests
- Charts generated entirely from transaction data
- Notifications and email alerts
- Docker-based deployment
- CI/CD validation through GitHub Actions

---

## Author

**Mayank Verma**

- GitHub: [Mayankverma210405](https://github.com/Mayankverma210405)
- LinkedIn: [mayankverma2128](https://www.linkedin.com/in/mayankverma2128/)
- Live project: [StockPilot Inventory Management](https://stock-pilot-inventory-management.vercel.app/)

---

## License

No open-source license has currently been added.

All rights are reserved unless a separate `LICENSE` file is introduced.
