import { useNavigate } from 'react-router-dom'
import './App.css'

function GroceryIllustration() {
  return (
    <svg viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Store shelf */}
      <rect x="10" y="20" width="140" height="8" rx="3" fill="#a3d977" />
      <rect x="10" y="50" width="140" height="8" rx="3" fill="#a3d977" />
      {/* Items on top shelf */}
      <rect x="20" y="8" width="16" height="12" rx="3" fill="#f97316" />
      <rect x="42" y="5" width="14" height="15" rx="3" fill="#ef4444" />
      <rect x="62" y="9" width="18" height="11" rx="3" fill="#facc15" />
      <rect x="86" y="6" width="12" height="14" rx="3" fill="#3b82f6" />
      <rect x="104" y="8" width="16" height="12" rx="3" fill="#a855f7" />
      {/* Items on bottom shelf */}
      <rect x="20" y="38" width="20" height="12" rx="3" fill="#22c55e" />
      <rect x="46" y="36" width="14" height="14" rx="3" fill="#f97316" />
      <rect x="66" y="39" width="16" height="11" rx="3" fill="#ec4899" />
      <rect x="88" y="37" width="18" height="13" rx="3" fill="#facc15" />
      <rect x="112" y="38" width="14" height="12" rx="3" fill="#ef4444" />
      {/* Shopping cart */}
      <path d="M100 70 L106 86 L148 86 L154 70 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
      <path d="M96 66 L100 70 H154" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
      <line x1="90" y1="66" x2="96" y2="66" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
      <circle cx="114" cy="92" r="5" fill="#64748b" />
      <circle cx="140" cy="92" r="5" fill="#64748b" />
      {/* Person */}
      <circle cx="48" cy="62" r="10" fill="#fbbf24" />
      <rect x="40" y="74" width="16" height="18" rx="4" fill="#3b82f6" />
      <line x1="40" y1="78" x2="30" y2="86" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
      <line x1="56" y1="78" x2="66" y2="86" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
      <line x1="44" y1="92" x2="42" y2="100" stroke="#1e40af" strokeWidth="3" strokeLinecap="round" />
      <line x1="52" y1="92" x2="54" y2="100" stroke="#1e40af" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function PharmacyIllustration() {
  return (
    <svg viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Building */}
      <rect x="20" y="30" width="80" height="70" rx="4" fill="#e0f2fe" stroke="#93c5fd" strokeWidth="2" />
      <rect x="45" y="55" width="30" height="45" rx="3" fill="#93c5fd" />
      {/* Roof */}
      <polygon points="10,30 60,5 110,30" fill="#3b82f6" />
      {/* Medical cross on building */}
      <rect x="50" y="35" width="20" height="6" rx="2" fill="#ef4444" />
      <rect x="57" y="28" width="6" height="20" rx="2" fill="#ef4444" />
      {/* Medicine bottle */}
      <rect x="118" y="38" width="26" height="40" rx="6" fill="#a78bfa" />
      <rect x="122" y="30" width="18" height="12" rx="3" fill="#7c3aed" />
      <rect x="126" y="26" width="10" height="6" rx="2" fill="#6d28d9" />
      <rect x="124" y="52" width="14" height="4" rx="2" fill="white" opacity="0.7" />
      <rect x="124" y="60" width="10" height="4" rx="2" fill="white" opacity="0.7" />
      {/* Pills */}
      <ellipse cx="130" cy="88" rx="9" ry="5" fill="#f472b6" />
      <line x1="130" y1="83" x2="130" y2="93" stroke="white" strokeWidth="2" />
      <ellipse cx="112" cy="90" rx="9" ry="5" fill="#34d399" />
      <line x1="112" y1="85" x2="112" y2="95" stroke="white" strokeWidth="2" />
      {/* Sign */}
      <rect x="20" y="14" width="40" height="14" rx="3" fill="white" stroke="#93c5fd" strokeWidth="1.5" />
      <rect x="35" y="19" width="10" height="3" rx="1" fill="#ef4444" />
      <rect x="38" y="16" width="3" height="10" rx="1" fill="#ef4444" />
    </svg>
  )
}

