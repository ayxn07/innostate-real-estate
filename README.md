<div align="center">
  <img src="public/images/logo-full.png" alt="InnoState Real Estate" width="420">

  <h1>InnoState Real Estate</h1>

  <p>A modern multi-page real estate website with property listings, client &amp; admin dashboards, and a small Express API.</p>
</div>

---

## Overview

InnoState is a static frontend served by a lightweight **Node.js + Express** backend. Property listings are stored in a single JSON file and served through one API route, keeping the data in one place rather than hardcoded across pages.

## Features

- 🏠 **Property listings** — browse, filter, and view full property details
- 🖼️ **Image gallery** — each listing has a slideshow of photos
- 👤 **Client dashboard** — saved/managed listings for signed-in users
- 🛠️ **Admin dashboard** — add new properties that appear on the public site
- 🔌 **JSON-backed API** — `GET /api/properties` serves all listings
- 📱 **Responsive design** — works across desktop and mobile

## Tech stack

| Layer    | Tech                          |
|----------|-------------------------------|
| Backend  | Node.js, Express 4            |
| Frontend | HTML, CSS, vanilla JavaScript |
| Data     | JSON file (`data/`)           |

## Project structure

```
innostate/
├── server.js              # Express server (static files + API)
├── package.json
├── data/
│   └── properties.json    # Property listings data
└── public/                # Served as the site root
    ├── *.html             # Pages (home, properties, about, dashboards, ...)
    ├── css/style.css
    ├── js/                # Page scripts (main, properties, details, ...)
    └── images/            # Logos and property photos
```

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer (includes npm)

### Install &amp; run

```bash
npm install
npm start
```

Then open **http://localhost:3000** in your browser.

## API

| Method | Route             | Description                  |
|--------|-------------------|------------------------------|
| GET    | `/api/properties` | Returns all property listings as JSON |

## License

University project — for educational use.
