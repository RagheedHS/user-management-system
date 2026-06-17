# Post-Setup Verification Checklist

Complete this checklist after setting up the project to ensure everything is working correctly.

## ✅ Backend Verification

### Database Setup
- [ ] MySQL is running
- [ ] Database `user_management_db` exists
- [ ] Tables are created automatically (check MySQL console)

### Backend Startup
- [ ] `mvn spring-boot:run` completes without errors
- [ ] Server shows "Started DemoApplication" message
- [ ] Backend is accessible at `http://localhost:8080`

### Seed Data
- [ ] Check database has 4 users in `users` table
- [ ] Check database has 3 roles in `roles` table
- [ ] Check database has 14 permissions in `permissions` table
- [ ] Check role-permission mappings exist

### API Testing (using curl or Postman)
```bash
# Test login endpoint
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'

# Should return JWT token and user info
```

- [ ] Login returns valid JWT token
- [ ] Token has "Bearer" type
- [ ] UserId, username, email are in response
- [ ] RoleName is returned

### API Endpoints Verification
```bash
# Get all users
curl -X GET http://localhost:8080/api/users \
  -H "Authorization: Bearer <token>"

# Get all roles
curl -X GET http://localhost:8080/api/roles \
  -H "Authorization: Bearer <token>"

# Get all permissions
curl -X GET http://localhost:8080/api/permissions \
  -H "Authorization: Bearer <token>"
```

- [ ] GET /api/users returns user list (at least 4 users)
- [ ] GET /api/roles returns role list (at least 3 roles)
- [ ] GET /api/permissions returns permission list (at least 14 permissions)
- [ ] Each user has a role assigned
- [ ] Each role has permissions assigned

### CORS Configuration
- [ ] Backend accepts requests from `http://localhost:5173`
- [ ] No "CORS error" in browser console
- [ ] Authorization header is properly accepted

---

## ✅ Frontend Verification

### Dependencies Installation
- [ ] `npm install` completes without major errors
- [ ] `node_modules` folder created with dependencies

### Frontend Startup
- [ ] `npm run dev` starts without errors
- [ ] Frontend is accessible at `http://localhost:5173`
- [ ] No "Cannot GET /" error on root path

### Page Loading
- [ ] Login page loads at `http://localhost:5173/login`
- [ ] Page has username and password input fields
- [ ] Page displays demo credentials
- [ ] Sign In button is visible

### Login Functionality
- [ ] Enter `admin` / `password123` and click Sign In
- [ ] No network errors in browser console
- [ ] Redirects to dashboard after successful login
- [ ] JWT token is stored in localStorage
- [ ] User info is stored in localStorage

### Dashboard Page
- [ ] Dashboard page displays after login
- [ ] Sidebar shows navigation menu with:
  - [ ] Dashboard link
  - [ ] Users link
  - [ ] Roles link
  - [ ] Permissions link
- [ ] Header shows welcome message with username
- [ ] Dashboard cards show:
  - [ ] Total Users count (4)
  - [ ] Total Roles count (3)
  - [ ] Total Permissions count (14)

### Users Management Page
- [ ] Navigate to Users page
- [ ] Table displays all users:
  - [ ] admin (ADMIN role)
  - [ ] manager (MANAGER role)
  - [ ] user1 (USER role)
  - [ ] user2 (USER role)
- [ ] "Add User" button is visible
- [ ] Edit button (pencil icon) works
- [ ] Delete button (trash icon) shows confirmation
- [ ] Can create new user with the modal
- [ ] Can edit user details
- [ ] User status shows Active/Inactive

### Roles Management Page
- [ ] Navigate to Roles page
- [ ] Table displays all roles:
  - [ ] ADMIN (Level 100)
  - [ ] MANAGER (Level 50)
  - [ ] USER (Level 10)
- [ ] "Add Role" button is visible
- [ ] Can create new role with modal
- [ ] Permissions are shown in the modal
- [ ] Can select/deselect permissions
- [ ] Can edit role details
- [ ] Role level can be modified

### Permissions Management Page
- [ ] Navigate to Permissions page
- [ ] Table displays all permissions (14 total)
- [ ] Permissions are categorized:
  - [ ] User Management (4 permissions)
  - [ ] Role Management (4 permissions)
  - [ ] Permission Management (4 permissions)
  - [ ] Dashboard (2 permissions)