function TransportIllustration() {
  return (
    <svg viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Road */}
      <rect x="0" y="78" width="160" height="22" fill="#94a3b8" />
      <rect x="0" y="76" width="160" height="5" fill="#64748b" />
      {/* Road markings */}
      <rect x="10" y="86" width="20" height="4" rx="2" fill="white" opacity="0.7" />
      <rect x="50" y="86" width="20" height="4" rx="2" fill="white" opacity="0.7" />
      <rect x="90" y="86" width="20" height="4" rx="2" fill="white" opacity="0.7" />
      <rect x="130" y="86" width="20" height="4" rx="2" fill="white" opacity="0.7" />
      {/* Bus body */}
      <rect x="12" y="26" width="96" height="52" rx="10" fill="#f97316" />
      <rect x="12" y="26" width="96" height="18" rx="10" fill="#ea580c" />
      {/* Windows */}
      <rect x="20" y="32" width="18" height="14" rx="4" fill="#bae6fd" />
      <rect x="44" y="32" width="18" height="14" rx="4" fill="#bae6fd" />
      <rect x="68" y="32" width="18" height="14" rx="4" fill="#bae6fd" />
      {/* Door */}
      <rect x="88" y="50" width="14" height="22" rx="3" fill="#fed7aa" stroke="#ea580c" strokeWidth="1.5" />
      <circle cx="97" cy="61" r="2" fill="#ea580c" />
      {/* Front detail */}
      <rect x="16" y="52" width="14" height="8" rx="3" fill="#bae6fd" />
      {/* Headlight */}
      <rect x="14" y="62" width="10" height="6" rx="2" fill="#fef08a" />
      {/* Wheels */}
      <circle cx="36" cy="80" r="12" fill="#1e293b" />
      <circle cx="36" cy="80" r="6" fill="#475569" />
      <circle cx="88" cy="80" r="12" fill="#1e293b" />
      <circle cx="88" cy="80" r="6" fill="#475569" />
      {/* Person waiting */}
      <circle cx="138" cy="50" r="9" fill="#fbbf24" />
      <rect x="130" y="61" width="16" height="15" rx="4" fill="#22c55e" />
      <line x1="130" y1="65" x2="122" y2="72" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
      <line x1="146" y1="65" x2="152" y2="70" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
      <line x1="133" y1="76" x2="131" y2="85" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />
      <line x1="143" y1="76" x2="145" y2="85" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />
      {/* Bus stop sign */}
      <line x1="152" y1="40" x2="152" y2="80" stroke="#64748b" strokeWidth="3" />
      <rect x="144" y="28" width="20" height="14" rx="3" fill="#3b82f6" />
      <rect x="147" y="32" width="6" height="3" rx="1" fill="white" />
      <rect x="147" y="37" width="10" height="2" rx="1" fill="white" opacity="0.7" />
    </svg>
  )
}

const scenarios = [
  {
    id: 'grocery',
    emoji: '🛒',
    label: 'Grocery Store',
    accentColor: '#16a34a',
    bgColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    illustration: <GroceryIllustration />,
  },
  {
    id: 'pharmacy',
    emoji: '💊',
    label: 'Pharmacy & Clinic',
    accentColor: '#2563eb',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
    illustration: <PharmacyIllustration />,
  },
  {
    id: 'transport',
    emoji: '🚌',
    label: 'Transport',
    accentColor: '#ea580c',
    bgColor: '#fff7ed',
    borderColor: '#fed7aa',
    illustration: <TransportIllustration />,
  },
]

function App() {
  const navigate = useNavigate()

  return (
    <div className="app">
      <header className="app-header">
        <span className="header-icon">🗪</span>
        <h1 className="app-title">Pick a scenario</h1>
      </header>

      <button
        onClick={() => navigate('/scan')}
        style={{
          background: '#1e293b', color: '#fff', border: 'none',
          borderRadius: 16, padding: '14px 28px',
          fontSize: 16, fontWeight: 800, cursor: 'pointer',
        }}
      >
        📷 Scan a Photo
      </button>


      <div className="scenario-grid">
        {scenarios.map((s) => (
          <button
            key={s.id}
            className="scenario-card"
            style={{
              '--accent': s.accentColor,
              '--bg': s.bgColor,
              '--border': s.borderColor,
            } as React.CSSProperties}
            onClick={() => navigate(`/scenario/${s.id}`)}
          >
            <div className="card-top">
              <span className="card-emoji">{s.emoji}</span>
            </div>
            <div className="card-illustration">
              {s.illustration}
            </div>
            <div className="card-label">{s.label}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default App
