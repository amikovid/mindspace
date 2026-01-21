import { motion, AnimatePresence } from 'framer-motion'

export default function DetailPanel({ learning, learnings, onClose, onRelatedClick }) {
  const relatedLearnings = learning.related
    .map(id => learnings.find(l => l.id === id))
    .filter(Boolean)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-0 left-0 right-0
                   md:top-1/2 md:right-8 md:left-auto md:bottom-auto md:-translate-y-1/2
                   w-full md:w-96
                   max-h-[60vh] md:max-h-[80vh]
                   glass rounded-t-3xl md:rounded-3xl p-6 md:p-8
                   text-white overflow-y-auto hide-scrollbar
                   z-50"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center
                     rounded-full bg-white bg-opacity-10 hover:bg-opacity-20
                     transition-smooth"
        >
          <span className="text-xl">×</span>
        </button>

        {/* Learning text */}
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-light leading-relaxed mb-4">
            {learning.text}
          </h2>
          <p className="text-sm text-gray-400">
            {learning.context}
          </p>
        </div>

        {/* Related learnings */}
        {relatedLearnings.length > 0 && (
          <div className="mt-8 pt-6 border-t border-white border-opacity-10">
            <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-4">
              Related Learnings
            </h3>
            <div className="space-y-3">
              {relatedLearnings.map((related) => (
                <motion.button
                  key={related.id}
                  onClick={() => onRelatedClick(related.id)}
                  className="w-full text-left p-4 rounded-xl
                           bg-white bg-opacity-5 hover:bg-opacity-10
                           transition-smooth group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <p className="text-sm md:text-base leading-relaxed group-hover:text-blue-300 transition-colors">
                    {related.text}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {related.context}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
