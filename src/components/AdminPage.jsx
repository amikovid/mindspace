import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'

const ADMIN_PASSWORD = 'basssentence'

export default function AdminPage() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [processing, setProcessing] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      loadSubmissions()
    }
  }, [isAuthenticated])

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setPasswordError(false)
    } else {
      setPasswordError(true)
      setPassword('')
    }
  }

  const loadSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('wisdom_submissions')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSubmissions(data || [])
    } catch (error) {
      console.error('Error loading submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (submission) => {
    setProcessing(submission.id)
    try {
      // Update status to approved
      const { error } = await supabase
        .from('wisdom_submissions')
        .update({ status: 'approved' })
        .eq('id', submission.id)

      if (error) throw error

      // Remove from list
      setSubmissions(prev => prev.filter(s => s.id !== submission.id))
      setSelectedSubmission(null)

      // You can download the approved submission as JSON
      downloadAsJSON(submission)
    } catch (error) {
      console.error('Error approving:', error)
      alert('Failed to approve submission')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (submission) => {
    setProcessing(submission.id)
    try {
      const { error } = await supabase
        .from('wisdom_submissions')
        .update({ status: 'rejected' })
        .eq('id', submission.id)

      if (error) throw error

      setSubmissions(prev => prev.filter(s => s.id !== submission.id))
      setSelectedSubmission(null)
    } catch (error) {
      console.error('Error rejecting:', error)
      alert('Failed to reject submission')
    } finally {
      setProcessing(null)
    }
  }

  const downloadAsJSON = (submission) => {
    const formatted = {
      text: submission.wisdom,
      context: `Shared by ${submission.age}yr old ${submission.occupation}`,
      related: []
    }

    const blob = new Blob([JSON.stringify(formatted, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wisdom-${submission.id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-8 text-white/60 hover:text-white transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Back to constellation</span>
          </Link>

          <div className="glass rounded-3xl p-8 md:p-10">
            <div className="mb-8">
              <h1 className="text-3xl font-light text-white mb-3">Admin Access</h1>
              <p className="text-white/60 text-sm">Enter password to access dashboard</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-light text-white/80 mb-2.5">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3.5 bg-white/5 border rounded-xl text-white placeholder-white/30
                    focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-300
                    ${passwordError ? 'border-red-500/50' : 'border-white/10'}
                  `}
                  placeholder="Enter password"
                  autoFocus
                />
                {passwordError && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm mt-2"
                  >
                    Incorrect password
                  </motion.p>
                )}
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-xl text-white font-light transition-all duration-300 shadow-lg hover:shadow-white/10"
              >
                Access Dashboard
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/60">Loading submissions...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light text-white mb-2">Admin Dashboard</h1>
            <p className="text-white/60">{submissions.length} pending submissions</p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Back to constellation</span>
          </Link>
        </div>

        {submissions.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center">
            <div className="text-5xl mb-4">🌟</div>
            <p className="text-white/60">No pending submissions</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {submissions.map((submission) => (
              <motion.div
                key={submission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6 cursor-pointer hover:bg-white/10 transition-all"
                onClick={() => setSelectedSubmission(submission)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-sm text-white/40">
                    {new Date(submission.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="px-2 py-1 rounded-full bg-white/10 text-white/60">
                      {submission.age}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-white/10 text-white/60">
                      {submission.gender}
                    </span>
                  </div>
                </div>

                <p className="text-white font-light leading-relaxed mb-4 line-clamp-3">
                  {submission.wisdom}
                </p>

                <p className="text-sm text-white/40">
                  {submission.occupation}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedSubmission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50"
            onClick={() => setSelectedSubmission(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass rounded-3xl p-8 max-w-2xl w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedSubmission(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <span className="text-xl text-white">×</span>
              </button>

              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4 text-sm text-white/60">
                  <span>{selectedSubmission.age} years old</span>
                  <span>•</span>
                  <span>{selectedSubmission.gender}</span>
                  <span>•</span>
                  <span>{selectedSubmission.occupation}</span>
                </div>

                <p className="text-xl font-light text-white leading-relaxed mb-4">
                  {selectedSubmission.wisdom}
                </p>

                <p className="text-sm text-white/40">
                  Submitted {new Date(selectedSubmission.created_at).toLocaleString()}
                </p>
              </div>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleApprove(selectedSubmission)}
                  disabled={processing === selectedSubmission.id}
                  className="flex-1 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl text-green-300 font-light transition-all disabled:opacity-50"
                >
                  {processing === selectedSubmission.id ? 'Processing...' : 'Approve & Download'}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleReject(selectedSubmission)}
                  disabled={processing === selectedSubmission.id}
                  className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-300 font-light transition-all disabled:opacity-50"
                >
                  {processing === selectedSubmission.id ? 'Processing...' : 'Reject'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
