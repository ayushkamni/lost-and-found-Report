import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, ArrowRight, Sparkles, ShieldCheck, Zap, HeartHandshake } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false); // Changed to false - no loading state for guests
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch items for all users (guests can see items too)
    const fetchItems = async () => {
      try {
        const q = query(collection(db, 'items'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        // Only show items that are not suspicious or resolved
        const fetchedItems = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(item => item.status !== 'suspicious' && item.status !== 'resolved');
        setItems(fetchedItems);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // If user is a guest, render the Marketing Landing Page
  if (!currentUser) {
    return (
      <div className="container mt-8" style={{ paddingBottom: '5rem' }}>
        {/* Hero Section */}
        <div className="glass-panel" style={{ 
            padding: '5rem 2rem', 
            textAlign: 'center', 
            marginBottom: '4rem', 
            position: 'relative', 
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
          
          {/* Animated Background Orbs */}
          <div style={{ position: 'absolute', top: '-30%', left: '10%', width: '300px', height: '300px', background: 'var(--accent-primary)', filter: 'blur(100px)', opacity: 0.15, borderRadius: '50%', animation: 'pulse-glow 8s ease-in-out infinite alternate' }}></div>
          <div style={{ position: 'absolute', bottom: '-30%', right: '10%', width: '300px', height: '300px', background: 'var(--accent-tertiary)', filter: 'blur(100px)', opacity: 0.15, borderRadius: '50%', animation: 'pulse-glow 10s ease-in-out infinite alternate-reverse' }}></div>
          
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
            <div className="mb-4" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, letterSpacing: '0.5px' }}>
              <Sparkles size={14} color="var(--accent-secondary)" /> 
              <span>Premier Campus Network</span>
            </div>
            
            <h1 className="gradient-text mb-4" style={{ fontSize: 'clamp(3.5rem, 8vw, 5rem)', letterSpacing: '-0.03em', lineHeight: 1.1, paddingBottom: '0.2rem' }}>
              Every Lost Item Has a Story.
            </h1>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto', marginBottom: '3.5rem', fontWeight: 300, lineHeight: 1.6 }}>
              Join the smartest platform to recover lost belongings on campus. Faster matches, verified students, and a community that cares.
            </p>
            
            <div className="flex justify-center" style={{ gap: '1.5rem', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                Join Now to Browse
              </button>
              <button onClick={() => navigate('/login')} className="btn btn-outline" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', background: 'var(--bg-tertiary)' }}>
                Report an Item
              </button>
            </div>
          </div>
        </div>

        {/* Feature Section */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Why Students Love Us</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.1rem' }}>The most trusted lost and found system across campus.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            
            <div className="card" style={{ padding: '2.5rem 2rem', textAlign: 'center', transition: 'transform 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: 'var(--accent-primary)' }}>
                <Zap size={32} />
              </div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Lightning Fast</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Report an item in seconds. Our smart feed instantly notifies students who might be looking for exactly what you've found.
              </p>
            </div>

            <div className="card" style={{ padding: '2.5rem 2rem', textAlign: 'center', transition: 'transform 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: 'var(--accent-success)' }}>
                <ShieldCheck size={32} />
              </div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Secure & Verified</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Items are only visible to verified students who have logged into the platform, ensuring zero spam and higher return rates.
              </p>
            </div>

            <div className="card" style={{ padding: '2.5rem 2rem', textAlign: 'center', transition: 'transform 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: 'var(--accent-danger)' }}>
                <HeartHandshake size={32} />
              </div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Community Driven</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Built for students, by students. Connect safely on campus to hand back items and keep our community strong.
              </p>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // If user IS logged in, render the standard feed layout
  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="container mt-8">
      {/* Feed Hero Section */}
      <div className="glass-panel" style={{ 
          padding: '3rem 2rem', 
          textAlign: 'center', 
          marginBottom: '3rem', 
          position: 'relative', 
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        
        <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '50%', height: '200%', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 60%)', filter: 'blur(40px)', zIndex: 0 }}></div>
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
          <h1 className="gradient-text mb-4" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', letterSpacing: '-0.02em' }}>
            Campus Item Feed
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', marginBottom: '2rem' }}>
            Browse the latest lost and found reports submitted by verified students.
          </p>
          
          <div className="flex justify-center" style={{ gap: '1rem', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/report/lost')} className="btn btn-primary">Report Lost Item</button>
            <button onClick={() => navigate('/report/found')} className="btn btn-outline" style={{ background: 'var(--bg-tertiary)' }}>Report Found Item</button>
          </div>
        </div>
      </div>
      
      {/* Browse Section Tools */}
      <div className="flex justify-between items-center mb-6" style={{ flexWrap: 'wrap', gap: '1.5rem' }}>
        <h2 style={{ fontSize: '1.8rem' }}>Recent Items</h2>
        
        <div className="flex" style={{ gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search items..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '3rem', width: '280px', borderRadius: '100px' }}
            />
          </div>
          <div className="flex" style={{ background: 'var(--bg-tertiary)', borderRadius: '100px', padding: '0.35rem', border: '1px solid var(--border-color)' }}>
            <button onClick={() => setFilterType('all')} className={`btn ${filterType === 'all' ? 'btn-primary' : ''}`} style={{ padding: '0.5rem 1.2rem', background: filterType === 'all' ? 'var(--bg-primary)' : 'transparent', color: filterType === 'all' ? 'white' : 'var(--text-secondary)', boxShadow: filterType === 'all' ? '0 2px 10px rgba(0,0,0,0.2)' : 'none', border: 'none', borderRadius: '100px' }}>All</button>
            <button onClick={() => setFilterType('lost')} className={`btn ${filterType === 'lost' ? 'btn-primary' : ''}`} style={{ padding: '0.5rem 1.2rem', background: filterType === 'lost' ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(244, 63, 94, 0.05))' : 'transparent', color: filterType === 'lost' ? '#FFA5B4' : 'var(--text-secondary)', boxShadow: 'none', border: filterType === 'lost' ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid transparent', borderRadius: '100px' }}>Lost</button>
            <button onClick={() => setFilterType('found')} className={`btn ${filterType === 'found' ? 'btn-primary' : ''}`} style={{ padding: '0.5rem 1.2rem', background: filterType === 'found' ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))' : 'transparent', color: filterType === 'found' ? '#86EFAC' : 'var(--text-secondary)', boxShadow: 'none', border: filterType === 'found' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent', borderRadius: '100px' }}>Found</button>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
             {[1,2,3,4,5,6].map(n => (
               <div key={n} className="glass-panel" style={{ padding: '0', height: '420px', display: 'flex', flexDirection: 'column', animation: 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                  <div style={{ height: '240px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}></div>
                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ width: '60%', height: '28px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
                    <div style={{ width: '100%', height: '44px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}></div>
                    <div style={{ width: '100%', height: '1px', background: 'var(--border-color)', marginTop: 'auto' }}></div>
                    <div style={{ width: '40%', height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
                  </div>
               </div>
             ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem', marginBottom: '5rem' }}>
          {filteredItems.map(item => (
            <Link to={`/item/${item.id}`} key={item.id} className="glass-panel" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              overflow: 'hidden', 
              padding: 0,
              height: '100%',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px)';
              e.currentTarget.style.boxShadow = '0 20px 40px -15px rgba(0, 0, 0, 0.6), 0 0 15px rgba(99, 102, 241, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'var(--glass-shadow)';
              e.currentTarget.style.borderColor = 'var(--glass-border)';
            }}
            >
              <div style={{ height: '240px', background: 'var(--bg-tertiary)', width: '100%', position: 'relative', overflow: 'hidden' }}>
                {item.imageUrl ? (
                   <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                   />
                ) : (
                   <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', background: 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%)' }}>
                     <Sparkles size={32} opacity={0.3} />
                   </div>
                )}
                
                {/* Visual Gradient Overlay */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, rgba(9, 11, 16, 0.8) 0%, transparent 100%)', pointerEvents: 'none' }}></div>
                
                <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem' }}>
                  <span className={`badge ${item.type === 'lost' ? 'badge-lost' : 'badge-found'}`} style={{ 
                    backdropFilter: 'blur(12px)', 
                    padding: '0.4rem 1rem', 
                    fontSize: '0.7rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <span className="status-dot" style={{ background: item.type === 'lost' ? '#F43F5E' : '#10B981', boxShadow: `0 0 8px ${item.type === 'lost' ? '#F43F5E' : '#10B981'}` }}></span>
                    {item.type.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div style={{ padding: '1.75rem', flexGrow: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <h3 className="mb-3" style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.01em' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.6, fontWeight: 300 }}>
                  {item.description}
                </p>
                
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.03)', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <MapPin size={14} color="var(--accent-primary)" /> {item.location}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.03)', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <Calendar size={14} color="var(--accent-secondary)" /> {item.date}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between" style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Verified Student</span>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      color: 'var(--accent-primary)', 
                      fontWeight: 600, 
                      fontSize: '0.9rem',
                      transition: 'gap 0.3s ease'
                    }} 
                    className="details-link"
                    >
                       View Details <ArrowRight size={18} />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {filteredItems.length === 0 && (
            <div className="glass-panel" style={{ padding: '5rem 2rem', textAlign: 'center', gridColumn: '1 / -1', borderStyle: 'dashed', background: 'rgba(255,255,255,0.01)' }}>
              <Search size={48} color="var(--text-muted)" style={{ margin: '0 auto 1.5rem auto', opacity: 0.5 }} />
              <h3 style={{ marginBottom: '0.5rem' }}>No Items Found</h3>
              <p style={{ color: 'var(--text-secondary)' }}>We couldn't find any missing items matching your current filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
