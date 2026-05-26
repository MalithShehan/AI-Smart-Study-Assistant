# 🔐 Environment Variables Setup Guide

## Backend Configuration

### Required Environment Variables

Create a `.env` file in the `backend` folder with the following variables:

```env
# ═══════════════════════════════════════════════════════════
# DATABASE
# ═══════════════════════════════════════════════════════════
MONGODB_URI=mongodb://localhost:27017/ai_study_assistant
# For production (MongoDB Atlas):
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ai_study_assistant?retryWrites=true&w=majority

# ═══════════════════════════════════════════════════════════
# JWT
# ═══════════════════════════════════════════════════════════
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# ═══════════════════════════════════════════════════════════
# OPENAI API
# ═══════════════════════════════════════════════════════════
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# Get your API key from: https://platform.openai.com/api-keys

# ═══════════════════════════════════════════════════════════
# CLOUDINARY (Image Upload)
# ═══════════════════════════════════════════════════════════
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
# Get these from: https://cloudinary.com/console

# ═══════════════════════════════════════════════════════════
# FIREBASE (Push Notifications)
# ═══════════════════════════════════════════════════════════
FIREBASE_SERVICE_ACCOUNT_PATH=C:/Users/ASUS/Documents/ai-study-assistant/backend/src/config/ai-study-assistant-b95aa-firebase-adminsdk-fbsvc-452eff548a.json
# Path to your Firebase service account JSON file

# ═══════════════════════════════════════════════════════════
# EMAIL (NodeMailer)
# ═══════════════════════════════════════════════════════════
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=AI Study Assistant <noreply@aistudyassistant.com>
# For Gmail: Enable 2FA and generate app password
# https://support.google.com/accounts/answer/185833

# ═══════════════════════════════════════════════════════════
# SERVER
# ═══════════════════════════════════════════════════════════
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:8081
# For production: Set to your Expo app URL or web app URL

# ═══════════════════════════════════════════════════════════
# SECURITY & RATE LIMITING
# ═══════════════════════════════════════════════════════════
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
AI_RATE_LIMIT_MAX=10
```

---

## 📝 How to Get Each API Key

### 1. **OpenAI API Key** (Critical for AI features)

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Sign up or log in
3. Navigate to **API Keys** in your account settings
4. Click **"Create new secret key"**
5. Copy the key (starts with `sk-proj-...`)
6. Paste into `.env` as `OPENAI_API_KEY`

**Pricing**: Pay-as-you-go, ~$0.002 per quiz generation

---

### 2. **Cloudinary Credentials** (For image uploads)

1. Go to [Cloudinary](https://cloudinary.com)
2. Sign up for free account
3. Go to **Dashboard**
4. Copy:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
5. Paste into `.env`

**Free Tier**: 25GB storage, 25GB bandwidth/month

---

### 3. **Firebase Service Account** (Already configured)

You already have the Firebase service account JSON file at:
```
backend/src/config/ai-study-assistant-b95aa-firebase-adminsdk-fbsvc-452eff548a.json
```

Path is already set correctly in `.env`. No action needed.

---

### 4. **MongoDB Atlas** (Production Database)

For production deployment:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Click **"Connect"** → **"Connect your application"**
4. Copy connection string
5. Replace `<username>` and `<password>` with your DB credentials
6. Update `MONGODB_URI` in production `.env`

**Free Tier**: 512MB storage

---

### 5. **Gmail SMTP** (Email notifications)

1. Enable 2-Factor Authentication in Google Account
2. Go to **Security** → **App passwords**
3. Generate app password for "Mail"
4. Use this password in `EMAIL_PASSWORD`
5. Set your Gmail address in `EMAIL_USER`

---

## 🔒 Security Checklist

### Before Production:

- [ ] Change `JWT_SECRET` to a strong random string (min 32 characters)
- [ ] Set `NODE_ENV=production`
- [ ] Use MongoDB Atlas (cloud) instead of local MongoDB
- [ ] Set proper `CLIENT_URL` (your deployed app URL)
- [ ] Never commit `.env` to git (already in `.gitignore`)
- [ ] Use environment variable management in deployment platform (Heroku, Railway, etc.)
- [ ] Restrict CORS to your actual client URLs
- [ ] Enable SSL/HTTPS

---

## 🚀 Testing Your Configuration

Run this command to verify your setup:

```bash
cd backend
npm run dev
```

Expected output:
```
✅ MongoDB connected successfully
✅ Server running on port 5000
✅ OpenAI API key loaded
✅ Cloudinary configured
✅ Firebase Admin initialized
```

If any service fails, check the corresponding env variable.

---

## 📱 Frontend Configuration

Update the API base URL in `frontend/src/api/client.ts`:

```typescript
// Development
const BASE_URL = 'http://localhost:5000/api/v1';

// Production (update after backend deployment)
const BASE_URL = 'https://your-api.railway.app/api/v1';
```

---

## ⚡ Quick Start (After Setup)

1. **Install dependencies:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Start backend:**
   ```bash
   cd backend
   npm run dev
   ```

3. **Start frontend:**
   ```bash
   cd frontend
   npx expo start
   ```

4. **Test the app:**
   - Register a new account
   - Generate an AI quiz
   - Upload profile image
   - Check notifications

---

## 🆘 Troubleshooting

### "OpenAI API key not configured"
→ Add `OPENAI_API_KEY=sk-proj-...` to `.env`

### "Cloudinary upload failed"
→ Verify all 3 Cloudinary credentials are correct

### "Firebase Admin initialization failed"
→ Check `FIREBASE_SERVICE_ACCOUNT_PATH` points to valid JSON file

### "MongoDB connection failed"
→ Ensure MongoDB is running locally or Atlas URI is correct

---

## 💰 Cost Estimation (Production)

### Free Tier Limits:
- **OpenAI**: ~$5 credit for new accounts (500-1000 quizzes)
- **Cloudinary**: 25GB storage + 25GB bandwidth
- **MongoDB Atlas**: 512MB storage (5000-10000 users)
- **Firebase**: 10GB/month notifications

### Paid (1000 active users):
- **OpenAI**: ~$10-20/month
- **Cloudinary**: Free tier sufficient
- **MongoDB Atlas**: $9/month (M2 cluster)
- **Hosting**: $5-10/month (Railway/Render)

**Total**: ~$25-40/month for 1000 users

---

## 📞 Support

Need help? Check:
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)
- [Firebase Docs](https://firebase.google.com/docs)

