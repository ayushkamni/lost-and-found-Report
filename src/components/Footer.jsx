import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Globe, Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-color)',
      padding: '4rem 0 2rem 0',
      marginTop: 'auto'
    }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
        
        {/* Brand */}
        <div>
          <Link to="/" className="flex items-center mb-4" style={{ gap: '0.5rem', display: 'inline-flex', textDecoration: 'none' }}>
            <div style={{ background: 'var(--accent-primary)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
              <Search size={20} color="white" />
            </div>
            <h3 style={{ margin: 0 }}>Campus L&F</h3>
          </Link>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem', maxWidth: '300px' }}>
            The premier student network for returning lost belongings. Empowering our campus community to stay connected safely.
          </p>
          <div className="flex" style={{ gap: '1rem' }}>
            <a href="#" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}><Globe size={20} /></a>
            <a href="#" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-secondary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}><Mail size={20} /></a>
            <a href="#" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#0e76a8'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}><Phone size={20} /></a>
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Platform Check</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <li><Link to="/" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'var(--accent-primary)'} onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}>Home / Browse</Link></li>
            <li><Link to="/report/lost" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'var(--accent-primary)'} onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}>Report Lost Item</Link></li>
            <li><Link to="/report/found" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'var(--accent-primary)'} onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}>Report Found Item</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Legal Information</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <li><a href="#" style={{ color: 'var(--text-secondary)' }}>Privacy Policy</a></li>
            <li><a href="#" style={{ color: 'var(--text-secondary)' }}>Terms of Service</a></li>
            <li><a href="#" style={{ color: 'var(--text-secondary)' }}>Community Guidelines</a></li>
          </ul>
        </div>

      </div>

      <div className="container" style={{ textAlign: 'center', paddingTop: '2.5rem', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        <p>&copy; {new Date().getFullYear()} Campus Connect L&F. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
