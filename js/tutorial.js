let tutorialActive = false;

const TUTORIAL_STEPS = [
  {
    title: 'Welcome!',
    text: 'Click the box 10 times to start collecting Stuff!',
    target: 'click-area',
    position: 'bottom',
    condition: () => gameState.totalStuffEarned >= 10
  },
  {
    title: 'Your Stuff',
    text: 'This is your Stuff count — your main currency. The rate shows how much you earn per second. Now let\'s buy something!',
    target: 'stuff-display',
    position: 'bottom'
  },
  {
    title: 'Buy an Item',
    text: 'Buy a Paperclip (10 📦) to start earning Stuff automatically. Each item produces Stuff every second!',
    target: 'items-list',
    position: 'top',
    switchTab: 'items',
    condition: () => (gameState.items.paperclip || 0) > 0
  },
  {
    title: 'Energy',
    text: 'Now buy a Hand Crank (5 📦) in the Energy tab to start producing ⚡. Research buildings will drain it later!',
    target: 'energy-items-list',
    position: 'top',
    switchTab: 'energy',
    condition: () => (gameState.energyItems.handCrank || 0) > 0
  },
  {
    title: 'Research Lab',
    text: 'Research buildings cost Stuff + ⚡ and drain energy to produce 📄 Research Points. Keep energy production above the drain!',
    target: 'panel-lab',
    position: 'top',
    switchTab: 'lab'
  },
  {
    title: 'Upgrades',
    text: 'Permanent boosts for your items, energy, and research. Unlock new abilities as you progress!',
    target: 'panel-upgrades',
    position: 'top',
    switchTab: 'upgrades'
  },
  {
    title: 'Rooms & Altar',
    text: 'As you accumulate Stuff, new rooms unlock with new items. At the Altar, sacrifice everything for permanent blessings!',
    target: 'altar',
    position: 'top',
    switchTab: 'altar'
  }
];

let tutorialOverlay = null;
let tutorialSpotlight = null;
let tutorialBox = null;
let tutorialStepCounter = null;
let tutorialTitle = null;
let tutorialText = null;
let tutorialBackBtn = null;
let tutorialSkipBtn = null;
let tutorialNextBtn = null;
let tutorialConditionInterval = null;

function cacheTutorialElements() {
  tutorialOverlay = document.getElementById('tutorial-overlay');
  tutorialSpotlight = document.getElementById('tutorial-spotlight');
  tutorialBox = document.getElementById('tutorial-box');
  tutorialStepCounter = document.getElementById('tutorial-step-counter');
  tutorialTitle = document.getElementById('tutorial-title');
  tutorialText = document.getElementById('tutorial-text');
  tutorialBackBtn = document.getElementById('tutorial-back');
  tutorialSkipBtn = document.getElementById('tutorial-skip');
  tutorialNextBtn = document.getElementById('tutorial-next');
}

function startTutorial() {
  cacheTutorialElements();
  if (!tutorialOverlay) return;
  gameState.tutorialStep = 0;
  gameState.tutorialDone = false;
  tutorialActive = true;
  tutorialOverlay.classList.remove('hidden');
  showTutorialStep(0);
  startConditionCheck();
}

function showTutorialStep(index) {
  if (index < 0 || index >= TUTORIAL_STEPS.length) return;
  gameState.tutorialStep = index;
  const step = TUTORIAL_STEPS[index];

  tutorialStepCounter.textContent = `${index + 1} / ${TUTORIAL_STEPS.length}`;
  tutorialTitle.textContent = step.title;
  tutorialText.textContent = step.text;

  tutorialBackBtn.style.visibility = index === 0 ? 'hidden' : 'visible';

  const isLast = index === TUTORIAL_STEPS.length - 1;
  if (isLast) {
    tutorialNextBtn.textContent = 'Start!';
    tutorialNextBtn.disabled = false;
    tutorialNextBtn.classList.remove('waiting');
    tutorialNextBtn.classList.add('ready');
  } else {
    updateNextButton(step);
  }

  if (step.switchTab) {
    switchTab(step.switchTab);
  }

  requestAnimationFrame(() => {
    positionSpotlight(step.target, step.position);
  });
}

