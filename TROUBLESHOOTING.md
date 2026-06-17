# Troubleshooting Guide

Common issues and their solutions when running the User Management System.

---

## 🔴 Backend Issues

### Issue: "port 8080 already in use"

**Solution:**

Windows:
```bash
# Find process on port 8080
netstat -ano | findstr :8080

# Kill the process (replace PID with the actual process ID)
taskkill /PID <PID> /F
```

Mac/Linux:
```bash
# Find and kill process
lsof -i :8080 | grep java | awk '{print $2}' | xargs kill -9
```

Or change port in `application.properties`:
```properties
server.port=8081
```

---

### Issue: "Connection refused" for MySQL

**Symptoms:**
- Error: `java.sql.SQLException: Could not create connection to database server`
- Backend startup fails

**Solution:**

1. Check if MySQL is running:
```bash
# Windows
wmic logicaldisk where drivername="C:" get name
mysql -u root -p

# Mac
mysql -u root -p

# Linux
sudo service mysql status
```

2. Verify credentials in `application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/user_management_db
spring.datasource.username=root
spring.datasource.password=
```

3. Create database if it doesn't exist:
```sql
CREATE DATABASE user_management_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

### Issue: "Unknown database" error

**Solution:**
```sql
SHOW DATABASES;
CREATE DATABASE user_management_db;
USE user_management_db;
```

---

### Issue: Seed data not loading

**Symptoms:**
- Database tables exist but are empty
- Login fails with invalid credentials
- No users appear in the API response

**Solution:**

1. Check if `SeedDataLoader.java` runs:
   - Look for log messages during startup
   - Check if data exists: `SELECT COUNT(*) FROM users;`

2. Manual seed data insertion:
```sql
-- Insert permissions
INSERT INTO permissions (name, description, category, active) VALUES
('CREATE_USER', 'Create new users', 'User Management', true),
('READ_USER', 'Read user information', 'User Management', true),
('UPDATE_USER', 'Update user information', 'User Management', true),
('DELETE_USER', 'Delete users', 'User Management', true),
('CREATE_ROLE', 'Create new roles', 'Role Management', true),
('READ_ROLE', 'Read role information', 'Role Management', true),
('UPDATE_ROLE', 'Update role information', 'Role Management', true),
('DELETE_ROLE', 'Delete roles', 'Role Management', true),
('CREATE_PERMISSION', 'Create new permissions', 'Permission Management', true),
('READ_PERMISSION', 'Read permission information', 'Permission Management', true),
('UPDATE_PERMISSION', 'Update permission information', 'Permission Management', true),
('DELETE_PERMISSION', 'Delete permissions', 'Permission Management', true),
('VIEW_DASHBOARD', 'View admin dashboard', 'Dashboard', true),
('VIEW_REPORTS', 'View reports', 'Dashboard', true);

