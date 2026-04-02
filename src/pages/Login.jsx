import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User } from 'lucide-react';

const Login = () => {
  const { loginWithGoogle, loginWithEmail, signupWithEmail, currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto redirect if already logged in
  React.useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (isSignup && !formData.name.trim()) return "Name is required";
    if (!formData.email.trim()) return "Email is required";
    if (formData.password.length < 6) return "Password must be at least 6 characters";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError('');
      setLoading(true);
      if (isSignup) {
        await signupWithEmail(formData.email, formData.password, formData.name);
      } else {
        await loginWithEmail(formData.email, formData.password);
      }
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use. Please log in.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else {
        setError(err.message || 'An error occurred during authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to log in with Google.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError('');
    setFormData({ name: '', email: '', password: '' });
  };

  return (
    <div className="container flex justify-center items-center" style={{ minHeight: '80vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}>
        <div className="text-center mb-6">
          <h2 className="mb-2" style={{ fontSize: '1.8rem' }}>{isSignup ? 'Create Account' : 'Welcome Back'}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            {isSignup ? "Sign up to track and report items on campus." : "Sign in to your account."}
          </p>
        </div>
        
        {error && (
          <div className="mb-4" style={{ padding: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <div className="form-group mb-4" style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                name="name"
                placeholder="Full Name" 
                required 
                value={formData.name}
                onChange={handleInputChange}
                className="form-input" 
                style={{ paddingLeft: '2.8rem' }}
              />
            </div>
          )}

          <div className="form-group mb-4" style={{ position: 'relative' }}>
             <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
             <input 
                type="email" 
                name="email"
                placeholder="Email Address" 
                required 
                value={formData.email}
                onChange={handleInputChange}
                className="form-input" 
                style={{ paddingLeft: '2.8rem' }}
              />
          </div>

          <div className="form-group mb-6" style={{ position: 'relative' }}>
             <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
             <input 
                type="password" 
                name="password"
                placeholder="Password (min. 6 chars)" 
                required 
                value={formData.password}
                onChange={handleInputChange}
                className="form-input" 
                style={{ paddingLeft: '2.8rem' }}
              />
          </div>

          <button 
            type="submit" 
            className="btn w-full mb-4 flex justify-center items-center" 
            disabled={loading}
            style={{ 
              padding: '0.9rem', 
              fontSize: '1rem', 
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', 
              color: 'white', 
              boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)',
              opacity: loading ? 0.7 : 1,
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Processing...' : (isSignup ? 'Sign Up' : 'Log In')}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', color: 'var(--text-secondary)' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          <span style={{ margin: '0 1rem', fontSize: '0.85rem' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
        </div>

        <button 
          onClick={handleGoogleLogin} 
          disabled={loading}
          className="btn btn-outline w-full flex justify-center items-center gap-3" 
          style={{ padding: '0.8rem', fontSize: '0.95rem' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={loading ? "var(--text-secondary)" : "var(--accent-primary)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="4"></circle>
            <line x1="21.17" y1="8" x2="12" y2="8"></line>
            <line x1="3.95" y1="6.06" x2="8.54" y2="14"></line>
            <line x1="10.88" y1="21.94" x2="15.46" y2="14"></line>
          </svg>
          Continue with Google
        </button>

        <p className="mt-6 text-center" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {isSignup ? "Already have an account?" : "Don't have an account?"}
          <button 
            type="button" 
            onClick={toggleMode} 
            disabled={loading}
            style={{ color: 'var(--accent-primary)', fontWeight: 500, marginLeft: '0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {isSignup ? "Log In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
