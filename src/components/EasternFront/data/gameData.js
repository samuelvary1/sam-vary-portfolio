// Initial Ukrainian Forces (3 Brigades)
export const INITIAL_UKRAINIAN_FORCES = [
  {
    id: "ua_93_mech",
    name: "93rd Mechanized Brigade",
    type: "mechanized",
    strength: 75,
    morale: 70,
    supply: 80,
    fuel: 75,
    ammo: 80,
    location: "kyiv_northwest",
    stance: "defensive",
    drones: 4,
    reconAssigned: false,
    experience: 65,
  },
  {
    id: "ua_1_tank",
    name: "1st Tank Brigade",
    type: "armor",
    strength: 80,
    morale: 75,
    supply: 75,
    fuel: 80,
    ammo: 85,
    location: "kyiv_center",
    stance: "balanced",
    drones: 4,
    reconAssigned: false,
    experience: 70,
  },
  {
    id: "ua_kyiv_tdf",
    name: "Territorial Defense - Kyiv",
    type: "territorial",
    strength: 60,
    morale: 80,
    supply: 85,
    fuel: 70,
    ammo: 75,
    location: "kyiv_center",
    stance: "defensive",
    drones: 4,
    reconAssigned: false,
    experience: 45,
  },
];

// Russian Forces (3 Divisions)
export const INITIAL_RUSSIAN_FORCES = [
  {
    id: "ru_1_guards",
    name: "1st Guards Tank Army",
    type: "armor",
    strength: 85,
    morale: 70,
    supply: 75,
    fuel: 80,
    ammo: 85,
    location: "belarus_border",
    stance: "offensive",
    drones: 4,
    reconAssigned: false,
    experience: 65,
  },
  {
    id: "ru_76_airborne",
    name: "76th Guards Air Assault Division",
    type: "airborne",
    strength: 75,
    morale: 75,
    supply: 70,
    fuel: 75,
    ammo: 80,
    location: "belarus_border",
    stance: "offensive",
    drones: 4,
    reconAssigned: false,
    experience: 70,
  },
  {
    id: "ru_4_guards",
    name: "4th Guards Tank Division",
    type: "armor",
    strength: 80,
    morale: 65,
    supply: 75,
    fuel: 85,
    ammo: 80,
    location: "belarus_border",
    stance: "offensive",
    drones: 4,
    reconAssigned: false,
    experience: 60,
  },
];

// Map Regions (5 total - simplified Kyiv area)
export const INITIAL_REGIONS = [
  {
    id: "kyiv_center",
    name: "Kyiv",
    terrain: "urban",
    baseSupply: 90,
    control: "ukraine",
    enemyStrengthEstimate: 0,
    adjacency: ["kyiv_northwest", "kyiv_south"],
    airDefenseLevel: 85,
    artilleryIntensity: 15,
    electronicWarfareActive: false,
    isObjective: true,
  },
  {
    id: "kyiv_northwest",
    name: "Kyiv Northwest (Hostomel)",
    terrain: "rural",
    baseSupply: 60,
    control: "ukraine",
    enemyStrengthEstimate: 70,
    adjacency: ["kyiv_center", "belarus_border"],
    airDefenseLevel: 60,
    artilleryIntensity: 60,
    electronicWarfareActive: false,
  },
  {
    id: "kyiv_south",
    name: "Kyiv South",
    terrain: "rural",
    baseSupply: 70,
    control: "ukraine",
    enemyStrengthEstimate: 30,
    adjacency: ["kyiv_center", "supply_route"],
    airDefenseLevel: 65,
    artilleryIntensity: 25,
    electronicWarfareActive: false,
  },
  {
    id: "belarus_border",
    name: "Belarus Border",
    terrain: "forest",
    baseSupply: 30,
    control: "russia",
    enemyStrengthEstimate: 85,
    adjacency: ["kyiv_northwest"],
    airDefenseLevel: 40,
    artilleryIntensity: 65,
    electronicWarfareActive: false,
  },
  {
    id: "supply_route",
    name: "Western Supply Route",
    terrain: "highway",
    baseSupply: 95,
    control: "ukraine",
    enemyStrengthEstimate: 0,
    adjacency: ["kyiv_south"],
    airDefenseLevel: 55,
    artilleryIntensity: 0,
    electronicWarfareActive: false,
    isSupplyRoute: true,
    isObjective: true,
  },
];

// Difficulty Levels
export const DIFFICULTY_LEVELS = {
  EASY: {
    name: "Recruit",
    description:
      "Recommended for first-time players. Weaker enemy forces, better supply.",
    enemyStrengthModifier: 0.7,
    playerSupplyModifier: 1.3,
    enemyActivityModifier: 0.6,
    eventFrequencyModifier: 0.5,
    playerDroneRegen: 2,
    startingDrones: 6,
  },
  NORMAL: {
    name: "Veteran",
    description:
      "Balanced gameplay. Realistic enemy strength and supply conditions.",
    enemyStrengthModifier: 1.0,
    playerSupplyModifier: 1.0,
    enemyActivityModifier: 0.8,
    eventFrequencyModifier: 1.0,
    playerDroneRegen: 1,
    startingDrones: 4,
  },
  HARD: {
    name: "Elite",
    description:
      "For experienced commanders. Strong enemy forces, challenging logistics.",
    enemyStrengthModifier: 1.3,
    playerSupplyModifier: 0.8,
    enemyActivityModifier: 1.0,
    eventFrequencyModifier: 1.5,
    playerDroneRegen: 1,
    startingDrones: 3,
  },
};

// Weather effects and probabilities
export const WEATHER_EFFECTS = {
  clear: { name: "Clear", combatModifier: 1.0, supplyModifier: 1.0 },
  rain: { name: "Rain", combatModifier: 0.9, supplyModifier: 0.9 },
  heavy_rain: { name: "Heavy Rain", combatModifier: 0.8, supplyModifier: 0.8 },
  mud: { name: "Mud", combatModifier: 0.7, supplyModifier: 0.65 },
  snow: { name: "Snow", combatModifier: 0.85, supplyModifier: 0.85 },
};

// Combat type modifiers
export const TYPE_MULTIPLIERS = {
  armor: 1.2,
  mechanized: 1.0,
  airborne: 0.9,
  territorial: 0.7,
};

// Stance modifiers for combat
export const STANCE_MODIFIERS = {
  offensive: { attack: 1.3, defense: 0.8 },
  balanced: { attack: 1.0, defense: 1.0 },
  defensive: { attack: 0.7, defense: 1.4 },
};

// Terrain defense bonuses
export const TERRAIN_DEFENSE = {
  urban: 1.4,
  forest: 1.2,
  rural: 1.0,
  highway: 0.9,
};

// Weather combat penalties
export const WEATHER_PENALTIES = {
  clear: 1.0,
  rain: 0.9,
  heavy_rain: 0.8,
  mud: 0.7,
  snow: 0.85,
};
