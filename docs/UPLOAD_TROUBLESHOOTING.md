# Upload Functionality Issues in Production - Diagnostic Overview

## Current Upload Architecture

### Storage Solution: Linode Object Storage (S3-Compatible)
The application uses Linode Object Storage as the file storage backend, accessed via AWS S3 SDK.

### Key Configuration (from `src/utils/s3.ts`)
```typescript
LINODE_REGION="ap-south-1"
LINODE_ENDPOINT="https://edmark-dev.in-maa-1.linodeobjects.com"
LINODE_ACCESS_KEY="N2J0YC3ECD7YAWK4YLIA"
LINODE_SECRET_KEY="hKpg5429VZunrurpT8U8JeBQp0OIf8qYDM05T83O"
LINODE_BUCKET="edmark-dev"
```

## Common Reasons Why Uploads Fail in Production

### 1. **Missing Environment Variables** ⚠️ MOST COMMON
**Symptom**: Application throws error on startup or when attempting upload
**Root Cause**: The S3 configuration validates ALL required env vars on module load (lines 11-23 in `s3.ts`)

```typescript
if (!REGION || !ENDPOINT || !ACCESS_KEY || !SECRET_KEY || !BUCKET) {
  throw new Error('S3 configuration incomplete...');
}
```

**Solution**:
- Verify ALL five environment variables are set in production:
  - `LINODE_REGION`
  - `LINODE_ENDPOINT`
  - `LINODE_ACCESS_KEY`
  - `LINODE_SECRET_KEY`
  - `LINODE_BUCKET`
- Check production logs for the initialization message: `✅ S3 Client initialized successfully`

---

### 2. **Incorrect Environment Variable Values**
**Symptoms**:
- 403 Forbidden errors
- "Access Denied" messages
- "NoSuchBucket" errors

**Common Issues**:
- **Wrong credentials**: Access key or secret key is incorrect
- **Wrong bucket name**: Bucket doesn't exist or name is misspelled
- **Wrong region/endpoint**: Endpoint URL doesn't match the bucket's actual location
- **Bucket not public**: ACL permissions issue

**Solution**:
```bash
# Test credentials locally first
# Verify bucket exists and is accessible
# Check that bucket has proper CORS configuration for web uploads
```

---

### 3. **CORS Configuration Issues** 🌐
**Symptom**: Uploads work in development but fail in production with CORS errors

**Root Cause**: Linode Object Storage bucket doesn't have CORS rules allowing your production domain

**Required CORS Configuration on Linode Bucket**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
  <CORSRule>
    <AllowedOrigin>https://your-production-domain.com</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedMethod>PUT</AllowedMethod>
    <AllowedMethod>POST</AllowedMethod>
    <AllowedMethod>DELETE</AllowedMethod>
    <AllowedHeader>*</AllowedHeader>
    <MaxAgeSeconds>3000</MaxAgeSeconds>
  </CORSRule>
</CORSConfiguration>
```

**Solution**: Configure CORS rules in Linode Object Storage console for your production domain

---

### 4. **File Size Limits Exceeded**
**Symptoms**: Large files fail to upload, small files work fine

**Current Limits** (from `s3.ts`):
- Standard uploads: **5MB** (`MAX_FILE_SIZE`)
- Audio/Video: **100MB** (`MAX_MEDIA_SIZE`)

**Solution**:
- Check client-side file size before upload
- Implement chunked uploads for very large files
- Increase limits if needed (but beware of memory constraints)

---

### 5. **File Type Restrictions**
**Symptom**: Certain file types are rejected with "Unsupported file type" error

**Allowed Types** (from `s3.ts`, lines 47-72):
```typescript
'image/svg+xml', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'
'application/pdf', 'application/msword', 'application/vnd.openxmlformats...'
'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm'...
'video/mp4', 'video/quicktime', 'video/webm'...
```

**Solution**: Add missing MIME types to `ALLOWED_FILE_TYPES` array if needed

---

### 6. **Network/Firewall Issues**
**Symptoms**:
- Timeout errors
- "Network error" messages
- Uploads hang indefinitely

**Possible Causes**:
- Production server can't reach Linode endpoint
- Firewall blocking outbound connections to S3
- VPC/security group restrictions
- DNS resolution issues with `edmark-dev.in-maa-1.linodeobjects.com`

**Solution**:
```bash
# Test connectivity from production server
curl -I https://edmark-dev.in-maa-1.linodeobjects.com

# Check DNS resolution
nslookup edmark-dev.in-maa-1.linodeobjects.com

