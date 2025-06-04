'use client'

import Confetti from 'react-confetti-boom'

const CustomConfetti = () => {
  const COLORS = [
    '#FF6B6B',
    '#FFD93D',
    '#6BCB77',
    '#4D96FF',
    '#843bff',
    '#F38BA0',
    '#FF9F1C',
    '#00CFC1',
    '#B388EB',
    '#FF5D8F',
    '#00A8E8',
    '#FF7F50',
    '#A1EF8B',
    '#FF66C4',
    '#6A00FF',
    '#1CE783',
    '#F28500',
    '#8ECAE6',
    '#F72585',
    '#3A86FF',
  ]

  return (
    <Confetti
      mode="fall"
      fadeOutHeight={1.1}
      particleCount={200}
      shapeSize={14}
      colors={COLORS}
    />
  )
}

export default CustomConfetti
