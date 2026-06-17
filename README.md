# 🔐 User Management System

A comprehensive full-stack user management application with authentication, authorization, and role-based access control.

## 📋 Quick Start

### Prerequisites
- **Java 21+** and **Maven**
- **MySQL 8.0+**
- **Node.js 16+** and **npm**

### 1️⃣ Backend Setup (5 minutes)

```bash
# Create database
mysql -u root -p
CREATE DATABASE user_management_db;
EXIT;

# Configure & Run Backend
cd backend
# Edit src/main/resources/application.properties with your MySQL credentials
mvn spring-boot:run
```

Backend runs on: `http://localhost:8080`

### 2️⃣ Frontend Setup (5 minutes)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

### 3️⃣ Login with Demo Account

```
Username: admin
Password: password123
```

## 📦 What's Included

### Backend (Spring Boot 4.0.6)
- ✅ JWT Authentication & Authorization
- ✅ Role-Based Access Control (RBAC)
- ✅ Role Hierarchy Support
- ✅ User/Role/Permission Management APIs
- ✅ MySQL Database
- ✅ Spring Security with BCrypt
- ✅ CORS Configuration
- ✅ Seed Data Loader
- ✅ Clean Layered Architecture

### Frontend (React 19 + Vite)
- ✅ Responsive Admin Dashboard
- ✅ JWT-based Login
- ✅ Protected Routes
- ✅ User Management
- ✅ Role Management with Permissions
- ✅ Permission Management
- ✅ Role Hierarchy Visualization
- ✅ Tailwind CSS Styling
- ✅ React Router Navigation
- ✅ Axios API Client

## 🗂️ Project Structure

```
user-management-system/
├── backend/                    # Spring Boot Application
│   ├── src/main/java/com/example/demo/
│   │   ├── controller/        # REST Controllers
│   │   ├── service/           # Business Logic
│   │   ├── entity/            # Database Models
│   │   ├── repository/        # Data Access
│   │   ├── dto/               # Data Transfer Objects
│   │   ├── security/          # JWT & Security
│   │   └── config/            # Configuration
│   └── pom.xml
│
├── frontend/                   # React Application
│   ├── src/
│   │   ├── pages/            # Page Components
│   │   ├── components/       # Reusable Components
│   │   ├── context/          # Auth Context
│   │   ├── services/         # API Service
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
└── SETUP_GUIDE.md            # Detailed Setup Instructions
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user
- `GET /api/auth/validate` - Validate token

### Users
- `GET/POST /api/users` - List/Create users
- `GET/PUT/DELETE /api/users/{id}` - Get/Update/Delete user
- `POST /api/users/{id}/change-password` - Change password
- `POST /api/users/{id}/reset-password` - Admin reset password

### Roles
- `GET/POST /api/roles` - List/Create roles
- `GET/PUT/DELETE /api/roles/{id}` - Get/Update/Delete role
- `POST /api/roles/{roleId}/permissions/{permissionId}` - Add permission

### Permissions
- `GET/POST /api/permissions` - List/Create permissions
- `GET/PUT/DELETE /api/permissions/{id}` - Get/Update/Delete permission

## 🔐 Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `password123` |
| Manager | `manager` | `password123` |
| User | `user1` | `password123` |
| User | `user2` | `password123` |

## 📊 Database Schema

### Users
- User ↔ Role (Many-to-One)
- Auto-generated timestamps
- Password encrypted with BCrypt

### Roles
- Role ↔ Permission (Many-to-Many)
- Role ↔ Role (Self-referencing hierarchy)
- Role levels for hierarchy (0-100+)

### Permissions
- Categorized by domain (User, Role, Permission, Dashboard, Reports, etc.)
- Active/Inactive status

## 🔒 Security Features

- ✅ JWT Token-based Authentication (24hr expiry)
- ✅ BCrypt Password Hashing
- ✅ Role-Based Authorization
- ✅ Role Hierarchy Support
- ✅ Permission-Level Access Control
- ✅ CORS Protection
- ✅ Input Validation
- ✅ Secure Password Change/Reset

## 🚀 Advanced Features

- **Role Hierarchy**: Parent-child role relationships for cascading permissions
- **Permission Categories**: Organize permissions by domain/functionality
- **Responsive Design**: Mobile-friendly admin dashboard
- **Real-time Feedback**: Loading states and error handling
- **Data Persistence**: Automatic timestamp tracking (createdAt, updatedAt)

## 🛠️ Configuration

### Backend Configuration
Edit `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/user_management_db
spring.datasource.username=root
spring.datasource.password=your_password
jwt.secret=YourSecretKey
jwt.expiration=86400000
```

### Frontend Configuration
Edit `frontend/src/services/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

## 📚 Technologies

### Backend
- Java 21
- Spring Boot 4.0.6
- Spring Security
- Spring Data JPA
- MySQL 8.0
- JWT (jjwt)
- Maven

### Frontend
- React 19
- Vite
- React Router v7
- Axios
- Tailwind CSS
- React Icons

## 🐛 Troubleshooting

**Backend won't start:**
```bash
# Check MySQL
mysql -u root -p
SHOW DATABASES;

# Clean rebuild
mvn clean install -DskipTests
```

**Frontend shows API errors:**
- Ensure backend is running on port 8080
- Check CORS configuration
- Verify JWT token in browser localStorage

**Port conflicts:**
```bash
# Windows
netstat -ano | findstr :8080

# Mac/Linux
lsof -i :8080
```

## 📖 For Detailed Setup

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for comprehensive documentation including:
- Step-by-step installation
- Database setup
- Configuration options
- Deployment instructions
- API documentation
- Troubleshooting guide

## 🎯 Next Steps

1. Review the code structure in each module
2. Customize seed data in `SeedDataLoader.java`
3. Update JWT secret and CORS settings for production
4. Add custom business logic to services
5. Extend API endpoints as needed
6. Deploy to your preferred cloud platform

## 📝 Features Checklist

### Core Requirements ✅
- [x] JWT Authentication & Login
- [x] MySQL Database
- [x] User Management (CRUD)
- [x] Role Management (CRUD)
- [x] Permission Management (CRUD)
- [x] Role Hierarchy
- [x] REST APIs
- [x] Spring Security
- [x] Role-Based Authorization

### UI/UX ✅
- [x] Admin Dashboard
- [x] Login Page
- [x] User Management Page
- [x] Role Management Page
- [x] Permission Management Page
- [x] Responsive Design
- [x] Error Handling
- [x] Loading States

### Architecture ✅
- [x] Clean Layered Architecture
- [x] DTO Pattern
- [x] Service Layer
- [x] Repository Pattern
- [x] Security Configuration
- [x] CORS Configuration
- [x] Seed Data
- [x] Validation

## 💡 Tips

- Default role for new users: USER
- Modify role levels to fine-tune hierarchy
- Use permission categories for better organization
- Test with all demo accounts to see different access levels
- Check browser console for API debugging

## 🤝 Contributing

Feel free to extend this project with additional features or improvements!

## 📄 License

MIT License - Free to use and modify

---

**Ready to start?** See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions!
