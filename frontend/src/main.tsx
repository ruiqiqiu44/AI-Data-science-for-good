import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import ScenarioPage from './ScenarioPage.tsx'
import VocabPronunciationPage from './VocabPronunciationPage.tsx'
import ConversationPage from './ConversationPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/scenario/:scenarioId" element={<ScenarioPage />} />
        <Route path="/scenario/:scenarioId/vocab-pronunciation" element={<VocabPronunciationPage />} />
        <Route path="/scenario/:scenarioId/conversation" element={<ConversationPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
