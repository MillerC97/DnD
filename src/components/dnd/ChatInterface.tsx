import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Sparkles, Scroll, Dices, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Character } from '@/App';

interface ChatInterfaceProps {
  character: Character;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'action' | 'speech' | 'dm' | 'player';
  content: string;
  timestamp: number;
}

// Parse user input for different command types
const parseInput = (input: string): { type: 'dm' | 'action' | 'speech' | 'player' | 'normal'; content: string; target?: string } => {
  const trimmed = input.trim();
  
  // DM command: /hey can I do this
  if (trimmed.startsWith('/')) {
    return { type: 'dm', content: trimmed.slice(1).trim() };
  }
  
  // Action: *I look around*
  if (trimmed.startsWith('*') && trimmed.endsWith('*')) {
    return { type: 'action', content: trimmed.slice(1, -1).trim() };
  }
  
  // Speech to NPC: "Hello Sir"
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return { type: 'speech', content: trimmed.slice(1, -1).trim() };
  }
  
  // Talking to another player: "Kimmel do you have..."
  // Check if it starts with a capitalized word (potential player name)
  const words = trimmed.split(' ');
  const firstWord = words[0];
  if (firstWord && firstWord[0] === firstWord[0].toUpperCase() && words.length > 1) {
    return { type: 'player', content: trimmed, target: firstWord };
  }
  
  return { type: 'normal', content: trimmed };
};

