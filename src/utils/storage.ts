import { Achievement, CaseEvidence, DiscoveryPage, GameSettings, LevelId, LevelInfo, LevelProgress, PlayerStats } from '../types/game';

const SETTINGS_KEY = 'static_game_settings';
const STATS_KEY = 'static_player_stats';

export const LEVEL_DEFINITIONS: LevelInfo[] = [
  {
    id: 'level-1',
    number: 1,
    caseNumber: 'Case 01',
    title: 'The Paper Heist',
    subtitle: 'Can you steal paper without touching it?',
    mysteryQuestion: 'The ruler never touched the paper. So what pulled it against gravity?',
    icon: '📄',
    environmentName: 'Tabletop Physics Workbench',
    description: 'Investigate how friction transfers invisible electrons to lift neutral paper scraps into a collection jar.',
    concepts: ['Friction & Electron Transfer', 'Induced Surface Polarization', 'Coulomb Force'],
  },
  {
    id: 'level-2',
    number: 2,
    caseNumber: 'Case 02',
    title: 'The Wall Defies Gravity',
    subtitle: 'Can you stick a balloon to a wall without glue?',
    mysteryQuestion: 'Why does a rubber balloon cling stubbornly to dry plaster without tape or adhesive?',
    icon: '🎈',
    environmentName: 'Bedroom Wall Experiment',
    description: 'Rub rubber against hair, test distance, and discover how surface atoms polarize against gravity.',
    concepts: ['Triboelectric Charging', 'Drywall Polarization', 'Grounding & Neutralization'],
  },
  {
    id: 'level-3',
    number: 3,
    caseNumber: 'Case 03',
    title: 'The Invisible Tug-of-War',
    subtitle: 'Can two objects push each other without touching?',
    mysteryQuestion: 'Why do objects charged with the same material violently push apart like bumper cars?',
    icon: '🧲',
    environmentName: 'Suspended Objects Arena',
    description: 'Use wool on plastic and silk on glass to prove how like charges repel and opposite charges attract.',
    concepts: ['Positive (+) & Negative (−)', 'Inverse-Square Force', 'Physical Material Charging'],
  },
  {
    id: 'level-4',
    number: 4,
    caseNumber: 'Case 04',
    title: 'The Water That Moves',
    subtitle: 'Can you bend water without touching it?',
    mysteryQuestion: 'How can an invisible electric field reach through the air and curve a continuous stream of water?',
    icon: '💧',
    environmentName: 'Laboratory Sink Station',
    description: 'Deflect laminar water stream with electrostatic charge to fill a target beaker without touching it.',
    concepts: ['Polar H₂O Molecules', 'Dipole Alignment', 'Fluid Deflection'],
  },
  {
    id: 'level-5',
    number: 5,
    caseNumber: 'Case 05',
    title: "The Sky's Giant Spark",
    subtitle: 'How does a cloud create lightning?',
    mysteryQuestion: 'How do tiny drifting ice crystals separate millions of volts to rip open a channel of superheated plasma?',
    icon: '⚡',
    environmentName: 'Atmospheric Thunderstorm Sky',
    description: 'Control cloud updrafts, collide ice and graupel, and unleash a stepped leader lightning strike.',
    concepts: ['Atmospheric Updrafts', 'Charge Separation', 'Ionized Stepped Leaders & Thunder'],
  },
  {
    id: 'level-6',
    number: 6,
    caseNumber: 'Case 06',
    title: 'The Desert Storm',
    subtitle: 'Can you make the right decision before lightning arrives?',
    mysteryQuestion: 'When thunder rumbles across an open wilderness, where is it genuinely safe from lethal ground current?',
    icon: '🛡️',
    environmentName: 'Desert Wilderness Expedition',
    description: 'Navigate incoming storm hazards, evaluate shelter options, and learn real-world survival physics.',
    concepts: ['Faraday Cage Enclosures', 'Ground Current Hazards', 'When Thunder Roars Go Indoors'],
  },
];

