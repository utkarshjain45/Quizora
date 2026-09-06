# Quiz System Flow Explanation

## Complete User Flow

### 1. **User Authentication**
   - User signs up or signs in
   - JWT token is generated containing: `userId`, `name`, and `role`
   - Token is stored in `localStorage` on frontend

### 2. **Quiz Code Entry**
   - User lands on Dashboard (shows QuizCodeEntry component)
   - User enters a quiz code (e.g., "QUIZ001")
   - Frontend calls: `POST /api/v1/quiz/validate-code`
   - Backend validates quiz code and returns quiz with all questions
   - Frontend checks if user has already attempted: `GET /api/v1/quiz/{code}/has-attempted`
   - If attempted → Navigate to Result page
   - If not attempted → Navigate to Quiz Taking page

### 3. **Taking the Quiz**
   - All questions are loaded at once (single API call)
   - Questions stored in React component state (not localStorage)
   - User selects answers for each question
   - User clicks "Submit Quiz"
   - Frontend sends: `POST /api/v1/quiz/submit` with:
     ```json
     {
       "quizCode": "QUIZ001",
       "answers": {
         "question-uuid-1": 0,  
         "question-uuid-2": 2
       }
     }
     ```

### 4. **Quiz Evaluation**
   - Backend receives submission
   - For each question, compares selected answer with `correctAnswerIndex`
   - Calculates score: sum of points for correct answers
   - Saves/updates `QuizAttempt` record in database
   - Returns score and total marks

### 5. **Viewing Results**
   - User is redirected to Result page
   - Frontend calls: `GET /api/v1/quiz/{code}/attempt`
   - Displays: score, total marks, percentage, attempt date
   - If user tries to retake → automatically redirected to Result page

## Question Storage Strategy

**Why fetch all questions at once?**
- ✅ Single database query (efficient)
- ✅ Questions stored in React state (secure, can't be manipulated)
- ✅ Better user experience (no loading between questions)
- ✅ Prevents cheating (answers not exposed to client)

**Why NOT store in localStorage/sessionStorage?**
- ❌ Can be manipulated by users
- ❌ Security risk
- ❌ Not reliable for sensitive data

## Database Schema

### Tables Created Automatically:
1. **quizzes** - Stores quiz information
2. **questions** - Stores questions with options
3. **question_options** - Stores question options (ElementCollection)
4. **quiz_attempts** - Stores user quiz attempts

