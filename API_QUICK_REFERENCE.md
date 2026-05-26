# 🚀 AI Features API Quick Reference

## Base URL
```
http://localhost:5000/api/v1/ai
```

All endpoints require:
- **Authentication:** `Authorization: Bearer <token>`
- **Rate Limit:** 10 requests per minute per user

---

## 1️⃣ AI Note Summary

### Endpoint
```http
POST /api/v1/ai/summarize
```

### Request
```json
{
  "notes": "Your study notes...",
  "subject": "Physics",
  "style": "bullet"
}
```

### Response
```json
{
  "success": true,
  "data": {
    "summary": "📌 Key Points:\n\n1. ...",
    "style": "bullet",
    "inputChars": 1234,
    "usage": { "total_tokens": 579 }
  }
}
```

---

## 2️⃣ AI Quiz Generator

### Endpoint
```http
POST /api/v1/ai/quiz
```

### Request
```json
{
  "topic": "Photosynthesis",
  "numQuestions": 5,
  "difficulty": "medium"
}
```

### Response
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "questionNumber": 1,
        "question": "What is...",
        "options": ["A)", "B)", "C)", "D)"],
        "answer": "B)",
        "explanation": "..."
      }
    ]
  }
}
```

---

## 3️⃣ AI Tutor Chatbot

### Endpoint
```http
POST /api/v1/ai/ask
```

### Request
```json
{
  "question": "Explain Newton's Second Law",
  "context": "Optional study material"
}
```

### Response
```json
{
  "success": true,
  "data": {
    "question": "Explain Newton's Second Law",
    "answer": "Newton's Second Law states...",
    "usage": { "total_tokens": 123 }
  }
}
```

---

## 4️⃣ AI Voice Explanation 🆕

### Endpoint
```http
POST /api/v1/ai/speak
```

### Request
```json
{
  "text": "The answer is...",
  "voice": "nova",
  "format": "mp3"
}
```

### Response
**Binary audio data** (audio/mp3)

### cURL Example
```bash
curl -X POST http://localhost:5000/api/v1/ai/speak \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"text":"Hello from AI","voice":"nova"}' \
  --output test.mp3
```

### Available Voices
- `alloy` - Neutral and balanced
- `echo` - Clear and articulate
- `fable` - Warm and expressive
- `onyx` - Deep and authoritative
- `nova` - Friendly and energetic ⭐ (default)
- `shimmer` - Gentle and soothing

---

## 5️⃣ AI Smart Recommendations 🆕

### Endpoint
```http
GET /api/v1/ai/recommendations
```

### Request
No body required (uses authenticated user's analytics)

### Response
```json
{
  "success": true,
  "data": {
    "recommendations": {
      "weakSubjects": [
        {
          "subject": "Mathematics",
          "reason": "Low quiz scores (avg 58%)",
          "priority": "high"
        }
      ],
      "strengths": ["Biology", "Consistent study"],
      "recommendations": [
        {
          "category": "Study Strategy",
          "suggestion": "Focus on practice problems",
          "action": "Complete 5 math problems daily"
        }
      ],
      "studyPlan": {
        "dailyGoalMinutes": 90,
        "focusAreas": ["Calculus"],
        "weeklyTargets": ["Complete 3 quizzes"]
      }
    },
    "basedOn": {
      "totalActivities": 47,
      "totalStudyMinutes": 680
    }
  }
}
```

### cURL Example
```bash
curl http://localhost:5000/api/v1/ai/recommendations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Complete Endpoint List

| # | Endpoint | Method | Feature |
|---|----------|--------|---------|
| 1 | `/ai/summarize` | POST | Note Summary |
| 2 | `/ai/scan-summarize` | POST | Scan Summary |
| 3 | `/ai/quiz` | POST | Quiz Generator |
| 4 | `/ai/ask` | POST | AI Tutor |
| 5 | `/ai/speak` | POST | Voice (TTS) 🆕 |
| 6 | `/ai/recommendations` | GET | Study Tips 🆕 |

---

## 🔒 Authentication

### Get Token (Login)
```http
POST /api/v1/auth/login
```

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Response
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": { "id": "...", "email": "..." }
  }
}
```

### Use Token
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## ⚡ Rate Limiting

**Per User Limits:**
- **Window:** 1 minute
- **Max Requests:** 10
- **Exceeded Response:**
  ```json
  {
    "success": false,
    "message": "Too many requests"
  }
  ```

---

## 🧪 Testing Script

### test-all-ai-features.sh
```bash
#!/bin/bash

