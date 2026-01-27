import api from "../api/axios";

// modules
export const getModules = async (courseId) => {
  const res = await api.get(`/trainer/courses/${courseId}/modules`);
  return res.data;
};

export const createModule = async (courseId, payload) => {
  const res = await api.post(`/trainer/courses/${courseId}/modules`, payload);
  return res.data;
};

export const deleteModule = async (moduleId) => {
  const res = await api.delete(`/trainer/modules/${moduleId}`);
  return res.data;
};

// lessons
export const getLessons = async (moduleId) => {
  const res = await api.get(`/trainer/modules/${moduleId}/lessons`);
  return res.data;
};

export const createLesson = async (moduleId, payload) => {
  const res = await api.post(`/trainer/modules/${moduleId}/lessons`, payload);
  return res.data;
};

export const updateLesson = async (lessonId, payload) => {
  const res = await api.put(`/trainer/lessons/${lessonId}`, payload);
  return res.data;
};

export const deleteLesson = async (lessonId) => {
  const res = await api.delete(`/trainer/lessons/${lessonId}`);
  return res.data;
};

export const toggleLessonPublish = async (lessonId) => {
  const res = await api.patch(`/trainer/lessons/${lessonId}/publish`);
  return res.data;
};
