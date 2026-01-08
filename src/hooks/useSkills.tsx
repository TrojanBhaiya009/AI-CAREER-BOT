import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Skill {
  id: string;
  name: string;
  category: 'programming_languages' | 'frameworks_libraries' | 'tools_platforms' | 'soft_skills' | 'domain_specific' | 'concepts';
  aliases: string[];
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  proficiency: 'missing' | 'weak' | 'strong';
  source: string | null;
  skill?: Skill;
}

export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setSkills(data as Skill[] || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSkillsByCategory = () => {
    const grouped: Record<string, Skill[]> = {};
    skills.forEach(skill => {
      if (!grouped[skill.category]) {
        grouped[skill.category] = [];
      }
      grouped[skill.category].push(skill);
    });
    return grouped;
  };

  return { skills, loading, getSkillsByCategory };
}

export function useUserSkills() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserSkills();
    } else {
      setUserSkills([]);
      setLoading(false);
    }
  }, [user]);

  const fetchUserSkills = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_skills')
        .select(`
          *,
          skill:skills(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setUserSkills(data as UserSkill[] || []);
    } catch (error) {
      console.error('Error fetching user skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const addUserSkills = async (skillData: { skill_id: string; proficiency: 'missing' | 'weak' | 'strong'; source: string }[]) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const skillsToInsert = skillData.map(s => ({
        user_id: user.id,
        skill_id: s.skill_id,
        proficiency: s.proficiency,
        source: s.source,
      }));

      const { error } = await supabase
        .from('user_skills')
        .upsert(skillsToInsert, { onConflict: 'user_id,skill_id' });

      if (error) throw error;

      await fetchUserSkills();
      return { error: null };
    } catch (error) {
      console.error('Error adding user skills:', error);
      return { error: error as Error };
    }
  };

  const clearUserSkills = async () => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('user_skills')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setUserSkills([]);
      return { error: null };
    } catch (error) {
      console.error('Error clearing user skills:', error);
      return { error: error as Error };
    }
  };

  return {
    userSkills,
    loading,
    addUserSkills,
    clearUserSkills,
    refetchUserSkills: fetchUserSkills,
  };
}
