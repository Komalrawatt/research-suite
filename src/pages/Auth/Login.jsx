import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, signInWithGoogle } from "../../services/authService";
import { toast } from "react-hot-toast";
import { FiMail, FiLock, FiLogIn } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginUser(email, password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (error) {
      toast.error(error.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      toast.success("Signed in with Google");
      navigate("/");
    } catch (error) {
      toast.error("Google sign-in failed");
    }
  };

  return (
    <div className="page-wrapper animate-in" style={{maxWidth: '440px', margin: '0 auto'}}>
      <div className="card">
        <h2 className="section-title" style={{textAlign: 'center', marginBottom: '8px'}}>Login</h2>

        <form onSubmit={handleLogin} className="grid-1" style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
          <div className="input-group">
            <label> Email Address</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="demouser@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label> Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="123456"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{justifyContent: 'center'}}>
            {loading ? "Signing in..." : <><FiLogIn /> Sign In</>}
          </button>
        </form>

        <div style={{margin: '24px 0', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)'}}>
          <div style={{flex: 1, height: '1px', background: 'var(--border)'}}></div>
          <span>OR</span>
          <div style={{flex: 1, height: '1px', background: 'var(--border)'}}></div>
        </div>

        <button onClick={handleGoogleLogin} className="btn btn-secondary btn-lg" style={{width: '100%', justifyContent: 'center', gap: '12px'}}>
          <FcGoogle size={20} /> Continue with Google
        </button>

        <p style={{marginTop: '32px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
          Don't have an account? <Link to="/register" style={{color: 'var(--accent-light)', fontWeight: '600'}}>Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
