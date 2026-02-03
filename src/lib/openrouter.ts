import type { Character } from '@/types/character';

const OPENROUTER_API_KEY = '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';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const generateDMResponse = async (
  messages: ChatMessage[],
  character?: Character
): Promise<string> => {
  try {
    const systemPrompt = `You are an experienced Dungeons & Dragons Dungeon Master. You create engaging, immersive, and fair adventures for players.

${character ? `
Current Player Character:
Name: ${character.name}
Race: ${character.race}
Class: ${character.class} (Level ${character.level})
HP: ${character.currentHp}/${character.maxHp}
AC: ${character.ac}

Ability Scores:
- STR: ${character.abilityScores.strength.score} (${character.abilityScores.strength.modifier >= 0 ? '+' : ''}${character.abilityScores.strength.modifier})
- DEX: ${character.abilityScores.dexterity.score} (${character.abilityScores.dexterity.modifier >= 0 ? '+' : ''}${character.abilityScores.dexterity.modifier})
- CON: ${character.abilityScores.constitution.score} (${character.abilityScores.constitution.modifier >= 0 ? '+' : ''}${character.abilityScores.constitution.modifier})
- INT: ${character.abilityScores.intelligence.score} (${character.abilityScores.intelligence.modifier >= 0 ? '+' : ''}${character.abilityScores.intelligence.modifier})
- WIS: ${character.abilityScores.wisdom.score} (${character.abilityScores.wisdom.modifier >= 0 ? '+' : ''}${character.abilityScores.wisdom.modifier})
- CHA: ${character.abilityScores.charisma.score} (${character.abilityScores.charisma.modifier >= 0 ? '+' : ''}${character.abilityScores.charisma.modifier})

Incorporate this character's abilities and personality into the adventure when appropriate.
` : ''}

Rules:
1. Be descriptive and atmospheric in your storytelling
2. Ask for ability checks or saving throws when needed (format: "Roll a [ability] check" or "Make a [saving throw] saving throw")
3. Provide options for the player to choose from
4. Keep responses concise but engaging (2-4 paragraphs max)
5. When combat starts, track initiative and HP
6. Be fair and follow D&D 5e rules
7. Use dice notation when describing damage or random events (e.g., "1d6 damage", "1d20" for checks)`;

    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'D&D Dungeon Master',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        max_tokens: 1000,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'The DM is pondering...';
  } catch (error) {
    console.error('Error generating DM response:', error);
    return 'The magical connection to the DM seems to be disrupted. Please try again.';
  }
};

export const generateCharacterBackstory = async (
  race: string,
  characterClass: string,
  background: string
): Promise<string> => {
  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'D&D Dungeon Master',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'system',
            content: 'You are a creative D&D backstory writer. Create engaging, concise character backstories.',
          },
          {
            role: 'user',
            content: `Write a brief character backstory (2-3 paragraphs) for a ${race} ${characterClass} with a ${background} background. Include their motivation for adventuring and a personal flaw or secret.`,
          },
        ],
        max_tokens: 500,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate backstory');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating backstory:', error);
    return '';
  }
};

export const generateAdventureHook = async (character?: Character): Promise<string> => {
  try {
    const prompt = character
      ? `Create an exciting adventure hook for a level ${character.level} ${character.race} ${character.class} named ${character.name}. Make it personal to their character.`
      : 'Create an exciting adventure hook for a D&D party starting a new campaign.';

    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'D&D Dungeon Master',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'system',
            content: 'You are a creative D&D adventure writer. Create engaging adventure hooks.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 400,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate adventure hook');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating adventure hook:', error);
    return '';
  }
};
