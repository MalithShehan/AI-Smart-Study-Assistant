# Premium UI/UX Components & Screens Guide

## Overview

This guide documents the production-level components and screens created for the AI Study Assistant app, built with React Native, TypeScript, NativeWind, React Navigation, and Reanimated.

---

## Table of Contents

1. [UI Components](#ui-components)
2. [Screens](#screens)
3. [Backend API](#backend-api)
4. [Integration Guide](#integration-guide)
5. [Design Tokens](#design-tokens)
6. [Best Practices](#best-practices)

---

## UI Components

### 1. **GradientCard**
A reusable gradient background component perfect for highlighting important sections.

**Location:** `frontend/src/components/PremiumUI.tsx`

**Props:**
```typescript
interface GradientCardProps {
  children: React.ReactNode;
  colors?: [string, string, ...string[]];
  startPoint?: { x: number; y: number };
  endPoint?: { x: number; y: number };
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
  shadow?: boolean;
}
```

**Example Usage:**
```tsx
<GradientCard colors={['#3b82f6', '#1e40af']} borderRadius={16}>
  <View className="p-6">
    <Text className="text-white font-bold">Your Content</Text>
  </View>
</GradientCard>
```

**Features:**
- ✅ Custom gradient colors
- ✅ Customizable border radius
- ✅ Optional shadow (elevation)
- ✅ Responsive sizing

---

### 2. **PremiumButton**
A versatile button component with multiple variants and states.

**Location:** `frontend/src/components/PremiumUI.tsx`

**Props:**
```typescript
interface PremiumButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}
```

**Variants:**
- `primary` - Blue background (default, for main actions)
- `secondary` - Gray background (for secondary actions)
- `outline` - Transparent with border (for tertiary actions)
- `danger` - Red background (for destructive actions)
- `success` - Green background (for confirmations)

**Example Usage:**
```tsx
<PremiumButton
  label="Save Results"
  onPress={() => handleSave()}
  variant="primary"
  size="lg"
  fullWidth
/>

<PremiumButton
  label="Loading..."
  onPress={() => {}}
  loading={true}
  disabled={true}
/>
```

**Features:**
- ✅ 5 visual variants
- ✅ 3 sizes (sm, md, lg)
- ✅ Loading state with spinner
- ✅ Disabled state support
- ✅ Optional icon support
- ✅ Spring animation on press

---

### 3. **StatCard**
A gradient card designed for displaying key metrics and analytics.

**Location:** `frontend/src/components/PremiumUI.tsx`

**Props:**
```typescript
interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  colors?: [string, string];
  trend?: { value: number; positive: boolean };
}
```

**Example Usage:**
```tsx
<StatCard
  label="Quizzes Completed"
  value={24}
  subtext="This month"
  colors={['#10b981', '#059669']}
  trend={{ value: 15, positive: true }}
/>
```

**Features:**
- ✅ Large, readable typography
- ✅ Trend indicator (↑↓)
- ✅ Custom gradient colors
- ✅ Optional icon
- ✅ Subtext support

---

### 4. **ExpandableCard**
A collapsible card for grouping related settings or information.

**Location:** `frontend/src/components/PremiumUI.tsx`

**Props:**
```typescript
interface ExpandableCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  expanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  icon?: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
}
```

**Variants:**
- `info` - Blue theme
- `success` - Green theme
- `warning` - Yellow theme
- `error` - Red theme

**Example Usage:**
```tsx
<ExpandableCard
  title="Danger Zone"
  description="Irreversible actions"
  variant="error"
>
  <PremiumButton label="Delete Account" onPress={handleDelete} variant="danger" />
</ExpandableCard>
```

**Features:**
- ✅ Smooth expand/collapse animation
- ✅ Color-coded by type
- ✅ Icon support
- ✅ Description text
- ✅ Toggle callback

---

### 5. **Badge**
Small, colorful labels for status, tags, or categories.

**Location:** `frontend/src/components/PremiumUI.tsx`

**Props:**
```typescript
interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}
```

**Example Usage:**
```tsx
<Badge label="Verified" variant="success" size="md" />
<Badge label="Premium" variant="primary" size="lg" />
```

**Features:**
- ✅ 5 color variants
- ✅ 3 sizes
- ✅ Rounded pill shape
- ✅ Lightweight & reusable

---

### 6. **ProgressRing**
Circular progress indicator with animated arc.

**Location:** `frontend/src/components/PremiumUI.tsx`

**Props:**
```typescript
interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  colors?: [string, string];
  label?: string;
  subLabel?: string;
}
```

**Example Usage:**
```tsx
<ProgressRing
  percentage={78}
  size={120}
  colors={['#3b82f6', '#1e40af']}
  label="78%"
  subLabel="Quiz Score"
/>
```

**Features:**
- ✅ Smooth animated arc
- ✅ Customizable size & color
- ✅ Center content display
- ✅ SVG-based rendering

---

### 7. **EmptyState**
A placeholder component for empty lists or sections.

**Location:** `frontend/src/components/PremiumUI.tsx`

**Props:**
```typescript
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}
```

**Example Usage:**
```tsx
<EmptyState
  icon={<Text className="text-4xl">📋</Text>}
  title="No Quizzes Yet"
  description="Start your first quiz to see results here"
  actionLabel="Create Quiz"
  onAction={() => navigation.navigate('QuizGenerator')}
/>
```

**Features:**
- ✅ Icon display
- ✅ Title & description
- ✅ Optional CTA button
- ✅ Centered layout

---

## Screens

### 1. **QuizResultScreen**
Full-featured quiz results display with detailed answer review.

**Location:** `frontend/src/screens/QuizResultScreen.tsx`

**Route Props:**
```typescript
{
  quizId: string;
  timeTaken: number;
}
```

**Features:**
- ✅ Large animated score display
- ✅ Color-coded performance (green/yellow/red)
- ✅ Time & accuracy stats
- ✅ Performance bar chart
- ✅ Expandable answer review
- ✅ Color-coded correct/incorrect answers
- ✅ Detailed explanations
- ✅ Save, Retake, Home buttons
- ✅ Smooth spring animations
- ✅ Gradient backgrounds

**Key Functions:**
```typescript
const animateScore = () => { /* Spring animation for score */ }
const getScoreColor = (percentage: number) => { /* Color logic */ }
const formatTime = (seconds: number) => string
```

**Data Source:**
Fetches from backend: `GET /api/v1/ai/quiz-results/:quizId`

---

### 2. **SettingsScreen**
Complete settings and preferences management.

**Location:** `frontend/src/screens/SettingsScreen.tsx`

**Features:**
- ✅ User profile card with gradient
- ✅ Notification preferences
- ✅ Display preferences (dark mode)
- ✅ Privacy & analytics toggle
- ✅ Account management
- ✅ Danger zone (logout, delete account)
- ✅ About & version info
- ✅ Smooth staggered animations

**Settings Sections:**
1. **Notifications**
   - Push notifications toggle
   - Email updates toggle

2. **Preferences**
   - Dark mode toggle
   - Analytics toggle

3. **Account**
   - Change password
   - Privacy policy
   - Terms & conditions

4. **Danger Zone**
   - Logout (with confirmation)
   - Delete account (with confirmation)

---

## Backend API

### Quiz Results Endpoints

#### 1. **Submit Quiz**
```http
POST /api/v1/ai/submit-quiz
Authorization: Bearer <token>
Content-Type: application/json

{
  "quizId": "quiz_id_here",
  "answers": ["A", "B", "C"],
  "timeTaken": 120
}
```

**Response:**
```json
{
  "resultId": "result_id",
  "score": 2,
  "totalQuestions": 3,
  "percentage": 67,
  "timeTaken": 120,
  "questions": [
    {
      "id": "q1",
      "question": "What is...",
      "userAnswer": "A",
      "correctAnswer": "A",
      "isCorrect": true
    }
  ]
}
```

#### 2. **Get Quiz Results**
```http
GET /api/v1/ai/quiz-results/:quizId
Authorization: Bearer <token>
```

#### 3. **Get All Results**
```http
GET /api/v1/ai/results?page=1&limit=10&sort=-completedAt
Authorization: Bearer <token>
```

#### 4. **Get Performance Analytics**
```http
GET /api/v1/ai/analytics/performance
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalQuizzes": 15,
  "averageScore": 78.5,
  "maxScore": 95,
  "minScore": 62,
  "totalTimeSpent": 1800,
  "averageTime": 120,
  "totalCorrectAnswers": 235
}
```

#### 5. **Update Preferences**
```http
PATCH /api/v1/users/preferences
Authorization: Bearer <token>

{
  "notifications": true,
  "emailUpdates": false,
  "darkMode": false,
  "analyticsEnabled": true
}
```

#### 6. **Delete Account**
```http
POST /api/v1/users/delete-account
Authorization: Bearer <token>
```

---

## Integration Guide

### Adding QuizResultScreen to Navigation

Edit `frontend/src/navigation/AppNavigator.tsx`:

```tsx
import { QuizResultScreen } from '../screens/QuizResultScreen';

type RootStackParamList = {
  // ... other screens
  QuizResultScreen: { quizId: string; timeTaken: number };
};

export const AppNavigator = () => {
  return (
    <Stack.Navigator>
      {/* ... other screens */}
      <Stack.Screen
        name="QuizResultScreen"
        component={QuizResultScreen}
        options={{
          title: 'Quiz Results',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};
```

### Navigating to QuizResultScreen

```tsx
navigation.navigate('QuizResultScreen', {
  quizId: 'quiz_123',
  timeTaken: 120, // in seconds
});
```

### Using Premium Components

```tsx
import {
  GradientCard,
  PremiumButton,
  StatCard,
  Badge,
  ExpandableCard,
  ProgressRing,
  EmptyState,
} from '../components/PremiumUI';

export const MyScreen = () => {
  return (
    <View>
      <GradientCard colors={['#3b82f6', '#1e40af']}>
        <Text>Gradient content</Text>
      </GradientCard>

      <StatCard
        label="Score"
        value="87%"
        colors={['#10b981', '#059669']}
      />

      <PremiumButton
        label="Submit"
        onPress={() => {}}
        variant="primary"
      />
    </View>
  );
};
```

---

## Design Tokens

### Colors

```typescript
// Primary
BLUE_600 = '#2563eb'
BLUE_500 = '#3b82f6'
BLUE_700 = '#1d4ed8'

// Success
GREEN_500 = '#10b981'
GREEN_600 = '#059669'

// Warning
YELLOW_500 = '#eab308'
YELLOW_600 = '#ca8a04'

// Danger
RED_500 = '#ef4444'
RED_600 = '#dc2626'

// Neutral
GRAY_900 = '#111827'
GRAY_600 = '#4b5563'
GRAY_100 = '#f3f4f6'
WHITE = '#ffffff'
```

### Typography

```typescript
// Headings
TITLE_1 = 'text-3xl font-bold'    // 30px, bold
TITLE_2 = 'text-2xl font-bold'    // 24px, bold
TITLE_3 = 'text-xl font-bold'     // 20px, bold

// Body
BODY_LARGE = 'text-base'          // 16px
BODY_REGULAR = 'text-sm'          // 14px
BODY_SMALL = 'text-xs'            // 12px

// Weights
FONT_BLACK = 'font-black'         // 900
FONT_BOLD = 'font-bold'           // 700
FONT_SEMIBOLD = 'font-semibold'   // 600
FONT_NORMAL = 'font-normal'       // 400
```

### Spacing

```typescript
// Using NativeWind (Tailwind)
px-4    // 16px horizontal
py-3    // 12px vertical
gap-3   // 12px gap
mb-6    // 24px margin-bottom
mt-2    // 8px margin-top
```

---

## Best Practices

### 1. **Animation Best Practices**
- Use `Reanimated` for smooth 60fps animations
- Prefer `withSpring()` for natural motion
- Use `Easing.out()` for exit animations
- Keep animation duration 200-400ms for UI transitions

```tsx
scale.value = withSpring(1, { damping: 8 }); // Smooth spring
opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
```

### 2. **Component Composition**
- Keep components small and focused
- Use TypeScript interfaces for prop validation
- Provide sensible defaults
- Support style prop for customization

```tsx
interface MyComponentProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  style?: StyleProp<ViewStyle>;
}
```

### 3. **Performance**
- Use `ActivityIndicator` for loading states
- Implement lazy loading for lists
- Memoize expensive components
- Use `FlatList` for long lists (not `ScrollView`)

### 4. **Accessibility**
- Use meaningful colors with good contrast
- Provide alt text for icons
- Use large touch targets (min 44x44)
- Test with screen readers

### 5. **Dark Mode (Future)**
Currently implemented but can be expanded:
```tsx
const isDarkMode = useColorScheme() === 'dark';
className={isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}
```

---

## Testing Checklist

- [ ] All components render without errors
- [ ] Animations are smooth (60fps)
- [ ] API calls complete successfully
- [ ] Error states are handled gracefully
- [ ] Loading states display correctly
- [ ] Responsive layout on different screen sizes
- [ ] Touch targets are large enough
- [ ] Colors meet WCAG contrast standards
- [ ] No console errors or warnings
- [ ] Performance is acceptable (< 200ms load time)

---

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── PremiumUI.tsx          ← All reusable components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Header.tsx
│   │   └── ...
│   ├── screens/
│   │   ├── QuizResultScreen.tsx   ← Quiz results display
│   │   ├── SettingsScreen.tsx     ← Settings management
│   │   └── ...
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   ├── api/
│   │   └── client.ts              ← HTTP client
│   └── context/
│       └── AuthContext.tsx
│
backend/
├── src/
│   ├── routes/
│   │   └── results.js             ← Quiz results API
│   ├── models/
│   │   └── Result.js              ← Result model
│   └── ...
```

---

## Support

For questions or issues, check:
1. Component prop types (TypeScript interfaces)
2. Example usage in this guide
3. Backend API response format
4. Error handling in try-catch blocks

---

**Last Updated:** May 26, 2026  
**Version:** 1.0.0  
**Status:** Production Ready ✅
