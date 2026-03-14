#!/usr/bin/env python3
"""
English Pronunciation Coach for Rohingya Learners — backend library
====================================================================
Exposes three callable functions for the FastAPI server:

  audio_bytes_to_numpy(data)          raw audio bytes  → float32 numpy array
  audio_to_phonemes(audio, proc, mdl) numpy array      → IPA phoneme string
  expected_phonemes(text)             English text     → IPA phoneme string
  analyse(expected_str, actual_str)   two IPA strings  → Feedback object

System dependency: espeak-ng must be installed and on PATH.
  Linux:   sudo apt install espeak-ng
  Windows: https://github.com/espeak-ng/espeak-ng/releases
"""

import io
import numpy as np
import torch
import soundfile as sf
from scipy.signal import resample as scipy_resample
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor

try:
    from phonemizer import phonemize
    from phonemizer.separator import Separator
    HAS_PHONEMIZER = True
except ImportError:
    HAS_PHONEMIZER = False

SAMPLE_RATE = 16000

# ── Phoneme knowledge base ─────────────────────────────────────────────────────

# Sounds that rarely cause misunderstanding — be lenient.
LOW_PRIORITY_PHONEMES = {
    "ə",   # schwa variation
    "f",   # /f/ is usually close enough
}

DENTAL_FRICATIVES = {"θ", "ð"}
FINAL_CONSONANTS   = set("kptsbdɡzʃʒ")

# (expected, actual) → (label, example word, tip)
SUBSTITUTION_RULES: dict[tuple[str, str], tuple[str, str, str]] = {
    # TH sounds
    ("θ", "t"): (
        'TH→T: "three" sounded like "tree"',
        "three / think / bath",
        'Place your tongue gently between your teeth, then blow air. Try: th-th-three.',
    ),
    ("θ", "d"): (
        'TH→D: "think" sounded like "dink"',
        "think / thank / mouth",
        'Same as above — tongue between teeth, but this time voice it slightly.',
    ),
    ("ð", "d"): (
        'TH→D: "they" sounded like "day"',
        "they / the / this",
        'Touch your upper teeth with your tongue tip, then make a buzzing "d" — it becomes "th".',
    ),
    ("ð", "t"): (
        'TH→T: "they" sounded like "tay"',
        "they / the / those",
        'For the voiced "th", your tongue touches your upper teeth — feel the vibration as air passes.',
    ),
    # V sound
    ("v", "b"): (
        'V→B: "very" sounded like "berry"',
        "very / voice / love",
        'Rest your upper front teeth on your lower lip and push air out. Feel the buzz — that is "v"!',
    ),
    ("v", "w"): (
        'V→W: "very" sounded like "wery"',
        "very / visit / have",
        'Teeth touch the lower lip for "v". For "w", lips round — they are different. Try "v-v-v".',
    ),
    # Vowel length distinction
    ("iː", "ɪ"): (
        'Short I used instead of long EE: "sheep" sounded like "ship"',
        "sheep / beat / feel",
        'Hold the EE sound longer — like "sheeeep". Stretch it out!',
    ),
    ("ɪ", "iː"): (
        'Long EE used instead of short I: "ship" sounded like "sheep"',
        "ship / bit / fill",
        'The short "i" is quick — say it and stop right away. Do not hold it.',
    ),
    # English approximant R
    ("ɹ", "r"): (
        'Rolled or flapped R detected',
        "red / river / read",
        'For English R, your tongue floats in the middle — it does not touch anything. Try "rrr" with a floating tongue.',
    ),
}

# ── Practice word list ─────────────────────────────────────────────────────────
'''
PRACTICE_WORDS: list[tuple[str, str]] = [
    ("three",  "TH + long EE + R"),
    ("they",   "Voiced TH"),
    ("think",  "TH at the start"),
    ("very",   "V sound"),
    ("river",  "R and V together"),
    ("ship",   "Short I — not 'sheep'"),
    ("sheep",  "Long EE — not 'ship'"),
    ("feel",   "Long EE + final L"),
    ("back",   "Final K — don't drop it"),
    ("bus",    "Final S — don't drop it"),
    ("red",    "English R"),
    ("love",   "Final V sound"),
]'''

# ── Model ──────────────────────────────────────────────────────────────────────

def load_model() -> tuple:
    model_id = "facebook/wav2vec2-lv-60-espeak-cv-ft"
    print(f"Loading phoneme model ({model_id}) — first run downloads ~1 GB …")
    processor = Wav2Vec2Processor.from_pretrained(model_id)
    model = Wav2Vec2ForCTC.from_pretrained(model_id)
    model.eval()
    print("Model ready.\n")
    return processor, model


def audio_to_phonemes(audio: np.ndarray, processor, model) -> str:
    """Return space-separated IPA phonemes for a 16 kHz mono float32 array."""
    inputs = processor(audio, sampling_rate=SAMPLE_RATE, return_tensors="pt", padding=True)
    with torch.no_grad():
        logits = model(**inputs).logits
    ids = torch.argmax(logits, dim=-1)
    return processor.batch_decode(ids)[0].strip()


# ── Reference phonemes ─────────────────────────────────────────────────────────

