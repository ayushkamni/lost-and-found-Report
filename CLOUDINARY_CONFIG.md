# Cloudinary Configuration Guide

## Current Configuration Status ✅
Your Cloudinary credentials are configured in `.env.local`:
- **Cloud Name**: `drwffwmuf`
- **Upload Preset**: `lostandfound_unsigned`
- **API Key**: `848672933968824`

## Steps to Configure Unsigned Upload Preset

### 1. Log in to Cloudinary Dashboard
Go to: https://cloudinary.com/console

### 2. Create/Configure Upload Preset
1. Click on the **Settings** icon (gear icon) in the left sidebar
2. Go to **Upload** section
3. Scroll down to **Upload presets**
4. Click **Add upload preset** or find your existing preset `lostandfound_unsigned`

### 3. Configure as Unsigned Preset
Make sure these settings are correct:
- **Signing Mode**: Select **Unsigned** (This is critical!)
- **Preset name**: `lostandfound_unsigned` (must match .env.local exactly)
- **Folder**: (Optional) You can specify a folder like `lostandfound/items`
- **Allowed formats**: `jpg, jpeg, png, gif, webp` (or leave as default)
- **Max file size**: Set appropriate limit (e.g., 10MB = 10000000 bytes)

### 4. Save Changes
Click **Save** at the bottom of the page

### 5. Verify Configuration
After saving, verify in Cloudinary dashboard:
- Go to **Media Library**
- Try uploading an image manually to test
- Check that uploads are working

## Environment Variables

Your `.env.local` should have these exact values:

```env
# Cloudinary Variables
VITE_CLOUDINARY_CLOUD_NAME="drwffwmuf"
VITE_CLOUDINARY_UPLOAD_PRESET="lostandfound_unsigned"
CLOUDINARY_URL="cloudinary://848672933968824:Nx8RkNY9KEEzOckVXDqP4cXacds@drwffwmuf"
VITE_CLOUDINARY_API_KEY="848672933968824"
VITE_CLOUDINARY_API_SECRET="Nx8RkNY9KEEzOckVXDqP4cXacds"
```

## Common Issues & Solutions

### Issue: "Upload preset must be specified"
**Solution**: Make sure the upload preset name in your code matches exactly with what's in Cloudinary settings (case-sensitive!)

### Issue: "Invalid image file"
**Solution**: 
- Check file format is supported (jpg, png, etc.)
- Check file size doesn't exceed limit
- Verify you're using unsigned preset

### Issue: "Unauthorized" or "Invalid API Key"
**Solution**: 
- Verify API key and secret in Cloudinary dashboard
- Make sure CLOUDINARY_URL format is correct

### Issue: CORS Error
**Solution**: 
- In Cloudinary Settings > Upload > Upload presets
- Add your development URL to allowed origins
- For local dev: `http://localhost:5173` or `http://localhost:3000`

## Testing the Upload

After configuration, test by:
1. Running your dev server: `npm run dev`
2. Navigate to Report Lost/Found item page
3. Fill in the form and attach an image
4. Submit and check browser console for success message
5. Verify image appears in Cloudinary Media Library

## Security Notes

⚠️ **IMPORTANT**: 
- Never commit `.env.local` to Git (it's already in .gitignore ✅)
- Unsigned presets are public - use them only for client-side uploads
- Set appropriate limits on file size and formats
- For production, consider using signed uploads with server-side authentication

## Troubleshooting Commands

Check if environment variables are loaded correctly:
```javascript
// Add this temporarily in your component to debug
console.log('Cloud Name:', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
console.log('Upload Preset:', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
```

Restart dev server after changing .env file:
```bash
# Stop the current dev server (Ctrl+C)
# Then restart
npm run dev
```
