from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware
from tts import text_to_speech

app = FastAPI()
FRONTEND_URL = "http://localhost:5173"

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/tts/")
def tts(text: str):
    audio_file = text_to_speech(text)
    return {"audio_file": audio_file}