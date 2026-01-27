import { useEffect, useState } from "react";
import {
  listStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../../services/studentDetails.service";

export default function StudentDetails() {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // add modal
  const [addOpen, setAddOpen] = useState(false);
  const [aName, setAName] = useState("");
  const [aEmail, setAEmail] = useState("");
  const [aPassword, setAPassword] = useState("");
  const [aFullName, setAFullName] = useState("");
  const [aPhone, setAPhone] = useState("");
  const [aAddress, setAAddress] = useState("");
  const [aDob, setADob] = useState("");

  // edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [eName, setEName] = useState("");
  const [eFullName, setEFullName] = useState("");
  const [ePhone, setEPhone] = useState("");
  const [eAddress, setEAddress] = useState("");
  const [eDob, setEDob] = useState("");

  async function refresh(q = search) {
    try {
      setError("");
      setLoading(true);
      const data = await listStudents(q);
      setRows(data);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openEdit(row) {
    setEditId(row._id);
    setEName(row.name || "");
    setEFullName(row.profile?.fullName || row.name || "");
    setEPhone(row.profile?.phone || "");
    setEAddress(row.profile?.address || "");
    setEDob(row.profile?.dob ? String(row.profile.dob).slice(0, 10) : "");
    setEditOpen(true);
  }

  async function onCreate(e) {
    e.preventDefault();
    if (!aEmail.trim()) return alert("Email is required");
    if (!aPassword.trim()) return alert("Password is required");

    try {
      setError("");
      await createStudent({
        name: aName,
        email: aEmail,
        password: aPassword,
        fullName: aFullName,
        phone: aPhone,
        address: aAddress,
        dob: aDob,
      });
      setAddOpen(false);
      setAName(""); setAEmail(""); setAPassword(""); setAFullName("");
      setAPhone(""); setAAddress(""); setADob("");
      await refresh("");
    } catch (e2) {
      setError(e2?.response?.data?.message || e2.message || "Create failed");
    }
  }

  async function onUpdate() {
    try {
      setError("");
      await updateStudent(editId, {
        name: eName,
        fullName: eFullName,
        phone: ePhone,
        address: eAddress,
        dob: eDob,
      });
      setEditOpen(false);
      await refresh(search);
    } catch (e2) {
      setError(e2?.response?.data?.message || e2.message || "Update failed");
    }
  }

  async function onDelete(id) {
    const ok = window.confirm("Delete this student? This will remove enrollments too.");
    if (!ok) return;

    try {
      setError("");
      await deleteStudent(id);
      await refresh(search);
    } catch (e2) {
      setError(e2?.response?.data?.message || e2.message || "Delete failed");
    }
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0 }}>Student Details</h2>
          <p style={{ margin: "6px 0 0", color: "#666" }}>
            Manage student accounts & profile info (Create / View / Update / Delete)
          </p>
        </div>

        <button style={primaryBtn} onClick={() => setAddOpen(true)}>
          + Add Student
        </button>
      </div>

      {error && <div style={alertError}><b>Error:</b> {error}</div>}

      <Card>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <input
            style={input}
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button style={secondaryBtn} onClick={() => refresh(search)}>Search</button>
          <button style={secondaryBtn} onClick={() => { setSearch(""); refresh(""); }}>Reset</button>
        </div>
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>Students</h3>

        {loading ? (
          <p style={{ color: "#666" }}>Loading...</p>
        ) : rows.length === 0 ? (
          <p style={{ color: "#666" }}>No students found. Click “Add Student”.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {rows.map((r) => (
              <div key={r._id} style={row}>
                <div>
                  <b>{r.profile?.fullName || r.name || "Student"}</b>
                  <div style={{ fontSize: 12, color: "#777" }}>{r.email}</div>
                  <div style={{ fontSize: 12, color: "#777" }}>
                    Phone: {r.profile?.phone || "-"} • Address: {r.profile?.address || "-"}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <button style={secondaryBtn} onClick={() => openEdit(r)}>Edit</button>
                  <button style={dangerBtn} onClick={() => onDelete(r._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ADD MODAL */}
      {addOpen && (
        <div style={overlay}>
          <div style={modal}>
            <h3 style={{ marginTop: 0 }}>Add Student</h3>

            <form onSubmit={onCreate} style={{ display: "grid", gap: 10 }}>
              <div style={grid2}>
                <div>
                  <label style={label}>User Name (optional)</label>
                  <input style={input} value={aName} onChange={(e) => setAName(e.target.value)} />
                </div>
                <div>
                  <label style={label}>Email *</label>
                  <input style={input} value={aEmail} onChange={(e) => setAEmail(e.target.value)} />
                </div>
              </div>

              <div>
                <label style={label}>Password *</label>
                <input style={input} type="password" value={aPassword} onChange={(e) => setAPassword(e.target.value)} />
              </div>

              <div style={grid2}>
                <div>
                  <label style={label}>Full Name</label>
                  <input style={input} value={aFullName} onChange={(e) => setAFullName(e.target.value)} />
                </div>
                <div>
                  <label style={label}>Phone</label>
                  <input style={input} value={aPhone} onChange={(e) => setAPhone(e.target.value)} />
                </div>
              </div>

              <div>
                <label style={label}>Address</label>
                <input style={input} value={aAddress} onChange={(e) => setAAddress(e.target.value)} />
              </div>

              <div style={grid2}>
                <div>
                  <label style={label}>Date of Birth</label>
                  <input style={input} type="date" value={aDob} onChange={(e) => setADob(e.target.value)} />
                </div>
                <div />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" style={secondaryBtn} onClick={() => setAddOpen(false)}>Cancel</button>
                <button style={primaryBtn}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editOpen && (
        <div style={overlay}>
          <div style={modal}>
            <h3 style={{ marginTop: 0 }}>Edit Student</h3>

            <div style={{ display: "grid", gap: 10 }}>
              <div>
                <label style={label}>User Name</label>
                <input style={input} value={eName} onChange={(e) => setEName(e.target.value)} />
              </div>

              <div style={grid2}>
                <div>
                  <label style={label}>Full Name</label>
                  <input style={input} value={eFullName} onChange={(e) => setEFullName(e.target.value)} />
                </div>
                <div>
                  <label style={label}>Phone</label>
                  <input style={input} value={ePhone} onChange={(e) => setEPhone(e.target.value)} />
                </div>
              </div>

              <div>
                <label style={label}>Address</label>
                <input style={input} value={eAddress} onChange={(e) => setEAddress(e.target.value)} />
              </div>

              <div style={grid2}>
                <div>
                  <label style={label}>Date of Birth</label>
                  <input style={input} type="date" value={eDob} onChange={(e) => setEDob(e.target.value)} />
                </div>
                <div />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button style={secondaryBtn} onClick={() => setEditOpen(false)}>Cancel</button>
                <button style={primaryBtn} onClick={onUpdate}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function Card({ children }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 14, padding: 16 }}>
      {children}
    </div>
  );
}

/* styles */
const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 };
const label = { display: "block", fontSize: 13, color: "#666", marginBottom: 6 };
const input = { width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #ddd" };
const row = { display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center", padding: 12, borderRadius: 14, border: "1px solid #eee", background: "#fafafa" };
const primaryBtn = { padding: "10px 12px", borderRadius: 12, border: "none", background: "#111", color: "#fff", cursor: "pointer", fontWeight: 800 };
const secondaryBtn = { padding: "10px 12px", borderRadius: 12, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontWeight: 800 };
const dangerBtn = { padding: "10px 12px", borderRadius: 12, border: "1px solid #ffd6d6", background: "#fff0f0", color: "#900", cursor: "pointer", fontWeight: 900 };
const alertError = { padding: 12, borderRadius: 12, border: "1px solid #ffd6d6", background: "#fff0f0", color: "#900" };
const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "grid", placeItems: "center", padding: 16, zIndex: 999 };
const modal = { width: "min(820px, 100%)", background: "#fff", borderRadius: 16, padding: 16, border: "1px solid #eee" };
