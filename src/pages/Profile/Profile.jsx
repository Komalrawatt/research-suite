import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { addActivity, getRecentActivities } from "../../services/activityService";
import { FiUser, FiMail, FiBook, FiShield, FiEdit2, FiActivity, FiSave, FiX, FiFileText, FiSearch } from "react-icons/fi";

const Profile = () => {
  const { user, profile, updateProfileData } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [formData, setFormData] = useState({
    displayName: "",
    university: "",
    role: "Researcher",
  });

  const displayName = profile?.displayName || user?.displayName || "Researcher";
  const avatarLetter = displayName ? displayName[0].toUpperCase() : null;

  useEffect(() => {
    if (!user) return;
    setFormData({
      displayName: profile?.displayName || user.displayName || "",
      university: profile?.university || "",
      role: profile?.role || "Researcher",
    });
  }, [user, profile]);

  // Load activities
  const loadActivities = async (targetUserId) => {
    setActivityLoading(true);
    try {
      const data = await getRecentActivities(targetUserId, 6);
      setActivities(data);
    } catch (error) {
      console.error("Failed to load activities:", error);
    } finally {
      setActivityLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadActivities(user.uid);
  }, [user]);

  const logActivity = async (payload) => {
    if (!user) return;
    try {
      await addActivity(user.uid, payload);
      await loadActivities(user.uid);
    } catch (error) {
      console.error("Activity log failed:", error);
    }
  };

  const formatActivityTime = (value) => {
    if (!value) return "Just now";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Just now";
    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const resolveActivityColor = (type) => {
    const palette = {
      search: "var(--cyan)",
      save: "var(--accent)",
      remove: "var(--warning)",
      citation: "var(--success)",
      profile: "var(--purple)",
    };
    return palette[type] || "var(--accent)";
  };

  const resolveActivityIcon = (type) => {
    switch (type) {
      case "search": return <FiSearch size={14} />;
      case "save": return <FiBook size={14} />;
      case "remove": return <FiX size={14} />;
      case "citation": return <FiFileText size={14} />;
      case "profile": return <FiUser size={14} />;
      default: return <FiActivity size={14} />;
    }
  };

  if (!user) return null;

  return (
    <div className="page-wrapper container animate-in">
      <div className="section-header">
        <h1 className="section-title">Researcher Profile</h1>
      </div>

      <div className="grid-2" style={{gridTemplateColumns: '1fr 2fr', alignItems: 'start'}}>
        {/* Left sidebar */}
        <div className="card profile-sidebar">
          <div style={{textAlign: 'center', marginBottom: '32px'}}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'var(--gradient-1)',
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              color: '#fff',
              border: '4px solid var(--bg-card)',
              boxShadow: 'var(--shadow-glow)'
            }}>
              {avatarLetter ? avatarLetter : <FiUser />}
            </div>
            <h2 style={{fontSize: '1.5rem', marginBottom: '4px'}}>{displayName}</h2>
            <p style={{color: 'var(--accent-light)', fontWeight: '600'}}>{profile?.role || "PhD Scholar"}</p>
          </div>

          <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)'}}>
              <FiMail /> <span>{user.email}</span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)'}}>
              <FiBook /> <span>{profile?.university || "Not specified"}</span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)'}}>
              <FiShield /> <span>Verified Academic Account</span>
            </div>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            style={{width: '100%', marginTop: '32px', justifyContent: 'center'}}
            onClick={() => {
              if (editing) {
                setFormData({
                  displayName: profile?.displayName || user.displayName || "",
                  university: profile?.university || "",
                  role: profile?.role || "Researcher",
                });
              }
              setEditing((prev) => !prev);
            }}
          >
            {editing ? <><FiX /> Cancel Edit</> : <><FiEdit2 /> Edit Profile</>}
          </button>
        </div>

        {/* Right content */}
        <div style={{display: 'flex', flexDirection: 'column', gap: '32px'}}>
          {/* Profile edit form */}
          <div className="card">
            <h3 style={{fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px'}}>
              <FiUser color="var(--accent)" /> Profile Details
            </h3>
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                if (!user || saving) return;

                setSaving(true);
                try {
                  await updateProfileData({
                    displayName: formData.displayName.trim(),
                    university: formData.university.trim(),
                    role: formData.role,
                  });

                  toast.success("Profile updated successfully");
                  
                  logActivity({
                    type: "profile",
                    title: "Updated profile",
                    detail: formData.displayName.trim() || "Profile details",
                  });
                  
                  setEditing(false);
                } catch (error) {
                  console.error("Save profile error:", error);
                  toast.error(error.message || "Failed to update profile");
                } finally {
                  setSaving(false);
                }
              }}
              style={{display: 'grid', gap: '16px'}}
            >
              <div className="grid-2" style={{gap: '16px'}}>
                <div className="input-group">
                  <label htmlFor="displayName">Full name</label>
                  <input
                    id="displayName"
                    className="input-field"
                    value={formData.displayName}
                    onChange={(event) => setFormData((prev) => ({ ...prev, displayName: event.target.value }))}
                    placeholder="Enter your full name"
                    disabled={!editing}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    className="input-field"
                    value={formData.role}
                    onChange={(event) => setFormData((prev) => ({ ...prev, role: event.target.value }))}
                    disabled={!editing}
                  >
                    <option value="Researcher">Researcher</option>
                    <option value="PhD Scholar">PhD Scholar</option>
                    <option value="Academician">Academician</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="university">University / Institution</label>
                <input
                  id="university"
                  className="input-field"
                  value={formData.university}
                  onChange={(event) => setFormData((prev) => ({ ...prev, university: event.target.value }))}
                  placeholder="Add your institution"
                  disabled={!editing}
                />
              </div>

              {editing && (
                <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
                  <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)} disabled={saving}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    <FiSave /> {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h3 style={{fontSize: '1.25rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px'}}>
              <FiActivity color="var(--accent)" /> Recent Activity
            </h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
              {activityLoading ? (
                <div className="spinner"></div>
              ) : activities.length > 0 ? (
                activities.map((activity, index) => (
                  <div
                    key={activity.id || `${activity.type}-${index}`}
                    className="activity-item"
                    style={{
                      display: 'flex', gap: '16px',
                      paddingBottom: index === activities.length - 1 ? '0' : '16px',
                      borderBottom: index === activities.length - 1 ? 'none' : '1px solid var(--border)',
                    }}
                  >
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: `${resolveActivityColor(activity.type)}20`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: resolveActivityColor(activity.type),
                      flexShrink: 0,
                    }}>
                      {resolveActivityIcon(activity.type)}
                    </div>
                    <div>
                      <p style={{fontSize: '0.95rem', color: 'var(--text-primary)'}}>{activity.title}</p>
                      {activity.detail ? (
                        <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>{activity.detail}</p>
                      ) : null}
                      <p style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>{formatActivityTime(activity.createdAt)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)'}}>
                  <p>No activity yet. Start searching and saving papers!</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
