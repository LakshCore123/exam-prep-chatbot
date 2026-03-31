# Exam Prep Chatbot (Free — Gemini API)

AI-powered exam assistant using Google Gemini 1.5 Flash — completely free.

## Get your FREE API key (takes 1 minute)

1. Go to https://aistudio.google.com
2. Sign in with your Google account
3. Click **"Get API Key"** → **"Create API key"**
4. Copy the key (starts with `AIza...`)

## Setup

1. Open `src/config.js` and paste your key:
   ```js
   export const GEMINI_API_KEY = "AIza...your key here...";
   ```

2. Open the project in VS Code

3. Install **Live Server** extension → right-click `index.html` → **Open with Live Server**

That's it! No payment, no signup fees.

## Project Structure

```
exam-prep-gemini/
├── index.html        ← app shell
├── src/
│   ├── chatbot.js    ← Gemini API logic
│   ├── style.css     ← styles
│   └── config.js     ← your API key (keep secret!)
└── README.md
```

## Why Gemini 1.5 Flash?
- Completely free (generous daily quota)
- Fast responses
- Great for Q&A and educational content

## Security
Never push `src/config.js` to GitHub. It's in `.gitignore` already.
