import { useNavigate } from "react-router-dom";
import { logout } from "../../utils/auth";
export default function TrainerTopbar() {
  const navigate = useNavigate();
  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header
      style={{
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 18px",
        borderBottom: "1px solid #eee",
        background: "#fff",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div>
        <h3 style={{ margin: 0 }}>Trainer Dashboard</h3>
        <p style={{ margin: 0, color: "#666", fontSize: 12 }}>
          Manage courses, students, tasks and feedback
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button style={btnStyle} onClick={() => navigate("/trainer/courses")} >+ Create Course</button>        
        <button style={btnStyle} onClick={() => navigate("/trainer/profile")}> Hi , Trainer</button>
        <button style={btnStyle} onClick={handleLogout}>Log Out</button>
      </div>
    </header>
  );
}
//<div style={{ fontWeight: 600 }}>Hi, Trainer</div>  /trainer/profile
 //<NavLink to="/trainer/students" style={linkStyle}>Student Page</NavLink>
const btnStyle = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "#111",
  color: "#fff",
  cursor: "pointer",
};




  // return (
  //   <div style={topbar}>
  //     <div style={{ fontWeight: 900 }}>Trainer Panel</div>

  //     <button style={btnLogout} onClick={handleLogout}>
  //       Logout
  //     </button>
  //   </div>