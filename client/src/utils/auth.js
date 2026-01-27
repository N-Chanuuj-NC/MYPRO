export function logout() {
  // remove the exact keys you stored
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
}
