export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      direct_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dispute_cases: {
        Row: {
          admin_notes: string | null
          against_id: string
          created_at: string | null
          description: string
          id: string
          match_id: string
          reported_by_id: string
          resolution: string | null
          resolution_type: string | null
          status: Database["public"]["Enums"]["dispute_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          against_id: string
          created_at?: string | null
          description: string
          id?: string
          match_id: string
          reported_by_id: string
          resolution?: string | null
          resolution_type?: string | null
          status?: Database["public"]["Enums"]["dispute_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          against_id?: string
          created_at?: string | null
          description?: string
          id?: string
          match_id?: string
          reported_by_id?: string
          resolution?: string | null
          resolution_type?: string | null
          status?: Database["public"]["Enums"]["dispute_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dispute_cases_against_id_fkey"
            columns: ["against_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispute_cases_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispute_cases_reported_by_id_fkey"
            columns: ["reported_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dispute_messages: {
        Row: {
          created_at: string | null
          dispute_id: string
          id: string
          message: string
          sender_id: string
        }
        Insert: {
          created_at?: string | null
          dispute_id: string
          id?: string
          message: string
          sender_id: string
        }
        Update: {
          created_at?: string | null
          dispute_id?: string
          id?: string
          message?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispute_messages_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "dispute_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispute_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_chat: {
        Row: {
          created_at: string | null
          id: string
          is_system_message: boolean | null
          match_id: string | null
          message: string
          sender_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_system_message?: boolean | null
          match_id?: string | null
          message: string
          sender_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_system_message?: boolean | null
          match_id?: string | null
          message?: string
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_chat_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_chat_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string
          game_mode: string | null
          id: string
          match_date: string
          player1_id: string
          player2_id: string
          round: number | null
          score_player1: number | null
          score_player2: number | null
          status: Database["public"]["Enums"]["match_status"] | null
          tournament_id: string | null
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          created_at?: string
          game_mode?: string | null
          id?: string
          match_date: string
          player1_id: string
          player2_id: string
          round?: number | null
          score_player1?: number | null
          score_player2?: number | null
          status?: Database["public"]["Enums"]["match_status"] | null
          tournament_id?: string | null
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          created_at?: string
          game_mode?: string | null
          id?: string
          match_date?: string
          player1_id?: string
          player2_id?: string
          round?: number | null
          score_player1?: number | null
          score_player2?: number | null
          status?: Database["public"]["Enums"]["match_status"] | null
          tournament_id?: string | null
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_player1_id_fkey"
            columns: ["player1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_player2_id_fkey"
            columns: ["player2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      prize_tiers: {
        Row: {
          created_at: string | null
          id: string
          percentage: number
          position: number
          tournament_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          percentage: number
          position: number
          tournament_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          percentage?: number
          position?: number
          tournament_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prize_tiers_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          game_id: string | null
          gaming_experience: string | null
          id: string
          is_admin: boolean | null
          is_in_matchmaking: boolean | null
          is_online: boolean | null
          last_seen: string | null
          skill_rating: number | null
          updated_at: string
          username: string
          game_accounts: Json | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          game_id?: string | null
          gaming_experience?: string | null
          id: string
          is_admin?: boolean | null
          is_in_matchmaking?: boolean | null
          is_online?: boolean | null
          last_seen?: string | null
          skill_rating?: number | null
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          game_id?: string | null
          gaming_experience?: string | null
          id?: string
          is_admin?: boolean | null
          is_in_matchmaking?: boolean | null
          is_online?: boolean | null
          last_seen?: string | null
          skill_rating?: number | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      tournament_participants: {
        Row: {
          id: string
          losses: number | null
          matches_played: number | null
          player_id: string
          points: number | null
          registration_date: string
          status: string | null
          tournament_id: string
          wins: number | null
        }
        Insert: {
          id?: string
          losses?: number | null
          matches_played?: number | null
          player_id: string
          points?: number | null
          registration_date?: string
          status?: string | null
          tournament_id: string
          wins?: number | null
        }
        Update: {
          id?: string
          losses?: number | null
          matches_played?: number | null
          player_id?: string
          points?: number | null
          registration_date?: string
          status?: string | null
          tournament_id?: string
          wins?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_participants_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_participants_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          created_at: string
          creator_id: string
          deleted_at: string | null
          description: string | null
          dispute_resolution_rules: string | null
          end_date: string | null
          game_type: string
          id: string
          match_time_limit: unknown | null
          max_participants: number
          prize_distributed: boolean | null
          prize_pool: number | null
          start_date: string
          status: string | null
          title: string
          tournament_rules: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          deleted_at?: string | null
          description?: string | null
          dispute_resolution_rules?: string | null
          end_date?: string | null
          game_type: string
          id?: string
          match_time_limit?: unknown | null
          max_participants: number
          prize_distributed?: boolean | null
          prize_pool?: number | null
          start_date: string
          status?: string | null
          title: string
          tournament_rules?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          deleted_at?: string | null
          description?: string | null
          dispute_resolution_rules?: string | null
          end_date?: string | null
          game_type?: string
          id?: string
          match_time_limit?: unknown | null
          max_participants?: number
          prize_distributed?: boolean | null
          prize_pool?: number | null
          start_date?: string
          status?: string | null
          title?: string
          tournament_rules?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournaments_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_match: {
        Args: {
          player1_id: string
          player2_id: string
        }
        Returns: string
      }
      find_match: {
        Args: {
          player_id: string
        }
        Returns: string
      }
    }
    Enums: {
      dispute_status: "pending" | "under_review" | "resolved" | "rejected"
      match_status: "pending" | "in_progress" | "completed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
