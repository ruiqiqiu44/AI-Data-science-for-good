import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { createWorker } from 'tesseract.js'

const WORD_MAP: Record<string, { emoji: string; bg: string; color: string; meaning: string }> = {
  emergency: { emoji: '🚨', bg: '#fee2e2', color: '#dc2626', meaning: 'Something dangerous' },
  exit: { emoji: '🚪', bg: '#fef3c7', color: '#d97706', meaning: 'The way out' },
  danger: { emoji: '⚠️', bg: '#fee2e2', color: '#dc2626', meaning: 'Not safe here' },
  warning: { emoji: '⚠️', bg: '#fef3c7', color: '#b45309', meaning: 'Be careful' },
  stop: { emoji: '🛑', bg: '#fee2e2', color: '#dc2626', meaning: 'Do not go' },
  caution: { emoji: '🟡', bg: '#fef3c7', color: '#b45309', meaning: 'Go slowly / careful' },
  fire: { emoji: '🔥', bg: '#fee2e2', color: '#dc2626', meaning: 'Very hot / call 911' },
  hospital: { emoji: '🏥', bg: '#fee2e2', color: '#dc2626', meaning: 'Medical building' },
  pharmacy: { emoji: '💊', bg: '#fce7f3', color: '#be185d', meaning: 'Medicine store' },
  poison: { emoji: '☠️', bg: '#fee2e2', color: '#dc2626', meaning: 'Very dangerous — do not eat' },
  open: { emoji: '🟢', bg: '#dcfce7', color: '#16a34a', meaning: 'You can go in' },
  closed: { emoji: '🔴', bg: '#fee2e2', color: '#dc2626', meaning: 'Not open now' },
  entrance: { emoji: '➡️', bg: '#dbeafe', color: '#1d4ed8', meaning: 'Come in this way' },
  stairs: { emoji: '🪜', bg: '#ede9fe', color: '#6d28d9', meaning: 'Steps up or down' },
  elevator: { emoji: '🛗', bg: '#ede9fe', color: '#6d28d9', meaning: 'Lift / going up-down' },
  parking: { emoji: '🅿️', bg: '#dbeafe', color: '#1d4ed8', meaning: 'Place for your car' },
  bus: { emoji: '🚌', bg: '#dbeafe', color: '#1d4ed8', meaning: 'Public transport' },
  train: { emoji: '🚂', bg: '#dbeafe', color: '#1d4ed8', meaning: 'Fast land transport' },
  school: { emoji: '🏫', bg: '#ede9fe', color: '#6d28d9', meaning: 'Place to learn' },
  library: { emoji: '📚', bg: '#ede9fe', color: '#6d28d9', meaning: 'Free books & computers' },
  bank: { emoji: '🏦', bg: '#fef3c7', color: '#b45309', meaning: 'Keep your money here' },
  restaurant: { emoji: '🍽️', bg: '#fff7ed', color: '#c2410c', meaning: 'Buy and eat food' },
  office: { emoji: '🏢', bg: '#dbeafe', color: '#1d4ed8', meaning: 'Place to work' },
  doctor: { emoji: '👨‍⚕️', bg: '#fee2e2', color: '#dc2626', meaning: 'Medical person' },
  nurse: { emoji: '👩‍⚕️', bg: '#fce7f3', color: '#be185d', meaning: 'Helps the doctor' },
  medicine: { emoji: '💊', bg: '#fce7f3', color: '#be185d', meaning: 'Pill to help you' },
  allergy: { emoji: '🤧', bg: '#fce7f3', color: '#be185d', meaning: 'Bad reaction to something' },
  appointment: { emoji: '📋', bg: '#dbeafe', color: '#1d4ed8', meaning: 'Scheduled meeting time' },
  job: { emoji: '💼', bg: '#fef3c7', color: '#b45309', meaning: 'Work / employment' },
  interview: { emoji: '🤝', bg: '#dbeafe', color: '#1d4ed8', meaning: 'Meeting to get a job' },
  rent: { emoji: '🏠', bg: '#fff7ed', color: '#c2410c', meaning: 'Pay to live somewhere' },
  electricity: { emoji: '⚡', bg: '#fef3c7', color: '#d97706', meaning: 'Power in your home' },
  water: { emoji: '💧', bg: '#e0f2fe', color: '#0284c7', meaning: 'Clean drinking water' },
  wifi: { emoji: '📶', bg: '#dbeafe', color: '#1d4ed8', meaning: 'Internet connection' },
  free: { emoji: '🆓', bg: '#dcfce7', color: '#16a34a', meaning: 'No cost — zero money' },
  sale: { emoji: '🏷️', bg: '#dcfce7', color: '#16a34a', meaning: 'Lower price now' },
  cash: { emoji: '💵', bg: '#dcfce7', color: '#16a34a', meaning: 'Paper money' },
  card: { emoji: '💳', bg: '#dbeafe', color: '#1d4ed8', meaning: 'Bank card to pay' },
  halal: { emoji: '☪️', bg: '#dcfce7', color: '#15803d', meaning: 'Allowed in Islam' },
  vegetarian: { emoji: '🥗', bg: '#dcfce7', color: '#15803d', meaning: 'No meat in food' },
  nuts: { emoji: '🥜', bg: '#fef3c7', color: '#b45309', meaning: 'Can cause allergy' },
  push: { emoji: '👉', bg: '#e0f2fe', color: '#0284c7', meaning: 'Press forward' },
  pull: { emoji: '👈', bg: '#e0f2fe', color: '#0284c7', meaning: 'Bring toward you' },
  wait: { emoji: '⏳', bg: '#fef3c7', color: '#b45309', meaning: 'Stay here a moment' },
  help: { emoji: '🆘', bg: '#fee2e2', color: '#dc2626', meaning: 'Need assistance' },
  welcome: { emoji: '👋', bg: '#dcfce7', color: '#16a34a', meaning: 'We are glad you are here' },
  please: { emoji: '🙏', bg: '#ede9fe', color: '#6d28d9', meaning: 'Being polite' },
  yes: { emoji: '✅', bg: '#dcfce7', color: '#16a34a', meaning: 'Agree / correct' },
  no: { emoji: '❌', bg: '#fee2e2', color: '#dc2626', meaning: 'Disagree / not allowed' },
  monday: { emoji: '1️⃣', bg: '#ede9fe', color: '#6d28d9', meaning: 'First day of week' },
  tuesday: { emoji: '2️⃣', bg: '#ede9fe', color: '#6d28d9', meaning: 'Second day' },
  wednesday: { emoji: '3️⃣', bg: '#ede9fe', color: '#6d28d9', meaning: 'Middle of week' },
  thursday: { emoji: '4️⃣', bg: '#ede9fe', color: '#6d28d9', meaning: 'Fourth day' },
  friday: { emoji: '5️⃣', bg: '#ede9fe', color: '#6d28d9', meaning: 'Last work day' },
  saturday: { emoji: '😊', bg: '#dcfce7', color: '#16a34a', meaning: 'Weekend — day off' },
  sunday: { emoji: '☀️', bg: '#fef3c7', color: '#d97706', meaning: 'Rest day / weekend' },
  today: { emoji: '📅', bg: '#e0f2fe', color: '#0284c7', meaning: 'This day — now' },
  tomorrow: { emoji: '⏭️', bg: '#e0f2fe', color: '#0284c7', meaning: 'The next day' },
  // Common words
  not: { emoji: '🚫', bg: '#fee2e2', color: '#dc2626', meaning: 'Do not do this' },
  only: { emoji: '1️⃣', bg: '#fef3c7', color: '#b45309', meaning: 'Just this, nothing else' },
  all: { emoji: '✅', bg: '#dcfce7', color: '#16a34a', meaning: 'Everything / everyone' },
  new: { emoji: '🆕', bg: '#dcfce7', color: '#16a34a', meaning: 'Recently made' },
  now: { emoji: '⚡', bg: '#fef3c7', color: '#d97706', meaning: 'At this moment' },

  // Health extra
  sick: { emoji: '🤒', bg: '#fee2e2', color: '#dc2626', meaning: 'Not feeling well' },
  pain: { emoji: '😣', bg: '#fee2e2', color: '#dc2626', meaning: 'Something hurts' },
  fever: { emoji: '🌡️', bg: '#fee2e2', color: '#dc2626', meaning: 'Body is too hot' },
  blood: { emoji: '🩸', bg: '#fee2e2', color: '#dc2626', meaning: 'Red liquid in body' },
  pregnant: { emoji: '🤰', bg: '#fce7f3', color: '#be185d', meaning: 'Having a baby' },
  baby: { emoji: '👶', bg: '#fce7f3', color: '#be185d', meaning: 'Very young child' },
  child: { emoji: '🧒', bg: '#fce7f3', color: '#be185d', meaning: 'Young person' },
  insurance: { emoji: '📋', bg: '#dbeafe', color: '#1d4ed8', meaning: 'Paper that pays for health' },

  // Grocery extra
  expired: { emoji: '❌', bg: '#fee2e2', color: '#dc2626', meaning: 'Too old — do not eat' },
  vegan: { emoji: '🌿', bg: '#dcfce7', color: '#15803d', meaning: 'Natural / no chemicals' },
  frozen: { emoji: '🧊', bg: '#e0f2fe', color: '#0284c7', meaning: 'Very cold / in freezer' },
  fresh: { emoji: '✅', bg: '#dcfce7', color: '#16a34a', meaning: 'New and good to eat' },
  dairy: { emoji: '🥛', bg: '#e0f2fe', color: '#0284c7', meaning: 'Milk products' },
  gluten: { emoji: '🌾', bg: '#fef3c7', color: '#b45309', meaning: 'In bread — can cause allergy' },
  checkout: { emoji: '💳', bg: '#dbeafe', color: '#1d4ed8', meaning: 'Pay here' },
  aisle: { emoji: '➡️', bg: '#dbeafe', color: '#1d4ed8', meaning: 'Row between shelves' },
  discount: { emoji: '🏷️', bg: '#dcfce7', color: '#16a34a', meaning: 'Lower price' },
  receipt: { emoji: '🧾', bg: '#f1f5f9', color: '#475569', meaning: 'Paper showing what you paid' },

  // Transport extra
  route: { emoji: '🗺️', bg: '#dbeafe', color: '#1d4ed8', meaning: 'Path the bus takes' },
  fare: { emoji: '💰', bg: '#fef3c7', color: '#b45309', meaning: 'Money to ride the bus' },
  transfer: { emoji: '🔄', bg: '#dbeafe', color: '#1d4ed8', meaning: 'Switch to another bus' },
  delay: { emoji: '⏳', bg: '#fef3c7', color: '#b45309', meaning: 'Late / not on time' },
  platform: { emoji: '🚉', bg: '#dbeafe', color: '#1d4ed8', meaning: 'Where you wait for train' },
  terminal: { emoji: '🏢', bg: '#dbeafe', color: '#1d4ed8', meaning: 'Main station building' },
  departure: { emoji: '🛫', bg: '#e0f2fe', color: '#0284c7', meaning: 'Leaving time' },
  arrival: { emoji: '🛬', bg: '#dcfce7', color: '#16a34a', meaning: 'Arriving time' },
  ticket: { emoji: '🎫', bg: '#fef3c7', color: '#b45309', meaning: 'Paper to ride' },
  monthly: { emoji: '📅', bg: '#e0f2fe', color: '#0284c7', meaning: 'Every month' },

  // Housing extra
  landlord: { emoji: '🏠', bg: '#fff7ed', color: '#c2410c', meaning: 'Person who owns building' },
  tenant: { emoji: '🧑', bg: '#fff7ed', color: '#c2410c', meaning: 'Person who rents' },
  deposit: { emoji: '💵', bg: '#dcfce7', color: '#16a34a', meaning: 'Money saved for damage' },
  lease: { emoji: '📝', bg: '#dbeafe', color: '#1d4ed8', meaning: 'Paper about renting' },
  repair: { emoji: '🛠️', bg: '#fef3c7', color: '#b45309', meaning: 'Fix something broken' },
  heat: { emoji: '🔥', bg: '#fee2e2', color: '#dc2626', meaning: 'Warmth in your home' },
  laundry: { emoji: '👕', bg: '#e0f2fe', color: '#0284c7', meaning: 'Washing clothes' },
  basement: { emoji: '⬇️', bg: '#f1f5f9', color: '#475569', meaning: 'Room below ground' },
  balcony: { emoji: '🌅', bg: '#e0f2fe', color: '#0284c7', meaning: 'Outside area on building' },
  furnished: { emoji: '🛋️', bg: '#fef3c7', color: '#b45309', meaning: 'Has furniture inside' },

  // Work extra
  resume: { emoji: '📄', bg: '#dbeafe', color: '#1d4ed8', meaning: 'Paper about your work history' },
  shift: { emoji: '🕐', bg: '#fef3c7', color: '#b45309', meaning: 'Your hours of work' },
  manager: { emoji: '👔', bg: '#dbeafe', color: '#1d4ed8', meaning: 'Person in charge' },
  salary: { emoji: '💵', bg: '#dcfce7', color: '#16a34a', meaning: 'Money you earn' },
  training: { emoji: '📚', bg: '#ede9fe', color: '#6d28d9', meaning: 'Learning for your job' },
  contract: { emoji: '📝', bg: '#dbeafe', color: '#1d4ed8', meaning: 'Paper about your job' },
  paycheck: { emoji: '💳', bg: '#dcfce7', color: '#16a34a', meaning: 'Money from your job' },
  fulltime: { emoji: '📅', bg: '#dbeafe', color: '#1d4ed8', meaning: 'Working all week' },
  parttime: { emoji: '🕐', bg: '#fef3c7', color: '#b45309', meaning: 'Working some days' },
  uniform: { emoji: '👕', bg: '#dbeafe', color: '#1d4ed8', meaning: 'Special clothes for work' },

  // School extra
  register: { emoji: '📝', bg: '#ede9fe', color: '#6d28d9', meaning: 'Sign up / enroll' },
  grade: { emoji: '⭐', bg: '#fef3c7', color: '#d97706', meaning: 'School level or mark' },
  homework: { emoji: '📚', bg: '#ede9fe', color: '#6d28d9', meaning: 'Work to do at home' },
  absent: { emoji: '❌', bg: '#fee2e2', color: '#dc2626', meaning: 'Not at school today' },
  permission: { emoji: '✅', bg: '#dcfce7', color: '#16a34a', meaning: 'Allowed to do something' },
  pickup: { emoji: '🚗', bg: '#dbeafe', color: '#1d4ed8', meaning: 'Come get your child' },
  dismissal: { emoji: '🔔', bg: '#fef3c7', color: '#d97706', meaning: 'School day is ending' },
  cafeteria: { emoji: '🍽️', bg: '#dcfce7', color: '#15803d', meaning: 'Place to eat at school' },
  principal: { emoji: '👩‍💼', bg: '#ede9fe', color: '#6d28d9', meaning: 'Head of the school' },
  volunteer: { emoji: '🙋', bg: '#dcfce7', color: '#16a34a', meaning: 'Help without being paid' },
}

