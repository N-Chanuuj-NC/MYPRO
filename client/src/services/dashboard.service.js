import api from "../api/axios";

export async function getTrainerDashboardSummary() {
  const res = await api.get("/trainer/dashboard/summary");
  return res.data;
}
