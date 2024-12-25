import React from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import * as SelectPrimitive from "@radix-ui/react-select"
import { GameAccount } from 'src/types/profile.types';

const GAME_OPTIONS = ['PES', 'COD', 'Valorant', 'PUBG'];

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
        <div key={index} className="flex gap-4 items-start">
          {isEditing ? (
            <>
              <Select
                value={account.gameName}
                onValueChange={(value) => updateAccount(index, 'gameName', value)}
              >
                <SelectPrimitive.Trigger>
                  {account.gameName || "Select Game"}
                </SelectPrimitive.Trigger>
                <SelectPrimitive.Content>
                  {GAME_OPTIONS.map((option) => (
                    <SelectPrimitive.Item key={option} value={option}>
                      {option}
                    </SelectPrimitive.Item>
                  ))}
                </SelectPrimitive.Content>
              </Select>
              <Input
                value={account.gameId}
                onChange={(e) => updateAccount(index, 'gameId', e.target.value)}
                placeholder="Game ID"
              />
              <Input
                value={account.inGameName}
                onChange={(e) => updateAccount(index, 'inGameName', e.target.value)}
                placeholder="In-Game Name"
              />
              <Button variant="destructive" onClick={() => removeAccount(index)}>
                Remove
              </Button>
            </>
          ) : (
            <div className="flex gap-4">
              <p className="text-white">{account.gameName}</p>
              <p className="text-gray-400">ID: {account.gameId}</p>
              <p className="text-gray-400">Name: {account.inGameName}</p>
            </div>
          )}
        </div>
      ))}
      {isEditing && (
        <Button onClick={addAccount} variant="outline">
          Add Game Account
        </Button>
      )}
    </div>
  );
};
