# LMS Backend Development Guide

This guide explains the backend structure and where each developer should work.

## 📂 Backend Structure (`lms/server/`)

### 1. Controllers (`server/controllers/`)
Write the logic for your APIs here.

- **Auth Dev**: `authController.js` (Login/Register logic is already here)
- **Admin Dev**: `adminController.js` (Write logic for managing users, courses, etc.)
- **Student Dev**: `studentController.js` (Write logic for enrolling, viewing lessons)
- **Trainer Dev**: `trainerController.js` (Write logic for grading, creating content)

### 2. Routes (`server/routes/`)
Define your API endpoints here and link them to your controllers.

- **Auth**: `authRoutes.js` (Already set up)
- **Admin**: `adminRoutes.js` (e.g., `router.get('/users', adminController.users)`)
- **Student**: `studentRoutes.js`
- **Trainer**: `trainerRoutes.js`

### 3. Models (`server/models/`)
Define your Database Schemas here using Mongoose.
- `User.js` is already created.
- Create new files like `Course.js`, `Lesson.js`, `Assignment.js` as needed.

### 4. Middleware (`server/middleware/`)
- `authMiddleware.js`: Protects routes. Add `auth` as a second argument to your route to require login.
  ```javascript
  router.get('/protected-route', auth, controller.function);
  ```

## 🚀 How to Add a New Feature

1.  Create a **Model** in `models/` (if you need to store new data).
2.  Write the logic in your specific **Controller**.
3.  Add the endpoint in your specific **Route** file.
4.  Test with Postman or the Frontend.
