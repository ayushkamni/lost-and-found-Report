import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { currentUser, userData, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="logo flex items-center" style={{ gap: '0.5rem' }}>
          <div style={{ background: 'var(--accent-primary)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
            <Search size={20} color="white" />
          </div>
          <h3>Campus L&F</h3>
        </Link>
        
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/report/lost" className="nav-link">Report Lost</Link>
          <Link to="/report/found" className="nav-link">Report Found</Link>
          
          {currentUser ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-warning)' }}>
                  <ShieldAlert size={16} /> Admin
                </Link>
              )}
              <Link to="/dashboard" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                <User size={18} />
                <span>{userData?.displayName?.split(' ')[0] || 'Dashboard'}</span>
              </Link>
              <button onClick={handleLogout} className="btn btn-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary">Login / Sign Up</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
