export interface AbilityScore {
  score: number;
  modifier: number;
}

export interface AbilityScores {
  strength: AbilityScore;
  dexterity: AbilityScore;
  constitution: AbilityScore;
  intelligence: AbilityScore;
  wisdom: AbilityScore;
  charisma: AbilityScore;
}

export interface Skill {
  name: string;
  ability: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';
  proficient: boolean;
  bonus: number;
}

export interface SavingThrow {
  ability: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';
  proficient: boolean;
  bonus: number;
}

export interface Attack {
  name: string;
  type: 'Melee' | 'Ranged' | 'Spell';
  range: string;
  hitBonus: number;
  damage: string;
  damageType: string;
  properties?: string[];
}

export interface Spell {
  id: string;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  prepared: boolean;
  ritual: boolean;
}

export interface SpellSlot {
  level: number;
  max: number;
  used: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  weight?: number;
  description?: string;
  equipped?: boolean;
}

export interface Feature {
  name: string;
  source: string;
  description: string;
  uses?: {
    max: number;
    current: number;
    reset: 'Short Rest' | 'Long Rest';
  };
}

export interface Character {
  id?: string;
  user_id?: string;
  name: string;
  race: string;
  class: string;
  subclass?: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  
  // Ability Scores
  abilityScores: AbilityScores;
  
  // Combat Stats
  maxHp: number;
  currentHp: number;
  tempHp: number;
  ac: number;
  initiative: number;
  speed: number;
  proficiencyBonus: number;
  inspiration: boolean;
  
  // Saving Throws
  savingThrows: SavingThrow[];
  
  // Skills
  skills: Skill[];
  
  // Passives
  passivePerception: number;
  passiveInvestigation: number;
  passiveInsight: number;
  
  // Proficiencies
  proficiencies: {
    armor: string[];
    weapons: string[];
    tools: string[];
    languages: string[];
  };
  
  // Combat
  attacks: Attack[];
  
  // Spells
  spellcastingAbility: 'INT' | 'WIS' | 'CHA';
  spellSaveDc: number;
  spellAttackBonus: number;
  spellSlots: SpellSlot[];
  spells: Spell[];
  
  // Inventory
  inventory: InventoryItem[];
  cp: number;
  sp: number;
  ep: number;
  gp: number;
  pp: number;
  
  // Features
  features: Feature[];
  
  // Description
  personalityTraits: string;
  ideals: string;
  bonds: string;
  flaws: string;
  appearance: string;
  backstory: string;
  
  // Metadata
  created_at?: string;
  updated_at?: string;
}

export const DEFAULT_SKILLS: Omit<Skill, 'proficient' | 'bonus'>[] = [
  { name: 'Acrobatics', ability: 'DEX' },
  { name: 'Animal Handling', ability: 'WIS' },
  { name: 'Arcana', ability: 'INT' },
  { name: 'Athletics', ability: 'STR' },
  { name: 'Deception', ability: 'CHA' },
  { name: 'History', ability: 'INT' },
  { name: 'Insight', ability: 'WIS' },
  { name: 'Intimidation', ability: 'CHA' },
  { name: 'Investigation', ability: 'INT' },
  { name: 'Medicine', ability: 'WIS' },
  { name: 'Nature', ability: 'INT' },
  { name: 'Perception', ability: 'WIS' },
  { name: 'Performance', ability: 'CHA' },
  { name: 'Persuasion', ability: 'CHA' },
  { name: 'Religion', ability: 'INT' },
  { name: 'Sleight of Hand', ability: 'DEX' },
  { name: 'Stealth', ability: 'DEX' },
  { name: 'Survival', ability: 'WIS' },
];

export const calculateModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

export const calculateProficiencyBonus = (level: number): number => {
  return Math.floor((level - 1) / 4) + 2;
};

export const createDefaultCharacter = (): Character => {
  const level = 1;
  const proficiencyBonus = calculateProficiencyBonus(level);
  
  const abilityScores: AbilityScores = {
    strength: { score: 10, modifier: 0 },
    dexterity: { score: 10, modifier: 0 },
    constitution: { score: 10, modifier: 0 },
    intelligence: { score: 10, modifier: 0 },
    wisdom: { score: 10, modifier: 0 },
    charisma: { score: 10, modifier: 0 },
  };
  
  const skills: Skill[] = DEFAULT_SKILLS.map(skill => ({
    ...skill,
    proficient: false,
    bonus: abilityScores[skill.ability.toLowerCase() as keyof AbilityScores].modifier,
  }));
  
  const savingThrows: SavingThrow[] = [
    { ability: 'STR', proficient: false, bonus: 0 },
    { ability: 'DEX', proficient: false, bonus: 0 },
    { ability: 'CON', proficient: false, bonus: 0 },
    { ability: 'INT', proficient: false, bonus: 0 },
    { ability: 'WIS', proficient: false, bonus: 0 },
    { ability: 'CHA', proficient: false, bonus: 0 },
  ];
  
  return {
    name: 'New Character',
    race: 'Human',
    class: 'Fighter',
    level,
    xp: 0,
    xpToNextLevel: 300,
    abilityScores,
    maxHp: 10,
    currentHp: 10,
    tempHp: 0,
    ac: 10,
    initiative: 0,
    speed: 30,
    proficiencyBonus,
    inspiration: false,
    savingThrows,
    skills,
    passivePerception: 10,
    passiveInvestigation: 10,
    passiveInsight: 10,
    proficiencies: {
      armor: [],
      weapons: [],
      tools: [],
      languages: ['Common'],
    },
    attacks: [],
    spellcastingAbility: 'INT',
    spellSaveDc: 8 + proficiencyBonus,
    spellAttackBonus: proficiencyBonus,
    spellSlots: [
      { level: 1, max: 0, used: 0 },
      { level: 2, max: 0, used: 0 },
      { level: 3, max: 0, used: 0 },
      { level: 4, max: 0, used: 0 },
      { level: 5, max: 0, used: 0 },
      { level: 6, max: 0, used: 0 },
      { level: 7, max: 0, used: 0 },
      { level: 8, max: 0, used: 0 },
      { level: 9, max: 0, used: 0 },
    ],
    spells: [],
    inventory: [],
    cp: 0,
    sp: 0,
    ep: 0,
    gp: 0,
    pp: 0,
    features: [],
    personalityTraits: '',
    ideals: '',
    bonds: '',
    flaws: '',
    appearance: '',
    backstory: '',
  };
};
