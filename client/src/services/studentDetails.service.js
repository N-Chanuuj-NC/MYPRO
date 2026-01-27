import api from "../api/axios";

export const listStudents = async (search = "") => {
  const res = await api.get(`/trainer/students?search=${encodeURIComponent(search)}`);
  return res.data;
};

export const getStudent = async (studentId) => {
  const res = await api.get(`/trainer/students/${studentId}`);
  return res.data;
};

export const createStudent = async (payload) => {
  const res = await api.post(`/trainer/students`, payload);
  return res.data;
};

export const updateStudent = async (studentId, payload) => {
  const res = await api.put(`/trainer/students/${studentId}`, payload);
  return res.data;
};

export const deleteStudent = async (studentId) => {
  const res = await api.delete(`/trainer/students/${studentId}`);
  return res.data;
};
