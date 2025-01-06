import React from 'react';
import MatchInfo from './MatchInfo';
import MatchCommunication from './MatchCommunication';
import MatchSidebar from './MatchSidebar';
import { Profile } from '../../types/database/profile.types';
import { Tournament } from '../../types/database/tournament.types';
import { Link } from 'react-router-dom';

interface MatchContainerProps {
  match: {
    id: string;
    player1: Pick<Profile, 'username' | 'skill_rating'>;
    player2: Pick<Profile, 'username' | 'skill_rating'>;
    score_player1: number;
    score_player2: number;
    winner_id: string;
    player1_id: string;
    player2_id: string;
    status: string;
    tournaments?: Tournament;
  };
  isParticipant: boolean;
  opponentId: string | undefined;
}

const MatchContainer = ({ match, isParticipant, opponentId }: MatchContainerProps) => {
  return (
    <div className="space-y-8">
      <div className="flex justify-end mb-4">
        <Link to="/admin/disputes" className="bg-gaming-accent hover:bg-gaming-accent/80 text-white px-4 py-2 rounded-md">
          Manage Disputes
        </Link>
      </div>
      <MatchInfo
        player1={match.player1}
        player2={match.player2}
        score1={match.score_player1}
        score2={match.score_player2}
        winnerId={match.winner_id}
        player1Id={match.player1_id}
        player2Id={match.player2_id}
      />

      <div className="grid md:grid-cols-2 gap-8">
        <MatchCommunication
          matchId={match.id}
          player1Username={match.player1.username}
          player2Username={match.player2.username}
          isParticipant={isParticipant}
          opponentId={opponentId}
        />
        
        <MatchSidebar
          matchId={match.id}
          isParticipant={isParticipant}
          tournament={match.tournaments ? {
            title: match.tournaments.title,
            tournament_rules: match.tournaments.tournament_rules,
            match_time_limit: match.tournaments.match_time_limit?.toString() || "30 minutes",
            dispute_resolution_rules: match.tournaments.dispute_resolution_rules || "Standard dispute resolution rules apply."
          } : null}
          player1Id={match.player1_id}
          player2Id={match.player2_id}
          currentStatus={match.status}
        />
      </div>
    </div>
  );
};

export default MatchContainer;
