import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { MapPin, Calendar, Tag, User as UserIcon, AlertCircle } from 'lucide-react';

const ItemDetail = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItemAndMatches = async () => {
      try {
        const docRef = doc(db, 'items', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const itemData = { id: docSnap.id, ...docSnap.data() };
          setItem(itemData);
          
          // Auto Match Logic
          // Find items of the OPPOSITE type with same category & similar location
          const oppositeType = itemData.type === 'lost' ? 'found' : 'lost';
          const matchQuery = query(
            collection(db, 'items'),
            where('type', '==', oppositeType),
            where('category', '==', itemData.category),
            where('status', 'in', ['open', 'verified'])
          );
          
          const matchSnap = await getDocs(matchQuery);
          const potentialMatches = matchSnap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(d => 
              // Simple text matching on title/location for demo purposes
              d.location.toLowerCase().includes(itemData.location.toLowerCase()) ||
              itemData.location.toLowerCase().includes(d.location.toLowerCase()) ||
              d.title.toLowerCase().includes(itemData.title.split(' ')[0].toLowerCase())
            )
            .slice(0, 3); // Top 3 matches
            
          setMatches(potentialMatches);
        }
      } catch (error) {
        console.error("Error fetching item:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchItemAndMatches();
  }, [id]);

  if (loading) return <div className="container mt-8 text-center text-secondary">Loading item details...</div>;
  if (!item) return <div className="container mt-8 text-center"><h2>Item not found</h2><Link to="/" className="btn btn-primary mt-4">Go Home</Link></div>;

  return (
    <div className="container mt-8">
      <Link to="/" className="btn btn-outline mb-8">&larr; Back to Feed</Link>
      
      <div className="glass-panel mb-8" style={{ overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: '0' }} className="item-detail-grid">
          {/* Image Section */}
          <div style={{ background: 'var(--bg-secondary)', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ color: 'var(--text-secondary)' }}>No image uploaded</div>
            )}
          </div>
          
          {/* Content Section */}
          <div style={{ padding: '3rem' }}>
            <div className="flex justify-between items-center mb-4">
              <span className={`badge ${item.type === 'lost' ? 'badge-lost' : 'badge-found'}`}>
                {item.type.toUpperCase()}
              </span>
              <span className={`badge ${item.status === 'open' ? 'badge-resolved' : 'badge-found'}`}>
                Status: {item.status.toUpperCase()}
              </span>
            </div>
            
            <h1 className="mb-2" style={{ fontSize: '2.5rem' }}>{item.title}</h1>
            
            <div className="flex gap-4 mb-6" style={{ color: 'var(--text-secondary)' }}>
              <div className="flex items-center" style={{ gap: '0.4rem' }}><Tag size={16} /> {item.category}</div>
              <div className="flex items-center" style={{ gap: '0.4rem' }}><Calendar size={16} /> {item.date}</div>
              <div className="flex items-center" style={{ gap: '0.4rem' }}><MapPin size={16} /> {item.location}</div>
            </div>
            
            <div className="mb-8">
              <h3 className="mb-2">Description</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>{item.description}</p>
            </div>

            {item.type === 'found' && item.contactInfo && (
              <div className="mb-8" style={{ padding: '1.5rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <h4 className="mb-2" style={{ color: 'var(--accent-primary)' }}>Contact Information</h4>
                <p>{item.contactInfo}</p>
              </div>
            )}

            <div className="flex items-center gap-4 pt-6" style={{ borderTop: '1px solid var(--border-color)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserIcon size={20} color="var(--text-secondary)" />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Reported by User ID</div>
                <div style={{ fontWeight: 500 }}>{item.reporterId.substring(0, 8)}...</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auto Match Suggestion */}
      {matches.length > 0 && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '4rem', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          <div className="flex items-center mb-4" style={{ gap: '0.8rem', color: 'var(--accent-warning)' }}>
            <AlertCircle size={24} />
            <h2>Potential {item.type === 'lost' ? 'Found' : 'Lost'} Matches</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>We found items that match the category and location of this {item.type} report.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {matches.map(match => (
              <a href={`/item/${match.id}`} key={match.id} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div className="font-semibold mb-1" style={{ fontSize: '1.1rem' }}>{match.title}</div>
                <div className="flex items-center justify-between" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <div className="flex items-center gap-1"><MapPin size={12}/> {match.location}</div>
                  <div>{match.date}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetail;
