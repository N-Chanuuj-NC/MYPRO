import api from "../api/axios";

// GET: list enrollments for a course
export async function getEnrollmentsByCourse(courseId) {
  const res = await api.get(`/trainer/courses/${courseId}/enrollments`);
  return res.data;
}

// POST: create enrollment
export async function createEnrollment(courseId, payload) {
  // payload: { studentEmail, progressPercent, status }
  const res = await api.post(`/trainer/courses/${courseId}/enrollments`, payload);
  return res.data;
}

// PUT: update enrollment
export async function updateEnrollment(enrollmentId, payload) {
  // payload: { progressPercent, status }
  const res = await api.put(`/trainer/enrollments/${enrollmentId}`, payload);
  return res.data;
}

// DELETE: remove enrollment
export async function deleteEnrollment(enrollmentId) {
  const res = await api.delete(`/trainer/enrollments/${enrollmentId}`);
  return res.data;
}
