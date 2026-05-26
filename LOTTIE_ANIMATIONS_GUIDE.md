# 🎨 Lottie Animations Setup Guide

## Beautiful Animations for AI Study Assistant

---

## 📦 Installation

```bash
cd frontend
npx expo install lottie-react-native
```

---

## 🎭 Free Lottie Animation Sources

1. **LottieFiles** - [lottiefiles.com](https://lottiefiles.com)
2. **IconScout** - [iconscout.com/lottie-animations](https://iconscout.com/lottie-animations)
3. **Lordicon** - [lordicon.com](https://lordicon.com)

---

## 📂 Project Structure

```
frontend/
├── assets/
│   └── animations/
│       ├── loading.json          # General loading spinner
│       ├── ai-thinking.json      # AI processing animation
│       ├── success.json           # Success checkmark
│       ├── error.json             # Error animation
│       ├── quiz-complete.json    # Quiz completion celebration
│       ├── upload.json            # File upload animation
│       ├── scan.json              # OCR scanning animation
│       ├── brain.json             # AI brain thinking
│       ├── book.json              # Study/reading animation
│       └── celebration.json       # Achievement unlocked
```

---

## 🎬 Recommended Animations

### 1. AI Processing
- **Use**: Quiz generation, note summarization, AI chat
- **Download**: Search "AI robot thinking" on LottieFiles
- **File**: `ai-thinking.json`

### 2. File Upload
- **Use**: Uploading past papers, images for OCR
- **Download**: Search "file upload cloud" on LottieFiles
- **File**: `upload.json`

### 3. Scanner
- **Use**: OCR scanning screen
- **Download**: Search "document scan" on LottieFiles
- **File**: `scan.json`

### 4. Success
- **Use**: Quiz completion, successful upload
- **Download**: Search "success checkmark" on LottieFiles
- **File**: `success.json`

### 5. Loading
- **Use**: General loading states
- **Download**: Search "loading dots gradient" on LottieFiles
- **File**: `loading.json`

### 6. Quiz Complete
- **Use**: After finishing quiz
- **Download**: Search "confetti celebration" on LottieFiles
- **File**: `quiz-complete.json`

### 7. Empty State
- **Use**: No data/content screens
- **Download**: Search "empty box" on LottieFiles
- **File**: `empty.json`

---

## 🧩 Create Reusable Component

Create `frontend/src/components/LottieAnimation.tsx`:

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

interface LottieAnimationProps {
  source: any;
  autoPlay?: boolean;
  loop?: boolean;
  speed?: number;
  style?: any;
  onAnimationFinish?: () => void;
}

export const LottieAnimation: React.FC<LottieAnimationProps> = ({
  source,
  autoPlay = true,
  loop = true,
  speed = 1,
  style,
  onAnimationFinish,
}) => {
  return (
    <LottieView
      source={source}
      autoPlay={autoPlay}
      loop={loop}
      speed={speed}
      style={[styles.animation, style]}
      onAnimationFinish={onAnimationFinish}
    />
  );
};

const styles = StyleSheet.create({
  animation: {
    width: 200,
    height: 200,
  },
});
```

---

## 💡 Usage Examples

### 1. Loading Screen

```typescript
import { LottieAnimation } from '../components/LottieAnimation';

export const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <LottieAnimation
        source={require('../assets/animations/loading.json')}
        style={{ width: 150, height: 150 }}
      />
      <Text>Processing...</Text>
    </View>
  );
};
```

### 2. AI Thinking Indicator

```typescript
export const AIThinkingScreen = () => {
  return (
    <View style={styles.aiContainer}>
      <LottieAnimation
        source={require('../assets/animations/ai-thinking.json')}
        style={{ width: 250, height: 250 }}
        speed={1.5}
      />
      <Text>AI is generating your quiz...</Text>
    </View>
  );
};
```

### 3. Success Animation (One-time)

```typescript
export const SuccessModal = ({ onComplete }) => {
  return (
    <Modal visible={true} transparent>
      <View style={styles.modalContainer}>
        <LottieAnimation
          source={require('../assets/animations/success.json')}
          loop={false}
          autoPlay={true}
          style={{ width: 200, height: 200 }}
          onAnimationFinish={onComplete}
        />
        <Text>Upload Successful!</Text>
      </View>
    </Modal>
  );
};
```

### 4. OCR Scanner

```typescript
export const OCRScannerScreen = () => {
  const [scanning, setScanning] = useState(false);

  return (
    <View style={styles.scannerContainer}>
      {scanning && (
        <LottieAnimation
          source={require('../assets/animations/scan.json')}
          style={{ width: 300, height: 300 }}
        />
      )}
      <Text>{scanning ? 'Scanning document...' : 'Ready to scan'}</Text>
    </View>
  );
};
```

### 5. Empty State

```typescript
export const EmptyPapersList = () => {
  return (
    <View style={styles.emptyState}>
      <LottieAnimation
        source={require('../assets/animations/empty.json')}
        style={{ width: 180, height: 180 }}
        speed={0.8}
      />
      <Text>No past papers yet</Text>
      <Button title="Upload First Paper" />
    </View>
  );
};
```

### 6. Achievement Unlocked

```typescript
export const AchievementModal = ({ achievement, onClose }) => {
  return (
    <Modal visible={true} transparent>
      <BlurView intensity={80} style={styles.modalBg}>
        <View style={styles.achievementCard}>
          <LottieAnimation
            source={require('../assets/animations/celebration.json')}
            loop={false}
            style={{ width: 250, height: 250 }}
            onAnimationFinish={onClose}
          />
          <Text style={styles.title}>🏆 Achievement Unlocked!</Text>
          <Text style={styles.subtitle}>{achievement.title}</Text>
        </View>
      </BlurView>
    </Modal>
  );
};
```

---

## 🎨 Integration Points

### Quiz Generation Screen

**Add**: AI thinking animation while generating questions

```typescript
{isGenerating && (
  <View style={styles.loadingOverlay}>
    <LottieAnimation
      source={require('../assets/animations/ai-thinking.json')}
      style={{ width: 200, height: 200 }}
    />
    <Text>Generating quiz questions...</Text>
  </View>
)}
```

### Quiz Result Screen

**Add**: Celebration animation for high scores

```typescript
{score >= 80 && (
  <LottieAnimation
    source={require('../assets/animations/celebration.json')}
    loop={false}
    style={{ width: 300, height: 300, position: 'absolute', top: 0 }}
  />
)}
```

### Upload Screen

**Add**: Upload animation while uploading files

```typescript
{uploading && (
  <LottieAnimation
    source={require('../assets/animations/upload.json')}
    style={{ width: 150, height: 150 }}
  />
)}
```

### OCR Scanner Screen

**Add**: Scanning animation during text recognition

```typescript
<LottieAnimation
  source={require('../assets/animations/scan.json')}
  style={{ width: 250, height: 250 }}
  speed={1.2}
/>
```

### Home Screen

**Add**: Subtle book/study animation

```typescript
<LottieAnimation
  source={require('../assets/animations/book.json')}
  style={{ width: 100, height: 100 }}
  speed={0.5}
/>
```

---

## 🎯 Best Practices

### Performance

✅ **Keep file sizes small** (< 100KB per animation)
✅ **Use `resizeMode="cover"`** for better rendering
✅ **Disable loop** for one-time animations
✅ **Clean up** with `onAnimationFinish` callback

### User Experience

✅ **Don't overuse** - Use strategically
✅ **Match animation speed** to action duration
✅ **Provide fallback** for slow devices
✅ **Test on real devices** (not just emulator)

---

## 🔧 Advanced: Custom Animations

### Control Animation Programmatically

```typescript
import { useRef } from 'react';

export const ControlledAnimation = () => {
  const animationRef = useRef<LottieView>(null);

  const playAnimation = () => {
    animationRef.current?.play();
  };

  const pauseAnimation = () => {
    animationRef.current?.pause();
  };

  const resetAnimation = () => {
    animationRef.current?.reset();
  };

  return (
    <View>
      <LottieView
        ref={animationRef}
        source={require('../assets/animations/custom.json')}
        loop={false}
        autoPlay={false}
      />
      <Button title="Play" onPress={playAnimation} />
      <Button title="Pause" onPress={pauseAnimation} />
      <Button title="Reset" onPress={resetAnimation} />
    </View>
  );
};
```

### Dynamic Color Overlay

```typescript
<LottieView
  source={require('../assets/animations/loading.json')}
  colorFilters={[
    {
      keypath: 'layer1',
      color: '#3b82f6', // Primary blue
    },
  ]}
/>
```

---

## 📥 Download Starter Pack

### Recommended Free Animations

1. **AI Thinking**
   - URL: https://lottiefiles.com/animations/ai-robot-thinking
   - Save as: `ai-thinking.json`

2. **File Upload**
   - URL: https://lottiefiles.com/animations/file-upload
   - Save as: `upload.json`

3. **Success Checkmark**
   - URL: https://lottiefiles.com/animations/success-check
   - Save as: `success.json`

4. **Loading Dots**
   - URL: https://lottiefiles.com/animations/loading-dots
   - Save as: `loading.json`

5. **Celebration**
   - URL: https://lottiefiles.com/animations/confetti
   - Save as: `celebration.json`

6. **Document Scan**
   - URL: https://lottiefiles.com/animations/document-scan
   - Save as: `scan.json`

---

## 🚀 Quick Start Checklist

- [ ] Install `lottie-react-native`
- [ ] Create `assets/animations/` folder
- [ ] Download 6-8 key animations
- [ ] Create `LottieAnimation.tsx` component
- [ ] Add to loading states
- [ ] Add to success/error states
- [ ] Add to empty states
- [ ] Test on real device
- [ ] Optimize animation file sizes

---

**Your app will look amazing with these animations! ✨**
