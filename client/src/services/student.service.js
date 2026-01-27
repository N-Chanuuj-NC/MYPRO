import api from "../api/axios";

export const getCourseStudents = async (courseId) => {
  const res = await api.get(`/trainer/courses/${courseId}/students`);
  return res.data;
};

export const getStudentProfile = async (courseId, studentId) => {
  const res = await api.get(`/trainer/courses/${courseId}/students/${studentId}/profile`);
  return res.data;
};

export const updateStudentProfile = async (courseId, studentId, payload) => {
  const res = await api.put(`/trainer/courses/${courseId}/students/${studentId}/profile`, payload);
  return res.data;
};
