import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authService";
import { toast } from "react-hot-toast";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: "",
    university: "",
    role: "Researcher",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerUser(
        formData.email,
        formData.password,
        formData.displayName,
        formData.university,
        formData.role
      );
      toast.success("Account created successfully!");
      navigate("/");
    } catch (error) {
      toast.error(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper animate-in" style={{maxWidth: '480px', margin: '0 auto'}}>
      <div className="card">
        <h2 className="section-title" style={{textAlign: 'center', marginBottom: '8px'}}>Create Account</h2>

        <form onSubmit={handleRegister} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
          <div className="input-group">
            <label>Full Name</label>
            <input 
              name="displayName"
              className="input-field" 
              placeholder="Alice Smith"
              value={formData.displayName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input 
              name="email"
              type="email" 
              className="input-field" 
              placeholder="name@university.edu"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid-2" style={{gap: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr'}}>
            <div className="input-group">
              <label>Role</label>
              <select name="role" className="input-field" value={formData.role} onChange={handleChange}>
                <option value="Researcher">Researcher</option>
                <option value="PhD Scholar">PhD Scholar</option>
                <option value="Academician">Academician</option>
              </select>
            </div>
            <div className="input-group">
              <label> University</label>
              <input 
                name="university"
                className="input-field" 
                placeholder="MIT"
                value={formData.university}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="input-group">
            <label> Password</label>
            <input 
              name="password"
              type="password" 
              className="input-field" 
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{justifyContent: 'center', marginTop: '8px'}}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p style={{marginTop: '32px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
          Already have an account? <Link to="/login" style={{color: 'var(--accent-light)', fontWeight: '600'}}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