// Generate a smarter DM response based on context
const generateDMResponse = (input: string, _inputType: string, character: Character): string => {
  const lowerInput = input.toLowerCase();
  
  // Check for investigation/perception attempts
  if (lowerInput.includes('look') || lowerInput.includes('see') || lowerInput.includes('investigate') || lowerInput.includes('search') || lowerInput.includes('check') || lowerInput.includes('examine')) {
    const skill = lowerInput.includes('investigate') ? 'Investigation' : 
                  lowerInput.includes('insight') ? 'Insight' : 'Perception';
    const abilityMod = skill === 'Investigation' ? character.abilityScores.intelligence.modifier :
                       skill === 'Insight' ? character.abilityScores.wisdom.modifier :
                       character.abilityScores.wisdom.modifier;
    const totalBonus = abilityMod + (character.proficiencyBonus);
    
    return `**DM:** You want to take a closer look. Roll a **${skill}** check for me.\n\n*(Your bonus: ${totalBonus >= 0 ? '+' : ''}${totalBonus})*\n\nRoll a d20 and add your ${skill.toLowerCase()} bonus, or click the dice roller and tell me what you got!`;
  }
  
  // Check for combat/attack actions
  if (lowerInput.includes('attack') || lowerInput.includes('fight') || lowerInput.includes('hit') || lowerInput.includes('strike') || lowerInput.includes('shoot')) {
    return `**DM:** You ready yourself for combat! Roll an **attack roll** (d20 + your attack bonus) to see if you hit.\n\nThen tell me what weapon or spell you're using, and we'll roll damage!`;
  }
  
  // Check for stealth
  if (lowerInput.includes('sneak') || lowerInput.includes('hide') || lowerInput.includes('stealth')) {
    const bonus = character.abilityScores.dexterity.modifier + (character.proficiencyBonus);
    return `**DM:** Trying to stay hidden? Roll a **Stealth** check!\n\n*(Your bonus: ${bonus >= 0 ? '+' : ''}${bonus})*`;
  }
  
  // Check for persuasion/deception/intimidation
  if (lowerInput.includes('persuade') || lowerInput.includes('convince') || lowerInput.includes('talk') || lowerInput.includes('ask')) {
    return `**DM:** You're trying to influence someone. Roll a **Persuasion** check!\n\n*(Your CHA bonus: ${character.abilityScores.charisma.modifier >= 0 ? '+' : ''}${character.abilityScores.charisma.modifier})*`;
  }
  
  // Check for athletics/acrobatics
  if (lowerInput.includes('climb') || lowerInput.includes('jump') || lowerInput.includes('run') || lowerInput.includes('swim') || lowerInput.includes('grapple')) {
    return `**DM:** That sounds like an **Athletics** or **Acrobatics** check!\n\n*(Athletics: ${character.abilityScores.strength.modifier >= 0 ? '+' : ''}${character.abilityScores.strength.modifier}, Acrobatics: ${character.abilityScores.dexterity.modifier >= 0 ? '+' : ''}${character.abilityScores.dexterity.modifier})*\n\nWhich one fits what you're trying to do?`;
  }
  
  // Check for arcana/nature/religion/history
  if (lowerInput.includes('know') || lowerInput.includes('remember') || lowerInput.includes('recall') || lowerInput.includes('lore')) {
    return `**DM:** You're drawing on your knowledge. Is this **Arcana**, **History**, **Nature**, or **Religion**?\n\nRoll the appropriate check and tell me what you're trying to recall!`;
  }
  
  // Default responses
  const defaultResponses = [
    `**DM:** *The world around you shifts as you move forward. What would you like to do next?*`,
    `**DM:** *You continue on your path. The adventure awaits!*`,
    `**DM:** *Interesting choice. The consequences of your actions will unfold...*`,
    `**DM:** *The atmosphere grows tense. Be prepared for what comes next.*`,
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

// Get campaign ID from character
const getCampaignId = (characterId: string) => `campaign_${characterId}`;

export function ChatInterface({ character }: ChatInterfaceProps) {
  const campaignId = getCampaignId(character.id);
  const [messages, setMessages] = useState<Message[]>(() => {
    // Load from localStorage on init
    const saved = localStorage.getItem(campaignId);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convert timestamps back to numbers
        return parsed.map((m: Message) => ({
          ...m,
          timestamp: typeof m.timestamp === 'string' ? new Date(m.timestamp).getTime() : m.timestamp
        }));
      } catch {
        return [];
      }
    }
    return [];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Save to localStorage whenever messages change
  useEffect(() => {
    localStorage.setItem(campaignId, JSON.stringify(messages));
  }, [messages, campaignId]);

  // Add welcome message if empty
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `**DM:** Greetings, **${character.name}**! I am your Dungeon Master.\n\n**How to play:**\n- Use **/command** to talk to me (the DM)\n- Use ***action*** to describe what you do\n- Use **"speech"** to talk to NPCs\n- Just type a name to talk to other players\n\nWhat would you like to do today? You can explore, fight monsters, interact with NPCs, or go on an adventure!`,
        timestamp: Date.now(),
      };
      setMessages([welcomeMessage]);
    }
  }, [character.name, messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const parsed = parseInput(input);
    
    // Create user message based on type
    let userContent = '';
    let messageRole: Message['role'] = 'user';
    
    switch (parsed.type) {
      case 'dm':
        userContent = `**To DM:** ${parsed.content}`;
        messageRole = 'dm';
        break;
      case 'action':
        userContent = `*${parsed.content}*`;
        messageRole = 'action';
        break;
      case 'speech':
        userContent = `"${parsed.content}"`;
        messageRole = 'speech';
        break;
      case 'player':
        userContent = `**To ${parsed.target}:** ${parsed.content}`;
        messageRole = 'player';
        break;
      default:
        userContent = parsed.content;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: messageRole,
      content: userContent,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Generate DM response (only for DM commands, actions, or normal input)
    if (parsed.type === 'dm' || parsed.type === 'action' || parsed.type === 'normal') {
      setTimeout(() => {
        const response = generateDMResponse(parsed.content, parsed.type, character);
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response,
          timestamp: Date.now(),
        };

        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 800);
    } else {
      // For speech and player chat, just acknowledge
      setTimeout(() => {
        const ackMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: parsed.type === 'speech' 
            ? `**DM:** *You speak these words aloud...*`
            : `**DM:** *You address your companion...*`,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, ackMessage]);
        setIsLoading(false);
      }, 400);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      setMessages([]);
      localStorage.removeItem(campaignId);
      toast.success('Chat history cleared');
    }
  };

  const quickActions = [
    { label: 'Explore', icon: Scroll, prompt: '*I look around the area, taking in my surroundings.*' },
    { label: 'Check Inventory', icon: Bot, prompt: '/What do I have in my inventory?' },
    { label: 'Short Rest', icon: Sparkles, prompt: '*I take a short rest to recover.*' },
    { label: 'Roll d20', icon: Dices, prompt: '/I roll a d20' },
  ];

  const getMessageStyle = (role: Message['role']) => {
    switch (role) {
      case 'dm':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100';
      case 'action':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 italic';
      case 'speech':
        return 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100';
      case 'player':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100';
      case 'assistant':
        return 'bg-muted';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  const getAvatarStyle = (role: Message['role']) => {
    switch (role) {
      case 'dm':
      case 'assistant':
        return 'bg-purple-500';
      case 'action':
        return 'bg-amber-500';
      case 'speech':
        return 'bg-green-500';
      case 'player':
        return 'bg-blue-500';
      default:
        return 'bg-primary';
    }
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5 text-purple-500" />
            AI Dungeon Master
            <Badge variant="secondary" className="text-xs">
              {character.name}
            </Badge>
          </CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={clearHistory} title="Clear history">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4 pt-0">
        {/* Messages */}
        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' || message.role === 'dm' ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className={`h-8 w-8 ${getAvatarStyle(message.role)}`}>
                  <AvatarFallback className="text-xs">
                    {message.role === 'assistant' || message.role === 'dm' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className={`flex flex-col max-w-[85%] ${message.role === 'user' || message.role === 'dm' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-3 rounded-lg text-sm whitespace-pre-wrap ${getMessageStyle(message.role)}`}
                  >
                    {message.content}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 bg-purple-500">
                  <AvatarFallback className="text-xs">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Actions */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              size="sm"
              className="flex-shrink-0 text-xs"
              onClick={() => setInput(action.prompt)}
            >
              <action.icon className="h-3 w-3 mr-1" />
              {action.label}
            </Button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2 mt-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type / for DM, * for action, &quot; for speech..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Command hints */}
        <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
          <span><code className="bg-muted px-1 rounded">/</code> DM</span>
          <span><code className="bg-muted px-1 rounded">*action*</code></span>
          <span><code className="bg-muted px-1 rounded">"speech"</code></span>
          <span><code className="bg-muted px-1 rounded">Name</code> player</span>
        </div>
      </CardContent>
    </Card>
  );
}
