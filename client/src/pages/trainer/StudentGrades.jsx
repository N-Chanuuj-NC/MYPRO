import { useEffect, useMemo, useState } from "react";
import { getCourses } from "../../services/course.service";
import { getGradesByCourse, saveGrade, deleteGrade } from "../../services/grade.service";

export default function StudentGrades() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [courseTitle, setCourseTitle] = useState("");

  const [rows, setRows] = useState([]); // merged enrollment+grade
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // modal
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const [aScore, setAScore] = useState(0);
  const [qScore, setQScore] = useState(0);
  const [fScore, setFScore] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [status, setStatus] = useState("graded");
  const [saving, setSaving] = useState(false);

  // load courses
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const c = await getCourses();
        setCourses(c || []);
        if (c?.length) setCourseId(c[0]._id);
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Failed to load courses");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // load grades for course
  useEffect(() => {
    if (!courseId) return;
    load(courseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  async function load(id) {
    try {
      setError("");
      setLoading(true);
      const data = await getGradesByCourse(id);
      setCourseTitle(data?.course?.title || "");
      setRows(data?.rows || []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to load grades");
    } finally {
      setLoading(false);
    }
  }

  // filtered rows
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const name = (r.profile?.fullName || r.student?.name || "").toLowerCase();
      const email = (r.student?.email || "").toLowerCase();
      return !q || name.includes(q) || email.includes(q);
    });
  }, [rows, search]);

  // stats
  const stats = useMemo(() => {
    const total = rows.length;
    const graded = rows.filter((r) => r.grade?.status === "graded").length;
    const pending = total - graded;

    const avg =
      graded === 0
        ? 0
        : Math.round(
            rows.reduce((sum, r) => sum + (Number(r.grade?.finalScore) || 0), 0) / graded
          );

    return { total, graded, pending, avg };
  }, [rows]);

  function openGrade(row) {
    setSelected(row);

    const g = row.grade;
    setAScore(g?.assignmentScore ?? 0);
    setQScore(g?.quizScore ?? 0);
    setFScore(g?.finalScore ?? 0);
    setRemarks(g?.remarks ?? "");
    setStatus(g?.status ?? "graded");

    setOpen(true);
  }

  async function submitSave(e) {
    e.preventDefault();
    if (!selected?.studentId) return;

    const toNum = (v) => {
      const n = Number(v);
      if (Number.isNaN(n)) return 0;
      return Math.max(0, Math.min(100, n));
    };

    try {
      setError("");
      setSaving(true);

      const saved = await saveGrade(courseId, {
        studentId: selected.studentId,
        assignmentScore: toNum(aScore),
        quizScore: toNum(qScore),
        finalScore: toNum(fScore),
        remarks,
        status,
      });

      // update local
      setRows((prev) =>
        prev.map((x) =>
          String(x.studentId) === String(selected.studentId)
            ? {
                ...x,
                grade: {
                  _id: saved._id,
                  assignmentScore: saved.assignmentScore,
                  quizScore: saved.quizScore,
                  finalScore: saved.finalScore,
                  remarks: saved.remarks,
                  status: saved.status,
                },
              }
            : x
        )
      );

      setOpen(false);
      setSelected(null);
    } catch (e2) {
      setError(e2?.response?.data?.message || e2.message || "Failed to save grade");
    } finally {
      setSaving(false);
    }
  }

  async function removeGrade(row) {
    if (!row.grade?._id) return alert("No grade to delete");
    const ok = window.confirm("Delete this grade?");
    if (!ok) return;

    try {
      setError("");
      await deleteGrade(row.grade._id);

      setRows((prev) =>
        prev.map((x) =>
          String(x.studentId) === String(row.studentId) ? { ...x, grade: null } : x
        )
      );
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to delete grade");
    }
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div>
        <h2 style={{ margin: 0 }}>Student Grades</h2>
        <p style={{ margin: "6px 0 0", color: "#666" }}>
          Add and manage grades for enrolled students
        </p>
      </div>

      {error && (
        <div style={alertError}>
          <b>Error:</b> {error}
        </div>
      )}

      {/* Top row */}
      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr" }}>
        <div style={card}>
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ fontSize: 13, color: "#666", fontWeight: 800 }}>Select Course</div>
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)} style={select}>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>

            <div style={{ borderTop: "1px solid #eee", paddingTop: 12 }}>
              <div style={{ fontSize: 18, fontWeight: 900 }}>{courseTitle || "Course"}</div>
              <div style={{ fontSize: 13, color: "#666", marginTop: 6 }}>
                Open a student row to create/update grade.
              </div>
            </div>
          </div>
        </div>

        <StatCard label="Total Students" value={stats.total} />
        <StatCard label="Graded" value={stats.graded} />
        <StatCard label="Pending" value={stats.pending} />
        <StatCard label="Avg Final" value={`${stats.avg}%`} />
      </div>

      {/* Search */}
      <div style={card}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr auto", gap: 14, alignItems: "center" }}>
          <input
            style={input}
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div style={{ fontSize: 13, color: "#666", fontWeight: 800 }}>
            Showing {filtered.length} students
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={card}>
        {loading ? (
          <p style={{ color: "#666" }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: "#666" }}>No enrolled students found.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#666", fontSize: 13 }}>
                <th style={th}>Student</th>
                <th style={th}>Email</th>
                <th style={th}>Progress</th>
                <th style={th}>Assignment</th>
                <th style={th}>Quiz</th>
                <th style={th}>Final</th>
                <th style={th}>Status</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((r) => {
                const name = r.profile?.fullName || r.student?.name || "Student";
                const email = r.student?.email || "-";
                const prog = Number(r.progressPercent) || 0;

                const g = r.grade;
                const as = g?.assignmentScore ?? "-";
                const qs = g?.quizScore ?? "-";
                const fs = g?.finalScore ?? "-";
                const st = g?.status ?? "pending";

                return (
                  <tr key={String(r.studentId)} style={{ borderTop: "1px solid #eee" }}>
                    <td style={td}><b>{name}</b></td>
                    <td style={td}>{email}</td>

                    <td style={td}>
                      <div style={{ display: "grid", gap: 8 }}>
                        <div style={progressTrack}>
                          <div style={{ ...progressFill, width: `${prog}%` }} />
                        </div>
                        <div style={{ fontSize: 12, color: "#666", fontWeight: 800 }}>{prog}%</div>
                      </div>
                    </td>

                    <td style={td}>{as}</td>
                    <td style={td}>{qs}</td>
                    <td style={td}><b>{fs}</b></td>

                    <td style={td}>
                      <span style={st === "graded" ? badgeActive : badgePending}>{st}</span>
                    </td>

                    <td style={td}>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button style={btnOutline} onClick={() => openGrade(r)}>
                          Add / Edit
                        </button>
                        <button style={btnRemove} onClick={() => removeGrade(r)} disabled={!r.grade?._id}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {open && selected && (
        <div style={overlay}>
          <div style={modal}>
            <h3 style={{ marginTop: 0 }}>Update Grade</h3>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 10 }}>
              {selected.profile?.fullName || selected.student?.name} • {selected.student?.email}
            </div>

            <form onSubmit={submitSave} style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div>
                  <label style={label}>Assignment (0-100)</label>
                  <input type="number" min="0" max="100" style={{ ...input, marginTop: 8 }} value={aScore} onChange={(e) => setAScore(e.target.value)} />
                </div>
                <div>
                  <label style={label}>Quiz (0-100)</label>
                  <input type="number" min="0" max="100" style={{ ...input, marginTop: 8 }} value={qScore} onChange={(e) => setQScore(e.target.value)} />
                </div>
                <div>
                  <label style={label}>Final (0-100)</label>
                  <input type="number" min="0" max="100" style={{ ...input, marginTop: 8 }} value={fScore} onChange={(e) => setFScore(e.target.value)} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
                <div>
                  <label style={label}>Remarks</label>
                  <input style={{ ...input, marginTop: 8 }} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Good performance..." />
                </div>

                <div>
                  <label style={label}>Status</label>
                  <select style={{ ...select, marginTop: 8 }} value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="graded">graded</option>
                    <option value="pending">pending</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button type="button" style={btnOutline} onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button style={btnDark} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={card}>
      <div style={{ fontSize: 13, color: "#666" }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 900, marginTop: 10 }}>{value}</div>
    </div>
  );
}

/* styles */
const card = { background: "#fff", border: "1px solid #eee", borderRadius: 16, padding: 16 };
const input = { width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid #ddd" };
const select = { width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid #ddd", background: "#fff" };

const th = { padding: "14px 10px" };
const td = { padding: "14px 10px", verticalAlign: "middle" };

const progressTrack = { height: 10, background: "#eee", borderRadius: 999, overflow: "hidden" };
const progressFill = { height: "100%", background: "#bbb", borderRadius: 999 };

const badgeActive = { padding: "6px 12px", borderRadius: 999, background: "#e9f8ee", border: "1px solid #cdeed9", fontWeight: 900 };
const badgePending = { padding: "6px 12px", borderRadius: 999, background: "#fff5cc", border: "1px solid #ffe08a", fontWeight: 900 };

const btnOutline = { padding: "10px 14px", borderRadius: 12, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontWeight: 900 };
const btnDark = { padding: "10px 14px", borderRadius: 12, border: "none", background: "#111", color: "#fff", cursor: "pointer", fontWeight: 900 };
const btnRemove = { padding: "10px 14px", borderRadius: 12, border: "1px solid #eee", background: "#fafafa", cursor: "pointer", fontWeight: 900, color: "#333" };

const alertError = { padding: 12, borderRadius: 12, border: "1px solid #ffd6d6", background: "#fff0f0", color: "#900" };
const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "grid", placeItems: "center", padding: 16, zIndex: 999 };
const modal = { width: "min(720px, 100%)", background: "#fff", borderRadius: 16, padding: 16, border: "1px solid #eee" };
const label = { fontSize: 13, fontWeight: 900, color: "#666" };


