# AI and Data Science for Good

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

Starts the dev server at `http://localhost:5173` with hot module replacement.

### Build

```bash
npm run build
```

Type-checks and compiles to `dist/`.

### Preview production build

```bash
npm run preview
```

---

## Backend

FastAPI backend with ElevenLabs TTS and wav2vec2 pronunciation analysis.

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
Download and run the installer from the [espeak-ng releases page](https://github.com/espeak-ng/espeak-ng/releases). After installing, add the espeak-ng folder to your `PATH` so phonemizer can find it.

### Setup

**Linux / macOS**
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

**Windows**
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Add your API key to `backend/.env`:

```
ELEVENLABS_KEY=your_key_here
```

### Run

Make sure the virtual environment is active, then:

```bash
uvicorn main:app --reload
```

API runs at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/tts/` | Text-to-speech via ElevenLabs — param: `text` |
| `POST` | `/pronunciation-feedback` | Analyse pronunciation — form fields: `word` (str), `audio` (file) |

> **Note:** The first request to `/pronunciation-feedback` will download the wav2vec2 model (~1 GB) from HuggingFace.