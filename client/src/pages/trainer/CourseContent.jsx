import { useEffect, useState } from "react";
import { getCourses } from "../../services/course.service";
import {
  getModules,
  createModule,
  deleteModule,
  getLessons,
  createLesson,
  deleteLesson,
  toggleLessonPublish,
} from "../../services/content.service";

export default function CourseContent() {
  // Courses
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");

  // Modules
  const [modules, setModules] = useState([]);
  const [moduleId, setModuleId] = useState("");

  // Lessons
  const [lessons, setLessons] = useState([]);

  // Loading / error
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingModules, setLoadingModules] = useState(false);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [error, setError] = useState("");

  // Create module form
  const [newModuleTitle, setNewModuleTitle] = useState("");

  // Create lesson form
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonType, setLessonType] = useState("video");
  const [resourceUrl, setResourceUrl] = useState("");
  const [contentText, setContentText] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(0);

  // --- Load courses on first open
  useEffect(() => {
    async function loadCourses() {
      try {
        setError("");
        setLoadingCourses(true);
        const data = await getCourses();
        setCourses(data);

        // Auto select first course if exists
        if (data.length > 0) {
          setCourseId(data[0]._id);
        }
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Failed to load courses");
      } finally {
        setLoadingCourses(false);
      }
    }
    loadCourses();
  }, []);

  // --- Load modules when courseId changes
  useEffect(() => {
    if (!courseId) {
      setModules([]);
      setModuleId("");
      setLessons([]);
      return;
    }

    async function loadModules() {
      try {
        setError("");
        setLoadingModules(true);
        const data = await getModules(courseId);
        setModules(data);

        // reset module selection
        if (data.length > 0) {
          setModuleId(data[0]._id);
        } else {
          setModuleId("");
          setLessons([]);
        }
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Failed to load modules");
      } finally {
        setLoadingModules(false);
      }
    }
    loadModules();
  }, [courseId]);

  // --- Load lessons when moduleId changes
  useEffect(() => {
    if (!moduleId) {
      setLessons([]);
      return;
    }

    async function loadLessons() {
      try {
        setError("");
        setLoadingLessons(true);
        const data = await getLessons(moduleId);
        setLessons(data);
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Failed to load lessons");
      } finally {
        setLoadingLessons(false);
      }
    }
    loadLessons();
  }, [moduleId]);

  // --- Actions
  async function handleCreateModule(e) {
    e.preventDefault();
    if (!courseId) return alert("Select a course first");
    if (!newModuleTitle.trim()) return alert("Module title is required");

    try {
      setError("");
      const created = await createModule(courseId, { title: newModuleTitle });
      setModules((prev) => [...prev, created]);
      setNewModuleTitle("");

      // auto select the created module
      setModuleId(created._id);
    } catch (e2) {
      setError(e2?.response?.data?.message || e2.message || "Create module failed");
    }
  }

  async function handleDeleteModule(id) {
    const ok = window.confirm("Delete this module? (Lessons inside will also be deleted)");
    if (!ok) return;

    try {
      setError("");
      await deleteModule(id);
      const remaining = modules.filter((m) => m._id !== id);
      setModules(remaining);

      // reset module selection
      if (remaining.length > 0) {
        setModuleId(remaining[0]._id);
      } else {
        setModuleId("");
        setLessons([]);
      }
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Delete module failed");
    }
  }

  async function handleCreateLesson(e) {
    e.preventDefault();
    if (!moduleId) return alert("Select a module first");
    if (!lessonTitle.trim()) return alert("Lesson title is required");

    try {
      setError("");

      const payload = {
        title: lessonTitle,
        type: lessonType,
        resourceUrl: lessonType === "text" ? "" : resourceUrl,
        contentText: lessonType === "text" ? contentText : "",
        durationMinutes: Number(durationMinutes || 0),
      };

      const created = await createLesson(moduleId, payload);
      setLessons((prev) => [...prev, created]);

      // clear form
      setLessonTitle("");
      setLessonType("video");
      setResourceUrl("");
      setContentText("");
      setDurationMinutes(0);
    } catch (e2) {
      setError(e2?.response?.data?.message || e2.message || "Create lesson failed");
    }
  }

  async function handleDeleteLesson(id) {
    const ok = window.confirm("Delete this lesson?");
    if (!ok) return;

    try {
      setError("");
      await deleteLesson(id);
      setLessons((prev) => prev.filter((l) => l._id !== id));
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Delete lesson failed");
    }
  }

  async function handlePublishLesson(id) {
    try {
      setError("");
      const updated = await toggleLessonPublish(id);
      setLessons((prev) => prev.map((l) => (l._id === id ? updated : l)));
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Publish toggle failed");
    }
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div>
        <h2 style={{ margin: 0 }}>Course Content</h2>
        <p style={{ margin: "6px 0 0", color: "#666" }}>
          Manage modules and lessons for your courses
        </p>
      </div>

      {error && (
        <div style={alertError}>
          <b>Error:</b> {error}
        </div>
      )}

      {/* Course Selector */}
      <Card>
        <h3 style={{ marginTop: 0 }}>Select Course</h3>

        {loadingCourses ? (
          <p style={{ color: "#666" }}>Loading courses...</p>
        ) : courses.length === 0 ? (
          <p style={{ color: "#666" }}>
            No courses found. Create a course first in Course Module page.
          </p>
        ) : (
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)} style={select}>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title} ({c.status})
              </option>
            ))}
          </select>
        )}
      </Card>

      {/* Modules */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <h3 style={{ margin: 0 }}>Modules</h3>
          {courseId && (
            <span style={{ color: "#777", fontSize: 12 }}>
              Course ID: {courseId}
            </span>
          )}
        </div>

        {loadingModules ? (
          <p style={{ color: "#666" }}>Loading modules...</p>
        ) : !courseId ? (
          <p style={{ color: "#666" }}>Select a course to see modules.</p>
        ) : (
          <>
            <form onSubmit={handleCreateModule} style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <input
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                style={input}
                placeholder="New module title"
              />
              <button style={primaryBtn}>Add Module</button>
            </form>

            {modules.length === 0 ? (
              <p style={{ color: "#666", marginTop: 12 }}>No modules yet.</p>
            ) : (
              <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                <div>
                  <label style={label}>Select Module</label>
                  <select value={moduleId} onChange={(e) => setModuleId(e.target.value)} style={select}>
                    {modules.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.order}. {m.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "grid", gap: 8 }}>
                  {modules.map((m) => (
                    <div
                      key={m._id}
                      style={{
                        ...row,
                        borderColor: m._id === moduleId ? "#111" : "#eee",
                        background: m._id === moduleId ? "#fff" : "#fafafa",
                      }}
                    >
                      <div>
                        <b>
                          {m.order}. {m.title}
                        </b>
                        <div style={{ fontSize: 12, color: "#777" }}>Module ID: {m._id}</div>
                      </div>

                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button style={dangerBtn} onClick={() => handleDeleteModule(m._id)} type="button">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Lessons */}
      <Card>
        <h3 style={{ marginTop: 0 }}>Lessons</h3>

        {loadingLessons ? (
          <p style={{ color: "#666" }}>Loading lessons...</p>
        ) : !moduleId ? (
          <p style={{ color: "#666" }}>Select a module to see lessons.</p>
        ) : (
          <>
            {/* Create lesson */}
            <form onSubmit={handleCreateLesson} style={{ display: "grid", gap: 10 }}>
              <div style={grid2}>
                <div>
                  <label style={label}>Lesson Title *</label>
                  <input
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    style={input}
                    placeholder="Lesson title"
                  />
                </div>
                <div>
                  <label style={label}>Type</label>
                  <select value={lessonType} onChange={(e) => setLessonType(e.target.value)} style={select}>
                    <option value="video">Video</option>
                    <option value="pdf">PDF</option>
                    <option value="link">Link</option>
                    <option value="text">Text</option>
                  </select>
                </div>
              </div>

              {lessonType === "text" ? (
                <div>
                  <label style={label}>Content Text</label>
                  <textarea
                    value={contentText}
                    onChange={(e) => setContentText(e.target.value)}
                    style={textarea}
                    placeholder="Write lesson content here..."
                  />
                </div>
              ) : (
                <div>
                  <label style={label}>Resource URL</label>
                  <input
                    value={resourceUrl}
                    onChange={(e) => setResourceUrl(e.target.value)}
                    style={input}
                    placeholder="https://..."
                  />
                </div>
              )}

              <div style={grid2}>
                <div>
                  <label style={label}>Duration (minutes)</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    style={input}
                    min={0}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "end", justifyContent: "flex-end" }}>
                  <button style={primaryBtn}>Add Lesson</button>
                </div>
              </div>
            </form>

            {/* list lessons */}
            {lessons.length === 0 ? (
              <p style={{ color: "#666", marginTop: 12 }}>No lessons yet.</p>
            ) : (
              <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                {lessons.map((l) => (
                  <div key={l._id} style={row}>
                    <div style={{ display: "grid", gap: 4 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <b>
                          {l.order}. {l.title}
                        </b>
                        <span style={badge}>{l.status}</span>
                        <span style={{ fontSize: 12, color: "#777" }}>
                          {l.type} • {l.durationMinutes} min
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "#777" }}>Lesson ID: {l._id}</div>
                      {l.type !== "text" && l.resourceUrl ? (
                        <div style={{ fontSize: 12, color: "#555" }}>{l.resourceUrl}</div>
                      ) : null}
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <button style={secondaryBtn} type="button" onClick={() => handlePublishLesson(l._id)}>
                        {l.status === "published" ? "Unpublish" : "Publish"}
                      </button>
                      <button style={dangerBtn} type="button" onClick={() => handleDeleteLesson(l._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

/* UI helper */
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

const badge = {
  padding: "4px 10px",
  borderRadius: 999,
  border: "1px solid #eee",
  background: "#fff",
  fontSize: 12,
  fontWeight: 900,
};

const row = {
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: 12,
  alignItems: "center",
  padding: 12,
  borderRadius: 14,
  border: "1px solid #eee",
  background: "#fafafa",
};

const alertError = {
  padding: 12,
  borderRadius: 12,
  border: "1px solid #ffd6d6",
  background: "#fff0f0",
  color: "#900",
};
