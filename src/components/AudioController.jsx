import { useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'

export default function AudioController({ selectedLearning, enabled, onToggle }) {
  const ambientSynthRef = useRef(null)
  const clickSynthRef = useRef(null)
  const reverbRef = useRef(null)
  const [audioStarted, setAudioStarted] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)

  // Initialize audio - ALWAYS show button immediately
  useEffect(() => {
    const initAudio = async () => {
      // SHOW BUTTON IMMEDIATELY - don't wait for anything
      setAudioStarted(true)
      console.log('Audio button visible immediately')

      try {
        console.log('Attempting to initialize audio...')

        // Try to start audio context
        await Tone.start()
        console.log('Tone.js audio context started')

        // Create reverb effect (this is slow, but button is already visible)
        reverbRef.current = new Tone.Reverb({
          decay: 4,  // Reduced from 8 for faster generation
          wet: 0.5,
          preDelay: 0.01
        }).toDestination()

        await reverbRef.current.generate()
        console.log('Reverb effect created')

        // Create ambient pad synth with richer sound
        ambientSynthRef.current = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sine' },
          envelope: {
            attack: 4,
            decay: 2,
            sustain: 0.7,
            release: 8
          },
          volume: -20 // Reduced volume for ambient drone
        }).connect(reverbRef.current)
        console.log('Ambient synth created')

        // Create click synth for interaction sounds
        clickSynthRef.current = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sine' },
          envelope: {
            attack: 0.01,
            decay: 0.3,
            sustain: 0.1,
            release: 0.5
          },
          volume: -16 // Reduced volume for click sounds
        }).connect(reverbRef.current)
        console.log('Click synth created')

        // Start ambient drone with multiple notes for richness (lower volume)
        if (enabled) {
          ambientSynthRef.current.triggerAttack(['C2', 'G2', 'C3', 'E3'], Tone.now())
          Tone.Transport.start()
          console.log('✅ Ambient drone started automatically (enabled=true)')
        } else {
          console.log('⚠️ Audio initialized but not playing (enabled=false)')
        }

        setShowPrompt(false)
        console.log('✅ Audio initialization complete - synths ready!')
      } catch (error) {
        console.log('Audio autoplay blocked, waiting for user interaction:', error.message)
        setShowPrompt(true)
      }
    }

    initAudio()

    return () => {
      if (ambientSynthRef.current) {
        ambientSynthRef.current.releaseAll()
        ambientSynthRef.current.dispose()
      }
      if (clickSynthRef.current) {
        clickSynthRef.current.dispose()
      }
      if (reverbRef.current) {
        reverbRef.current.dispose()
      }
    }
  }, [enabled])

  // Handle enable/disable - controls ONLY ambient music
  useEffect(() => {
    const handleToggle = async () => {
      if (!audioStarted) return

      try {
        // Start audio context on first user interaction
        await Tone.start()
        console.log('Audio context started')

        if (enabled) {
          // Check if synths are ready
          if (!ambientSynthRef.current) {
            console.log('Synths not ready yet, waiting...')
            // Wait a bit for initialization
            await new Promise(resolve => setTimeout(resolve, 100))
          }

          if (ambientSynthRef.current) {
            // Reconnect if it was disconnected
            if (!ambientSynthRef.current.output.output) {
              ambientSynthRef.current.connect(reverbRef.current)
            }
            ambientSynthRef.current.triggerAttack(['C2', 'G2', 'C3', 'E3'], Tone.now())
            Tone.Transport.start()
            console.log('✅ Ambient music playing!')
          } else {
            console.error('❌ Ambient synth still not ready')
          }
        } else {
          // When muted, STOP ambient music completely (not just volume)
          if (ambientSynthRef.current) {
            ambientSynthRef.current.releaseAll()
            ambientSynthRef.current.disconnect()
            console.log('🔇 Ambient music stopped completely')
          }
        }
      } catch (error) {
        console.error('Error toggling audio:', error)
      }
    }

    handleToggle()
  }, [enabled, audioStarted])

  // Play sound when star is selected - ALWAYS play clicks regardless of mute state
  useEffect(() => {
    const playSound = async () => {
      if (!selectedLearning || !audioStarted) return

      try {
        // Start audio context on first user interaction
        await Tone.start()

        // Wait for synth if not ready
        if (!clickSynthRef.current) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        if (clickSynthRef.current) {
          // Map position to pitch for spatial audio effect
          const baseNote = 60 // Middle C
          const pitchOffset = Math.floor((selectedLearning.position.x + 10) / 20 * 24)
          const midiNote = baseNote + pitchOffset

          // Play note - clicks play regardless of enabled state
          clickSynthRef.current.triggerAttackRelease(
            Tone.Frequency(midiNote, 'midi'),
            '4n',
            Tone.now(),
            0.5
          )
          console.log('✅ Click sound played, note:', midiNote)
        } else {
          console.error('❌ Click synth not ready')
        }
      } catch (error) {
        console.error('Error playing click sound:', error)
      }
    }

    playSound()
  }, [selectedLearning, audioStarted])

  const handleUserInteraction = async () => {
    try {
      await Tone.start()
      console.log('Audio context started successfully')

      // Initialize synths if not already done
      if (!ambientSynthRef.current) {
        // Create reverb effect
        reverbRef.current = new Tone.Reverb({
          decay: 8,
          wet: 0.6,
          preDelay: 0.01
        }).toDestination()
        await reverbRef.current.generate()

        // Create ambient pad synth
        ambientSynthRef.current = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sine' },
          envelope: {
            attack: 4,
            decay: 2,
            sustain: 0.7,
            release: 8
          },
          volume: -20
        }).connect(reverbRef.current)

        // Create click synth
        clickSynthRef.current = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sine' },
          envelope: {
            attack: 0.01,
            decay: 0.3,
            sustain: 0.1,
            release: 0.5
          },
          volume: -16
        }).connect(reverbRef.current)

        // Start ambient drone
        ambientSynthRef.current.triggerAttack(['C2', 'G2', 'C3', 'E3'], Tone.now())
        console.log('Ambient synth started')
      }

      setAudioStarted(true)
      setShowPrompt(false)
      if (!enabled) {
        onToggle()
      }
    } catch (error) {
      console.error('Failed to start audio:', error)
    }
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
