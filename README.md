# JP Voice AI - Japanese Pronunciation Assistant

An Artificial Intelligence (AI) Web App designed to help Japanese learners practice and improve their pronunciation. It automatically recognizes speech, scores pronunciation down to the phoneme level, and provides visual, actionable feedback.

## ✨ Key Features

- 🎙️ **Audio Recording & Automatic Speech Recognition (ASR)**: The Set Text feature allows you to upload audio files. The AI automatically transcribes the speech into Japanese text (Kana) so you can quickly generate practice materials.
- 🎯 **Advanced AI Scoring**:
  - **Pronunciation**: Scored based on phoneme alignment using Wav2Vec2 and PyOpenJTalk.
  - **Completeness**: Detects and highlights skipped or unread words.
  - **Fluency**: Evaluates the reading speed and naturalness of the sentence.
- 💡 **Actionable Feedback**: Displays errors using color codes (Green, Yellow, Red) on individual words and provides specific advice (e.g., "Elongate the vowel", "The 'tsu' sound is unclear").
- 🎨 **Modern Interface (Dark/Light Mode)**: A sleek, responsive UI with full Dark/Light mode support, smooth transitions, and automatic theme preference saving.
- 🔊 **Professional AI Audio Player (AI Voice & Waveform)**: 
  - Choose from **7 native-sounding AI voices (Male/Female)**.
  - Visual audio representation using **Waveforms**.
  - **Adjustable playback speed** (0.75x, 1x, 1.25x) perfect for Shadowing practice.
  - Download MP3 or WAV files of sample sentences for offline review.
- 📊 **History Tracking**: Automatically saves your scores, audio recordings, and practice history securely in the database.

---

## 🏗️ System Architecture

The project utilizes a Microservices architecture to optimize performance and scalability:

1. **`frontend/` (React + Vite + TailwindCSS v4)**
   - The UI/UX of the application.
   - Communicates with the AI Service (ASR, scoring, TTS) and the Backend (storage).
   - Runs by default on port `5173`.
2. **`ai-service/` (FastAPI + Python)**
   - The heart of the system. Handles heavy audio processing, ASR Models, Wav2Vec2 Alignment, PyOpenJTalk, and Edge-TTS.
   - Runs by default on port `8000`.
3. **`backend/` (NestJS + PostgreSQL)**
   - Manages data logic (Database, Entities, History).
   - Runs by default on port `3000`.

---

## 🚀 Installation and Setup Guide

### Basic System Requirements:
- **Node.js** (v18 or higher).
- **Python** (v3.10 or higher). Installing the `uv` package manager is recommended for blazing-fast package installation.
- **PostgreSQL** (Installed and running on localhost).
  > **Note for new setups (PostgreSQL not installed):** You can install [Docker](https://www.docker.com/products/docker-desktop/) and open your Terminal to run the following command. This quickly initializes a database without complex setup:
  > ```bash
  > docker run --name jp-voice-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=jp_voice -p 5432:5432 -d postgres
  > ```

### Step 1: Start the Backend (NestJS)
The backend handles user history storage.
```bash
cd backend
npm install
# Start NestJS development server
npm run start:dev
```
*DB Configuration:* Ensure your Postgres database is running. You may need to configure the `.env` file or update the DB connection URL in the NestJS source code to match your machine (e.g., `postgresql://postgres:password@localhost:5432/jp_voice`).

> 👉 The Backend will run at: http://localhost:3000

### Step 2: Start the AI Service (FastAPI)
The AI Service processes all heavy audio computation logic.
```bash
cd ai-service
# Initialize the environment and install AI libraries (torch, librosa, fastapi...)
uv pip install -r requirements.txt
# Or if using traditional pip: pip install -r requirements.txt

# Start FastAPI server
uv run fastapi dev main.py
```
> 👉 The AI Service will run at: http://localhost:8000
> *(Note: The first time you score pronunciation or use ASR, the system will automatically download models from HuggingFace, which may take a few minutes depending on your connection).*

### Step 3: Start the Frontend (React)
Finally, start the user interface.
```bash
cd frontend
npm install

# Start Vite server
npm run dev
```
> 👉 The Frontend will run at: http://localhost:5173

---

## 🛠️ Experiencing the App
Open your browser (Chrome/Edge recommended) and navigate to **http://localhost:5173**.

**Important Notes:**
- The **Recording** feature requires the browser to grant Microphone permissions. This permission is usually only granted when running via `localhost` or a secure `https` URL.
- The **Listen to Sample** feature uses an API to fetch MP3 Audio, so ensure your computer has an Internet connection to reach the Edge-TTS service.
- If you encounter errors saving your history, double-check your Database connection in the terminal running the `backend` service.
