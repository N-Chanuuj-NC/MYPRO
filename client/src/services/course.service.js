import api from "../api/axios";

export const getCourses = async () => {
  const res = await api.get("/trainer/courses");
  return res.data;
};

export const createCourse = async (payload) => {
  const res = await api.post("/trainer/courses", payload);
  return res.data;
};

export const updateCourse = async (id, payload) => {
  const res = await api.put(`/trainer/courses/${id}`, payload);
  return res.data;
};

export const deleteCourse = async (id) => {
  const res = await api.delete(`/trainer/courses/${id}`);
  return res.data;
};

export const toggleCoursePublish = async (id) => {
  const res = await api.patch(`/trainer/courses/${id}/publish`);
  return res.data;
};
