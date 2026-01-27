import { useEffect, useMemo, useState } from "react";
import { getCourses } from "../../services/course.service";
import { getModules, getLessons } from "../../services/content.service";
import {
  getAssignments,
  createAssignment,
  toggleAssignmentPublish,
  deleteAssignment,
  getQuizzes,
  createQuiz,
  toggleQuizPublish,
  deleteQuiz,
} from "../../services/task.service";

export default function TaskModule() {
  // selection
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");

  const [modules, setModules] = useState([]);
  const [moduleId, setModuleId] = useState("");

  const [lessons, setLessons] = useState([]);
  const [lessonId, setLessonId] = useState("");

  // tasks
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  // loading/error
  const [error, setError] = useState("");
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingModules, setLoadingModules] = useState(false);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // create assignment form
  const [aTitle, setATitle] = useState("");
  const [aInstructions, setAInstructions] = useState("");
  const [aMarks, setAMarks] = useState(100);

  // create quiz form (simple: 1 question)
  const [qTitle, setQTitle] = useState("");
  const [qTime, setQTime] = useState(10);
  const [qMarks, setQMarks] = useState(20);

  const [qq, setQQ] = useState("React is a ____ library?");
  const [opt1, setOpt1] = useState("Backend");
  const [opt2, setOpt2] = useState("Frontend");
  const [opt3, setOpt3] = useState("Database");
  const [opt4, setOpt4] = useState("OS");
  const [correctIndex, setCorrectIndex] = useState(1);

  // Load courses
  useEffect(() => {
    async function load() {
      try {
        setError("");
        setLoadingCourses(true);
        const data = await getCourses();
        setCourses(data);
        if (data.length > 0) setCourseId(data[0]._id);
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Failed to load courses");
      } finally {
        setLoadingCourses(false);
      }
    }
    load();
  }, []);

  // Load modules when course changes
  useEffect(() => {
    if (!courseId) {
      setModules([]);
      setModuleId("");
      setLessons([]);
      setLessonId("");
      setAssignments([]);
      setQuizzes([]);
      return;
    }

    async function loadModulesForCourse() {
      try {
        setError("");
        setLoadingModules(true);
        const data = await getModules(courseId);
        setModules(data);
        if (data.length > 0) setModuleId(data[0]._id);
        else {
          setModuleId("");
          setLessons([]);
          setLessonId("");
          setAssignments([]);
          setQuizzes([]);
        }
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Failed to load modules");
      } finally {
        setLoadingModules(false);
      }
    }

    loadModulesForCourse();
  }, [courseId]);

  // Load lessons when module changes
  useEffect(() => {
    if (!moduleId) {
      setLessons([]);
      setLessonId("");
      setAssignments([]);
      setQuizzes([]);
      return;
    }

    async function loadLessonsForModule() {
      try {
        setError("");
        setLoadingLessons(true);
        const data = await getLessons(moduleId);
        setLessons(data);
        if (data.length > 0) setLessonId(data[0]._id);
        else {
          setLessonId("");
          setAssignments([]);
          setQuizzes([]);
        }
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Failed to load lessons");
      } finally {
        setLoadingLessons(false);
      }
    }

    loadLessonsForModule();
  }, [moduleId]);

  // Load tasks when lesson changes
  useEffect(() => {
    if (!lessonId) {
      setAssignments([]);
      setQuizzes([]);
      return;
    }

    async function loadTasks() {
      try {
        setError("");
        setLoadingTasks(true);
        const [a, q] = await Promise.all([getAssignments(lessonId), getQuizzes(lessonId)]);
        setAssignments(a);
        setQuizzes(q);
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Failed to load tasks");
      } finally {
        setLoadingTasks(false);
      }
    }

    loadTasks();
  }, [lessonId]);

  const selectedCourse = useMemo(() => courses.find((c) => c._id === courseId), [courses, courseId]);
  const selectedModule = useMemo(() => modules.find((m) => m._id === moduleId), [modules, moduleId]);
  const selectedLesson = useMemo(() => lessons.find((l) => l._id === lessonId), [lessons, lessonId]);

  // actions
  async function onCreateAssignment(e) {
    e.preventDefault();
    if (!lessonId) return alert("Select a lesson first");
    if (!aTitle.trim()) return alert("Assignment title is required");

    try {
      setError("");
      const created = await createAssignment(lessonId, {
        title: aTitle,
        instructions: aInstructions,
        totalMarks: Number(aMarks || 0),
      });
      setAssignments((prev) => [created, ...prev]);
      setATitle("");
      setAInstructions("");
      setAMarks(100);
    } catch (e2) {
      setError(e2?.response?.data?.message || e2.message || "Create assignment failed");
    }
  }

  async function onToggleAssignment(id) {
    try {
      setError("");
      const updated = await toggleAssignmentPublish(id);
      setAssignments((prev) => prev.map((a) => (a._id === id ? updated : a)));
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Publish toggle failed");
    }
  }

  async function onDeleteAssignment(id) {
    const ok = window.confirm("Delete this assignment?");
    if (!ok) return;

    try {
      setError("");
      await deleteAssignment(id);
      setAssignments((prev) => prev.filter((a) => a._id !== id));
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Delete failed");
    }
  }

  async function onCreateQuiz(e) {
    e.preventDefault();
    if (!lessonId) return alert("Select a lesson first");
    if (!qTitle.trim()) return alert("Quiz title is required");

    const options = [opt1, opt2, opt3, opt4].map((x) => x.trim()).filter(Boolean);
    if (options.length < 2) return alert("Quiz needs at least 2 options");
    if (correctIndex < 0 || correctIndex >= options.length) return alert("Correct option index invalid");

    try {
      setError("");
      const created = await createQuiz(lessonId, {
        title: qTitle,
        timeLimitMinutes: Number(qTime || 0),
        totalMarks: Number(qMarks || 0),
        questions: [
          {
            question: qq,
            options,
            correctIndex: Number(correctIndex),
          },
        ],
      });
      setQuizzes((prev) => [created, ...prev]);
      setQTitle("");
    } catch (e2) {
      setError(e2?.response?.data?.message || e2.message || "Create quiz failed");
    }
  }

  async function onToggleQuiz(id) {
    try {
      setError("");
      const updated = await toggleQuizPublish(id);
      setQuizzes((prev) => prev.map((q) => (q._id === id ? updated : q)));
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Publish toggle failed");
    }
  }

  async function onDeleteQuiz(id) {
    const ok = window.confirm("Delete this quiz?");
    if (!ok) return;

    try {
      setError("");
      await deleteQuiz(id);
      setQuizzes((prev) => prev.filter((q) => q._id !== id));
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Delete failed");
    }
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div>
        <h2 style={{ margin: 0 }}>Task Module</h2>
        <p style={{ margin: "6px 0 0", color: "#666" }}>
          Create assignments and quizzes for each lesson
        </p>
      </div>

      {error && (
        <div style={alertError}>
          <b>Error:</b> {error}
        </div>
      )}

      {/* Selectors */}
      <Card>
        <h3 style={{ marginTop: 0 }}>Select Lesson</h3>

        {loadingCourses ? (
          <p style={{ color: "#666" }}>Loading courses...</p>
        ) : courses.length === 0 ? (
          <p style={{ color: "#666" }}>No courses found. Create course + content first.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <label style={label}>Course</label>
              <select value={courseId} onChange={(e) => setCourseId(e.target.value)} style={select}>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={label}>Module</label>
              <select
                value={moduleId}
                onChange={(e) => setModuleId(e.target.value)}
                style={select}
                disabled={loadingModules || modules.length === 0}
              >
                {modules.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.order}. {m.title}
                  </option>
                ))}
              </select>
              {modules.length === 0 && !loadingModules && (
                <p style={{ color: "#666", marginTop: 8 }}>No modules for this course.</p>
              )}
            </div>

            <div>
              <label style={label}>Lesson</label>
              <select
                value={lessonId}
                onChange={(e) => setLessonId(e.target.value)}
                style={select}
                disabled={loadingLessons || lessons.length === 0}
              >
                {lessons.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.order}. {l.title}
                  </option>
                ))}
              </select>
              {lessons.length === 0 && !loadingLessons && (
                <p style={{ color: "#666", marginTop: 8 }}>No lessons in this module.</p>
              )}
            </div>

            <div style={{ fontSize: 12, color: "#777" }}>
              Selected: <b>{selectedCourse?.title || "-"}</b> → <b>{selectedModule?.title || "-"}</b> →{" "}
              <b>{selectedLesson?.title || "-"}</b>
            </div>
          </div>
        )}
      </Card>

      {/* Assignments */}
      <Card>
        <h3 style={{ marginTop: 0 }}>Assignments</h3>

        {!lessonId ? (
          <p style={{ color: "#666" }}>Select a lesson to manage assignments.</p>
        ) : (
          <>
            <form onSubmit={onCreateAssignment} style={{ display: "grid", gap: 10 }}>
              <div style={grid2}>
                <div>
                  <label style={label}>Title *</label>
                  <input value={aTitle} onChange={(e) => setATitle(e.target.value)} style={input} />
                </div>
                <div>
                  <label style={label}>Total Marks</label>
                  <input
                    type="number"
                    min={0}
                    value={aMarks}
                    onChange={(e) => setAMarks(e.target.value)}
                    style={input}
                  />
                </div>
              </div>

              <div>
                <label style={label}>Instructions</label>
                <textarea
                  value={aInstructions}
                  onChange={(e) => setAInstructions(e.target.value)}
                  style={textarea}
                  placeholder="Explain what students should do..."
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button style={primaryBtn}>Add Assignment</button>
              </div>
            </form>

            {loadingTasks ? (
              <p style={{ color: "#666", marginTop: 12 }}>Loading tasks...</p>
            ) : assignments.length === 0 ? (
              <p style={{ color: "#666", marginTop: 12 }}>No assignments yet.</p>
            ) : (
              <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                {assignments.map((a) => (
                  <div key={a._id} style={row}>
                    <div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <b>{a.title}</b>
                        <span style={badge}>{a.status}</span>
                        <span style={{ fontSize: 12, color: "#777" }}>{a.totalMarks} marks</span>
                      </div>
                      {a.instructions ? <div style={{ color: "#555" }}>{a.instructions}</div> : null}
                      <div style={{ fontSize: 12, color: "#777" }}>ID: {a._id}</div>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <button style={secondaryBtn} type="button" onClick={() => onToggleAssignment(a._id)}>
                        {a.status === "published" ? "Unpublish" : "Publish"}
                      </button>
                      <button style={dangerBtn} type="button" onClick={() => onDeleteAssignment(a._id)}>
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

      {/* Quizzes */}
      <Card>
        <h3 style={{ marginTop: 0 }}>Quizzes</h3>

        {!lessonId ? (
          <p style={{ color: "#666" }}>Select a lesson to manage quizzes.</p>
        ) : (
          <>
            <form onSubmit={onCreateQuiz} style={{ display: "grid", gap: 10 }}>
              <div style={grid2}>
                <div>
                  <label style={label}>Quiz Title *</label>
                  <input value={qTitle} onChange={(e) => setQTitle(e.target.value)} style={input} />
                </div>
                <div>
                  <label style={label}>Time Limit (min)</label>
                  <input
                    type="number"
                    min={0}
                    value={qTime}
                    onChange={(e) => setQTime(e.target.value)}
                    style={input}
                  />
                </div>
              </div>

              <div style={grid2}>
                <div>
                  <label style={label}>Total Marks</label>
                  <input
                    type="number"
                    min={0}
                    value={qMarks}
                    onChange={(e) => setQMarks(e.target.value)}
                    style={input}
                  />
                </div>
                <div>
                  <label style={label}>Correct Option Index (0-3)</label>
                  <input
                    type="number"
                    min={0}
                    max={3}
                    value={correctIndex}
                    onChange={(e) => setCorrectIndex(e.target.value)}
                    style={input}
                  />
                </div>
              </div>

              <div>
                <label style={label}>Question</label>
                <input value={qq} onChange={(e) => setQQ(e.target.value)} style={input} />
              </div>

              <div style={grid2}>
                <div>
                  <label style={label}>Option 1</label>
                  <input value={opt1} onChange={(e) => setOpt1(e.target.value)} style={input} />
                </div>
                <div>
                  <label style={label}>Option 2</label>
                  <input value={opt2} onChange={(e) => setOpt2(e.target.value)} style={input} />
                </div>
              </div>

              <div style={grid2}>
                <div>
                  <label style={label}>Option 3</label>
                  <input value={opt3} onChange={(e) => setOpt3(e.target.value)} style={input} />
                </div>
                <div>
                  <label style={label}>Option 4</label>
                  <input value={opt4} onChange={(e) => setOpt4(e.target.value)} style={input} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button style={primaryBtn}>Add Quiz</button>
              </div>
            </form>

            {loadingTasks ? (
              <p style={{ color: "#666", marginTop: 12 }}>Loading tasks...</p>
            ) : quizzes.length === 0 ? (
              <p style={{ color: "#666", marginTop: 12 }}>No quizzes yet.</p>
            ) : (
              <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                {quizzes.map((q) => (
                  <div key={q._id} style={row}>
                    <div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <b>{q.title}</b>
                        <span style={badge}>{q.status}</span>
                        <span style={{ fontSize: 12, color: "#777" }}>
                          {q.timeLimitMinutes} min • {q.totalMarks} marks • {q.questions?.length || 0} questions
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "#777" }}>ID: {q._id}</div>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <button style={secondaryBtn} type="button" onClick={() => onToggleQuiz(q._id)}>
                        {q.status === "published" ? "Unpublish" : "Publish"}
                      </button>
                      <button style={dangerBtn} type="button" onClick={() => onDeleteQuiz(q._id)}>
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
  minHeight: 80,
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
