# 🔥 Firebase Cloud Messaging (FCM) Setup Guide

## Complete Push Notifications Implementation

---

## 📋 Prerequisites

- Firebase account ([console.firebase.google.com](https://console.firebase.google.com))
- Expo account
- Android Studio (for Android)
- Xcode (for iOS, macOS only)

---

## 🚀 Step-by-Step Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"**
3. Enter project name: **"AI Study Assistant"**
4. Disable Google Analytics (optional)
5. Click **"Create project"**

### 2. Add Android App to Firebase

1. In Firebase console, click **"Add app"** → **Android**
2. **Android package name**: `com.yourusername.aistudyassistant`
   - Get from `frontend/app.json` → `expo.android.package`
3. **App nickname**: AI Study Assistant
4. Download `google-services.json`
5. Place file in `frontend/` (root of frontend folder)

### 3. Add iOS App to Firebase

1. In Firebase console, click **"Add app"** → **iOS**
2. **iOS bundle ID**: `com.yourusername.aistudyassistant`
   - Get from `frontend/app.json` → `expo.ios.bundleIdentifier`
3. **App nickname**: AI Study Assistant
4. Download `GoogleService-Info.plist`
5. Place file in `frontend/` (root of frontend folder)

### 4. Get Firebase Server Key

1. In Firebase console → **Project Settings** → **Cloud Messaging** tab
2. Under **Cloud Messaging API (Legacy)**, enable it if needed
3. Copy **Server key** (starts with `AAAA...`)
4. Add to `backend/.env`:

```env
# ── Firebase Cloud Messaging ─────────────────────────────────────────────────
FCM_SERVER_KEY=your-firebase-server-key-here
```

### 5. Install Frontend Dependencies

```bash
cd frontend
npx expo install expo-notifications expo-device expo-constants
npx expo install @react-native-firebase/app @react-native-firebase/messaging
npm install react-native-get-random-values
```

### 6. Configure `app.json`

Add to `frontend/app.json`:

```json
{
  "expo": {
    "name": "AI Study Assistant",
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#3b82f6",
          "sounds": ["./assets/notification-sound.wav"],
          "mode": "production"
        }
      ]
    ],
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#3b82f6",
      "androidMode": "default",
      "androidCollapsedTitle": "#{unread_notifications} new notifications"
    },
    "android": {
      "googleServicesFile": "./google-services.json",
      "permissions": [
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE",
        "WAKE_LOCK"
      ]
    },
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist",
      "infoPlist": {
        "UIBackgroundModes": [
          "remote-notification"
        ]
      }
    }
  }
}
```

### 7. Backend: Install Dependencies

```bash
cd backend
npm install node-fetch
```

### 8. Backend: Create Notification Service

Create `backend/src/services/fcmService.js`:

```javascript
const fetch = require('node-fetch');
const config = require('../config');

/**
 * Send push notification via FCM
 */
const sendPushNotification = async (fcmToken, notification) => {
  try {
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${config.fcm.serverKey}`,
      },
      body: JSON.stringify({
        to: fcmToken,
        notification: {
          title: notification.title,
          body: notification.body,
          icon: notification.icon || 'notification_icon',
          sound: 'default',
        },
        data: notification.data || {},
        priority: 'high',
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('FCM send error:', error);
    throw error;
  }
};

/**
 * Send to multiple devices
 */
const sendBulkNotification = async (fcmTokens, notification) => {
  try {
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${config.fcm.serverKey}`,
      },
      body: JSON.stringify({
        registration_ids: fcmTokens,
        notification: {
          title: notification.title,
          body: notification.body,
          icon: notification.icon || 'notification_icon',
          sound: 'default',
        },
        data: notification.data || {},
        priority: 'high',
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('FCM bulk send error:', error);
    throw error;
  }
};

module.exports = {
  sendPushNotification,
  sendBulkNotification,
};
```

### 9. Backend: Update Config

Add to `backend/src/config/index.js`:

```javascript
fcm: {
  serverKey: process.env.FCM_SERVER_KEY,
},
```

### 10. Backend: Add FCM Token Endpoint

Add to `backend/src/controllers/userController.js`:

```javascript
/**
 * @route   POST /api/v1/users/me/fcm-token
 * @desc    Save FCM token for push notifications
 * @access  Private
 */
const saveFCMToken = asyncHandler(async (req, res) => {
  const { fcmToken } = req.body;
  const userId = req.user._id;

  if (!fcmToken) {
    throw new ApiError(400, 'FCM token is required');
  }

  const user = await User.findById(userId);
  
  if (!user.fcmTokens) {
    user.fcmTokens = [];
  }

  // Remove token if already exists
  user.fcmTokens = user.fcmTokens.filter(t => t !== fcmToken);
  
  // Add new token at beginning (most recent)
  user.fcmTokens.unshift(fcmToken);
  
  // Keep only last 5 tokens (multiple devices)
  user.fcmTokens = user.fcmTokens.slice(0, 5);

  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new apiResponse(200, null, 'FCM token saved successfully')
  );
});
```

### 11. Frontend: Setup Notifications

Create `frontend/src/utils/notifications.ts`:

```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { apiPost } from '../api/client';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request permission and get FCM token
 */
export async function registerForPushNotifications() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    })).data;

    console.log('Expo Push Token:', token);

    // Save token to backend
    try {
      await apiPost('/users/me/fcm-token', { fcmToken: token });
      console.log('FCM token saved to backend');
    } catch (error) {
      console.error('Failed to save FCM token:', error);
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}

/**
 * Schedule local notification
 */
export async function scheduleNotification(
  title: string,
  body: string,
  seconds: number
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: { seconds },
  });
}

/**
 * Cancel all notifications
 */
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
```

### 12. Frontend: Use in App

In `frontend/App.tsx`:

```typescript
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { registerForPushNotifications } from './src/utils/notifications';

export default function App() {
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    // Register for push notifications
    registerForPushNotifications();

    // Listener for when notification is received
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Listener for when user taps notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      // Navigate to specific screen based on notification data
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  // ... rest of app code
}
```

---

## 📨 Sending Notifications

### From Backend

```javascript
const fcmService = require('../services/fcmService');

// Send quiz reminder
await fcmService.sendPushNotification(user.fcmTokens[0], {
  title: '📝 Quiz Reminder',
  body: 'You have a math quiz scheduled for 3 PM today!',
  data: {
    type: 'quiz_reminder',
    quizId: '123',
  },
});
```

### Types of Notifications

```javascript
// 1. Study Reminder
{
  title: '📚 Study Time!',
  body: 'Time for your daily physics revision',
  data: { type: 'study_reminder', subject: 'Physics' },
}

// 2. Quiz Reminder
{
  title: '📝 Quiz Reminder',
  body: 'Math quiz starts in 30 minutes',
  data: { type: 'quiz_reminder', quizId: 'abc123' },
}

// 3. AI Summary Complete
{
  title: '✅ Summary Ready!',
  body: 'Your chemistry notes have been summarized',
  data: { type: 'summary_complete', summaryId: 'xyz789' },
}

// 4. Exam Reminder
{
  title: '🎯 Exam Alert',
  body: 'Final exam in 3 days - Start preparing!',
  data: { type: 'exam_reminder', examId: 'exam123' },
}

// 5. Achievement Unlocked
{
  title: '🏆 Achievement Unlocked!',
  body: 'You\'ve completed 10 quizzes this week!',
  data: { type: 'achievement', achievementId: 'quiz_master' },
}
```

---

## 🧪 Testing

### Test on Physical Device

1. **Build and install app**:
   ```bash
   cd frontend
   eas build --profile development --platform android
   ```

2. **Run app** and grant notification permissions

3. **Send test notification** from backend:
   ```bash
   curl -X POST http://localhost:5000/api/v1/notifications/test \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json"
   ```

### Test with Firebase Console

1. Go to Firebase Console → **Cloud Messaging**
2. Click **"Send your first message"**
3. Enter notification title and text
4. Click **"Send test message"**
5. Enter your FCM token
6. Click **"Test"**

---

## 🎨 Notification Icons

Create notification icon:
1. Use [Icon Generator](https://romannurik.github.io/AndroidAssetStudio/icons-notification.html)
2. Upload your logo
3. Download and place in `frontend/assets/`
4. Update `app.json` with icon path

---

## 📊 Monitoring

Track notification delivery in Firebase Console:
- **Cloud Messaging** tab
- View sent, delivered, opened stats
- Error reports

---

## 🔒 Security

**Never expose FCM Server Key in frontend code!**

✅ Store in backend `.env`
✅ Send notifications only from backend
✅ Validate user tokens before sending

---

## 🚀 Production Deployment

Before going live:

1. **Enable Firebase Cloud Messaging API (V1)**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Enable "Firebase Cloud Messaging API"

2. **Update backend** to use V1 API (recommended)

3. **Test thoroughly** on both Android and iOS

4. **Set up notification scheduling** for study reminders

5. **Monitor delivery rates** in Firebase Console

---

## 🆘 Troubleshooting

### Notifications not received

- ✅ Check FCM token is saved correctly
- ✅ Verify `google-services.json` is in correct location
- ✅ Ensure app has notification permissions
- ✅ Test on physical device (not simulator for Android)
- ✅ Check Firebase server key in `.env`

### Token registration fails

- ✅ Verify `projectId` in `app.json`
- ✅ Rebuild app with EAS
- ✅ Check network connection

---

## 📚 Additional Resources

- [Expo Notifications Docs](https://docs.expo.dev/push-notifications/overview/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [FCM HTTP Protocol](https://firebase.google.com/docs/cloud-messaging/http-server-ref)

---

**You're all set for push notifications! 🔔**
