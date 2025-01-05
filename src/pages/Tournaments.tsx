import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Trophy, Users, Calendar, Loader2, ArrowRight } from "lucide-react";
import { supabase } from '../integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from "sonner";

const GAME_FILTERS = ['All', 'FIFA', 'PES', 'Call of Duty', 'Madden 25', 'NBA 2K25', 'EA FC25'];

const Tournaments = () => {
  const [selectedGame, setSelectedGame] = useState('All');
  const { session } = useSessionContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: tournaments, isLoading: tournamentsLoading } = useQuery({
    queryKey: ['tournaments', selectedGame],
    queryFn: async () => {
      let query = supabase
        .from('tournaments')
        .select(`
          *,
          tournament_participants (
            player_id,
            status
          )
        `)
        .in('status', ['upcoming', 'in_progress'])
        .is('deleted_at', null);

      if (selectedGame !== 'All') {
        query = query.eq('game_type', selectedGame);
      }

      const { data, error } = await query.order('start_date', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const { data: userParticipations } = useQuery({
    queryKey: ['user-tournament-participations', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournament_participants')
        .select('*')
        .eq('player_id', session?.user?.id);

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const joinTournamentMutation = useMutation({
    mutationFn: async (tournamentId: string) => {
      const { data, error } = await supabase
        .from('tournament_participants')
        .insert({
          tournament_id: tournamentId,
          player_id: session?.user?.id,
          status: 'registered'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, tournamentId) => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['user-tournament-participations'] });
      toast.success("Successfully joined tournament!");
      navigate(`/tournaments/${tournamentId}`);
    },
    onError: (error) => {
      toast.error("Failed to join tournament. Please try again.");
      console.error(error);
    }
  });

  const joinTournament = async (tournamentId: string) => {
    try {
      const tournament = tournaments?.find(t => t.id === tournamentId);
      if (!tournament) {
        throw new Error('Tournament not found');
      }

      if (getParticipantCount(tournament) >= tournament.max_participants) {
        throw new Error('Tournament is full');
      }

      await joinTournamentMutation.mutateAsync(tournamentId);
    } catch (error: any) {
      toast.error(error.message || "Failed to join tournament");
    }
  };

  if (tournamentsLoading) {
    return (
      <div className="min-h-screen bg-gaming-dark">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gaming-accent" />
        </div>
      </div>
    );
  }

  const isUserParticipating = (tournamentId: string) => {
    return userParticipations?.some(p => p.tournament_id === tournamentId);
  };

  const getParticipantCount = (tournament: any) => {
    return tournament.tournament_participants?.length || 0;
  };

  return (
    <div className="min-h-screen bg-gaming-dark">
      <Navbar />
      <div className="container mx-auto px-4 pt-24">
        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-2">
          <Trophy className="text-gaming-accent" />
          Tournaments
        </h1>
        
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {GAME_FILTERS.map((game) => (
            <Button
              key={game}
              variant={selectedGame === game ? 'default' : 'secondary'}
              onClick={() => setSelectedGame(game)}
              className="whitespace-nowrap"
            >
              {game}
            </Button>
          ))}
        </div>

        <div className="bg-gaming-dark/50 rounded-lg border border-gaming-accent/20">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-300">Tournament</TableHead>
                <TableHead className="text-gray-300">Game</TableHead>
                <TableHead className="text-gray-300">Prize Pool</TableHead>
                <TableHead className="text-gray-300">Players</TableHead>
                <TableHead className="text-gray-300">Start Date</TableHead>
                <TableHead className="text-gray-300">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tournaments?.map((tournament) => (
                <TableRow key={tournament.id}>
                  <TableCell className="font-medium text-white">
                    <div className="flex items-center gap-2">
                      <Trophy className="text-gaming-accent" />
                      {tournament.title}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">{tournament.game_type}</TableCell>
                  <TableCell className="text-gaming-accent">
                    ${tournament.prize_pool}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    <div className="flex items-center gap-2">
                      <Users size={16} />
                      {getParticipantCount(tournament)}/{tournament.max_participants}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      {format(new Date(tournament.start_date), 'MMM dd, yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    {isUserParticipating(tournament.id) ? (
                      <Button 
                        variant="secondary"
                        className="w-full"
                        onClick={() => navigate(`/tournaments/${tournament.id}`)}
                      >
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button 
                        variant="default"
                        className="w-full"
                        onClick={() => joinTournament(tournament.id)}
                        disabled={getParticipantCount(tournament) >= tournament.max_participants}
                      >
                        Join Tournament
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Tournaments;
