import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Upload, X } from 'lucide-react';

const Report = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isFound = location.pathname.includes('found');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    location: '',
    date: '',
    contactInfo: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError('');
      
      let imageUrl = '';
      if (image) {
        const formData = new FormData();
        formData.append('file', image);
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      
        // Validate that cloud name and upload preset are configured
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
              
        if (!cloudName) {
          throw new Error('Cloudinary cloud name is not configured. Please check your .env file.');
        }
              
        if (!uploadPreset) {
          throw new Error('Cloudinary upload preset is not configured. Please check your .env file.');
        }
      
        const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        });
      
        const data = await uploadResponse.json();
              
        if (!uploadResponse.ok) {
          console.error('Cloudinary upload error:', data);
          throw new Error(data.error?.message || `Cloudinary upload failed with status ${uploadResponse.status}`);
        }
              
        imageUrl = data.secure_url;
        console.log('Image uploaded successfully:', imageUrl);
      }

      const itemData = {
        ...formData,
        type: isFound ? 'found' : 'lost',
        status: 'open',
        imageUrl,
        reporterId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'items'), itemData);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(`Error: ${err.message || 'Failed to submit report. Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-8" style={{ maxWidth: '800px' }}>
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <h2 className="mb-4">Report {isFound ? 'Found' : 'Lost'} Item</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Please provide as many details as possible to help {isFound ? 'the owner find it' : 'us locate it'}.
        </p>

        {error && <div className="mb-4 p-3" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)', borderRadius: 'var(--radius-md)' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Item Title</label>
            <input 
              type="text" 
              className="form-input" 
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g., Blue Hydroflask, iPhone 13"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                className="form-input"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Accessories">Accessories</option>
                <option value="Documents">Documents & IDs</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date {isFound ? 'Found' : 'Lost'}</label>
              <input 
                type="date" 
                className="form-input" 
                required
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <input 
              type="text" 
              className="form-input" 
              required
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="e.g., Library 2nd Floor"
            />
          </div>

          {isFound && (
            <div className="form-group">
              <label className="form-label">Contact Information</label>
              <input 
                type="text" 
                className="form-input" 
                required
                value={formData.contactInfo}
                onChange={(e) => setFormData({...formData, contactInfo: e.target.value})}
                placeholder="How should the owner contact you?"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="form-input" 
              rows="4"
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Provide specific details, marks, or identifying features..."
            ></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Upload Image</label>
            {!imagePreview ? (
              <label className="form-input flex justify-center items-center" style={{ borderStyle: 'dashed', cursor: 'pointer', padding: '2rem', flexDirection: 'column', gap: '1rem' }}>
                <Upload size={32} color="var(--text-secondary)" />
                <span style={{ color: 'var(--text-secondary)' }}>Click to upload an image</span>
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              </label>
            ) : (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: 'var(--radius-md)' }} />
                <button 
                  type="button" 
                  onClick={() => { setImage(null); setImagePreview(''); }}
                  style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.5)', color: 'white', padding: '0.3rem', borderRadius: '50%' }}
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading} style={{ padding: '0.8rem', fontSize: '1rem' }}>
            {loading ? 'Submitting...' : `Submit ${isFound ? 'Found' : 'Lost'} Report`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Report;
