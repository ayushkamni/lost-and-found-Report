import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const DebugPanel = () => {
  const [debugInfo, setDebugInfo] = useState({
    firebaseInitialized: false,
    currentUser: null,
    userData: null,
    errors: []
  });

  useEffect(() => {
    try {
      // Check if Firebase is initialized
      setDebugInfo(prev => ({ ...prev, firebaseInitialized: !!auth && !!db }));

      // Listen to auth changes
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setDebugInfo(prev => ({ ...prev, currentUser: user ? {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        } : null }));

        if (user) {
          try {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            setDebugInfo(prev => ({ 
              ...prev, 
              userData: userSnap.exists() ? userSnap.data() : 'Not found in Firestore'
            }));
          } catch (error) {
            setDebugInfo(prev => ({ 
              ...prev, 
              errors: [...prev.errors, `Firestore Error: ${error.message}`]
            }));
          }
        }
      });

      return () => unsubscribe();
    } catch (error) {
      setDebugInfo(prev => ({ 
        ...prev, 
        errors: [...prev.errors, `Init Error: ${error.message}`]
      }));
    }
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.9)',
      border: '2px solid #FF4757',
      borderRadius: '12px',
      padding: '20px',
      maxWidth: '400px',
      maxHeight: '300px',
      overflow: 'auto',
      color: '#fff',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#FF4757' }}>🔍 DEBUG PANEL</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Firebase Init:</strong> {debugInfo.firebaseInitialized ? '✅ YES' : '❌ NO'}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Current User:</strong> {debugInfo.currentUser ? '✅ Logged In' : '❌ Guest'}
        {debugInfo.currentUser && (
          <pre style={{ 
            background: 'rgba(255,255,255,0.1)', 
            padding: '8px', 
            borderRadius: '4px',
            marginTop: '5px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {JSON.stringify(debugInfo.currentUser, null, 2)}
          </pre>
        )}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>User Data:</strong>
        <pre style={{ 
          background: 'rgba(255,255,255,0.1)', 
          padding: '8px', 
          borderRadius: '4px',
          marginTop: '5px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          {JSON.stringify(debugInfo.userData, null, 2)}
        </pre>
      </div>
      
      {debugInfo.errors.length > 0 && (
        <div>
          <strong style={{ color: '#FF4757' }}>Errors:</strong>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            {debugInfo.errors.map((err, i) => (
              <li key={i} style={{ color: '#FF6B81' }}>{err}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
