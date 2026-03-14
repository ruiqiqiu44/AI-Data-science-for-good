import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './VocabPronunciationPage.css'
import { BACKEND_URL } from './config'

// ---------------------------------------------------------------------------
// API call — receives the target word and the recorded attempt, returns feedback
// ---------------------------------------------------------------------------
async function getPronunciationFeedback(word: string, audio: Blob): Promise<void> {
  const body = new FormData()
  body.append('target', word)
  body.append('audio', audio, 'recording.webm')

  const response = await fetch(`${BACKEND_URL}/recog/`, {
    method: 'POST',
    body,
  })

  const result = await response.json()
  console.log(result)
}
// ---------------------------------------------------------------------------

function speakWord(word: string) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(word)
  utterance.rate = 0.85
  utterance.pitch = 1
  window.speechSynthesis.speak(utterance)
}

interface VocabItem {
  word: string
  images: [string, string, string, string]
}

// ---------------------------------------------------------------------------
// Placeholder — replace with real API call keyed on scenarioId
// ---------------------------------------------------------------------------
const VOCAB_DATA: Record<string, VocabItem[]> = {
  grocery: [
    {
      word: 'Apple',
      images: [
        'https://picsum.photos/seed/apple1/400/300',
        'https://picsum.photos/seed/apple2/400/300',
        'https://picsum.photos/seed/apple3/400/300',
        'https://picsum.photos/seed/apple4/400/300',
      ],
    },
    {
      word: 'Milk',
      images: [
        'https://picsum.photos/seed/milk1/400/300',
        'https://picsum.photos/seed/milk2/400/300',
        'https://picsum.photos/seed/milk3/400/300',
        'https://picsum.photos/seed/milk4/400/300',
      ],
    },
    {
      word: 'Bread',
      images: [
        'https://picsum.photos/seed/bread1/400/300',
        'https://picsum.photos/seed/bread2/400/300',
        'https://picsum.photos/seed/bread3/400/300',
        'https://picsum.photos/seed/bread4/400/300',
      ],
    },
    {
      word: 'Shopping Cart',
      images: [
        'https://picsum.photos/seed/cart1/400/300',
        'https://picsum.photos/seed/cart2/400/300',
        'https://picsum.photos/seed/cart3/400/300',
        'https://picsum.photos/seed/cart4/400/300',
      ],
    },
    {
      word: 'Checkout',
      images: [
        'https://picsum.photos/seed/checkout1/400/300',
        'https://picsum.photos/seed/checkout2/400/300',
        'https://picsum.photos/seed/checkout3/400/300',
        'https://picsum.photos/seed/checkout4/400/300',
      ],
    },
  ],
  pharmacy: [
    {
      word: 'Medicine',
      images: [
        'https://picsum.photos/seed/medicine1/400/300',
        'https://picsum.photos/seed/medicine2/400/300',
        'https://picsum.photos/seed/medicine3/400/300',
        'https://picsum.photos/seed/medicine4/400/300',
      ],
    },
    {
      word: 'Doctor',
      images: [
        'https://picsum.photos/seed/doctor1/400/300',
        'https://picsum.photos/seed/doctor2/400/300',
        'https://picsum.photos/seed/doctor3/400/300',
        'https://picsum.photos/seed/doctor4/400/300',
      ],
    },
    {
      word: 'Prescription',
      images: [
        'https://picsum.photos/seed/prescription1/400/300',
        'https://picsum.photos/seed/prescription2/400/300',
        'https://picsum.photos/seed/prescription3/400/300',
        'https://picsum.photos/seed/prescription4/400/300',
      ],
    },
    {
      word: 'Bandage',
      images: [
        'https://picsum.photos/seed/bandage1/400/300',
        'https://picsum.photos/seed/bandage2/400/300',
        'https://picsum.photos/seed/bandage3/400/300',
        'https://picsum.photos/seed/bandage4/400/300',
      ],
    },
  ],
  transport: [
    {
      word: 'Bus',
      images: [
        'https://picsum.photos/seed/bus1/400/300',
        'https://picsum.photos/seed/bus2/400/300',
        'https://picsum.photos/seed/bus3/400/300',
        'https://picsum.photos/seed/bus4/400/300',
      ],
    },
    {
      word: 'Ticket',
      images: [
        'https://picsum.photos/seed/ticket1/400/300',
        'https://picsum.photos/seed/ticket2/400/300',
        'https://picsum.photos/seed/ticket3/400/300',
        'https://picsum.photos/seed/ticket4/400/300',
      ],
    },
    {
      word: 'Bus Stop',
      images: [
        'https://picsum.photos/seed/busstop1/400/300',
        'https://picsum.photos/seed/busstop2/400/300',
        'https://picsum.photos/seed/busstop3/400/300',
        'https://picsum.photos/seed/busstop4/400/300',
      ],
    },
    {
      word: 'Train Station',
      images: [
        'https://picsum.photos/seed/station1/400/300',
        'https://picsum.photos/seed/station2/400/300',
        'https://picsum.photos/seed/station3/400/300',
        'https://picsum.photos/seed/station4/400/300',
      ],
    },
  ],
}
// ---------------------------------------------------------------------------

export default function VocabPronunciationPage() {
  const { scenarioId } = useParams<{ scenarioId: string }>()
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const [recording, setRecording] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const items = VOCAB_DATA[scenarioId ?? ''] ?? []
  const current = items[index]

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream)
    chunksRef.current = []

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    recorder.onstop = () => {
      const audio = new Blob(chunksRef.current, { type: recorder.mimeType })
      getPronunciationFeedback(current.word, audio)
      stream.getTracks().forEach((t) => t.stop())
    }

    recorder.start()
    mediaRecorderRef.current = recorder
    setRecording(true)
    console.log('recording')
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    mediaRecorderRef.current = null
    setRecording(false)
  }

  return (
    <div className="vocab-page">
      <button className="vocab-back-btn" onClick={() => navigate(`/scenario/${scenarioId}`)}>
        ← Back
      </button>

      {current ? (
        <>
          <div className="vocab-word-row">
            <button
              className="vocab-word-btn"
              onClick={() => speakWord(current.word)}
              aria-label={`Hear pronunciation of ${current.word}`}
            >
              <span className="vocab-word">{current.word}</span>
              <span className="vocab-speaker">🔊</span>
            </button>

            <button
              className={`vocab-record-btn${recording ? ' vocab-record-btn--active' : ''}`}
              onClick={recording ? stopRecording : startRecording}
              aria-label={recording ? 'Stop recording' : 'Record your pronunciation'}
            >
              {recording ? '⏹' : '🎙'}
            </button>
          </div>

          <div className="vocab-image-grid">
            {current.images.map((url, i) => (
              <div key={i} className="vocab-image-cell">
                <img src={url} alt={`${current.word} ${i + 1}`} />
              </div>
            ))}
          </div>

          <div className="vocab-nav">
            <button
              className="vocab-nav-btn"
              onClick={() => setIndex((i) => i - 1)}
              disabled={index === 0}
            >
              ←
            </button>
            <span className="vocab-counter">{index + 1} / {items.length}</span>
            <button
              className="vocab-nav-btn"
              onClick={() => setIndex((i) => i + 1)}
              disabled={index === items.length - 1}
            >
              →
            </button>
          </div>
        </>
      ) : (
        <p className="vocab-empty">No vocabulary &amp; pronunciation content found for this scenario.</p>
      )}
    </div>
  )
}
