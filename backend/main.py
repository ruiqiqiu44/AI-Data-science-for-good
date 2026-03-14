from contextlib import asynccontextmanager

from fastapi import FastAPI, Form, HTTPException, UploadFile
from tts import text_to_speech
from recognition import load_model, audio_bytes_to_numpy, audio_to_phonemes, expected_phonemes, analyse

_processor = None
_model = None

@asynccontextmanager
async def lifespan(_: FastAPI):
    global _processor, _model
    _processor, _model = load_model()
    yield

app = FastAPI(lifespan=lifespan)


@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/tts/")
def tts(text: str):
    audio_file = text_to_speech(text)
    return {"audio_file": audio_file}

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
        "expected": ref_str,
        "actual": actual_str,
        **fb.to_dict(),
    }