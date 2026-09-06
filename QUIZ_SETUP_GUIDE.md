# Complete Quiz Setup Guide

## 📋 Table of Contents
1. [System Flow Explanation](#system-flow-explanation)
2. [How to Insert Questions](#how-to-insert-questions)
3. [Examples](#examples)

---

## 🔄 System Flow Explanation

### Step-by-Step Flow:

1. **User Authentication**
   - User signs up or signs in
   - Backend generates JWT token with `userId`, `name`, `role`
   - Frontend stores token in `localStorage`

2. **Quiz Code Entry (Dashboard)**
   - User sees quiz code input field
   - User enters quiz code (e.g., "QUIZ001")
   - Frontend validates code: `POST /api/v1/quiz/validate-code`
   - Backend returns quiz with ALL questions in one response
   - Frontend checks if user already attempted: `GET /api/v1/quiz/{code}/has-attempted`
   - If attempted → Show result page
   - If not attempted → Show quiz taking page

3. **Taking the Quiz**
   - All questions loaded at once (stored in React component state)
   - User selects answers for each question
   - User clicks "Submit Quiz"
   - Frontend sends: `POST /api/v1/quiz/submit`
   ```json
   {
     "quizCode": "QUIZ001",
     "answers": {
       "question-uuid-1": 0,  // selected option index (0-based)
       "question-uuid-2": 2
     }
   }
   ```

4. **Quiz Evaluation (Backend)**
   - Backend receives submission
   - For each question:
     - Gets `correctAnswerIndex` from database
     - Compares with user's selected answer
     - If match → adds question's `points` to score
   - Calculates total score
   - Saves/updates `QuizAttempt` in database
   - Returns: `{score, totalMarks, isRetake}`

5. **Viewing Results**
   - User redirected to result page
   - Frontend fetches: `GET /api/v1/quiz/{code}/attempt`
   - Displays: score, total marks, percentage, attempt date
   - If user tries to retake → automatically redirected to result

### Why This Approach?

**✅ Fetch All Questions at Once:**
- Single database query (efficient)
- Better performance
- Simpler code

**✅ Store in React State (NOT localStorage):**
- Secure (can't be manipulated)
- Prevents cheating
- Correct answers never sent to client

**✅ Prevent Retaking:**
- Check on quiz code entry
- Check before showing quiz
- Redirect to result if already attempted

---

## 📝 How to Insert Questions

You have **3 options** to insert quizzes:

### Option 1: Using Admin API (Recommended) ⭐

**Endpoint:** `POST http://localhost:8080/api/v1/admin/quiz/create`

**Steps:**
1. Login to get JWT token
2. Use token to create quiz via API
3. See `INSERT_QUIZ_USING_API.md` for detailed examples

**Example Request:**
```json
{
  "code": "QUIZ001",
  "title": "JavaScript Basics",
  "description": "Test your JS knowledge",
  "questions": [
    {
      "questionText": "What is 2 + 2?",
      "options": ["3", "4", "5", "6"],
      "correctAnswerIndex": 1,
      "points": 1
    }
  ]
}
```

**Using Python Script:**
```bash
python create_quiz.py
```
(Edit the script to customize quiz data)

### Option 2: Using SQL Script

**File:** `INSERT_QUIZ_EXAMPLE.sql`

**Steps:**
1. Connect to your PostgreSQL database
2. Run the SQL script
3. Modify quiz code, questions, and options as needed

**Example:**
```sql
-- Insert Quiz
INSERT INTO quizzes (id, code, title, description, is_active)
VALUES (gen_random_uuid(), 'QUIZ001', 'My Quiz', 'Description', true);

-- Insert Question
INSERT INTO questions (id, quiz_id, question_text, correct_answer_index, points)
VALUES (
    gen_random_uuid(),
    (SELECT id FROM quizzes WHERE code = 'QUIZ001'),
    'What is 2 + 2?',
    1,  -- Index 1 = second option (0-based)
    1
);

-- Insert Options
INSERT INTO question_options (question_id, option_text)
VALUES
    ((SELECT id FROM questions WHERE question_text = 'What is 2 + 2?'), '3'),
    ((SELECT id FROM questions WHERE question_text = 'What is 2 + 2?'), '4'),
    ((SELECT id FROM questions WHERE question_text = 'What is 2 + 2?'), '5'),
    ((SELECT id FROM questions WHERE question_text = 'What is 2 + 2?'), '6');
```

### Option 3: Using HTTP File (VS Code REST Client)

**File:** `CREATE_QUIZ_EXAMPLE.http`

1. Install "REST Client" extension in VS Code
2. Open the `.http` file
3. Update email/password
4. Click "Send Request"

---

## 📚 Examples

### Example 1: Simple Math Quiz

```json
{
  "code": "MATH101",
  "title": "Basic Math Quiz",
  "description": "Simple arithmetic questions",
  "questions": [
    {
      "questionText": "What is 5 + 3?",
      "options": ["6", "7", "8", "9"],
      "correctAnswerIndex": 2,
      "points": 1
    },
    {
      "questionText": "What is 10 × 2?",
      "options": ["18", "20", "22", "24"],
      "correctAnswerIndex": 1,
      "points": 1
    }
  ]
}
```

### Example 2: Multiple Choice with Different Points

```json
{
  "code": "ADVANCED001",
  "title": "Advanced Quiz",
  "description": "Mixed difficulty questions",
  "questions": [
    {
      "questionText": "Easy question?",
      "options": ["A", "B", "C", "D"],
      "correctAnswerIndex": 0,
      "points": 1
    },
    {
      "questionText": "Hard question?",
      "options": ["A", "B", "C", "D"],
      "correctAnswerIndex": 2,
      "points": 3  // Worth more points
    }
  ]
}
```

### Important Notes:

1. **correctAnswerIndex is 0-based:**
   - 0 = First option
   - 1 = Second option
   - 2 = Third option
   - etc.

2. **Quiz Code must be unique:**
   - Each quiz needs a unique code
   - Users will enter this code to take the quiz

3. **Points are optional:**
   - Defaults to 1 if not specified
   - Can assign different points per question

4. **Minimum 2 options required:**
   - Each question needs at least 2 options
   - No maximum limit

---

## 🧪 Testing Your Quiz

1. **Create a quiz** using one of the methods above
2. **Start your backend:** `mvn spring-boot:run`
3. **Start your frontend:** `npm run dev`
4. **Sign up/Login** as a user
5. **Enter the quiz code** on the dashboard
6. **Take the quiz** and submit
7. **View your results**

---

## 🔍 Verifying Data in Database

```sql
-- View all quizzes
SELECT code, title, description, is_active FROM quizzes;

-- View questions for a quiz
SELECT q.question_text, q.correct_answer_index, q.points
FROM questions q
JOIN quizzes qu ON q.quiz_id = qu.id
WHERE qu.code = 'QUIZ001';

-- View options for a question
SELECT qo.option_text
FROM question_options qo
JOIN questions q ON qo.question_id = q.id
WHERE q.question_text = 'Your question text here';

-- View quiz attempts
SELECT u.email, q.code, qa.score, qa.total_marks, qa.attempted_at
FROM quiz_attempts qa
JOIN users u ON qa.user_id = u.id
JOIN quizzes q ON qa.quiz_id = q.id;
```

---

## 🚀 Quick Start Checklist

- [ ] Backend running on port 8080
- [ ] Frontend running (usually port 5173)
- [ ] Database connected and configured
- [ ] Created at least one quiz
- [ ] Created a user account
- [ ] Tested the complete flow

---

## 📖 Additional Resources

- `QUIZ_FLOW_EXPLANATION.md` - Detailed flow explanation
- `FLOW_DIAGRAM.md` - Visual flow diagrams
- `INSERT_QUIZ_EXAMPLE.sql` - SQL insertion script
- `INSERT_QUIZ_USING_API.md` - API usage guide
- `create_quiz.py` - Python script for quiz creation