- [ ] "Add Permission" button is visible
- [ ] Can create new permission
- [ ] Can edit existing permission
- [ ] Can delete permission

### Logout Functionality
- [ ] Click logout button (in sidebar or header)
- [ ] Redirects to login page
- [ ] JWT token is removed from localStorage
- [ ] User info is removed from localStorage
- [ ] Cannot access protected routes after logout

### Protected Routes
- [ ] Manually access `http://localhost:5173/dashboard` without login
- [ ] Redirects to login page
- [ ] Cannot access `/users`, `/roles`, `/permissions` without login

### Error Handling
- [ ] Try logging in with invalid credentials
- [ ] Shows error message
- [ ] "Invalid credentials" or similar message appears
- [ ] Login button is disabled while loading
- [ ] Shows loading state while API is processing

### Responsive Design
- [ ] Sidebar collapses on smaller screens
- [ ] Menu items show icons only when collapsed
- [ ] Tables are readable on different screen sizes
- [ ] Modals display properly on mobile

---

## 🔗 Integration Testing

### Full User Management Flow
1. [ ] Login as admin
2. [ ] Go to Users page
3. [ ] Create new user "testuser" with role "USER"
4. [ ] Verify user appears in the list
5. [ ] Edit the user's first name
6. [ ] Verify changes appear in the table
7. [ ] Delete the test user
8. [ ] Verify user is removed from the list

### Full Role Management Flow
1. [ ] Go to Roles page
2. [ ] Create new role "SUPERVISOR" with level 75
3. [ ] Select some permissions for the role
4. [ ] Verify role appears in the list
5. [ ] Edit the role's description
6. [ ] Add/remove permissions
7. [ ] Delete the test role
8. [ ] Verify role is removed

### Full Permission Management Flow
1. [ ] Go to Permissions page
2. [ ] Create new permission "BULK_DELETE_USERS"
3. [ ] Set category to "User Management"
4. [ ] Verify permission appears in the list
5. [ ] Edit the permission description
6. [ ] Delete the test permission
7. [ ] Verify permission is removed

---

## 🐛 Troubleshooting Checklist

### Backend Issues
- [ ] Check if MySQL is running: `mysql -u root`
- [ ] Verify database exists: `SHOW DATABASES;`
- [ ] Check application.properties credentials
- [ ] Look for errors in Maven build output
- [ ] Check Spring Boot logs for initialization errors

### Frontend Issues
- [ ] Clear browser cache: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
- [ ] Check localStorage: Open DevTools → Application → Local Storage
- [ ] Verify API_BASE_URL in `src/services/api.js`
- [ ] Check browser console for JavaScript errors
- [ ] Verify npm dependencies installed: `npm list`

### Network Issues
- [ ] Backend should run on `http://localhost:8080`
- [ ] Frontend should run on `http://localhost:5173`
- [ ] Check firewall settings if needed
- [ ] Verify CORS is properly configured

### Common Errors
- **"Failed to load users"**: Backend not running or API URL wrong
- **"Invalid credentials"**: Seed data not loaded, check MySQL
- **"Cannot find module"**: Run `npm install` again
- **"Port already in use"**: Kill process on port 8080 or 5173

---

## ✅ Final Checklist

- [ ] Backend is running without errors
- [ ] Frontend is running without errors
- [ ] Can login with admin account
- [ ] Can view all management pages
- [ ] Can perform CRUD operations on users
- [ ] Can perform CRUD operations on roles
- [ ] Can perform CRUD operations on permissions
- [ ] Can logout and login again
- [ ] No console errors or warnings
- [ ] Responsive design works on different screen sizes

---

## 📊 Performance Check

- [ ] Pages load in under 3 seconds
- [ ] Tables render smoothly with 4+ users
- [ ] Modal dialogs open/close without lag
- [ ] Navigation between pages is responsive
- [ ] No memory leaks in browser (check DevTools Memory tab)

---

## 🎉 Success!

If all checkboxes are completed, your User Management System is ready for use!

### Next Steps:
1. Customize the seed data as needed
2. Deploy to production environment
3. Set up backup strategy for database
4. Configure security settings (JWT secret, CORS origins)
5. Add additional features as required
6. Set up monitoring and logging

### Support:
- Check SETUP_GUIDE.md for detailed instructions
- Review API_REFERENCE.md for API documentation
- Check README.md for project overview
