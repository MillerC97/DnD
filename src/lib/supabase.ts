import { createClient } from '@supabase/supabase-js';
import type { Character } from '@/types/character';

const supabaseUrl = `https://ddmomfyrychifhvxvihv.supabase.co`;
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbW9tZnlyeWNoaWZodnh2aWh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMzUwOTgsImV4cCI6MjA4NTcxMTA5OH0.KlR1nTiNOxGN0PyGWA1Tif9od0iSyhS_CjFuz3p4qPg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      characters: {
        Row: Character;
        Insert: Omit<Character, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Character>;
      };
      campaigns: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          created_at: string;
          updated_at: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          campaign_id: string;
          role: 'user' | 'assistant';
          content: string;
          created_at: string;
        };
      };
    };
  };
};

// Character CRUD operations
export const saveCharacter = async (character: Character, userId?: string): Promise<Character | null> => {
  try {
    const characterData = {
      ...character,
      user_id: userId || character.user_id,
    };
    
    if (character.id) {
      const { data, error } = await supabase
        .from('characters')
        .update(characterData)
        .eq('id', character.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('characters')
        .insert(characterData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error saving character:', error);
    return null;
  }
};

export const getCharacters = async (userId?: string): Promise<Character[]> => {
  try {
    let query = supabase.from('characters').select('*');
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query.order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching characters:', error);
    return [];
  }
};

export const getCharacter = async (id: string): Promise<Character | null> => {
  try {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching character:', error);
    return null;
  }
};

export const deleteCharacter = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('characters')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting character:', error);
    return false;
  }
};

// Chat message operations
export const saveChatMessage = async (campaignId: string, role: 'user' | 'assistant', content: string) => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({ campaign_id: campaignId, role, content })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving chat message:', error);
    return null;
  }
};

export const getChatMessages = async (campaignId: string, limit: number = 50) => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: true })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return [];
  }
};
