import { useState, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Scene from './components/Scene'
import DetailPanel from './components/DetailPanel'
import AudioController from './components/AudioController'
import LoadingScreen from './components/LoadingScreen'
import ContributePage from './components/ContributePage'
import AdminPage from './components/AdminPage'
import LandingScreen from './components/LandingScreen'
import SearchBar from './components/SearchBar'
import AgeToggle from './components/AgeToggle'
import GenderToggle from './components/GenderToggle'
import learningsData from './data/learnings-processed.json'

function ConstellationView() {
  const [selectedLearning, setSelectedLearning] = useState(null)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [showLanding, setShowLanding] = useState(true)
  const [isEntering, setIsEntering] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAge, setShowAge] = useState(false)
  const [showGender, setShowGender] = useState(false)

  const handleEnter = () => {
    setIsEntering(true)                               // spin starts immediately
    setTimeout(() => setShowLanding(false), 800)      // UI reveals as glass finishes fading
    setTimeout(() => setIsEntering(false), 1300)      // spin settles naturally
  }

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
      {/* Scene — blurred/dimmed while landing is showing */}
      <div
        className="w-full h-full transition-all duration-1000"
        style={showLanding ? { filter: 'blur(3px) brightness(0.5)' } : {}}
      >
        <Suspense fallback={<LoadingScreen />}>
          <Scene
            learnings={learningsData}
            selectedLearning={selectedLearning}
            onStarClick={handleStarClick}
            isEntering={isEntering}
            searchQuery={searchQuery}
            showAge={showAge}
            showGender={showGender}
          />
        </Suspense>
      </div>

      {/* Landing screen overlay */}
      {showLanding && (
        <LandingScreen onEnter={handleEnter} />
      )}

      {/* Only show UI elements after entering */}
      {!showLanding && (
        <>
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

          <SearchBar onSearch={setSearchQuery} />
          <AgeToggle onToggle={setShowAge} />
          <GenderToggle onToggle={setShowGender} />

          {/* Contribute floating button — bottom right */}
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="fixed bottom-6 right-6 z-50"
            >
              <Link
                to="/contribute"
                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-white/60 hover:text-white text-xs tracking-widest uppercase transition-all duration-300 hover:bg-white/10"
                style={{
                  background: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 group-hover:bg-white/80 transition-colors" />
                contribute
              </Link>
            </motion.div>
          </AnimatePresence>
        </>
      )}
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
