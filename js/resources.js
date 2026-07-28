const ROOM_THRESHOLDS = {
  closet: 0,
  kitchen: 100,
  livingRoom: 1000,
  bedroom: 10000,
  bathroom: 100000,
  garage: 500000,
  basement: 5000000,
  attic: 50000000,
  backyard: 200000000,
  cellar: 500000000
};

const ROOM_NAMES = {
  closet: { icon: '🚪', name: 'Closet' },
  kitchen: { icon: '🍳', name: 'Kitchen' },
  livingRoom: { icon: '🛋️', name: 'Living Room' },
  bedroom: { icon: '🛏️', name: 'Bedroom' },
  bathroom: { icon: '🚿', name: 'Bathroom' },
  garage: { icon: '🔧', name: 'Garage' },
  basement: { icon: '⬇️', name: 'Basement' },
  attic: { icon: '🏚️', name: 'Attic' },
  backyard: { icon: '🌳', name: 'Backyard' },
  cellar: { icon: '🪜', name: 'Cellar' }
};

function getCurrentRoom() {
  const stuff = gameState.resources.stuff;
  let room = 'closet';
  for (const [key, threshold] of Object.entries(ROOM_THRESHOLDS)) {
    if (stuff >= threshold) room = key;
  }
  return room;
}

function isRoomUnlocked(room) {
  return gameState.resources.stuff >= (ROOM_THRESHOLDS[room] || 0);
}

function getBoostMultiplier() {
  if (gameState.boostActive && Date.now() < gameState.boostEndTime) {
    return gameState.boostMultiplier;
  }
  if (gameState.boostActive) {
    gameState.boostActive = false;
    gameState.boostMultiplier = 1;
  }
  return 1;
}

function getAllProductionMultiplier() {
  let mult = 1;
  mult *= 1.1 ** (gameState.blessings.divineOrder || 0);
  mult *= 1.25 ** (gameState.blessings.generousHarvest || 0);
  mult *= 1.15 ** (gameState.blessings.harmonicBalance || 0);
  mult *= 1.5 ** (gameState.blessings.blessedTools || 0);
  if (gameState.researchDone.transcendence) mult *= 1.5;
  if (gameState.researchDone.cosmicUnderstanding) mult *= 2;
  return mult;
}

function calculateStuffProduction() {
  const items = gameState.items;
  let perSec = 0;

  perSec += items.paperclip * 0.1;
  perSec += items.coffeeMug * 0.5;
  perSec += items.throwPillow * 2;
  perSec += items.houseplant * 5;
  perSec += items.floorLamp * 20;
  perSec += items.areaRug * 80;
  perSec += items.bookshelf * 350;
  perSec += items.armchair * 1500;
  perSec += items.diningTable * 7000;
  perSec += items.grandfatherClock * 35000;
  perSec += items.chinaCabinet * 150000;
  perSec += items.poolTable * 700000;
  perSec += items.grandPiano * 3500000;
  perSec += items.chandelier * 15000000;
  perSec += items.secretBunker * 70000000;
  perSec += items.observatory * 350000000;

  if (gameState.upgrades.doublePaperclip) perSec *= 2;
  if (gameState.upgrades.doubleMug) perSec *= 2;
  if (gameState.upgrades.doublePillow) perSec *= 2;
  if (gameState.upgrades.doublePlant) perSec *= 2;
  if (gameState.upgrades.doubleLamp) perSec *= 2;
  if (gameState.upgrades.doubleRug) perSec *= 2;
  if (gameState.upgrades.doubleBookshelf) perSec *= 2;
  if (gameState.upgrades.doubleArmchair) perSec *= 2;
  if (gameState.upgrades.doubleTable) perSec *= 2;
  if (gameState.upgrades.doubleClock) perSec *= 2;
  if (gameState.upgrades.globalEfficiency1) perSec *= 2;
  if (gameState.upgrades.globalEfficiency2) perSec *= 2;
  if (gameState.upgrades.globalEfficiency3) perSec *= 2;
  if (gameState.upgrades.globalEfficiency4) perSec *= 2;

  if (gameState.researchDone.efficientStorage) perSec *= 1.1;
  if (gameState.researchDone.advancedAlgorithms) perSec *= 1.2;
  if (gameState.researchDone.nanotechnology) perSec *= 1.5;
  if (gameState.researchDone.singularity) perSec *= 2;
  if (gameState.researchDone.quantumTunneling) perSec *= 1.3;
  if (gameState.researchDone.temporalAcceleration) perSec *= 2;

  perSec *= getAllProductionMultiplier();
  perSec *= 1.5 ** (gameState.blessings.overflowingCupboards || 0);

  perSec *= getBoostMultiplier();

  return perSec;
}

