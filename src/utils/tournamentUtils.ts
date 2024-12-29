import { supabase } from "../integrations/supabase/client";

// Function to shuffle an array randomly
function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export const generateTournamentMatches = async (tournamentId: string) => {
  try {
    // Get all participants with their skill ratings
    const { data: participants, error: participantsError } = await supabase
      .from('tournament_participants')
      .select(`
        player_id,
        status,
        profiles!inner (
          skill_rating,
          game_id,
          username
        )
      `)
      .eq('tournament_id', tournamentId)
      .eq('status', 'registered');

    if (participantsError) throw participantsError;
    if (!participants) return;

    // Get tournament details for time limits and rules
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single();

    // Shuffle participants randomly
    const shuffledParticipants = shuffleArray(participants);

    // Create matches for pairs of players
    for (let i = 0; i < shuffledParticipants.length - 1; i += 2) {
      const player1 = shuffledParticipants[i];
      const player2 = shuffledParticipants[i + 1];
      
      if (player1 && player2) {
        // Create the match
        const { data: match, error: matchError } = await supabase
          .from('matches')
          .insert({
            tournament_id: tournamentId,
            player1_id: player1.player_id,
            player2_id: player2.player_id,
            round: 1,
            match_date: new Date().toISOString(),
            status: 'pending'
          })
          .select()
          .single();

        if (matchError) throw matchError;

        // Create system message in match chat with player details and rules
        if (match) {
          const systemMessage = `Match created!
Player 1: ${player1.profiles?.username} (Game ID: ${player1.profiles?.game_id})
Player 2: ${player2.profiles?.username} (Game ID: ${player2.profiles?.game_id})

Time limit: ${tournament?.match_time_limit || '30 minutes'}
Tournament rules: ${tournament?.tournament_rules || 'Standard tournament rules apply'}
Dispute resolution: ${tournament?.dispute_resolution_rules || 'Contact tournament admin for disputes'}`;

          await supabase
            .from('match_chat')
            .insert({
              match_id: match.id,
              message: systemMessage,
              is_system_message: true
            });
        }

        // Update participant status
        await supabase
          .from('tournament_participants')
          .update({ status: 'in_match' })
          .in('player_id', [player1.player_id, player2.player_id]);

        
                // Match created successfully
              }
            }
    // Update tournament status
    await supabase
      .from('tournaments')
      .update({ status: 'in_progress' })
      .eq('id', tournamentId);

  } catch (error) {
    console.error('Error generating tournament matches:', error);
    throw error;
  }
};

export const distributePrizes = async (tournamentId: string) => {
  try {
    // Get tournament details and prize tiers
    const { data: tournament } = await supabase
      .from('tournaments')
      .select(`
        *,
        prize_tiers (
          position,
          percentage
        ),
        tournament_participants (
          player_id,
          wins,
          losses,
          points
        )
      `)
      .eq('id', tournamentId)
      .single();

    if (!tournament || tournament.prize_distributed) return;

    // Sort participants by points/wins
    const sortedParticipants = tournament.tournament_participants.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.wins - a.wins;
    });

    // Distribute prizes according to tiers
    for (const tier of tournament.prize_tiers) {
      const participant = sortedParticipants[tier.position - 1];
      if (participant) {
        const prizeAmount = (tournament.prize_pool * tier.percentage) / 100;
        console.log(`Prize of ${prizeAmount} distributed to player ${participant.player_id}`);
        // Here you would integrate with a payment system
      }
    }

    // Mark tournament as distributed
    await supabase
      .from('tournaments')
      .update({ prize_distributed: true })
      .eq('id', tournamentId);

  } catch (error) {
    console.error('Error distributing prizes:', error);
    throw error;
  }
};
