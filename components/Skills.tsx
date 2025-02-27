'use client'

import { SKILLS } from '@/constants'
import { motion } from 'framer-motion'

const Skills = () => {
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
            className="size-fit whitespace-nowrap rounded-lg border border-dashed border-white/25 bg-gradient-to-br from-white/15     to-white/5 px-4 py-2 text-base text-white shadow-md backdrop-blur-sm sm:text-lg"
          >
            {skill}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export default Skills
