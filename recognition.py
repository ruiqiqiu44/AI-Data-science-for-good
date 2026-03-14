#!/usr/bin/env python3
"""
English Pronunciation Coach for Rohingya Learners
==================================================
Uses facebook/wav2vec2-lv-60-espeak-cv-ft to decode audio directly into IPA
phonemes, compares against espeak-ng reference phonemes, and gives targeted
feedback focused on the sounds most likely to cause comprehension breakdown.

Installation
------------
  # System dependency (Linux/WSL):
  sudo apt install espeak-ng

  # Python packages:
  pip install torch transformers sounddevice scipy phonemizer pyttsx3

  Windows note: espeak-ng installer at https://github.com/espeak-ng/espeak-ng/releases
  After installing, add its folder to PATH so phonemizer can find it.


  Here's how the system works:

Pipeline per attempt:

You pick a target word from the menu (or type your own)
Optionally hear it read aloud via TTS
Record 4 seconds of your speech via microphone
wav2vec2-lv-60-espeak-cv-ft decodes your audio → IPA phonemes (e.g. θ ɹ iː)
phonemizer generates the reference IPA from the target text (e.g. θ ɹ iː)
Global sequence alignment (edit-distance DP) matches the two sequences position-by-position
The error detector checks each aligned pair against the Rohingya-specific rules:
"""

import numpy as np
import torch
import sounddevice as sd
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor

try:
    from phonemizer import phonemize
    from phonemizer.separator import Separator
    HAS_PHONEMIZER = True
except ImportError:
    HAS_PHONEMIZER = False

try:
    import pyttsx3
    _tts_engine = pyttsx3.init()
    HAS_TTS = True
except Exception:
    HAS_TTS = False

SAMPLE_RATE = 16000
RECORD_SECONDS = 4

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
]

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
        if key not in self._seen:
            self._seen.add(key)
            self.high.append((label, example, tip))

    def add_low(self, note: str) -> None:
        if note not in self.low:
            self.low.append(note)

    @property
    def score(self) -> int:
        return max(0, 100 - len(self.high) * 15)

    def display(self) -> None:
        bar = "=" * 62
        print(f"\n{bar}")
        s = self.score
        if not self.high:
            print("  Excellent! Very clear pronunciation.")
        elif s >= 70:
            print(f"  Good effort — keep going!  Score: {s}/100")
        else:
            print(f"  Keep practising — you are improving!  Score: {s}/100")

        if self.high:
            print("\n  Focus on these sounds (they can confuse listeners):\n")
            for label, example, tip in self.high:
                print(f"  !! {label}")
                print(f"     Example words : {example}")
                print(f"     How to fix    : {tip}\n")

        if self.low:
            print("  Minor notes (these will NOT confuse people, just FYI):")
            for note in self.low:
                print(f"  ~  {note}")

        print(bar)


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
            elif e in LOW_PRIORITY_PHONEMES:
                fb.add_low(f'/{e}/ sounded like /{a}/ — minor accent, still understood.')

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


# ── Audio helpers ──────────────────────────────────────────────────────────────

def record(seconds: int = RECORD_SECONDS) -> np.ndarray:
    print(f"\n  [Recording {seconds}s — speak now!]")
    audio = sd.rec(int(seconds * SAMPLE_RATE), samplerate=SAMPLE_RATE, channels=1, dtype="float32")
    sd.wait()
    print("  [Done recording]")
    return audio.squeeze()


def speak(text: str) -> None:
    if HAS_TTS:
        _tts_engine.say(text)
        _tts_engine.runAndWait()


# ── CLI ────────────────────────────────────────────────────────────────────────

def menu() -> None:
    print("\n  Choose a word to practise:")
    for idx, (word, hint) in enumerate(PRACTICE_WORDS, 1):
        print(f"    {idx:2}.  {word:<10}  ({hint})")
    print("     0.  Type your own word or short phrase")
    print("     q.  Quit")


def main() -> None:
    print("\n" + "=" * 62)
    print("  English Pronunciation Coach  —  Rohingya Learner Edition")
    print("=" * 62)
    print("  Goal: be understood, not accent-free. You can do this!")
    if not HAS_PHONEMIZER:
        print("\n  [Warning] phonemizer not installed — feedback will be limited.")
        print("  Install: pip install phonemizer  (also needs espeak-ng)")
    if HAS_TTS:
        print("  [TTS enabled] You will hear each target word read aloud.")

    processor, model = load_model()

    while True:
        menu()
        choice = input("\n  Your choice: ").strip().lower()

        if choice == "q":
            print("\n  Great work today! Keep practising every day.\n")
            break

        if choice == "0":
            target = input("  Enter word or phrase: ").strip()
        elif choice.isdigit() and 1 <= int(choice) <= len(PRACTICE_WORDS):
            target, _ = PRACTICE_WORDS[int(choice) - 1]
        else:
            print("  Invalid choice — try again.")
            continue

        print(f'\n  Target: "{target}"')

        # Compute reference phonemes
        ref_str = expected_phonemes(target)
        if ref_str:
            print(f"  Expected phonemes : /{ref_str}/")

        # Optionally play TTS so the learner hears the word
        if HAS_TTS:
            play = input("  Hear the word read aloud first? (y/n): ").strip().lower()
            if play == "y":
                speak(target)

        input("\n  Press Enter and then say the word …")
        audio = record()

        print("  Analysing …")
        actual_str = audio_to_phonemes(audio, processor, model)
        print(f"  Your phonemes     : /{actual_str}/")

        if ref_str:
            fb = analyse(ref_str, actual_str)
            fb.display()
        else:
            print("\n  (Install phonemizer for detailed feedback.)")
            print(f"  Detected: /{actual_str}/")

        again = input("\n  Practise this word again? (y/n): ").strip().lower()
        if again != "y":
            pass  # loop back to menu


if __name__ == "__main__":
    main()
