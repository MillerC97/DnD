import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, User, Sword, Heart, Shield } from 'lucide-react';
import type { Character } from '@/App';

interface CharacterListProps {
  characters: Character[];
  onSelectCharacter: (character: Character) => void;
  onCreateCharacter: () => void;
  selectedCharacterId?: string;
}

export function CharacterList({ 
  characters,
  onSelectCharacter, 
  onCreateCharacter, 
  selectedCharacterId,
}: CharacterListProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Your Characters
          </CardTitle>
          <Button size="sm" onClick={onCreateCharacter}>
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {characters.length === 0 ? (
          <div className="text-center py-6">
            <User className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
            <p className="mb-4 text-muted-foreground">No characters yet</p>
            <Button onClick={onCreateCharacter}>
              <Plus className="h-4 w-4 mr-1" />
              Create Character
            </Button>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {characters.map((character) => (
              <div
                key={character.id}
                onClick={() => onSelectCharacter(character)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedCharacterId === character.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{character.name}</h4>
                    <p className={`text-xs ${
                      selectedCharacterId === character.id
                        ? 'text-primary-foreground/80'
                        : 'text-muted-foreground'
                    }`}>
                      Level {character.level} {character.race} {character.class}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${
                    selectedCharacterId === character.id
                      ? 'text-primary-foreground/80'
                      : 'text-muted-foreground'
                  }`}>
                    <Heart className="h-3 w-3" />
                    {character.currentHp}/{character.maxHp}
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    AC {character.ac}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Sword className="h-3 w-3 mr-1" />
                    +{character.proficiencyBonus}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
