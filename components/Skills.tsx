'use client'

import { SKILLS } from '@/constants'
import { motion } from 'framer-motion'

export const Skills = () => {
  return (
    <div className="flex w-full overflow-hidden">
      <motion.div
        className="flex gap-4 will-change-transform"
        initial={{ x: '-50%' }}
        animate={{ x: '0%' }}
        transition={{
          repeat: Infinity,
          repeatType: 'loop',
          duration: 30,
          ease: 'linear',
        }}
      >
        {[...SKILLS, ...SKILLS].map((skill, index) => (
          <div
            key={index}
            className="px-4 py-2 text-lg text-white rounded-lg shadow-md size-fit  whitespace-nowrap border border-white/25 border-dashed bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm"
          >
            {skill}
          </div>
        ))}
      </motion.div>
    </div>
  )
}
