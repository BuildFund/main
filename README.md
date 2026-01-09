# BuildFund Front‑End (React)

This directory contains a simple React application that consumes the BuildFund API.  It provides basic user authentication, borrower and lender dashboards, and minimal forms for creating projects and products.  The front‑end relies on the back‑end implemented in the `buildfund_webapp` directory.

## Prerequisites

* Node.js 18 or later
* npm or yarn

## Setup

Install dependencies:

```bash
cd new_website
npm install
```

Create a `.env` file in this directory to configure the API base URL:

```env
# Address of the Django API (no trailing slash)
REACT_APP_API_BASE_URL=http://localhost:8000
```

## Running the development server

```bash
npm start
```

This will start the React development server and open the app in your browser.  API requests are proxied to the URL specified by `REACT_APP_API_BASE_URL`.

## Available pages

* `/login` – Authentication page.  After logging in, a token is stored in `localStorage`.
* `/` – Dashboard page showing navigation options based on the user’s role (Borrower or Lender).  The role is currently hardcoded to “Borrower” in `Login.js`; you should extend the back‑end to return the user’s actual role.
* `/borrower/projects` – Lists the borrower’s projects and provides a form to create a new project.
* `/lender/products` – Lists the lender’s products and provides a form to create a new product.

This application is intentionally minimal and serves as a starting point.  It does **not** implement all the wizards, matching or investor features described in the specification.  Your development team should expand the React app to support multi‑step forms, display matched products, handle applications, and integrate AI underwriting and mapping features from the back‑end.