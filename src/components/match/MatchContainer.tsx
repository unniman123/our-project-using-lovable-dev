import React from 'react';
import MatchInfo from './MatchInfo';
import MatchCommunication from './MatchCommunication';
import MatchSidebar from './MatchSidebar';
import { Profile, Tournament } from '@/types/database';

interface MatchContainerProps {
  match: {
    id: string;
    player1: Profile;
    player2: Profile;
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
          tournament={match.tournaments}
          player1Id={match.player1_id}
          player2Id={match.player2_id}
          currentStatus={match.status}
        />
      </div>
    </div>
  );
};

export default MatchContainer;