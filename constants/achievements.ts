export const allAchievements = [
  {
    id: 'first-visit',
    title: 'Who Are You?',
    description: 'You visited my portfolio for the first time!'
  },
  {
    id: 'return-visitor',
    title: 'Return Visitor',
    description: 'You came back on another day. Thank you!'
  },
  {
    id: 'say-hey',
    title: 'Said Hey!',
    description: 'You greeted me with a "Hey!".'
  },
  {
    id: 'night-owl',
    title: 'Night Owl',
    description: 'You visited my portfolio between 12AM - 5AM.'
  },
  {
    id: 'hidden-path',
    title: 'Off the Beaten Path',
    description: 'You found a secret spot in my portfolio.'
  },
  {
    id: 'mui-skill',
    title: 'Where is MUI?',
    description: 'You found the MUI skill!'
  },
  {
    id: 'pet-cat',
    title: 'Cat Cuddler',
    description: 'You petted the cat. A true animal lover!'
  },
  {
    id: 'inspector-of-gadgets',
    title: 'Inspector of Gadgets',
    description: 'Visited the Tools page. Sleuth approved.'
  },
  {
    id: 'pick-nose',
    title: 'The Forbidden Touch',
    description: 'You dared to poke my nose. A bold move, indeed!'
  },
  {
    id: 'clipboard-master',
    title: 'Copycat',
    description: 'You copied some text from my portfolio.'
  },
  {
    id: 'patience-is-key',
    title: 'Patience is Key',
    description: 'You waited for 30sec without any interaction.'
  },
  {
    id: 'prodigal-tab',
    title: 'The Prodigal Tab',
    description: 'You switched away from this tab... then came back.'
  },
  {
    id: 'gambling',
    title: 'Gambling Enthusiast',
    description: 'You hovered over Gambling Bot. Feeling lucky?'
  },
  {
    id: '404-hunter',
    title: 'Lost and Found',
    description: 'You visited a non-existent page. Oops!'
  }
] as const

/** Local calendar date (YYYY-MM-DD) when the site first recorded this browser. */
export const FIRST_VISIT_DAY_STORAGE_KEY = 'portfolioFirstVisitDay'
