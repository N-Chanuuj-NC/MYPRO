import { useEffect, useMemo, useState } from "react";
import { getCourses } from "../../services/course.service";
import {
  getEnrollmentsByCourse,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
} from "../../services/enrollment.service";

export default function EnrollDetails() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [enrollments, setEnrollments] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // CREATE modal
  const [createOpen, setCreateOpen] = useState(false);
  const [cEmail, setCEmail] = useState("");
  const [cProgress, setCProgress] = useState(0);
  const [cStatus, setCStatus] = useState("active");
  const [createSaving, setCreateSaving] = useState(false);

  // UPDATE modal
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [eProgress, setEProgress] = useState(0);
  const [eStatus, setEStatus] = useState("active");
  const [editSaving, setEditSaving] = useState(false);

  // Load courses
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

  // Load enrollments for course
  useEffect(() => {
    if (!courseId) return;
    loadEnrollments(courseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  async function loadEnrollments(id) {
    try {
      setError("");
      setLoading(true);

      const data = await getEnrollmentsByCourse(id);
      setCourseTitle(data?.course?.title || "");
      setEnrollments(data?.enrollments || []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to load enrollments");
    } finally {
      setLoading(false);
    }
  }

  // Stats cards
  const stats = useMemo(() => {
    const total = enrollments.length;
    const active = enrollments.filter((x) => (x.status || "active") === "active").length;
    const blocked = enrollments.filter((x) => x.status === "blocked").length;

    const avg =
      total === 0
        ? 0
        : Math.round(
            enrollments.reduce((sum, x) => sum + (Number(x.progressPercent) || 0), 0) / total
          );

    return { total, active, blocked, avg };
  }, [enrollments]);

  // Filters
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return enrollments.filter((e) => {
      const name = (e.profile?.fullName || e.student?.name || "").toLowerCase();
      const email = (e.student?.email || "").toLowerCase();

      const matchesSearch = !q || name.includes(q) || email.includes(q);
      const matchesStatus =
        statusFilter === "all" ? true : (e.status || "active") === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [enrollments, search, statusFilter]);

  // CREATE enrollment
  async function submitCreate(e) {
    e.preventDefault();
    if (!courseId) return alert("Select a course first");
    if (!cEmail.trim()) return alert("Student email is required");

    const p = Number(cProgress);
    if (Number.isNaN(p) || p < 0 || p > 100) return alert("Progress must be 0-100");

    try {
      setError("");
      setCreateSaving(true);

      await createEnrollment(courseId, {
        studentEmail: cEmail.trim(),
        progressPercent: p,
        status: cStatus,
      });

      // reset + close
      setCreateOpen(false);
      setCEmail("");
      setCProgress(0);
      setCStatus("active");

      await loadEnrollments(courseId);
    } catch (e2) {
      setError(e2?.response?.data?.message || e2.message || "Failed to enroll student");
    } finally {
      setCreateSaving(false);
    }
  }

  // open edit modal
  function openEdit(row) {
    setSelected(row);
    setEProgress(Number(row.progressPercent) || 0);
    setEStatus(row.status || "active");
    setEditOpen(true);
  }

  // UPDATE enrollment
  async function submitEdit(e) {
    e.preventDefault();
    if (!selected?._id) return;

    const p = Number(eProgress);
    if (Number.isNaN(p) || p < 0 || p > 100) return alert("Progress must be 0-100");

    try {
      setError("");
      setEditSaving(true);

      await updateEnrollment(selected._id, { progressPercent: p, status: eStatus });

      // local update (fast UI)
      setEnrollments((prev) =>
        prev.map((x) =>
          x._id === selected._id ? { ...x, progressPercent: p, status: eStatus } : x
        )
      );

      setEditOpen(false);
      setSelected(null);
    } catch (e2) {
      setError(e2?.response?.data?.message || e2.message || "Failed to update enrollment");
    } finally {
      setEditSaving(false);
    }
  }

  // Block/unblock quick
  async function toggleBlock(row) {
    try {
      setError("");
      const next = row.status === "blocked" ? "active" : "blocked";
      await updateEnrollment(row._id, { status: next });

      setEnrollments((prev) => prev.map((x) => (x._id === row._id ? { ...x, status: next } : x)));
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to update status");
    }
  }

  // Delete
  async function remove(row) {
    const ok = window.confirm("Remove this student from this course?");
    if (!ok) return;

    try {
      setError("");
      await deleteEnrollment(row._id);
      setEnrollments((prev) => prev.filter((x) => x._id !== row._id));
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to remove enrollment");
    }
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0 }}>Student Enroll Details</h2>
          <p style={{ margin: "6px 0 0", color: "#666" }}>
            View and manage students enrolled in your courses
          </p>
        </div>

        <button style={btnDark} onClick={() => setCreateOpen(true)}>
          + Enroll Student
        </button>
      </div>

      {error && (
        <div style={alertError}>
          <b>Error:</b> {error}
        </div>
      )}

      {/* Top cards */}
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
                Track progress, block/unblock, and manage enrollments.
              </div>
            </div>
          </div>
        </div>

        <StatCard label="Total Enrolled" value={stats.total} />
        <StatCard label="Active" value={stats.active} />
        <StatCard label="Blocked" value={stats.blocked} />
        <StatCard label="Avg Progress" value={`${stats.avg}%`} />
      </div>

      {/* Search/filter */}
      <div style={card}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr auto",
            gap: 14,
            alignItems: "center",
          }}
        >
          <input
            style={input}
            placeholder="Search by student name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={select}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
            <option value="completed">Completed</option>
          </select>

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
          <p style={{ color: "#666" }}>No enrollments found for this course.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#666", fontSize: 13 }}>
                <th style={th}>Student</th>
                <th style={th}>Email</th>
                <th style={th}>Enrolled At</th>
                <th style={th}>Progress</th>
                <th style={th}>Status</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((r) => {
                const studentName = r.profile?.fullName || r.student?.name || "Student";
                const email = r.student?.email || "-";
                const date = r.enrolledAt ? new Date(r.enrolledAt).toISOString().slice(0, 10) : "-";
                const prog = Number(r.progressPercent) || 0;

                return (
                  <tr key={r._id} style={{ borderTop: "1px solid #eee" }}>
                    <td style={td}><b>{studentName}</b></td>
                    <td style={td}>{email}</td>
                    <td style={td}>{date}</td>

                    <td style={td}>
                      <div style={{ display: "grid", gap: 8 }}>
                        <div style={{ fontSize: 13, color: "#666" }}>Progress</div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr auto",
                            gap: 12,
                            alignItems: "center",
                          }}
                        >
                          <div style={progressTrack}>
                            <div style={{ ...progressFill, width: `${prog}%` }} />
                          </div>
                          <div style={{ width: 44, textAlign: "right", fontWeight: 900, color: "#555" }}>
                            {prog}%
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={td}>
                      <span style={r.status === "blocked" ? badgeBlocked : badgeActive}>
                        {r.status || "active"}
                      </span>
                    </td>

                    <td style={td}>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button style={btnOutline} onClick={() => openEdit(r)}>
                          View / Update
                        </button>

                        <button
                          style={r.status === "blocked" ? btnDark : btnDangerSoft}
                          onClick={() => toggleBlock(r)}
                        >
                          {r.status === "blocked" ? "Unblock" : "Block"}
                        </button>

                        <button style={btnRemove} onClick={() => remove(r)}>
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

      {/* CREATE MODAL */}
      {createOpen && (
        <div style={overlay}>
          <div style={modal}>
            <h3 style={{ marginTop: 0 }}>Enroll Student</h3>
            <p style={{ marginTop: 6, color: "#666", fontSize: 13 }}>
              Enter student email (student must exist in Student Details).
            </p>

            <form onSubmit={submitCreate} style={{ display: "grid", gap: 10 }}>
              <div>
                <label style={label}>Student Email</label>
                <input
                  style={{ ...input, marginTop: 8 }}
                  placeholder="student@gmail.com"
                  value={cEmail}
                  onChange={(e) => setCEmail(e.target.value)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={label}>Progress (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    style={{ ...input, marginTop: 8 }}
                    value={cProgress}
                    onChange={(e) => setCProgress(e.target.value)}
                  />
                </div>

                <div>
                  <label style={label}>Status</label>
                  <select
                    style={{ ...select, marginTop: 8 }}
                    value={cStatus}
                    onChange={(e) => setCStatus(e.target.value)}
                  >
                    <option value="active">active</option>
                    <option value="blocked">blocked</option>
                    <option value="completed">completed</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button type="button" style={btnOutline} onClick={() => setCreateOpen(false)}>
                  Cancel
                </button>
                <button style={btnDark} disabled={createSaving}>
                  {createSaving ? "Saving..." : "Enroll"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE MODAL */}
      {editOpen && selected && (
        <div style={overlay}>
          <div style={modal}>
            <h3 style={{ marginTop: 0 }}>Update Enrollment</h3>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 10 }}>
              {selected.profile?.fullName || selected.student?.name} • {selected.student?.email}
            </div>

            <form onSubmit={submitEdit} style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={label}>Progress (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    style={{ ...input, marginTop: 8 }}
                    value={eProgress}
                    onChange={(e) => setEProgress(e.target.value)}
                  />
                </div>

                <div>
                  <label style={label}>Status</label>
                  <select
                    style={{ ...select, marginTop: 8 }}
                    value={eStatus}
                    onChange={(e) => setEStatus(e.target.value)}
                  >
                    <option value="active">active</option>
                    <option value="blocked">blocked</option>
                    <option value="completed">completed</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button type="button" style={btnOutline} onClick={() => setEditOpen(false)}>
                  Cancel
                </button>
                <button style={btnDark} disabled={editSaving}>
                  {editSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* small component */
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
const badgeBlocked = { padding: "6px 12px", borderRadius: 999, background: "#ffecec", border: "1px solid #ffd0d0", fontWeight: 900 };

const btnOutline = { padding: "10px 14px", borderRadius: 12, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontWeight: 900 };
const btnDark = { padding: "10px 14px", borderRadius: 12, border: "none", background: "#111", color: "#fff", cursor: "pointer", fontWeight: 900 };
const btnDangerSoft = { padding: "10px 14px", borderRadius: 12, border: "1px solid #ffd0d0", background: "#ffecec", cursor: "pointer", fontWeight: 900 };
const btnRemove = { padding: "10px 14px", borderRadius: 12, border: "1px solid #eee", background: "#fafafa", cursor: "pointer", fontWeight: 900, color: "#333" };

const alertError = { padding: 12, borderRadius: 12, border: "1px solid #ffd6d6", background: "#fff0f0", color: "#900" };
const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "grid", placeItems: "center", padding: 16, zIndex: 999 };
const modal = { width: "min(560px, 100%)", background: "#fff", borderRadius: 16, padding: 16, border: "1px solid #eee" };
const label = { fontSize: 13, fontWeight: 900, color: "#666" };
