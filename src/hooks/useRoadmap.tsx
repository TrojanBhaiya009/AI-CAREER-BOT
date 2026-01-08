import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface RoadmapPhase {
  title: string;
  duration: string;
  skills: string[];
  goals: string[];
  resources: string[];
  project: {
    name: string;
    description: string;
  };
}

export interface Roadmap {
  id: string;
  user_id: string;
  target_role_id: string | null;
  skill_match_percentage: number;
  phase_1: RoadmapPhase;
  phase_2: RoadmapPhase;
  phase_3: RoadmapPhase;
  generated_at: string;
  updated_at: string;
}

export interface ProjectRecommendation {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  skills_covered: string[];
  difficulty: string | null;
  estimated_time: string | null;
  why_this_project: string | null;
  created_at: string;
}

export function useRoadmap() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [projects, setProjects] = useState<ProjectRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRoadmap();
      fetchProjects();
    } else {
      setRoadmap(null);
      setProjects([]);
      setLoading(false);
    }
  }, [user]);

  const fetchRoadmap = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('roadmaps')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setRoadmap({
          ...data,
          phase_1: data.phase_1 as unknown as RoadmapPhase,
          phase_2: data.phase_2 as unknown as RoadmapPhase,
          phase_3: data.phase_3 as unknown as RoadmapPhase,
        });
      }
    } catch (error) {
      console.error('Error fetching roadmap:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('project_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data as ProjectRecommendation[] || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const saveRoadmap = async (roadmapData: {
    target_role_id: string;
    skill_match_percentage: number;
    phase_1: RoadmapPhase;
    phase_2: RoadmapPhase;
    phase_3: RoadmapPhase;
  }) => {
    if (!user) {
      console.error('Cannot save roadmap: User not authenticated');
      return { error: new Error('Not authenticated') };
    }

    try {
      console.log('Saving roadmap for user:', user.id);
      
      // Check if roadmap exists
      const { data: existing } = await supabase
        .from('roadmaps')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('Existing roadmap:', existing);

      if (existing) {
        // Update existing roadmap
        console.log('Updating existing roadmap...');
        const { data, error } = await supabase
          .from('roadmaps')
          .update({
            target_role_id: roadmapData.target_role_id,
            skill_match_percentage: roadmapData.skill_match_percentage,
            phase_1: roadmapData.phase_1,
            phase_2: roadmapData.phase_2,
            phase_3: roadmapData.phase_3,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating roadmap:', error);
          throw error;
        }
        console.log('Roadmap updated successfully:', data);
      } else {
        // Insert new roadmap
        console.log('Creating new roadmap...');
        const { data, error } = await supabase
          .from('roadmaps')
          .insert({
            user_id: user.id,
            target_role_id: roadmapData.target_role_id,
            skill_match_percentage: roadmapData.skill_match_percentage,
            phase_1: roadmapData.phase_1,
            phase_2: roadmapData.phase_2,
            phase_3: roadmapData.phase_3,
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating roadmap:', error);
          throw error;
        }
        console.log('Roadmap created successfully:', data);
      }

      // Fetch updated roadmap
      await fetchRoadmap();
      console.log('Roadmap refetched successfully');
      return { error: null };
    } catch (error) {
      console.error('Error saving roadmap:', error);
      return { error: error as Error };
    }
  };

  const saveProjects = async (projectsData: Omit<ProjectRecommendation, 'id' | 'user_id' | 'created_at'>[]) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      // Clear existing projects first
      await supabase
        .from('project_recommendations')
        .delete()
        .eq('user_id', user.id);

      const projectsToInsert = projectsData.map(p => ({
        user_id: user.id,
        title: p.title,
        description: p.description,
        skills_covered: p.skills_covered,
        difficulty: p.difficulty,
        estimated_time: p.estimated_time,
        why_this_project: p.why_this_project,
      }));

      const { error } = await supabase
        .from('project_recommendations')
        .insert(projectsToInsert);

      if (error) throw error;

      await fetchProjects();
      return { error: null };
    } catch (error) {
      console.error('Error saving projects:', error);
      return { error: error as Error };
    }
  };

  return {
    roadmap,
    projects,
    loading,
    saveRoadmap,
    saveProjects,
    refetch: () => {
      fetchRoadmap();
      fetchProjects();
    },
  };
}
