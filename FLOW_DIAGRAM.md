# Quiz System Flow Diagram

## Complete System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER FLOW                                │
└─────────────────────────────────────────────────────────────────┘

1. AUTHENTICATION
   ┌─────────────┐
   │  Sign Up/In │
   └──────┬──────┘
          │
          ▼
   ┌─────────────────────────┐
   │  JWT Token Generated    │
   │  {userId, name, role}   │
   └──────┬──────────────────┘
          │
          ▼
   ┌─────────────────────────┐
   │  Token Stored in        │
   │  localStorage           │
   └──────┬──────────────────┘
          │
          ▼
   ┌─────────────────────────┐
   │  Dashboard (Home)       │
   └──────┬──────────────────┘
          │
          ▼
2. QUIZ CODE ENTRY
   ┌─────────────────────────┐
   │  User Enters Quiz Code  │
   │  e.g., "QUIZ001"        │
   └──────┬──────────────────┘
          │
          ▼
   ┌─────────────────────────┐
   │  POST /validate-code    │
   │  Checks if quiz exists  │
   └──────┬──────────────────┘
          │
          ├─── Quiz Not Found ────► Error Message
          │
          ▼ Quiz Found
   ┌─────────────────────────┐
   │  GET /has-attempted     │
   │  Check previous attempt │
   └──────┬──────────────────┘
          │
          ├─── Already Attempted ────► Result Page
          │
          ▼ Not Attempted
   ┌─────────────────────────┐
   │  Navigate to Quiz Page  │
   └──────┬──────────────────┘
          │
          ▼
3. TAKING QUIZ
   ┌─────────────────────────┐
   │  All Questions Loaded   │
   │  (Single API Call)       │
   └──────┬──────────────────┘
          │
          ▼
   ┌─────────────────────────┐
   │  Questions in React      │
   │  Component State        │
   └──────┬──────────────────┘
          │
          ▼
   ┌─────────────────────────┐
   │  User Selects Answers   │
   │  {questionId: optionIdx}│
   └──────┬──────────────────┘
          │
          ▼
   ┌─────────────────────────┐
   │  User Clicks Submit     │
   └──────┬──────────────────┘
          │
          ▼
   ┌─────────────────────────┐
   │  POST /submit           │
   │  {quizCode, answers}    │
   └──────┬──────────────────┘
          │
          ▼
4. QUIZ EVALUATION
   ┌─────────────────────────┐
   │  Backend Evaluates      │
   │  Each Answer            │
   └──────┬──────────────────┘
          │
          ▼
   ┌─────────────────────────┐
   │  Calculate Score        │
   │  Sum of correct points  │
   └──────┬──────────────────┘
          │
          ▼
   ┌─────────────────────────┐
   │  Save QuizAttempt       │
   │  (score, totalMarks)   │
   └──────┬──────────────────┘
          │
          ▼
5. RESULT DISPLAY
   ┌─────────────────────────┐
   │  GET /attempt           │
   │  Fetch saved attempt   │
   └──────┬──────────────────┘
          │
          ▼
   ┌─────────────────────────┐
   │  Display Score          │
   │  {score}/{totalMarks}  │
   │  Percentage            │
   └─────────────────────────┘
```

## Data Flow

```
FRONTEND                          BACKEND                          DATABASE
   │                                 │                                 │
   │── POST /validate-code ─────────►│                                 │
   │                                 │── Query Quiz by Code ──────────►│
   │                                 │◄── Return Quiz + Questions ─────│
   │◄── Quiz Data ───────────────────│                                 │
   │                                 │                                 │
   │  Store in React State           │                                 │
   │                                 │                                 │
   │── POST /submit ─────────────────►│                                 │
   │  {quizCode, answers}            │                                 │
   │                                 │── Evaluate Answers              │
   │                                 │── Calculate Score               │
   │                                 │── Save QuizAttempt ────────────►│
   │                                 │◄── Confirm Save ─────────────────│
   │◄── {score, totalMarks} ──────────│                                 │
   │                                 │                                 │
   │── GET /attempt ─────────────────►│                                 │
   │                                 │── Query QuizAttempt ───────────►│
   │                                 │◄── Return Attempt Data ──────────│
   │◄── Attempt Data ─────────────────│                                 │
```

## Question Storage Strategy

```
┌─────────────────────────────────────────────────────────────┐
│  WHY FETCH ALL QUESTIONS AT ONCE?                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ Single Database Query                                   │
│     └─> Efficient, fast loading                            │
│                                                             │
│  ✅ Stored in React State                                   │
│     └─> Secure, can't be manipulated                        │
│                                                             │
│  ✅ Better UX                                               │
│     └─> No loading between questions                        │
│                                                             │
│  ✅ Prevents Cheating                                       │
│     └─> Correct answers never sent to client                │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  WHY NOT localStorage/sessionStorage?                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ❌ Can be manipulated by users                             │
│     └─> Users can modify stored data                        │
│                                                             │
│  ❌ Security Risk                                           │
│     └─> Sensitive data exposed                              │
│                                                             │
│  ❌ Not Reliable                                            │
│     └─> Can be cleared, not persistent                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

