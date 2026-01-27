import api from "../api/axios";

export async function getFeedbackByCourse(courseId) {
  const res = await api.get(`/trainer/courses/${courseId}/feedback`);
  return res.data;
}

export async function updateFeedback(id, payload) {
  const res = await api.patch(`/trainer/feedback/${id}`, payload);
  return res.data;
}

export async function deleteFeedback(id) {
  const res = await api.delete(`/trainer/feedback/${id}`);
  return res.data;
}
