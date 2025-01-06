import React from 'react';
import { Input } from "../ui/input";
import { GameAccountsList } from './GameAccountsList.tsx';
import { Button } from "src/components/ui/button";
import { GameAccount } from 'src/types/profile.types';

interface ProfileFormProps {
  username: string;
  gameAccounts: GameAccount[];
  isEditing: boolean;
  isUsernameValid: boolean;
  onUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGameAccountsChange: (accounts: GameAccount[]) => void;
}

const ProfileForm = ({ 
  username, 
  gameAccounts,
  isEditing,
  isUsernameValid,
  onUsernameChange,
  onGameAccountsChange
}: ProfileFormProps) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm text-gray-400">Username</label>
        {isEditing ? (
          <div>
            <Input
              value={username}
              onChange={onUsernameChange}
              placeholder="Enter your username"
              className={!isUsernameValid ? 'border-red-500' : ''}
            />
            {!isUsernameValid && (
              <p className="text-red-500 text-sm mt-1">Username already taken</p>
            )}
          </div>
        ) : (
          <p className="text-white">{username}</p>
        )}
      </div>

      <div>
        <label className="text-sm text-gray-400">Connected Games</label>
        <GameAccountsList
          accounts={gameAccounts}
          isEditing={isEditing}
          onChange={onGameAccountsChange}
        />
      </div>
    </div>
  );
};

export default ProfileForm;