type WordEntry = { word: string; emoji: string; bg: string; color: string; meaning: string }

function lookupWords(rawText: string): WordEntry[] {
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that',
    'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my',
    'your', 'his', 'its', 'our', 'their', 'at', 'in', 'on', 'to', 'of', 'and', 'or', 'but', 'for', 'with',
    'from', 'by', 'as', 'if', 'not', 'so', 'up', 'out', 'go', 'get', 'all', 'more', 'also', 'than', 'then',
    'when', 'where', 'how', 'what', 'who', 'which', 'about', 'into', 'just', 'here', 'there'])

  const words = rawText.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w))

  const seen = new Set<string>()
  const results: WordEntry[] = []

  for (const w of words) {
    if (seen.has(w)) continue
    seen.add(w)
    if (WORD_MAP[w]) {
      results.push({ word: w, ...WORD_MAP[w] })
    } else {
      const stems = [
        w.replace(/ing$/, ''), w.replace(/ed$/, ''), w.replace(/s$/, ''),
        w.replace(/ly$/, ''), w.replace(/er$/, ''), w.replace(/tion$/, 't'),
      ]
      for (const s of stems) {
        if (s.length > 2 && WORD_MAP[s] && !seen.has(s)) {
          seen.add(s)
          results.push({ word: w, ...WORD_MAP[s] })
          break
        }
      }
    }
  }
  return results
}

