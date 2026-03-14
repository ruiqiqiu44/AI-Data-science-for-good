import os
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs

load_dotenv()

_elevenlabs = ElevenLabs(api_key=os.environ["ELEVENLABS_KEY"])

# Voice: "Rachel" — clear, neutral, well-suited for language learning
_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"
_MODEL_ID = "eleven_monolingual_v1"


def text_to_speech(text: str) -> bytes:
    """Convert a word or phrase to audio using ElevenLabs.

    Returns raw MP3 bytes that can be streamed or saved directly.
    """
    audio_chunks = _elevenlabs.text_to_speech.convert(
        text=text,
        voice_id=_VOICE_ID,
        model_id=_MODEL_ID,
        output_format="mp3_44100_128",
    )
    return b"".join(audio_chunks)
