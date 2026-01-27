import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';

//layout for trainer
import TrainerLayout from "./components/layout/TrainerLayout";
// Student Pages
import StudentHome from './pages/student/StudentHome';
import CourseLibrary from './pages/student/CourseLibrary';
import CourseDetails from './pages/student/CourseDetails';
import LessonViewer from './pages/student/LessonViewer';
import StudentFeedback from './pages/student/StudentFeedback';
import ProfileSettings from './pages/student/ProfileSettings';

// Trainer Pages
import TrainerDashboard from './pages/trainer/TrainerDashboard';
import CourseModule from './pages/trainer/CourseModule';
import CourseContent from './pages/trainer/CourseContent';
import TaskModule from './pages/trainer/TaskModule';
import EnrollDetails from './pages/trainer/EnrollDetails';
import StudentGrades from './pages/trainer/StudentGrades';
import FeedbackReview from './pages/trainer/FeedbackReview';
import StudentDetails from './pages/trainer/StudentDetails';
import TrainerProfile from './pages/trainer/TrainerProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageCourses from './pages/admin/ManageCourses';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';



import Unauthorized from './pages/Unauthorized';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student/home" element={<StudentHome />} />
            <Route path="/student/courses" element={<CourseLibrary />} />
            <Route path="/student/course-details" element={<CourseDetails />} />
            <Route path="/student/lessons" element={<LessonViewer />} />
            <Route path="/student/feedback" element={<StudentFeedback />} />
            <Route path="/student/profile" element={<ProfileSettings />} />
          </Route>

          {/* Protected Trainer Routes */}
          {/* Protected Trainer Routes */}
          <Route element={<ProtectedRoute allowedRoles={["trainer"]} />}>
            <Route path="/trainer" element={<TrainerLayout />}>
              <Route path="dashboard" element={<TrainerDashboard />} />
              <Route path="courses" element={<CourseModule />} />
              <Route path="content" element={<CourseContent />} />
              <Route path="tasks" element={<TaskModule />} />
              <Route path="enrollments" element={<EnrollDetails />} />
              <Route path="grades" element={<StudentGrades />} />
              <Route path="feedback" element={<FeedbackReview />} />
              <Route path="students" element={<StudentDetails />} />
              <Route path="profile" element={<TrainerProfile />} />
            </Route>
          </Route>


          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/courses" element={<ManageCourses />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/settings" element={<Settings />} />
          </Route>

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
