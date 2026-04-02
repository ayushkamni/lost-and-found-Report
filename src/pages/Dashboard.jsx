import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Trash2, CheckCircle, Package, Activity, Inbox, Calendar, SearchX, Eye, Camera } from 'lucide-react';

const Dashboard = () => {
  const { userData, currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchMyItems();
    }
  }, [currentUser]);

  const fetchMyItems = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'items'), 
        where('reporterId', '==', currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const itemsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort in memory as composite index is required for where + orderBy
      itemsList.sort((a,b) => b.createdAt?.toDate() - a.createdAt?.toDate());
      setItems(itemsList);
    } catch (error) {
      console.error("Error fetching my items:", error);
    } finally {
      setLoading(false);
    }
  };

  const markResolved = async (id) => {
    try {
      await updateDoc(doc(db, 'items', id), { status: 'resolved' });
      fetchMyItems(); // Refresh items
    } catch (error) {
      console.error("Error marking as resolved:", error);
    }
  };

  const deleteItem = async (id) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deleteDoc(doc(db, 'items', id));
        fetchMyItems(); // Refresh items
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUser) return;

    try {
      setUploadingPhoto(true);
      
      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );

      const data = await uploadResponse.json();
      
      if (!uploadResponse.ok) {
        throw new Error(data.error?.message || 'Upload failed');
      }

      // Update user profile in Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        photoURL: data.secure_url
      });

      alert('Profile picture updated successfully!');
    } catch (error) {
      console.error('Photo upload error:', error);
      alert('Failed to update profile picture. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const filteredItems = items.filter(item => filter === 'all' || item.type === filter);
  
  // Calculate Statistics
  const totalItems = items.length;
  const resolvedItems = items.filter(i => i.status === 'resolved').length;
  const activeItems = totalItems - resolvedItems;

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="container mt-8" style={{ paddingBottom: '5rem' }}>
      
      {/* Welcome Hero Section */}
      <div className="glass-panel" style={{ 
          padding: '2.5rem 3rem', 
          marginBottom: '2.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '2.5rem',
          background: 'linear-gradient(135deg, rgba(17, 21, 32, 0.95) 0%, rgba(99, 102, 241, 0.1) 100%)',
          borderLeft: '4px solid var(--accent-primary)',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 'var(--radius-xl)'
        }}>
        
        {/* Background glow decoration */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '400px',
          height: '400px',
          background: 'var(--accent-primary)',
          filter: 'blur(120px)',
          opacity: 0.15,
          borderRadius: '50%',
          pointerEvents: 'none'
        }}></div>

        <div style={{ position: 'relative' }}>
          <img 
            src={userData?.photoURL || 'https://via.placeholder.com/100'} 
            alt="Profile" 
            style={{ 
              width: '110px', 
              height: '110px', 
              borderRadius: '50%', 
              objectFit: 'cover', 
              background: 'var(--bg-secondary)',
              border: '4px solid var(--bg-primary)',
              boxShadow: uploadingPhoto ? '0 0 20px rgba(16, 185, 129, 0.8)' : '0 0 20px rgba(99, 102, 241, 0.5)'
            }} 
          />
          <label
            title="Change Profile Picture"
            style={{
              position: 'absolute',
              bottom: '5px',
              right: '5px',
              width: '32px',
              height: '32px',
              background: 'var(--accent-primary)',
              borderRadius: '50%',
              border: '3px solid var(--bg-primary)',
              boxShadow: '0 0 10px rgba(99, 102, 241, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
              opacity: uploadingPhoto ? 0.7 : 1,
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              if (!uploadingPhoto) {
                e.currentTarget.style.background = 'var(--accent-hover)';
                e.currentTarget.style.transform = 'scale(1.1)';
              }
            }}
            onMouseOut={(e) => {
              if (!uploadingPhoto) {
                e.currentTarget.style.background = 'var(--accent-primary)';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            {uploadingPhoto ? (
              <div style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            ) : (
              <Camera size={16} color="white" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={uploadingPhoto}
              style={{ display: 'none' }}
            />
          </label>
          <div style={{
            position: 'absolute',
            bottom: '5px',
            right: '5px',
            width: '24px',
            height: '24px',
            background: 'var(--accent-success)',
            borderRadius: '50%',
            border: '4px solid var(--bg-primary)',
            boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
          }}></div>
        </div>
        
        <div style={{ zIndex: 1 }}>
          <p style={{ color: 'var(--accent-primary)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            {greeting}
          </p>
          <h1 style={{ marginBottom: '0.5rem', fontSize: '2.5rem', letterSpacing: '-0.02em' }}>
            {userData?.displayName?.split(' ')[0]} <span style={{ fontWeight: 300, color: 'var(--text-secondary)' }}>{userData?.displayName?.split(' ').slice(1).join(' ')}</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
            <Inbox size={16} /> {userData?.email}
          </p>
        </div>
      </div>

      {/* Statistics Row */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '1.5rem', 
        marginBottom: '4rem' 
      }}>
         <div className="card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'var(--accent-primary)', filter: 'blur(50px)', opacity: 0.1 }}></div>
            <div style={{ padding: '1.25rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: 'var(--radius-lg)', color: 'var(--accent-primary)' }}>
              <Package size={32} />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>Total Posts</p>
              <h3 style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}>{totalItems}</h3>
            </div>
         </div>
         <div className="card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'var(--accent-warning)', filter: 'blur(50px)', opacity: 0.1 }}></div>
            <div style={{ padding: '1.25rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-lg)', color: 'var(--accent-warning)' }}>
              <Activity size={32} />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>Active Listings</p>
              <h3 style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}>{activeItems}</h3>
            </div>
         </div>
         <div className="card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'var(--accent-success)', filter: 'blur(50px)', opacity: 0.1 }}></div>
            <div style={{ padding: '1.25rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-lg)', color: 'var(--accent-success)' }}>
              <CheckCircle size={32} />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>Resolved</p>
              <h3 style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}>{resolvedItems}</h3>
            </div>
         </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <h3 style={{ fontSize: '1.8rem' }}>Your Activity</h3>
        <div style={{ display: 'flex', background: 'var(--bg-tertiary)', padding: '0.35rem', borderRadius: '100px', border: '1px solid var(--border-color)' }}>
          <button onClick={() => setFilter('all')} style={{ padding: '0.5rem 1.5rem', borderRadius: '100px', transition: 'all 0.3s', background: filter === 'all' ? 'var(--bg-primary)' : 'transparent', color: filter === 'all' ? 'white' : 'var(--text-secondary)', fontWeight: 500, boxShadow: filter === 'all' ? '0 2px 10px rgba(0,0,0,0.2)' : 'none' }}>All</button>
          <button onClick={() => setFilter('lost')} style={{ padding: '0.5rem 1.5rem', borderRadius: '100px', transition: 'all 0.3s', background: filter === 'lost' ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(244, 63, 94, 0.05))' : 'transparent', color: filter === 'lost' ? '#FFA5B4' : 'var(--text-secondary)', fontWeight: 500 }}>Lost</button>
          <button onClick={() => setFilter('found')} style={{ padding: '0.5rem 1.5rem', borderRadius: '100px', transition: 'all 0.3s', background: filter === 'found' ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))' : 'transparent', color: filter === 'found' ? '#86EFAC' : 'var(--text-secondary)', fontWeight: 500 }}>Found</button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
             {[1,2,3].map(n => (
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {filteredItems.map(item => (
            <div key={item.id} className="glass-panel" style={{ 
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
              <div style={{ height: '220px', background: 'var(--bg-tertiary)', width: '100%', position: 'relative', overflow: 'hidden' }}>
                {item.imageUrl ? (
                   <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                   <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', background: 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%)' }}>
                     <Inbox size={32} opacity={0.3} />
                   </div>
                )}
                
                <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem', display: 'flex', gap: '0.5rem' }}>
                  <span className={`badge ${item.type === 'lost' ? 'badge-lost' : 'badge-found'}`} style={{ backdropFilter: 'blur(12px)', padding: '0.4rem 1rem', fontSize: '0.7rem' }}>
                    <span className="status-dot" style={{ background: item.type === 'lost' ? '#F43F5E' : '#10B981' }}></span>
                    {item.type.toUpperCase()}
                  </span>
                  <span className="badge" style={{
                    background: item.status==='resolved'?'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(6, 182, 212, 0.05))':'var(--bg-glass)', 
                    color: item.status==='resolved'?'#67E8F9':'var(--text-secondary)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    fontSize: '0.7rem'
                  }}>
                    {item.status === 'resolved' ? 'RESOLVED' : 'ACTIVE'}
                  </span>
                </div>
              </div>
              
              <div style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <h4 className="mb-2" style={{ fontSize: '1.3rem', fontWeight: 700 }}>{item.title}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1, lineHeight: 1.5 }}>
                  {item.description}
                </p>

                {item.createdAt && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <Calendar size={14} /> 
                    <span>Reported {item.createdAt.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric'})}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center" style={{ padding: '1.25rem 1.5rem', background: 'var(--bg-tertiary)', borderTop: '1px solid var(--border-color)' }}>
                <Link to={`/item/${item.id}`} className="btn-outline flex items-center gap-2" style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                  <Eye size={16} /> View
                </Link>
                
                <div className="flex gap-2">
                  {item.status !== 'resolved' && (
                    <button onClick={() => markResolved(item.id)} className="btn-outline flex items-center justify-center" style={{ padding: '0.5rem', width: '36px', height: '36px', color: '#10B981', borderColor: 'rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.05)' }} title="Mark as Resolved">
                      <CheckCircle size={18} />
                    </button>
                  )}
                  <button onClick={() => deleteItem(item.id)} className="btn-danger flex items-center justify-center" style={{ padding: '0.5rem', width: '36px', height: '36px', borderRadius: 'var(--radius-md)' }} title="Delete Post">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="card" style={{ padding: '5rem 2rem', textAlign: 'center', gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', borderStyle: 'dashed', background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
                <SearchX size={32} />
              </div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>No Items Found</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 2.5rem auto', lineHeight: 1.6 }}>
                {filter === 'all' 
                  ? "You haven't reported any lost or found items yet. Report an item to easily track it here." 
                  : `You don't have any items matching the '${filter}' filter at the moment.`}
              </p>
              <div className="flex justify-center gap-4">
                <Link to="/report/lost" className="btn-primary">Report Lost</Link>
                <Link to="/report/found" className="btn-outline" style={{ background: 'var(--bg-tertiary)' }}>Report Found</Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
