import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Sword, ArrowLeft, Dice5 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createDefaultCharacter, type Character } from '@/App';

const RACES = [
  'Dragonborn', 'Dwarf', 'Elf', 'Gnome', 'Half-Elf', 'Half-Orc', 'Halfling', 'Human', 'Tiefling',
];

const CLASSES = [
  'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 'Paladin', 'Ranger', 
  'Rogue', 'Sorcerer', 'Warlock', 'Wizard', 'Artificer',
];

interface CharacterCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (character: Character) => void;
}

const calculateModifier = (score: number): number => Math.floor((score - 10) / 2);

const rollAbilityScore = () => {
  const rolls = [0, 0, 0, 0].map(() => Math.floor(Math.random() * 6) + 1);
  rolls.sort((a, b) => b - a);
  return rolls[0] + rolls[1] + rolls[2];
};

export function CharacterCreator({ isOpen, onClose, onCreate }: CharacterCreatorProps) {
  const [step, setStep] = useState(1);
  const [character, setCharacter] = useState<Character>(createDefaultCharacter());

  const rollAllStats = () => {
    const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const;
    const newScores = { ...character.abilityScores };
    
    abilities.forEach(ability => {
      const score = rollAbilityScore();
      newScores[ability] = { score, modifier: calculateModifier(score) };
    });

    setCharacter(prev => ({ ...prev, abilityScores: newScores }));
  };

  const handleAbilityChange = (ability: keyof Character['abilityScores'], score: number) => {
    setCharacter(prev => ({
      ...prev,
      abilityScores: {
        ...prev.abilityScores,
        [ability]: { score, modifier: calculateModifier(score) },
      },
    }));
  };

  const handleCreate = () => {
    onCreate(character);
    setStep(1);
    setCharacter(createDefaultCharacter());
  };

  const canProceed = () => {
    if (step === 1) {
      return character.name.trim() && character.race && character.class;
    }
    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Create New Character
          </DialogTitle>
          <DialogDescription>
            Step {step} of 3: {step === 1 ? 'Basic Info' : step === 2 ? 'Ability Scores' : 'Review'}
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="flex gap-1 mb-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full ${s <= step ? 'bg-primary' : 'bg-muted'}`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Character Name</Label>
              <Input
                id="name"
                value={character.name}
                onChange={(e) => setCharacter(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter character name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Race</Label>
                <Select
                  value={character.race}
                  onValueChange={(value) => setCharacter(prev => ({ ...prev, race: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select race" />
                  </SelectTrigger>
                  <SelectContent>
                    {RACES.map(race => (
                      <SelectItem key={race} value={race}>{race}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Class</Label>
                <Select
                  value={character.class}
                  onValueChange={(value) => setCharacter(prev => ({ ...prev, class: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASSES.map(cls => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Level</Label>
                <Input
                  type="number"
                  value={character.level}
                  onChange={(e) => setCharacter(prev => ({ 
                    ...prev, 
                    level: parseInt(e.target.value) || 1 
                  }))}
                  min={1}
                  max={20}
                />
              </div>
              <div>
                <Label>Max HP</Label>
                <Input
                  type="number"
                  value={character.maxHp}
                  onChange={(e) => setCharacter(prev => ({ 
                    ...prev, 
                    maxHp: parseInt(e.target.value) || 1,
                    currentHp: parseInt(e.target.value) || 1,
                  }))}
                  min={1}
                />
              </div>
            </div>

            <div>
              <Label>Armor Class</Label>
              <Input
                type="number"
                value={character.ac}
                onChange={(e) => setCharacter(prev => ({ 
                  ...prev, 
                  ac: parseInt(e.target.value) || 10 
                }))}
                min={1}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Ability Scores</h4>
              <Button variant="outline" size="sm" onClick={rollAllStats}>
                <Dice5 className="h-4 w-4 mr-1" />
                Roll All
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {(['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const).map((ability) => (
                <Card key={ability}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-xs uppercase text-muted-foreground">{ability}</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="number"
                            value={character.abilityScores[ability].score}
                            onChange={(e) => handleAbilityChange(ability, parseInt(e.target.value) || 10)}
                            className="w-20 text-lg font-bold"
                            min={1}
                            max={30}
                          />
                          <Badge 
                            variant={character.abilityScores[ability].modifier >= 0 ? 'default' : 'destructive'}
                            className="text-lg"
                          >
                            {character.abilityScores[ability].modifier >= 0 ? '+' : ''}
                            {character.abilityScores[ability].modifier}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAbilityChange(ability, rollAbilityScore())}
                      >
                        <Dice5 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-4">
              <h3 className="font-bold text-lg">{character.name}</h3>
              <p className="text-muted-foreground">Level {character.level} {character.race} {character.class}</p>
              <Separator className="my-2" />
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>HP: {character.maxHp}</div>
                <div>AC: {character.ac}</div>
                <div>Prof: +{character.proficiencyBonus}</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Your character is ready! Click Create to add them to your roster.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setStep(prev => prev - 1)}
            disabled={step === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>

          {step < 3 ? (
            <Button
              onClick={() => setStep(prev => prev + 1)}
              disabled={!canProceed()}
            >
              Next
            </Button>
          ) : (
            <Button onClick={handleCreate}>
              <Sword className="h-4 w-4 mr-1" />
              Create Character
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