function calculateEnergyProduction() {
  const eItems = gameState.energyItems;
  let perSec = 0;

  perSec += eItems.handCrank * 0.1;
  perSec += eItems.solarPanel * 0.5;
  perSec += eItems.windTurbine * 2;
  perSec += eItems.waterWheel * 5;
  perSec += eItems.geothermalPump * 20;
  perSec += eItems.nuclearBattery * 80;
  perSec += eItems.fusionCore * 350;
  perSec += eItems.antimatterCell * 1500;
  perSec += eItems.dysonSwarm * 7000;
  perSec += eItems.zeroPointModule * 35000;

  if (gameState.upgrades.energyEfficiency1) perSec *= 2;
  if (gameState.upgrades.energyEfficiency2) perSec *= 2;
  if (gameState.upgrades.energyEfficiency3) perSec *= 2;

  if (gameState.researchDone.energyResearch) perSec *= 1.5;
  if (gameState.researchDone.fusionResearch) perSec *= 2;
  if (gameState.researchDone.quantumTunneling) perSec *= 1.3;
  if (gameState.researchDone.temporalAcceleration) perSec *= 2;

  perSec *= getAllProductionMultiplier();
  perSec *= 1.5 ** (gameState.blessings.perpetualMotion || 0);
  perSec *= 2 ** (gameState.blessings.eternalFlame || 0);

  perSec *= getBoostMultiplier();

  return perSec;
}

function calculateResearchProduction() {
  const rBuildings = gameState.researchBuildings;
  let perSec = 0;

  perSec += rBuildings.beaker * 0.1;
  perSec += rBuildings.microscope * 0.5;
  perSec += rBuildings.petriDish * 2;
  perSec += rBuildings.bunsenBurner * 5;
  perSec += rBuildings.centrifuge * 20;
  perSec += rBuildings.telescope * 80;
  perSec += rBuildings.particleAccelerator * 350;
  perSec += rBuildings.quantumComputer * 1500;
  perSec += rBuildings.dnaSequencer * 5000;
  perSec += rBuildings.aiLab * 20000;
  perSec += rBuildings.dimensionalArray * 100000;

  perSec += (gameState.blessings.ancientWisdom || 0);

  if (gameState.researchDone.labAutomation) perSec *= 1.25;
  if (gameState.researchDone.quantumTunneling) perSec *= 1.3;
  if (gameState.researchDone.dimensionalEngineering) perSec *= 3;
  if (gameState.researchDone.temporalAcceleration) perSec *= 2;

  perSec *= getAllProductionMultiplier();
  perSec *= 2 ** (gameState.blessings.sacredKnowledge || 0);

  perSec *= getBoostMultiplier();

  return perSec;
}

function calculateEnergyDrain() {
  const rBuildings = gameState.researchBuildings;
  let drain = 0;
  drain += rBuildings.beaker * 0.01;
  drain += rBuildings.microscope * 0.1;
  drain += rBuildings.petriDish * 1;
  drain += rBuildings.bunsenBurner * 5;
  drain += rBuildings.centrifuge * 25;
  drain += rBuildings.telescope * 150;
  drain += rBuildings.particleAccelerator * 1000;
  drain += rBuildings.quantumComputer * 8000;
  drain += rBuildings.dnaSequencer * 40000;
  drain += rBuildings.aiLab * 200000;
  drain += rBuildings.dimensionalArray * 1000000;
  return drain;
}

function formatNumber(n) {
  if (n < 1000) return Math.floor(n).toString();
  if (n < 1e6) return (n / 1e3).toFixed(1) + 'K';
  if (n < 1e9) return (n / 1e6).toFixed(2) + 'M';
  if (n < 1e12) return (n / 1e9).toFixed(2) + 'B';
  if (n < 1e15) return (n / 1e12).toFixed(2) + 'T';
  return (n / 1e15).toFixed(2) + 'Q';
}

function formatRate(n) {
  if (n === 0) return '0';
  if (n < 1) return n.toFixed(2);
  return formatNumber(n);
}
