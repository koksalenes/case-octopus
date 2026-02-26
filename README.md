<a id="top"></a>

<p align="center">
  <img src="public/assets/logos/logo-full.svg" alt="Octopus Logo" width="320" />
</p>

<h1 align="center">Octopus Frontend Case</h1>

<p align="center">
  A modern e-commerce front-end application built as a technical case study for <strong>Octopus Digital Signage</strong>.
  <br />
</p>

<br />

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.1.6-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
</p>

<br />

---

## Table of Contents

- [About](#about)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Developer Notes](#developer-notes)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Running Without Docker](#running-without-docker)
  - [Running with Docker](#running-with-docker)
- [Code Quality](#code-quality)
- [License](#license)

---

## About

**Octopus Case** is a front-end e-commerce application developed as a technical evaluation case study for Octopus Digital Signage. The app covers three core user-facing experiences:

- **Login & Session Management** — Users authenticate with their credentials through a clean login page. Access tokens and refresh tokens are stored and managed automatically, keeping the user's session alive seamlessly across page reloads.

- **Product Listing** — Product page showcasing the full catalogue. Products can be narrowed down by **category** using a filter panel or by **keyword** using the search bar, making it easy to find exactly what's needed.

- **Product Detail** — Clicking on any product opens a dedicated detail page displaying all relevant information about that images, description, pricing, and more.

- **Shopping Cart** — Features a simulated shopping cart functionality where users can add products to their cart, view added items, and experience a mock shopping flow.

---

## Tech Stack

| Category              | Technology                                         |
| --------------------- | -------------------------------------------------- |
| **Framework**         | Next.js + React                                    |
| **Language**          | TypeScript                                         |
| **Styling**           | Tailwind CSS                                       |
| **State Management**  | Redux Toolkit                                      |
| **HTTP Client**       | Axios (client-side) · native `fetch` (server-side) |
| **Schema Validation** | Zod                                                |
| **Linting**           | ESLint                                             |
| **Formatting**        | Prettier                                           |
| **Git Hooks**         | Husky + lint-staged + Commitlint                   |
| **Containerization**  | Docker                                             |

---

## Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── .../page.tsx          # Login page
│   ├── globals.css           # Global styles
├── components/               # Shared reusable UI components (Button, Spinner, etc.)
│   ├── ui/                   # UI components
│   ├── layout/               # Layout components
├── config/                   # Environment config & validation (Zod schemas)
├── constants/                # Constants
├── features/                 # Feature-based modules
│   └── auth/                 # Authentication feature
│       ├── components/       # Login form, hero, password input etc.
│       ├── constants/        # Auth-specific constants
│       ├── services/         # Auth API service layer
│       ├── store/            # Auth Redux slice
│       └── types/            # Auth TypeScript types
│   └── .../                  # Other features
├── hooks/                    # Custom hooks
├── lib/                      # Core utilities (Axios client, interceptors, serverFetch, logger, token storage etc.)
├── store/                    # Redux store configuration, hooks, StoreProvider etc.
└── types/                    # Shared TypeScript types
```

---

## Developer Notes

> 1- Normally, the Figma design submitted for the case study retrieves the email address, but since the dummyjson API uses a username for login, I changed this part from email address to username.

> 2- Because the CORS setting is set to "\*" for public access to the dummyjson API, requests cannot be made with credentials = true. The API side also cannot add the cookie using `set-cookie` for this reason. Normally, the refresh token should be stored in a cookie for security reasons, but since we don't have backend control, we can't change the CORS setting, so I stored the refresh token on local storage.

> 3- Two HTTP mechanisms are used intentionally. **Axios** (`src/lib/axios.ts`) handles all client-side requests and provides request/response interceptors, automatic auth-header injection, and silent token refresh on 401. **Native `fetch`** is used in server-side (RSC) service files via the `src/lib/serverFetch.ts` wrapper because Axios does not support Next.js's extended `fetch` options (`next.revalidate`, `next.tags`) required for ISR/RSC caching. Raw `fetch` calls are never left inline — `serverFetch` centralises error handling and cache configuration.

> 4- Since the color and product specification data on the product detail page did not come from dummyjson, static data was used for all products here.

> 5- To simulate the shopping cart using dummyjson, I simulated adding items to cart number 1 in the dummyjson. However, because we can't update the data via API, some items in the cart appear static, and only the last item we added changes. Since we don't have API access, I created this entirely as a simulation.

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 9
- **Docker** (optional, for containerized setup)

### Clone Repository

```bash
# 1. Clone repository
git clone https://github.com/koksalenes/case-octopus.git
```

```bash
# 2. Navigate project directory
cd case-octopus
```

### Environment Variables

Create a `.env.local` file in the project root and copy the contents of `.env.example`.
If you need to make changes to the environment variables, do so.

> Environment variables are validated at startup via Zod. The app will fail fast with descriptive error messages if any required variable is missing or invalid.

---

### Running Without Docker

#### Development

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

The app will be available at **http://localhost:3000**.

#### Production

```bash
# 1. Install dependencies
npm install

# 2. Build the production bundle
npm run build

# 3. Start the production server
npm start
```

The app will be available at **http://localhost:3000**.

---

### Running with Docker

The project includes a multi-stage Dockerfile with separate **development** and **production** targets.

#### Development

```bash
# Build the development image
docker build --target development -t octopus-case:dev .

# Run the development container
docker run -p 3000:3000 --env-file .env.local octopus-case:dev
```

The app will be available at **http://localhost:3000**.

#### Production

```bash
# Build the production image
docker build --target production -t octopus-case:prod .

# Run the production container
docker run -p 3000:3000 --env-file .env.local octopus-case:prod
```

The app will be available at **http://localhost:3000**.

---

## Code Quality

This project enforces strict code quality standards through an automated toolchain:

- **ESLint** — Configured with Next.js Core Web Vitals, TypeScript, and Prettier compatibility rules.
- **Prettier** — Automatic code formatting with Tailwind CSS class sorting plugin.
- **Husky + lint-staged** — Pre-commit hooks that lint and format staged files automatically.
- **Commitlint** — Enforces conventional commits specification on every commit message.

---

## License

Copyright © 2026 **Enes Köksal** & **Octopus Digital Signage**

This project is a technical evaluation case study. See the [LICENSE](LICENSE) file for details.

<br>
<p align="center">
  <a href="#top">
    <img src="https://img.shields.io/badge/BACK_TO_TOP-↑-000000?style=for-the-badge" alt="Back to Top" />
  </a>
</p>
