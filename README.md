# User Management System (CoreManager)

A premium, state-of-the-art User Management System featuring a React frontend (Vite) and a Spring Boot (Maven) backend.

## Architecture

This project is organized into two primary folders under the root directory:
- `frontend/`: Single Page Application built with React, Vite, and Vanilla HSL CSS.
- `backend/`: REST API built with Spring Boot, Spring Data JPA, and H2 database.

---

## Getting Started

### 1. Run the Spring Boot Backend

The backend runs on port `8080` by default and uses an in-memory H2 database seeded with initial users.

From the project root:
```bash
cd backend
mvn spring-boot:run
```

- **API Endpoint**: `http://localhost:8080/api/users`
- **H2 Console**: `http://localhost:8080/h2-console`
  - **JDBC URL**: `jdbc:h2:mem:userdb`
  - **Username**: `sa`
  - **Password**: `password`

---

### 2. Run the React Frontend

The frontend development server runs on `http://localhost:5173`. It is configured to automatically communicate with the backend on port `8080`.

From the project root:
```bash
cd frontend
npm run dev
```

*Note: All npm dependencies have already been pre-installed in the `frontend` folder.*

---

## Features

- **Dashboard Metrics**: Interactive metrics tracking Total Users, Active Status, Pending invites, and Administrator numbers.
- **Glassmorphic UI**: High-fidelity dark mode by default with light mode toggling support, designed using vanilla CSS variables.
- **CRUD Operations**: Live addition, editing, and removal of users with sliding side-drawers and confirmation modals.
- **Search & Filtering**: Search by name/email, and filter instantly by Roles (Admin, Editor, Viewer) and Status (Active, Inactive, Pending).
- **CORS Configured**: Cross-Origin Resource Sharing is enabled out of the box, allowing seamless React-to-Spring Boot HTTP calls.
- **Resilient Offline Syncing**: The React app includes a custom API layer. If the backend is not running yet, it seamlessly falls back to `localStorage` mock data, letting you test the frontend fully. When the backend is booted up, it queries the live REST API database.
