from contextlib import asynccontextmanager
from fastapi import FastAPI, Query, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
from tts import text_to_speech
from pronunciation import get_feedback
from recognition import load_model, audio_bytes_to_numpy, audio_to_phonemes, expected_phonemes, analyse
from images import get_images
from data.phrases import phrases

_processor = None
_model = None

@asynccontextmanager
async def lifespan(_: FastAPI):
    global _processor, _model
    _processor, _model = load_model()
    yield

app = FastAPI(lifespan=lifespan)
FRONTEND_URL = "http://localhost:5173"

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/tts/")
def tts(text: str):
    audio_file = text_to_speech(text)
    return {"audio_file": audio_file}

@app.get("/images/")
def images(query: str):
    """Return the top 4 Unsplash images for a word or phrase.

    Response: list of { url, thumb_url, alt, credit }
    """
    return get_images(query)


@app.post("/recog/")
async def recog(audio: UploadFile, target: str = Form(...)):
    '''Return JSON with the full result:

{
  "expected":    "θ ɹ iː",
  "actual":      "t ɹ iː",
  "score":       85,
  "errors":      [{ "label": "TH→T: ...", "examples": "...", "tip": "..." }],
  "minor_notes": []
}'''
    data = await audio.read()
    try:
        audio_array = audio_bytes_to_numpy(data)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Could not decode audio: {exc}")

    ref_str = expected_phonemes(target)
    if not ref_str:
        raise HTTPException(status_code=503, detail="espeak-ng is not available on this server.")

    actual_str = audio_to_phonemes(audio_array, _processor, _model)
    fb = analyse(ref_str, actual_str)

    return {

        **fb.to_dict(),
    }

@app.get("/scenarios")
def get_scenarios():
    return list(set(p["scenario"] for p in phrases))

@app.get("/phrases")
def get_phrases(scenario: str = Query(...)):
    return [p for p in phrases if p["scenario"] == scenario]

ELEVENLABS_API_KEY = "sk_211b923e77237f890ec53f06b61f179deeedaf460804020b"
ELEVENLABS_STT_URL = "https://api.elevenlabs.io/v1/speech-to-text"

@app.post("/evaluate-pronunciation")
async def evaluate_pronunciation(
    audio: UploadFile = File(...),
    english_phrase: str = Form(...)
):
    try:
        audio_content = await audio.read()
        
        headers = {
            "xi-api-key": ELEVENLABS_API_KEY
        }
        
        files = {
            "file": (audio.filename, audio_content, audio.content_type)
        }
        
        data = {
            "model_id": "scribe_v1",
            "language_code": "en"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                ELEVENLABS_STT_URL,
                headers=headers,
                files=files,
                data=data,
                timeout=30.0
            )
            
        if response.status_code != 200:
            return {"error": "Failed to transcribe audio", "details": response.text}
            
        result = response.json()
        transcription = result.get("text", "")
        
        import string
        def normalize(text):
            return text.lower().translate(str.maketrans('', '', string.punctuation))
            
        target_words = normalize(english_phrase).split()
        transcribed_words_norm = normalize(transcription).split()
        
        analysis = []
        correct_count = 0
        for target_word in target_words:
            is_correct = target_word in transcribed_words_norm
            analysis.append({
                "word": target_word,
                "correct": is_correct
            })
            if is_correct:
                correct_count += 1
                transcribed_words_norm.remove(target_word)

        if not target_words:
            score = 0.0
        else:
            score = correct_count / len(target_words)

        incorrect_words = [str(item["word"]) for item in analysis if not item["correct"]]
        
        if score == 1.0:
            feedback_message = "Masha Allah! Tuin bebbakin saí gori hoiyo. Perfect! You nailed every single word."
        elif score >= 0.5:
            if len(incorrect_words) == 1:
                missed_str = f"the word '{incorrect_words[0]}'"
            elif len(incorrect_words) == 2:
                missed_str = f"the words '{incorrect_words[0]}' and '{incorrect_words[1]}'"
            else:
                missed_str = "the words " + ", ".join([f"'{w}'" for w in incorrect_words[:-1]]) + f", and '{incorrect_words[-1]}'"
            feedback_message = f"Bala gorrzo! Beshi híssa saí hoiyo. Keep it up! Next time, pay attention to {missed_str}."
        else:
            feedback_message = f"Koshish gorit táko! Don't give up! It sounded like you said '{transcription}'. Listen to the audio again and try to match it."

        # 3. Generate Audio Feedback using ElevenLabs TTS
        tts_url = "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM" # Rachel voice
        tts_data = {
            "text": feedback_message,
            "model_id": "eleven_multilingual_v2"
        }
        
        feedback_audio_b64 = None
        try:
            tts_response = await client.post(
                tts_url,
                headers={"xi-api-key": ELEVENLABS_API_KEY, "Content-Type": "application/json"},
                json=tts_data,
                timeout=30.0
            )
            if tts_response.status_code == 200:
                import base64
                feedback_audio_b64 = base64.b64encode(tts_response.content).decode("utf-8")
        except Exception as e:
            print("TTS error:", str(e))

        return {
            "transcription": transcription,
            "analysis": analysis,
            "score": score,
            "feedback_message": feedback_message,
            "feedback_audio_b64": feedback_audio_b64
        }
    except Exception as e:
        return {"error": str(e)}
