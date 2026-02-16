# Expense Tracker Dashboard

A lightweight expense-tracking dashboard built with Angular. This project tracks year-to-date spending, average monthly spending, credit card usage, and miscellaneous expenses using a simple REST backend.

---

## Features

- **Spending Summary**
  - Year-to-date total spending
  - Average monthly spending (calculated dynamically)

- **Credit Card Tracking**
  - View card spending vs. limits
  - Incrementally update card spending
  - Incrementally update card limits
  - Card images rendered with optimized loading

- **Miscellaneous Spending**
  - Track non-card expenses
  - Update misc spending using deltas (add or subtract)

- **Modern Angular Patterns**
  - Standalone components
  - Reactive Forms
  - HTTP services with RxJS

---

## Tech Stack

- Frontend: Angular
- Backend: JSON Server
- Styling: CSS (Flexbox)
- Data: RxJS, Angular HttpClient

---

## Project Structure (Key Files)

```text
src/
├── app/
│   ├── components/
│   │   └── user-dashboard/
│   │       ├── user-dashboard.ts
│   │       ├── user-dashboard.html
│   │       └── user-dashboard.css
│   ├── models/
│   │   ├── card.ts
│   │   └── user-spending.ts
│   ├── services/
│   │   └── user-spending-data.ts
│   └── app.config.ts
├── assets/
│   │   └── card_pngs/
├── db.json
└── main.ts
```

---

## How It Works

- The `UserDashboardComponent` fetches spending data on initialization.
- Backend data is mapped into typed `UserSpending` and `Card` models.
- Reactive form controls allow incremental updates to spending and limits.
- The UI previews changes before submission.
- Updates are persisted via PATCH requests to the backend.

---

## Backend Setup

This project expects a local REST API running at:

    http://localhost:3000/userSpending

### Start JSON Server

    npm install -g json-server
    json-server --watch db.json --port 3000

---

## Run the App

    npm install
    ng serve

Then open:

    http://localhost:4200

---

## Current Limitations

- Single-user demo (no authentication)
- No ability to add or remove cards
- No transaction history
- `Card Paid` button not implemented

---
