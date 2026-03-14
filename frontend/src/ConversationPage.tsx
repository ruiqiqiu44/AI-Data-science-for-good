import { useParams, useNavigate } from 'react-router-dom'

export default function ConversationPage() {
  const { scenarioId } = useParams<{ scenarioId: string }>()
  const navigate = useNavigate()

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <button onClick={() => navigate(`/scenario/${scenarioId}`)} style={{ cursor: 'pointer', marginBottom: '1rem' }}>
        ← Back
      </button>
      <p>Conversation — Scenario: <strong>{scenarioId}</strong></p>
    </div>
  )
}
