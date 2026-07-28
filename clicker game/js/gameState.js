const DefaultState = {
  resources: {
    stuff: 0,
    energy: 5,
    researchPoints: 0,
    rp: 0
  },
  clickPower: 1,
  items: {
    paperclip: 0,
    coffeeMug: 0,
    throwPillow: 0,
    houseplant: 0,
    floorLamp: 0,
    areaRug: 0,
    bookshelf: 0,
    armchair: 0,
    diningTable: 0,
    grandfatherClock: 0,
    chinaCabinet: 0,
    poolTable: 0,
    grandPiano: 0,
    chandelier: 0,
    secretBunker: 0,
    observatory: 0
  },
  energyItems: {
    handCrank: 0,
    solarPanel: 0,
    windTurbine: 0,
    waterWheel: 0,
    geothermalPump: 0,
    nuclearBattery: 0,
    fusionCore: 0,
    antimatterCell: 0,
    dysonSwarm: 0,
    zeroPointModule: 0
  },
  researchBuildings: {
    beaker: 0,
    microscope: 0,
    petriDish: 0,
    bunsenBurner: 0,
    centrifuge: 0,
    telescope: 0,
    particleAccelerator: 0,
    quantumComputer: 0,
    dnaSequencer: 0,
    aiLab: 0,
    dimensionalArray: 0
  },
  upgrades: {},
  researchDone: {},
  achievements: [],
  currentRoom: 'closet',
  totalStuffEarned: 0,
  totalEnergyEarned: 0,
  blessings: {},
  renovationCount: 0,
  currentBlessingChoices: [],
  lastTick: Date.now(),
  boostActive: false,
  boostEndTime: 0,
  boostMultiplier: 1,
  boostCost: 200,
  convertRatio: 50,
  lastAutoConvert: 0,
  autoConvertEnabled: false,
  autoConvertAmount: 500,
  autoConvertInterval: 10,
  settings: {
    brightness: 100,
    sound: 100,
    music: 100,
    sfx: 100
  },
  tutorialStep: 0,
  tutorialDone: false,
  tabOrder: ['items', 'lab', 'energy', 'upgrades', 'milestones', 'altar']
};

let gameState = JSON.parse(JSON.stringify(DefaultState));
let dirty = false;

function resetState() {
  const blessings = { ...gameState.blessings };
  const renCount = gameState.renovationCount;
  const totalStuff = gameState.totalStuffEarned;
  const totalEnergy = gameState.totalEnergyEarned;
  const tutorialDone = gameState.tutorialDone;
  const tabOrder = [...gameState.tabOrder];
  gameState = JSON.parse(JSON.stringify(DefaultState));
  gameState.blessings = blessings;
  gameState.renovationCount = renCount;
  gameState.totalStuffEarned = totalStuff;
  gameState.totalEnergyEarned = totalEnergy;
  gameState.tutorialDone = tutorialDone;
  gameState.tabOrder = tabOrder;
  dirty = true;
}

function markDirty() {
  dirty = true;
}

const stateHandler = {
  get(target, prop) {
    return target[prop];
  },
  set(target, prop, value) {
    target[prop] = value;
    dirty = true;
    return true;
  }
};

gameState = new Proxy(gameState, stateHandler);
