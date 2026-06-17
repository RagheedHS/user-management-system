# User Management System - Complete Setup Guide

## Overview
A full-stack User Management System with React frontend and Spring Boot backend, featuring JWT authentication, role-based access control, and comprehensive user/role/permission management.

## Prerequisites

### Backend Requirements
- Java 21+
- Maven 3.8+
- MySQL 8.0+

### Frontend Requirements
- Node.js 16+ and npm
- Modern web browser

## Project Structure

```
user management system/
├── backend/
│   ├── pom.xml
│   ├── src/
│   │   ├── main/java/com/example/demo/
│   │   │   ├── DemoApplication.java
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── UserController.java
│   │   │   │   ├── RoleController.java
│   │   │   │   └── PermissionController.java
│   │   │   ├── service/
│   │   │   │   ├── AuthService.java
│   │   │   │   ├── UserService.java
│   │   │   │   ├── RoleService.java
│   │   │   │   └── PermissionService.java
│   │   │   ├── entity/
│   │   │   │   ├── User.java
│   │   │   │   ├── Role.java
│   │   │   │   └── Permission.java
│   │   │   ├── repository/
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── RoleRepository.java
│   │   │   │   └── PermissionRepository.java
│   │   │   ├── dto/
│   │   │   │   ├── LoginRequest.java
│   │   │   │   ├── LoginResponse.java
│   │   │   │   ├── UserDTO.java
│   │   │   │   ├── RoleDTO.java
│   │   │   │   └── PermissionDTO.java
│   │   │   ├── security/
│   │   │   │   ├── JwtTokenProvider.java
│   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   └── CustomUserDetailsService.java
│   │   │   ├── config/
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   ├── CorsConfig.java
│   │   │   │   └── SeedDataLoader.java
│   │   └── resources/
│   │       └── application.properties
│   └── HELP.md
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── App.css
    │   ├── index.css
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── UsersPage.jsx
    │   │   ├── RolesPage.jsx
    │   │   └── PermissionsPage.jsx
    │   ├── components/
    │   │   ├── DashboardLayout.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── UserModal.jsx
    │   │   ├── RoleModal.jsx
    │   │   └── PermissionModal.jsx
    │   ├── services/
    │   │   └── api.js
    │   └── context/
    │       └── AuthContext.jsx
    └── README.md
```

## Backend Setup Instructions

### Step 1: Create MySQL Database

```sql
CREATE DATABASE user_management_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 2: Configure Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Update `src/main/resources/application.properties` with your MySQL credentials:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/user_management_db
   spring.datasource.username=root
   spring.datasource.password=your_password
   ```

3. Build the project:
   ```bash
   mvn clean install
   ```

4. Run the application:
   ```bash
   mvn spring-boot:run
   ```

The backend will start on `http://localhost:8080`

### Default Credentials (After Seed Data Loads)

| Username | Password | Role |
|----------|----------|------|
| admin | password123 | ADMIN |
| manager | password123 | MANAGER |
| user1 | password123 | USER |
| user2 | password123 | USER |

## Frontend Setup Instructions

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Configure API Base URL

The API is configured to connect to `http://localhost:8080/api` in `src/services/api.js`. If your backend runs on a different port/host, update the `API_BASE_URL` constant:

```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

### Step 3: Start Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

### Step 4: Build for Production

```bash
npm run build
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/validate` - Validate JWT token

### Users
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/username/{username}` - Get user by username
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `POST /api/users/{id}/change-password` - Change password
- `POST /api/users/{id}/reset-password` - Reset password (admin only)

### Roles
- `GET /api/roles` - Get all roles
- `GET /api/roles/{id}` - Get role by ID
- `POST /api/roles` - Create role
- `PUT /api/roles/{id}` - Update role
- `DELETE /api/roles/{id}` - Delete role
- `POST /api/roles/{roleId}/permissions/{permissionId}` - Add permission to role
- `DELETE /api/roles/{roleId}/permissions/{permissionId}` - Remove permission from role

