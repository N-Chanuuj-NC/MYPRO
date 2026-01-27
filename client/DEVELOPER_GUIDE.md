# LMS Development Guide

This guide explains the project structure and where each developer should work based on their role.

## 📂 Project Structure for Roles

We have separated the work areas into three distinct folders inside `client/src/pages/`.

### 👨‍🎓 Student Developer
**Workspace:** `client/src/pages/student/`

- **Main File:** `StudentHome.jsx`
- **Responsibility:** Build features related to the student learning experience.
- **Tasks:**
    - Display enrolled courses.
    - Show progress tracking.
    - Create course viewing pages (e.g., `CourseViewer.jsx`).

### 👨‍🏫 Trainer Developer
**Workspace:** `client/src/pages/trainer/`

- **Main File:** `TrainerDashboard.jsx`
- **Responsibility:** Build features for course creation and student management.
- **Tasks:**
    - Create/Edit Course pages.
    - View student analytics.
    - Upload content.

### 👮 Admin Developer
**Workspace:** `client/src/pages/admin/`

- **Main File:** `AdminDashboard.jsx`
- **Responsibility:** System-wide management.
- **Tasks:**
    - User management tables.
    - System config.
    - Financial reports.

## 🛠 Common Components
**Location:** `client/src/components/ui/`

All developers should use the shared UI components to maintain a consistent look and feel:
- `<Button />`
- `<Input />`
- `<Card />`

## 🚦 Navigation & Auth
- **Login/Register:** Located in `client/src/pages/` (Shared responsibility or dedicated Auth dev).
- **Routing:** Managed in `client/src/App.js`. If you create a new page, add it there inside your role's `ProtectedRoute`.

## 🚀 Getting Started
1. Navigate to `client/`.
2. Run `npm start`.
3. Login with the appropriate role to test your pages:
    - **Student:** Any new registration defaults to Student.
    - **Trainer:** Select "Trainer" during registration.
    - **Admin:** `admin@lms.com` / `admin123`
