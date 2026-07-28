const ACHIEVEMENTS = [
  {
    id: 'firstItem',
    name: 'First Item',
    desc: 'Acquire your first Stuff',
    icon: '📦',
    check: () => gameState.totalStuffEarned >= 1,
    reward: 'Click power +1'
  },
  {
    id: 'stuffCollector',
    name: 'Stuff Collector',
    desc: 'Earn 1,000 Stuff total',
    icon: '📥',
    check: () => gameState.totalStuffEarned >= 1000,
    reward: 'All production +5%'
  },
  {
    id: 'fullyFurnished',
    name: 'Fully Furnished',
    desc: 'Own 10 total items',
    icon: '🏠',
    check: () => getTotalItems() >= 10,
    reward: 'All production +5%'
  },
  {
    id: 'homeDepot',
    name: 'Home Depot',
    desc: 'Own 50 total items',
    icon: '🏪',
    check: () => getTotalItems() >= 50,
    reward: 'All production +10%'
  },
  {
    id: 'livingLarge',
    name: 'Living Large',
    desc: 'Reach the Living Room',
    icon: '🛋️',
    check: () => isRoomUnlocked('livingRoom'),
    reward: 'All production +10%'
  },
  {
    id: 'bedroomBliss',
    name: 'Bedroom Bliss',
    desc: 'Reach the Bedroom',
    icon: '🛏️',
    check: () => isRoomUnlocked('bedroom'),
    reward: 'All production +10%'
  },
  {
    id: 'garageGreatness',
    name: 'Garage Greatness',
    desc: 'Reach the Garage',
    icon: '🔧',
    check: () => isRoomUnlocked('garage'),
    reward: 'All production +15%'
  },
  {
    id: 'atticAdventures',
    name: 'Attic Adventures',
    desc: 'Reach the Attic',
    icon: '🏚️',
    check: () => isRoomUnlocked('attic'),
    reward: 'All production +15%'
  },
  {
    id: 'grandfatherClock',
    name: 'Time Keeper',
    desc: 'Own a Grandfather Clock',
    icon: '🕰️',
    check: () => gameState.items.grandfatherClock >= 1,
    reward: 'Click power +10'
  },
  {
    id: 'powerSurge',
    name: 'Power Surge',
    desc: 'Own 10 energy items',
    icon: '⚡',
    check: () => getTotalEnergyItems() >= 10,
    reward: 'Energy production +15%'
  },
  {
    id: 'energyBaron',
    name: 'Energy Baron',
    desc: 'Own 50 energy items',
    icon: '🔋',
    check: () => getTotalEnergyItems() >= 50,
    reward: 'Energy production +25%'
  },
  {
    id: 'firstResearch',
    name: 'First Discovery',
    desc: 'Complete your first research project',
    icon: '🔬',
    check: () => Object.keys(gameState.researchDone).length >= 1,
    reward: 'Research production +10%'
  },
  {
    id: 'researchAddict',
    name: 'Research Addict',
    desc: 'Complete 6 research projects',
    icon: '🧪',
    check: () => Object.keys(gameState.researchDone).length >= 6,
    reward: 'All production +15%'
  },
  {
    id: 'springCleaning',
    name: 'Spring Cleaning',
    desc: 'Declutter for the first time',
    icon: '🧹',
    check: () => gameState.renovationCount >= 1,
    reward: 'Start with +1 RP'
  },
  {
    id: 'serialDeclutterer',
    name: 'Serial Declutterer',
    desc: 'Declutter 5 times',
    icon: '🗑️',
    check: () => gameState.renovationCount >= 5,
    reward: 'Start with +5 RP per run'
  },
  {
    id: 'hoarderNoMore',
    name: 'Hoarder No More',
    desc: 'Declutter 10 times',
    icon: '🏆',
    check: () => gameState.renovationCount >= 10,
    reward: 'All production +25%'
  },
  {
    id: 'millionStuff',
    name: 'One Million Items',
    desc: 'Earn 1,000,000 Stuff total',
    icon: '💎',
    check: () => gameState.totalStuffEarned >= 1e6,
    reward: 'All production +15%'
  },
  {
    id: 'billionStuff',
    name: 'Billionaire Hoarder',
    desc: 'Earn 1,000,000,000 Stuff total',
    icon: '👑',
    check: () => gameState.totalStuffEarned >= 1e9,
    reward: 'All production +20%'
  },
  {
    id: 'cellarLiving',
    name: 'Cellar Living',
    desc: 'Reach the Cellar',
    icon: '🏰',
    check: () => isRoomUnlocked('cellar'),
    reward: 'All production +50%'
  },
  {
    id: 'masterResearcher',
    name: 'Master Researcher',
    desc: 'Complete every research project',
    icon: '🎓',
    check: () => Object.keys(gameState.researchDone).length >= RESEARCH_PROJECTS.length,
    reward: 'All production +100%'
  }
];

function checkAchievements() {
  for (const ach of ACHIEVEMENTS) {
    if (gameState.achievements.includes(ach.id)) continue;
    if (ach.check()) {
      gameState.achievements.push(ach.id);
      dirty = true;
      showNotification(`${ach.icon} Achievement: ${ach.name} — ${ach.reward}`);
    }
  }
}

function getAchievementBonus() {
  let bonus = 1;
  const rewards = {
    stuffCollector: 0.05,
    fullyFurnished: 0.05,
    homeDepot: 0.10,
    livingLarge: 0.10,
    bedroomBliss: 0.10,
    garageGreatness: 0.15,
    atticAdventures: 0.15,
    powerSurge: 0.15,
    energyBaron: 0.25,
    firstResearch: 0.10,
    researchAddict: 0.15,
    hoarderNoMore: 0.25,
    millionStuff: 0.15,
    billionStuff: 0.20,
    cellarLiving: 0.50,
    masterResearcher: 1.00
  };
  for (const [achId, bonusVal] of Object.entries(rewards)) {
    if (gameState.achievements.includes(achId)) {
      bonus += bonusVal;
    }
  }
  return bonus;
}
