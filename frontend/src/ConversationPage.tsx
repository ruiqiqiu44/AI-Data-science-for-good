import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './ConversationPage.css'
import { BACKEND_URL } from './config'

// ---------------------------------------------------------------------------
// Send recorded audio to backend API for processing
// ---------------------------------------------------------------------------
async function sendRecordedAudio(audio: Blob, fileName: string) {
  try {
    // Create FormData to send the audio blob
    const formData = new FormData()
    formData.append('audio', audio, fileName)

    // TODO: Replace with your actual API endpoint
    const response = await fetch(`${BACKEND_URL}/process-audio`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log('Audio processing result:', result)

  } catch (error) {
    console.error('Error sending audio to API:', error)
    // TODO: Handle error - show user-friendly error message
  }
}
// ---------------------------------------------------------------------------

function RobotIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Antenna */}
      <line x1="40" y1="6" x2="40" y2="18" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="40" cy="5" r="4" fill="white"/>
      {/* Head */}
      <rect x="14" y="18" width="52" height="36" rx="10" fill="white" opacity="0.95"/>
      {/* Eyes */}
      <rect x="22" y="28" width="14" height="10" rx="4" fill="#6d28d9"/>
      <rect x="44" y="28" width="14" height="10" rx="4" fill="#6d28d9"/>
      <circle cx="29" cy="33" r="3" fill="white"/>
      <circle cx="51" cy="33" r="3" fill="white"/>
      {/* Mouth */}
      <rect x="24" y="44" width="32" height="5" rx="2.5" fill="#6d28d9" opacity="0.7"/>
      <rect x="29" y="44" width="4" height="5" rx="1" fill="white" opacity="0.6"/>
      <rect x="37" y="44" width="4" height="5" rx="1" fill="white" opacity="0.6"/>
      <rect x="45" y="44" width="4" height="5" rx="1" fill="white" opacity="0.6"/>
      {/* Body */}
      <rect x="22" y="57" width="36" height="20" rx="6" fill="white" opacity="0.85"/>
      <rect x="28" y="62" width="10" height="8" rx="3" fill="#6d28d9" opacity="0.5"/>
      <rect x="42" y="62" width="10" height="8" rx="3" fill="#6d28d9" opacity="0.5"/>
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Head */}
      <circle cx="40" cy="24" r="16" fill="white" opacity="0.95"/>
      {/* Face */}
      <circle cx="34" cy="22" r="2.5" fill="#b45309"/>
      <circle cx="46" cy="22" r="2.5" fill="#b45309"/>
      <path d="M33 30 Q40 35 47 30" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* Body */}
      <path d="M18 72 Q18 52 40 52 Q62 52 62 72" fill="white" opacity="0.85"/>
      {/* Microphone hint */}
      <rect x="35" y="58" width="10" height="14" rx="5" fill="#f59e0b" opacity="0.8"/>
      <path d="M30 66 Q30 74 40 74 Q50 74 50 66" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8"/>
      <line x1="40" y1="74" x2="40" y2="78" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" opacity="0.8"/>
    </svg>
  )
}

export default function ConversationPage() {
  const { scenarioId } = useParams<{ scenarioId: string }>()
  const navigate = useNavigate()

  const [aiSpeaking, setAiSpeaking] = useState(false)
  const [humanRecording, setHumanRecording] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream)
    chunksRef.current = []

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    recorder.onstop = () => {
      const mimeType = recorder.mimeType;
      const audio = new Blob(chunksRef.current, { type: mimeType });
      const fileExtension = mimeType.split(';')[0].split('/')[1] || 'audio';
      const fileName = `recording.${fileExtension}`;
      sendRecordedAudio(audio, fileName);
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

  function handleHumanCardClick() {
    if (humanRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  return (
    <div className="convo-page">
      <button className="convo-back-btn" onClick={() => navigate(`/scenario/${scenarioId}`)}>
        ← Back
      </button>

      <div className="convo-split">
        {/* AI side */}
        <div className="convo-side">
          <div className="convo-card convo-card--ai">
            <span className="convo-side-label">AI</span>
            <div className="convo-circle-wrap">
              {aiSpeaking && (
                <>
                  <div className="convo-ring convo-ring--1 convo-ring--ai" />
                  <div className="convo-ring convo-ring--2 convo-ring--ai" />
                  <div className="convo-ring convo-ring--3 convo-ring--ai" />
                </>
              )}
              <button
                className={`convo-circle convo-circle--ai${aiSpeaking ? ' convo-circle--active' : ''}`}
                onClick={() => setAiSpeaking((v) => !v)}
                aria-label="AI speaker"
              >
                <RobotIcon />
              </button>
            </div>
          </div>
        </div>

        <div className="convo-divider" />

        {/* Human side — entire card is the record button */}
        <div className="convo-side">
          <button
            className={`convo-card convo-card--human${humanRecording ? ' convo-card--recording' : ''}`}
            onClick={handleHumanCardClick}
            aria-label={humanRecording ? 'Stop recording' : 'Start recording'}
          >
            <span className="convo-side-label">
              {humanRecording ? '● Recording…' : 'You'}
            </span>
            <div className="convo-circle-wrap">
              {humanRecording && (
                <>
                  <div className="convo-ring convo-ring--1 convo-ring--human" />
                  <div className="convo-ring convo-ring--2 convo-ring--human" />
                  <div className="convo-ring convo-ring--3 convo-ring--human" />
                </>
              )}
              <div className={`convo-circle convo-circle--human${humanRecording ? ' convo-circle--active' : ''}`}>
                <PersonIcon />
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
