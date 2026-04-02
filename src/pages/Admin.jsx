import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, updateDoc, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Trash2, CheckCircle, AlertTriangle, Users, Package, Eye, Edit, UserCheck, Ban, Search, X, Save } from 'lucide-react';

const Admin = () => {
  const { userData } = useAuth();
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('items'); // 'items' or 'users'
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchItems(),
        fetchUsers()
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const q = query(collection(db, 'items'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const itemsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(itemsList);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Item Operations
  const updateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'items', id), { status: newStatus });
      fetchItems();
      alert(`Item status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert('Failed to update status');
    }
  };

  const deleteItem = async (id) => {
    if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, 'items', id));
        fetchItems();
        alert('Item deleted successfully!');
      } catch (error) {
        console.error("Error deleting item:", error);
        alert('Failed to delete item');
      }
    }
  };

  const handleEditItem = (item) => {
    setEditingItem({ ...item });
  };

  const saveEditedItem = async () => {
    try {
      await updateDoc(doc(db, 'items', editingItem.id), {
        title: editingItem.title,
        description: editingItem.description,
        location: editingItem.location,
        category: editingItem.category
      });
      setEditingItem(null);
      fetchItems();
      alert('Item updated successfully!');
    } catch (error) {
      console.error("Error updating item:", error);
      alert('Failed to update item');
    }
  };

  // User Operations
  const updateUserRole = async (userId, newRole) => {
    if (window.confirm(`Change this user's role to ${newRole}?`)) {
      try {
        await updateDoc(doc(db, 'users', userId), { role: newRole });
        fetchUsers();
        alert(`User role updated to ${newRole}`);
      } catch (error) {
        console.error("Error updating user role:", error);
        alert('Failed to update user role');
      }
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'banned' : 'active';
    if (window.confirm(`This user will be ${newStatus}. Continue?`)) {
      try {
        await updateDoc(doc(db, 'users', userId), { status: newStatus });
        fetchUsers();
        alert(`User ${newStatus} successfully!`);
      } catch (error) {
        console.error("Error toggling user status:", error);
        alert('Failed to update user status');
      }
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm("Delete this user? This will also delete all their items. This cannot be undone.")) {
      try {
        const userItemsQuery = query(collection(db, 'items'));
        const userItemsSnapshot = await getDocs(userItemsQuery);
        const batch = writeBatch(db);
        
        userItemsSnapshot.forEach(docSnapshot => {
          if (docSnapshot.data().reporterId === userId) {
            batch.delete(doc(db, 'items', docSnapshot.id));
          }
        });
        
        batch.delete(doc(db, 'users', userId));
        await batch.commit();
        
        fetchUsers();
        alert('User and all their items deleted successfully!');
      } catch (error) {
        console.error("Error deleting user:", error);
        alert('Failed to delete user');
      }
    }
  };

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistics
  const totalItems = items.length;
  const resolvedItems = items.filter(i => i.status === 'resolved').length;
  const activeItems = totalItems - resolvedItems;
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const bannedUsers = users.filter(u => u.status === 'banned').length;

  if (loading) {
    return (
      <div className="container mt-8" style={{ textAlign: 'center', padding: '5rem' }}>
        <ShieldAlert size={48} color="var(--accent-warning)" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mt-8" style={{ paddingBottom: '5rem' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center" style={{ gap: '1rem' }}>
            <ShieldAlert size={40} color="var(--accent-warning)" />
            <div>
              <h1 style={{ fontSize: '2.5rem', color: 'var(--accent-warning)', marginBottom: '0.5rem' }}>Admin Dashboard</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Manage all users and content across the platform</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Logged in as</p>
            <p style={{ fontWeight: 600 }}>{userData?.displayName}</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-primary)' }}>
          <div className="flex items-center" style={{ gap: '1rem' }}>
            <Package size={32} color="var(--accent-primary)" />
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Items</p>
              <h3 style={{ fontSize: '2rem', margin: '0.25rem 0' }}>{totalItems}</h3>
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-success)' }}>
          <div className="flex items-center" style={{ gap: '1rem' }}>
            <CheckCircle size={32} color="var(--accent-success)" />
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Resolved</p>
              <h3 style={{ fontSize: '2rem', margin: '0.25rem 0' }}>{resolvedItems}</h3>
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-secondary)' }}>
          <div className="flex items-center" style={{ gap: '1rem' }}>
            <Users size={32} color="var(--accent-secondary)" />
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Users</p>
              <h3 style={{ fontSize: '2rem', margin: '0.25rem 0' }}>{totalUsers}</h3>
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #10B981' }}>
          <div className="flex items-center" style={{ gap: '1rem' }}>
            <UserCheck size={32} color="#10B981" />
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Active Users</p>
              <h3 style={{ fontSize: '2rem', margin: '0.25rem 0' }}>{activeUsers}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-panel" style={{ padding: '0.5rem', marginBottom: '2rem', display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('items')}
          style={{
            flex: 1,
            padding: '1rem 2rem',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'items' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'items' ? 'white' : 'var(--text-secondary)',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.3s'
          }}
        >
          <Package size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
          Manage Items ({totalItems})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            flex: 1,
            padding: '1rem 2rem',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'users' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'users' ? 'white' : 'var(--text-secondary)',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.3s'
          }}
        >
          <Users size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
          Manage Users ({totalUsers})
        </button>
      </div>

      {/* Content Area */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        
        {/* Items Tab */}
        {activeTab === 'items' && (
          <>
            <div className="flex justify-between items-center mb-6" style={{ gap: '1rem', flexWrap: 'wrap' }}>
              <h3>All Items</h3>
              <div style={{ position: 'relative', width: '300px' }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '3rem', borderRadius: '100px' }}
                />
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                <Package size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
                <p>No items found</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '1rem' }}>Item</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Reporter</th>
                      <th>Date</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{item.title}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.category}</div>
                        </td>
                        <td>
                          <span className={`badge ${item.type === 'lost' ? 'badge-lost' : 'badge-found'}`}>
                            {item.type.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <select
                            className="form-input"
                            style={{ padding: '0.4rem 0.8rem', width: 'auto', minWidth: '120px' }}
                            value={item.status}
                            onChange={(e) => updateStatus(item.id, e.target.value)}
                          >
                            <option value="open">Open</option>
                            <option value="verified">Verified</option>
                            <option value="suspicious">Suspicious</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </td>
                        <td style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                          {item.reporterId?.substring(0, 8)}...
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                          {item.createdAt?.toDate().toLocaleDateString() || item.date}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="flex" style={{ gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => handleEditItem(item)} className="btn btn-outline" style={{ padding: '0.4rem', color: 'var(--accent-secondary)', borderColor: 'var(--accent-secondary)' }} title="Edit">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => updateStatus(item.id, 'verified')} className="btn btn-outline" style={{ padding: '0.4rem', color: 'var(--accent-success)', borderColor: 'var(--accent-success)' }} title="Mark Verified">
                              <CheckCircle size={16} />
                            </button>
                            <button onClick={() => deleteItem(item.id)} className="btn btn-danger" style={{ padding: '0.4rem' }} title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <>
            <div className="flex justify-between items-center mb-6" style={{ gap: '1rem', flexWrap: 'wrap' }}>
              <h3>All Users</h3>
              <div style={{ position: 'relative', width: '300px' }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '3rem', borderRadius: '100px' }}
                />
              </div>
            </div>

            {filteredUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                <Users size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
                <p>No users found</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '1rem' }}>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '1rem' }}>
                          <div className="flex items-center" style={{ gap: '0.75rem' }}>
                            <img src={user.photoURL || 'https://via.placeholder.com/40'} alt={user.displayName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                            <div>
                              <div style={{ fontWeight: 600 }}>{user.displayName}</div>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>UID: {user.uid?.substring(0, 8)}...</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{user.email}</td>
                        <td>
                          <select
                            className="form-input"
                            style={{ padding: '0.4rem 0.8rem', width: 'auto', minWidth: '100px' }}
                            value={user.role}
                            onChange={(e) => updateUserRole(user.id, e.target.value)}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td>
                          <span className="badge" style={{
                            background: user.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: user.status === 'active' ? '#10B981' : '#EF4444',
                            border: `1px solid ${user.status === 'active' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                            padding: '0.3rem 0.8rem',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            fontWeight: 600
                          }}>
                            {user.status}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                          {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString() : 'N/A'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="flex" style={{ gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => toggleUserStatus(user.id, user.status)}
                              className={`btn ${user.status === 'active' ? 'btn-danger' : 'btn-primary'}`}
                              style={{ padding: '0.4rem' }}
                              title={user.status === 'active' ? 'Ban User' : 'Activate User'}
                            >
                              {user.status === 'active' ? <Ban size={16} /> : <UserCheck size={16} />}
                            </button>
                            <button onClick={() => deleteUser(user.id)} className="btn btn-danger" style={{ padding: '0.4rem' }} title="Delete User">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Item Modal */}
      {editingItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="glass-panel" style={{ padding: '2.5rem', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
            <div className="flex justify-between items-center mb-6">
              <h3>Edit Item</h3>
              <button onClick={() => setEditingItem(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-input"
                value={editingItem.title}
                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                rows="4"
                value={editingItem.description}
                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                className="form-input"
                value={editingItem.location}
                onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-input"
                value={editingItem.category}
                onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
              >
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Accessories">Accessories</option>
                <option value="Documents">Documents & IDs</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex gap-4 mt-6">
              <button onClick={saveEditedItem} className="btn btn-primary" style={{ flex: 1 }}>
                <Save size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                Save Changes
              </button>
              <button onClick={() => setEditingItem(null)} className="btn btn-outline" style={{ flex: 1 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
