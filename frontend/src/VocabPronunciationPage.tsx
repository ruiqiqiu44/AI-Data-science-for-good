import { useState, useRef, useEffect } from 'react'
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

  const feedback = await response.json()
  console.log('Pronunciation feedback:', feedback)
}
// ---------------------------------------------------------------------------

async function fetchImages(word: string): Promise<string[]> {
  const response = await fetch(`${BACKEND_URL}/images/?query=${encodeURIComponent(word)}`)
  const data: { url: string }[] = await response.json()
  return data.map((item) => item.url)
}

function speakWord(word: string) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(word)
  utterance.rate = 0.85
  utterance.pitch = 1
  window.speechSynthesis.speak(utterance)
}

// ---------------------------------------------------------------------------
// Words per scenario — images are fetched live from the backend
// ---------------------------------------------------------------------------
const VOCAB_WORDS: Record<string, string[]> = {
  grocery:  ['Apple', 'Milk', 'Bread', 'Shopping Cart', 'Checkout'],
  pharmacy: ['Medicine', 'Doctor', 'Prescription', 'Bandage'],
  transport: ['Bus', 'Ticket', 'Bus Stop', 'Train Station'],
}
// ---------------------------------------------------------------------------

export default function VocabPronunciationPage() {
  const { scenarioId } = useParams<{ scenarioId: string }>()
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const [recording, setRecording] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [imagesLoading, setImagesLoading] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const words = VOCAB_WORDS[scenarioId ?? ''] ?? []
  const currentWord = words[index]

  useEffect(() => {
    if (!currentWord) return
    setImagesLoading(true)
    setImages([])
    fetchImages(currentWord)
      .then(setImages)
      .finally(() => setImagesLoading(false))
  }, [currentWord])

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream)
    chunksRef.current = []

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    recorder.onstop = () => {
      const audio = new Blob(chunksRef.current, { type: recorder.mimeType })
      getPronunciationFeedback(currentWord, audio)
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

      {currentWord ? (
        <>
          <div className="vocab-word-row">
            <button
              className="vocab-word-btn"
              onClick={() => speakWord(currentWord)}
              aria-label={`Hear pronunciation of ${currentWord}`}
            >
              <span className="vocab-word">{currentWord}</span>
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
            {imagesLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="vocab-image-cell vocab-image-cell--loading" />
                ))
              : images.map((url, i) => (
                  <div key={i} className="vocab-image-cell">
                    <img src={url} alt={`${currentWord} ${i + 1}`} />
                  </div>
                ))
            }
          </div>

          <div className="vocab-nav">
            <button
              className="vocab-nav-btn"
              onClick={() => setIndex((i) => i - 1)}
              disabled={index === 0}
            >
              ←
            </button>
            <span className="vocab-counter">{index + 1} / {words.length}</span>
            <button
              className="vocab-nav-btn"
              onClick={() => setIndex((i) => i + 1)}
              disabled={index === words.length - 1}
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
