import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTrainerDashboardSummary } from "../../services/dashboard.service";

export default function TrainerDashboard() {
  const nav = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setError("");
      setLoading(true);
      const d = await getTrainerDashboardSummary();
      setData(d);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  const cards = data?.cards || {
    myCourses: 0,
    totalEnrolled: 0,
    pendingSubmissions: 0,
    avgRating: 0,
  };

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0 }}>Trainer Dashboard</h2>
          <p style={{ margin: "6px 0 0", color: "#666" }}>
            Quick summary of your courses, enrollments, tasks and feedback
          </p>
        </div>

        <button style={btnOutline} onClick={load}>Refresh</button>
      </div>

      {error && (
        <div style={alertError}>
          <b>Error:</b> {error}
        </div>
      )}

      {/* Top stats */}
      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
        <Stat label="My Courses" value={cards.myCourses} />
        <Stat label="Total Enrolled in Courses" value={cards.totalEnrolled} />
        <Stat label="Pending Submissions" value={cards.pendingSubmissions} />
        <Stat label="Avg. Rating" value={cards.avgRating ? `${cards.avgRating}/5` : "0/5"} />
      </div>

      {/* Middle row */}
      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "2fr 1.4fr 1.4fr" }}>
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Quick Actions</h3>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button style={btnDark} onClick={() => nav("/trainer/courses")}>+ Create Course</button>
            <button style={btnOutline} onClick={() => nav("/trainer/content")}>+ Add Content</button>
            <button style={btnOutline} onClick={() => nav("/trainer/tasks")}>+ Create Task</button>
          </div>

          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #eee", color: "#666" }}>
            Tip: keep your course content updated weekly to improve engagement.
          </div>
        </div>

        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Today</h3>
          {loading ? (
            <p style={{ color: "#666" }}>Loading...</p>
          ) : (
            <div style={{ display: "grid", gap: 10, color: "#333" }}>
              <LineItem label="Quizzes scheduled" value={data?.today?.quizzesScheduled || 0} />
              <LineItem label="Pending submissions" value={data?.today?.pendingSubmissions || 0} />
            </div>
          )}
        </div>

        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Tips</h3>
          <p style={{ margin: 0, color: "#666", lineHeight: 1.6 }}>
            Publish course content weekly to increase completion rate. Review feedback and update tasks based on student performance.
          </p>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "2fr 1fr" }}>
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Recent Pending Submissions</h3>

          {loading ? (
            <p style={{ color: "#666" }}>Loading...</p>
          ) : (data?.recentPending?.length || 0) === 0 ? (
            <p style={{ color: "#666" }}>No pending items right now.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#666", fontSize: 13 }}>
                  <th style={th}>Student</th>
                  <th style={th}>Course</th>
                  <th style={th}>Task</th>
                  <th style={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentPending.map((r, idx) => (
                  <tr key={idx} style={{ borderTop: "1px solid #eee" }}>
                    <td style={td}><b>{r.studentName}</b></td>
                    <td style={td}>{r.courseTitle}</td>
                    <td style={td}>{r.task}</td>
                    <td style={td}><span style={badgePending}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
            <button style={btnOutline} onClick={() => nav("/trainer/grades")}>
              Go to Grades →
            </button>
          </div>
        </div>

        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Latest Feedback</h3>

          {loading ? (
            <p style={{ color: "#666" }}>Loading...</p>
          ) : (data?.latestFeedback?.length || 0) === 0 ? (
            <p style={{ color: "#666" }}>No feedback yet.</p>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {data.latestFeedback.map((f, idx) => (
                <div key={idx} style={feedbackCard}>
                  <div style={{ fontWeight: 900 }}>{f.studentName}</div>
                  <div style={{ color: "#666", fontSize: 13, marginTop: 2 }}>{f.courseTitle}</div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                    <span style={{ fontSize: 18 }}>⭐</span>
                    <b>{f.rating}</b>
                  </div>

                  <div style={{ color: "#333", marginTop: 8, lineHeight: 1.5 }}>
                    {f.comment || "—"}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
            <button style={btnOutline} onClick={() => nav("/trainer/feedback")}>
              View all →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={card}>
      <div style={{ fontSize: 13, color: "#666" }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 900, marginTop: 10 }}>{value}</div>
    </div>
  );
}

function LineItem({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
      <div style={{ color: "#666" }}>{label}</div>
      <div style={{ fontWeight: 900 }}>{value}</div>
    </div>
  );
}

/* styles */
const card = { background: "#fff", border: "1px solid #eee", borderRadius: 16, padding: 16 };

const th = { padding: "14px 10px" };
const td = { padding: "14px 10px" };

const btnDark = { padding: "12px 16px", borderRadius: 12, border: "none", background: "#111", color: "#fff", cursor: "pointer", fontWeight: 900 };
const btnOutline = { padding: "12px 16px", borderRadius: 12, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontWeight: 900 };

const badgePending = { padding: "6px 12px", borderRadius: 999, border: "1px solid #ddd", background: "#fff", fontWeight: 900 };

const feedbackCard = { border: "1px solid #eee", borderRadius: 14, padding: 14, background: "#fff" };

const alertError = { padding: 12, borderRadius: 12, border: "1px solid #ffd6d6", background: "#fff0f0", color: "#900" };
