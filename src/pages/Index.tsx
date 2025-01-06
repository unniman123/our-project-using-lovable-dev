import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { LayoutDashboard } from "lucide-react";
import Navbar from '../components/Navbar';
import AdminSection from '../components/AdminSection';
import StatsGrid from '../components/dashboard/StatsGrid';
import ActiveTournaments from '../components/dashboard/ActiveTournaments';
import MatchHistory from '../components/dashboard/MatchHistory';
import { supabase } from '../integrations/supabase/client';

const Index = () => {
  const { session } = useSessionContext();

  // Fetch user profile to check admin status
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session?.user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ['matches', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          player1:profiles!matches_player1_id_fkey(username),
          player2:profiles!matches_player2_id_fkey(username)
        `)
        .in('tournament_id', 
          await supabase
            .from('tournaments')
            .select('id')
            .is('deleted_at', null)
            .then((res) => res.data.map((item) => item.id))
        )
        .or(`player1_id.eq.${session?.user?.id},player2_id.eq.${session?.user?.id}`)
        .order('match_date', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const { data: tournaments, isLoading: tournamentsLoading } = useQuery({
    queryKey: ['active-tournaments'],
    queryFn: async () => {
      const { data: tournamentsData, error: tournamentsError } = await supabase
        .from('tournaments')
        .select(`
          *,
          tournament_participants(count)
        `)
        .eq('status', 'upcoming')
        .is('deleted_at', null) // Only fetch non-deleted tournaments
        .order('start_date', { ascending: true })
        .limit(3);

      if (tournamentsError) throw tournamentsError;
      return tournamentsData;
    },
  });

  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['userStats', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('skill_rating')
        .eq('id', session?.user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  return (
    <div className="min-h-screen bg-gaming-dark text-white">
      <Navbar />
      <div className="container mx-auto px-4 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <LayoutDashboard className="text-gaming-accent" />
            Dashboard
          </h1>
          <p className="text-gray-400 mt-2">HomeGround</p>
        </div>

        {userProfile?.is_admin && <AdminSection />}

        <StatsGrid 
          userStats={userStats}
          statsLoading={statsLoading}
          matchesCount={matches?.length || 0}
          matchesLoading={matchesLoading}
        />

        <ActiveTournaments 
          tournaments={tournaments}
          isLoading={tournamentsLoading}
        />

        <MatchHistory 
          matches={matches}
          isLoading={matchesLoading}
        />
      </div>
    </div>
  );
};

export default Index;
