const RESEARCH_BUILDINGS = [
  {
    id: 'beaker',
    name: 'Beaker',
    icon: '🧪',
    desc: 'Basic lab glassware for experiments.',
    stuffCost: 500,
    energyCost: 0,
    energyDrain: 0.01,
    costScale: 1.15,
    roomUnlock: 'livingRoom',
    production: 0.1
  },
  {
    id: 'microscope',
    name: 'Microscope',
    icon: '🔬',
    desc: 'See the tiny building blocks of Stuff.',
    stuffCost: 2000,
    energyCost: 0,
    energyDrain: 0.1,
    costScale: 1.15,
    roomUnlock: 'livingRoom',
    production: 0.5
  },
  {
    id: 'petriDish',
    name: 'Petri Dish',
    icon: '🧫',
    desc: 'Culture growth — including research.',
    stuffCost: 10000,
    energyCost: 0,
    energyDrain: 1,
    costScale: 1.15,
    roomUnlock: 'bedroom',
    production: 2
  },
  {
    id: 'bunsenBurner',
    name: 'Bunsen Burner',
    icon: '🔥',
    desc: 'Heat things up in the lab.',
    stuffCost: 50000,
    energyCost: 500,
    energyDrain: 5,
    costScale: 1.15,
    roomUnlock: 'bedroom',
    production: 5
  },
  {
    id: 'centrifuge',
    name: 'Centrifuge',
    icon: '⚙️',
    desc: 'Spin to separate knowledge.',
    stuffCost: 250000,
    energyCost: 2000,
    energyDrain: 25,
    costScale: 1.15,
    roomUnlock: 'garage',
    production: 20
  },
  {
    id: 'telescope',
    name: 'Telescope',
    icon: '🔭',
    desc: 'Look to the stars for answers.',
    stuffCost: 1000000,
    energyCost: 10000,
    energyDrain: 150,
    costScale: 1.15,
    roomUnlock: 'garage',
    production: 80
  },
  {
    id: 'particleAccelerator',
    name: 'Particle Accelerator',
    icon: '⚛️',
    desc: 'Smash particles, gain knowledge.',
    stuffCost: 5000000,
    energyCost: 50000,
    energyDrain: 1000,
    costScale: 1.15,
    roomUnlock: 'attic',
    production: 350
  },
  {
    id: 'quantumComputer',
    name: 'Quantum Computer',
    icon: '💻',
    desc: 'Compute in parallel dimensions.',
    stuffCost: 25000000,
    energyCost: 250000,
    energyDrain: 8000,
    costScale: 1.15,
    roomUnlock: 'cellar',
    production: 1500
  },
  {
    id: 'dnaSequencer',
    name: 'DNA Sequencer',
    icon: '🧬',
    desc: 'Decode the blueprint of Stuff itself.',
    stuffCost: 125000000,
    energyCost: 1000000,
    energyDrain: 40000,
    costScale: 1.15,
    roomUnlock: 'cellar',
    production: 5000
  },
  {
    id: 'aiLab',
    name: 'AI Lab',
    icon: '🤖',
    desc: 'Artificial intelligence for artificial research.',
    stuffCost: 500000000,
    energyCost: 5000000,
    energyDrain: 200000,
    costScale: 1.15,
    roomUnlock: 'cellar',
    production: 20000
  },
  {
    id: 'dimensionalArray',
    name: 'Dimensional Array',
    icon: '🌀',
    desc: 'Peer into parallel dimensions for answers.',
    stuffCost: 2500000000,
    energyCost: 25000000,
    energyDrain: 1000000,
    costScale: 1.15,
    roomUnlock: 'cellar',
    production: 100000
  }
];

function getResearchBuildingCost(id, type) {
  const def = RESEARCH_BUILDINGS.find(a => a.id === id);
  if (!def) return Infinity;
  const owned = gameState.researchBuildings[id] || 0;
  const scale = Math.pow(def.costScale, owned);
  if (type === 'energy') return Math.floor(def.energyCost * scale);
  return Math.floor(def.stuffCost * scale);
}

function buyResearchBuilding(id) {
  const def = RESEARCH_BUILDINGS.find(a => a.id === id);
  if (!def) return false;
  if (!isRoomUnlocked(def.roomUnlock)) return false;

  const stuffCost = getResearchBuildingCost(id, 'stuff');
  const energyCost = getResearchBuildingCost(id, 'energy');
  if (gameState.resources.stuff < stuffCost) return false;
  if (gameState.resources.energy < energyCost) return false;

  gameState.resources.stuff -= stuffCost;
  gameState.resources.energy -= energyCost;
  gameState.researchBuildings[id] = (gameState.researchBuildings[id] || 0) + 1;
  dirty = true;
  return true;
}

