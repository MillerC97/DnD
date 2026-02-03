import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import { 
  Dices, 
  User, 
  BookOpen,
  Menu,
  X,
  Github,
  Sparkles,
  Heart,
  Shield,
  Zap,
  Footprints,
  Star
} from 'lucide-react';
import { CharacterList } from '@/components/dnd/CharacterList';
import { DiceRoller } from '@/components/dnd/DiceRoller';
import { ChatInterface } from '@/components/dnd/ChatInterface';
import { CharacterCreator } from '@/components/dnd/CharacterCreator';
import './App.css';

// Simple character type
export interface Character {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  maxHp: number;
  currentHp: number;
  tempHp: number;
  ac: number;
  initiative: number;
  speed: number;
  proficiencyBonus: number;
  inspiration: boolean;
  abilityScores: {
    strength: { score: number; modifier: number };
    dexterity: { score: number; modifier: number };
    constitution: { score: number; modifier: number };
    intelligence: { score: number; modifier: number };
    wisdom: { score: number; modifier: number };
    charisma: { score: number; modifier: number };
  };
  skills: { name: string; ability: string; proficient: boolean; bonus: number }[];
  savingThrows: { ability: string; proficient: boolean; bonus: number }[];
  proficiencies: {
    armor: string[];
    weapons: string[];
    tools: string[];
    languages: string[];
  };
  spells: { id: string; name: string; level: number; school: string; prepared: boolean }[];
  inventory: { id: string; name: string; quantity: number }[];
  gp: number;
  features: { name: string; source: string; description: string }[];
}

// Sample character based on Alder
const sampleCharacter: Character = {
  id: '1',
  name: 'Alder',
  race: 'Dragonborn',
  class: 'Wizard',
  level: 1,
  maxHp: 8,
  currentHp: 8,
  tempHp: 0,
  ac: 9,
  initiative: -1,
  speed: 30,
  proficiencyBonus: 2,
  inspiration: false,
  abilityScores: {
    strength: { score: 16, modifier: 3 },
    dexterity: { score: 9, modifier: -1 },
    constitution: { score: 15, modifier: 2 },
    intelligence: { score: 11, modifier: 0 },
    wisdom: { score: 16, modifier: 3 },
    charisma: { score: 14, modifier: 2 },
  },
  skills: [
    { name: 'Acrobatics', ability: 'DEX', proficient: false, bonus: -1 },
    { name: 'Arcana', ability: 'INT', proficient: true, bonus: 2 },
    { name: 'Athletics', ability: 'STR', proficient: false, bonus: 3 },
    { name: 'Insight', ability: 'WIS', proficient: false, bonus: 3 },
    { name: 'Investigation', ability: 'INT', proficient: true, bonus: 2 },
    { name: 'Perception', ability: 'WIS', proficient: false, bonus: 3 },
    { name: 'Stealth', ability: 'DEX', proficient: false, bonus: -1 },
  ],
  savingThrows: [
    { ability: 'STR', proficient: false, bonus: 3 },
    { ability: 'DEX', proficient: false, bonus: -1 },
    { ability: 'CON', proficient: false, bonus: 2 },
    { ability: 'INT', proficient: true, bonus: 2 },
    { ability: 'WIS', proficient: true, bonus: 5 },
    { ability: 'CHA', proficient: false, bonus: 2 },
  ],
  proficiencies: {
    armor: ['None'],
    weapons: ['Simple Weapons'],
    tools: ['Alchemist\'s Supplies', 'Vehicles (Land)'],
    languages: ['Common', 'Draconic'],
  },
  spells: [
    { id: '1', name: 'Fire Bolt', level: 0, school: 'Evocation', prepared: true },
    { id: '2', name: 'Mage Hand', level: 0, school: 'Conjuration', prepared: true },
    { id: '3', name: 'Magic Missile', level: 1, school: 'Evocation', prepared: true },
    { id: '4', name: 'Shield', level: 1, school: 'Abjuration', prepared: true },
  ],
  inventory: [
    { id: '1', name: 'Spellbook', quantity: 1 },
    { id: '2', name: 'Component Pouch', quantity: 1 },
    { id: '3', name: 'Dagger', quantity: 1 },
  ],
  gp: 10,
  features: [
    { name: 'Draconic Ancestry', source: 'Dragonborn', description: 'You have draconic ancestry.' },
    { name: 'Breath Weapon', source: 'Dragonborn', description: 'You can use your breath weapon.' },
    { name: 'Spellcasting', source: 'Wizard', description: 'You can cast wizard spells.' },
    { name: 'Arcane Recovery', source: 'Wizard', description: 'Recover spell slots on short rest.' },
  ],
};

