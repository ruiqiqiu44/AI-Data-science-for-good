from fastapi import FastAPI, UploadFile, File, Form
from tts import text_to_speech
from pronunciation import get_feedback

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/tts/")
def tts(text: str):
    audio_file = text_to_speech(text)
    return {"audio_file": audio_file}


@app.post("/pronunciation-feedback")
async def pronunciation_feedback(
    word: str = Form(...),
    audio: UploadFile = File(...),
):
    audio_bytes = await audio.read()
    return get_feedback(word, audio_bytes)