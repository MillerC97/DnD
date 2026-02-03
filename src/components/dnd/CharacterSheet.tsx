import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  Shield, 
  Zap, 
  Footprints, 
  Star, 
  Sword, 
  Sparkles,
  Backpack,
  Scroll,
  Minus,
  Plus,
  Edit2,
  Check,
  X
} from 'lucide-react';
import type { Character, AbilityScores } from '@/types/character';
import { calculateModifier, calculateProficiencyBonus } from '@/types/character';

interface CharacterSheetProps {
  character: Character;
  onUpdate: (character: Character) => void;
  onSave: () => void;
}

export function CharacterSheet({ character, onUpdate, onSave }: CharacterSheetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCharacter, setEditedCharacter] = useState<Character>(character);

  const handleAbilityChange = (ability: keyof AbilityScores, score: number) => {
    const modifier = calculateModifier(score);
    setEditedCharacter(prev => ({
      ...prev,
      abilityScores: {
        ...prev.abilityScores,
        [ability]: { score, modifier },
      },
    }));
  };

  const handleSkillToggle = (skillName: string) => {
    setEditedCharacter(prev => ({
      ...prev,
      skills: prev.skills.map(skill => {
        if (skill.name === skillName) {
          const baseModifier = prev.abilityScores[skill.ability.toLowerCase() as keyof AbilityScores].modifier;
          const newProficient = !skill.proficient;
          return {
            ...skill,
            proficient: newProficient,
            bonus: baseModifier + (newProficient ? prev.proficiencyBonus : 0),
          };
        }
        return skill;
      }),
    }));
  };

  const handleSaveToggle = (ability: string) => {
    setEditedCharacter(prev => ({
      ...prev,
      savingThrows: prev.savingThrows.map(save => {
        if (save.ability === ability) {
          const baseModifier = prev.abilityScores[ability.toLowerCase() as keyof AbilityScores].modifier;
          const newProficient = !save.proficient;
          return {
            ...save,
            proficient: newProficient,
            bonus: baseModifier + (newProficient ? prev.proficiencyBonus : 0),
          };
        }
        return save;
      }),
    }));
  };

  const adjustHp = (amount: number) => {
    setEditedCharacter(prev => ({
      ...prev,
      currentHp: Math.max(0, Math.min(prev.maxHp, prev.currentHp + amount)),
    }));
  };

  const handleSave = () => {
    onUpdate(editedCharacter);
    setIsEditing(false);
    onSave();
  };

  const handleCancel = () => {
    setEditedCharacter(character);
    setIsEditing(false);
  };

  const displayCharacter = isEditing ? editedCharacter : character;

  const AbilityBox = ({ ability, label }: { ability: keyof AbilityScores; label: string }) => {
    const { score, modifier } = displayCharacter.abilityScores[ability];
    return (
      <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
        <span className="text-xs text-muted-foreground uppercase">{label}</span>
        {isEditing ? (
          <Input
            type="number"
            value={score}
            onChange={(e) => handleAbilityChange(ability, parseInt(e.target.value) || 0)}
            className="w-16 text-center text-lg font-bold mt-1"
            min={1}
            max={30}
          />
        ) : (
          <>
            <span className="text-2xl font-bold">{score}</span>
            <Badge variant={modifier >= 0 ? 'default' : 'destructive'} className="mt-1">
              {modifier >= 0 ? '+' : ''}{modifier}
            </Badge>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={editedCharacter.name}
                    onChange={(e) => setEditedCharacter(prev => ({ ...prev, name: e.target.value }))}
                    className="text-xl font-bold"
                    placeholder="Character Name"
                  />
                  <div className="flex gap-2">
                    <Input
                      value={editedCharacter.race}
                      onChange={(e) => setEditedCharacter(prev => ({ ...prev, race: e.target.value }))}
                      placeholder="Race"
                      className="text-sm"
                    />
                    <Input
                      value={editedCharacter.class}
                      onChange={(e) => setEditedCharacter(prev => ({ ...prev, class: e.target.value }))}
                      placeholder="Class"
                      className="text-sm"
                    />
                    <Input
                      type="number"
                      value={editedCharacter.level}
                      onChange={(e) => {
                        const level = parseInt(e.target.value) || 1;
                        setEditedCharacter(prev => ({
                          ...prev,
                          level,
                          proficiencyBonus: calculateProficiencyBonus(level),
                        }));
                      }}
                      placeholder="Level"
                      className="w-20 text-sm"
                      min={1}
                      max={20}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold">{character.name}</h1>
                  <p className="text-muted-foreground">
                    Level {character.level} {character.race} {character.class}
                  </p>
                </>
              )}
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button size="sm" variant="default" onClick={handleSave}>
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>

          {/* XP Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>XP: {character.xp}</span>
              <span>Next: {character.xpToNextLevel}</span>
            </div>
            <Progress value={(character.xp / character.xpToNextLevel) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Combat Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Card>
          <CardContent className="p-3 flex flex-col items-center">
            <Heart className="h-5 w-5 text-red-500 mb-1" />
            <span className="text-xs text-muted-foreground">HP</span>
            <div className="flex items-center gap-1">
              {isEditing && (
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => adjustHp(-1)}>
                  <Minus className="h-3 w-3" />
                </Button>
              )}
              <span className="text-lg font-bold">
                {displayCharacter.currentHp}/{displayCharacter.maxHp}
              </span>
              {isEditing && (
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => adjustHp(1)}>
                  <Plus className="h-3 w-3" />
                </Button>
              )}
            </div>
            {displayCharacter.tempHp > 0 && (
              <Badge variant="outline" className="text-xs mt-1">
                +{displayCharacter.tempHp} temp
              </Badge>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex flex-col items-center">
            <Shield className="h-5 w-5 text-blue-500 mb-1" />
            <span className="text-xs text-muted-foreground">AC</span>
            <span className="text-lg font-bold">{displayCharacter.ac}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex flex-col items-center">
            <Zap className="h-5 w-5 text-yellow-500 mb-1" />
            <span className="text-xs text-muted-foreground">Initiative</span>
            <span className="text-lg font-bold">
              {displayCharacter.initiative >= 0 ? '+' : ''}{displayCharacter.initiative}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex flex-col items-center">
            <Footprints className="h-5 w-5 text-green-500 mb-1" />
            <span className="text-xs text-muted-foreground">Speed</span>
            <span className="text-lg font-bold">{displayCharacter.speed} ft</span>
          </CardContent>
        </Card>
      </div>

      {/* Ability Scores */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Star className="h-4 w-4" />
            Ability Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            <AbilityBox ability="strength" label="STR" />
            <AbilityBox ability="dexterity" label="DEX" />
            <AbilityBox ability="constitution" label="CON" />
            <AbilityBox ability="intelligence" label="INT" />
            <AbilityBox ability="wisdom" label="WIS" />
            <AbilityBox ability="charisma" label="CHA" />
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Skills, Saves, etc. */}
      <Tabs defaultValue="skills" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="saves">Saves</TabsTrigger>
          <TabsTrigger value="combat">Combat</TabsTrigger>
          <TabsTrigger value="spells">Spells</TabsTrigger>
        </TabsList>

        <TabsContent value="skills" className="mt-2">
          <Card>
            <CardContent className="p-2">
              <ScrollArea className="h-64">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  {displayCharacter.skills.map((skill) => (
                    <div
                      key={skill.name}
                      className={`flex items-center justify-between p-2 rounded ${
                        isEditing ? 'cursor-pointer hover:bg-muted' : ''
                      }`}
                      onClick={() => isEditing && handleSkillToggle(skill.name)}
                    >
                      <div className="flex items-center gap-2">
                        {isEditing && (
                          <div className={`w-4 h-4 rounded border ${skill.proficient ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                            {skill.proficient && <Check className="w-4 h-4 text-primary-foreground" />}
                          </div>
                        )}
                        {!isEditing && skill.proficient && (
                          <Badge variant="secondary" className="text-xs">P</Badge>
                        )}
                        <span className="text-sm">{skill.name}</span>
                        <span className="text-xs text-muted-foreground">({skill.ability})</span>
                      </div>
                      <Badge variant={skill.bonus >= 0 ? 'default' : 'destructive'}>
                        {skill.bonus >= 0 ? '+' : ''}{skill.bonus}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saves" className="mt-2">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {displayCharacter.savingThrows.map((save) => (
                  <div
                    key={save.ability}
                    className={`flex items-center justify-between p-3 bg-muted rounded-lg ${
                      isEditing ? 'cursor-pointer hover:bg-muted/80' : ''
                    }`}
                    onClick={() => isEditing && handleSaveToggle(save.ability)}
                  >
                    <div className="flex items-center gap-2">
                      {isEditing && (
                        <div className={`w-4 h-4 rounded border ${save.proficient ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                          {save.proficient && <Check className="w-4 h-4 text-primary-foreground" />}
                        </div>
                      )}
                      {!isEditing && save.proficient && (
                        <Badge variant="secondary" className="text-xs">P</Badge>
                      )}
                      <span className="font-medium">{save.ability}</span>
                    </div>
                    <Badge variant={save.bonus >= 0 ? 'default' : 'destructive'} className="text-lg">
                      {save.bonus >= 0 ? '+' : ''}{save.bonus}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="combat" className="mt-2">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Sword className="h-4 w-4" />
                  Attacks
                </h4>
                {character.attacks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No attacks added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {character.attacks.map((attack, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div>
                          <span className="font-medium">{attack.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">{attack.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">+{attack.hitBonus} to hit</Badge>
                          <Badge>{attack.damage} {attack.damageType}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Proficiencies</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Armor:</span>{' '}
                    {character.proficiencies.armor.length > 0 ? character.proficiencies.armor.join(', ') : 'None'}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Weapons:</span>{' '}
                    {character.proficiencies.weapons.length > 0 ? character.proficiencies.weapons.join(', ') : 'None'}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tools:</span>{' '}
                    {character.proficiencies.tools.length > 0 ? character.proficiencies.tools.join(', ') : 'None'}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Languages:</span>{' '}
                    {character.proficiencies.languages.join(', ')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spells" className="mt-2">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-sm text-muted-foreground">Spell Save DC</span>
                  <p className="text-xl font-bold">{character.spellSaveDc}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Spell Attack</span>
                  <p className="text-xl font-bold">+{character.spellAttackBonus}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Ability</span>
                  <p className="text-xl font-bold">{character.spellcastingAbility}</p>
                </div>
              </div>

              <Separator className="my-4" />

              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Spells Known
                </h4>
                {character.spells.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No spells added yet.</p>
                ) : (
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      {character.spells.map((spell) => (
                        <div key={spell.id} className="p-2 bg-muted rounded">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{spell.name}</span>
                            <div className="flex gap-1">
                              <Badge variant="outline">Level {spell.level}</Badge>
                              {spell.prepared && <Badge>Prepared</Badge>}
                              {spell.ritual && <Badge variant="secondary">Ritual</Badge>}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {spell.school} • {spell.castingTime} • {spell.range}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Inventory & Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Backpack className="h-4 w-4" />
              Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              {character.inventory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No items in inventory.</p>
              ) : (
                <div className="space-y-1">
                  {character.inventory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span>{item.name}</span>
                      <span className="text-muted-foreground">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            <Separator className="my-2" />
            <div className="flex justify-between text-sm">
              <span>GP: {character.gp}</span>
              <span>SP: {character.sp}</span>
              <span>CP: {character.cp}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Scroll className="h-4 w-4" />
              Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              {character.features.length === 0 ? (
                <p className="text-sm text-muted-foreground">No features added yet.</p>
              ) : (
                <div className="space-y-2">
                  {character.features.map((feature, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{feature.name}</span>
                      <span className="text-xs text-muted-foreground ml-1">({feature.source})</span>
                      {feature.uses && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {feature.uses.current}/{feature.uses.max} {feature.uses.reset}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
