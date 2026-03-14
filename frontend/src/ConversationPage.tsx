import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './ConversationPage.css'

interface Phrase {
  id: number
  scenario: string
  english_phrase: string
  rohingya_meaning: string
  english_pronunciation: string
  image_url: string
}

interface WordResult {
  word: string
  correct: boolean
}

interface EvaluationResult {
  transcription: string
  analysis: WordResult[]
  score: number
  feedback_message: string
  feedback_audio_b64?: string
}

function MicIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="28" y="10" width="24" height="36" rx="12" fill="white" opacity="0.95" />
      <path d="M20 42C20 54.15 29.85 64 42 64" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.9" />
      <path d="M60 42C60 54.15 50.15 64 38 64" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.9" />
      <line x1="40" y1="64" x2="40" y2="74" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
      <line x1="30" y1="74" x2="50" y2="74" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
    </svg>
  )
}

function SpeakerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    </svg>
  )
}

function AgentAvatar() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '40px', height: '40px' }}>
      <circle cx="32" cy="32" r="32" fill="#8b5cf6" />
      <circle cx="32" cy="22" r="10" fill="white" />
      <path d="M16 54C16 43 23 36 32 36C41 36 48 43 48 54" stroke="white" strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
}

export default function ConversationPage() {
  const { scenarioId } = useParams<{ scenarioId: string }>()
  const navigate = useNavigate()

  const [phrase, setPhrase] = useState<Phrase | null>(null)
  const [humanRecording, setHumanRecording] = useState(false)
  const [evaluating, setEvaluating] = useState(false)
  const [result, setResult] = useState<EvaluationResult | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/phrases?scenario=${scenarioId}`)
      .then(res => res.json())
      .then(data => setPhrase(data[0]))
      .catch(err => console.error('fetch failed:', err))
  }, [scenarioId])

  function playAudio(text: string) {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.85
    utterance.lang = 'en-US'
    window.speechSynthesis.speak(utterance)
  }

  function sendRecordedAudio(audio: Blob, phraseText: string) {
    setEvaluating(true)
    setResult(null)

    const formData = new FormData()
    formData.append('audio', audio, 'recording.webm')
    formData.append('english_phrase', phraseText)

    fetch('http://127.0.0.1:8000/evaluate-pronunciation', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        setResult(data)
        setEvaluating(false)
        if (data.feedback_audio_b64) {
          const audio = new Audio("data:audio/mpeg;base64," + data.feedback_audio_b64)
          audio.play().catch(e => console.error("Error playing feedback audio:", e))
        }
      })
      .catch(err => {
        console.error('evaluation failed:', err)
        setEvaluating(false)
      })
  }

  async function startRecording() {
    setResult(null)
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream)
    chunksRef.current = []
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
    recorder.onstop = () => {
      const audio = new Blob(chunksRef.current, { type: recorder.mimeType })
      if (phrase) sendRecordedAudio(audio, phrase.english_phrase)
      stream.getTracks().forEach((t) => t.stop())
    }
    recorder.start()
    mediaRecorderRef.current = recorder
    setHumanRecording(true)
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    mediaRecorderRef.current = null
    setHumanRecording(false)
  }

  return (
    <div className="convo-page">
      <button className="convo-back-btn" onClick={() => navigate(`/scenario/${scenarioId}`)}>
        ← Back
      </button>

      <div className="convo-split">

        {/* Phrase card */}
        <div className="convo-side">
          <div className="convo-card convo-card--ai">
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <span className="convo-side-label" style={{ color: '#8b5cf6', fontSize: '1.2rem', display: 'block' }}>1-nombor dom: Húno</span>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#64748b' }}>Húniballa speaker-ot tipoo</p>
            </div>
            {phrase ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '0 1rem' }}>
                <img
                  src={phrase.image_url}
                  alt={phrase.english_phrase}
                  style={{ width: '360px', height: '270px', objectFit: 'cover', borderRadius: '24px', boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '1rem' }}>
                  <p style={{ margin: 0, fontSize: '2.4rem', fontWeight: 800, color: '#1a1a1a', textAlign: 'center' }}>
                    {phrase.english_phrase}
                  </p>
                  <button
                    onClick={() => playAudio(phrase.english_phrase)}
                    style={{ background: '#f3e8ff', border: 'none', cursor: 'pointer', padding: '12px', color: '#6d28d9', display: 'flex', borderRadius: '50%' }}
                    title="Play pronunciation"
                  >
                    <SpeakerIcon />
                  </button>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem', color: '#6d28d9', fontWeight: 600 }}>
                    {phrase.english_pronunciation}
                  </p>
                  <p style={{ margin: 0, fontSize: '1.6rem', color: '#475569', fontWeight: 600 }}>
                    {phrase.rohingya_meaning}
                  </p>
                </div>
              </div>
            ) : (
              <p style={{ color: '#94a3b8' }}>Loading…</p>
            )}
          </div>
        </div>

        <div className="convo-divider" />

        {/* Record + results */}
        <div className="convo-side">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '88%', height: '88%' }}>

            <button
              className={`convo-card convo-card--human${humanRecording ? ' convo-card--recording' : ''}`}
              style={{ flex: 1, width: '100%' }}
              onClick={() => humanRecording ? stopRecording() : startRecording()}
              aria-label={humanRecording ? 'Stop recording' : 'Start recording'}
            >
              <div style={{ textAlign: 'center', marginBottom: '8px', pointerEvents: 'none' }}>
                <span className="convo-side-label" style={{ color: '#f59e0b', fontSize: '1.2rem', display: 'block' }}>
                  {humanRecording ? '● Recording…' : evaluating ? 'Evaluating…' : '2-nombor dom: Abar hoo'}
                </span>
                {!humanRecording && !evaluating && <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#64748b' }}>Record goriballa button-ot tipoo</p>}
              </div>
              <div className="convo-circle-wrap">
                {humanRecording && (
                  <>
                    <div className="convo-ring convo-ring--1 convo-ring--human" />
                    <div className="convo-ring convo-ring--2 convo-ring--human" />
                    <div className="convo-ring convo-ring--3 convo-ring--human" />
                  </>
                )}
                <div className={`convo-circle convo-circle--human${humanRecording ? ' convo-circle--active' : ''}`}>
                  <MicIcon />
                </div>
              </div>
            </button>

            {/* Results */}
            {result && (
              <div style={{
                width: '100%',
                background: result.score === 1.0 ? '#f0fdf4' : 'white',
                border: result.score === 1.0 ? '2px solid #22c55e' : 'none',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <AgentAvatar />
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: '#334155', fontWeight: 500, lineHeight: '1.4' }}>
                      {result.feedback_message}
                    </p>
                  </div>
                </div>

                <div style={{ height: '1px', background: '#e2e8f0', margin: '0.5rem 0' }} />

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                  {result.analysis.map((w, i) => (
                    <span key={i} style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: 700,
                      background: w.correct ? '#dcfce7' : '#fee2e2',
                      color: w.correct ? '#16a34a' : '#ef4444',
                      border: `1px solid ${w.correct ? '#bbf7d0' : '#fecaca'}`
                    }}>
                      {w.word}
                    </span>
                  ))}
                </div>

                <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center' }}>
                  You said: <em>"{result.transcription}"</em>
                </p>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  )
}
