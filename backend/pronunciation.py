"""
Pronunciation feedback module.

Wraps recognition.py for use by the API: accepts raw audio bytes (WebM/Opus
from the browser's MediaRecorder), decodes them, runs the wav2vec2 phoneme
pipeline and alignment analysis, and returns structured feedback.
"""

import io
import numpy as np
import torchaudio

from recognition import load_model, audio_to_phonemes, expected_phonemes, analyse

# Load model once when the module is imported (server startup).
# First run downloads ~1 GB from HuggingFace.
_processor, _model = load_model()


def get_feedback(word: str, audio_bytes: bytes) -> dict:
    """Analyse a pronunciation attempt and return structured feedback.

    Parameters
    ----------
    word        : The target English word or phrase.
    audio_bytes : Raw audio file bytes (WebM/Opus from MediaRecorder).

    Returns
    -------
    A dict with keys:
        score            – int 0-100 (None if phonemizer unavailable)
        expected_phonemes – IPA string for the target word
        actual_phonemes  – IPA string decoded from the recording
        high_priority    – list of {label, example, tip} for critical errors
        low_priority     – list of minor note strings
    """
    # Decode audio bytes → waveform tensor
    waveform, sample_rate = torchaudio.load(io.BytesIO(audio_bytes))

    # Resample to 16 kHz (required by wav2vec2)
    if sample_rate != 16000:
        resampler = torchaudio.transforms.Resample(
            orig_freq=sample_rate, new_freq=16000
        )
        waveform = resampler(waveform)

    # Collapse to mono float32 numpy array
    audio_np: np.ndarray = waveform.mean(dim=0).numpy().astype(np.float32)

    actual_str = audio_to_phonemes(audio_np, _processor, _model)
    ref_str = expected_phonemes(word)

    if not ref_str:
        return {
            "score": None,
            "expected_phonemes": None,
            "actual_phonemes": actual_str,
            "high_priority": [],
            "low_priority": [],
        }

    fb = analyse(ref_str, actual_str)

    return {
        "score": fb.score,
        "expected_phonemes": ref_str,
        "actual_phonemes": actual_str,
        "high_priority": [
            {"label": label, "example": example, "tip": tip}
            for label, example, tip in fb.high
        ],
        "low_priority": fb.low,
    }
