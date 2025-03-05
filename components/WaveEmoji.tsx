'use client'

import { motion } from 'framer-motion'

const WaveEmoji = () => {
  return (
    <motion.span
      className="inline-block cursor-help text-2xl"
      initial={{ rotate: 0 }}
      whileHover={{ rotate: 15, scale: 1.2 }}
      transition={{ type: 'spring', stiffness: 300 }}
      exit={{ rotate: 0 }}
      animate={{ rotate: 0 }}
    >
      👋🏼
    </motion.span>
  )
}

export default WaveEmoji
