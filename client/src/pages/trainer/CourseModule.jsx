import { useEffect, useState } from "react";
import {
  createCourse,
  deleteCourse,
  getCourses,
  toggleCoursePublish,
  updateCourse,
} from "../../services/course.service";

export default function CourseModule() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");

  // form
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [level, setLevel] = useState("beginner");
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");

  // edit
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editLevel, setEditLevel] = useState("beginner");
  const [editPrice, setEditPrice] = useState(0);
  const [editDescription, setEditDescription] = useState("");

  async function loadCourses() {
    try {
      setError("");
      setLoading(true);
      const data = await getCourses();
      setCourses(data);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!title.trim()) {
      alert("Course title is required");
      return;
    }

    try {
      setError("");
      setActionLoadingId("create");

      const payload = {
        title,
        category,
        level,
        price: Number(price || 0),
        description,
      };

      const created = await createCourse(payload);
      setCourses((prev) => [created, ...prev]);

      // clear form
      setTitle("");
      setCategory("General");
      setLevel("beginner");
      setPrice(0);
      setDescription("");
    } catch (e2) {
      setError(e2?.response?.data?.message || e2.message || "Create failed");
    } finally {
      setActionLoadingId(null);
    }
  }

  function startEdit(course) {
    setEditId(course._id);
    setEditTitle(course.title || "");
    setEditCategory(course.category || "General");
    setEditLevel(course.level || "beginner");
    setEditPrice(course.price || 0);
    setEditDescription(course.description || "");
  }

  function cancelEdit() {
    setEditId(null);
    setEditTitle("");
    setEditCategory("");
    setEditLevel("beginner");
    setEditPrice(0);
    setEditDescription("");
  }

  async function saveEdit() {
    if (!editTitle.trim()) {
      alert("Title cannot be empty");
      return;
    }

    try {
      setError("");
      setActionLoadingId(editId);

      const updated = await updateCourse(editId, {
        title: editTitle,
        category: editCategory,
        level: editLevel,
        price: Number(editPrice || 0),
        description: editDescription,
      });

      setCourses((prev) => prev.map((c) => (c._id === editId ? updated : c)));
      cancelEdit();
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Update failed");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleDelete(id) {
    const ok = window.confirm("Are you sure you want to delete this course?");
    if (!ok) return;

    try {
      setError("");
      setActionLoadingId(id);
      await deleteCourse(id);
      setCourses((prev) => prev.filter((c) => c._id !== id));
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Delete failed");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handlePublishToggle(id) {
    try {
      setError("");
      setActionLoadingId(id);
      const updated = await toggleCoursePublish(id);
      setCourses((prev) => prev.map((c) => (c._id === id ? updated : c)));
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Publish toggle failed");
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div>
        <h2 style={{ margin: 0 }}>Course Module</h2>
        <p style={{ margin: "6px 0 0", color: "#666" }}>
          Create, edit and publish your courses
        </p>
      </div>

      {error && (
        <div style={alertError}>
          <b>Error:</b> {error}
        </div>
      )}

      {/* Create course */}
      <Card>
        <h3 style={{ marginTop: 0 }}>Create New Course</h3>

        <form onSubmit={handleCreate} style={{ display: "grid", gap: 10 }}>
          <div style={grid2}>
            <div>
              <label style={label}>Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={input}
                placeholder="Ex: React Basics"
              />
            </div>
            <div>
              <label style={label}>Category</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={input}
                placeholder="Ex: Frontend"
              />
            </div>
          </div>

          <div style={grid3}>
            <div>
              <label style={label}>Level</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)} style={select}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label style={label}>Price</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={input}
                min={0}
              />
            </div>
            <div style={{ display: "flex", alignItems: "end" }}>
              <button style={primaryBtn} disabled={actionLoadingId === "create"}>
                {actionLoadingId === "create" ? "Creating..." : "Create Course"}
              </button>
            </div>
          </div>

          <div>
            <label style={label}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={textarea}
              placeholder="Short description..."
            />
          </div>
        </form>
      </Card>

      {/* List courses */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <h3 style={{ margin: 0 }}>My Courses</h3>
          <button style={secondaryBtn} onClick={loadCourses} disabled={loading}>
            Refresh
          </button>
        </div>

        {loading ? (
          <p style={{ color: "#666" }}>Loading courses...</p>
        ) : courses.length === 0 ? (
          <p style={{ color: "#666" }}>No courses yet. Create your first course above.</p>
        ) : (
          <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
            {courses.map((c) => (
              <div key={c._id} style={courseRow}>
                <div style={{ display: "grid", gap: 4 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <b>{c.title}</b>
                    <span style={badge}>{c.status}</span>
                    <span style={smallMuted}>
                      {c.level} • {c.category} • ${c.price}
                    </span>
                  </div>
                  {c.description ? (
                    <div style={{ color: "#555" }}>{c.description}</div>
                  ) : (
                    <div style={{ color: "#999" }}>No description</div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <button style={secondaryBtn} onClick={() => startEdit(c)}>
                    Edit
                  </button>
                  <button
                    style={secondaryBtn}
                    onClick={() => handlePublishToggle(c._id)}
                    disabled={actionLoadingId === c._id}
                  >
                    {actionLoadingId === c._id
                      ? "Please wait..."
                      : c.status === "published"
                      ? "Unpublish"
                      : "Publish"}
                  </button>
                  <button
                    style={dangerBtn}
                    onClick={() => handleDelete(c._id)}
                    disabled={actionLoadingId === c._id}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Edit modal */}
      {editId && (
        <div style={overlay}>
          <div style={modal}>
            <h3 style={{ marginTop: 0 }}>Edit Course</h3>

            <div style={{ display: "grid", gap: 10 }}>
              <div style={grid2}>
                <div>
                  <label style={label}>Title *</label>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    style={input}
                  />
                </div>
                <div>
                  <label style={label}>Category</label>
                  <input
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    style={input}
                  />
                </div>
              </div>

              <div style={grid3}>
                <div>
                  <label style={label}>Level</label>
                  <select
                    value={editLevel}
                    onChange={(e) => setEditLevel(e.target.value)}
                    style={select}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label style={label}>Price</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    style={input}
                    min={0}
                  />
                </div>
                <div />
              </div>

              <div>
                <label style={label}>Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  style={textarea}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button style={secondaryBtn} onClick={cancelEdit}>
                  Cancel
                </button>
                <button
                  style={primaryBtn}
                  onClick={saveEdit}
                  disabled={actionLoadingId === editId}
                >
                  {actionLoadingId === editId ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* UI helpers */
function Card({ children }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #eee",
        borderRadius: 14,
        padding: 16,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      {children}
    </div>
  );
}

/* styles */
const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 };
const grid3 = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 };

const label = { display: "block", fontSize: 13, color: "#666", marginBottom: 6 };

const input = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #ddd",
  outline: "none",
};

const select = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
};

const textarea = {
  width: "100%",
  minHeight: 90,
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #ddd",
  outline: "none",
  resize: "vertical",
};

const courseRow = {
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: 12,
  alignItems: "center",
  padding: 12,
  borderRadius: 14,
  border: "1px solid #eee",
  background: "#fafafa",
};

const badge = {
  padding: "4px 10px",
  borderRadius: 999,
  border: "1px solid #eee",
  background: "#fff",
  fontSize: 12,
  fontWeight: 900,
};

const smallMuted = { fontSize: 12, color: "#777" };

const primaryBtn = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "none",
  background: "#111",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 800,
};

const secondaryBtn = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
  fontWeight: 800,
};

const dangerBtn = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #ffdddd",
  background: "#fff5f5",
  cursor: "pointer",
  fontWeight: 900,
};

const alertError = {
  padding: 12,
  borderRadius: 12,
  border: "1px solid #ffd6d6",
  background: "#fff0f0",
  color: "#900",
};

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.35)",
  display: "grid",
  placeItems: "center",
  padding: 16,
  zIndex: 999,
};

const modal = {
  width: "min(760px, 100%)",
  background: "#fff",
  borderRadius: 16,
  padding: 16,
  border: "1px solid #eee",
};
