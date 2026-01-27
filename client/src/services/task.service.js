import api from "../api/axios";

// Assignments
export const getAssignments = async (lessonId) => {
  const res = await api.get(`/trainer/lessons/${lessonId}/assignments`);
  return res.data;
};

export const createAssignment = async (lessonId, payload) => {
  const res = await api.post(`/trainer/lessons/${lessonId}/assignments`, payload);
  return res.data;
};

export const toggleAssignmentPublish = async (id) => {
  const res = await api.patch(`/trainer/assignments/${id}/publish`);
  return res.data;
};

export const deleteAssignment = async (id) => {
  const res = await api.delete(`/trainer/assignments/${id}`);
  return res.data;
};

// Quizzes
export const getQuizzes = async (lessonId) => {
  const res = await api.get(`/trainer/lessons/${lessonId}/quizzes`);
  return res.data;
};

export const createQuiz = async (lessonId, payload) => {
  const res = await api.post(`/trainer/lessons/${lessonId}/quizzes`, payload);
  return res.data;
};

export const toggleQuizPublish = async (id) => {
  const res = await api.patch(`/trainer/quizzes/${id}/publish`);
  return res.data;
};

export const deleteQuiz = async (id) => {
  const res = await api.delete(`/trainer/quizzes/${id}`);
  return res.data;
};

export const updateQuiz = async (id, payload) => {
  const res = await api.put(`/trainer/quizzes/${id}`, payload);
  return res.data;
};
