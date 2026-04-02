import { useState } from 'react';

/**
 * Custom hook for testing Cloudinary configuration
 * Usage: Add this temporarily to any component to debug Cloudinary issues
 */
export const useCloudinaryTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const testConfiguration = () => {
    setTesting(true);
    const results = {
      cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
      uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
      apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY ? 'Configured' : 'Missing',
      apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET ? 'Configured' : 'Missing',
    };

    console.group('Cloudinary Configuration Test');
    console.log('Cloud Name:', results.cloudName);
    console.log('Upload Preset:', results.uploadPreset);
    console.log('API Key Status:', results.apiKey);
    console.log('API Secret Status:', results.apiSecret);
    console.groupEnd();

    setTestResult(results);
    setTesting(false);
    
    return results;
  };

  const testUpload = async (file) => {
    if (!file) {
      console.error('No file provided for test upload');
      return null;
    }

    setTesting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

      console.log('Testing upload with:', { cloudName, uploadPreset });

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await uploadResponse.json();

      if (!uploadResponse.ok) {
        console.error('Upload failed:', data);
        setTestResult({ 
          success: false, 
          error: data.error?.message || 'Upload failed',
          status: uploadResponse.status 
        });
        setTesting(false);
        return null;
      }

      console.log('✅ Upload successful!', data.secure_url);
      setTestResult({ 
        success: true, 
        url: data.secure_url,
        publicId: data.public_id,
        format: data.format,
        bytes: data.bytes
      });
      setTesting(false);
      return data;
    } catch (error) {
      console.error('Upload error:', error);
      setTestResult({ success: false, error: error.message });
      setTesting(false);
      return null;
    }
  };

  return { testConfiguration, testUpload, testResult, testing };
};

/**
 * Simple test component - drop this into any page to test Cloudinary
 * Example usage in Report.jsx or any other component:
 * 
 * import { CloudinaryTestWidget } from './utils/testCloudinary';
 * 
 * // Then in your JSX:
 * <CloudinaryTestWidget />
 */
export const CloudinaryTestWidget = () => {
  const { testConfiguration, testUpload, testResult, testing } = useCloudinaryTest();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      testUpload(file);
    }
  };

  return (
    <div style={{
      padding: '1rem',
      margin: '1rem 0',
      border: '2px solid #4CAF50',
      borderRadius: '8px',
      background: '#f0fff0'
    }}>
      <h3 style={{ margin: '0 0 1rem 0' }}>🧪 Cloudinary Test Widget</h3>
      
      <div style={{ marginBottom: '1rem' }}>
        <button 
          onClick={testConfiguration}
          disabled={testing}
          style={{
            padding: '0.5rem 1rem',
            marginRight: '0.5rem',
            background: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: testing ? 'not-allowed' : 'pointer'
          }}
        >
          {testing ? 'Testing...' : 'Test Configuration'}
        </button>
        
        <label style={{
          display: 'inline-block',
          padding: '0.5rem 1rem',
          background: '#4CAF50',
          color: 'white',
          borderRadius: '4px',
          cursor: testing ? 'not-allowed' : 'pointer'
        }}>
          Test Upload
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={testing}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {testResult && (
        <div style={{
          padding: '0.5rem',
          background: 'white',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '0.875rem'
        }}>
          <strong>Result:</strong>
          <pre style={{ margin: '0.5rem 0', overflow: 'auto' }}>
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
