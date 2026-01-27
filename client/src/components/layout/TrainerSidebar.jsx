import { NavLink } from "react-router-dom";

const linkStyle = ({ isActive }) => ({
  display: "block",
  padding: "10px 12px",
  borderRadius: 8,
  textDecoration: "none",
  color: isActive ? "white" : "#111",
  background: isActive ? "#111" : "transparent",
  marginBottom: 6,
  fontWeight: 600,
});

export default function TrainerSidebar() {
  return (
    <aside
      style={{
        width: 260,
        padding: 16,
        borderRight: "1px solid #eee",
        height: "100vh",
        position: "sticky",
        top: 0,
        background: "#fff",
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>LMS</h2>
        <p style={{ margin: "6px 0 0", color: "#666" }}>Trainer Panel</p>
      </div>

      <nav>
        <NavLink to="/trainer/dashboard" style={linkStyle}>Dashboard</NavLink>
        <NavLink to="/trainer/courses" style={linkStyle}>Course Module</NavLink>
        <NavLink to="/trainer/enrollments" style={linkStyle}>Enroll Details</NavLink>
        <NavLink to="/trainer/content" style={linkStyle}>Course Content</NavLink>
        <NavLink to="/trainer/tasks" style={linkStyle}>Task Module</NavLink>
        <NavLink to="/trainer/grades" style={linkStyle}>Student Grades</NavLink>
        <NavLink to="/trainer/feedback" style={linkStyle}>Feedback Review</NavLink>
        <NavLink to="/trainer/students" style={linkStyle}>Student Page</NavLink>
      </nav>
    </aside>
  );
}