### Permissions
- `GET /api/permissions` - Get all permissions
- `GET /api/permissions/{id}` - Get permission by ID
- `POST /api/permissions` - Create permission
- `PUT /api/permissions/{id}` - Update permission
- `DELETE /api/permissions/{id}` - Delete permission

## Features

### Backend Features
✅ JWT-based authentication and authorization
✅ Role-based access control (RBAC)
✅ Role hierarchy support
✅ Password hashing with BCrypt
✅ Comprehensive validation
✅ CORS configuration
✅ Seed data for testing
✅ Clean layered architecture (Controller → Service → Repository)
✅ Proper error handling and HTTP status codes

### Frontend Features
✅ Responsive admin dashboard
✅ User authentication with JWT
✅ Protected routes with automatic redirection
✅ User management (CRUD)
✅ Role management with permissions
✅ Permission management
✅ Role hierarchy visualization
✅ Error handling and validation
✅ Loading states
✅ Tailwind CSS for styling
✅ React Router for navigation

## Database Schema

### Users Table
- id (PK)
- username (UNIQUE)
- email (UNIQUE)
- password (encrypted)
- firstName
- lastName
- active
- role_id (FK)
- createdAt
- updatedAt

### Roles Table
- id (PK)
- name (UNIQUE)
- description
- roleLevel (for hierarchy)
- active
- parent_role_id (FK - self-referencing for hierarchy)

### Permissions Table
- id (PK)
- name (UNIQUE)
- description
- category
- active

### Role-Permissions Join Table
- role_id (FK, PK)
- permission_id (FK, PK)

## Security Considerations

1. **JWT Token Expiration**: Set to 24 hours by default. Modify in `application.properties`:
   ```properties
   jwt.expiration=86400000  # milliseconds
   ```

2. **JWT Secret**: Change the default secret key in production:
   ```properties
   jwt.secret=YourSecureSecretKeyWithAtLeast32Characters
   ```

3. **CORS Configuration**: Update allowed origins in `CorsConfig.java` for production

4. **Password Requirements**: Minimum 6 characters (customize in DTOs)

5. **Database**: Use strong passwords for MySQL user in production

## Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Find and kill process on port 8080
netstat -ano | findstr :8080  # Windows
lsof -i :8080  # Mac/Linux
```

**MySQL Connection Error:**
- Ensure MySQL is running
- Check database exists: `SHOW DATABASES;`
- Verify credentials in application.properties
- Check JDBC URL format

**Build Errors:**
```bash
mvn clean install -DskipTests
```

### Frontend Issues

**API Connection Error:**
- Verify backend is running on port 8080
- Check API_BASE_URL in `src/services/api.js`
- Check browser console for CORS errors
- Ensure JWT token is being stored/sent correctly

**Dependencies Issue:**
```bash
rm package-lock.json
npm install
```

## Performance Optimization

### Backend
- Implement database indexing on frequently queried columns
- Use pagination for large datasets
- Enable caching for roles and permissions
- Use lazy loading for relationships

### Frontend
- Code splitting with React.lazy()
- Image optimization
- Bundle analysis with Vite

## Future Enhancements

1. Two-factor authentication (2FA)
2. Audit logging for user actions
3. API rate limiting
4. Advanced search and filtering
5. Batch operations for users/roles
6. OAuth2/SAML integration
7. Email notifications
8. User profile customization
9. Permission matrix visualization
10. Activity dashboard and reports

## Deployment

### Backend Deployment

**Using Docker:**
```dockerfile
FROM openjdk:21-jdk
COPY target/backend-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

**Using Cloud (AWS, GCP, Azure):**
1. Create JAR: `mvn clean package`
2. Upload to cloud service
3. Configure environment variables for database and JWT secret

### Frontend Deployment

**Using Vercel/Netlify:**
```bash
npm run build
# Deploy the dist folder
```

**Using Docker:**
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Support & Documentation

For more information on the technologies used:
- Spring Boot: https://spring.io/projects/spring-boot
- Spring Security: https://spring.io/projects/spring-security
- React: https://react.dev
- Tailwind CSS: https://tailwindcss.com
- Vite: https://vitejs.dev

## License

This project is open source and available under the MIT License.
