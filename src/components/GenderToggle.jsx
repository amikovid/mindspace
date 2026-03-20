import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function GenderToggle({ onToggle }) {
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
      style={{ left: 'calc(50% + 96px)', transform: 'translateX(-50%)' }}
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
              These stars were born whole —<br />dividing them by gender may miss the point.
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

      {/* Icon button — two circles split by a line */}
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
        title={stage === 'active' ? 'Reset to constellation' : 'Split by gender'}
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
          {/* Left dot */}
          <circle
            cx="8" cy="12" r="3"
            fill={stage === 'active' ? '#a78bfa' : 'rgba(255,255,255,0.45)'}
          />
          {/* Right dot */}
          <circle
            cx="16" cy="12" r="3"
            fill={stage === 'active' ? '#f9a8d4' : 'rgba(255,255,255,0.45)'}
          />
          {/* Dividing line */}
          <line
            x1="12" y1="5" x2="12" y2="19"
            stroke={stage === 'active' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)'}
            strokeWidth="0.75"
          />
        </svg>
      </motion.button>
    </div>
  )
}
