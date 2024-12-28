import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { useQuery } from '@tanstack/react-query';
import { Card } from "../components/ui/card";
import { useToast } from "../hooks/use-toast";
import { supabase } from "../integrations/supabase/client";
import ProfileAvatar from '../components/profile/ProfileAvatar';
import ProfileForm from '../components/profile/ProfileForm';
import ProfileActions from '../components/profile/ProfileActions';
import { GameAccountsList } from '../components/profile/GameAccountsList';
import { GameAccount } from '../types/profile.types';

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
      console.log('Initial game_accounts:', data.game_accounts);
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
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto p-6 bg-gaming-dark/50 border-gaming-accent/20">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          {isCurrentUser && (
            <ProfileActions
              isEditing={isEditing}
              onEdit={() => setIsEditing(true)}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
            />
          )}
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <ProfileAvatar
              avatarUrl={profile.avatar_url}
              isEditing={isEditing}
              onAvatarChange={handleAvatarChange}
            />
            <div className="flex-1">
              <ProfileForm
                username={username}
                gameAccounts={gameAccounts}
                isEditing={isEditing}
                isUsernameValid={isUsernameValid}
                onUsernameChange={(e) => setUsername(e.target.value)}
                onGameAccountsChange={(accounts) => setGameAccounts(accounts)}
              />
            </div>
          </div>

          {gameAccounts.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-white mb-4">Game Accounts</h2>
              <GameAccountsList 
                accounts={gameAccounts}
                isEditing={isEditing}
                onChange={(accounts) => setGameAccounts(accounts)}
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Profile;
