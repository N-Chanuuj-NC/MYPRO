import { useEffect, useState } from "react";
import {
  getTrainerProfile,
  updateTrainerProfile,
  changeTrainerPassword,
} from "../../services/profile.service";

export default function TrainerProfile() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState(null);

  // form fields
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [expertise, setExpertise] = useState("");
  const [experienceYears, setExperienceYears] = useState(0);
  const [linkedin, setLinkedin] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");


  // password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(true);
const [showNew, setShowNew] = useState(false);


  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setError("");
      setLoading(true);
      const data = await getTrainerProfile();
      setProfile(data);

      setName(data.name || "");
      setPhone(data.phone || "");
      setBio(data.bio || "");
      setExpertise(data.expertise || "");
      setExperienceYears(Number(data.experienceYears || 0));
      setLinkedin(data.linkedin || "");
      setWebsite(data.website || "");
      setEmail(data.email || "");
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    try {
      setError("");
      setSaving(true);

      const updated = await updateTrainerProfile({
        name,
        email,
        passwordConfirm, // ✅ for email change only
        phone,
        bio,
        expertise,
        experienceYears: Number(experienceYears || 0),
        linkedin,
        website,
      });

      setProfile(updated);
      alert("Profile updated ✅");
      setPasswordConfirm("");
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  async function savePassword() {
    if (!currentPassword || !newPassword) return alert("Fill both passwords");

    try {
      setError("");
      setSaving(true);

      await changeTrainerPassword({ currentPassword, newPassword });

      setCurrentPassword("");
      setNewPassword("");
      alert("Password updated ✅");
      setShowCurrent(false);
    setShowNew(false);

    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div>
        <h2 style={{ margin: 0 }}>Trainer Profile</h2>
        <p style={{ margin: "6px 0 0", color: "#666" }}>
          View and update your trainer profile information
        </p>
      </div>

      {error && (
        <div style={alertError}>
          <b>Error:</b> {error}
        </div>
      )}

      {loading ? (
        <div style={card}>Loading...</div>
      ) : (
        <>
          {/* Profile summary */}
          <div style={{ ...card, display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900 }}>{profile?.name || "Trainer"}</div>
              <div style={{ color: "#666", marginTop: 4 }}>{profile?.email}</div>
              <div style={{ color: "#666", marginTop: 4 }}>Role: {profile?.role}</div>
            </div>

            <button style={btnOutline} onClick={load}>Refresh</button>
          </div>

          {/* Edit Profile */}
          <div style={card}>
            <h3 style={{ marginTop: 0 }}>Profile Details</h3>

            <div style={grid2}>
              <Field label="Full Name">
                <input style={input} value={name} onChange={(e) => setName(e.target.value)} />
              </Field>

              <Field label="Phone">
                <input style={input} value={phone} onChange={(e) => setPhone(e.target.value)} />
              </Field>

              <Field label="Email (changing requires password confirm)">
                <input style={input} value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>

            <Field label="Password confirm (needed only to change email)">
            <input
            type="password"
            style={input}
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            
            />
            </Field>

              <Field label="Expertise (ex: React, Node, DB)">
                <input style={input} value={expertise} onChange={(e) => setExpertise(e.target.value)} />
              </Field>

              <Field label="Experience Years">
                <input
                  type="number"
                  min="0"
                  style={input}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                />
              </Field>

              <Field label="LinkedIn">
                <input style={input} value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
              </Field>

              <Field label="Website">
                <input style={input} value={website} onChange={(e) => setWebsite(e.target.value)} />
              </Field>
            </div>

            <Field label="Bio">
              <textarea
                style={{ ...input, minHeight: 90 }}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </Field>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
              <button style={btnDark} onClick={saveProfile} disabled={saving}>
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>

          {/* Change Password */}
          <div style={card}>
            <h3 style={{ marginTop: 0 }}>Change Password</h3>

            <div style={grid2}>
             <Field label="Current Password">
  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
    <input
      type={showCurrent ? "text" : "password"}
      style={input}
      value={currentPassword}
      onChange={(e) => setCurrentPassword(e.target.value)}
      autoComplete="current-password"
    />

    <button
      type="button"
      style={btnEye}
      onClick={() => setShowCurrent((v) => !v)}
    >
      {showCurrent ? "🙈 Hide" : "👁 Show"}
    </button>
  </div>
</Field>

<Field label="New Password">
  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
    <input
      type={showNew ? "text" : "password"}
      style={input}
      value={newPassword}
      onChange={(e) => setNewPassword(e.target.value)}
      autoComplete="new-password"
    />

    <button
      type="button"
      style={btnEye}
      onClick={() => setShowNew((v) => !v)}
    >
      {showNew ? "🙈 Hide" : "👁 Show"}
    </button>
  </div>
</Field>

            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
              <button style={btnDark} onClick={savePassword} disabled={saving}>
                {saving ? "Saving..." : "Update Password"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div style={{ fontSize: 13, color: "#666", fontWeight: 900 }}>{label}</div>
      {children}
    </div>
  );
}

const card = { background: "#fff", border: "1px solid #eee", borderRadius: 16, padding: 16 };
const input = { width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid #ddd" };
const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 };

const btnDark = { padding: "10px 14px", borderRadius: 12, border: "none", background: "#111", color: "#fff", cursor: "pointer", fontWeight: 900 };
const btnOutline = { padding: "10px 14px", borderRadius: 12, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontWeight: 900 };

const alertError = { padding: 12, borderRadius: 12, border: "1px solid #ffd6d6", background: "#fff0f0", color: "#900" };

const btnEye = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
  fontWeight: 900,
  whiteSpace: "nowrap",
};


