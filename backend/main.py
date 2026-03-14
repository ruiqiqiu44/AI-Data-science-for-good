from fastapi import FastAPI, Query, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import httpx

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

phrases = [
    {
        "id": 1,
        "scenario": "grocery",
        "english_phrase": "Would you like a bag?",
        "rohingya_meaning": "Tuar ki fothik lage ne?",
        "english_pronunciation": "WUD you lyk uh BAG?",
        "image_url": "https://s3.amazonaws.com/lowres.cartoonstock.com/retail-green_issues-global_warming-eco_bag-carrier_bags-plastic_bag-rron708_low.jpg"
    }
]

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
            feedback_message = "Masha Allah! Tuin bebbakin saí gori hoiyo. Beshi bala!"
        elif score >= 0.5:
            if len(incorrect_words) == 1:
                missed_str = f"'{incorrect_words[0]}'"
            elif len(incorrect_words) == 2:
                missed_str = f"'{incorrect_words[0]}' ar '{incorrect_words[1]}'"
            else:
                missed_str = ", ".join([f"'{w}'" for w in incorrect_words[:-1]]) + f", ar '{incorrect_words[-1]}'"
            feedback_message = f"Bala gorrzo! Abar koshish goroo ar {missed_str} lofz-or diké nojor deo."
        else:
            feedback_message = f"Koshish gorit táko! Tuin boliyó '{transcription}'. Abar húnou ar heentikká koshish goroo."

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
