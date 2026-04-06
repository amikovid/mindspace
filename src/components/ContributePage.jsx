import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const PROMPTS = [
  "What do you wish you'd known at 20?",
  "What changed your mind about something important?",
  "What would you tell a stranger on a bad day?",
  "What's the most useful thing someone ever said to you?",
  "What have you stopped believing that you used to?",
  "What does living well mean to you?",
  "What do you know now that took years to learn?",
]

const SITE_URL = 'https://mindspace-nine.vercel.app'

// Floating particles background component
function FloatingParticles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 20,
    delay: Math.random() * 5
  }))

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

export default function ContributePage() {
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    occupation: '',
    wisdom: '',
    // optional extra context
    country: '',
    life_stage: '',
    wisdom_source: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [showExtraContext, setShowExtraContext] = useState(false)
  const [submittedWisdom, setSubmittedWisdom] = useState('')

  // Pick today's prompt (rotates daily) + allow cycling
  const todayIndex = Math.floor(Date.now() / 86400000) % PROMPTS.length
  const [promptIndex, setPromptIndex] = useState(todayIndex)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Import supabase dynamically to avoid issues
      const { supabase } = await import('../lib/supabase')

      const { data, error } = await supabase
        .from('wisdom_submissions')
        .insert([
          {
            age: parseInt(formData.age),
            gender: formData.gender,
            occupation: formData.occupation,
            wisdom: formData.wisdom,
            status: 'pending',
            country: formData.country || null,
            life_stage: formData.life_stage || null,
            wisdom_source: formData.wisdom_source || null
          }
        ])

      if (error) throw error

      setSubmittedWisdom(formData.wisdom)
      setSubmitted(true)

      // Reset form after showing success message
      setTimeout(() => {
        setFormData({ age: '', gender: '', occupation: '', wisdom: '', country: '', life_stage: '', wisdom_source: '' })
        setSubmitted(false)
        setSubmittedWisdom('')
      }, 10000)
    } catch (error) {
      console.error('Error submitting:', error)
      alert('Failed to submit. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = formData.age && formData.gender && formData.occupation && formData.wisdom.length >= 10

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      <FloatingParticles />

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="max-w-md w-full text-center relative z-10"
          >
            <motion.div
              className="glass rounded-3xl p-12 relative overflow-hidden"
              initial={{ backdropFilter: "blur(0px)" }}
              animate={{ backdropFilter: "blur(20px)" }}
            >
              {/* Success glow effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
              />

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="text-7xl mb-6 relative z-10"
              >
                ✨
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-light text-white mb-3 relative z-10"
              >
                Thank you!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-white/70 text-base relative z-10"
              >
                Your wisdom has been shared with Kovid. If accepted, it will be added to the constellation.
              </motion.p>

              {/* Social share */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="mt-8 relative z-10"
              >
                <p className="text-white/35 text-xs font-light mb-3 tracking-wide uppercase">
                  Send it to someone whose wisdom you'd want here
                </p>
                <div className="flex gap-3 justify-center">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`I just added my wisdom to Mindspace — a living constellation of human insight.\n\n"${submittedWisdom}"\n\nWhat's yours? → ${SITE_URL}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-white/60 hover:text-white text-xs font-light transition-all duration-300 hover:bg-white/10"
                    style={{ border: '1px solid rgba(255,255,255,0.12)' }}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`"${submittedWisdom}"\n\nJust added this to Mindspace — a living constellation of human wisdom. What's yours? → ${SITE_URL}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-white/60 hover:text-white text-xs font-light transition-all duration-300 hover:bg-white/10"
                    style={{ border: '1px solid rgba(255,255,255,0.12)' }}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.754l7.509-8.137L1.256 2.25H8.08l4.13 5.461zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    Post on X
                  </a>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <Link
                to="/"
                className="inline-flex items-center gap-2 mt-6 text-white/40 hover:text-white/70 transition-colors group text-sm"
              >
                <span className="group-hover:-translate-x-1 transition-transform">←</span>
                <span>Back to constellation</span>
              </Link>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="max-w-md w-full relative z-10"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Link
                to="/"
                className="inline-flex items-center gap-2 mb-8 text-white/60 hover:text-white transition-colors group"
              >
                <span className="group-hover:-translate-x-1 transition-transform">←</span>
                <span>Back to constellation</span>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-3xl p-8 md:p-10 relative overflow-hidden"
            >
              {/* Ambient glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />

              <div className="relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-8"
                >
                  <h1 className="text-3xl md:text-4xl font-light text-white mb-3">
                    Share Your Wisdom
                  </h1>
                  <p className="text-white/60 text-sm md:text-base">
                    Contribute to the constellation of collective knowledge
                  </p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Age Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label htmlFor="age" className="block text-sm font-light text-white/80 mb-2.5">
                      Age
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="age"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('age')}
                        onBlur={() => setFocusedField(null)}
                        min="1"
                        max="120"
                        required
                        className={`w-full px-4 py-3.5 bg-white/5 border rounded-xl text-white placeholder-white/30
                          focus:outline-none transition-all duration-300
                          ${focusedField === 'age' ? 'border-white/40 bg-white/10 shadow-lg shadow-white/5' : 'border-white/10'}
                        `}
                        placeholder="25"
                      />
                    </div>
                  </motion.div>

                  {/* Gender Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 }}
                  >
                    <label htmlFor="gender" className="block text-sm font-light text-white/80 mb-2.5">
                      Gender
                    </label>
                    <div className="relative">
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('gender')}
                        onBlur={() => setFocusedField(null)}
                        required
                        className={`w-full px-4 py-3.5 bg-white/5 border rounded-xl text-white
                          focus:outline-none transition-all duration-300 appearance-none cursor-pointer
                          ${focusedField === 'gender' ? 'border-white/40 bg-white/10 shadow-lg shadow-white/5' : 'border-white/10'}
                          ${!formData.gender ? 'text-white/30' : 'text-white'}
                        `}
                      >
                        <option value="" disabled>Select gender</option>
                        <option value="M" className="bg-black">Male</option>
                        <option value="F" className="bg-black">Female</option>
                        <option value="NB" className="bg-black">Non-binary</option>
                        <option value="O" className="bg-black">Other</option>
                        <option value="PNS" className="bg-black">Prefer not to say</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>

                  {/* Occupation Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label htmlFor="occupation" className="block text-sm font-light text-white/80 mb-2.5">
                      Occupation
                    </label>
                    <input
                      type="text"
                      id="occupation"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('occupation')}
                      onBlur={() => setFocusedField(null)}
                      maxLength="50"
                      required
                      className={`w-full px-4 py-3.5 bg-white/5 border rounded-xl text-white placeholder-white/30
                        focus:outline-none transition-all duration-300
                        ${focusedField === 'occupation' ? 'border-white/40 bg-white/10 shadow-lg shadow-white/5' : 'border-white/10'}
                      `}
                      placeholder="Engineer, Artist, Student..."
                    />
                  </motion.div>

                  {/* Wisdom Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 }}
                  >
                    <label htmlFor="wisdom" className="block text-sm font-light text-white/80 mb-2.5">
                      Your Wisdom
                      <span className={`ml-2 transition-colors ${
                        formData.wisdom.length > 180 ? 'text-yellow-400/70' : 'text-white/30'
                      }`}>
                        ({formData.wisdom.length}/200)
                      </span>
                    </label>

                    {/* Rotating prompt suggestions */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white/25 text-xs font-light">try:</span>
                        <AnimatePresence mode="wait">
                          <motion.button
                            key={promptIndex}
                            type="button"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.25 }}
                            onClick={() => setFormData(prev => ({ ...prev, wisdom: PROMPTS[promptIndex] }))}
                            className="text-white/35 hover:text-white/70 text-xs font-light italic transition-colors text-left"
                          >
                            "{PROMPTS[promptIndex]}"
                          </motion.button>
                        </AnimatePresence>
                        <button
                          type="button"
                          onClick={() => setPromptIndex(i => (i + 1) % PROMPTS.length)}
                          className="text-white/20 hover:text-white/50 text-xs transition-colors ml-1 flex-shrink-0"
                          title="Next prompt"
                        >
                          ↻
                        </button>
                      </div>
                    </div>

                    <textarea
                      id="wisdom"
                      name="wisdom"
                      value={formData.wisdom}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('wisdom')}
                      onBlur={() => setFocusedField(null)}
                      maxLength="200"
                      required
                      rows="5"
                      className={`w-full px-4 py-3.5 bg-white/5 border rounded-xl text-white placeholder-white/30
                        focus:outline-none transition-all duration-300 resize-none
                        ${focusedField === 'wisdom' ? 'border-white/40 bg-white/10 shadow-lg shadow-white/5' : 'border-white/10'}
                      `}
                      placeholder="Share a lesson, insight, or piece of advice that has shaped your perspective..."
                    />
                  </motion.div>

                  {/* Optional extra context */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.575 }}
                  >
                    <button
                      type="button"
                      onClick={() => setShowExtraContext(v => !v)}
                      className="flex items-center gap-2 text-xs text-white/35 hover:text-white/60 transition-colors font-light py-1"
                    >
                      <motion.span
                        animate={{ rotate: showExtraContext ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="inline-block"
                      >
                        ›
                      </motion.span>
                      {showExtraContext ? 'Hide extra context' : 'Add more context (optional)'}
                    </button>

                    <AnimatePresence>
                      {showExtraContext && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 space-y-4">
                            <p className="text-white/30 text-xs font-light leading-relaxed">
                              Helps paint a richer picture. None of this is required.
                            </p>

                            {/* Country */}
                            <div>
                              <label htmlFor="country" className="block text-sm font-light text-white/80 mb-2.5">
                                Country
                              </label>
                              <input
                                type="text"
                                id="country"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                onFocus={() => setFocusedField('country')}
                                onBlur={() => setFocusedField(null)}
                                maxLength="50"
                                className={`w-full px-4 py-3.5 bg-white/5 border rounded-xl text-white placeholder-white/30
                                  focus:outline-none transition-all duration-300
                                  ${focusedField === 'country' ? 'border-white/40 bg-white/10 shadow-lg shadow-white/5' : 'border-white/10'}
                                `}
                                placeholder="India, Nigeria, Brazil..."
                              />
                            </div>

                            {/* Life Stage */}
                            <div>
                              <label htmlFor="life_stage" className="block text-sm font-light text-white/80 mb-2.5">
                                Life Stage
                              </label>
                              <div className="relative">
                                <select
                                  id="life_stage"
                                  name="life_stage"
                                  value={formData.life_stage}
                                  onChange={handleChange}
                                  onFocus={() => setFocusedField('life_stage')}
                                  onBlur={() => setFocusedField(null)}
                                  className={`w-full px-4 py-3.5 bg-white/5 border rounded-xl text-white
                                    focus:outline-none transition-all duration-300 appearance-none cursor-pointer
                                    ${focusedField === 'life_stage' ? 'border-white/40 bg-white/10 shadow-lg shadow-white/5' : 'border-white/10'}
                                    ${!formData.life_stage ? 'text-white/30' : 'text-white'}
                                  `}
                                >
                                  <option value="" className="bg-black">Select stage</option>
                                  <option value="Student" className="bg-black">Student</option>
                                  <option value="Early career" className="bg-black">Early career (20s)</option>
                                  <option value="Mid-career" className="bg-black">Mid-career (30s–40s)</option>
                                  <option value="Senior" className="bg-black">Senior (50s–60s)</option>
                                  <option value="Retired" className="bg-black">Retired</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                  <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>
                            </div>

                            {/* Wisdom Source */}
                            <div>
                              <label htmlFor="wisdom_source" className="block text-sm font-light text-white/80 mb-2.5">
                                How did you learn this?
                              </label>
                              <div className="relative">
                                <select
                                  id="wisdom_source"
                                  name="wisdom_source"
                                  value={formData.wisdom_source}
                                  onChange={handleChange}
                                  onFocus={() => setFocusedField('wisdom_source')}
                                  onBlur={() => setFocusedField(null)}
                                  className={`w-full px-4 py-3.5 bg-white/5 border rounded-xl text-white
                                    focus:outline-none transition-all duration-300 appearance-none cursor-pointer
                                    ${focusedField === 'wisdom_source' ? 'border-white/40 bg-white/10 shadow-lg shadow-white/5' : 'border-white/10'}
                                    ${!formData.wisdom_source ? 'text-white/30' : 'text-white'}
                                  `}
                                >
                                  <option value="" className="bg-black">Select one</option>
                                  <option value="Lived experience" className="bg-black">Lived it myself</option>
                                  <option value="Someone taught me" className="bg-black">Someone taught me</option>
                                  <option value="Read it somewhere" className="bg-black">Read it somewhere</option>
                                  <option value="Figured it out the hard way" className="bg-black">Figured it out the hard way</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                  <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <motion.button
                      type="submit"
                      disabled={!isFormValid || isSubmitting}
                      whileHover={isFormValid && !isSubmitting ? { scale: 1.02 } : {}}
                      whileTap={isFormValid && !isSubmitting ? { scale: 0.98 } : {}}
                      className={`w-full py-4 rounded-xl font-light transition-all duration-300 relative overflow-hidden
                        ${isFormValid && !isSubmitting
                          ? 'bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white shadow-lg hover:shadow-white/10'
                          : 'bg-white/5 border border-white/10 text-white/40 cursor-not-allowed'
                        }
                      `}
                    >
                      {isSubmitting && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                      )}
                      <span className="relative z-10">
                        {isSubmitting ? 'Submitting...' : 'Submit Wisdom'}
                      </span>
                    </motion.button>
                  </motion.div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
