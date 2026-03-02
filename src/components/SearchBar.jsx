import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SearchBar({ onSearch }) {
  const [stage, setStage] = useState('idle')   // idle → resisting → active
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (stage === 'active' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [stage])

  useEffect(() => {
    onSearch(stage === 'active' ? query : '')
  }, [query, stage])

  const handleIconClick = () => {
    if (stage === 'idle') setStage('resisting')
    else if (stage === 'active') {
      setStage('idle')
      setQuery('')
    }
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3">

      {/* Resistance popup */}
      <AnimatePresence>
        {stage === 'resisting' && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="text-center px-6 py-5 max-w-xs"
            style={{
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '1.25rem',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            <p className="text-white/60 text-xs font-light leading-relaxed mb-4">
              The constellation was meant to be traversed<br />without a guide — let serendipity lead you.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setStage('idle')}
                className="px-4 py-1.5 text-xs text-white/40 font-light hover:text-white/70 transition-colors"
              >
                you're right
              </button>
              <button
                onClick={() => setStage('active')}
                className="px-4 py-1.5 text-xs text-white/60 font-light hover:text-white transition-colors rounded-lg"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                search anyway
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search input */}
      <AnimatePresence>
        {stage === 'active' && (
          <motion.div
            initial={{ opacity: 0, width: 32, y: 4 }}
            animate={{ opacity: 1, width: 220, y: 0 }}
            exit={{ opacity: 0, width: 32, y: 4 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '999px',
              overflow: 'hidden',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="search wisdom..."
              className="w-full px-5 py-2.5 bg-transparent text-white/80 text-xs font-light placeholder-white/25 focus:outline-none"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Icon button */}
      <motion.button
        onClick={handleIconClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300"
        style={{
          background: stage === 'active' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: `1px solid rgba(255,255,255,${stage === 'active' ? '0.2' : '0.1'})`,
        }}
        title={stage === 'active' ? 'Close search' : 'Search'}
      >
        {stage === 'active' ? (
          <svg className="w-3.5 h-3.5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
      </motion.button>
    </div>
  )
}
