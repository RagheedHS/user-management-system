# API Reference - User Management System

## Base URL
```
http://localhost:8080/api
```

## Authentication

All endpoints except `/auth/login` and `/auth/register` require JWT token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Authentication (`/auth`)

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "userId": 1,
  "username": "admin",
  "email": "admin@example.com",
  "roleName": "ADMIN"
}
```

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "userId": 5,
  "username": "newuser",
  "email": "newuser@example.com",
  "roleName": "USER"
}
```

#### Validate Token
```http
GET /auth/validate
Authorization: Bearer <token>
```

**Response (200 OK):**
```
Token is valid
```

---

### 2. Users (`/users`)

#### Get All Users
```http
GET /users
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "active": true,
    "roleId": 1,
    "roleName": "ADMIN",
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  }
]
```

#### Get User by ID
```http
GET /users/{id}
Authorization: Bearer <token>
```

#### Get User by Username
```http
GET /users/username/{username}
Authorization: Bearer <token>
```

#### Get Active Users Only
```http
GET /users/active
Authorization: Bearer <token>
```

#### Create User
```http
POST /users?roleId=1
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "active": true,
  "roleId": 2
}
```

**Response (201 Created):**
```json
{
  "id": 5,
  "username": "newuser",
  "email": "newuser@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "active": true,
  "roleId": 2,
  "roleName": "USER",
  "createdAt": "2024-01-15T14:20:00",
  "updatedAt": "2024-01-15T14:20:00"
}
```

#### Update User
```http
PUT /users/{id}?roleId=2
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "updated@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "active": true,
  "roleId": 2
}
```

#### Delete User
```http
DELETE /users/{id}
Authorization: Bearer <token>
```

**Response (204 No Content)**

#### Change Password
```http
POST /users/{id}/change-password?oldPassword=oldpass&newPassword=newpass
Authorization: Bearer <token>
```

**Response (200 OK):**
```
Password changed successfully
```

#### Reset Password (Admin Only)
```http
POST /users/{id}/reset-password?newPassword=newpass
Authorization: Bearer <token>
```

---

### 3. Roles (`/roles`)

#### Get All Roles
```http
GET /roles
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "ADMIN",
    "description": "Administrator",
    "roleLevel": 100,
    "active": true,
    "parentRoleId": null,
    "permissionIds": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
  }
]
```

#### Get Active Roles Only
```http
GET /roles/active
Authorization: Bearer <token>
```

#### Get Role by ID
```http
GET /roles/{id}
Authorization: Bearer <token>
```

#### Create Role
```http
POST /roles
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "SUPERVISOR",
  "description": "Supervisor Role",
  "roleLevel": 75,
  "active": true,
  "permissionIds": [1, 2, 5, 6],
  "parentRoleId": 1
}
```

**Response (201 Created):**
```json
{
  "id": 4,
  "name": "SUPERVISOR",
  "description": "Supervisor Role",
  "roleLevel": 75,
  "active": true,
  "parentRoleId": 1,
  "permissionIds": [1, 2, 5, 6]
}
```

#### Update Role
```http
PUT /roles/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Updated description",
  "roleLevel": 80,
  "active": true,
  "permissionIds": [1, 2, 3, 5, 6],
  "parentRoleId": 1
}
```

#### Delete Role
```http
DELETE /roles/{id}
Authorization: Bearer <token>
```

**Response (204 No Content)**

#### Add Permission to Role
```http
POST /roles/{roleId}/permissions/{permissionId}
Authorization: Bearer <token>
```

#### Remove Permission from Role
```http
DELETE /roles/{roleId}/permissions/{permissionId}
Authorization: Bearer <token>
```

---

### 4. Permissions (`/permissions`)

#### Get All Permissions
```http
GET /permissions
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "CREATE_USER",
    "description": "Create new users",
    "category": "User Management",
    "active": true
  },
  {
    "id": 2,
    "name": "READ_USER",
    "description": "Read user information",
    "category": "User Management",
    "active": true
  }
]
```

#### Get Permission by ID
```http
GET /permissions/{id}
Authorization: Bearer <token>
```

#### Create Permission
```http
POST /permissions
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "EXPORT_DATA",
  "description": "Export system data",
  "category": "Reports",
  "active": true
}
```

**Response (201 Created):**
```json
{
  "id": 15,
  "name": "EXPORT_DATA",
  "description": "Export system data",
  "category": "Reports",
  "active": true
}
```

#### Update Permission
```http
PUT /permissions/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Updated description",
  "category": "Reports",
  "active": true
}
```

#### Delete Permission
```http
DELETE /permissions/{id}
Authorization: Bearer <token>
```

**Response (204 No Content)**

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Invalid input data"
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "message": "Access denied"
}
```

### 404 Not Found
```json
{
  "message": "User not found with id: 999"
}
```

### 409 Conflict
```json
{
  "message": "Username already exists"
}
```

---

## Default Permissions (Seed Data)

### User Management
- `CREATE_USER` - Create new users
- `READ_USER` - Read user information
- `UPDATE_USER` - Update user information
- `DELETE_USER` - Delete users

### Role Management
- `CREATE_ROLE` - Create new roles
- `READ_ROLE` - Read role information
- `UPDATE_ROLE` - Update role information
- `DELETE_ROLE` - Delete roles

### Permission Management
- `CREATE_PERMISSION` - Create new permissions
- `READ_PERMISSION` - Read permission information
- `UPDATE_PERMISSION` - Update permission information
- `DELETE_PERMISSION` - Delete permissions

### Dashboard
- `VIEW_DASHBOARD` - View admin dashboard
- `VIEW_REPORTS` - View reports

---

## Default Roles (Seed Data)

### ADMIN (Level: 100)
- All 14 permissions
- Can manage everything

### MANAGER (Level: 50)
- User: READ, UPDATE
- Role: CREATE, READ, UPDATE
- Permission: READ
- Dashboard: VIEW_DASHBOARD, VIEW_REPORTS

### USER (Level: 10)
- User: READ
- Dashboard: VIEW_DASHBOARD

---

## Rate Limiting & Pagination

Currently no built-in rate limiting or pagination. Consider implementing for production:

```http
GET /users?page=0&size=20
```

---

## CORS Headers

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
Access-Control-Allow-Headers: *
Access-Control-Max-Age: 3600
```

---

## Tips

1. **Token Storage**: Store JWT token in localStorage or sessionStorage
2. **Token Refresh**: Implement refresh token logic for better security
3. **Request Headers**: Ensure Content-Type is `application/json` for POST/PUT
4. **Pagination**: Manually implement for large datasets
5. **Search**: Use query parameters like `?search=value` for filtering
