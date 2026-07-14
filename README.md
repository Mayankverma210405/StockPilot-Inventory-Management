# StockPilot Inventory Management

A portfolio-ready enterprise inventory MVP built with React, TypeScript, and Vite. It includes role-based authentication, products, warehouses, stock transactions, low-stock alerts, dashboards, reports, and CSV export.

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`).

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Administrator | `mayank.admin@stockpilot.demo` | `admin123` |
| Inventory manager | `mayank.manager@stockpilot.demo` | `manager123` |

The administrator can create warehouses. The inventory manager can view the warehouse network and operate products, movements, and reports.

## Features

- Protected routes with login, logout, and two roles
- Product create, update, detail view, search, filters, categories, pricing, and reorder points
- Multi-warehouse stock assignment and availability rollups
- Stock-in and stock-out ledger with references, notes, user attribution, and negative-stock prevention
- Dashboard cards, inventory value, activity overview, recent transactions, warehouse distribution, and low-stock alerts
- Current stock, movement, and low-stock reports with CSV downloads
- Responsive UI and browser-persisted demo data

## Data note

This MVP deliberately uses `localStorage` for portfolio/demo convenience and `sessionStorage` for the current login. Use the profile menu’s **Reset demo data** action to restore the seeded state. For production, replace the context data functions with authenticated API calls and a transactional database.
