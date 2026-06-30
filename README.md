# Hardware Shop — Frontend

> Angular 21 single-page app (with server-side rendering) for managing a hardware shop: inventory, sales, customers and a credit (borrow) ledger. Talks to the [Shop Inventory API](https://github.com/eqbaltherebel/shop_inventory).

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Angular Material](https://img.shields.io/badge/Angular%20Material-21-757575?logo=angular&logoColor=white)](https://material.angular.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Screens](#screens)
- [Getting started](#getting-started)
- [Environments & configuration](#environments--configuration)
- [Available scripts](#available-scripts)
- [Project structure](#project-structure)
- [Running with Docker](#running-with-docker)
- [Deployment](#deployment)
- [Coding standards](#coding-standards)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## Features

- **JWT auth** — login / register, token persisted and attached via an HTTP interceptor; routes protected by a functional guard.
- **Dashboard** — key metrics and charts (Chart.js via ng2-charts).
- **Inventory** — item CRUD with image upload, categories, storage locations, low-stock highlighting and price-history views.
- **Sales** — create sales, cancel/restock, daily and date-range reports.
- **Customers** — directory with search and per-customer sales history.
- **Borrow ledger** — credit entries, payments, running balances and overdue tracking.
- **Responsive UI** — Angular Material, mobile-friendly layouts.
- **SSR** — server-side rendering via Angular SSR + Express for fast first paint.

## Tech stack

| Area | Technology |
|------|------------|
| Framework | Angular 21 (standalone components, signals, lazy-loaded routes) |
| Language | TypeScript 5.9 |
| UI | Angular Material + CDK |
| Charts | Chart.js + ng2-charts |
| SSR | @angular/ssr + Express |
| Testing | Vitest |
| Tooling | Angular CLI, Prettier |

## Screens

> _Add screenshots/GIFs here (e.g. `docs/screenshots/dashboard.png`)._

| Dashboard | Inventory | Ledger |
|-----------|-----------|--------|
| _tbd_ | _tbd_ | _tbd_ |

## Getting started

### Prerequisites

- Node.js 20+ (22 recommended)
- npm 10+
- A running [Shop Inventory API](https://github.com/eqbaltherebel/shop_inventory) (locally on `http://localhost:8080` by default in development)

### Install & run

```bash
git clone https://github.com/eqbaltherebel/hardware-shop-frontend.git
cd hardware-shop-frontend
npm install
npm start
```

Open `http://localhost:4200/`. In development the app points at
`http://localhost:8080/api` (see below).

## Environments & configuration

The backend base URL is centralized in `src/environments/`:

| File | Used by | `apiBaseUrl` |
|------|---------|--------------|
| `environment.ts` | `ng build` (production) | `https://shop-inventory-ddc0.onrender.com/api` |
| `environment.development.ts` | `ng serve` | `http://localhost:8080/api` |

`angular.json` swaps the file for the development configuration via
`fileReplacements`. To target a different backend, edit the relevant file —
no service code needs to change.

## Available scripts

| Script | Description |
|--------|-------------|
| `npm start` | Dev server at `:4200` (development environment) |
| `npm run build` | Production build into `dist/` |
| `npm run watch` | Rebuild on change (development config) |
| `npm test` | Unit tests (Vitest) |
| `npm run serve:ssr:hardware-shop-frontend` | Run the SSR server from `dist/` |

## Project structure

```
src/app
├── auth/           # login & register
├── dashboard/      # metrics & charts
├── inventory/      # items, item form/detail, price history
├── location/       # storage locations
├── sales/          # sale form/list/detail, reports
├── customers/      # customer list & detail
├── borrow/         # ledger, entries, payments
├── services/       # HTTP services (use environment.apiBaseUrl)
├── models/         # TypeScript interfaces
├── guards/         # auth route guard
├── interceptors/   # JWT HTTP interceptor
└── shell/          # app shell / navigation
src/environments/   # environment.ts, environment.development.ts
```

## Running with Docker

The app is server-side rendered, so the container runs the Node SSR server:

```bash
docker build -t hardware-shop-frontend .
docker run -p 4000:4000 hardware-shop-frontend
```

Then open `http://localhost:4000/`.

## Deployment

Any static or Node host works. For SSR, deploy the `dist/` output and run the
server entry (`server.mjs`); for a static-only deploy, host the browser build
output behind your web server. Set the production `apiBaseUrl` to your
deployed API before building.

## Coding standards

This project follows the Angular style captured in `AGENTS.md` /
`.github/copilot-instructions.md`: standalone components, signals for state,
`inject()`, native control flow (`@if`/`@for`), reactive forms, `OnPush`
change detection and strict TypeScript. Please keep contributions consistent.

## Roadmap

- Replace remaining manual token handling with the interceptor everywhere
- Global error/toast handling and loading states
- Pagination on large lists
- E2E tests (Playwright/Cypress) and a CI test stage
- Screenshots & live demo link

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Released under the [MIT License](LICENSE).