TOKEN="your-jwt-token-here"
BASE_URL="http://localhost:5000/api/v1/ai"

echo "Testing AI Features..."

# 1. Test Summary
echo -e "\n1️⃣ Testing AI Summary..."
curl -X POST "$BASE_URL/summarize" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notes":"Photosynthesis is the process by which plants make food","style":"bullet"}'

# 2. Test Quiz
echo -e "\n\n2️⃣ Testing Quiz Generator..."
curl -X POST "$BASE_URL/quiz" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"topic":"JavaScript","numQuestions":3,"difficulty":"easy"}'

# 3. Test AI Tutor
echo -e "\n\n3️⃣ Testing AI Tutor..."
curl -X POST "$BASE_URL/ask" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question":"What is React?"}'

# 4. Test Voice (saves to file)
echo -e "\n\n4️⃣ Testing AI Voice..."
curl -X POST "$BASE_URL/speak" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello, I am your AI study assistant","voice":"nova"}' \
  --output test-speech.mp3
echo "Audio saved to test-speech.mp3"

# 5. Test Recommendations
echo -e "\n\n5️⃣ Testing AI Recommendations..."
curl "$BASE_URL/recommendations" \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n\n✅ All tests complete!"
```

### PowerShell Version (Windows)
```powershell
# test-all-ai-features.ps1
$TOKEN = "your-jwt-token-here"
$BASE_URL = "http://localhost:5000/api/v1/ai"
$HEADERS = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

Write-Host "Testing AI Features..." -ForegroundColor Cyan

# 1. Summary
Write-Host "`n1️⃣ Testing AI Summary..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$BASE_URL/summarize" -Method POST -Headers $HEADERS `
    -Body '{"notes":"Photosynthesis is...","style":"bullet"}' | ConvertTo-Json

# 2. Quiz
Write-Host "`n2️⃣ Testing Quiz Generator..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$BASE_URL/quiz" -Method POST -Headers $HEADERS `
    -Body '{"topic":"JavaScript","numQuestions":3}' | ConvertTo-Json

# 3. Tutor
Write-Host "`n3️⃣ Testing AI Tutor..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$BASE_URL/ask" -Method POST -Headers $HEADERS `
    -Body '{"question":"What is React?"}' | ConvertTo-Json

# 4. Voice
Write-Host "`n4️⃣ Testing AI Voice..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$BASE_URL/speak" -Method POST -Headers $HEADERS `
    -Body '{"text":"Hello from AI","voice":"nova"}' -OutFile "test-speech.mp3"
Write-Host "Audio saved to test-speech.mp3" -ForegroundColor Green

# 5. Recommendations
Write-Host "`n5️⃣ Testing AI Recommendations..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$BASE_URL/recommendations" -Headers $HEADERS | ConvertTo-Json

Write-Host "`n✅ All tests complete!" -ForegroundColor Green
```

---

## 🐛 Common Errors

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authenticated"
}
```
**Solution:** Check your JWT token is valid

### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Too many requests"
}
```
**Solution:** Wait 1 minute before retrying

### 500 OpenAI Error
```json
{
  "success": false,
  "message": "AI service error"
}
```
**Solutions:**
- Check `OPENAI_API_KEY` in `.env`
- Verify OpenAI API quota
- Check network connectivity

---

## 💰 Token Usage

All responses include usage info:
```json
{
  "usage": {
    "prompt_tokens": 123,
    "completion_tokens": 456,
    "total_tokens": 579
  }
}
```

**Tracking Costs:**
- gpt-4o-mini: $0.00015 per 1K tokens (input)
- gpt-4o-mini: $0.0006 per 1K tokens (output)
- TTS: $0.015 per 1M characters

---

## 🔗 Quick Links

- **Swagger UI:** http://localhost:5000/api-docs
- **Health Check:** http://localhost:5000/health
- **Full Documentation:** [AI_FEATURES_COMPLETE.md](AI_FEATURES_COMPLETE.md)
- **OpenAI Dashboard:** https://platform.openai.com/usage

---

## 📱 Frontend Integration

### React Native Example
```tsx
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/v1/ai';

// Get recommendations
const getRecommendations = async (token: string) => {
  const response = await axios.get(`${API_BASE}/recommendations`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data.recommendations;
};

// Generate speech
const getSpeech = async (text: string, token: string) => {
  const response = await axios.post(
    `${API_BASE}/speak`,
    { text, voice: 'nova' },
    { 
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    }
  );
  return response.data; // Audio blob
};
```

---

**🎉 All 5 AI features ready to use!**
