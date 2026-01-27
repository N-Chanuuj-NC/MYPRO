import api from "../api/axios";

export async function getGradesByCourse(courseId) {
  const res = await api.get(`/trainer/courses/${courseId}/grades`);
  return res.data;
}

export async function saveGrade(courseId, payload) {
  // payload: { studentId, assignmentScore, quizScore, finalScore, remarks, status }
  const res = await api.post(`/trainer/courses/${courseId}/grades`, payload);
  return res.data;
}

export async function deleteGrade(gradeId) {
  const res = await api.delete(`/trainer/grades/${gradeId}`);
  return res.data;
}
