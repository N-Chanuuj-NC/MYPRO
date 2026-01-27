import api from "../api/axios";

export async function getTrainerProfile() {
  const res = await api.get("/trainer/profile");
  return res.data;
}

export async function updateTrainerProfile(payload) {
  const res = await api.put("/trainer/profile", payload);
  return res.data;
}

export async function changeTrainerPassword(payload) {
  const res = await api.patch("/trainer/profile/password", payload);
  return res.data;
}
