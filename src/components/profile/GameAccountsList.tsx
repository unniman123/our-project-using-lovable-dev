import React from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { GameAccount } from 'src/types/profile.types';
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

const GAME_OPTIONS = [
  { value: 'PES', label: 'Pro Evolution Soccer' },
  { value: 'COD', label: 'Call of Duty' },
  { value: 'Valorant', label: 'Valorant' },
  { value: 'PUBG', label: 'PlayerUnknown\'s Battlegrounds' }
];

interface GameAccountsListProps {
  accounts: GameAccount[];
  isEditing: boolean;
  onChange: (accounts: GameAccount[]) => void;
}

export const GameAccountsList = ({ accounts, isEditing, onChange }: GameAccountsListProps) => {
  const addAccount = () => {
    onChange([...accounts, { gameName: '', gameId: '', inGameName: '' }]);
  };

  const removeAccount = (index: number) => {
    onChange(accounts.filter((_, i) => i !== index));
  };

  const updateAccount = (index: number, field: keyof GameAccount, value: string) => {
    const newAccounts = accounts.map((account, i) => 
      i === index ? { ...account, [field]: value } : account
    );
    onChange(newAccounts);
  };

  return (
    <div className="space-y-4">
      {accounts.map((account, index) => (
        <Card key={index} className="bg-gaming-dark/30 border-gaming-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              {isEditing ? (
                <Select
                  value={account.gameName}
                  onValueChange={(value) => updateAccount(index, 'gameName', value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a game" />
                  </SelectTrigger>
                  <SelectContent>
                    {GAME_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{account.gameName}</Badge>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isEditing ? (
              <>
                <Input
                  value={account.gameId}
                  onChange={(e) => updateAccount(index, 'gameId', e.target.value)}
                  placeholder="Game ID"
                  className="bg-gaming-dark/50"
                />
                <Input
                  value={account.inGameName}
                  onChange={(e) => updateAccount(index, 'inGameName', e.target.value)}
                  placeholder="In-Game Name"
                  className="bg-gaming-dark/50"
                />
                <Button 
                  variant="destructive" 
                  onClick={() => removeAccount(index)}
                  className="w-full"
                >
                  Remove Account
                </Button>
              </>
            ) : (
              <div className="space-y-1">
                <div className="text-sm text-gray-400">Game ID: {account.gameId}</div>
                <div className="text-sm text-gray-400">In-Game Name: {account.inGameName}</div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      {isEditing && (
        <Button 
          onClick={addAccount} 
          variant="outline"
          className="w-full bg-gaming-dark/50 border-gaming-accent/20 hover:bg-gaming-dark/70"
        >
          Add Game Account
        </Button>
      )}
    </div>
  );
};
