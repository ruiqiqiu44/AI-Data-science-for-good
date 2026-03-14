import { useParams, useNavigate } from 'react-router-dom'
import './ScenarioPage.css'

function VocabularyIllustration() {
  return (
    <svg viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Open book */}
      <path d="M30 40 Q100 30 100 40 L100 150 Q100 140 30 150 Z" fill="#fef9c3" stroke="#fbbf24" strokeWidth="2.5"/>
      <path d="M170 40 Q100 30 100 40 L100 150 Q100 140 170 150 Z" fill="#fef9c3" stroke="#fbbf24" strokeWidth="2.5"/>
      <line x1="100" y1="38" x2="100" y2="150" stroke="#fbbf24" strokeWidth="2.5"/>
      {/* Left page lines */}
      <line x1="45" y1="65" x2="88" y2="63" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="45" y1="78" x2="88" y2="76" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="45" y1="91" x2="88" y2="89" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="45" y1="104" x2="72" y2="103" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Right page lines */}
      <line x1="112" y1="63" x2="155" y2="65" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="112" y1="76" x2="155" y2="78" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="112" y1="89" x2="155" y2="91" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="112" y1="103" x2="140" y2="104" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Floating flashcards */}
      <rect x="118" y="110" width="52" height="36" rx="6" fill="#fde68a" stroke="#f59e0b" strokeWidth="2" transform="rotate(12 144 128)"/>
      <line x1="126" y1="122" x2="158" y2="120" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" transform="rotate(12 144 128)"/>
      <line x1="126" y1="131" x2="152" y2="129" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" transform="rotate(12 144 128)"/>
      <rect x="26" y="118" width="52" height="36" rx="6" fill="#fde68a" stroke="#f59e0b" strokeWidth="2" transform="rotate(-10 52 136)"/>
      <line x1="34" y1="130" x2="66" y2="128" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" transform="rotate(-10 52 136)"/>
      <line x1="34" y1="139" x2="60" y2="137" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" transform="rotate(-10 52 136)"/>
      {/* Pencil */}
      <rect x="148" y="30" width="8" height="44" rx="2" fill="#fbbf24" transform="rotate(30 152 52)"/>
      <polygon points="148,74 156,74 152,84" fill="#fca5a5" transform="rotate(30 152 52)"/>
      <rect x="148" y="28" width="8" height="8" rx="1" fill="#d1d5db" transform="rotate(30 152 52)"/>
    </svg>
  )
}

function ConversationIllustration() {
  return (
    <svg viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Left speech bubble */}
      <rect x="14" y="20" width="100" height="58" rx="16" fill="#d1fae5" stroke="#34d399" strokeWidth="2.5"/>
      <path d="M30 78 L22 96 L50 78" fill="#d1fae5" stroke="#34d399" strokeWidth="2.5" strokeLinejoin="round"/>
      {/* Left bubble text lines */}
      <line x1="28" y1="40" x2="100" y2="40" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="28" y1="54" x2="100" y2="54" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="28" y1="68" x2="76" y2="68" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Left person */}
      <circle cx="30" cy="120" r="14" fill="#fbbf24"/>
      <rect x="18" y="136" width="24" height="22" rx="6" fill="#34d399"/>
      <line x1="18" y1="142" x2="8" y2="152" stroke="#34d399" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="42" y1="142" x2="52" y2="152" stroke="#34d399" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="22" y1="158" x2="20" y2="170" stroke="#059669" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="38" y1="158" x2="40" y2="170" stroke="#059669" strokeWidth="3.5" strokeLinecap="round"/>
      {/* Right speech bubble */}
      <rect x="86" y="82" width="100" height="58" rx="16" fill="#ede9fe" stroke="#a78bfa" strokeWidth="2.5"/>
      <path d="M170 140 L178 158 L150 140" fill="#ede9fe" stroke="#a78bfa" strokeWidth="2.5" strokeLinejoin="round"/>
      {/* Right bubble text lines */}
      <line x1="100" y1="102" x2="172" y2="102" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="100" y1="116" x2="172" y2="116" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="100" y1="130" x2="148" y2="130" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Right person */}
      <circle cx="170" cy="120" r="14" fill="#fbbf24"/>
      <rect x="158" y="136" width="24" height="22" rx="6" fill="#a78bfa"/>
      <line x1="158" y1="142" x2="148" y2="152" stroke="#a78bfa" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="182" y1="142" x2="192" y2="152" stroke="#a78bfa" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="162" y1="158" x2="160" y2="170" stroke="#7c3aed" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="178" y1="158" x2="180" y2="170" stroke="#7c3aed" strokeWidth="3.5" strokeLinecap="round"/>
    </svg>
  )
}

export default function ScenarioPage() {
  const { scenarioId } = useParams<{ scenarioId: string }>()
  const navigate = useNavigate()

  return (
    <div className="mode-page">
      <button className="back-btn" onClick={() => navigate('/')}>
        ← Back
      </button>

      <div className="mode-split">
        <button
          className="mode-card mode-card--vocab"
          onClick={() => navigate(`/scenario/${scenarioId}/vocabulary`)}
        >
          <div className="mode-illustration">
            <VocabularyIllustration />
          </div>
          <div className="mode-label">📖 Vocabulary</div>
        </button>

        <button
          className="mode-card mode-card--convo"
          onClick={() => navigate(`/scenario/${scenarioId}/conversation`)}
        >
          <div className="mode-illustration">
            <ConversationIllustration />
          </div>
          <div className="mode-label">💬 Conversation</div>
        </button>
      </div>
    </div>
  )
}
