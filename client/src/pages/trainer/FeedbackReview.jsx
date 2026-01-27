import { useEffect, useMemo, useState } from "react";
import { getCourses } from "../../services/course.service";
import { getFeedbackByCourse, updateFeedback, deleteFeedback } from "../../services/feedback.service";

export default function FeedbackReview() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [courseTitle, setCourseTitle] = useState("");

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [resolvedFilter, setResolvedFilter] = useState("all"); // all | resolved | pending
  const [ratingFilter, setRatingFilter] = useState("all"); // all | 5..1

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // modal
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState("");
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

  // load feedback
  useEffect(() => {
    if (!courseId) return;
    load(courseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  async function load(id) {
    try {
      setError("");
      setLoading(true);
      const data = await getFeedbackByCourse(id);
      setCourseTitle(data?.course?.title || "");
      setItems(data?.feedback || []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to load feedback");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return items.filter((f) => {
      const name = (f.studentId?.name || "").toLowerCase();
      const email = (f.studentId?.email || "").toLowerCase();
      const comment = (f.comment || "").toLowerCase();

      const matchesSearch = !q || name.includes(q) || email.includes(q) || comment.includes(q);

      const matchesResolved =
        resolvedFilter === "all"
          ? true
          : resolvedFilter === "resolved"
          ? f.resolved === true
          : f.resolved === false;

      const matchesRating =
        ratingFilter === "all" ? true : Number(f.rating) === Number(ratingFilter);

      return matchesSearch && matchesResolved && matchesRating;
    });
  }, [items, search, resolvedFilter, ratingFilter]);

  const stats = useMemo(() => {
    const total = items.length;
    const resolved = items.filter((x) => x.resolved).length;
    const pending = total - resolved;

    const avg =
      total === 0
        ? 0
        : (items.reduce((sum, x) => sum + (Number(x.rating) || 0), 0) / total).toFixed(1);

    return { total, resolved, pending, avg };
  }, [items]);

  function openView(fb) {
    setSelected(fb);
    setReply(fb.trainerReply || "");
    setOpen(true);
  }

  async function saveReply() {
    if (!selected?._id) return;
    try {
      setError("");
      setSaving(true);

      const updated = await updateFeedback(selected._id, {
        trainerReply: reply,
        resolved: true,
      });

      setItems((prev) => prev.map((x) => (x._id === updated._id ? updated : x)));
      setOpen(false);
      setSelected(null);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to save reply");
    } finally {
      setSaving(false);
    }
  }

  async function toggleResolved(fb) {
    try {
      setError("");
      const updated = await updateFeedback(fb._id, { resolved: !fb.resolved });
      setItems((prev) => prev.map((x) => (x._id === updated._id ? updated : x)));
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to update status");
    }
  }

  async function removeFeedback(fb) {
    const ok = window.confirm("Delete this feedback?");
    if (!ok) return;

    try {
      setError("");
      await deleteFeedback(fb._id);
      setItems((prev) => prev.filter((x) => x._id !== fb._id));
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to delete feedback");
    }
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div>
        <h2 style={{ margin: 0 }}>Feedback Review</h2>
        <p style={{ margin: "6px 0 0", color: "#666" }}>
          Review student feedback and respond as trainer
        </p>
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
                Reply marks feedback as resolved.
              </div>
            </div>
          </div>
        </div>

        <StatCard label="Total" value={stats.total} />
        <StatCard label="Resolved" value={stats.resolved} />
        <StatCard label="Pending" value={stats.pending} />
        <StatCard label="Avg Rating" value={stats.avg} />
      </div>

      {/* Filters */}
      <div style={card}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 14, alignItems: "center" }}>
          <input
            style={input}
            placeholder="Search by student / email / comment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select value={resolvedFilter} onChange={(e) => setResolvedFilter(e.target.value)} style={select}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
          </select>

          <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} style={select}>
            <option value="all">All ratings</option>
            <option value="5">5 ★</option>
            <option value="4">4 ★</option>
            <option value="3">3 ★</option>
            <option value="2">2 ★</option>
            <option value="1">1 ★</option>
          </select>

          <div style={{ fontSize: 13, color: "#666", fontWeight: 800 }}>
            Showing {filtered.length} feedback
          </div>
        </div>
      </div>

      {/* List */}
      <div style={card}>
        {loading ? (
          <p style={{ color: "#666" }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: "#666" }}>No feedback found.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {filtered.map((f) => {
              const name = f.studentId?.name || "Student";
              const email = f.studentId?.email || "-";
              const date = new Date(f.createdAt).toISOString().slice(0, 10);

              return (
                <div key={f._id} style={fbCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 16 }}>{name}</div>
                      <div style={{ color: "#666", fontSize: 13 }}>{email} • {date}</div>
                    </div>

                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={chip}>{f.rating} ★</span>
                      <span style={f.resolved ? badgeActive : badgePending}>
                        {f.resolved ? "resolved" : "pending"}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginTop: 10, color: "#222" }}>{f.comment || "-"}</div>

                  {f.trainerReply ? (
                    <div style={replyBox}>
                      <div style={{ fontSize: 12, color: "#666", fontWeight: 900 }}>Trainer reply</div>
                      <div style={{ marginTop: 6 }}>{f.trainerReply}</div>
                    </div>
                  ) : null}

                  <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button style={btnOutline} onClick={() => openView(f)}>View / Reply</button>
                    <button style={btnDark} onClick={() => toggleResolved(f)}>
                      {f.resolved ? "Mark Pending" : "Mark Resolved"}
                    </button>
                    <button style={btnRemove} onClick={() => removeFeedback(f)}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {open && selected && (
        <div style={overlay}>
          <div style={modal}>
            <h3 style={{ marginTop: 0 }}>Reply to Feedback</h3>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 10 }}>
              {selected.studentId?.name || "Student"} • {selected.studentId?.email || "-"} • {selected.rating} ★
            </div>

            <div style={{ background: "#fafafa", border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 12, color: "#666", fontWeight: 900 }}>Student comment</div>
              <div style={{ marginTop: 6 }}>{selected.comment || "-"}</div>
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={label}>Your reply</label>
              <textarea
                style={{ ...input, marginTop: 8, minHeight: 90 }}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Thanks for your feedback..."
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
              <button style={btnOutline} onClick={() => setOpen(false)}>Cancel</button>
              <button style={btnDark} onClick={saveReply} disabled={saving}>
                {saving ? "Saving..." : "Save Reply (Resolve)"}
              </button>
            </div>
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
const fbCard = { background: "#fff", border: "1px solid #eee", borderRadius: 16, padding: 14 };
const input = { width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid #ddd" };
const select = { width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid #ddd", background: "#fff" };

const chip = { padding: "6px 10px", borderRadius: 999, border: "1px solid #eee", background: "#fafafa", fontWeight: 900 };
const badgeActive = { padding: "6px 12px", borderRadius: 999, background: "#e9f8ee", border: "1px solid #cdeed9", fontWeight: 900 };
const badgePending = { padding: "6px 12px", borderRadius: 999, background: "#fff5cc", border: "1px solid #ffe08a", fontWeight: 900 };

const btnOutline = { padding: "10px 14px", borderRadius: 12, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontWeight: 900 };
const btnDark = { padding: "10px 14px", borderRadius: 12, border: "none", background: "#111", color: "#fff", cursor: "pointer", fontWeight: 900 };
const btnRemove = { padding: "10px 14px", borderRadius: 12, border: "1px solid #eee", background: "#fafafa", cursor: "pointer", fontWeight: 900, color: "#333" };

const replyBox = { marginTop: 12, border: "1px solid #e8f1ff", background: "#f5f9ff", padding: 12, borderRadius: 12 };

const alertError = { padding: 12, borderRadius: 12, border: "1px solid #ffd6d6", background: "#fff0f0", color: "#900" };
const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "grid", placeItems: "center", padding: 16, zIndex: 999 };
const modal = { width: "min(720px, 100%)", background: "#fff", borderRadius: 16, padding: 16, border: "1px solid #eee" };
const label = { fontSize: 13, fontWeight: 900, color: "#666" };