export const CASE_EVIDENCE_LIST: CaseEvidence[] = [
  {
    id: 'ev-1',
    caseId: 'level-1',
    caseNumber: 'Case 01',
    title: 'Friction Transfers Electrons',
    discovery: 'Rubbing plastic against wool strips electrons away, loading the ruler with negative charges without creating any new atoms.',
    deepDive: 'Atoms are normally electrically balanced. Friction provides physical mechanical energy that knocks loosely-bound electrons from wool onto plastic, leaving the ruler negatively charged (−).',
    icon: '⚡',
    visualType: 'friction',
    unlocked: true,
  },
  {
    id: 'ev-2',
    caseId: 'level-2',
    caseNumber: 'Case 02',
    title: 'Induced Surface Polarization',
    discovery: 'A charged object repels like charges deeper into a neutral object, exposing opposite charges at the surface that cling against gravity.',
    deepDive: 'The wall and paper never gained a net charge—they remain strictly neutral overall! The negative balloon pushes electrons inside wall atoms deeper, leaving the positive atomic nuclei on the surface to exert a strong attractive force.',
    icon: '🧲',
    visualType: 'polarization',
    unlocked: true,
  },
  {
    id: 'ev-3',
    caseId: 'level-3',
    caseNumber: 'Case 03',
    title: 'The Fundamental Law of Charges',
    discovery: 'Like charges repel like invisible bumper cars; opposite charges attract like magnets with force proportional to 1/distance².',
    deepDive: 'Coulomb’s Law dictates that two negative charges or two positive charges push apart, while a positive and negative pull together. The closer they are, the exponentially stronger the push or pull.',
    icon: '🚗',
    visualType: 'repulsion',
    unlocked: true,
  },
  {
    id: 'ev-4',
    caseId: 'level-4',
    caseNumber: 'Case 04',
    title: 'Water Molecules are Natural Dipoles',
    discovery: 'Water molecules (H₂O) have an intrinsic bend that makes them rotate their positive hydrogen ends toward electric fields, pulling the stream sideways.',
    deepDive: 'Oxygen pulls electrons greedily (slightly negative), leaving the two hydrogen ears slightly positive. This dipole moment allows free-falling liquid water to bend dramatically toward any charged object without physical contact.',
    icon: '💧',
    visualType: 'dipole',
    unlocked: true,
  },
  {
    id: 'ev-5',
    caseId: 'level-5',
    caseNumber: 'Case 05',
    title: 'Atmospheric Charge Separation & Lightning',
    discovery: 'Violent updrafts collide ice crystals with heavier graupel, separating gigavolts of static charge until a massive spark ionizes the air.',
    deepDive: 'Lighter ice crystals gain positive charge and rise to the anvil cloud top, while heavy graupel gains negative charge and sinks to the cloud base. When the electric field exceeds 3 million volts per meter, air breaks down into a stepped leader and lightning flash!',
    icon: '🌩️',
    visualType: 'storm',
    unlocked: true,
  },
  {
    id: 'ev-6',
    caseId: 'level-6',
    caseNumber: 'Case 06',
    title: 'Thunderstorm Shelter Physics',
    discovery: 'When thunder roars, go indoors! Substantial buildings and metal vehicles act as Faraday cages; isolated trees and open plains are lethal ground-current traps.',
    deepDive: 'National Weather Service rules: crouching outdoors does NOT provide safety! A metal car shields passengers because lightning current travels along the conductive outer metal frame into the ground, completely bypassing the interior cabin.',
    icon: '🛡️',
    visualType: 'safety',
    unlocked: true,
  },
];