# Verify no firewall rules blocking port 443
```

---

### 7. **Next.js API Route Body Size Limits**
**Symptom**: Large uploads fail before reaching S3 code

**Root Cause**: Next.js has default body size limits for API routes

**Solution**: Configure `bodyParser` in `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  api: {
    bodyParser: {
      sizeLimit: '100mb', // Adjust as needed
    },
  },
};
```

**Note**: This may not apply to the current setup since uploads use FormData, but worth checking if JSON-based uploads fail.

---

### 8. **Memory Issues with Large Files**
**Symptom**: Server crashes or OOM errors during upload

**Root Cause**: Converting entire file to Buffer loads it all into memory

**Current Implementation** (from various services):
```typescript
const bytes = await file.arrayBuffer();
const buffer = Buffer.from(bytes);
await uploadToS3(buffer, file.name, file.type);
```

**Solution**:
- Use streaming uploads for large files
- Implement direct S3 multipart upload
- Use pre-signed URLs for client-side uploads

---

### 9. **Production Build Issues**
**Symptom**: Uploads work in `npm run dev` but fail in `npm run build` + `npm start`

**Possible Causes**:
- Environment variables not loaded correctly in production
- Code optimization removing necessary logic
- Serverless function timeout (if deployed to Vercel/similar)

**Solution**:
- Test locally with production build: `npm run build && npm start`
- Verify env vars are loaded: add console logs in `s3.ts` initialization
- Check serverless function timeout settings (increase if needed)

---

### 10. **Bucket Permissions Issues**
**Symptom**: Upload succeeds but files are not publicly accessible

**Root Cause**: Files uploaded with `ACL: 'public-read'` but bucket policy doesn't allow public access

**Solution**: Verify bucket policy allows public reads:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::edmark-dev/*"
    }
  ]
}
```

---

## Upload Endpoints in the Application

### 1. Generic Admin Upload
- **Route**: `POST /api/admin/upload`
- **Uses**: Base64 encoded files
- **Permission**: `PSYCHO_EDUCATION.CREATE`

### 2. Admin Profile Photo
- **Route**: `POST /api/admin/profile/photo`
- **Uses**: FormData/File upload
- **Permission**: `SETTINGS.UPDATE`

### 3. Student Profile Photo
- **Route**: `POST /api/admin/students/[id]/photo`
- **Uses**: FormData/File upload

### 4. Journaling (Audio)
- **Controller**: `JournalingStudentController.createAudioJournal`
- **Uses**: FormData with audio file

### 5. Journaling (Art/Image)
- **Controller**: `JournalingStudentController.createArtJournal`
- **Uses**: FormData with image file

### 6. Library/Article Images
- **Service**: `ImageBlockService`
- **Uses**: Base64 encoded images

### 7. Music/Meditation Resources
- **Services**: `MusicAdminService`, `MeditationAdminService`
- **Uses**: Base64 encoded audio/video/thumbnails

---

## Debugging Checklist

### Step 1: Verify Environment Variables
```bash
# SSH into production server
echo $LINODE_REGION
echo $LINODE_ENDPOINT
echo $LINODE_ACCESS_KEY
echo $LINODE_SECRET_KEY
echo $LINODE_BUCKET
```

### Step 2: Check Application Logs
Look for these key messages:
- ✅ `S3 Client initialized successfully` - S3 is configured
- ❌ `S3 Configuration Error` - Missing env vars
- ✅ `File uploaded successfully to S3` - Upload succeeded
- ❌ `S3 Upload Error` - Upload failed

### Step 3: Test S3 Connectivity
```bash
# From production server
curl -X PUT \
  -H "Authorization: AWS $LINODE_ACCESS_KEY:$SIGNATURE" \
  -d "test" \
  https://edmark-dev.in-maa-1.linodeobjects.com/test.txt
```

### Step 4: Test Upload Endpoint
```bash
# Test with curl
curl -X POST https://your-production-domain.com/api/admin/upload \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionId=YOUR_SESSION" \
  -d '{"base64":"data:image/png;base64,iVBORw0KG...","name":"test"}'
```

### Step 5: Check Browser Console
- Look for CORS errors
- Check network tab for failed requests
- Verify request payload isn't too large

### Step 6: Monitor Server Resources
```bash
# Check memory usage
free -m

# Check disk space (uploads might write temp files)
df -h

# Check server logs
tail -f /var/log/your-app.log
```

---

## Quick Fixes

### If env vars are missing:
```bash
# Add to .env or production environment
export LINODE_REGION="ap-south-1"
export LINODE_ENDPOINT="https://edmark-dev.in-maa-1.linodeobjects.com"
export LINODE_ACCESS_KEY="N2J0YC3ECD7YAWK4YLIA"
export LINODE_SECRET_KEY="hKpg5429VZunrurpT8U8JeBQp0OIf8qYDM05T83O"
export LINODE_BUCKET="edmark-dev"

# Restart application
pm2 restart your-app
```

### If CORS is the issue:
1. Log into Linode Object Storage console
2. Select your bucket (`edmark-dev`)
3. Go to "Access" or "CORS" settings
4. Add your production domain to allowed origins

### If credentials are wrong:
1. Generate new access key in Linode console
2. Update environment variables
3. Restart application

---

## Production Deployment Recommendations

1. **Use a .env.production file** or secrets manager for sensitive credentials
2. **Enable detailed logging** during upload operations (can be disabled later)
3. **Set up monitoring/alerts** for S3 upload failures
4. **Test with production credentials** in staging environment first
5. **Implement retry logic** for transient network errors
6. **Use CDN** in front of S3 for better performance
7. **Rotate credentials regularly** for security

---

## Need More Help?

Check the logs for specific error messages and search for them in this document.
Most upload issues in production are due to **missing or incorrect environment variables**.
