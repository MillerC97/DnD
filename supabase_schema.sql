-- D&D Dungeon Master Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Characters table
CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  name TEXT NOT NULL,
  race TEXT NOT NULL,
  class TEXT NOT NULL,
  subclass TEXT,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  xp_to_next_level INTEGER DEFAULT 300,
  
  -- Ability Scores (stored as JSONB)
  ability_scores JSONB NOT NULL DEFAULT '{
    "strength": {"score": 10, "modifier": 0},
    "dexterity": {"score": 10, "modifier": 0},
    "constitution": {"score": 10, "modifier": 0},
    "intelligence": {"score": 10, "modifier": 0},
    "wisdom": {"score": 10, "modifier": 0},
    "charisma": {"score": 10, "modifier": 0}
  }'::jsonb,
  
  -- Combat Stats
  max_hp INTEGER DEFAULT 10,
  current_hp INTEGER DEFAULT 10,
  temp_hp INTEGER DEFAULT 0,
  ac INTEGER DEFAULT 10,
  initiative INTEGER DEFAULT 0,
  speed INTEGER DEFAULT 30,
  proficiency_bonus INTEGER DEFAULT 2,
  inspiration BOOLEAN DEFAULT false,
  
  -- Saving Throws and Skills (stored as JSONB arrays)
  saving_throws JSONB DEFAULT '[]'::jsonb,
  skills JSONB DEFAULT '[]'::jsonb,
  
  -- Passives
  passive_perception INTEGER DEFAULT 10,
  passive_investigation INTEGER DEFAULT 10,
  passive_insight INTEGER DEFAULT 10,
  
  -- Proficiencies
  proficiencies JSONB DEFAULT '{
    "armor": [],
    "weapons": [],
    "tools": [],
    "languages": ["Common"]
  }'::jsonb,
  
  -- Combat & Spells
  attacks JSONB DEFAULT '[]'::jsonb,
  spellcasting_ability TEXT DEFAULT 'INT',
  spell_save_dc INTEGER DEFAULT 12,
  spell_attack_bonus INTEGER DEFAULT 4,
  spell_slots JSONB DEFAULT '[]'::jsonb,
  spells JSONB DEFAULT '[]'::jsonb,
  
  -- Inventory
  inventory JSONB DEFAULT '[]'::jsonb,
  cp INTEGER DEFAULT 0,
  sp INTEGER DEFAULT 0,
  ep INTEGER DEFAULT 0,
  gp INTEGER DEFAULT 0,
  pp INTEGER DEFAULT 0,
  
  -- Features & Description
  features JSONB DEFAULT '[]'::jsonb,
  personality_traits TEXT DEFAULT '',
  ideals TEXT DEFAULT '',
  bonds TEXT DEFAULT '',
  flaws TEXT DEFAULT '',
  appearance TEXT DEFAULT '',
  backstory TEXT DEFAULT '',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  character_id UUID REFERENCES characters(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_characters_user_id ON characters(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_campaign_id ON chat_messages(campaign_id);

-- Enable Row Level Security (RLS)
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for demo purposes)
-- In production, you would use authenticated user policies
CREATE POLICY "Allow public access to characters" ON characters
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access to campaigns" ON campaigns
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access to chat_messages" ON chat_messages
  FOR ALL USING (true) WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_characters_updated_at ON characters;
CREATE TRIGGER update_characters_updated_at
  BEFORE UPDATE ON characters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