function speak(text: string) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'en-CA'
  utter.rate = 0.85
  window.speechSynthesis.speak(utter)
}

function WordCard({ word, emoji, bg, color, meaning }: WordEntry) {
  return (
    <div style={{
      borderRadius: 20, background: '#fff', overflow: 'hidden',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: '2px solid #e2e8f0'
    }}>
      <div style={{
        height: 90, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 52, background: bg
      }}>
        {emoji}
      </div>
      <div style={{ padding: '10px 12px 12px' }}>
        <div style={{ fontSize: 15, fontWeight: 900, color: '#0f172a', marginBottom: 2 }}>{word}</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 8, lineHeight: 1.3 }}>{meaning}</div>
        <button onClick={() => speak(word)} style={{
          width: '100%', border: 'none',
          borderRadius: 12, padding: '8px 0', fontFamily: 'inherit', fontSize: 13,
          fontWeight: 800, cursor: 'pointer', background: color, color: '#fff'
        }}>
          🔊 Say it
        </button>
      </div>
    </div>
  )
}

type Phase = 'idle' | 'loading' | 'done' | 'error'

export default function ScanPage() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('idle')
  const [progress, setProgress] = useState(0)
  const [statusMsg, setStatusMsg] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [rawText, setRawText] = useState('')
  const [words, setWords] = useState<WordEntry[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const runScan = async (file: File) => {
    const url = URL.createObjectURL(file)
    setImageUrl(url)
    setPhase('loading')
    setProgress(5)
    setStatusMsg('Loading scanner...')
    setWords([])
    setRawText('')

    try {
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(10 + m.progress * 85))
            setStatusMsg(`Scanning text... ${Math.round(m.progress * 100)}%`)
          } else if (m.status === 'loading tesseract core') {
            setStatusMsg('Loading scanner...')
            setProgress(8)
          } else if (m.status === 'initializing api') {
            setStatusMsg('Preparing...')
            setProgress(12)
          }
        },
      })

      const result = await worker.recognize(url)
      const text = result.data.text
      await worker.terminate()

      setProgress(100)
      setStatusMsg('Done! Here are the words explained.')
      setRawText(text.trim())
      setWords(lookupWords(text))
      setPhase('done')
    } catch (err) {
      console.error(err)
      setPhase('error')
      setStatusMsg('Could not read the image. Please try again.')
    }
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) runScan(file)
  }

  const handleReset = () => {
    setPhase('idle')
    setImageUrl(null)
    setRawText('')
    setWords([])
    setProgress(0)
    setStatusMsg('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f0eb', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        display: 'flex', alignItems: 'center', padding: '1rem 1.25rem',
        background: '#fff', borderBottom: '2px solid #e2e8f0'
      }}>
        <button onClick={() => navigate('/')} style={{
          all: 'unset', cursor: 'pointer',
          fontSize: 15, fontWeight: 700, color: '#64748b',
          background: '#f1f5f9', borderRadius: 10, padding: '8px 14px'
        }}>
          ← Back
        </button>
        <div style={{ marginLeft: 16, fontSize: 20, fontWeight: 900, color: '#0f172a' }}>
          📷 Scan a Photo
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1e293b, #334155)',
          borderRadius: 24, padding: '28px 24px 32px', textAlign: 'center', marginBottom: 20
        }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>📷</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 6 }}>Take a photo of any sign</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Upload a photo — we will explain the words</div>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*"
          style={{ display: 'none' }} onChange={handleFile} />

        {phase === 'idle' && (
          <div onClick={() => fileInputRef.current?.click()} style={{
            border: '3px dashed #cbd5e1', borderRadius: 24, padding: '40px 20px',
            textAlign: 'center', cursor: 'pointer', background: '#f8fafc', marginBottom: 16
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🖼️</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>Tap to choose a photo</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Pick an image from your device</div>
          </div>
        )}

        {imageUrl && (
          <div style={{
            borderRadius: 20, overflow: 'hidden', marginBottom: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)', position: 'relative'
          }}>
            <img src={imageUrl} alt="Uploaded" style={{ width: '100%', display: 'block', maxHeight: 260, objectFit: 'cover' }} />
            <div style={{
              position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.55)',
              color: '#fff', borderRadius: 10, padding: '4px 10px', fontSize: 12, fontWeight: 700
            }}>
              {phase === 'done' ? '✅ Scanned' : phase === 'loading' ? '⏳ Scanning…' : '📷 Photo'}
            </div>
          </div>
        )}

        {(phase === 'loading' || phase === 'done' || phase === 'error') && (
          <div style={{
            background: '#f1f5f9', borderRadius: 16, padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16
          }}>
            <div style={{ fontSize: 22 }}>
              {phase === 'loading' ? '⏳' : phase === 'done' ? '✅' : '❌'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#334155' }}>{statusMsg}</div>
              {phase === 'loading' && (
                <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden', marginTop: 6 }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    background: 'linear-gradient(90deg, #0ea5e9, #22c55e)',
                    width: `${progress}%`, transition: 'width 0.4s ease'
                  }} />
                </div>
              )}
            </div>
          </div>
        )}

        {phase === 'done' && (
          words.length > 0 ? (
            <>
              <div style={{
                fontSize: 13, fontWeight: 800, color: '#64748b',
                textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 14
              }}>
                🔍 {words.length} word{words.length !== 1 ? 's' : ''} explained
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {words.map(w => <WordCard key={w.word} {...w} />)}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 20px', color: '#64748b' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🤷</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#334155', marginBottom: 8 }}>No familiar words found</div>
              <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.5 }}>Try a photo of a sign, notice, or form.</div>
            </div>
          )
        )}

        {(phase === 'done' || phase === 'error') && (
          <button onClick={handleReset} style={{
            all: 'unset', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', background: '#f1f5f9', borderRadius: 16,
            padding: '14px 0', fontSize: 15, fontWeight: 800, color: '#334155', marginBottom: 32
          }}>
            🔄 Upload a new photo
          </button>
        )}
      </div>
    </div>
  )
}