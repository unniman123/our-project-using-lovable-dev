import { DisputeStatus, MatchStatus } from '@/types/enums';

// Base types for the database
export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

export interface BaseProfile extends BaseEntity {
  username: string;
  avatar_url?: string | null;
  gaming_experience?: string | null;
  skill_rating?: number | null;
  is_in_matchmaking?: boolean | null;
  is_admin?: boolean | null;
  is_online?: boolean | null;
  last_seen?: string | null;
  game_id?: string | null;
}

export interface BaseMatch extends BaseEntity {
  tournament_id?: string | null;
  player1_id: string;
  player2_id: string;
  winner_id?: string | null;
  score_player1?: number | null;
  score_player2?: number | null;
  match_date: string;
  status?: MatchStatus | null;
  game_mode?: string | null;
  round?: number | null;
}

export interface BaseTournament extends BaseEntity {
  creator_id: string;
  title: string;
  description?: string | null;
  game_type: string;
  max_participants: number;
  start_date: string;
  end_date?: string | null;
  status?: string | null;
  prize_pool?: number | null;
  match_time_limit?: unknown | null;
  tournament_rules?: string | null;
  dispute_resolution_rules?: string | null;
  prize_distributed?: boolean | null;
  deleted_at?: string | null;
  image_url?: string | null;
}
