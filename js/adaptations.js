const ITEMS = [
  {
    id: 'paperclip',
    name: 'Paperclip',
    icon: '📎',
    desc: 'A humble paperclip. Slowly accumulates.',
    baseCost: 10,
    costScale: 1.15,
    roomUnlock: 'closet',
    production: 0.1
  },
  {
    id: 'coffeeMug',
    name: 'Coffee Mug',
    icon: '☕',
    desc: 'Collection keeps growing somehow.',
    baseCost: 50,
    costScale: 1.15,
    roomUnlock: 'closet',
    production: 0.5
  },
  {
    id: 'throwPillow',
    name: 'Throw Pillow',
    icon: '🛋️',
    desc: 'Comfortable clutter. Decorative too!',
    baseCost: 200,
    costScale: 1.15,
    roomUnlock: 'kitchen',
    production: 2
  },
  {
    id: 'houseplant',
    name: 'Houseplant',
    icon: '🌱',
    desc: 'Adds life to the room (and dust).',
    baseCost: 1000,
    costScale: 1.15,
    roomUnlock: 'kitchen',
    production: 5
  },
  {
    id: 'floorLamp',
    name: 'Floor Lamp',
    icon: '💡',
    desc: 'Sheds light on your growing collection.',
    baseCost: 5000,
    costScale: 1.15,
    roomUnlock: 'livingRoom',
    production: 20
  },
  {
    id: 'areaRug',
    name: 'Area Rug',
    icon: '🧶',
    desc: 'Really ties the room together.',
    baseCost: 25000,
    costScale: 1.15,
    roomUnlock: 'livingRoom',
    production: 80
  },
  {
    id: 'bookshelf',
    name: 'Bookshelf',
    icon: '📚',
    desc: 'Store all those books you will read someday.',
    baseCost: 100000,
    costScale: 1.15,
    roomUnlock: 'bedroom',
    production: 350
  },
  {
    id: 'armchair',
    name: 'Armchair',
    icon: '🪑',
    desc: 'A cozy spot to admire your stuff.',
    baseCost: 500000,
    costScale: 1.15,
    roomUnlock: 'bathroom',
    production: 1500
  },
  {
    id: 'diningTable',
    name: 'Dining Table',
    icon: '🍽️',
    desc: 'Holds all the things you do not need.',
    baseCost: 2500000,
    costScale: 1.15,
    roomUnlock: 'garage',
    production: 7000
  },
  {
    id: 'grandfatherClock',
    name: 'Grandfather Clock',
    icon: '🕰️',
    desc: 'Tick tock — time keeps adding more stuff.',
    baseCost: 10000000,
    costScale: 1.15,
    roomUnlock: 'attic',
    production: 35000
  },
  {
    id: 'chinaCabinet',
    name: 'China Cabinet',
    icon: '🏺',
    desc: 'Display your finest (and dustiest) collection.',
    baseCost: 50000000,
    costScale: 1.15,
    roomUnlock: 'basement',
    production: 150000
  },
  {
    id: 'poolTable',
    name: 'Pool Table',
    icon: '🎱',
    desc: 'A game room essential. Also great for clutter.',
    baseCost: 250000000,
    costScale: 1.15,
    roomUnlock: 'basement',
    production: 700000
  },
  {
    id: 'grandPiano',
    name: 'Grand Piano',
    icon: '🎹',
    desc: 'Out of tune, but looks impressive.',
    baseCost: 1000000000,
    costScale: 1.15,
    roomUnlock: 'backyard',
    production: 3500000
  },
  {
    id: 'chandelier',
    name: 'Chandelier',
    icon: '💎',
    desc: 'Sparkles and collects dust in equal measure.',
    baseCost: 5000000000,
    costScale: 1.15,
    roomUnlock: 'backyard',
    production: 15000000
  },
  {
    id: 'secretBunker',
    name: 'Secret Bunker',
    icon: '🚪',
    desc: 'Hidden underground vault full of treasure.',
    baseCost: 25000000000,
    costScale: 1.15,
    roomUnlock: 'cellar',
    production: 70000000
  },
  {
    id: 'observatory',
    name: 'Observatory',
    icon: '🔭',
    desc: 'Watch the cosmos accumulate more stuff.',
    baseCost: 125000000000,
    costScale: 1.15,
    roomUnlock: 'cellar',
    production: 350000000
  }
];

function getItemCost(id) {
  const def = ITEMS.find(a => a.id === id);
  if (!def) return Infinity;
  const owned = gameState.items[id] || 0;
  let cost = Math.floor(def.baseCost * Math.pow(def.costScale, owned));
  if (gameState.researchDone.materialScience) cost = Math.floor(cost * 0.9);
  if (gameState.researchDone.advancedMaterialScience) cost = Math.floor(cost * 0.8);
  cost = Math.floor(cost * (0.9 ** (gameState.blessings.frugalSpirit || 0)));
  return cost;
}

function buyItem(id) {
  const def = ITEMS.find(a => a.id === id);
  if (!def) return false;
  if (!isRoomUnlocked(def.roomUnlock)) return false;

  const cost = getItemCost(id);
  if (gameState.resources.stuff < cost) return false;

  gameState.resources.stuff -= cost;
  gameState.items[id] = (gameState.items[id] || 0) + 1;
  dirty = true;
  return true;
}

function getTotalItems() {
  return Object.values(gameState.items).reduce((a, b) => a + b, 0);
}