export const createDefaultCharacter = (): Character => ({
  id: '',
  name: 'New Character',
  race: 'Human',
  class: 'Fighter',
  level: 1,
  maxHp: 10,
  currentHp: 10,
  tempHp: 0,
  ac: 10,
  initiative: 0,
  speed: 30,
  proficiencyBonus: 2,
  inspiration: false,
  abilityScores: {
    strength: { score: 10, modifier: 0 },
    dexterity: { score: 10, modifier: 0 },
    constitution: { score: 10, modifier: 0 },
    intelligence: { score: 10, modifier: 0 },
    wisdom: { score: 10, modifier: 0 },
    charisma: { score: 10, modifier: 0 },
  },
  skills: [],
  savingThrows: [
    { ability: 'STR', proficient: false, bonus: 0 },
    { ability: 'DEX', proficient: false, bonus: 0 },
    { ability: 'CON', proficient: false, bonus: 0 },
    { ability: 'INT', proficient: false, bonus: 0 },
    { ability: 'WIS', proficient: false, bonus: 0 },
    { ability: 'CHA', proficient: false, bonus: 0 },
  ],
  proficiencies: {
    armor: [],
    weapons: [],
    tools: [],
    languages: ['Common'],
  },
  spells: [],
  inventory: [],
  gp: 0,
  features: [],
});

