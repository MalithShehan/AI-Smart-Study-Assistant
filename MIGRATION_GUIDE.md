# 🔄 Migration Guide: Integrating Premium Features

## Quick Integration Steps

Your app now has premium features ready to use! Follow these steps to integrate them:

---

## 📱 **Frontend Updates**

### 1. Install New Dependencies

```bash
cd frontend
npm install expo-haptics@~14.0.6
```

### 2. Use Premium QuizGeneratorScreen

**Option A: Replace existing file**
```bash
# Backup current file
mv src/screens/QuizGeneratorScreen.tsx src/screens/QuizGeneratorScreen.Old.tsx

# Use premium version
mv src/screens/QuizGeneratorScreen.Premium.tsx src/screens/QuizGeneratorScreen.tsx
```

**Option B: Copy specific features**
Open `QuizGeneratorScreen.Premium.tsx` and copy:
- Haptic feedback integration
- Animated entrance effects
- Premium topic selection UI
- Progress bar with animations
- Better answer feedback

### 3. Import Premium UI Components

Add these imports to your screens:

```typescript
// In any screen file
import {
  GradientCard,
  PremiumButton,
  StatCard,
  ProgressRing,
  ExpandableCard,
  Badge,
  EmptyState
} from '../components/PremiumUI';

import { useHaptics } from '../hooks/useHaptics';
```

### 4. Use Haptic Feedback

```typescript
const MyScreen = () => {
  const haptics = useHaptics();

  return (
    <TouchableOpacity
      onPress={() => {
        haptics.light(); // Light tap feedback
        navigation.navigate('NextScreen');
      }}
    >
      <Text>Click Me</Text>
    </TouchableOpacity>
  );
};
```

**Available haptic types:**
- `haptics.light()` - Light tap (navigation)
- `haptics.medium()` - Medium impact (confirmations)
- `haptics.heavy()` - Heavy impact (errors)
- `haptics.success()` - Success notification
- `haptics.warning()` - Warning notification
- `haptics.error()` - Error notification
- `haptics.selection()` - Selection change

---

## 🗄️ **Backend Updates**

### 1. Quiz Model is Ready

The Quiz model is already created at `backend/src/models/Quiz.js`.

**Features:**
- User-scoped quizzes
- Difficulty levels (easy/medium/hard)
- Point system
- Tags and subjects
- Public/private visibility
- Attempt tracking

### 2. Update AI Service (Optional but Recommended)

Add real OpenAI integration to `backend/src/services/aiService.js`:

```javascript
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const generateQuiz = async (topic, difficulty, count) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are an expert quiz generator for students.'
      },
      {
        role: 'user',
        content: `Generate ${count} ${difficulty} level multiple choice questions about ${topic}. 
                  Return as JSON array with: question, options (array of 4), correctAnswer (string), explanation.`
      }
    ],
    response_format: { type: 'json_object' }
  });

  return JSON.parse(response.choices[0].message.content);
};
```

### 3. Create Quiz Endpoint

Add to `backend/src/routes/ai.js`:

```javascript
const Quiz = require('../models/Quiz');

router.post('/quiz',
  protect,
  aiLimiter,
  asyncHandler(async (req, res) => {
    const { topic, difficulty, count } = req.body;

    // Generate questions using AI
    const questions = await generateQuiz(topic, difficulty, count);

    // Save quiz to database
    const quiz = await Quiz.create({
      userId: req.user._id,
      title: `${topic} Quiz`,
      subject: topic,
      difficulty,
      questions,
      totalQuestions: questions.length,
    });

    res.status(201).json(
      new apiResponse(201, { quiz, questions }, 'Quiz generated successfully')
    );
  })
);
```

---

## 🎨 **Using Premium Components**

### GradientCard
```typescript
<GradientCard
  colors={['#FF7A00', '#FFB84D']}
  onPress={() => console.log('Pressed')}
>
  <Text style={{ color: 'white' }}>Premium Content</Text>
</GradientCard>
```

### PremiumButton
```typescript
<PremiumButton
  label="Save Changes"
  onPress={handleSave}
  variant="primary"     // primary | secondary | outline | danger | success
  size="lg"             // sm | md | lg
  loading={saving}
/>
```

