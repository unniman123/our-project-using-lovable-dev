import React from 'react';
import { Trophy } from "lucide-react";
import TournamentCard from '../TournamentCard';
import { Link } from 'react-router-dom';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../integrations/supabase/client';

interface Tournament {
  id: string;
  title: string;
  game_type: string;
  prize_pool: number;
  max_participants: number;
  tournament_participants: { count: number }[];
  status: string;
}

interface ActiveTournamentsProps {
  tournaments?: Tournament[];
  isLoading: boolean;
}

const ActiveTournaments = ({ tournaments, isLoading }: ActiveTournamentsProps) => {
  // Filter out any tournaments that aren't 'upcoming' or 'in_progress'
  const activeTournaments = tournaments?.filter(
    tournament => ['upcoming', 'in_progress'].includes(tournament.status)
  );

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Trophy className="text-gaming-accent" />
        Active Tournaments
      </h2>
      <div className="flex justify-between items-center mb-4">
        
        <div className="space-x-2">
          {(() => {
            const { session } = useSessionContext();
            const { data: userProfile, isLoading: profileLoading } = useQuery({
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
          
            const isAdmin = userProfile?.is_admin;
            
            if (isAdmin) {
              return (
                <Link to="/admin/disputes" className="bg-gaming-accent hover:bg-gaming-accent/80 text-white px-4 py-2 rounded-md">
                  Manage Disputes
                </Link>
              );
            }
            return null;
          })()}
        </div>
      </div>
      {isLoading ? (
        <div className="text-center py-8 text-gray-400">Loading tournaments...</div>
      ) : activeTournaments?.length === 0 ? (
        <div className="text-center py-8 text-gray-400">No active tournaments</div>
      ) : (
        <div className="space-y-4">
          {activeTournaments?.map((tournament) => (
            <TournamentCard
              key={tournament.id}
              title={tournament.title}
              game={tournament.game_type}
              prizePool={Number(tournament.prize_pool) || 0}
              entryFee={0}
              playersJoined={tournament.tournament_participants[0]?.count || 0}
              maxPlayers={tournament.max_participants}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveTournaments;