-- Insert roles (you'll need the permission IDs)
INSERT INTO roles (name, description, role_level, active) VALUES
('ADMIN', 'Administrator', 100, true),
('MANAGER', 'Manager', 50, true),
('USER', 'Regular User', 10, true);

-- Insert users (you'll need to hash passwords using BCrypt)
-- Password: password123 (hashed)
INSERT INTO users (username, email, password, first_name, last_name, active, role_id, created_at, updated_at) VALUES
('admin', 'admin@example.com', '$2a$10/...', 'Admin', 'User', true, 1, NOW(), NOW());
```

---

### Issue: "Unknown column" error in tables

**Symptoms:**
- Error during migration or startup
- Column names in error message

**Solution:**
This happens if JPA schema update fails. Try:

1. Delete all tables:
```sql
DROP DATABASE user_management_db;
CREATE DATABASE user_management_db;
```

2. Restart the backend to recreate tables

3. Or set schema update strategy:
```properties
spring.jpa.hibernate.ddl-auto=create
# Change to 'update' after initial creation
```

---

### Issue: JWT token validation fails

**Symptoms:**
- 401 Unauthorized on protected endpoints
- "Invalid JWT token" errors

**Solution:**

1. Verify JWT secret length (minimum 32 characters):
```properties
jwt.secret=MySecretKeyForJWTTokenGenerationAndValidationMustBeAtLeast32Characters
```

2. Check token expiration:
```properties
jwt.expiration=86400000  # 24 hours in milliseconds
```

3. Verify Authorization header format:
```
Authorization: Bearer <token>
# NOT just the token
```

---

### Issue: CORS errors from frontend

**Symptoms:**
- Browser console: "Access to XMLHttpRequest blocked by CORS policy"
- Frontend API calls fail

**Solution:**

1. Verify CORS config in `CorsConfig.java`:
```java
registry.addMapping("/api/**")
    .allowedOriginPatterns("http://localhost:5173", "http://localhost:3000")
    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
    .allowedHeaders("*")
    .allowCredentials(true);
```

2. Add backend URL to frontend config:
```javascript
// src/services/api.js
const API_BASE_URL = 'http://localhost:8080/api';
```

3. Ensure frontend is on `http://` not `https://` (or vice versa)

---

### Issue: Build fails with Maven

**Symptoms:**
- `mvn clean install` fails
- Dependency resolution errors

**Solution:**

```bash
# Clear Maven cache
rm -rf ~/.m2/repository

# Try offline build
mvn clean install -o

# Or with verbose error output
mvn clean install -X
```

---

## 🔴 Frontend Issues

### Issue: "Cannot GET /dashboard"

**Symptoms:**
- 404 error when accessing routes
- White page with error

**Solution:**

1. Ensure you're accessing `http://localhost:5173` (not 3000)

2. Verify frontend is running:
```bash
npm run dev
# Should show: ➜  Local:   http://localhost:5173/
```

3. Check that React Router is properly imported in App.jsx

4. Clear node_modules:
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

### Issue: "Module not found" error

**Symptoms:**
- Error: `Cannot find module './services/api'`
- Frontend won't start

**Solution:**

1. Verify all files exist in correct paths
2. Check file names match imports (case-sensitive on Mac/Linux)
3. Run:
```bash
npm install
npm run dev
```

---

### Issue: API calls return 404 or timeout

**Symptoms:**
- Error: `Failed to load users`
- API requests never complete
- Network tab shows pending requests

**Solution:**

1. Verify backend is running:
```bash
# In backend directory
mvn spring-boot:run
# Should show: "Started DemoApplication"
```

2. Check API base URL in `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

3. Test API manually with curl:
```bash
curl http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

4. Check browser console for full error message

---

### Issue: Login fails with "Invalid credentials"

**Symptoms:**
- Login button shows error
- No matter what credentials entered

**Solution:**

1. Verify seed data loaded:
   - Open MySQL: `SELECT * FROM users;`
   - Should show at least 4 users

2. Verify password is hashed (starts with `$2a$` for BCrypt)

3. Try demo credentials exactly:
   - Username: `admin` (not `Admin`)
   - Password: `password123` (exactly as is)

4. Check backend logs for authentication errors

5. Verify database user account exists:
```bash
mysql -u root -p user_management_db
SELECT username, password FROM users WHERE username = 'admin';
```

---

### Issue: "Unexpected token" JSON error

**Symptoms:**
- Browser console: `SyntaxError: Unexpected token < in JSON at position 0`
- API response is HTML instead of JSON

**Solution:**

1. Backend returned HTML error page (likely a 500 error)
2. Check backend logs for the actual error
3. Restart backend:
```bash
# Kill any running instances
mvn spring-boot:run
```

---

### Issue: localStorage not working

**Symptoms:**
- Token not persisted after login
- Getting logged out on page refresh
- "localStorage is not defined" error

**Solution:**

1. Check browser Privacy settings (not in private/incognito mode)

2. Verify localStorage is accessible:
```javascript
// In browser console
localStorage.setItem('test', 'value');
console.log(localStorage.getItem('test'));
```

3. Check AuthContext implementation

4. Clear localStorage and try again:
```javascript
// In browser console
localStorage.clear();
// Then login again
```

---

### Issue: Blank or white page

**Symptoms:**
- Page loads but shows nothing
- No error messages

**Solution:**

1. Check browser console for JavaScript errors
2. Check Network tab for failed requests
3. Verify React is properly mounted:
```javascript
// In browser console
document.getElementById('root')
```

4. Restart frontend:
```bash
npm run dev
```

5. Try clearing cache:
```bash
Ctrl+Shift+Delete  # or Cmd+Shift+Delete on Mac
```

---

### Issue: Modal forms not working

**Symptoms:**
- Add/Edit buttons don't open modals
- Form inputs not responding

**Solution:**

1. Check if modal components are imported in page components
2. Verify `showModal` state is being updated
3. Check browser console for errors in modal component
4. Verify form data state updates with `handleChange`

---

### Issue: Styling issues (Tailwind CSS not working)

**Symptoms:**
- Page looks ugly or unstyled
- Classes not applying

**Solution:**

1. Verify Tailwind config exists:
   - `tailwind.config.js`
   - `postcss.config.js`

2. Verify index.css has Tailwind imports:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

3. Restart dev server:
```bash
npm run dev
```

4. Rebuild:
```bash
npm run build
```

---

## 🟡 Common Error Messages and Solutions

### "Connection refused: localhost:8080"
- Backend is not running
- Wrong port in API configuration
- **Fix**: Start backend with `mvn spring-boot:run`

---

### "Username already exists"
- Trying to create user with duplicate username
- **Fix**: Use a unique username

---

### "Invalid JWT token"
- Token expired (24 hours)
- Token was modified
- **Fix**: Login again to get new token

---

### "Role not found with id: 999"
- Using non-existent role ID
- **Fix**: Verify role exists before using its ID

---

### "Permission not found"
- Similar to role error
- **Fix**: Verify permission exists

---

## 🟢 Verification Commands

### Backend Health Check
```bash
# Check if backend is running
curl http://localhost:8080/api/auth/login -X OPTIONS -v

# Should return HTTP 200 with CORS headers
```

### Frontend Health Check
```bash
# In browser console
fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({username: 'admin', password: 'password123'})
}).then(r => r.json()).then(console.log);
```

### Database Health Check
```sql
-- Check all tables exist
SHOW TABLES;

-- Check data exists
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as role_count FROM roles;
SELECT COUNT(*) as permission_count FROM permissions;
```

---

## 📞 Getting More Help

1. **Check logs**: Look at console output when starting backend/frontend
2. **Browser DevTools**: Open with F12 and check Console and Network tabs
3. **MySQL Workbench**: Visually inspect database and run queries
4. **Postman**: Test API endpoints independently
5. **Search error message**: Most errors are well-documented online

---

## 💡 Quick Debug Tips

1. **Add console logs** in problematic functions
2. **Check Network tab** to see actual API responses
3. **Use Redux DevTools** equivalent for state inspection
4. **Test with Postman** before assuming frontend issue
5. **Restart everything** when stuck (backend, frontend, MySQL)

---

## ✅ If Still Stuck

1. Review [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. Check [API_REFERENCE.md](./API_REFERENCE.md)
3. Run [VERIFICATION_CHECKLIST.md](./VERIFICATION_CHECKLIST.md)
4. Examine error stacktraces carefully
5. Search the exact error message online
