# Quizerr — Interactive Quiz Application

A feature-rich, browser-based quiz application built with vanilla HTML, CSS, and JavaScript. Fetches real trivia questions from the [Open Trivia Database](https://opentdb.com/) and provides a timed quiz experience with full analytics.

## 🚀 Features

- **Quiz Setup** — Choose from 8 categories and 4 difficulty levels
- **Timed Questions** — 20-second countdown per question with auto-advance
- **Real-Time Feedback** — Instant correct/wrong visual indicators
- **Results Page** — Animated score ring, stat cards, and wrong-answer breakdown
- **Progress Dashboard** — Session history, strongest/weakest category analysis, CSS-only score trend bars
- **Dynamic Home Page** — Lifetime stats from localStorage, or "Start Your First Quiz" CTA for new users
- **Dark/Light Mode** — Toggle persisted in localStorage
- **Fully Responsive** — Works on desktop, tablet, and mobile

## 🎨 Design System

- **Font**: Outfit (Google Fonts)
- **Theme**: Dark glassmorphism with purple/cyan gradient accents
- **Animations**: CSS keyframes, smooth transitions, scroll-linked reveals
- **No external chart libraries** — Score trends use pure CSS Flexbox

## 📁 Project Structure

```
summerTask/
├── index.html          # Home page with hero + lifetime stats
├── newquiz.html        # Quiz setup (category & difficulty)
├── quizque.html        # Quiz interface (questions + timer)
├── results.html        # Score display + wrong-answer breakdown
├── dashboard.html      # Analytics dashboard
├── indexStyle.css       # All styles (shared across pages)
├── index.js            # Home + Setup page logic (API fetch)
├── quiz.js             # Quiz engine (timer, scoring, navigation)
├── results.js          # Results rendering + localStorage save
├── dashboard.js        # Dashboard stats computation + rendering
├── darkmode.js         # Dark/Light mode toggle (shared)
└── README.md
```

## 💾 localStorage Schema

All quiz sessions are stored under the key `quizerr_sessions` as a JSON array:

```json
{
  "quizerr_sessions": [
    {
      "id": "session_1726389285000",
      "date": "2026-09-15T12:34:45+05:30",
      "category": "Science: Computers",
      "categoryId": "18",
      "difficulty": "medium",
      "totalQuestions": 10,
      "score": 7,
      "correctCount": 7,
      "wrongCount": 3,
      "timePerQuestion": 20,
      "questions": [
        {
          "question": "What does CPU stand for?",
          "correct_answer": "Central Processing Unit",
          "selected_answer": "Central Processing Unit",
          "all_answers": ["Central Processing Unit", "Central Program Utility", "Computer Personal Unit", "Central Processor Unit"],
          "is_correct": true
        }
      ]
    }
  ]
}
```

Dark mode preference is stored under `quizerr_darkmode` (`"light"` or `"dark"`).

## 🔗 API

Questions are fetched from the **Open Trivia Database**:

```
GET https://opentdb.com/api.php?amount=10&category={id}&difficulty={level}&type=multiple
```

## 🛠️ Setup

No build tools required. Simply open `index.html` in a browser or serve with any static file server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .
```

## 📦 Tech Stack

- HTML5, CSS3, JavaScript (ES6+)
- Bootstrap 5.3 (layout grid + utilities only)
- Bootstrap Icons + Font Awesome (icons)
- Open Trivia Database API
- localStorage / sessionStorage for data persistence