def expected_phonemes(text: str) -> str:
    """Return space-separated IPA phonemes for text using espeak-ng."""
    if not HAS_PHONEMIZER:
        return ""
    sep = Separator(phone=" ", word=" | ")
    try:
        result = phonemize(
            text,
            backend="espeak",
            language="en-us",
            with_stress=False,
            separator=sep,
            language_switch="remove-flags",
        )
        # Remove word-boundary markers and normalise whitespace
        return " ".join(result.replace("|", "").split())
    except Exception as exc:
        print(f"[phonemizer error: {exc}]")
        return ""


# ── Phoneme sequence alignment ─────────────────────────────────────────────────

def _tokenise(phoneme_str: str) -> list[str]:
    """Split a space-separated phoneme string into a clean list."""
    return [t.strip("'ˌˈ.,") for t in phoneme_str.split() if t.strip("'ˌˈ.,")]


def _align(expected: list[str], actual: list[str]) -> list[tuple[str | None, str | None]]:
    """
    Global sequence alignment (Needleman-Wunsch style) via edit-distance DP.
    Returns a list of (expected_phone, actual_phone) pairs; None means a gap.
    """
    m, n = len(expected), len(actual)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if expected[i - 1] == actual[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])

    alignment: list[tuple[str | None, str | None]] = []
    i, j = m, n
    while i > 0 or j > 0:
        if i > 0 and j > 0 and expected[i - 1] == actual[j - 1]:
            alignment.append((expected[i - 1], actual[j - 1]))
            i -= 1; j -= 1
        elif i > 0 and j > 0 and dp[i][j] == dp[i - 1][j - 1] + 1:
            alignment.append((expected[i - 1], actual[j - 1]))
            i -= 1; j -= 1
        elif i > 0 and dp[i][j] == dp[i - 1][j] + 1:
            alignment.append((expected[i - 1], None))
            i -= 1
        else:
            alignment.append((None, actual[j - 1]))
            j -= 1

    alignment.reverse()
    return alignment


# ── Feedback engine ────────────────────────────────────────────────────────────

class Feedback:
    def __init__(self) -> None:
        self.high: list[tuple[str, str, str]] = []  # (label, example, tip)
        self.low:  list[str] = []
        self._seen: set[tuple[str, str]] = set()

    def add_high(self, label: str, example: str, tip: str, key: tuple[str, str]) -> None:
        #critical errors
        if key not in self._seen:
            self._seen.add(key)
            self.high.append((label, example, tip))

    def add_low(self, note: str) -> None:
        #non critical errors
        if note not in self.low:
            self.low.append(note)

    @property
    def score(self) -> int:
        return max(0, 100 - len(self.high) * 15)

    def to_dict(self) -> dict:
        return {
            "score": self.score,
            "errors": [
                {"label": label, "examples": example, "tip": tip}
                for label, example, tip in self.high
            ],
            "minor_notes": self.low,
        }


def analyse(expected_str: str, actual_str: str) -> Feedback:
    exp = _tokenise(expected_str)
    act = _tokenise(actual_str)
    alignment = _align(exp, act)
    fb = Feedback()

    for i, (e, a) in enumerate(alignment):
        # ── Substitutions ──────────────────────────────────────────────────
        if e is not None and a is not None and e != a:
            key = (e, a)
            if key in SUBSTITUTION_RULES:
                label, example, tip = SUBSTITUTION_RULES[key]
                fb.add_high(label, example, tip, key)
            # Unlisted substitution into a low-priority bucket
            #elif e in LOW_PRIORITY_PHONEMES:
                #fb.add_low(f'/{e}/ sounded like /{a}/ — minor accent, still understood.')

        # ── Final consonant dropped ────────────────────────────────────────
        if e is not None and a is None:
            # Only flag if this is the last expected phoneme and it is a consonant
            remaining_exp = [pair[0] for pair in alignment[i + 1:] if pair[0] is not None]
            if e in FINAL_CONSONANTS and not remaining_exp:
                fb.add_high(
                    f'Ending /{e}/ sound seems dropped',
                    f'words ending in /{e}/ like "back", "bus", "stop"',
                    f'Finish the word clearly — make your mouth land in the /{e}/ position.',
                    ("_final_", e),
                )

    return fb


# ── Audio ingestion ────────────────────────────────────────────────────────────

def audio_bytes_to_numpy(data: bytes) -> np.ndarray:
    """Convert raw audio bytes (WAV, FLAC, OGG) to a 16 kHz mono float32 array.

    The frontend should send audio captured via MediaRecorder. Recommended
    MIME type: audio/ogg;codecs=opus (supported by soundfile via libsndfile).
    WAV and FLAC also work without any extra system dependencies.
    """
    audio, sr = sf.read(io.BytesIO(data), dtype="float32", always_2d=False)
    if audio.ndim == 2:          # stereo → mono
        audio = audio.mean(axis=1)
    if sr != SAMPLE_RATE:        # resample to 16 kHz if needed
        n_target = int(len(audio) * SAMPLE_RATE / sr)
        audio = scipy_resample(audio, n_target)
    return audio.astype(np.float32)
