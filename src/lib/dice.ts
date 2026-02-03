export type DieType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';

export interface DiceRoll {
  count: number;
  die: DieType;
  modifier: number;
  results: number[];
  total: number;
  critical?: 'success' | 'fail';
}

export const rollDie = (sides: number): number => {
  return Math.floor(Math.random() * sides) + 1;
};

export const parseDiceNotation = (notation: string): { count: number; die: number; modifier: number } | null => {
  const match = notation.match(/^(\d+)?d(\d+)([+-]\d+)?$/i);
  if (!match) return null;
  
  return {
    count: parseInt(match[1]) || 1,
    die: parseInt(match[2]),
    modifier: match[3] ? parseInt(match[3]) : 0,
  };
};

export const rollDice = (notation: string): DiceRoll | null => {
  const parsed = parseDiceNotation(notation);
  if (!parsed) return null;
  
  const { count, die, modifier } = parsed;
  const results: number[] = [];
  
  for (let i = 0; i < count; i++) {
    results.push(rollDie(die));
  }
  
  const sum = results.reduce((a, b) => a + b, 0);
  const total = sum + modifier;
  
  // Check for critical success/fail on d20
  let critical: 'success' | 'fail' | undefined;
  if (die === 20 && count === 1) {
    if (results[0] === 20) critical = 'success';
    if (results[0] === 1) critical = 'fail';
  }
  
  const dieMap: Record<number, DieType> = {
    4: 'd4',
    6: 'd6',
    8: 'd8',
    10: 'd10',
    12: 'd12',
    20: 'd20',
    100: 'd100',
  };
  
  return {
    count,
    die: dieMap[die] || 'd20',
    modifier,
    results,
    total,
    critical,
  };
};

export const rollD20 = (advantage: boolean = false, disadvantage: boolean = false): DiceRoll => {
  if (advantage && disadvantage) {
    // Cancel each other out
    return rollDice('1d20')!;
  }
  
  if (advantage) {
    const roll1 = rollDie(20);
    const roll2 = rollDie(20);
    const higher = Math.max(roll1, roll2);
    return {
      count: 2,
      die: 'd20',
      modifier: 0,
      results: [roll1, roll2],
      total: higher,
      critical: higher === 20 ? 'success' : higher === 1 ? 'fail' : undefined,
    };
  }
  
  if (disadvantage) {
    const roll1 = rollDie(20);
    const roll2 = rollDie(20);
    const lower = Math.min(roll1, roll2);
    return {
      count: 2,
      die: 'd20',
      modifier: 0,
      results: [roll1, roll2],
      total: lower,
      critical: lower === 20 ? 'success' : lower === 1 ? 'fail' : undefined,
    };
  }
  
  return rollDice('1d20')!;
};

export const formatRollResult = (roll: DiceRoll): string => {
  const modifierStr = roll.modifier > 0 ? `+${roll.modifier}` : roll.modifier < 0 ? `${roll.modifier}` : '';
  const resultsStr = roll.results.join(', ');
  
  if (roll.count === 1) {
    return `${roll.results[0]}${modifierStr} = ${roll.total}`;
  }
  
  return `[${resultsStr}]${modifierStr} = ${roll.total}`;
};

export const rollAbilityCheck = (modifier: number, advantage: boolean = false, disadvantage: boolean = false): DiceRoll => {
  const roll = rollD20(advantage, disadvantage);
  roll.modifier = modifier;
  roll.total = roll.results.reduce((a, b) => advantage || disadvantage ? Math.max(a, b) : a + b, 0) + modifier;
  if (advantage || disadvantage) {
    roll.total = Math.max(...roll.results) + modifier;
    if (disadvantage) {
      roll.total = Math.min(...roll.results) + modifier;
    }
  }
  return roll;
};

export const rollDamage = (notation: string): DiceRoll | null => {
  return rollDice(notation);
};
