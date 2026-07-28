const ENERGY_ITEMS = [
  {
    id: 'handCrank',
    name: 'Hand Crank',
    icon: '🔄',
    desc: 'Manual labor — slow but reliable.',
    baseCost: 5,
    costScale: 1.15,
    roomUnlock: 'closet',
    production: 0.1
  },
  {
    id: 'solarPanel',
    name: 'Solar Panel',
    icon: '☀️',
    desc: 'Free energy from the sun.',
    baseCost: 25,
    costScale: 1.15,
    roomUnlock: 'closet',
    production: 0.5
  },
  {
    id: 'windTurbine',
    name: 'Wind Turbine',
    icon: '🌬️',
    desc: 'Harness the breeze.',
    baseCost: 100,
    costScale: 1.15,
    roomUnlock: 'kitchen',
    production: 2
  },
  {
    id: 'waterWheel',
    name: 'Water Wheel',
    icon: '💧',
    desc: 'Flowing water turns to power.',
    baseCost: 500,
    costScale: 1.15,
    roomUnlock: 'kitchen',
    production: 5
  },
  {
    id: 'geothermalPump',
    name: 'Geothermal Pump',
    icon: '🌋',
    desc: 'Taps into the Earth\'s heat.',
    baseCost: 2500,
    costScale: 1.15,
    roomUnlock: 'livingRoom',
    production: 20
  },
  {
    id: 'nuclearBattery',
    name: 'Nuclear Battery',
    icon: '🔋',
    desc: 'Compact but powerful.',
    baseCost: 12500,
    costScale: 1.15,
    roomUnlock: 'livingRoom',
    production: 80
  },
  {
    id: 'fusionCore',
    name: 'Fusion Core',
    icon: '⚛️',
    desc: 'Star power in a box.',
    baseCost: 62500,
    costScale: 1.15,
    roomUnlock: 'bedroom',
    production: 350
  },
  {
    id: 'antimatterCell',
    name: 'Antimatter Cell',
    icon: '💫',
    desc: 'Matter meets antimatter.',
    baseCost: 312500,
    costScale: 1.15,
    roomUnlock: 'bedroom',
    production: 1500
  },
  {
    id: 'dysonSwarm',
    name: 'Dyson Swarm',
    icon: '🌞',
    desc: 'Surround the sun for power.',
    baseCost: 1500000,
    costScale: 1.15,
    roomUnlock: 'garage',
    production: 7000
  },
  {
    id: 'zeroPointModule',
    name: 'Zero-Point Module',
    icon: '🌀',
    desc: 'Energy from the vacuum itself.',
    baseCost: 7500000,
    costScale: 1.15,
    roomUnlock: 'attic',
    production: 35000
  }
];

function getEnergyItemCost(id) {
  const def = ENERGY_ITEMS.find(a => a.id === id);
  if (!def) return Infinity;
  const owned = gameState.energyItems[id] || 0;
  return Math.floor(def.baseCost * Math.pow(def.costScale, owned));
}

function buyEnergyItem(id) {
  const def = ENERGY_ITEMS.find(a => a.id === id);
  if (!def) return false;
  if (!isRoomUnlocked(def.roomUnlock)) return false;

  const cost = getEnergyItemCost(id);
  if (gameState.resources.stuff < cost) return false;

  gameState.resources.stuff -= cost;
  gameState.energyItems[id] = (gameState.energyItems[id] || 0) + 1;
  dirty = true;
  return true;
}

function getTotalEnergyItems() {
  return Object.values(gameState.energyItems).reduce((a, b) => a + b, 0);
}

function activateBoost() {
  const baseCost = gameState.boostCost;
  let cost = gameState.upgrades.boostEfficiency ? Math.floor(baseCost / 2) : baseCost;
  cost = Math.floor(cost * (0.85 ** (gameState.blessings.efficientCrafting || 0)));
  if (gameState.resources.energy < cost) return false;

  gameState.resources.energy -= cost;
  gameState.boostActive = true;
  gameState.boostEndTime = Date.now() + (gameState.upgrades.boostDuration ? 60000 : 30000);
  gameState.boostMultiplier = gameState.upgrades.boostPower ? 3 : 2;
  gameState.boostCost = Math.floor(baseCost * 2);
  dirty = true;
  return true;
}

