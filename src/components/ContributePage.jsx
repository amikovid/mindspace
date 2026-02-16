import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

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
    wisdom: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [focusedField, setFocusedField] = useState(null)

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
            status: 'pending'
          }
        ])

      if (error) throw error

      setSubmitted(true)

      // Reset form after showing success message
      setTimeout(() => {
        setFormData({ age: '', gender: '', occupation: '', wisdom: '' })
        setSubmitted(false)
      }, 4000)
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
                className="text-white/70 text-lg relative z-10"
              >
                Your wisdom has been received and will be reviewed for inclusion in the constellation.
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Link
                to="/"
                className="inline-flex items-center gap-2 mt-8 text-white/60 hover:text-white transition-colors group"
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
