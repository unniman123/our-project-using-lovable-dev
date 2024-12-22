import React from 'react';
import { Trophy } from "lucide-react";
import TournamentCard from '../TournamentCard';
import { Link } from 'react-router-dom';

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
          <Link to="/admin/disputes" className="bg-gaming-accent hover:bg-gaming-accent/80 text-white px-4 py-2 rounded-md">
            Manage Disputes
          </Link>
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