### StatCard
```typescript
<StatCard
  label="Study Hours"
  value={24}
  icon="time-outline"
  trend={12}            // Positive trend percentage
  color="#FF7A00"
/>
```

### ProgressRing
```typescript
<ProgressRing
  progress={75}         // 0-100
  size={120}
  strokeWidth={12}
  color="#8B5CF6"
/>
```

---

## 🔗 **API Integration**

### Fetch User Stats (for HomeScreen)

Add this endpoint to backend:

```javascript
// backend/src/routes/analytics.js
router.get('/stats', protect, asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const stats = {
    totalStudyHours: await calculateStudyHours(userId),
    quizzesCompleted: await Result.countDocuments({ userId }),
    averageScore: await calculateAverageScore(userId),
  };

  res.json(new apiResponse(200, stats, 'Stats retrieved'));
}));
```

Then call from frontend:

```typescript
const fetchStats = async () => {
  const res = await apiGet('/analytics/stats');
  setStats(res.data);
};
```

---

## 🚀 **Quick Start Checklist**

### Frontend:
- [ ] Install `expo-haptics`
- [ ] Add `useHaptics` hook to interactive screens
- [ ] Replace QuizGeneratorScreen with Premium version
- [ ] Update HomeScreen imports (already done in code)
- [ ] Test animations and haptic feedback

### Backend:
- [ ] Quiz model is ready (no action needed)
- [ ] Add OpenAI API key to `.env`
- [ ] Test `/api/v1/ai/quiz` endpoint
- [ ] Add `/analytics/stats` endpoint
- [ ] Verify all routes are registered

### Testing:
- [ ] Run backend: `cd backend && npm run dev`
- [ ] Run frontend: `cd frontend && npx expo start`
- [ ] Test quiz generation
- [ ] Test haptic feedback (must use real device)
- [ ] Test pull-to-refresh on HomeScreen
- [ ] Test animations

---

## 📝 **Example: Complete Integration**

### Before (Basic Screen):
```typescript
export const MyScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text>Go Back</Text>
      </TouchableOpacity>
      <Text>My Screen</Text>
    </View>
  );
};
```

### After (Premium Screen):
```typescript
import { GradientCard, PremiumButton } from '../components/PremiumUI';
import { useHaptics } from '../hooks/useHaptics';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';

export const MyScreen = () => {
  const navigation = useNavigation();
  const haptics = useHaptics();

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(400)}>
        <GradientCard colors={['#8B5CF6', '#A78BFA']}>
          <Text style={styles.title}>My Premium Screen</Text>
        </GradientCard>
      </Animated.View>

      <Animated.View entering={SlideInRight.delay(200)}>
        <PremiumButton
          label="Go Back"
          onPress={() => {
            haptics.light();
            navigation.goBack();
          }}
          variant="secondary"
        />
      </Animated.View>
    </View>
  );
};
```

---

## 🆘 **Troubleshooting**

### "Cannot find module 'expo-haptics'"
```bash
cd frontend
npm install expo-haptics@~14.0.6
npx expo start -c  # Clear cache
```

### Haptics not working
- Haptics only work on real devices, not simulators
- Ensure device settings allow haptic feedback
- iOS: Settings → Sounds & Haptics → System Haptics
- Android: Settings → Sound → Vibration

### "GradientCard is not exported"
- Ensure you're importing from the correct path:
  ```typescript
  import { GradientCard } from '../components/PremiumUI';
  ```

### Animations not smooth
- Enable Hermes engine (should be default in Expo 54)
- Check `useNativeDriver: true` in animations
- Profile with React DevTools

---

## 🎯 **Next Steps**

1. **Install dependencies** → `npm install expo-haptics`
2. **Test haptics** → Run on real device
3. **Integrate components** → Replace basic UI with Premium components
4. **Add animations** → Use entrance/exit animations
5. **Test thoroughly** → Ensure smooth experience

---

## 📞 **Need Help?**

Check these resources:
- [Expo Haptics Docs](https://docs.expo.dev/versions/latest/sdk/haptics/)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [PremiumUI Component Guide](./COMPONENT_GUIDE.md)

---

**You're all set to deliver a premium app experience!** 🚀

