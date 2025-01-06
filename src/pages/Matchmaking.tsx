import React, { useState, useEffect } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner";
import { useToast } from "../components/ui/use-toast";
import { Users, Loader, UserRound, X, Swords } from "lucide-react";
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { supabase } from '../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Match {
  id: string;
}

const Matchmaking = () => {
  const session = useSession();
  const queryClient = useQueryClient();
  const [isSearching, setIsSearching] = useState(false);
  const userId = session?.user?.id;
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get current user's profile and matchmaking status
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });

  // Mutation to update matchmaking status
  const updateMatchmakingStatus = useMutation({
    mutationFn: async (isSearching: boolean) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_in_matchmaking: isSearching })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      console.error('Error updating matchmaking status:', error);
      toast({
        title: "Failed to update matchmaking status",
      });
    }
  });

  // Function to find a match
  const findMatch = async () => {
    try {
      const { data: matchedPlayerId, error } = await supabase
        .rpc('find_match', { player_id: userId });

      if (error) throw error;

      if (matchedPlayerId) {
        const { data: matchData, error: matchError } = await supabase
          .rpc('create_match', { 
            player1_id: userId, 
            player2_id: matchedPlayerId 
          }) as { data: Match, error: any };

        if (matchError) throw matchError;

        // Fetch matched player's profile
        const { data: matchedProfile, error: profileError } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', matchedPlayerId)
          .single();

        if (profileError) {
          console.error('Error fetching matched player profile:', profileError);
          toast({
            title: "Match found!",
            description: "Game starting soon...",
          });
        } else {
          toast({
            title: "Match found!",
            description: `You are matched with ${matchedProfile?.username}. Game starting soon...`,
          });
        }

        setIsSearching(false);
        navigate(`/matches/${matchData.id}`);
      }
    } catch (error) {
      console.error('Error finding match:', error);
    }
  };

  // Poll for matches when in matchmaking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isSearching && userId) {
      interval = setInterval(findMatch, 5000); // Check every 5 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isSearching, userId]);

  // Handle entering/leaving matchmaking queue
  const handleMatchmaking = async () => {
    const newStatus = !isSearching;
    setIsSearching(newStatus);
    await updateMatchmakingStatus.mutateAsync(newStatus);
    
    
    if (newStatus) {
      toast({
        title: "Entered matchmaking queue",
      });
    } else {
      toast({
        title: "Left matchmaking queue",
      });
    }
  };
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gaming-dark">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 flex justify-center">
          <Loader className="animate-spin text-gaming-accent" size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gaming-dark">
      <Navbar />
      <div className="container mx-auto px-4 pt-24">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              <Swords className="text-gaming-accent" />
              Quick Match
            </h1>
            <p className="text-gray-400">Find opponents of similar skill level</p>
          </div>
          
          <Card className="bg-gaming-dark/50 border border-gaming-accent/20">
            <CardHeader>
              <CardTitle className="text-center">Your Profile</CardTitle>
              <CardDescription className="text-center">
                Current matchmaking status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-6">
                <div className="text-center">
                  <UserRound className="w-16 h-16 mx-auto mb-4 text-gaming-accent" />
                  <p className="text-gray-300 mb-2">
                    Skill Rating: {profile?.skill_rating}
                  </p>
                  {isSearching && (
                    <p className="text-gaming-accent animate-pulse">
                      Searching for opponents...
                    </p>
                  )}
                </div>
                
                <Button 
                  onClick={handleMatchmaking}
                  className={`w-full max-w-sm ${
                    isSearching 
                      ? "bg-red-500 hover:bg-red-600" 
                      : "bg-gaming-accent hover:bg-gaming-accent/90"
                  } text-gaming-dark`}
                  disabled={updateMatchmakingStatus.isPending}
                >
                  {isSearching ? (
                    <>
                      <X className="mr-2" />
                      Cancel Search
                    </>
                  ) : (
                    <>
                      <Users className="mr-2" />
                      Find Match
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Matchmaking;
