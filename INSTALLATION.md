# 🚀 Quick Installation Script

## Install All New Dependencies

Run these commands to install everything for the new features:

---

## Frontend Dependencies

```bash
# Navigate to frontend
cd frontend

# Install Lottie for animations
npx expo install lottie-react-native

# Install Expo Blur for glassmorphism
npx expo install expo-blur

# Install Document Picker for past papers upload
npx expo install expo-document-picker

# Optional: Push Notifications (install when ready to setup Firebase)
# npx expo install expo-notifications expo-device expo-constants
```

---

## Backend Dependencies

```bash
# Navigate to backend
cd backend

# Optional: For FCM push notifications (install when Firebase is configured)
# npm install node-fetch
```

---

## Verify Installation

```bash
# Frontend
cd frontend
npm list lottie-react-native
npm list expo-blur  
npm list expo-document-picker

# Backend
cd backend
# (No new required dependencies yet)
```

---

## Test the App

```bash
# Backend
cd backend
npm run dev

# Frontend (new terminal)
cd frontend
npx expo start
```

---

## Download Lottie Animations

1. Visit [LottieFiles.com](https://lottiefiles.com)
2. Search and download these animations (FREE):
   - "AI robot thinking" → Save as `ai-thinking.json`
   - "File upload cloud" → Save as `upload.json`
   - "Success checkmark" → Save as `success.json`
   - "Loading dots" → Save as `loading.json`
   - "Confetti celebration" → Save as `celebration.json`
   - "Document scan" → Save as `scan.json`

3. Create folder and add files:
   ```bash
   mkdir frontend/assets/animations
   # Move downloaded .json files to frontend/assets/animations/
   ```

---

## Update Navigation (Required)

Add Past Papers screen to navigation:

**File**: `frontend/src/navigation/AppNavigator.tsx`

```typescript
// Import screen
import { PastPaperScreen } from '../screens/PastPaperScreen';

// Add to stack navigator
<Stack.Screen 
  name="PastPapers" 
  component={PastPaperScreen}
  options={{ headerShown: false }}
/>

// Optional: Add to bottom tab navigator or home menu
```

---

## Add to Home Menu

**File**: `frontend/src/screens/HomeScreen.tsx`

Add this button/card to your home screen:

```typescript
<TouchableOpacity 
  onPress={() => navigation.navigate('PastPapers')}
  style={styles.menuCard}
>
  <GlassCard>
    <Ionicons name="documents-outline" size={32} color="#3b82f6" />
    <Text style={styles.menuTitle}>📚 Past Papers</Text>
    <Text style={styles.menuSubtitle}>Upload & manage exam papers</Text>
  </GlassCard>
</TouchableOpacity>
```

---

## Test New Features

### 1. Past Papers
```bash
# Start backend
cd backend
npm run dev

# Test upload endpoint
curl -X POST http://localhost:5000/api/v1/papers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.pdf" \
  -F "title=Math Paper 2023" \
  -F "subject=Mathematics" \
  -F "year=2023" \
  -F "level=a-level"
```

### 2. Glassmorphism
- Open any screen using GlassCard
- Should see blur effect and gradient overlay

### 3. Lottie Animations
- Replace any ActivityIndicator with LottieAnimation
- Should see smooth JSON-based animation

---

## Troubleshooting

### Lottie not working
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules
npm install
npx expo install lottie-react-native
npx expo start -c
```

### Expo Blur not working
```bash
# Rebuild app (required for native modules)
npx expo prebuild
npx expo run:android
# or
npx expo run:ios
```

### Document Picker not working
```bash
# Same as above - native module requires rebuild
npx expo prebuild
npx expo run:android
```

---

## Environment Variables

Make sure these are set in `backend/.env`:

```env
# Existing (should already have these)
MONGODB_URI=mongodb://localhost:27017/ai_study_assistant
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=your-openai-api-key-here
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Optional: For FCM (add when ready)
# FCM_SERVER_KEY=your-firebase-server-key-here
```

---

## Check Backend Routes

Verify all routes are registered:

**File**: `backend/src/routes/index.js`

Should include:
```javascript
router.use('/papers', papersRoutes); // ← NEW
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/ai', aiRoutes);
router.use('/study', studyRoutes);
router.use('/uploads', uploadRoutes);
router.use('/ocr', ocrRoutes);
router.use('/timetable', timetableRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);
router.use('/results', resultsRoutes);
```

---

## Production Checklist

Before deploying:

- [ ] Install all frontend dependencies
- [ ] Download Lottie animations
- [ ] Add PastPaperScreen to navigation
- [ ] Test PDF upload on real device
- [ ] Test glassmorphism on iOS and Android
- [ ] Configure Firebase (if using push notifications)
- [ ] Update environment variables
- [ ] Test all API endpoints
- [ ] Build production bundles

---

## Quick Commands Reference

```bash
# Install everything at once (Frontend)
cd frontend && \
npx expo install lottie-react-native expo-blur expo-document-picker

# Start development
cd backend && npm run dev &
cd frontend && npx expo start

# Build for production
cd frontend && eas build --platform android
cd frontend && eas build --platform ios

# Test API
curl http://localhost:5000/api/v1/papers -H "Authorization: Bearer TOKEN"
```

---

**You're all set! Happy coding! 🎉**