function App() {
  const [characters, setCharacters] = useState<Character[]>([sampleCharacter]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(sampleCharacter);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('character');

  const handleCreateCharacter = (newCharacter: Character) => {
    const characterWithId = { ...newCharacter, id: Date.now().toString() };
    setCharacters(prev => [characterWithId, ...prev]);
    setSelectedCharacter(characterWithId);
    setIsCreatorOpen(false);
  };

  const handleUpdateCharacter = (updatedCharacter: Character) => {
    setSelectedCharacter(updatedCharacter);
    setCharacters(prev => 
      prev.map(c => c.id === updatedCharacter.id ? updatedCharacter : c)
    );
  };

  const handleSelectCharacter = (character: Character) => {
    setSelectedCharacter(character);
    setMobileMenuOpen(false);
  };

  const adjustHp = (amount: number) => {
    if (!selectedCharacter) return;
    const newHp = Math.max(0, Math.min(selectedCharacter.maxHp, selectedCharacter.currentHp + amount));
    handleUpdateCharacter({ ...selectedCharacter, currentHp: newHp });
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dices className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold hidden sm:block">D&D Dungeon Master</h1>
              <h1 className="text-lg font-bold sm:hidden">D&D DM</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/MillerC97/DnD"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-14 z-40 bg-background border-b">
          <div className="p-4 space-y-4">
            <CharacterList
              characters={characters}
              onSelectCharacter={handleSelectCharacter}
              onCreateCharacter={() => setIsCreatorOpen(true)}
              selectedCharacterId={selectedCharacter?.id}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar - Character List (Desktop) */}
          <div className="hidden lg:block lg:col-span-3 space-y-4">
            <CharacterList
              characters={characters}
              onSelectCharacter={handleSelectCharacter}
              onCreateCharacter={() => setIsCreatorOpen(true)}
              selectedCharacterId={selectedCharacter?.id}
            />
            <DiceRoller />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            {selectedCharacter ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="character" className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Character</span>
                  </TabsTrigger>
                  <TabsTrigger value="play" className="flex items-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    <span className="hidden sm:inline">Play</span>
                  </TabsTrigger>
                  <TabsTrigger value="dice" className="flex items-center gap-1 lg:hidden">
                    <Dices className="h-4 w-4" />
                    <span>Dice</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="character" className="mt-4">
                  {/* Character Sheet */}
                  <div className="space-y-4">
                    {/* Header Card */}
                    <div className="bg-card rounded-lg border p-4">
                      <h2 className="text-2xl font-bold">{selectedCharacter.name}</h2>
                      <p className="text-muted-foreground">
                        Level {selectedCharacter.level} {selectedCharacter.race} {selectedCharacter.class}
                      </p>
                    </div>

                    {/* Combat Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="bg-card rounded-lg border p-3 text-center">
                        <Heart className="h-5 w-5 text-red-500 mx-auto mb-1" />
                        <p className="text-xs text-muted-foreground">HP</p>
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => adjustHp(-1)}>-</Button>
                          <span className="text-lg font-bold">{selectedCharacter.currentHp}/{selectedCharacter.maxHp}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => adjustHp(1)}>+</Button>
                        </div>
                      </div>
                      <div className="bg-card rounded-lg border p-3 text-center">
                        <Shield className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                        <p className="text-xs text-muted-foreground">AC</p>
                        <p className="text-lg font-bold">{selectedCharacter.ac}</p>
                      </div>
                      <div className="bg-card rounded-lg border p-3 text-center">
                        <Zap className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                        <p className="text-xs text-muted-foreground">Initiative</p>
                        <p className="text-lg font-bold">{selectedCharacter.initiative >= 0 ? '+' : ''}{selectedCharacter.initiative}</p>
                      </div>
                      <div className="bg-card rounded-lg border p-3 text-center">
                        <Footprints className="h-5 w-5 text-green-500 mx-auto mb-1" />
                        <p className="text-xs text-muted-foreground">Speed</p>
                        <p className="text-lg font-bold">{selectedCharacter.speed} ft</p>
                      </div>
                    </div>

                    {/* Ability Scores */}
                    <div className="bg-card rounded-lg border p-4">
                      <h3 className="font-medium mb-3 flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Ability Scores
                      </h3>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        {Object.entries(selectedCharacter.abilityScores).map(([ability, stats]) => (
                          <div key={ability} className="bg-muted rounded-lg p-2 text-center">
                            <p className="text-xs text-muted-foreground uppercase">{ability.slice(0, 3)}</p>
                            <p className="text-xl font-bold">{stats.score}</p>
                            <span className={`text-xs px-2 py-0.5 rounded ${stats.modifier >= 0 ? 'bg-primary text-primary-foreground' : 'bg-destructive text-destructive-foreground'}`}>
                              {stats.modifier >= 0 ? '+' : ''}{stats.modifier}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Skills & Saves */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-card rounded-lg border p-4">
                        <h3 className="font-medium mb-3">Skills</h3>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {selectedCharacter.skills.map((skill) => (
                            <div key={skill.name} className="flex justify-between items-center p-2 bg-muted rounded">
                              <span className="text-sm">{skill.name} <span className="text-muted-foreground text-xs">({skill.ability})</span></span>
                              <span className={`text-sm font-medium ${skill.bonus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {skill.bonus >= 0 ? '+' : ''}{skill.bonus}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-card rounded-lg border p-4">
                        <h3 className="font-medium mb-3">Saving Throws</h3>
                        <div className="space-y-1">
                          {selectedCharacter.savingThrows.map((save) => (
                            <div key={save.ability} className="flex justify-between items-center p-2 bg-muted rounded">
                              <span className="text-sm">{save.ability}</span>
                              <span className={`text-sm font-medium ${save.bonus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {save.bonus >= 0 ? '+' : ''}{save.bonus}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Spells */}
                    <div className="bg-card rounded-lg border p-4">
                      <h3 className="font-medium mb-3">Spells</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {selectedCharacter.spells.map((spell) => (
                          <div key={spell.id} className="flex justify-between items-center p-2 bg-muted rounded">
                            <span className="text-sm">{spell.name}</span>
                            <div className="flex gap-1">
                              <span className="text-xs text-muted-foreground">{spell.school}</span>
                              {spell.prepared && <span className="text-xs bg-primary text-primary-foreground px-1 rounded">P</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Inventory */}
                    <div className="bg-card rounded-lg border p-4">
                      <h3 className="font-medium mb-3">Inventory</h3>
                      <div className="space-y-1">
                        {selectedCharacter.inventory.map((item) => (
                          <div key={item.id} className="flex justify-between items-center p-2 bg-muted rounded">
                            <span className="text-sm">{item.name}</span>
                            <span className="text-sm text-muted-foreground">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">GP: {selectedCharacter.gp}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="play" className="mt-4">
                  <div className="h-[calc(100vh-200px)] min-h-[500px]">
                    <ChatInterface character={selectedCharacter} />
                  </div>
                </TabsContent>

                <TabsContent value="dice" className="mt-4 lg:hidden">
                  <DiceRoller />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex flex-col items-center justify-center h-96">
                <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">No Character Selected</h2>
                <p className="text-muted-foreground mb-6 text-center max-w-md">
                  Create a new character or select an existing one to start your adventure!
                </p>
                <Button onClick={() => setIsCreatorOpen(true)} size="lg">
                  <User className="h-5 w-5 mr-2" />
                  Create Your First Character
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Character Creator Dialog */}
      <CharacterCreator
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        onCreate={handleCreateCharacter}
      />
    </div>
  );
}

export default App;
