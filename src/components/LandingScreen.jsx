import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import * as Tone from 'tone'

// One-shot click sound — same synth character as the stars
async function playNote(midi) {
  try {
    await Tone.start()
    const reverb = new Tone.Reverb({ decay: 3.5, wet: 0.45, preDelay: 0.01 }).toDestination()
    const synth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.35, sustain: 0.08, release: 0.6 },
      volume: -14
    }).connect(reverb)
    reverb.generate().then(() => {
      synth.triggerAttackRelease(Tone.Frequency(midi, 'midi'), '4n', Tone.now(), 0.55)
      setTimeout(() => { synth.dispose(); reverb.dispose() }, 3000)
    })
  } catch (_) {}
}

export default function LandingScreen({ onEnter }) {
  const [exiting, setExiting] = useState(false)

  const handleEnter = () => {
    playNote(64) // E4 — bright, expansive
    setExiting(true)
    onEnter() // fire immediately — no delay
  }

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.85, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Backdrop blur */}
          <motion.div
            className="absolute inset-0"
            style={{
              backdropFilter: 'blur(7px)',
              WebkitBackdropFilter: 'blur(7px)',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
            exit={{
              backdropFilter: 'blur(0px)',
              WebkitBackdropFilter: 'blur(0px)',
              backgroundColor: 'rgba(0,0,0,0)',
              scale: 1.05,
            }}
            transition={{ duration: 0.85, ease: [0.4, 0, 0.2, 1] }}
          />

          {/* Glass card */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 1.04 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="relative z-10 text-center px-10 py-12 max-w-xs w-full mx-6"
            style={{
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '2rem',
              boxShadow: '0 0 60px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            {/* Inner top highlight line */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }}
            />

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.6 }}
              className="relative z-10"
            >
              {/* Title — matches main app typography */}
              <h1 className="text-3xl font-light text-white mb-3 tracking-wide">
                Mindspace
              </h1>

              {/* Thin divider */}
              <div
                className="w-6 h-px mx-auto mb-5"
                style={{ background: 'rgba(255,255,255,0.18)' }}
              />

              {/* Tagline */}
              <p className="text-white/45 text-sm font-light leading-relaxed mb-10">
                Real wisdom from real lives,<br />mapped as a living constellation.
              </p>

              {/* Enter button */}
              <motion.button
                onClick={handleEnter}
                onHoverStart={() => Tone.start()} // pre-warm audio on hover, no click lag
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3.5 mb-3 rounded-xl text-white text-sm font-light transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.09)',
                  border: '1px solid rgba(255,255,255,0.14)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}
              >
                Enter the Universe
              </motion.button>

              {/* Contribute link */}
              <Link
                to="/contribute"
                onClick={() => playNote(60)} // C4 — warm, grounded
                className="block w-full py-3 rounded-xl text-white/40 text-sm font-light transition-all duration-300 hover:text-white/70"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              >
                Contribute
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