export const DISCOVERY_PAGES: DiscoveryPage[] = [
  {
    id: 'disc-1',
    levelSource: 'level-1',
    title: 'What is Static Electricity?',
    subtitle: 'An invisible imbalance in everyday things',
    summary: 'Everything around you is made of tiny atoms containing positive (+) protons and negative (-) electrons. Usually they are balanced. But when objects rub together, electrons can jump, creating a static charge!',
    bullets: [
      'Atoms have positive centers and negative electrons orbiting outside.',
      'Friction gives electrons just enough energy to hop from one material to another.',
      'An object with extra electrons is negatively charged (-).',
      'An object that lost electrons is left positively charged (+).'
    ],
    deepDive: 'Scientist note: Static electricity isn’t "frozen" electricity—it just means charges are gathered in one place waiting for a path to balance out!',
    icon: '🔬',
    chargeDemoType: 'friction',
  },
  {
    id: 'disc-2',
    levelSource: 'level-1',
    title: 'Why Does Paper Jump?',
    subtitle: 'The secret trick of neutral objects',
    summary: 'The paper pieces never had an electric charge! So why did they stick to the ruler? The ruler’s negative charges pushed the paper’s electrons slightly away, pulling the positive side closer!',
    bullets: [
      'Paper starts out completely neutral (equal + and -).',
      'The negative ruler pushes electrons inside the paper atoms away.',
      'The positive side of the paper atoms is now closer to the ruler.',
      'Closer opposite charges attract more strongly than farther like charges repel!'
    ],
    deepDive: 'This shifting of charges inside a neutral object without adding new charge is called Induced Polarization.',
    icon: '📄',
    chargeDemoType: 'polarization',
  },
  {
    id: 'disc-3',
    levelSource: 'level-2',
    title: 'The Sticky Balloon Mystery',
    subtitle: 'Defying gravity on a vertical wall',
    summary: 'Rubber balloons love collecting extra electrons when rubbed against hair. When placed against a wall, the balloon pushes wall electrons deeper inside, sticking tight to the exposed positive surface!',
    bullets: [
      'Rubber is a great electrical insulator—charges stay right where you rubbed them.',
      'Hair gives up electrons easily, leaving hair positively charged (hair stands up!).',
      'The wall remains neutral overall, but its surface becomes locally polarized.',
      'The balloon sticks until moisture in the air slowly bleeds the extra electrons away.'
    ],
    deepDive: 'Why does hair stand up? Each hair becomes positively charged, and like charges repel each other!',
    icon: '🎈',
    chargeDemoType: 'polarization',
  },
  {
    id: 'disc-4',
    levelSource: 'level-3',
    title: 'The Golden Law of Charges',
    subtitle: 'Likes Repel, Opposites Attract!',
    summary: 'There are only two kinds of electric charges in the universe: Positive (+) and Negative (-). When two objects share the same charge, they push away. When they have different charges, they pull together!',
    bullets: [
      'Negative (-) and Negative (-) = REPEL (push away)',
      'Positive (+) and Positive (+) = REPEL (push away)',
      'Positive (+) and Negative (-) = ATTRACT (pull together)',
      'The closer the charges are, the stronger the invisible electrostatic force.'
    ],
    deepDive: 'This fundamental relationship is described by Coulomb’s Law. It is the very force that keeps atoms together and prevents you from falling through your chair!',
    icon: '🧲',
    chargeDemoType: 'repulsion',
  },
  {
    id: 'disc-5',
    levelSource: 'level-4',
    title: 'The Bending Water Phenomenon',
    subtitle: 'Water molecules are tiny natural magnets',
    summary: 'A water molecule (H₂O) has a bent shape! The oxygen side is slightly negative, and the two hydrogen ears are slightly positive. This makes water a polar molecule that can twist toward electric fields!',
    bullets: [
      'Water molecules act like microscopic dipoles.',
      'When a charged balloon approaches, the water molecules rotate so their positive side faces the balloon.',
      'The flowing stream is pulled sideways by the electrostatic attraction before it hits the drain.'
    ],
    deepDive: 'Because water molecules are free to move in a stream, the collective dipole pull creates an easily visible curved bend!',
    icon: '💧',
    chargeDemoType: 'dipole',
  },
  {
    id: 'disc-6',
    levelSource: 'level-5',
    title: 'How Clouds Make Lightning',
    subtitle: 'Nature’s most spectacular spark',
    summary: 'Inside towering cumulonimbus clouds, warm updrafts and cold downdrafts force millions of ice crystals, hail, and water droplets to crash together. Lighter ice crystals gain positive charge and rise, while heavier graupel gains negative charge and sinks!',
    bullets: [
      'Massive friction and collisions between ice crystals separate electric charges.',
      'The bottom of the cloud becomes heavily negative, inducing a positive charge on the earth below.',
      'Air usually insulates electricity, but when the voltage difference reaches millions of volts, the air ionizes.',
      'A stepped leader descends from the cloud and meets an upward streamer from the ground in a blinding flash!'
    ],
    deepDive: 'A single lightning flash heats the surrounding air to roughly 30,000 Kelvin (5 times hotter than the surface of the Sun)!',
    icon: '⚡',
    chargeDemoType: 'storm',
  },
  {
    id: 'disc-7',
    levelSource: 'level-5',
    title: 'Why Thunder Rumbles',
    subtitle: 'The sonic boom of expanding superheated air',
    summary: 'Thunder is the sound of exploding air! When lightning slices through the sky, the extreme heat suddenly expands the air faster than the speed of sound, creating a deafening acoustic shockwave.',
    bullets: [
      'Lightning instantly superheats the narrow air channel.',
      'The air expands violently outward in an explosive pressure wave.',
      'Because light travels much faster (300,000 km/s) than sound (343 m/s), you see the flash before you hear the boom!',
      'Count the seconds between flash and bang: every 5 seconds is roughly 1 mile (or 3 seconds for 1 kilometer)!'
    ],
    deepDive: 'The rumbling echo comes from different sections of the miles-long lightning channel reaching your ears at slightly different times.',
    icon: '🔊',
    chargeDemoType: 'storm',
  },
  {
    id: 'disc-8',
    levelSource: 'level-6',
    title: 'Thunderstorm Survival Rules',
    subtitle: 'When thunder roars, go indoors!',
    summary: 'Lightning kills and injures hundreds of people every year. Knowing what to do and what NOT to do saves lives. Isolated trees, open fields, and metal fences are high-risk hazard zones.',
    bullets: [
      'The only truly safe shelters are substantial enclosed buildings with wiring and plumbing, or hard-topped metal vehicles.',
      'NEVER shelter under an isolated tall tree—it acts as a lightning attractor and ground current hazard.',
      'Avoid open fields, hilltops, and bodies of water (lakes, pools).',
      'If caught in the open with no shelter, crouch low on the balls of your feet with heels touching. Do NOT lie flat on the ground!'
    ],
    deepDive: 'Cars protect you not because of rubber tires, but because the metal frame forms a Faraday Cage that channels current safely around the occupants!',
    icon: '🛡️',
    chargeDemoType: 'safety',
  },
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-first-rub',
    title: 'First Friction',
    description: 'Rub an object and produce your first electric charge.',
    icon: '✨',
    unlocked: false,
  },
  {
    id: 'ach-paper-master',
    title: 'Paper Heist Master',
    description: 'Defeat gravity and stick 5 paper pieces at once.',
    icon: '📄',
    unlocked: false,
  },
  {
    id: 'ach-wall-hugger',
    title: 'Wall Whisperer',
    description: 'Successfully stick a charged balloon to the bedroom wall.',
    icon: '🎈',
    unlocked: false,
  },
  {
    id: 'ach-bumper-cars',
    title: 'Force Field Discoverer',
    description: 'Discover both attraction and repulsion with balloons.',
    icon: '🚗',
    unlocked: false,
  },
  {
    id: 'ach-water-bender',
    title: 'Hydro-Electromancer',
    description: 'Bend flowing tap water using static electricity.',
    icon: '💧',
    unlocked: false,
  },
  {
    id: 'ach-storm-summoner',
    title: 'Storm Master',
    description: 'Charge a storm cloud and trigger a lightning strike.',
    icon: '⚡',
    unlocked: false,
  },
  {
    id: 'ach-safety-expert',
    title: 'Lightning Certified Safe',
    description: 'Complete the Lightning Survival challenge with a perfect score.',
    icon: '🛡️',
    unlocked: false,
  },
  {
    id: 'ach-curious-mind',
    title: 'Curious Mind',
    description: 'Inspect all 8 entries in Professor Zappy’s Discovery Book.',
    icon: '📚',
    unlocked: false,
  },
];

