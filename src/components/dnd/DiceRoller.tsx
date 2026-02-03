import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dices, Trash2, Plus, Minus } from 'lucide-react';
import { rollDice, rollD20, type DiceRoll, type DieType } from '@/lib/dice';

interface RollHistory {
  id: string;
  roll: DiceRoll;
  label: string;
  timestamp: Date;
}

const DICE_TYPES: { type: DieType; sides: number; color: string }[] = [
  { type: 'd4', sides: 4, color: 'bg-red-500' },
  { type: 'd6', sides: 6, color: 'bg-orange-500' },
  { type: 'd8', sides: 8, color: 'bg-yellow-500' },
  { type: 'd10', sides: 10, color: 'bg-green-500' },
  { type: 'd12', sides: 12, color: 'bg-blue-500' },
  { type: 'd20', sides: 20, color: 'bg-purple-500' },
  { type: 'd100', sides: 100, color: 'bg-pink-500' },
];

export function DiceRoller() {
  const [history, setHistory] = useState<RollHistory[]>([]);
  const [modifier, setModifier] = useState(0);
  const [diceCount, setDiceCount] = useState<Record<DieType, number>>({
    d4: 1,
    d6: 1,
    d8: 1,
    d10: 1,
    d12: 1,
    d20: 1,
    d100: 1,
  });

  const addRoll = useCallback((roll: DiceRoll, label: string) => {
    const newRoll: RollHistory = {
      id: Math.random().toString(36).substr(2, 9),
      roll,
      label,
      timestamp: new Date(),
    };
    setHistory(prev => [newRoll, ...prev].slice(0, 20));
  }, []);

  const rollDie = useCallback((type: DieType) => {
    const count = diceCount[type];
    const sides = DICE_TYPES.find(d => d.type === type)?.sides || 20;
    const notation = `${count}d${sides}${modifier !== 0 ? (modifier > 0 ? '+' : '') + modifier : ''}`;
    const roll = rollDice(notation);
    if (roll) {
      addRoll(roll, `${count}${type}`);
    }
  }, [diceCount, modifier, addRoll]);

  const rollD20WithModifier = useCallback((label: string) => {
    const notation = `1d20${modifier !== 0 ? (modifier > 0 ? '+' : '') + modifier : ''}`;
    const roll = rollDice(notation);
    if (roll) {
      addRoll(roll, label);
    }
  }, [modifier, addRoll]);

  const clearHistory = () => setHistory([]);

  const updateDiceCount = (type: DieType, delta: number) => {
    setDiceCount(prev => ({
      ...prev,
      [type]: Math.max(1, Math.min(10, prev[type] + delta)),
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Dices className="h-5 w-5" />
          Dice Roller
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Modifier Control */}
        <div className="flex items-center justify-between bg-muted rounded-lg p-3">
          <span className="text-sm font-medium">Modifier</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setModifier(prev => prev - 1)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className={`text-lg font-bold w-8 text-center ${modifier > 0 ? 'text-green-600' : modifier < 0 ? 'text-red-600' : ''}`}>
              {modifier > 0 ? '+' : ''}{modifier}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setModifier(prev => prev + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick D20 Rolls */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            onClick={() => rollD20WithModifier('Attack/Check')}
            className="text-xs"
          >
            d20 Roll
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const roll = rollD20(false, true);
              roll.modifier = modifier;
              roll.total = Math.min(...roll.results) + modifier;
              addRoll(roll, 'Disadvantage');
            }}
            className="text-xs"
          >
            Disadvantage
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const roll = rollD20(true, false);
              roll.modifier = modifier;
              roll.total = Math.max(...roll.results) + modifier;
              addRoll(roll, 'Advantage');
            }}
            className="text-xs"
          >
            Advantage
          </Button>
        </div>

        {/* Dice Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {DICE_TYPES.map(({ type, color }) => (
            <div key={type} className="flex flex-col gap-1">
              <div className="flex items-center justify-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => updateDiceCount(type, -1)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-xs font-medium w-4 text-center">
                  {diceCount[type]}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => updateDiceCount(type, 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <Button
                onClick={() => rollDie(type)}
                className={`${color} text-white hover:opacity-90 text-xs py-2`}
              >
                {type}
              </Button>
            </div>
          ))}
        </div>

        {/* Roll History */}
        {history.length > 0 && (
          <div className="border-t pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Recent Rolls</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearHistory}
                className="h-8 text-muted-foreground"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
            <ScrollArea className="h-40">
              <div className="space-y-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {item.label}
                      </Badge>
                      <span className="text-muted-foreground text-xs">
                        [{item.roll.results.join(', ')}]
                        {item.roll.modifier !== 0 && (
                          <span className={item.roll.modifier > 0 ? 'text-green-600' : 'text-red-600'}>
                            {item.roll.modifier > 0 ? '+' : ''}{item.roll.modifier}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.roll.critical && (
                        <Badge
                          variant={item.roll.critical === 'success' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {item.roll.critical === 'success' ? 'CRIT!' : 'FAIL!'}
                        </Badge>
                      )}
                      <span className="font-bold text-lg">{item.roll.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
