# How to Insert Quiz Using API

## Option 1: Using the Admin API Endpoint

I've created an admin endpoint that allows you to create quizzes via API calls.

### Example API Request

**Endpoint:** `POST http://localhost:8080/api/v1/admin/quiz/create`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "code": "QUIZ001",
  "title": "JavaScript Basics Quiz",
  "description": "Test your knowledge of JavaScript fundamentals",
  "questions": [
    {
      "questionText": "What is the correct way to declare a variable in JavaScript?",
      "options": [
        "let variableName;",
        "variable variableName;",
        "var variableName;",
        "Both A and C"
      ],
      "correctAnswerIndex": 0,
      "points": 1
    },
    {
      "questionText": "What does JSON stand for?",
      "options": [
        "JavaScript Object Notation",
        "JavaScript Oriented Notation",
        "Java Script Object Network",
        "JavaScript Object Network"
      ],
      "correctAnswerIndex": 0,
      "points": 1
    },
    {
      "questionText": "Which method is used to add an element to the end of an array?",
      "options": [
        "push()",
        "pop()",
        "shift()",
        "unshift()"
      ],
      "correctAnswerIndex": 0,
      "points": 2
    }
  ]
}
```

### Using cURL:
```bash
curl -X POST http://localhost:8080/api/v1/admin/quiz/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "code": "QUIZ001",
    "title": "JavaScript Basics Quiz",
    "description": "Test your knowledge of JavaScript fundamentals",
    "questions": [
      {
        "questionText": "What is the correct way to declare a variable in JavaScript?",
        "options": ["let variableName;", "variable variableName;", "var variableName;", "Both A and C"],
        "correctAnswerIndex": 0,
        "points": 1
      }
    ]
  }'
```

### Using Postman:
1. Set method to `POST`
2. URL: `http://localhost:8080/api/v1/admin/quiz/create`
3. Headers: Add `Authorization: Bearer <token>` and `Content-Type: application/json`
4. Body: Select "raw" and "JSON", paste the JSON above

## Option 2: Using SQL Script

See `INSERT_QUIZ_EXAMPLE.sql` for direct database insertion.

## Important Notes:

1. **Quiz Code**: Must be unique across all quizzes
2. **Correct Answer Index**: 0-based (0 = first option, 1 = second option, etc.)
3. **Points**: Optional, defaults to 1 if not specified
4. **Options**: Must have at least 2 options per question
5. **Authentication**: The admin endpoint requires authentication (you need to be logged in)

