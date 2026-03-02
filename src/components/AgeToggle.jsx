import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AgeToggle({ onToggle }) {
  const [stage, setStage] = useState('idle') // idle → resisting → active

  const handleClick = () => {
    if (stage === 'idle') setStage('resisting')
    else if (stage === 'active') {
      setStage('idle')
      onToggle(false)
    }
  }

  return (
    <div
      className="fixed bottom-6 z-50 flex flex-col items-center gap-3"
      style={{ left: 'calc(50% + 52px)', transform: 'translateX(-50%)' }}
    >
      {/* Resistance popup */}
      <AnimatePresence>
        {stage === 'resisting' && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="text-center px-6 py-5"
            style={{
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '1.25rem',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
              width: '240px',
            }}
          >
            <p className="text-white/60 text-xs font-light leading-relaxed mb-4">
              Stars were meant to be ageless —<br />their wisdom speaks beyond years.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setStage('idle')}
                className="px-4 py-1.5 text-xs text-white/40 font-light hover:text-white/70 transition-colors"
              >
                you're right
              </button>
              <button
                onClick={() => { setStage('active'); onToggle(true) }}
                className="px-4 py-1.5 text-xs text-white/60 font-light hover:text-white transition-colors rounded-lg"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                reveal anyway
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Icon button — concentric rings suggesting life stages */}
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300"
        style={{
          background: stage === 'active' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: `1px solid rgba(255,255,255,${stage === 'active' ? '0.2' : '0.1'})`,
        }}
        title={stage === 'active' ? 'Hide age colours' : 'Reveal age'}
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
          {/* Inner dot */}
          <circle
            cx="12" cy="12" r="2.5"
            fill={stage === 'active' ? '#818cf8' : 'rgba(255,255,255,0.5)'}
          />
          {/* Middle ring */}
          <circle
            cx="12" cy="12" r="6"
            stroke={stage === 'active' ? '#b084fc' : 'rgba(255,255,255,0.3)'}
            strokeWidth="1.5"
            fill="none"
          />
          {/* Outer ring */}
          <circle
            cx="12" cy="12" r="9.5"
            stroke={stage === 'active' ? '#fbbf24' : 'rgba(255,255,255,0.15)'}
            strokeWidth="1"
            strokeDasharray="3 2"
            fill="none"
          />
        </svg>
      </motion.button>
    </div>
  )
}
