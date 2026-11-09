import { Achievement, DiscoveryPage, GameSettings, LevelId, LevelInfo, LevelProgress, PlayerStats } from '../types/game';

const SETTINGS_KEY = 'static_game_settings';
const STATS_KEY = 'static_player_stats';

export const LEVEL_DEFINITIONS: LevelInfo[] = [
  {
    id: 'level-1',
    number: 1,
    title: 'The Paper Heist',
    subtitle: 'Make paper fly against gravity!',
    icon: '📄',
    description: 'Rub a plastic ruler against wool or hair and watch neutral paper pieces jump to life!',
    concepts: ['Friction', 'Electron Transfer', 'Neutral Object Polarization'],
  },
  {
    id: 'level-2',
    number: 2,
    title: 'Balloon vs. Wall',
    subtitle: 'The mysterious sticky balloon',
    icon: '🎈',
    description: 'Rub a balloon on your hair and see if it can cling to a regular bedroom wall without any glue!',
    concepts: ['Everyday Static', 'Surface Charge Shift', 'Sticking Force'],
  },
  {
    id: 'level-3',
    number: 3,
    title: 'Balloon Bumper Cars',
    subtitle: 'When balloons refuse to touch!',
    icon: '🚗',
    description: 'Charge up two balloons with the same charge and feel the invisible force push them apart!',
    concepts: ['Like Charges Repel', 'Opposites Attract', 'Electrostatic Force'],
  },
  {
    id: 'level-4',
    number: 4,
    title: 'The Magic Water Trick',
    subtitle: 'Bend a stream of water without touching it!',
    icon: '💧',
    description: 'Turn on the laboratory faucet and bend the falling water stream using pure electrical charge.',
    concepts: ['Water Dipole Molecules', 'Polar Attraction', 'Invisible Electric Fields'],
  },
  {
    id: 'level-5',
    number: 5,
    title: "The Sky's Giant Spark",
    subtitle: 'Build a thundercloud and unleash lightning!',
    icon: '⚡',
    description: 'Collide ice crystals inside massive storm clouds to separate charges until a giant spark breaks through!',
    concepts: ['Atmospheric Charge Separation', 'Stepped Leader', 'Thunder Sound Wave'],
  },
  {
    id: 'level-6',
    number: 6,
    title: 'Lightning Survival',
    subtitle: 'Outsmart the storm safely!',
    icon: '🛡️',
    description: 'Guide Pip safely through an approaching thunderstorm. Learn where to go and what hazards to avoid!',
    concepts: ['Ground Currents', 'Safe Enclosed Shelters', 'Survival Positioning'],
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