export const DEFAULT_SETTINGS: GameSettings = {
  musicVolume: 0.5,
  sfxVolume: 0.8,
  muted: false,
  voiceNarration: true,
  captions: true,
  showInvisibleCharges: true,
  reducedMotion: false,
  reducedFlash: false,
  freeExperimentMode: true, // Default to Free Experiment Mode for classroom presentation freedom
};

export const ALL_LEVEL_IDS: LevelId[] = [
  'level-1',
  'level-2',
  'level-3',
  'level-4',
  'level-5',
  'level-6',
  'sandbox',
];

export const ALL_DISCOVERY_PAGE_IDS: string[] = [
  'disc-1',
  'disc-2',
  'disc-3',
  'disc-4',
  'disc-5',
  'disc-6',
  'disc-7',
  'disc-8',
];

export const ALL_EVIDENCE_IDS: string[] = [
  'ev-1',
  'ev-2',
  'ev-3',
  'ev-4',
  'ev-5',
  'ev-6',
];

export const INITIAL_STATS: PlayerStats = {
  xp: 0,
  rank: 'Spark Apprentice',
  unlockedLevels: ALL_LEVEL_IDS,
  levelProgress: {
    'level-1': { levelId: 'level-1', completed: false, stars: 0, score: 0, unlocked: true },
    'level-2': { levelId: 'level-2', completed: false, stars: 0, score: 0, unlocked: true },
    'level-3': { levelId: 'level-3', completed: false, stars: 0, score: 0, unlocked: true },
    'level-4': { levelId: 'level-4', completed: false, stars: 0, score: 0, unlocked: true },
    'level-5': { levelId: 'level-5', completed: false, stars: 0, score: 0, unlocked: true },
    'level-6': { levelId: 'level-6', completed: false, stars: 0, score: 0, unlocked: true },
    'sandbox': { levelId: 'sandbox', completed: false, stars: 3, score: 0, unlocked: true },
  },
  unlockedAccessories: ['default'],
  currentAccessory: null,
  discoveryPages: ALL_DISCOVERY_PAGE_IDS,
  collectedEvidence: ALL_EVIDENCE_IDS,
  achievements: INITIAL_ACHIEVEMENTS,
};

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    // fallback
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: GameSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function loadPlayerStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure all levels are always unlocked for classroom demonstrations
      const mergedProgress = { ...INITIAL_STATS.levelProgress, ...(parsed.levelProgress || {}) };
      ALL_LEVEL_IDS.forEach((lvl) => {
        if (mergedProgress[lvl]) {
          mergedProgress[lvl] = { ...mergedProgress[lvl], unlocked: true };
        } else {
          mergedProgress[lvl] = { levelId: lvl, completed: false, stars: 0, score: 0, unlocked: true };
        }
      });

      return {
        ...INITIAL_STATS,
        ...parsed,
        unlockedLevels: ALL_LEVEL_IDS,
        levelProgress: mergedProgress,
        discoveryPages: ALL_DISCOVERY_PAGE_IDS,
        collectedEvidence: parsed.collectedEvidence || ALL_EVIDENCE_IDS,
      };
    }
  } catch {
    // fallback
  }
  return INITIAL_STATS;
}

export function savePlayerStats(stats: PlayerStats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

export function calculateRank(xp: number): string {
  if (xp >= 1000) return 'Arch-Mage of Static & Storms';
  if (xp >= 700) return 'Master of Charges';
  if (xp >= 450) return 'Thunder Tamer';
  if (xp >= 250) return 'Electron Whisperer';
  if (xp >= 100) return 'Static Adept';
  return 'Spark Apprentice';
}
