# JP Voice AI - Japanese Pronunciation Assistant

An Artificial Intelligence (AI) Web App designed to help Japanese learners practice and improve their pronunciation. It automatically recognizes speech, scores pronunciation down to the phoneme level, and provides visual, actionable feedback.

## 🚀 Key Features

- 🎙️ **Audio Recording & Automatic Speech Recognition (ASR)**: The Set Text feature allows you to upload audio files. The AI automatically transcribes the speech into Japanese text (Kana) so you can quickly generate practice materials.
- 🎯 **Advanced AI Scoring**:
  - **Pronunciation**: Scored based on phoneme alignment using Wav2Vec2 and PyOpenJTalk.
  - **Completeness**: Detects and highlights skipped or unread words.
  - **Fluency**: Evaluates the reading speed and naturalness of the sentence.
- 💡 **Actionable Feedback**: Displays errors using color codes (Green, Yellow, Red) on individual words and provides specific advice (e.g., "Elongate the vowel", "The 'tsu' sound is unclear").
- 🎨 **Modern Interface (Dark/Light Mode)**: A sleek, responsive UI with full Dark/Light mode support, smooth transitions, and automatic theme preference saving.
- 🎧 **Professional AI Audio Player (AI Voice & Waveform)**: 
  - Choose from **7 native-sounding AI voices (Male/Female)**.
  - Visual audio representation using **Waveforms**.
  - **Adjustable playback speed** (0.75x, 1x, 1.25x) perfect for Shadowing practice.
- 💾 **History Tracking**: Automatically saves your scores, audio recordings, and practice history securely in a local SQLite database.

---

## 🏗️ System Architecture (Monolithic)

The project utilizes a modern, flattened Monolithic architecture (1 Repo - 1 Root) for ultimate simplicity and ease of deployment:

- **Frontend (React + Vite + TailwindCSS v4)**: The source code resides in `src/`. When built, the static assets are output to `dist/`.
- **Backend (FastAPI + Python)**: The entry point is `main.py`. The FastAPI server handles heavy AI audio processing (ASR, Scoring, TTS), manages the SQLite database (`history.db`), and simultaneously serves the static Frontend React build (`dist/`).

Everything runs seamlessly on a single port (`8000`), eliminating CORS issues and simplifying the development workflow.

---

## ⚙️ Installation and Setup Guide

### Basic System Requirements:
- **Node.js** (v18 or higher) - Required for Frontend development and building.
- **Python** (v3.10 or higher). Installing the `uv` package manager is highly recommended for blazing-fast package installation.

### Step 1: Install Dependencies
Open your terminal at the project root `jp-voice-text/`:
```bash
# Install Node modules for the frontend
npm install

# Install Python packages for the backend (using uv)
uv sync
```

### Step 2: Build the Frontend
Compile the React code into static assets for FastAPI to serve:
```bash
npm run build
```
*(Note: You only need to run this command when you make changes to the React code in `src/`)*.

### Step 3: Start the Server
Start the unified FastAPI server:
```bash
uv run uvicorn main:app --reload
```

> 🎉 **The App will run at:** http://localhost:8000

*(Note: The first time you score pronunciation or use ASR, the system will automatically download models from HuggingFace, which may take a few minutes depending on your connection).*

---

## 💻 Development Mode (Hot Reload)

If you are actively modifying the React frontend UI and want instant updates (Hot Reload) without running `npm run build` every time, you can run the app in Development Mode:

1. **Start the FastAPI Backend:**
   ```bash
   uv run uvicorn main:app --reload
   ```
2. **Start the Vite Dev Server (in a new terminal):**
   ```bash
   npm run dev
   ```
3. Open your browser to **http://localhost:5173**. Vite will handle the UI Hot Reload while automatically proxying API requests to FastAPI on port 8000.

---

## 🌐 Experiencing the App

**Important Notes:**
- The **Recording** feature requires the browser to grant Microphone permissions. This permission is usually only granted when running via `localhost` or a secure `https` URL.
- The **Listen to Sample** feature uses an API to fetch MP3 Audio, so ensure your computer has an Internet connection to reach the Edge-TTS service.
