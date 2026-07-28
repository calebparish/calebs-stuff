const UPGRADES = [
  {
    id: 'clickPower2',
    name: 'Better Organization',
    desc: 'Click power ×2',
    icon: '📋',
    cost: 50,
    roomUnlock: 'closet',
    effect() {}
  },
  {
    id: 'clickPower4',
    name: 'Decluttering Method',
    desc: 'Click power ×4',
    icon: '🗂️',
    cost: 500,
    roomUnlock: 'kitchen',
    effect() {}
  },
  {
    id: 'clickPower8',
    name: 'KonMari Consultant',
    desc: 'Click power ×8',
    icon: '✨',
    cost: 10000,
    roomUnlock: 'livingRoom',
    effect() {}
  },
  {
    id: 'clickPower16',
    name: 'Professional Organizer',
    desc: 'Click power ×16',
    icon: '🏆',
    cost: 500000,
    roomUnlock: 'bedroom',
    effect() {}
  },
  {
    id: 'doublePaperclip',
    name: 'Magnetic Paperclips',
    desc: 'Paperclip production ×2',
    icon: '🧲',
    cost: 200,
    roomUnlock: 'closet',
    effect() {}
  },
  {
    id: 'doubleMug',
    name: 'Mug Tree',
    desc: 'Coffee Mug production ×2',
    icon: '🌳',
    cost: 1000,
    roomUnlock: 'kitchen',
    effect() {}
  },
  {
    id: 'doublePillow',
    name: 'Pillow Fort',
    desc: 'Throw Pillow production ×2',
    icon: '🏰',
    cost: 5000,
    roomUnlock: 'kitchen',
    effect() {}
  },
  {
    id: 'doublePlant',
    name: 'Plant Fertilizer',
    desc: 'Houseplant production ×2',
    icon: '🌿',
    cost: 25000,
    roomUnlock: 'livingRoom',
    effect() {}
  },
  {
    id: 'doubleLamp',
    name: 'Light Bulbs',
    desc: 'Floor Lamp production ×2',
    icon: '💡',
    cost: 100000,
    roomUnlock: 'livingRoom',
    effect() {}
  },
  {
    id: 'globalEfficiency1',
    name: 'Feng Shui',
    desc: 'All Stuff production ×2',
    icon: '🧘',
    cost: 200000,
    roomUnlock: 'bedroom',
    effect() {}
  },
  {
    id: 'globalEfficiency2',
    name: 'Minimalism',
    desc: 'All Stuff production ×2',
    icon: '☯️',
    cost: 5000000,
    roomUnlock: 'garage',
    effect() {}
  },
  {
    id: 'doubleRug',
    name: 'Rug Doctor',
    desc: 'Area Rug production ×2',
    icon: '🧹',
    cost: 200000,
    roomUnlock: 'bedroom',
    effect() {}
  },
  {
    id: 'doubleBookshelf',
    name: 'Book Organizer',
    desc: 'Bookshelf production ×2',
    icon: '📖',
    cost: 500000,
    roomUnlock: 'bathroom',
    effect() {}
  },
  {
    id: 'doubleArmchair',
    name: 'Armchair Repair',
    desc: 'Armchair production ×2',
    icon: '🪡',
    cost: 2000000,
    roomUnlock: 'garage',
    effect() {}
  },
  {
    id: 'doubleTable',
    name: 'Table Polish',
    desc: 'Dining Table production ×2',
    icon: '✨',
    cost: 10000000,
    roomUnlock: 'basement',
    effect() {}
  },
  {
    id: 'doubleClock',
    name: 'Clock Winder',
    desc: 'Grandfather Clock production ×2',
    icon: '🔧',
    cost: 50000000,
    roomUnlock: 'attic',
    effect() {}
  },
  {
    id: 'globalEfficiency3',
    name: 'Hoarding Mastery',
    desc: 'All Stuff production ×2',
    icon: '🏅',
    cost: 1000000000,
    roomUnlock: 'backyard',
    effect() {}
  },
  {
    id: 'globalEfficiency4',
    name: 'Eternal Accumulation',
    desc: 'All Stuff production ×2',
    icon: '♾️',
    cost: 50000000000,
    roomUnlock: 'cellar',
    effect() {}
  },
  {
    id: 'autoOrganization',
    name: 'Robotic Vacuum',
    desc: 'Passive Stuff based on total items owned',
    icon: '🤖',
    cost: 1000000,
    roomUnlock: 'bathroom',
    effect() {}
  }
];

function buyUpgrade(id) {
  if (gameState.upgrades[id]) return false;
  const def = UPGRADES.find(u => u.id === id);
  if (!def) return false;
  if (!isRoomUnlocked(def.roomUnlock)) return false;
  let cost = def.cost;
  cost = Math.floor(cost * (0.8 ** (gameState.blessings.divineSpeed || 0)));
  if (gameState.resources.stuff < cost) return false;

  gameState.resources.stuff -= cost;
  gameState.upgrades[id] = true;
  if (def.effect) def.effect();
  dirty = true;
  return true;
}
