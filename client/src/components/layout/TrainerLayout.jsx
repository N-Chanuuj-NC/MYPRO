import { Outlet } from "react-router-dom";
import TrainerSidebar from "./TrainerSidebar";
import TrainerTopbar from "./TrainerTopbar";

export default function TrainerLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#fafafa" }}>
      <TrainerSidebar />

      <div style={{ flex: 1 }}>
        <TrainerTopbar />
        <main style={{ padding: 18 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
