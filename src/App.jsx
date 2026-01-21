import { useState, Suspense } from 'react'
import Scene from './components/Scene'
import DetailPanel from './components/DetailPanel'
import AudioController from './components/AudioController'
import LoadingScreen from './components/LoadingScreen'
import learningsData from './data/learnings-processed.json'

function App() {
  const [selectedLearning, setSelectedLearning] = useState(null)
  const [audioEnabled, setAudioEnabled] = useState(false)

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

export default App
