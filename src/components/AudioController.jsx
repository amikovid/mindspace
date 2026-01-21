import { useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'

export default function AudioController({ selectedLearning, enabled, onToggle }) {
  const synthRef = useRef(null)
  const [audioStarted, setAudioStarted] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)

  // Initialize audio
  useEffect(() => {
    const initAudio = async () => {
      try {
        // Try to start audio context
        await Tone.start()

        // Create ambient synth
        synthRef.current = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sine' },
          envelope: {
            attack: 2,
            decay: 1,
            sustain: 0.5,
            release: 3
          }
        }).toDestination()

        const reverb = new Tone.Reverb({
          decay: 5,
          wet: 0.5
        }).toDestination()

        synthRef.current.connect(reverb)

        // Start ambient drone
        if (enabled) {
          synthRef.current.triggerAttack(['C2', 'G2'], Tone.now())
          Tone.Transport.start()
        }

        setAudioStarted(true)
        setShowPrompt(false)
      } catch (error) {
        console.log('Audio autoplay blocked, waiting for user interaction')
        setShowPrompt(true)
      }
    }

    initAudio()

    return () => {
      if (synthRef.current) {
        synthRef.current.releaseAll()
        synthRef.current.dispose()
      }
    }
  }, [])

  // Handle enable/disable
  useEffect(() => {
    if (synthRef.current && audioStarted) {
      if (enabled) {
        synthRef.current.triggerAttack(['C2', 'G2'], Tone.now())
      } else {
        synthRef.current.releaseAll()
      }
    }
  }, [enabled, audioStarted])

  // Play sound when star is selected
  useEffect(() => {
    if (selectedLearning && synthRef.current && enabled && audioStarted) {
      // Map position to pitch
      const baseNote = 60 // Middle C
      const pitchOffset = Math.floor((selectedLearning.position.x + 10) / 20 * 24)
      const midiNote = baseNote + pitchOffset

      // Play note
      synthRef.current.triggerAttackRelease(
        Tone.Frequency(midiNote, 'midi'),
        '8n',
        Tone.now(),
        0.3
      )
    }
  }, [selectedLearning, enabled, audioStarted])

  const handleUserInteraction = async () => {
    await Tone.start()
    setAudioStarted(true)
    setShowPrompt(false)
    onToggle()
  }

  return (
    <>
      {/* Audio enable prompt */}
      {showPrompt && (
        <div
          onClick={handleUserInteraction}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 cursor-pointer z-40"
        >
          <div className="glass rounded-2xl p-8 text-white text-center">
            <p className="text-lg mb-2">Click anywhere to enable audio</p>
            <p className="text-sm text-gray-400">Experience ambient sounds as you explore</p>
          </div>
        </div>
      )}

      {/* Mute toggle button */}
      {audioStarted && (
        <button
          onClick={onToggle}
          className="fixed bottom-6 left-6 w-12 h-12 rounded-full glass
                     flex items-center justify-center text-white
                     hover:bg-white hover:bg-opacity-10 transition-smooth z-50"
          aria-label={enabled ? 'Mute audio' : 'Unmute audio'}
        >
          {enabled ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          )}
        </button>
      )}
    </>
  )
}