function updateNextButton(step) {
  if (!step || !step.condition) {
    tutorialNextBtn.textContent = 'Next →';
    tutorialNextBtn.disabled = false;
    tutorialNextBtn.classList.remove('waiting');
    tutorialNextBtn.classList.add('ready');
  } else if (step.condition()) {
    tutorialNextBtn.textContent = 'Next →';
    tutorialNextBtn.disabled = false;
    tutorialNextBtn.classList.remove('waiting');
    tutorialNextBtn.classList.add('ready');
  } else {
    tutorialNextBtn.textContent = 'Do the task first →';
    tutorialNextBtn.disabled = true;
    tutorialNextBtn.classList.add('waiting');
    tutorialNextBtn.classList.remove('ready');
  }
}

function startConditionCheck() {
  if (tutorialConditionInterval) clearInterval(tutorialConditionInterval);
  tutorialConditionInterval = setInterval(() => {
    if (!tutorialActive) {
      clearInterval(tutorialConditionInterval);
      return;
    }
    const step = TUTORIAL_STEPS[gameState.tutorialStep];
    if (step) updateNextButton(step);
  }, 500);
}

function positionSpotlight(targetId, position) {
  if (!tutorialSpotlight || !tutorialBox) return;
  const target = document.getElementById(targetId);
  if (!target) {
    tutorialSpotlight.style.opacity = '0';
    positionBoxFallback();
    return;
  }

  const rect = target.getBoundingClientRect();
  const pad = 12;
  const sl = Math.max(0, rect.left - pad);
  const st = Math.max(0, rect.top - pad);
  const sw = rect.width + pad * 2;
  const sh = rect.height + pad * 2;

  tutorialSpotlight.style.left = sl + 'px';
  tutorialSpotlight.style.top = st + 'px';
  tutorialSpotlight.style.width = sw + 'px';
  tutorialSpotlight.style.height = sh + 'px';
  tutorialSpotlight.style.opacity = '1';

  const boxRect = tutorialBox.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const gap = 16;
  let bx, by;

  if (position === 'bottom') {
    bx = rect.left + rect.width / 2 - boxRect.width / 2;
    by = rect.bottom + pad + gap;
    if (by + boxRect.height > vh - 20) {
      by = rect.top - pad - gap - boxRect.height;
    }
  } else {
    bx = rect.left + rect.width / 2 - boxRect.width / 2;
    by = rect.top - pad - gap - boxRect.height;
    if (by < 20) {
      by = rect.bottom + pad + gap;
    }
  }

  bx = Math.max(20, Math.min(bx, vw - boxRect.width - 20));
  by = Math.max(20, Math.min(by, vh - boxRect.height - 20));

  tutorialBox.style.left = bx + 'px';
  tutorialBox.style.top = by + 'px';
  tutorialBox.style.opacity = '1';
}

function positionBoxFallback() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const boxRect = tutorialBox.getBoundingClientRect();
  tutorialBox.style.left = (vw / 2 - boxRect.width / 2) + 'px';
  tutorialBox.style.top = (vh / 2 - boxRect.height / 2) + 'px';
  tutorialBox.style.opacity = '1';
}

function nextTutorialStep() {
  if (tutorialNextBtn.disabled) return;
  const current = gameState.tutorialStep;
  if (current >= TUTORIAL_STEPS.length - 1) {
    completeTutorial();
  } else {
    showTutorialStep(current + 1);
  }
}

function prevTutorialStep() {
  const current = gameState.tutorialStep;
  if (current > 0) {
    showTutorialStep(current - 1);
  }
}

function skipTutorial() {
  completeTutorial();
}

function completeTutorial() {
  cacheTutorialElements();
  if (tutorialOverlay) {
    tutorialOverlay.classList.add('hidden');
  }
  tutorialActive = false;
  gameState.tutorialDone = true;
  gameState.tutorialStep = 0;
  dirty = true;
  if (tutorialConditionInterval) {
    clearInterval(tutorialConditionInterval);
    tutorialConditionInterval = null;
  }
}

function setupTutorialEvents() {
  cacheTutorialElements();
  if (tutorialNextBtn) {
    tutorialNextBtn.addEventListener('click', nextTutorialStep);
  }
  if (tutorialBackBtn) {
    tutorialBackBtn.addEventListener('click', prevTutorialStep);
  }
  if (tutorialSkipBtn) {
    tutorialSkipBtn.addEventListener('click', skipTutorial);
  }
  window.addEventListener('resize', () => {
    if (tutorialOverlay && !tutorialOverlay.classList.contains('hidden')) {
      const step = TUTORIAL_STEPS[gameState.tutorialStep];
      if (step) positionSpotlight(step.target, step.position);
    }
  });
}
