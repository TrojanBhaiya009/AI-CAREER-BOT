import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  education_level: string | null;
  career_goal: 'internship' | 'full_time' | null;
  target_role_id: string | null;
  onboarding_completed: boolean;
  github_username: string | null;
  resume_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface TargetRole {
  id: string;
  name: string;
  category: 'tech' | 'marketing' | 'sales' | 'hr' | 'finance';
  description: string | null;
  required_skills: string[];
}

export function useProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [targetRole, setTargetRole] = useState<TargetRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setTargetRole(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      setProfile(data as Profile | null);

      if (data?.target_role_id) {
        const { data: roleData, error: roleError } = await supabase
          .from('target_roles')
          .select('*')
          .eq('id', data.target_role_id)
          .maybeSingle();

        if (roleError) throw roleError;
        
        if (roleData) {
          setTargetRole({
            ...roleData,
            required_skills: Array.isArray(roleData.required_skills) 
              ? roleData.required_skills as string[]
              : JSON.parse(roleData.required_skills as string || '[]'),
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      return { error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error: error as Error };
    }
  };

  return {
    profile,
    targetRole,
    loading,
    updateProfile,
    refetchProfile: fetchProfile,
  };
}

export function useTargetRoles() {
  const [roles, setRoles] = useState<TargetRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('target_roles')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;

      const formattedRoles = (data || []).map(role => ({
        ...role,
        required_skills: Array.isArray(role.required_skills) 
          ? role.required_skills as string[]
          : JSON.parse(role.required_skills as string || '[]'),
      }));

      setRoles(formattedRoles);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  return { roles, loading };
}
