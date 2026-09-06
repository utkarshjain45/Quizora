#!/usr/bin/env python3
"""
Script to create a quiz via API
Usage: python create_quiz.py
"""

import requests
import json

BASE_URL = "http://localhost:8080"
ADMIN_EMAIL = "admin@example.com"  
ADMIN_PASSWORD = "yourpassword"     

def login():
    """Login and get JWT token"""
    url = f"{BASE_URL}/api/v1/auth/login"
    payload = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    
    response = requests.post(url, json=payload)
    if response.status_code == 200:
        token = response.json().get("token")
        print("✅ Login successful!")
        return token
    else:
        print(f"❌ Login failed: {response.text}")
        return None

def create_quiz(token, quiz_data):
    """Create a quiz using the admin API"""
    url = f"{BASE_URL}/api/v1/admin/quiz/create"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.post(url, json=quiz_data, headers=headers)
    if response.status_code == 200:
        print("✅ Quiz created successfully!")
        print(json.dumps(response.json(), indent=2))
        return True
    else:
        print(f"❌ Quiz creation failed: {response.text}")
        return False

example_quiz = {
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
        },
        {
            "questionText": "What is the result of: typeof null?",
            "options": [
                "null",
                "undefined",
                "object",
                "boolean"
            ],
            "correctAnswerIndex": 2, 
            "points": 1
        },
        {
            "questionText": "Which of the following is a truthy value in JavaScript?",
            "options": [
                "0",
                "''",
                "'0'",
                "null"
            ],
            "correctAnswerIndex": 2,
            "points": 1
        }
    ]
}

if __name__ == "__main__":
    print("🔐 Logging in...")
    token = login()
    
    if token:
        print("\n📝 Creating quiz...")
        create_quiz(token, example_quiz)
    else:
        print("❌ Cannot proceed without authentication token")

