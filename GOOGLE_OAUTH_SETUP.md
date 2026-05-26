# 🔐 Google OAuth Setup Guide

## Backend Setup

### 1. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable **Google+ API**:
   - Click "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Configure OAuth consent screen if not already done:
     - User Type: External
     - App name: AI Study Assistant
     - Support email: Your email
     - Developer contact: Your email
   
5. Create TWO OAuth Client IDs:

#### **Web Client (for Backend)**
- Application type: **Web application**
- Name: AI Study Assistant Backend
- Authorized redirect URIs:
  - `http://localhost:5000/api/v1/auth/google/callback` (development)
  - `https://your-production-domain.com/api/v1/auth/google/callback` (production)
- Click "Create"
- **Copy the Client ID and Client Secret**

#### **Android Client (for Mobile)**
- Application type: **Android**
- Name: AI Study Assistant Android
- Package name: `com.yourcompany.aistudyassistant` (from app.json)
- SHA-1 certificate fingerprint:
  - Development: Get from `eas credentials` or `keytool`
  - Production: Get from your release keystore

#### **iOS Client (for Mobile)**
- Application type: **iOS**
- Name: AI Study Assistant iOS
- Bundle ID: `com.yourcompany.aistudyassistant` (from app.json)

### 2. Update Backend `.env`

```env
# Google OAuth
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-aBcDeFgHiJkLmNoPqRsTuVwXyZ
```

> **Note**: Use the **Web Client ID** for backend authentication

### 3. Install Backend Dependencies

```bash
cd backend
npm install google-auth-library
```

### 4. Test Backend Endpoint

```bash
# Start backend
npm run dev

# Test with curl (after getting a Google ID token)
curl -X POST http://localhost:5000/api/v1/auth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken":"YOUR_GOOGLE_ID_TOKEN"}'
```

---

## Frontend Setup

### 1. Install Google Sign-In Package

```bash
cd frontend
npx expo install @react-native-google-signin/google-signin
```

### 2. Update `app.json`

```json
{
  "expo": {
    "android": {
      "package": "com.yourcompany.aistudyassistant",
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.aistudyassistant",
      "googleServicesFile": "./GoogleService-Info.plist"
    },
    "plugins": [
      "@react-native-google-signin/google-signin"
    ]
  }
}
```

### 3. Get Configuration Files

#### **For Android: `google-services.json`**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (or create new one)
3. Click "Add app" → Android
4. Package name: `com.yourcompany.aistudyassistant`
5. Download `google-services.json`
6. Place it in `frontend/` directory

#### **For iOS: `GoogleService-Info.plist`**

1. In Firebase Console, click "Add app" → iOS
2. Bundle ID: `com.yourcompany.aistudyassistant`
3. Download `GoogleService-Info.plist`
4. Place it in `frontend/` directory

### 4. Update GoogleLoginButton Component

Open `frontend/src/screens/GoogleLoginButton.tsx` and update:

```typescript
GoogleSignin.configure({
  webClientId: '123456789-abcdefghijklmnop.apps.googleusercontent.com', // Your Web Client ID
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});
```

> **Important**: Use the **Web Client ID** (not Android or iOS Client ID)

### 5. Add Google Button to LoginScreen

**In `frontend/src/screens/LoginScreen.tsx`:**

```typescript
import GoogleLoginButton from './GoogleLoginButton';

// Inside your render:
<View style={styles.container}>
  {/* Email/Password Form */}
  
  {/* Divider */}
  <View style={styles.divider}>
    <View style={styles.dividerLine} />
    <Text style={styles.dividerText}>OR</Text>
    <View style={styles.dividerLine} />
  </View>

  {/* Google Login */}
  <GoogleLoginButton
    onSuccess={() => navigation.replace('Home')}
  />
</View>

// Styles:
const styles = StyleSheet.create({
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#9CA3AF',
  },
});
```

---

## Testing

### Development Mode

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npx expo start
   ```

3. **Test on Device:**
   - Google Sign-In does NOT work on simulators
   - Must test on **real Android/iOS device**
   - Use Expo Go or development build

### Production Build

For production, you need a **custom development build** (not Expo Go):

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
cd frontend
eas build:configure

# Build for Android
eas build --platform android --profile development

# Build for iOS
eas build --platform ios --profile development
```

---

## Troubleshooting

### Error: "Developer Error"
- **Cause**: Incorrect Web Client ID or SHA-1 certificate
- **Fix**: 
  - Verify Web Client ID in GoogleLoginButton.tsx
  - Add correct SHA-1 to Google Cloud Console

### Error: "SIGN_IN_CANCELLED"
- **Cause**: User cancelled the sign-in
- **Fix**: Not an error, just info

### Error: "PLAY_SERVICES_NOT_AVAILABLE"
- **Cause**: Google Play Services not available (Android only)
- **Fix**: Update Google Play Services on device

### Error: "Invalid Google token" (Backend)
- **Cause**: Mismatch between Client IDs or expired token
- **Fix**: Ensure backend uses same Web Client ID

### Google Sign-In Button Not Showing
- **Cause**: Missing dependencies or configuration
- **Fix**: 
  - Run `npx expo install @react-native-google-signin/google-signin`
  - Rebuild app with `eas build`

### SHA-1 Fingerprint for Development

**Android (Expo):**
```bash
# Get SHA-1 from Expo
eas credentials

# Or from keytool
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey
# Password: android
```

**iOS:**
- No SHA-1 needed, just Bundle ID

---

## Security Notes

1. **Never commit credentials to Git:**
   - Add `google-services.json` to `.gitignore`
   - Add `GoogleService-Info.plist` to `.gitignore`
   - Keep `.env` files secure

2. **Environment-specific configs:**
   - Use different OAuth clients for dev/staging/prod
   - Restrict authorized domains in Google Cloud Console

3. **Token validation:**
   - Backend always validates ID token with Google
   - Tokens expire after 1 hour
   - Backend generates its own JWT tokens

---

## Summary Checklist

### Backend ✅
- [ ] Created Google Cloud project
- [ ] Enabled Google+ API
- [ ] Created Web OAuth Client ID
- [ ] Added Client ID and Secret to `.env`
- [ ] Installed `google-auth-library`
- [ ] Backend running without errors

### Frontend ✅
- [ ] Installed `@react-native-google-signin/google-signin`
- [ ] Updated `app.json` with plugins
- [ ] Downloaded `google-services.json` (Android)
- [ ] Downloaded `GoogleService-Info.plist` (iOS)
- [ ] Updated GoogleLoginButton with Web Client ID
- [ ] Added Google button to LoginScreen

### Testing ✅
- [ ] Backend endpoint `/auth/google` responds
- [ ] Google button appears in app
- [ ] Clicking button opens Google sign-in
- [ ] Successful sign-in creates/logs in user
- [ ] JWT tokens returned and stored
- [ ] User redirected to Home screen

---

## Example Login Flow

1. User taps "Continue with Google"
2. Google Sign-In modal opens
3. User selects Google account
4. Google returns `idToken`
5. App sends `idToken` to `POST /api/v1/auth/google`
6. Backend verifies token with Google
7. Backend creates/finds user in MongoDB
8. Backend generates JWT access + refresh tokens
9. Frontend stores tokens in AsyncStorage
10. User redirected to Home screen

---

## Support

- **Google Cloud Console**: https://console.cloud.google.com
- **Firebase Console**: https://console.firebase.google.com
- **Google Sign-In Docs**: https://developers.google.com/identity
- **React Native Google Sign-In**: https://github.com/react-native-google-signin/google-signin

---

**You're all set! 🎉** Google OAuth is now fully integrated into your AI Study Assistant app!