function getEnergyDrain(id) {
  const def = RESEARCH_BUILDINGS.find(a => a.id === id);
  if (!def) return 0;
  return def.energyDrain || 0;
}

function getTotalResearchBuildings() {
  return Object.values(gameState.researchBuildings).reduce((a, b) => a + b, 0);
}

const RESEARCH_PROJECTS = [
  {
    id: 'betterPipettes',
    name: 'Better Pipettes',
    icon: '🧪',
    desc: 'Click power +5',
    cost: 50,
    effect() { gameState.clickPower += 5; },
    applied: false
  },
  {
    id: 'efficientStorage',
    name: 'Efficient Storage',
    icon: '📦',
    desc: 'All Stuff production +10%',
    cost: 200,
    effect() {},
    applied: false
  },
  {
    id: 'ergonomicSetup',
    name: 'Ergonomic Setup',
    icon: '🪑',
    desc: 'Click power +15',
    cost: 500,
    effect() { gameState.clickPower += 15; },
    applied: false
  },
  {
    id: 'labAutomation',
    name: 'Lab Automation',
    icon: '🤖',
    desc: 'Research building production +25%',
    cost: 1000,
    effect() {},
    applied: false
  },
  {
    id: 'materialScience',
    name: 'Material Science',
    icon: '🔩',
    desc: 'Item costs -10%',
    cost: 2500,
    effect() {},
    applied: false
  },
  {
    id: 'energyResearch',
    name: 'Energy Research',
    icon: '⚡',
    desc: 'Energy production +50%',
    cost: 5000,
    effect() {},
    applied: false
  },
  {
    id: 'advancedAlgorithms',
    name: 'Advanced Algorithms',
    icon: '📊',
    desc: 'All production +20%',
    cost: 10000,
    effect() {},
    applied: false
  },
  {
    id: 'quantumTunneling',
    name: 'Quantum Tunneling',
    icon: '🌀',
    desc: 'All production +30%',
    cost: 25000,
    effect() {},
    applied: false
  },
  {
    id: 'nanotechnology',
    name: 'Nanotechnology',
    icon: '⚛️',
    desc: 'All production +50%',
    cost: 50000,
    effect() {},
    applied: false
  },
  {
    id: 'dimensionalRift',
    name: 'Dimensional Rift',
    icon: '🌌',
    desc: 'Click power ×10',
    cost: 100000,
    effect() { gameState.clickPower *= 10; },
    applied: false
  },
  {
    id: 'singularity',
    name: 'Singularity',
    icon: '🕳️',
    desc: 'All production +100%',
    cost: 250000,
    effect() {},
    applied: false
  },
  {
    id: 'transcendence',
    name: 'Transcendence',
    icon: '✨',
    desc: 'All production +50%',
    cost: 500000,
    effect() {},
    applied: false
  },
  {
    id: 'advancedMaterialScience',
    name: 'Advanced Materials',
    icon: '🔩',
    desc: 'Item costs -20% (stacks with Material Science)',
    cost: 1000000,
    effect() {},
    applied: false
  },
  {
    id: 'fusionResearch',
    name: 'Fusion Research',
    icon: '☀️',
    desc: 'Energy production +100%',
    cost: 2000000,
    effect() {},
    applied: false
  },
  {
    id: 'cybernetics',
    name: 'Cybernetics',
    icon: '🦾',
    desc: 'Click power +100',
    cost: 5000000,
    effect() { gameState.clickPower += 100; },
    applied: false
  },
  {
    id: 'temporalAcceleration',
    name: 'Temporal Acceleration',
    icon: '⏳',
    desc: 'All production +200%',
    cost: 10000000,
    effect() {},
    applied: false
  },
  {
    id: 'dimensionalEngineering',
    name: 'Dimensional Engineering',
    icon: '🌐',
    desc: 'Research production +300%',
    cost: 25000000,
    effect() {},
    applied: false
  },
  {
    id: 'cosmicUnderstanding',
    name: 'Cosmic Understanding',
    icon: '🌠',
    desc: 'All production +100%',
    cost: 50000000,
    effect() {},
    applied: false
  }
];

function buyResearchProject(id) {
  if (gameState.researchDone[id]) return false;
  const def = RESEARCH_PROJECTS.find(p => p.id === id);
  if (!def) return false;
  if (gameState.resources.researchPoints < def.cost) return false;

  gameState.resources.researchPoints -= def.cost;
  gameState.researchDone[id] = true;
  if (def.effect && !def.applied) {
    def.effect();
    def.applied = true;
  }
  dirty = true;
  return true;
}
