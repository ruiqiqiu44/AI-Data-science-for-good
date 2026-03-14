from fastapi import FastAPI
from tts import text_to_speech

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/tts/")
def tts(text: str):
    audio_file = text_to_speech(text)
    return {"audio_file": audio_file}