import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../components/ui/card";
import { useToast } from "../hooks/use-toast";
import { supabase } from "../integrations/supabase/client";
import ProfileAvatar from '../components/profile/ProfileAvatar';
import ProfileForm from '../components/profile/ProfileForm';
import ProfileActions from '../components/profile/ProfileActions';
import { GameAccountsList } from '../components/profile/GameAccountsList';
import { GameAccount } from '../types/profile.types';
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";

const Profile = () => {
  const { id: profileId } = useParams();
  const { session } = useSessionContext();
  const isCurrentUser = !profileId || profileId === session?.user?.id;
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [gameAccounts, setGameAccounts] = useState([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUsernameValid, setIsUsernameValid] = useState(true);
  const [matchesPlayed, setMatchesPlayed] = useState(0);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [winRate, setWinRate] = useState(0);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const calculateStatistics = async (userId: string) => {
    const { data: matches, error } = await supabase
      .from('matches')
      .select('*')
      .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
      .eq('status', 'completed');

    if (error) throw error;

    const totalMatches = matches.length;
    const wins = matches.filter(m => m.winner_id === userId).length;
    const losses = totalMatches - wins;
    const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;

    return { totalMatches, wins, losses, winRate };
  };

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchAndSubscribe = async () => {
      try {
        setIsLoadingStats(true);
        const stats = await calculateStatistics(session.user.id);
        setMatchesPlayed(stats.totalMatches);
        setWins(stats.wins);
        setLosses(stats.losses);
        setWinRate(stats.winRate);
        
        const channel = supabase
          .channel('match-updates')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'matches',
            filter: `or(player1_id.eq.${session.user.id},player2_id.eq.${session.user.id})`
          }, async () => {
            const stats = await calculateStatistics(session.user.id);
            setMatchesPlayed(stats.totalMatches);
            setWins(stats.wins);
            setLosses(stats.losses);
            setWinRate(stats.winRate);
          })
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (err) {
        setStatsError('Failed to load match statistics');
        console.error(err);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchAndSubscribe();
  }, [session?.user?.id]);

  const checkUsernameUnique = async (newUsername: string) => {
    if (newUsername === profile?.username) {
      return true;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', newUsername)
      .single();

    if (error) {
      console.error("Error checking username:", error);
      return false;
    }
    return !data;
  };

  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ['profile', profileId || session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId || session?.user?.id)
        .single();

      if (error) throw error;
      setUsername(data.username || '');
      let gameAccounts: GameAccount[] = [];
      try {
        const parsedAccounts = typeof data.game_accounts === 'string' 
          ? JSON.parse(data.game_accounts)
          : data.game_accounts;
        
        gameAccounts = Array.isArray(parsedAccounts)
          ? parsedAccounts.map(account => ({
              gameName: account.gameName || account.game_name || '',
              gameId: account.gameId || account.game_id || '',
              inGameName: account.inGameName || account.in_game_name || ''
            }))
          : [];
      } catch (error) {
        console.error('Error parsing game accounts:', error);
      }
      setGameAccounts(gameAccounts);
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
    }
  };

  const handleSave = async () => {
    try {
      const isUnique = await checkUsernameUnique(username);
      setIsUsernameValid(isUnique);
      if (!isUnique) {
        toast({
          title: "Error",
          description: "Username already taken",
          variant: "destructive",
        });
        return;
      }

      let avatarUrl = profile?.avatar_url;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `${session?.user?.id}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        avatarUrl = publicUrl;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username,
          game_accounts: JSON.stringify(gameAccounts),
          avatar_url: avatarUrl,
        })
        .eq('id', session?.user?.id);

      if (updateError) throw updateError;

      await refetchProfile();
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Profile Header Card */}
      <Card className="bg-gradient-to-r from-gaming-dark/80 to-gaming-accent/10 border-gaming-accent/20">
        <CardHeader className="flex flex-row items-center space-x-6">
          <ProfileAvatar
            avatarUrl={profile.avatar_url}
            isEditing={isEditing}
            onAvatarChange={handleAvatarChange}
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl font-bold text-white">
                {username}
              </CardTitle>
              {isCurrentUser && (
                <ProfileActions
                  isEditing={isEditing}
                  onEdit={() => setIsEditing(true)}
                  onSave={handleSave}
                  onCancel={() => setIsEditing(false)}
                />
              )}
            </div>
            <div className="mt-2 space-y-1">
              <div className="text-sm text-gray-400">
                Member since: {new Date(profile.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Profile Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Form Card */}
        <Card className="bg-gaming-dark/50 border-gaming-accent/20">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white">
              Profile Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm
              username={username}
              gameAccounts={gameAccounts}
              isEditing={isEditing}
              isUsernameValid={isUsernameValid}
              onUsernameChange={(e) => setUsername(e.target.value)}
              onGameAccountsChange={(accounts) => setGameAccounts(accounts)}
            />
          </CardContent>
        </Card>

        {/* Game Accounts Card */}
        {gameAccounts.length > 0 && (
          <Card className="bg-gaming-dark/50 border-gaming-accent/20">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white">
                Game Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GameAccountsList 
                accounts={gameAccounts}
                isEditing={isEditing}
                onChange={(accounts) => setGameAccounts(accounts)}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Stats Section */}
      <Card className="bg-gaming-dark/50 border-gaming-accent/20">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">
            Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isLoadingStats ? (
            <div className="col-span-4 text-center">Loading statistics...</div>
          ) : statsError ? (
            <div className="col-span-4 text-center text-red-500">{statsError}</div>
          ) : (
            <>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{matchesPlayed}</div>
                <div className="text-sm text-gray-400">Matches Played</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{wins}</div>
                <div className="text-sm text-gray-400">Wins</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{losses}</div>
                <div className="text-sm text-gray-400">Losses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{winRate.toFixed(2)}%</div>
                <div className="text-sm text-gray-400">Win Rate</div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
