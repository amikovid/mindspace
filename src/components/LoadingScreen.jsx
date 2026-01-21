import { motion } from 'framer-motion'

export default function LoadingScreen() {
  return (
    <div className="w-full h-full bg-black flex items-center justify-center">
      <div className="text-center">
        <motion.div
          className="inline-block"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-16 h-16 rounded-full bg-white opacity-50 blur-xl"></div>
        </motion.div>
        <motion.p
          className="text-white text-sm mt-4 opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.5 }}
        >
          Loading constellation...
        </motion.p>
      </div>
    </div>
  )
}
