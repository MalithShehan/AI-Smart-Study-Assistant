# 🎓 AI Study Assistant - Startup-Quality Mobile App

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB.svg)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248.svg)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991.svg)

**A production-ready, AI-powered study assistant with premium UI/UX**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Deployment](#-deployment)

</div>

---

## ✨ Features

### 🤖 **AI-Powered Learning**
- **Smart Quiz Generator**: AI creates personalized quizzes on any topic
- **Text Summarization**: Convert lengthy notes into concise summaries
- **OCR Scanning**: Extract text from images and photos
- **Question Answering**: Get instant answers to study questions
- **Explanations**: Detailed explanations for every answer

### 🎨 **Premium User Experience**
- **Beautiful UI**: Modern gradient cards, smooth animations, glass morphism
- **Haptic Feedback**: Tactile feedback for all interactions
- **Pull-to-Refresh**: Intuitive gesture-based data refresh
- **Progress Tracking**: Visual progress indicators with animations
- **Dark Mode Ready**: Theme switching support (coming soon)

### 📊 **Study Analytics**
- **Performance Dashboard**: Track study hours, quiz scores, and trends
- **Activity Feed**: See your recent learning activities
- **Score Analytics**: Detailed breakdowns of quiz performance
- **Progress Trends**: Visualize improvement over time

### 🔒 **Enterprise-Grade Security**
- **JWT Authentication**: Secure token-based auth system
- **Rate Limiting**: Protect against abuse (100 req/min general, 10 req/min AI)
- **Input Sanitization**: XSS and NoSQL injection protection
- **Password Hashing**: bcryptjs with salt rounds
- **CORS Protection**: Whitelisted origins only

### 📱 **Mobile-First Design**
- **React Native**: Native iOS & Android apps
- **Responsive UI**: Adapts to all screen sizes
- **Offline Support**: Cached data for offline access (coming soon)
- **Push Notifications**: Firebase Cloud Messaging integration
- **Deep Linking**: Universal links support

---

## 🏗️ Tech Stack

### Frontend
```
⚛️  React Native 0.81      - Mobile framework
📱  Expo SDK 54            - Development platform
🎨  NativeWind 4.x         - Tailwind CSS for React Native
📝  TypeScript 5.9         - Type safety
🧭  React Navigation 7     - Navigation
🎭  Reanimated 3           - Smooth animations
🎨  Linear Gradient        - Premium gradients
```

### Backend
```
🚀  Node.js 20+            - Runtime
⚡  Express 4.x            - Web framework
🗄️  MongoDB 7.0            - Database
🔐  JWT                    - Authentication
🤖  OpenAI GPT-4           - AI features
☁️  Cloudinary            - Image storage
🔥  Firebase Admin        - Push notifications
📧  Nodemailer            - Email service
```

### DevOps & Tools
```
📚  Swagger               - API documentation
📊  Winston               - Logging
🛡️  Helmet                - Security headers
🔄  PM2                   - Process manager
🐳  Docker                - Containerization
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm
- MongoDB (local or Atlas)
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator / Android Emulator / Physical device

### 1. Clone & Install

```bash
# Clone repository
git clone <your-repo-url>
cd ai-study-assistant

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

Create `backend/.env`:

```env
# See ENV_SETUP_GUIDE.md for detailed instructions

# Critical (Required for AI features)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx

# Database
MONGODB_URI=mongodb://localhost:27017/ai_study_assistant

# JWT
JWT_SECRET=your-super-secret-key-min-32-characters

# Server
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:8081
```

**📖 Full guide:** [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md)

### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npx expo start
```

### 4. Open App

- **iOS**: Press `i` in Expo terminal or scan QR with Camera app
- **Android**: Press `a` in Expo terminal or scan QR with Expo Go app
- **Web**: Press `w` in Expo terminal

---

## 📱 Screenshots

<div align="center">

| Home | Quiz Generator | Results | Settings |
|------|----------------|---------|----------|
| ![Home](docs/screenshots/home.png) | ![Quiz](docs/screenshots/quiz.png) | ![Results](docs/screenshots/results.png) | ![Settings](docs/screenshots/settings.png) |

</div>

---

## 🗂️ Project Structure

```
ai-study-assistant/
├── backend/                    # Node.js API server
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Request handlers
│   │   ├── middlewares/       # Express middlewares
│   │   ├── models/            # MongoDB models (11 models)
│   │   ├── routes/            # API routes (12 groups)
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Helpers & utilities
│   │   └── validators/        # Input validation
│   ├── .env                   # Environment variables
│   └── package.json
│
├── frontend/                   # React Native app
│   ├── src/
│   │   ├── api/               # API client
│   │   ├── components/        # Reusable components
│   │   ├── context/           # React Context (Auth)
│   │   ├── hooks/             # Custom hooks
│   │   ├── navigation/        # Navigation setup
│   │   ├── screens/           # App screens (15+)
│   │   ├── theme/             # Design tokens
│   │   └── types/             # TypeScript types
│   └── package.json
│
├── COMPONENT_GUIDE.md         # UI components documentation
├── BUILD_SUMMARY.md           # Quick start guide
├── ENV_SETUP_GUIDE.md         # Environment setup
├── MIGRATION_GUIDE.md         # Integration guide
├── PRODUCTION_READY.md        # Deployment checklist
└── README.md                  # This file
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md) | How to get and configure all API keys |
| [COMPONENT_GUIDE.md](./COMPONENT_GUIDE.md) | Premium UI components API reference |
| [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) | Integrate premium features step-by-step |
| [PRODUCTION_READY.md](./PRODUCTION_READY.md) | Complete deployment checklist |
| [BUILD_SUMMARY.md](./BUILD_SUMMARY.md) | Quick overview & integration steps |
| [API Documentation](http://localhost:5000/api-docs) | Swagger API docs (when server running) |

---

## 🎯 Core Components

### Premium UI Library
```typescript
import {
  GradientCard,      // Premium card with gradients
  PremiumButton,     // 5 variants × 3 sizes
  StatCard,          // Dashboard metrics
  ProgressRing,      // Animated circular progress
  ExpandableCard,    // Collapsible sections
  Badge,             // Status labels
  EmptyState,        // Placeholder UI
} from '../components/PremiumUI';
```

### Haptic Feedback
```typescript
import { useHaptics } from '../hooks/useHaptics';

const MyScreen = () => {
  const haptics = useHaptics();

  return (
    <TouchableOpacity
      onPress={() => {
        haptics.light(); // Tactile feedback
        doAction();
      }}
    >
      <Text>Tap Me</Text>
    </TouchableOpacity>
  );
};
```

### API Client
```typescript
import { apiGet, apiPost } from '../api/client';

// Authenticated requests
const data = await apiGet('/analytics/stats');
const result = await apiPost('/ai/quiz', { topic: 'Math' });
```

---

## 🛣️ API Endpoints

### Authentication
```
POST   /api/v1/auth/register        - Register new user
POST   /api/v1/auth/login           - Login
GET    /api/v1/auth/me              - Get current user
POST   /api/v1/auth/forgot-password - Request password reset
```

### AI Features
```
POST   /api/v1/ai/quiz              - Generate AI quiz
POST   /api/v1/ai/summarize         - Summarize text
POST   /api/v1/ai/scan-summarize    - OCR + summarize
POST   /api/v1/ai/ask               - Ask question
```

### Study Management
```
GET    /api/v1/study/sessions       - Get study sessions
POST   /api/v1/study/sessions       - Create session
PATCH  /api/v1/study/sessions/:id   - Update session
DELETE /api/v1/study/sessions/:id   - Delete session
```

### Analytics
```
GET    /api/v1/analytics/activities - Recent activities
GET    /api/v1/analytics/stats      - User statistics
GET    /api/v1/analytics/performance - Performance metrics
```

**📖 Full API docs:** http://localhost:5000/api-docs (when backend running)

---

## 🚀 Deployment

### Backend (Railway)

1. **Create Railway project:**
   ```bash
   railway login
   railway init
   ```

2. **Add environment variables:**
   - Go to Railway dashboard → Variables
   - Add all vars from `.env`
   - Set `NODE_ENV=production`

3. **Deploy:**
   ```bash
   railway up
   ```

### Frontend (EAS Build)

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Configure:**
   ```bash
   cd frontend
   eas build:configure
   ```

3. **Update API URL** in `src/api/client.ts`:
   ```typescript
   const BASE_URL = 'https://your-backend.railway.app/api/v1';
   ```

4. **Build:**
   ```bash
   # iOS
   eas build --platform ios

   # Android
   eas build --platform android
   ```

5. **Submit:**
   ```bash
   eas submit --platform ios
   eas submit --platform android
   ```

**📖 Full deployment guide:** [PRODUCTION_READY.md](./PRODUCTION_READY.md)

---

## 💎 Premium Features

### Implemented ✅
- ✅ AI quiz generation (GPT-4)
- ✅ Text summarization
- ✅ OCR scanning
- ✅ Question answering
- ✅ Progress tracking
- ✅ Study analytics
- ✅ Premium UI/UX
- ✅ Animations & haptics
- ✅ Security & auth

### Ready to Add 🔜
- 🔜 Payment integration (Stripe)
- 🔜 Social login (Google/Apple)
- 🔜 Real-time chat
- 🔜 Offline mode
- 🔜 Push notifications
- 🔜 Dark mode
- 🔜 Study groups
- 🔜 Achievements & gamification

---

## 📊 Database Models

```
✅ User          - Authentication & profile
✅ Session       - Study sessions with notes
✅ Quiz          - AI-generated quizzes
✅ Result        - Quiz results & answers
✅ Activity      - User activity tracking
✅ Notification  - Push notifications
✅ Timetable     - Study schedule
✅ Exam          - Exam tracking
✅ Report        - Content moderation
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### E2E Tests (future)
```bash
npx detox test
```

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎉 What's Next?

### Immediate (Week 1):
1. ✅ Get OpenAI API key ([Guide](./ENV_SETUP_GUIDE.md))
2. ✅ Setup Cloudinary account
3. ✅ Test all features locally
4. ✅ Review [PRODUCTION_READY.md](./PRODUCTION_READY.md)

### Short-term (Week 2-3):
1. Deploy backend to Railway
2. Build mobile apps with EAS
3. Beta test with users
4. Polish based on feedback

### Long-term (Month 1-3):
1. Submit to App Store & Play Store
2. Add payment integration
3. Launch marketing campaign
4. Scale infrastructure

---

## 📞 Support

- **Documentation**: [docs/](./docs)
- **API Docs**: http://localhost:5000/api-docs
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Email**: support@yourdomain.com

---

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Expo team for amazing tooling
- React Native community
- MongoDB team
- All open-source contributors

---

<div align="center">

**Built with ❤️ for students worldwide**

[⬆ Back to Top](#-ai-study-assistant---startup-quality-mobile-app)

</div>
