# AI and Data Science for Good

An English Pronunciation Coach designed for Rohingya learners, featuring phoneme-level analysis, interactive scenarios, and visual learning aids.

## Features

- **Pronunciation Analysis:** Real-time feedback using `wav2vec2` for phoneme-level accuracy (IPA) and substitution detection.
- **Rohingya Support:** Localized feedback messages and instructions in the Rohingya language.
- **Interactive Scenarios:** Practice vocabulary and conversations in common settings like grocery stores, pharmacies, and transport.
- **Visual Learning:** Dynamic image fetching from Unsplash to provide visual context for vocabulary.
- **Audio Feedback:** Spoken tips and corrective guidance for common English pronunciation errors.
- **Sign Scanner:** OCR-based sign scanner to help understand and pronounce English signs in the real world.

---

## Frontend

React + TypeScript frontend built with Vite.

### Prerequisites

- [Node.js](https://nodejs.org/) v18+

### Setup

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

Starts the dev server at `http://localhost:5173`.

---

## Backend

FastAPI backend with ElevenLabs TTS/STT and wav2vec2 pronunciation analysis.

### Prerequisites

- Python 3.10+
- `espeak-ng` (required by the phonemizer library)

**Linux / WSL (Ubuntu/Debian)**
```bash
sudo apt install espeak-ng
```

**macOS**
```bash
brew install espeak-ng
```

**Windows**
Download and run the installer from the [espeak-ng releases page](https://github.com/espeak-ng/espeak-ng/releases). Add the espeak-ng folder to your `PATH`.

### Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
```

Add your API keys to `backend/.env`:

```env
ELEVENLABS_KEY=your_elevenlabs_key
UNSPLASH_ACCESS_KEY=your_unsplash_key
```

### Run

```bash
uvicorn main:app --reload
```

API runs at `http://localhost:8000`.

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/tts/` | Text-to-speech via ElevenLabs |
| `GET` | `/images/` | Fetch Unsplash images for a query |
| `POST` | `/recog/` | Phoneme-based analysis (IPA + Tips) |
| `GET` | `/scenarios` | List practice scenarios |
| `GET` | `/phrases` | Get phrases for a scenario |
| `POST` | `/evaluate-pronunciation` | ElevenLabs-based evaluation with Rohingya feedback |
| `GET` | `/audio/*` | Static assets for pronunciation tips |

> **Note:** The first request to `/recog/` will download the wav2vec2 model (~1 GB).
