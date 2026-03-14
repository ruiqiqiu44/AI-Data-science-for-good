import { useParams, useNavigate } from 'react-router-dom'

export default function VocabularyPage() {
  const { scenarioId } = useParams<{ scenarioId: string }>()
  const navigate = useNavigate()

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <button onClick={() => navigate(`/scenario/${scenarioId}`)} style={{ cursor: 'pointer', marginBottom: '1rem' }}>
        ← Back
      </button>
      <p>Vocabulary — Scenario: <strong>{scenarioId}</strong></p>
    </div>
  )
}
