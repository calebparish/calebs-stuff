const BLESSINGS = [
  {
    id: 'divineOrder',
    name: 'Divine Order',
    desc: 'All production ×1.1 per rank',
    effect: { type: 'allProd', mult: 1.1 }
  },
  {
    id: 'overflowingCupboards',
    name: 'Overflowing Cupboards',
    desc: 'Stuff production ×1.5 per rank',
    effect: { type: 'stuffProd', mult: 1.5 }
  },
  {
    id: 'sacredKnowledge',
    name: 'Sacred Knowledge',
    desc: 'Research production ×2 per rank',
    effect: { type: 'researchProd', mult: 2 }
  },
  {
    id: 'perpetualMotion',
    name: 'Perpetual Motion',
    desc: 'Energy production ×1.5 per rank',
    effect: { type: 'energyProd', mult: 1.5 }
  },
  {
    id: 'steadyHands',
    name: 'Steady Hands',
    desc: 'Click power +100% per rank',
    effect: { type: 'clickPower', add: 1 }
  },
  {
    id: 'frugalSpirit',
    name: 'Frugal Spirit',
    desc: 'Item costs ×0.9 per rank',
    effect: { type: 'itemCost', mult: 0.9 }
  },
  {
    id: 'generousHarvest',
    name: 'Generous Harvest',
    desc: 'All production ×1.25 per rank',
    effect: { type: 'allProd', mult: 1.25 }
  },
  {
    id: 'efficientCrafting',
    name: 'Efficient Crafting',
    desc: 'Boost costs ×0.85 per rank',
    effect: { type: 'boostCost', mult: 0.85 }
  },
  {
    id: 'ancientWisdom',
    name: 'Ancient Wisdom',
    desc: '+1 base RP/s per rank',
    effect: { type: 'baseRP', add: 1 }
  },
  {
    id: 'goldenTouch',
    name: 'Golden Touch',
    desc: 'Clicks give ×1.25 more Stuff per rank',
    effect: { type: 'clickStuff', mult: 1.25 }
  },
  {
    id: 'harmonicBalance',
    name: 'Harmonic Balance',
    desc: 'All production ×1.15 per rank',
    effect: { type: 'allProd', mult: 1.15 }
  },
  {
    id: 'divineSpeed',
    name: 'Divine Speed',
    desc: 'Upgrade costs ×0.8 per rank',
    effect: { type: 'upgradeCost', mult: 0.8 }
  },
  {
    id: 'blessedTools',
    name: 'Blessed Tools',
    desc: 'All production ×1.5 per rank',
    effect: { type: 'allProd', mult: 1.5 }
  },
  {
    id: 'eternalFlame',
    name: 'Eternal Flame',
    desc: 'Energy production ×2 per rank',
    effect: { type: 'energyProd', mult: 2 }
  }
];

function getTitheCost() {
  const n = gameState.renovationCount;
  const factor = Math.pow(2, n);
  return {
    stuff: Math.floor(1000000 * factor),
    energy: Math.floor(500000 * factor),
    rp: Math.floor(50000 * factor)
  };
}

function canAffordTithe() {
  const cost = getTitheCost();
  return gameState.resources.stuff >= cost.stuff &&
         gameState.resources.energy >= cost.energy &&
         gameState.resources.researchPoints >= cost.rp;
}

function prayAtAltar() {
  if (!canAffordTithe()) {
    showNotification('You cannot afford the tithe to Hygieia');
    return false;
  }

  const cost = getTitheCost();
  gameState.resources.stuff -= cost.stuff;
  gameState.resources.energy -= cost.energy;
  gameState.resources.researchPoints -= cost.rp;
  gameState.renovationCount += 1;

  let clickPower = 1;
  let startStuff = 0;
  let startEnergy = 0;

  if (gameState.blessings.steadyHands) {
    clickPower *= (1 + gameState.blessings.steadyHands);
  }

  gameState.clickPower = clickPower;
  gameState.resources.stuff = startStuff;
  gameState.resources.energy = startEnergy;
  gameState.resources.researchPoints = 0;
  for (const key of Object.keys(gameState.items)) {
    gameState.items[key] = 0;
  }
  for (const key of Object.keys(gameState.energyItems)) {
    gameState.energyItems[key] = 0;
  }
  for (const key of Object.keys(gameState.researchBuildings)) {
    gameState.researchBuildings[key] = 0;
  }
  gameState.upgrades = {};
  gameState.researchDone = {};
  gameState.currentRoom = 'closet';
  gameState.boostActive = false;
  gameState.boostEndTime = 0;
  gameState.boostMultiplier = 1;
  gameState.boostCost = 200;
  gameState.lastAutoConvert = 0;
  gameState.lastTick = Date.now();

  const pool = [...BLESSINGS];
  const choices = [];
  for (let i = 0; i < 3 && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    choices.push(pool[idx].id);
    pool.splice(idx, 1);
  }
  gameState.currentBlessingChoices = choices;

  showNotification('🙏 Hygieia has accepted your offering — choose a blessing');
  dirty = true;
  return true;
}

function claimBlessing(id) {
  if (!gameState.currentBlessingChoices.includes(id)) return false;
  if (!gameState.blessings[id]) {
    gameState.blessings[id] = 0;
  }
  gameState.blessings[id] += 1;
  gameState.currentBlessingChoices = [];
  dirty = true;
  return true;
}

function getBlessingRank(id) {
  return gameState.blessings[id] || 0;
}

function getBlessingMultiplier(blessingId) {
  const b = BLESSINGS.find(x => x.id === blessingId);
  if (!b) return 1;
  const rank = getBlessingRank(blessingId);
  if (rank === 0) return 1;
  if (b.effect.type === 'mult') return Math.pow(b.effect.mult, rank);
  return 1;
}
