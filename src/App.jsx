import { useState, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Scene from './components/Scene'
import DetailPanel from './components/DetailPanel'
import AudioController from './components/AudioController'
import LoadingScreen from './components/LoadingScreen'
import ContributePage from './components/ContributePage'
import AdminPage from './components/AdminPage'
import learningsData from './data/learnings-processed.json'

function ConstellationView() {
  const [selectedLearning, setSelectedLearning] = useState(null)
  const [audioEnabled, setAudioEnabled] = useState(true)

  const handleStarClick = (learning) => {
    setSelectedLearning(learning)
  }

  const handleClose = () => {
    setSelectedLearning(null)
  }

  const handleRelatedClick = (relatedId) => {
    const related = learningsData.find(l => l.id === relatedId)
    if (related) {
      setSelectedLearning(related)
    }
  }

  return (
    <div className="w-full h-full bg-black">
      <Suspense fallback={<LoadingScreen />}>
        <Scene
          learnings={learningsData}
          selectedLearning={selectedLearning}
          onStarClick={handleStarClick}
        />
      </Suspense>

      {selectedLearning && (
        <DetailPanel
          learning={selectedLearning}
          learnings={learningsData}
          onClose={handleClose}
          onRelatedClick={handleRelatedClick}
        />
      )}

      <AudioController
        selectedLearning={selectedLearning}
        enabled={audioEnabled}
        onToggle={() => setAudioEnabled(!audioEnabled)}
      />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ConstellationView />} />
        <Route path="/contribute" element={<ContributePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