function getConvertRatio() {
  return gameState.upgrades.convertEfficiency ? 100 : 50;
}

function convertEnergy() {
  const ratio = getConvertRatio();
  const amount = Math.floor(gameState.resources.energy);
  if (amount < 50) return false;

  const converted = Math.floor(amount / 50) * ratio;
  const used = Math.floor(amount / 50) * 50;
  gameState.resources.energy -= used;
  gameState.resources.stuff += converted;
  gameState.totalStuffEarned += converted;
  dirty = true;
  return true;
}

const ENERGY_UPGRADES = [
  {
    id: 'energyEfficiency1',
    name: 'Efficient Circuits',
    desc: 'All energy production ×2',
    icon: '🔌',
    cost: 200,
    roomUnlock: 'closet',
    effect() {}
  },
  {
    id: 'boostUnlock',
    name: 'Boost Activator',
    desc: 'Unlocks the Boost button',
    icon: '🚀',
    cost: 1000,
    roomUnlock: 'kitchen',
    effect() {}
  },
  {
    id: 'convertUnlock',
    name: 'Energy Converter',
    desc: 'Unlocks the Convert button (1⚡ → 50📦)',
    icon: '🔄',
    cost: 500,
    roomUnlock: 'kitchen',
    effect() {}
  },
  {
    id: 'energyEfficiency2',
    name: 'Smart Grid',
    desc: 'All energy production ×2',
    icon: '⚡',
    cost: 5000,
    roomUnlock: 'kitchen',
    effect() {}
  },
  {
    id: 'boostDuration',
    name: 'Extended Boost',
    desc: 'Boost lasts 60s (was 30s)',
    icon: '⏱️',
    cost: 10000,
    roomUnlock: 'livingRoom',
    effect() {}
  },
  {
    id: 'energyEfficiency3',
    name: 'Quantum Wiring',
    desc: 'All energy production ×2',
    icon: '🌐',
    cost: 100000,
    roomUnlock: 'livingRoom',
    effect() {}
  },
  {
    id: 'boostPower',
    name: 'Overclock Boost',
    desc: 'Boost becomes 3× (was 2×)',
    icon: '💥',
    cost: 100000,
    roomUnlock: 'bedroom',
    effect() {}
  },
  {
    id: 'convertEfficiency',
    name: 'Efficient Conversion',
    desc: 'Convert ratio improves (1⚡ → 100📦)',
    icon: '💰',
    cost: 100000,
    roomUnlock: 'garage',
    effect() {}
  },
  {
    id: 'boostEfficiency',
    name: 'Conservation',
    desc: 'Boost energy cost -50%',
    icon: '♻️',
    cost: 500000,
    roomUnlock: 'garage',
    effect() {}
  },
  {
    id: 'autoConvert',
    name: 'Auto-Converter',
    desc: 'Auto-converts 500⚡ → Stuff every 10s',
    icon: '🤖',
    cost: 5000000,
    roomUnlock: 'attic',
    effect() {}
  }
];

function toggleAutoConvert() {
  gameState.autoConvertEnabled = !gameState.autoConvertEnabled;
  const amountInput = document.getElementById('auto-convert-amount');
  const intervalInput = document.getElementById('auto-convert-interval');
  if (amountInput) amountInput.disabled = !gameState.autoConvertEnabled;
  if (intervalInput) intervalInput.disabled = !gameState.autoConvertEnabled;
  dirty = true;
}

function buyEnergyUpgrade(id) {
  if (gameState.upgrades[id]) return false;
  const def = ENERGY_UPGRADES.find(u => u.id === id);
  if (!def) return false;
  if (!isRoomUnlocked(def.roomUnlock)) return false;
  if (gameState.resources.energy < def.cost) return false;

  gameState.resources.energy -= def.cost;
  gameState.upgrades[id] = true;
  if (id === 'autoConvert') {
    gameState.autoConvertEnabled = true;
  }
  if (def.effect) def.effect();
  dirty = true;
  return true;
}
